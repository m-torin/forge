import { logWarn } from '@repo/observability/server/next';
import { experimental_createMCPClient } from 'ai';
import type { MCPClient, MCPClientConfig } from './client';
import { createTransportFromConfig } from './client';
// Use AI SDK tool types instead of MCP SDK types

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  maxConnections: number;
  connectionTimeout: number;
  healthCheckInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Connection metadata for monitoring
 */
export interface ConnectionMetadata {
  config: MCPClientConfig;
  client: MCPClient;
  tools: Record<string, any>;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  isHealthy: boolean;
  lastHealthCheck: Date;
}

/**
 * Connection pool events
 */
export interface ConnectionPoolEvents {
  created: (config: MCPClientConfig) => void;
  destroyed: (config: MCPClientConfig) => void;
  error: (config: MCPClientConfig, error: Error) => void;
  healthCheck: (config: MCPClientConfig, healthy: boolean) => void;
}

/**
 * Enhanced MCP connection manager with pooling and monitoring
 * Provides connection reuse, health checking, and monitoring for production use
 */
export class MCPConnectionManager {
  private connections = new Map<string, ConnectionMetadata>();
  private config: ConnectionPoolConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private events: Partial<ConnectionPoolEvents> = {};

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      healthCheckInterval: 60000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    // Start health checking
    this.startHealthChecking();
  }

  /**
   * Register event listeners
   */
  on<K extends keyof ConnectionPoolEvents>(event: K, listener: ConnectionPoolEvents[K]): void {
    this.events[event] = listener;
  }

  /**
   * Get or create a connection for the given config
   */
  async getConnection(config: MCPClientConfig): Promise<ConnectionMetadata> {
    const key = this.getConnectionKey(config);
    let connection = this.connections.get(key);

    if (connection) {
      // Update usage statistics
      connection.lastUsed = new Date();
      connection.useCount += 1;
      return connection;
    }

    // Check connection limits
    if (this.connections.size >= this.config.maxConnections) {
      // Remove oldest unused connection
      await this.evictOldestConnection();
    }

    // Create new connection
    connection = await this.createConnection(config);
    this.connections.set(key, connection);
    this.events.created?.(config);

    return connection;
  }

  /**
   * Get all tools from active connections
   */
  async getAllTools(): Promise<Record<string, any>> {
    const allTools: Record<string, any> = {};

    for (const connection of this.connections.values()) {
      if (connection.isHealthy) {
        Object.assign(allTools, connection.tools);
      }
    }

    return allTools;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    healthyConnections: number;
    totalUseCount: number;
    oldestConnection?: Date;
    newestConnection?: Date;
  } {
    const connections = Array.from(this.connections.values());
    const healthyConnections = connections.filter(c => c.isHealthy);
    const totalUseCount = connections.reduce((sum, c) => sum + c.useCount, 0);

    const createdDates = connections.map(c => c.createdAt);
    const oldestConnection =
      createdDates.length > 0
        ? new Date(Math.min(...createdDates.map(d => d.getTime())))
        : undefined;
    const newestConnection =
      createdDates.length > 0
        ? new Date(Math.max(...createdDates.map(d => d.getTime())))
        : undefined;

    return {
      totalConnections: connections.length,
      healthyConnections: healthyConnections.length,
      totalUseCount,
      oldestConnection,
      newestConnection,
    };
  }

  /**
   * Close specific connection
   */
  async closeConnection(config: MCPClientConfig): Promise<void> {
    const key = this.getConnectionKey(config);
    const connection = this.connections.get(key);

    if (connection) {
      try {
        await connection.client.close();
      } catch (error) {
        logWarn(`Failed to close MCP connection ${config.name}`, {
          connectionName: config.name,
          error: error instanceof Error ? error.message : String(error),
          operation: 'mcp_close_connection',
        });
      }

      this.connections.delete(key);
      this.events.destroyed?.(config);
    }
  }

  /**
   * Close all connections and cleanup
   */
  async closeAll(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    const closePromises = Array.from(this.connections.values()).map(async connection => {
      try {
        await connection.client.close();
      } catch (error) {
        logWarn(`Failed to close MCP connection ${connection.config.name}`, {
          connectionName: connection.config.name,
          error: error instanceof Error ? error.message : String(error),
          operation: 'mcp_close_all_connections',
        });
      }
    });

    await Promise.all(closePromises);
    this.connections.clear();
  }

  /**
   * Perform health check on all connections
   */
  async performHealthCheck(): Promise<void> {
    const healthCheckPromises = Array.from(this.connections.values()).map(async connection => {
      try {
        // Simple health check: try to get tools
        await connection.client.tools();
        connection.isHealthy = true;
        connection.lastHealthCheck = new Date();
        this.events.healthCheck?.(connection.config, true);
      } catch (error) {
        connection.isHealthy = false;
        connection.lastHealthCheck = new Date();
        this.events.healthCheck?.(connection.config, false);
        this.events.error?.(
          connection.config,
          error instanceof Error ? error : new Error(String(error)),
        );

        // Remove unhealthy connections
        const key = this.getConnectionKey(connection.config);
        this.connections.delete(key);

        try {
          await connection.client.close();
        } catch (closeError) {
          logWarn(`Failed to close unhealthy connection ${connection.config.name}`, {
            connectionName: connection.config.name,
            error: closeError instanceof Error ? closeError.message : String(closeError),
            operation: 'mcp_close_unhealthy_connection',
          });
        }
      }
    });

    await Promise.all(healthCheckPromises);
  }

  private getConnectionKey(config: MCPClientConfig): string {
    return `${config.name}-${config.transport.type}-${JSON.stringify(config.transport)}`;
  }

  private async createConnection(config: MCPClientConfig): Promise<ConnectionMetadata> {
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < this.config.retryAttempts) {
      try {
        const transport = createTransportFromConfig(config.transport);
        const client = (await experimental_createMCPClient({ transport })) as MCPClient;
        const tools = await client.tools();

        return {
          config,
          client,
          tools,
          createdAt: new Date(),
          lastUsed: new Date(),
          useCount: 1,
          isHealthy: true,
          lastHealthCheck: new Date(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    throw lastError || new Error('All connection attempts failed');
  }

  private async evictOldestConnection(): Promise<void> {
    let oldestConnection: { key: string; connection: ConnectionMetadata } | null = null;

    for (const [key, connection] of this.connections.entries()) {
      if (!oldestConnection || connection.lastUsed < oldestConnection.connection.lastUsed) {
        oldestConnection = { key, connection };
      }
    }

    if (oldestConnection) {
      await this.closeConnection(oldestConnection.connection.config);
    }
  }

  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logWarn('Health check failed', {
          error: error instanceof Error ? error.message : String(error),
          operation: 'mcp_health_check',
        });
      }
    }, this.config.healthCheckInterval);
  }
}

/**
 * Global connection manager instance
 * Provides a singleton for connection pooling across the application
 */
let globalConnectionManager: MCPConnectionManager | null = null;

export function getGlobalConnectionManager(
  config?: Partial<ConnectionPoolConfig>,
): MCPConnectionManager {
  if (!globalConnectionManager) {
    globalConnectionManager = new MCPConnectionManager(config);
  }
  return globalConnectionManager;
}

/**
 * Create MCP tools with connection pooling
 * This provides better performance and resource management for production use
 */
export async function createPooledMCPTools(
  configs: MCPClientConfig[],
  options: {
    useGlobalPool?: boolean;
    poolConfig?: Partial<ConnectionPoolConfig>;
  } = {},
): Promise<{
  tools: Record<string, any>;
  manager: MCPConnectionManager;
}> {
  const manager = options.useGlobalPool
    ? getGlobalConnectionManager(options.poolConfig)
    : new MCPConnectionManager(options.poolConfig);

  const tools: Record<string, any> = {};

  // Get connections for all configs
  for (const config of configs) {
    try {
      const connection = await manager.getConnection(config);
      Object.assign(tools, connection.tools);
    } catch (error) {
      logWarn(`Failed to get connection for ${config.name}`, {
        connectionName: config.name,
        error: error instanceof Error ? error.message : String(error),
        operation: 'mcp_get_connection',
      });
    }
  }

  return { tools, manager };
}
