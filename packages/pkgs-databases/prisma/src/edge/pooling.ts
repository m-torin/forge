/**
 * Connection pooling utilities for edge runtimes
 * Includes Vercel Fluid support and general pool management
 */

export interface PoolingAdapter {
  attachPool?: (pool: any) => void;
  getPool?: () => any;
  closePool?: () => Promise<void>;
  stats?: () => PoolStats;
}

export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
}

export interface PoolingOptions {
  provider: 'postgresql' | 'neon';
  connectionString: string;
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  acquireTimeout?: number;
}

/**
 * Create a pooled adapter with runtime-specific optimizations
 */
export function createPooledAdapter(options: PoolingOptions): PoolingAdapter {
  // Check if we're in Vercel Fluid environment
  if (typeof (globalThis as any).attachDatabasePool === 'function') {
    return createVercelFluidAdapter(options);
  }

  // Check if we're in Cloudflare Workers
  if (
    typeof (globalThis as any).navigator?.userAgent === 'string' &&
    (globalThis as any).navigator.userAgent === 'Cloudflare-Workers'
  ) {
    return createCloudflareAdapter(options);
  }

  // Standard edge pooling
  return createStandardPoolAdapter(options);
}

/**
 * Create a Vercel Fluid-compatible adapter
 */
function createVercelFluidAdapter(options: PoolingOptions): PoolingAdapter {
  let pool: any = null;

  const createPool = async () => {
    if (options.provider === 'postgresql') {
      const pgModule = await import('pg' as any).catch(() => {
        throw new Error('pg package not found. Install with: pnpm add pg');
      });
      const { Pool } = pgModule;
      pool = new Pool({
        connectionString: options.connectionString,
        max: options.maxConnections || 2, // Edge functions need minimal connections
        idleTimeoutMillis: options.idleTimeout || 30000, // 30 seconds
        connectionTimeoutMillis: options.connectionTimeout || 10000, // 10 seconds
        acquireTimeoutMillis: options.acquireTimeout || 10000, // 10 seconds
      });
    } else if (options.provider === 'neon') {
      // Neon doesn't need traditional pooling, but we can optimize connection reuse
      const neonModule = await import('@neondatabase/serverless' as any).catch(() => {
        throw new Error(
          '@neondatabase/serverless package not found. Install with: pnpm add @neondatabase/serverless',
        );
      });
      const { Pool } = neonModule;
      pool = new Pool({
        connectionString: options.connectionString,
        max: options.maxConnections || 2,
      });
    }

    if (pool && typeof (globalThis as any).attachDatabasePool === 'function') {
      // Attach to Vercel's pool manager
      (globalThis as any).attachDatabasePool(pool);
    }

    return pool;
  };

  return {
    async attachPool(p?: any) {
      if (!pool) {
        await createPool();
      }
      if (typeof (globalThis as any).attachDatabasePool === 'function') {
        (globalThis as any).attachDatabasePool(p || pool);
      }
    },

    getPool() {
      return pool;
    },

    async closePool() {
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
      pool = null;
    },

    stats(): PoolStats {
      if (!pool) {
        return { totalConnections: 0, activeConnections: 0, idleConnections: 0, maxConnections: 0 };
      }

      return {
        totalConnections: pool.totalCount || 0,
        activeConnections: pool.totalCount - pool.idleCount || 0,
        idleConnections: pool.idleCount || 0,
        maxConnections: pool.options?.max || pool.maxCount || 0,
      };
    },
  };
}

/**
 * Create a Cloudflare Workers-compatible adapter
 */
function createCloudflareAdapter(options: PoolingOptions): PoolingAdapter {
  // Cloudflare Workers have different connection management
  // Focus on connection reuse rather than traditional pooling
  let connectionCache: Map<string, any> = new Map();

  return {
    getPool() {
      const cacheKey = `${options.provider}:${options.connectionString}`;

      if (!connectionCache.has(cacheKey)) {
        // Create lazy connection
        const connection = createLazyConnection(options);
        connectionCache.set(cacheKey, connection);
      }

      return connectionCache.get(cacheKey);
    },

    async closePool() {
      connectionCache.clear();
    },

    stats(): PoolStats {
      return {
        totalConnections: connectionCache.size,
        activeConnections: connectionCache.size,
        idleConnections: 0,
        maxConnections: options.maxConnections || 5,
      };
    },
  };
}

/**
 * Create a standard pool adapter for other edge environments
 */
function createStandardPoolAdapter(options: PoolingOptions): PoolingAdapter {
  let pool: any = null;

  const createPool = async () => {
    // For edge environments, we focus on connection reuse
    // rather than traditional connection pooling
    return {
      connectionString: options.connectionString,
      provider: options.provider,
      maxConnections: options.maxConnections || 3,
      createdAt: Date.now(),
    };
  };

  return {
    async getPool() {
      if (!pool) {
        pool = await createPool();
      }
      return pool;
    },

    async closePool() {
      pool = null;
    },

    stats(): PoolStats {
      return {
        totalConnections: pool ? 1 : 0,
        activeConnections: pool ? 1 : 0,
        idleConnections: 0,
        maxConnections: options.maxConnections || 3,
      };
    },
  };
}

/**
 * Create a lazy connection that only connects when needed
 */
function createLazyConnection(options: PoolingOptions) {
  return {
    connectionString: options.connectionString,
    provider: options.provider,
    connect: async () => {
      // Lazy connection logic here
      // This would typically create the actual database connection
      return { connected: true, provider: options.provider };
    },
  };
}

/**
 * Helper to detect if Vercel Fluid is available
 */
export function isVercelFluidAvailable(): boolean {
  return typeof (globalThis as any).attachDatabasePool === 'function';
}

/**
 * Helper to validate pooling configuration
 */
export function validatePoolingOptions(options: PoolingOptions): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!options.connectionString) {
    issues.push('Connection string is required');
  }

  if (options.maxConnections && options.maxConnections > 10) {
    suggestions.push('Consider using fewer than 10 connections for edge environments');
  }

  if (options.maxConnections && options.maxConnections < 1) {
    issues.push('maxConnections must be at least 1');
  }

  if (options.connectionTimeout && options.connectionTimeout > 30000) {
    suggestions.push('Consider using a shorter connection timeout for edge environments');
  }

  if (options.idleTimeout && options.idleTimeout > 300000) {
    suggestions.push('Consider using a shorter idle timeout to free up resources');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Utility to log pool statistics (development only)
 */
export function logPoolStats(adapter: PoolingAdapter, label?: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const stats = adapter.stats?.();
    if (stats) {
      console.log(`${label || 'Pool'} Stats:`, {
        total: stats.totalConnections,
        active: stats.activeConnections,
        idle: stats.idleConnections,
        max: stats.maxConnections,
      });
    }
  }
}
