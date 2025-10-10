import { logError, logWarn } from "@repo/observability/server/next";
import { experimental_createMCPClient } from "ai";
import {
  DEFAULT_RETRY_CONFIG,
  MCPClient,
  MCPClientConfig,
  MCPConnectionError,
  createTransportFromConfig,
  globalMCPHealthMonitor,
  withRetryAndTimeout,
} from "./client";
import { globalMCPToolCache } from "./tool-cache";

/**
 * Configuration for MCP connection pool
 */
export interface MCPConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  retryConfig?: typeof DEFAULT_RETRY_CONFIG;
  healthCheckEnabled: boolean;
}

/**
 * Default connection pool configuration
 */
export const DEFAULT_POOL_CONFIG: MCPConnectionPoolConfig = {
  maxConnections: 10,
  minConnections: 2,
  idleTimeoutMs: 300000, // 5 minutes
  connectionTimeoutMs: 30000, // 30 seconds
  healthCheckEnabled: true,
};

/**
 * Connection wrapper with metadata
 */
interface PooledConnection {
  client: MCPClient;
  config: MCPClientConfig;
  createdAt: Date;
  lastUsed: Date;
  inUse: boolean;
  id: string;
}

/**
 * MCP Connection Pool
 * Manages a pool of reusable MCP client connections for better performance
 */
export class MCPConnectionPool {
  private connections = new Map<string, PooledConnection[]>();
  private poolConfig: MCPConnectionPoolConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<MCPConnectionPoolConfig> = {}) {
    this.poolConfig = { ...DEFAULT_POOL_CONFIG, ...config };
    this.startCleanupTask();
  }

  /**
   * Get a connection from the pool or create a new one
   */
  async getConnection(config: MCPClientConfig): Promise<PooledConnection> {
    const poolKey = this.getPoolKey(config);
    let pool = this.connections.get(poolKey);

    if (!pool) {
      pool = [];
      this.connections.set(poolKey, pool);
    }

    // Try to find an available connection
    const availableConnection = pool.find((conn) => !conn.inUse);
    if (availableConnection) {
      availableConnection.inUse = true;
      availableConnection.lastUsed = new Date();
      return availableConnection;
    }

    // Check if we can create a new connection
    if (pool.length >= this.poolConfig.maxConnections) {
      // Wait for a connection to become available
      return this.waitForAvailableConnection(poolKey);
    }

    // Create a new connection
    return this.createConnection(config, poolKey);
  }

  /**
   * Return a connection to the pool
   */
  releaseConnection(connection: PooledConnection): void {
    connection.inUse = false;
    connection.lastUsed = new Date();
  }

  /**
   * Get tools from a pooled connection with caching
   */
  async getTools(config: MCPClientConfig): Promise<Record<string, any>> {
    // Try cache first
    const cachedTools = globalMCPToolCache.get(config);
    if (cachedTools) {
      return cachedTools;
    }

    // Check health status
    if (
      this.poolConfig.healthCheckEnabled &&
      globalMCPHealthMonitor.shouldExclude(config.name)
    ) {
      if (config.gracefulDegradation) {
        logWarn(`Skipping unhealthy MCP client '${config.name}' in pool`, {
          operation: "mcp_pool_skip_unhealthy",
          metadata: {
            clientName: config.name,
            healthStatus: globalMCPHealthMonitor.getHealthStatus(config.name),
          },
        });
        return {};
      } else {
        throw new MCPConnectionError(
          `MCP client '${config.name}' is marked as unhealthy`,
          config.name,
          config.transport.type,
        );
      }
    }

    let connection: PooledConnection | null = null;
    try {
      connection = await this.getConnection(config);

      const tools = await withRetryAndTimeout(
        () => {
          if (!connection) throw new Error("Connection is null");
          return connection.client.tools();
        },
        config.retry || DEFAULT_RETRY_CONFIG,
        config.timeoutMs || this.poolConfig.connectionTimeoutMs,
        `MCP pooled tools retrieval (${config.name})`,
      );

      // Cache the tools
      globalMCPToolCache.set(config, tools);

      return tools;
    } catch (error) {
      // If connection failed, remove it from pool
      if (connection) {
        await this.removeConnection(connection);
      }

      const mcpError = new MCPConnectionError(
        `Failed to get tools from pooled MCP client '${config.name}'`,
        config.name,
        config.transport.type,
        error instanceof Error ? error : new Error(String(error)),
      );

      if (config.gracefulDegradation) {
        logWarn(
          `Pooled MCP client '${config.name}' failed, continuing with degraded functionality`,
          {
            operation: "mcp_pool_degraded",
            metadata: {
              clientName: config.name,
              transportType: config.transport.type,
              error: mcpError.message,
            },
          },
        );
        return {};
      }

      throw mcpError;
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }

  /**
   * Create a new pooled connection
   */
  private async createConnection(
    config: MCPClientConfig,
    poolKey: string,
  ): Promise<PooledConnection> {
    const connectionId = `${config.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const client = await withRetryAndTimeout(
        async () => {
          const transport = createTransportFromConfig(config.transport);
          return (await experimental_createMCPClient({ transport })) as any;
        },
        config.retry || DEFAULT_RETRY_CONFIG,
        config.timeoutMs || this.poolConfig.connectionTimeoutMs,
        `MCP pool connection creation (${config.name})`,
      );

      const connection: PooledConnection = {
        client,
        config,
        createdAt: new Date(),
        lastUsed: new Date(),
        inUse: true,
        id: connectionId,
      };

      const pool = this.connections.get(poolKey);
      if (!pool) throw new Error(`Pool not found for key: ${poolKey}`);
      pool.push(connection);

      // Start health monitoring if enabled
      if (this.poolConfig.healthCheckEnabled) {
        globalMCPHealthMonitor.startMonitoring(config);
      }

      return connection;
    } catch (error) {
      throw new MCPConnectionError(
        `Failed to create pooled MCP client '${config.name}'`,
        config.name,
        config.transport.type,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Wait for an available connection
   */
  private async waitForAvailableConnection(
    poolKey: string,
  ): Promise<PooledConnection> {
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 100; // 100ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const pool = this.connections.get(poolKey);
      if (pool) {
        const availableConnection = pool.find((conn) => !conn.inUse);
        if (availableConnection) {
          availableConnection.inUse = true;
          availableConnection.lastUsed = new Date();
          return availableConnection;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    throw new Error(
      `Timeout waiting for available MCP connection (pool: ${poolKey})`,
    );
  }

  /**
   * Remove a connection from the pool
   */
  private async removeConnection(connection: PooledConnection): Promise<void> {
    const poolKey = this.getPoolKey(connection.config);
    const pool = this.connections.get(poolKey);

    if (pool) {
      const index = pool.findIndex((conn) => conn.id === connection.id);
      if (index >= 0) {
        pool.splice(index, 1);

        try {
          await connection.client.close();
        } catch (error) {
          logWarn(
            `Failed to close removed pooled connection ${connection.id}`,
            {
              operation: "mcp_pool_connection_close_failed",
              metadata: {
                connectionId: connection.id,
                clientName: connection.config.name,
                error: error instanceof Error ? error.message : String(error),
              },
            },
          );
        }
      }
    }
  }

  /**
   * Generate a pool key for a client configuration
   */
  private getPoolKey(config: MCPClientConfig): string {
    return `${config.transport.type}:${JSON.stringify(config.transport)}`;
  }

  /**
   * Start periodic cleanup of idle connections
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 60000); // Run every minute
  }

  /**
   * Clean up idle connections
   */
  private async cleanupIdleConnections(): Promise<void> {
    const now = new Date();
    const idleThreshold = new Date(
      now.getTime() - this.poolConfig.idleTimeoutMs,
    );

    for (const [poolKey, pool] of this.connections.entries()) {
      const connectionsToRemove: PooledConnection[] = [];

      // Find idle connections to remove
      for (const connection of pool) {
        if (!connection.inUse && connection.lastUsed < idleThreshold) {
          // Keep minimum connections
          const remainingConnections = pool.length - connectionsToRemove.length;
          if (remainingConnections > this.poolConfig.minConnections) {
            connectionsToRemove.push(connection);
          }
        }
      }

      // Remove idle connections
      for (const connection of connectionsToRemove) {
        await this.removeConnection(connection);
      }

      // Remove empty pools
      if (pool.length === 0) {
        this.connections.delete(poolKey);
      }
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): Record<
    string,
    { total: number; inUse: number; idle: number }
  > {
    const stats: Record<
      string,
      { total: number; inUse: number; idle: number }
    > = {};

    for (const [poolKey, pool] of this.connections.entries()) {
      const inUse = pool.filter((conn) => conn.inUse).length;
      const idle = pool.filter((conn) => !conn.inUse).length;

      stats[poolKey] = {
        total: pool.length,
        inUse,
        idle,
      };
    }

    return stats;
  }

  /**
   * Cleanup all connections and stop background tasks
   */
  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Close all connections
    const closePromises: Promise<void>[] = [];

    for (const pool of this.connections.values()) {
      for (const connection of pool) {
        closePromises.push(
          (async () => {
            try {
              await connection.client.close();
            } catch (error) {
              logError(`Failed to close pooled connection ${connection.id}`, {
                operation: "mcp_pool_cleanup_failed",
                metadata: {
                  connectionId: connection.id,
                  clientName: connection.config.name,
                },
                error:
                  error instanceof Error ? error : new Error(String(error)),
              });
            }
          })(),
        );
      }
    }

    await Promise.all(closePromises);
    this.connections.clear();
  }
}

/**
 * Global MCP connection pool instance
 */
export const globalMCPConnectionPool = new MCPConnectionPool();
