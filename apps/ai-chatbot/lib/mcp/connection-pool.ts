/**
 * MCP Connection Pool Manager
 * Production-grade connection management with health monitoring and failover
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { EventEmitter } from 'events';
import type { FeatureFlagContext } from '../feature-flags/config';
import { mcpAnalytics } from './analytics';
import type { McpConnectionProfile } from './config-manager';

/**
 * Connection state definitions
 */
export type McpConnectionState =
  | 'initializing'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'degraded'
  | 'closing'
  | 'closed';

/**
 * Connection health metrics
 */
export interface McpConnectionHealth {
  lastHealthCheck: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  averageResponseTime: number;
  recentResponseTimes: number[];
  totalRequests: number;
  failedRequests: number;
  lastError?: Error;
  uptime: number;
  connectionStartTime: number;
}

/**
 * Managed MCP Connection
 */
export interface McpManagedConnection {
  id: string;
  profile: McpConnectionProfile;
  state: McpConnectionState;
  health: McpConnectionHealth;
  client: any; // MCP client instance
  lastUsed: number;
  retryCount: number;
  priority: number; // Higher values = higher priority
  capabilities: string[];
  metadata: {
    userId?: string;
    sessionId?: string;
    version: string;
    features: Record<string, boolean>;
  };
}

/**
 * Connection pool configuration
 */
export interface McpConnectionPoolConfig {
  maxConnections: number;
  maxConnectionsPerProfile: number;
  connectionTimeout: number;
  healthCheckInterval: number;
  maxRetryAttempts: number;
  retryBackoffMultiplier: number;
  idleTimeout: number;
  degradedThreshold: number; // Failure rate threshold
  enableLoadBalancing: boolean;
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'random' | 'priority';
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

/**
 * Default connection pool configuration
 */
const DEFAULT_POOL_CONFIG: McpConnectionPoolConfig = {
  maxConnections: 10,
  maxConnectionsPerProfile: 3,
  connectionTimeout: 30000, // 30 seconds
  healthCheckInterval: 60000, // 1 minute
  maxRetryAttempts: 3,
  retryBackoffMultiplier: 2,
  idleTimeout: 300000, // 5 minutes
  degradedThreshold: 0.3, // 30% failure rate
  enableLoadBalancing: true,
  loadBalancingStrategy: 'least-connections',
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000, // 1 minute
};

/**
 * Connection pool events
 */
export interface McpConnectionPoolEvents {
  'connection-established': (connection: McpManagedConnection) => void;
  'connection-failed': (profileId: string, error: Error) => void;
  'connection-closed': (connectionId: string, reason: string) => void;
  'connection-degraded': (connectionId: string, health: McpConnectionHealth) => void;
  'connection-recovered': (connectionId: string) => void;
  'pool-exhausted': (profileId: string) => void;
  'health-check-failed': (connectionId: string, error: Error) => void;
  'circuit-breaker-opened': (profileId: string) => void;
  'circuit-breaker-closed': (profileId: string) => void;
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

/**
 * MCP Connection Pool Manager
 */
export class McpConnectionPool extends EventEmitter {
  private connections = new Map<string, McpManagedConnection>();
  private connectionsByProfile = new Map<string, Set<string>>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private loadBalancingIndex = new Map<string, number>();

  constructor(private config: McpConnectionPoolConfig = DEFAULT_POOL_CONFIG) {
    super();
    this.startHealthChecking();
  }

  /**
   * Get or create a connection for a profile
   */
  async getConnection(
    profile: McpConnectionProfile,
    context: FeatureFlagContext = {},
  ): Promise<McpManagedConnection | null> {
    const profileId = profile.id;

    // Check circuit breaker
    if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen(profileId)) {
      logWarn('MCP Connection Pool: Circuit breaker is open', {
        operation: 'connection_pool_circuit_breaker_open',
        metadata: { profileId },
      });
      return null;
    }

    // Try to get an existing healthy connection
    const existingConnection = this.getHealthyConnection(profileId);
    if (existingConnection) {
      existingConnection.lastUsed = Date.now();
      mcpAnalytics.trackConnection({
        success: true,
        connectionId: existingConnection.id,
        clientType: 'enhanced', // Determined by context
        userId: context.user?.id,
      });
      return existingConnection;
    }

    // Check if we can create a new connection
    if (!this.canCreateConnection(profileId)) {
      this.emit('pool-exhausted', profileId);
      logWarn('MCP Connection Pool: Pool exhausted', {
        operation: 'connection_pool_exhausted',
        metadata: {
          profileId,
          totalConnections: this.connections.size,
          profileConnections: this.connectionsByProfile.get(profileId)?.size || 0,
          maxConnections: this.config.maxConnections,
          maxConnectionsPerProfile: this.config.maxConnectionsPerProfile,
        },
      });
      return null;
    }

    // Create new connection
    return this.createConnection(profile, context);
  }

  /**
   * Create a new connection
   */
  private async createConnection(
    profile: McpConnectionProfile,
    context: FeatureFlagContext = {},
  ): Promise<McpManagedConnection | null> {
    const connectionId = `${profile.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      logInfo('MCP Connection Pool: Creating new connection', {
        operation: 'connection_pool_create_start',
        metadata: {
          connectionId,
          profileId: profile.id,
          serverType: profile.serverType,
        },
      });

      // Create MCP client instance (this would use the actual @repo/ai MCP functionality)
      const client = await this.createMcpClient(profile, context);

      const connection: McpManagedConnection = {
        id: connectionId,
        profile,
        state: 'connected',
        client,
        lastUsed: Date.now(),
        retryCount: 0,
        priority: this.calculateConnectionPriority(profile),
        capabilities: profile.capabilities || [],
        health: {
          lastHealthCheck: Date.now(),
          consecutiveFailures: 0,
          consecutiveSuccesses: 1,
          averageResponseTime: 0,
          recentResponseTimes: [],
          totalRequests: 0,
          failedRequests: 0,
          uptime: 0,
          connectionStartTime: Date.now(),
        },
        metadata: {
          userId: context.user?.id,
          sessionId: context.sessionId,
          version: '1.0.0',
          features: {}, // Would be populated based on feature flags
        },
      };

      // Add to collections
      this.connections.set(connectionId, connection);
      if (!this.connectionsByProfile.has(profile.id)) {
        this.connectionsByProfile.set(profile.id, new Set());
      }
      this.connectionsByProfile.get(profile.id)?.add(connectionId);

      // Reset circuit breaker on successful connection
      if (this.circuitBreakers.has(profile.id)) {
        this.closeCircuitBreaker(profile.id);
      }

      const executionTime = Date.now() - startTime;

      mcpAnalytics.trackConnection({
        success: true,
        connectionId,
        clientType: 'enhanced',
        userId: context.user?.id,
        executionTime,
      });

      this.emit('connection-established', connection);

      logInfo('MCP Connection Pool: Connection established successfully', {
        operation: 'connection_pool_create_success',
        metadata: {
          connectionId,
          profileId: profile.id,
          executionTime,
          totalConnections: this.connections.size,
        },
      });

      return connection;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const connectionError = error instanceof Error ? error : new Error(String(error));

      mcpAnalytics.trackConnection({
        success: false,
        connectionId,
        clientType: 'enhanced',
        userId: context.user?.id,
        error: connectionError,
        executionTime,
      });

      // Update circuit breaker
      this.recordCircuitBreakerFailure(profile.id);

      this.emit('connection-failed', profile.id, connectionError);

      logError('MCP Connection Pool: Failed to create connection', {
        operation: 'connection_pool_create_failed',
        metadata: {
          connectionId,
          profileId: profile.id,
          executionTime,
          serverType: profile.serverType,
        },
        error: connectionError,
      });

      return null;
    }
  }

  /**
   * Get a healthy connection using load balancing
   */
  private getHealthyConnection(profileId: string): McpManagedConnection | null {
    const profileConnections = this.connectionsByProfile.get(profileId);
    if (!profileConnections || profileConnections.size === 0) {
      return null;
    }

    const healthyConnections = Array.from(profileConnections)
      .map(id => this.connections.get(id))
      .filter(
        (conn): conn is McpManagedConnection =>
          conn != null &&
          conn.state === 'connected' &&
          conn.health.consecutiveFailures < this.config.circuitBreakerThreshold,
      );

    if (healthyConnections.length === 0) {
      return null;
    }

    return this.selectConnectionByLoadBalancing(healthyConnections, profileId);
  }

  /**
   * Select connection based on load balancing strategy
   */
  private selectConnectionByLoadBalancing(
    connections: McpManagedConnection[],
    profileId: string,
  ): McpManagedConnection {
    if (!this.config.enableLoadBalancing || connections.length === 1) {
      return connections[0];
    }

    switch (this.config.loadBalancingStrategy) {
      case 'round-robin':
        const index = (this.loadBalancingIndex.get(profileId) || 0) % connections.length;
        this.loadBalancingIndex.set(profileId, index + 1);
        return connections[index];

      case 'least-connections':
        return connections.reduce((least, current) =>
          current.health.totalRequests < least.health.totalRequests ? current : least,
        );

      case 'priority':
        return connections.reduce((highest, current) =>
          current.priority > highest.priority ? current : highest,
        );

      case 'random':
      default:
        return connections[Math.floor(Math.random() * connections.length)];
    }
  }

  /**
   * Close a connection
   */
  async closeConnection(connectionId: string, reason = 'Manual close'): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.state = 'closing';

    try {
      // Close the MCP client
      if (connection.client && typeof connection.client.close === 'function') {
        await connection.client.close();
      }
    } catch (error) {
      logWarn('MCP Connection Pool: Error closing client', {
        operation: 'connection_pool_close_error',
        metadata: { connectionId, reason },
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    // Update state and remove from collections
    connection.state = 'closed';
    this.connections.delete(connectionId);

    const profileConnections = this.connectionsByProfile.get(connection.profile.id);
    if (profileConnections) {
      profileConnections.delete(connectionId);
      if (profileConnections.size === 0) {
        this.connectionsByProfile.delete(connection.profile.id);
      }
    }

    this.emit('connection-closed', connectionId, reason);

    logInfo('MCP Connection Pool: Connection closed', {
      operation: 'connection_pool_close',
      metadata: {
        connectionId,
        profileId: connection.profile.id,
        reason,
        uptime: Date.now() - connection.health.connectionStartTime,
        totalRequests: connection.health.totalRequests,
        failedRequests: connection.health.failedRequests,
      },
    });
  }

  /**
   * Perform health check on all connections
   */
  private async performHealthChecks(): Promise<void> {
    const connections = Array.from(this.connections.values());
    const healthCheckPromises = connections.map(conn => this.performHealthCheck(conn));

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Perform health check on a single connection
   */
  private async performHealthCheck(connection: McpManagedConnection): Promise<void> {
    if (connection.state !== 'connected') {
      return;
    }

    const startTime = Date.now();

    try {
      // Perform actual health check (ping or simple operation)
      await this.pingConnection(connection);

      const responseTime = Date.now() - startTime;

      // Update health metrics
      connection.health.lastHealthCheck = Date.now();
      connection.health.consecutiveFailures = 0;
      connection.health.consecutiveSuccesses++;
      connection.health.recentResponseTimes.push(responseTime);

      // Keep only last 10 response times
      if (connection.health.recentResponseTimes.length > 10) {
        connection.health.recentResponseTimes = connection.health.recentResponseTimes.slice(-10);
      }

      // Calculate average response time
      connection.health.averageResponseTime =
        connection.health.recentResponseTimes.reduce((sum, time) => sum + time, 0) /
        connection.health.recentResponseTimes.length;

      // Update uptime
      connection.health.uptime = Date.now() - connection.health.connectionStartTime;

      // Check if connection recovered from degraded state
      if ((connection.state as McpConnectionState) === 'degraded') {
        connection.state = 'connected';
        this.emit('connection-recovered', connection.id);

        logInfo('MCP Connection Pool: Connection recovered', {
          operation: 'connection_pool_recovery',
          metadata: {
            connectionId: connection.id,
            profileId: connection.profile.id,
            responseTime,
            consecutiveSuccesses: connection.health.consecutiveSuccesses,
          },
        });
      }
    } catch (error) {
      connection.health.lastHealthCheck = Date.now();
      connection.health.consecutiveFailures++;
      connection.health.consecutiveSuccesses = 0;
      connection.health.lastError = error instanceof Error ? error : new Error(String(error));

      // Check if connection should be marked as degraded
      const failureRate =
        connection.health.failedRequests / Math.max(connection.health.totalRequests, 1);
      if (failureRate > this.config.degradedThreshold) {
        connection.state = 'degraded';
        this.emit('connection-degraded', connection.id, connection.health);
      }

      // Record circuit breaker failure
      this.recordCircuitBreakerFailure(connection.profile.id);

      this.emit('health-check-failed', connection.id, connection.health.lastError);

      logWarn('MCP Connection Pool: Health check failed', {
        operation: 'connection_pool_health_check_failed',
        metadata: {
          connectionId: connection.id,
          profileId: connection.profile.id,
          consecutiveFailures: connection.health.consecutiveFailures,
          failureRate,
        },
        error: connection.health.lastError,
      });

      // Close connection if too many consecutive failures
      if (connection.health.consecutiveFailures >= this.config.maxRetryAttempts) {
        await this.closeConnection(connection.id, 'Too many health check failures');
      }
    }
  }

  /**
   * Start health checking timer
   */
  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
      this.cleanupIdleConnections();
    }, this.config.healthCheckInterval);
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const connectionsToClose: string[] = [];

    for (const [id, connection] of this.connections) {
      if (now - connection.lastUsed > this.config.idleTimeout) {
        connectionsToClose.push(id);
      }
    }

    connectionsToClose.forEach(id => {
      this.closeConnection(id, 'Idle timeout');
    });
  }

  /**
   * Circuit breaker management
   */
  private isCircuitBreakerOpen(profileId: string): boolean {
    const breaker = this.circuitBreakers.get(profileId);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      if (Date.now() > breaker.nextAttemptTime) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }

  private recordCircuitBreakerFailure(profileId: string): void {
    if (!this.config.enableCircuitBreaker) return;

    let breaker = this.circuitBreakers.get(profileId);
    if (!breaker) {
      breaker = {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };
      this.circuitBreakers.set(profileId, breaker);
    }

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open';
      breaker.nextAttemptTime = Date.now() + this.config.circuitBreakerTimeout;
      this.emit('circuit-breaker-opened', profileId);

      logWarn('MCP Connection Pool: Circuit breaker opened', {
        operation: 'connection_pool_circuit_breaker_opened',
        metadata: {
          profileId,
          failureCount: breaker.failureCount,
          threshold: this.config.circuitBreakerThreshold,
          timeoutDuration: this.config.circuitBreakerTimeout,
        },
      });
    }
  }

  private closeCircuitBreaker(profileId: string): void {
    const breaker = this.circuitBreakers.get(profileId);
    if (breaker && breaker.state !== 'closed') {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      this.emit('circuit-breaker-closed', profileId);

      logInfo('MCP Connection Pool: Circuit breaker closed', {
        operation: 'connection_pool_circuit_breaker_closed',
        metadata: { profileId },
      });
    }
  }

  /**
   * Helper methods
   */
  private canCreateConnection(profileId: string): boolean {
    const totalConnections = this.connections.size;
    const profileConnections = this.connectionsByProfile.get(profileId)?.size || 0;

    return (
      totalConnections < this.config.maxConnections &&
      profileConnections < this.config.maxConnectionsPerProfile
    );
  }

  private calculateConnectionPriority(profile: McpConnectionProfile): number {
    // Priority based on profile metadata or server type
    const basePriority =
      profile.metadata?.priority === 'high'
        ? 100
        : profile.metadata?.priority === 'medium'
          ? 50
          : 10;

    // Boost priority for certain server types
    const serverTypeBoost = profile.serverType === 'perplexity' ? 20 : 0;

    return basePriority + serverTypeBoost;
  }

  /**
   * Create MCP client - placeholder for actual implementation
   */
  private async createMcpClient(
    profile: McpConnectionProfile,
    _context: FeatureFlagContext,
  ): Promise<any> {
    // This would actually create an MCP client using @repo/ai functionality
    // For now, return a mock client
    return {
      id: `client-${profile.id}`,
      profile,
      connected: true,
      close: async () => {
        /* close implementation */
      },
      ping: async () => Promise.resolve({ success: true, timestamp: Date.now() }),
    };
  }

  /**
   * Ping connection for health check
   */
  private async pingConnection(connection: McpManagedConnection): Promise<void> {
    if (connection.client && typeof connection.client.ping === 'function') {
      await connection.client.ping();
    }
    // If no ping method, assume connection is healthy if client exists
  }

  /**
   * Get pool statistics
   */
  getPoolStatistics(): {
    totalConnections: number;
    connectionsByProfile: Record<string, number>;
    connectionsByState: Record<McpConnectionState, number>;
    circuitBreakerStates: Record<string, string>;
    averageConnectionUptime: number;
    totalRequests: number;
    failureRate: number;
  } {
    const connections = Array.from(this.connections.values());

    const connectionsByProfile: Record<string, number> = {};
    for (const [profileId, connectionSet] of this.connectionsByProfile) {
      connectionsByProfile[profileId] = connectionSet.size;
    }

    const connectionsByState: Record<McpConnectionState, number> = {
      initializing: 0,
      connected: 0,
      reconnecting: 0,
      failed: 0,
      degraded: 0,
      closing: 0,
      closed: 0,
    };

    connections.forEach(conn => {
      connectionsByState[conn.state]++;
    });

    const circuitBreakerStates: Record<string, string> = {};
    for (const [profileId, breaker] of this.circuitBreakers) {
      circuitBreakerStates[profileId] = breaker.state;
    }

    const totalUptime = connections.reduce((sum, conn) => sum + conn.health.uptime, 0);
    const averageConnectionUptime = connections.length > 0 ? totalUptime / connections.length : 0;

    const totalRequests = connections.reduce((sum, conn) => sum + conn.health.totalRequests, 0);
    const totalFailedRequests = connections.reduce(
      (sum, conn) => sum + conn.health.failedRequests,
      0,
    );
    const failureRate = totalRequests > 0 ? totalFailedRequests / totalRequests : 0;

    return {
      totalConnections: connections.length,
      connectionsByProfile,
      connectionsByState,
      circuitBreakerStates,
      averageConnectionUptime,
      totalRequests,
      failureRate,
    };
  }

  /**
   * Shutdown the connection pool
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Close all connections
    const closePromises = Array.from(this.connections.keys()).map(id =>
      this.closeConnection(id, 'Pool shutdown'),
    );

    await Promise.allSettled(closePromises);

    logInfo('MCP Connection Pool: Shutdown completed', {
      operation: 'connection_pool_shutdown',
      metadata: {
        closedConnections: closePromises.length,
      },
    });
  }
}

/**
 * Global connection pool instance
 */
export const mcpConnectionPool = new McpConnectionPool();

/**
 * Utility functions for connection pool management
 */
export const connectionPoolUtils = {
  getConnection: (profile: McpConnectionProfile, context?: FeatureFlagContext) =>
    mcpConnectionPool.getConnection(profile, context),

  closeConnection: (connectionId: string, reason?: string) =>
    mcpConnectionPool.closeConnection(connectionId, reason),

  getStatistics: () => mcpConnectionPool.getPoolStatistics(),

  shutdown: () => mcpConnectionPool.shutdown(),
};
