/**
 * Node.js optimized Prisma client factory
 * Designed for traditional Node.js server environments
 */

import type { PrismaClient as GeneratedClient } from '../../generated/client/client';
import type { ExtendedPrismaClient } from '../extensions/index';
import { sharedOperationsExtension } from '../extensions/shared-operations';
import { softDeleteMiddleware } from '../prisma/soft-delete-middleware';
import { loadAdapterStatic } from '../runtime/static-loader';

export interface NodeClientOptions {
  adapter?: any;
  datasourceUrl?: string;
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
  maxConnections?: number;
  connectionTimeout?: number;
  autoSelectAdapter?: boolean;
  errorFormat?: 'pretty' | 'colorless' | 'minimal';
  transactionOptions?: {
    timeout?: number;
    maxWait?: number;
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  };
}

/**
 * Create a Node.js optimized Prisma client with extensions
 * Returns an extended client with all shared operations and model-specific methods
 */
export async function createNodeClient(
  options: NodeClientOptions = {},
): Promise<ExtendedPrismaClient> {
  // Auto-select adapter if not provided and autoSelectAdapter is true (default)
  let adapter = options.adapter;

  if (!adapter && options.autoSelectAdapter !== false) {
    try {
      const { autoSelectAdapter } = await import('../runtime/selector');
      const result = await autoSelectAdapter({
        connectionString: options.datasourceUrl,
        log: options.log,
      });
      adapter = result.adapter;
    } catch (error) {
      // If adapter selection fails during build, provide a minimal fallback
      console.warn(
        '[Node Client] Adapter selection failed, using fallback:',
        error instanceof Error ? error.message : String(error),
      );

      // Use static import for build-time fallback
      adapter = await loadAdapterStatic({
        provider: 'postgresql', // Default fallback
        connectionString: options.datasourceUrl || 'postgresql://localhost:5432/fallback',
        options: {},
      });
    }
  }

  // Prisma 6 requires an adapter - ensure we always have one
  if (!adapter) {
    console.warn('[Node Client] No adapter available, creating build-time fallback');
    adapter = await loadAdapterStatic({
      provider: 'postgresql',
      connectionString: options.datasourceUrl || 'postgresql://localhost:5432/fallback',
      options: {},
    });
  }

  // Load the full client for Node.js
  const { PrismaClient } = await import('../../generated/client/client');

  // Prisma 6: When using driver adapters, do NOT pass datasourceUrl to PrismaClient
  // The connection string should be configured in the adapter itself
  const clientConfig: any = {
    log: options.log || ['warn', 'error'],
    errorFormat: options.errorFormat || 'colorless',
    transactionOptions: options.transactionOptions,
    // Node.js specific optimizations
    __internal: {
      engine: {
        // Can use query engine binary in Node.js for better performance
        // Will fall back to queryCompiler if binary is not available
      },
    },
  };

  // Only include adapter or datasourceUrl, never both (Prisma 6 requirement)
  if (adapter) {
    clientConfig.adapter = adapter;
  } else if (options.datasourceUrl) {
    clientConfig.datasourceUrl = options.datasourceUrl;
  }

  const baseClient = new PrismaClient(clientConfig) as unknown as GeneratedClient;

  // Apply soft-delete middleware safely (only affects allowlisted models)
  softDeleteMiddleware(baseClient as any);

  // Apply Prisma 6+ extensions for DRY operations
  try {
    // Validate extensions are available before applying
    if (typeof baseClient.$extends !== 'function') {
      throw new Error('$extends method not available on client');
    }

    const extendedClient = baseClient.$extends(sharedOperationsExtension);

    // Validate that extensions were applied successfully
    if (!extendedClient || typeof (extendedClient as any).$paginate !== 'function') {
      throw new Error('Extensions were not applied successfully');
    }

    return extendedClient as unknown as ExtendedPrismaClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Node Client] Critical: Extension application failed:', errorMessage);
    console.warn('[Node Client] ORM functions will use fallback patterns only');

    // Return base client but warn that extension methods won't be available
    // The withExtensionFallback pattern in ORM functions will handle this gracefully
    return baseClient as unknown as ExtendedPrismaClient;
  }
}

/**
 * Create a development-optimized Node.js client
 */
export async function createDevelopmentClient(
  options: Omit<NodeClientOptions, 'log' | 'errorFormat'> = {},
): Promise<ExtendedPrismaClient> {
  return createNodeClient({
    ...options,
    log: ['query', 'info', 'warn', 'error'], // Full logging for development
    errorFormat: 'pretty', // Better error messages for development
    transactionOptions: {
      timeout: 10000, // 10 second transaction timeout
      maxWait: 5000, // 5 second wait time
      ...options.transactionOptions,
    },
  });
}

/**
 * Create a production-optimized Node.js client
 */
export async function createProductionClient(
  options: Omit<NodeClientOptions, 'log' | 'errorFormat'> = {},
): Promise<ExtendedPrismaClient> {
  return createNodeClient({
    ...options,
    log: ['error'], // Minimal logging for production
    errorFormat: 'minimal', // Compact errors for production
    maxConnections: options.maxConnections || 10, // Higher connection limit for production
    connectionTimeout: options.connectionTimeout || 30000, // 30 second timeout
    transactionOptions: {
      timeout: 30000, // 30 second transaction timeout
      maxWait: 10000, // 10 second wait time
      ...options.transactionOptions,
    },
  });
}

/**
 * Create a client with full PostgreSQL features
 */
export async function createPostgreSQLClient(
  connectionString: string,
  options: Omit<NodeClientOptions, 'adapter' | 'datasourceUrl'> = {},
): Promise<ExtendedPrismaClient> {
  const { createPostgreSQLAdapter } = await import('../adapters/postgresql');

  const adapter = await createPostgreSQLAdapter({
    connectionString,
    maxConnections: options.maxConnections || 10,
    connectionTimeout: options.connectionTimeout || 30000,
    sslMode: 'prefer', // Default to prefer SSL
  });

  return createNodeClient({
    ...options,
    adapter,
    autoSelectAdapter: false, // We're providing the adapter explicitly
  });
}

/**
 * Create a client with SQLite
 */
export async function createSQLiteClient(
  databasePath: string,
  options: Omit<NodeClientOptions, 'adapter' | 'datasourceUrl'> = {},
): Promise<ExtendedPrismaClient> {
  const { createSQLiteAdapter } = await import('../adapters/sqlite');

  const adapter = await createSQLiteAdapter({
    url: databasePath.startsWith('file:') ? databasePath : `file:${databasePath}`,
    readonly: false,
    timeout: options.connectionTimeout || 5000,
  });

  return createNodeClient({
    ...options,
    adapter,
    autoSelectAdapter: false, // We're providing the adapter explicitly
  });
}

/**
 * Create a client with connection monitoring
 */
export async function createMonitoredClient(
  options: NodeClientOptions & {
    monitoring?: {
      enabled: boolean;
      logInterval?: number;
      includeQueries?: boolean;
    };
  } = {},
): Promise<ExtendedPrismaClient> {
  const client = await createNodeClient(options);

  if (options.monitoring?.enabled) {
    // Set up connection monitoring
    const logInterval = options.monitoring.logInterval || 60000; // 1 minute

    setInterval(() => {
      // Log client statistics (if available)
      console.log(`[${new Date().toISOString()}] Prisma Client Status: Active`);

      // Additional monitoring could be added here
      // such as connection pool stats, query performance metrics, etc.
    }, logInterval);

    // Add query logging if requested
    if (options.monitoring.includeQueries && '$on' in client) {
      (client as any).$on('query', (event: any) => {
        console.log(`Query: ${event.query}`);
        console.log(`Duration: ${event.duration}ms`);
      });
    }
  }

  return client;
}

/**
 * Helper to validate Node.js client configuration
 */
export function validateNodeClientOptions(options: NodeClientOptions): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!options.adapter && !options.datasourceUrl && options.autoSelectAdapter === false) {
    issues.push(
      'Either adapter or datasourceUrl must be provided when autoSelectAdapter is disabled',
    );
  }

  if (options.maxConnections && options.maxConnections > 100) {
    suggestions.push('Consider if more than 100 connections are really needed');
  }

  if (options.connectionTimeout && options.connectionTimeout < 1000) {
    suggestions.push('Connection timeout below 1 second may cause frequent timeouts');
  }

  if (options.transactionOptions?.timeout && options.transactionOptions.timeout > 60000) {
    suggestions.push('Transaction timeouts over 1 minute may indicate inefficient queries');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Gracefully close a Prisma client
 */
export async function closeClient(client: GeneratedClient): Promise<void> {
  try {
    await client.$disconnect();
  } catch (error) {
    console.error('Error closing Prisma client:', error);
    throw error;
  }
}

/**
 * Module-level singleton client for synchronous access
 */
let defaultClient: ExtendedPrismaClient | null = null;

/**
 * Get synchronous default client (recommended for ORM modules)
 * Uses module-level singleton pattern for optimal performance
 */
export function getDefaultClientSync(): ExtendedPrismaClient {
  if (!defaultClient) {
    try {
      // Create synchronous client with direct adapter initialization
      const { PrismaPg } = require('@prisma/adapter-pg');
      const { PrismaClient } = require('../../generated/client/client');

      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/db',
      });
      let baseClient: any;
      try {
        baseClient = new PrismaClient({ adapter }) as any;
      } catch (e: any) {
        const msg = e?.message || String(e);
        // Fallback when driverAdapters preview isn't active in generated client
        if (msg.includes('driverAdapters') || msg.includes('adapter" property')) {
          baseClient = new PrismaClient({
            datasourceUrl: process.env.DATABASE_URL,
          }) as any;
        } else {
          throw e;
        }
      }

      // Apply middleware and extensions synchronously
      try {
        const { softDeleteMiddleware } = require('../prisma/soft-delete-middleware');
        const { sharedOperationsExtension } = require('../extensions/shared-operations');

        softDeleteMiddleware(baseClient);

        defaultClient = baseClient.$extends(sharedOperationsExtension) as ExtendedPrismaClient;
      } catch (error) {
        // Fallback to base client if extensions fail
        console.warn(
          '[Node Client] Extensions failed, using base client:',
          error instanceof Error ? error.message : String(error),
        );
        defaultClient = baseClient as ExtendedPrismaClient;
      }
    } catch (error) {
      console.error(
        '[Node Client] Failed to create default client:',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to initialize default Prisma client');
    }
  }
  return defaultClient;
}

/**
 * Get a default Prisma client (compatibility function for ORM modules)
 * Returns a Node.js optimized client with default settings
 */
export async function getClient(options?: NodeClientOptions): Promise<ExtendedPrismaClient> {
  if (!options || Object.keys(options).length === 0) {
    // Return sync client for default usage
    return getDefaultClientSync();
  }
  return createNodeClient(options);
}
