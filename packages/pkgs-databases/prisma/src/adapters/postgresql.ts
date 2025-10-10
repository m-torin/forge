/**
 * PostgreSQL adapter for Node.js and edge runtimes (via pg)
 * Tree-shakeable implementation of the original PostgreSQL adapter
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

export interface PostgreSQLAdapterOptions extends BaseAdapterOptions {
  connectionString: string;
  schema?: string;
  sslMode?: 'disable' | 'prefer' | 'require';
  pgBouncer?: boolean;
  applicationName?: string;
  statementCacheSize?: number;
}

/**
 * Create a PostgreSQL adapter instance
 */
export async function createPostgreSQLAdapter(options: PostgreSQLAdapterOptions): Promise<any> {
  return withRetry(async () => {
    try {
      const { PrismaPg } = await import('@prisma/adapter-pg');

      // Build enhanced connection string if additional options are provided
      let connectionString = options.connectionString;

      const hasAdvancedOptions =
        options.sslMode ||
        options.maxConnections ||
        options.connectionTimeout ||
        options.poolTimeout ||
        options.pgBouncer ||
        options.applicationName ||
        options.statementCacheSize;

      if (hasAdvancedOptions) {
        connectionString = buildEnhancedConnectionString(options);
      }

      const adapterOptions = { connectionString };

      // Schema can be specified either in connection string or as separate option
      if (options.schema) {
        return new PrismaPg(adapterOptions, { schema: options.schema });
      }

      return new PrismaPg(adapterOptions);
    } catch (error) {
      throw createAdapterError('PostgreSQL', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Build an enhanced PostgreSQL connection string with all options
 */
function buildEnhancedConnectionString(options: PostgreSQLAdapterOptions): string {
  try {
    const url = new URL(options.connectionString);
    const queryParams: string[] = [];

    // Preserve existing query parameters
    url.searchParams.forEach((value, key) => {
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    });

    // Add schema (most important, should be first if not already present)
    if (options.schema && !url.searchParams.has('schema')) {
      queryParams.unshift(`schema=${encodeURIComponent(options.schema)}`);
    }

    // SSL configuration
    const sslMode = options.sslMode;
    if (sslMode && !url.searchParams.has('sslmode')) {
      queryParams.push(`sslmode=${sslMode}`);
    }

    // Connection management
    if (options.maxConnections && !url.searchParams.has('connection_limit')) {
      queryParams.push(`connection_limit=${options.maxConnections}`);
    }
    if (options.connectionTimeout && !url.searchParams.has('connect_timeout')) {
      queryParams.push(`connect_timeout=${Math.floor(options.connectionTimeout / 1000)}`);
    }
    if (options.poolTimeout && !url.searchParams.has('pool_timeout')) {
      queryParams.push(`pool_timeout=${Math.floor(options.poolTimeout / 1000)}`);
    }

    // PgBouncer compatibility
    if (options.pgBouncer === true && !url.searchParams.has('pgbouncer')) {
      queryParams.push('pgbouncer=true');
    }

    // Application identification
    if (options.applicationName && !url.searchParams.has('application_name')) {
      queryParams.push(`application_name=${encodeURIComponent(options.applicationName)}`);
    }

    // Performance tuning
    if (options.statementCacheSize && !url.searchParams.has('statement_cache_size')) {
      queryParams.push(`statement_cache_size=${options.statementCacheSize}`);
    }

    // Rebuild URL with all query parameters
    const baseUrl = `${url.protocol}//${url.username}:${url.password}@${url.hostname}:${url.port || 5432}${url.pathname}`;
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    return `${baseUrl}${queryString}`;
  } catch (error) {
    // If URL parsing fails, fall back to original connection string
    console.warn('Failed to parse PostgreSQL connection string for enhancement:', error);
    return options.connectionString;
  }
}

/**
 * Validate PostgreSQL adapter options
 */
export function validatePostgreSQLOptions(options: PostgreSQLAdapterOptions): boolean {
  if (!options.connectionString) {
    return false;
  }

  // Enhanced validation for PostgreSQL options
  if (options.sslMode && !['disable', 'prefer', 'require'].includes(options.sslMode)) {
    return false;
  }

  if (options.maxConnections && (options.maxConnections < 1 || options.maxConnections > 1000)) {
    return false;
  }

  if (options.connectionTimeout && options.connectionTimeout < 0) {
    return false;
  }

  if (options.poolTimeout && options.poolTimeout < 0) {
    return false;
  }

  if (
    options.statementCacheSize &&
    (options.statementCacheSize < 0 || options.statementCacheSize > 10000)
  ) {
    return false;
  }

  return true;
}

/**
 * Get required dependencies for PostgreSQL adapter
 */
export function getPostgreSQLDependencies(): string[] {
  return ['@prisma/adapter-pg', 'pg', '@types/pg'];
}

/**
 * Check if PostgreSQL adapter is available in current environment
 */
export async function isPostgreSQLAvailable(): Promise<boolean> {
  try {
    await import('@prisma/adapter-pg');
    return true;
  } catch {
    return false;
  }
}
