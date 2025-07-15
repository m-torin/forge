/**
 * Connection pooling for observability providers
 * Manages provider instances efficiently without complex retry logic
 */

import { ObservabilityProvider } from '../types/types';

export interface PooledConnection<T extends ObservabilityProvider> {
  provider: T;
  id: string;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  inUse: boolean;
}

export interface ConnectionPoolOptions {
  /** Maximum connections per provider type */
  maxConnections?: number;
  /** Time before idle connections are closed (ms) */
  idleTimeout?: number;
  /** Maximum lifetime of a connection (ms) */
  maxLifetime?: number;
  /** Callback when connection is closed */
  onConnectionClose?: (providerId: string, reason: string) => void;
}

export class ConnectionPool<T extends ObservabilityProvider = ObservabilityProvider> {
  private connections = new Map<string, PooledConnection<T>[]>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly options: Required<ConnectionPoolOptions>;

  constructor(options: ConnectionPoolOptions = {}) {
    this.options = {
      maxConnections: options.maxConnections ?? 3,
      idleTimeout: options.idleTimeout ?? 300000, // 5 minutes
      maxLifetime: options.maxLifetime ?? 3600000, // 1 hour
      onConnectionClose: options.onConnectionClose ?? (() => {}),
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get a connection from the pool
   * Creates a new one if needed and pool isn't full
   */
  async acquire(
    providerType: string,
    factory: () => T | Promise<T>,
  ): Promise<PooledConnection<T> | null> {
    const connections = this.connections.get(providerType) ?? [];

    // Find an available connection
    const available = connections.find((conn: any) => !conn.inUse);

    if (available) {
      available.inUse = true;
      available.lastUsed = new Date();
      available.useCount++;
      return available;
    }

    // Check if we can create a new connection
    if (connections.length >= this.options.maxConnections) {
      // Pool is full, fail gracefully
      return null;
    }

    // Create new connection
    try {
      const provider = await factory();
      const connection: PooledConnection<T> = {
        provider,
        id: `${providerType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        lastUsed: new Date(),
        useCount: 1,
        inUse: true,
      };

      connections.push(connection);
      this.connections.set(providerType, connections);

      return connection;
    } catch (_error) {
      // Failed to create provider, fail gracefully
      return null;
    }
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: PooledConnection<T>): void {
    connection.inUse = false;
    connection.lastUsed = new Date();
  }

  /**
   * Remove a specific connection from the pool
   */
  remove(connection: PooledConnection<T>, reason: string = 'manual'): void {
    for (const [providerType, connections] of this.connections.entries()) {
      const index = connections.findIndex((c: any) => c.id === connection.id);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.connections.delete(providerType);
        }
        this.options.onConnectionClose(connection.id, reason);
        break;
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    providers: Array<{
      type: string;
      total: number;
      inUse: number;
      idle: number;
      avgUseCount: number;
    }>;
    totalConnections: number;
    totalInUse: number;
  } {
    const stats = {
      providers: [] as any[],
      totalConnections: 0,
      totalInUse: 0,
    };

    for (const [type, connections] of this.connections.entries()) {
      const inUse = connections.filter((c: any) => c.inUse).length;
      const avgUseCount =
        connections.reduce((sum, c: any) => sum + c.useCount, 0) / connections.length;

      stats.providers.push({
        type,
        total: connections.length,
        inUse,
        idle: connections.length - inUse,
        avgUseCount: Math.round(avgUseCount),
      });

      stats.totalConnections += connections.length;
      stats.totalInUse += inUse;
    }

    return stats;
  }

  /**
   * Clean up idle and expired connections
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [_providerType, connections] of this.connections.entries()) {
      const toRemove: PooledConnection<T>[] = [];

      for (const connection of connections) {
        if (connection.inUse) continue;

        const idleTime = now - connection.lastUsed.getTime();
        const lifetime = now - connection.createdAt.getTime();

        // Remove if idle too long or exceeded max lifetime
        if (idleTime > this.options.idleTimeout || lifetime > this.options.maxLifetime) {
          toRemove.push(connection);
        }
      }

      // Remove expired connections
      for (const connection of toRemove) {
        const currentIdleTime = now - connection.lastUsed.getTime();
        this.remove(
          connection,
          currentIdleTime > this.options.idleTimeout ? 'idle_timeout' : 'max_lifetime',
        );
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    // Ensure interval doesn't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop cleanup and close all connections
   */
  close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all connections
    for (const [_providerType, connections] of this.connections.entries()) {
      for (const connection of connections) {
        this.options.onConnectionClose(connection.id, 'pool_shutdown');
      }
    }

    this.connections.clear();
  }

  /**
   * Get connection count for a provider type
   */
  getConnectionCount(providerType: string): number {
    return this.connections.get(providerType)?.length ?? 0;
  }

  /**
   * Check if pool has capacity for a provider type
   */
  hasCapacity(providerType: string): boolean {
    return this.getConnectionCount(providerType) < this.options.maxConnections;
  }
}
