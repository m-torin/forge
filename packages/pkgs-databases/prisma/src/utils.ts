import { PrismaClient } from '../generated/client/client';
import { softDeleteMiddleware } from './prisma/soft-delete-middleware';
import type { AdapterOptions, ClientOptions, DatabaseProvider, RuntimeConfig } from './types';

/**
 * Utility functions for working with Prisma 6 driver adapters
 */

/**
 * Create a PrismaClient instance with the appropriate adapter
 * NOTE: This function requires adapter to be created separately using specific adapter imports
 * @param adapter Pre-created adapter instance
 * @param clientOptions Additional PrismaClient options
 * @returns Promise<PrismaClient> configured with the adapter
 */
export async function createPrismaClientWithAdapter(
  adapter: any,
  clientOptions: Partial<ClientOptions> = {},
): Promise<any> {
  // Use static import to avoid webpack warnings
  // Create client with adapter
  const client = new PrismaClient({
    adapter,
    log: clientOptions.log || ['error', 'warn'],
    ...clientOptions,
  }) as any;
  // Apply soft-delete middleware (only affects configured models)
  softDeleteMiddleware(client as any);
  return client;
}

/**
 * Get optimal database provider for the current runtime environment
 * @param preferredProvider Preferred provider (optional)
 * @returns Recommended database provider
 */
export function getOptimalProvider(preferredProvider?: DatabaseProvider): DatabaseProvider {
  // If a preferred provider is specified, use it
  if (preferredProvider) {
    return preferredProvider;
  }

  // Default to PostgreSQL
  return 'postgresql';
}

/**
 * Check if a dependency package is available
 * @param packageName Package name to check
 * @returns Promise<boolean> indicating if package is available
 */
export async function checkDependency(packageName: string): Promise<boolean> {
  // During build time, always return true to avoid dynamic import issues
  // Dependencies will be checked at runtime when actually needed
  if (
    typeof process !== 'undefined' &&
    (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      process.env.WEBPACK === 'true' ||
      !process.env.NEXT_RUNTIME) // No runtime means build phase
  ) {
    return true;
  }

  // At runtime, check known packages without dynamic import
  // This avoids webpack warnings about dynamic imports
  const knownPackages = [
    '@prisma/adapter-pg',
    '@prisma/adapter-neon',
    '@prisma/adapter-planetscale',
    '@prisma/adapter-libsql',
    '@prisma/adapter-better-sqlite3',
    '@prisma/adapter-d1',
    '@neondatabase/serverless',
    '@planetscale/database',
    '@libsql/client',
    'pg',
    'better-sqlite3',
  ];

  // For known packages, assume they're available if in the list
  // This is safer than dynamic imports and works with webpack
  if (knownPackages.includes(packageName)) {
    // Check if we're in a compatible environment
    const hasNodeModules = typeof process !== 'undefined' && !!process.versions?.node;
    return hasNodeModules;
  }

  // For unknown packages, assume unavailable to be safe
  return false;
}

/**
 * Generate install command for a specific package
 * @param packageName Package name to install
 * @param packageManager Package manager to use ('npm', 'yarn', 'pnpm', 'bun')
 * @returns Installation command string
 */
export function getInstallCommand(
  packageName: string,
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm',
): string {
  switch (packageManager) {
    case 'npm':
      return `npm install ${packageName}`;
    case 'yarn':
      return `yarn add ${packageName}`;
    case 'pnpm':
      return `pnpm add ${packageName}`;
    case 'bun':
      return `bun add ${packageName}`;
    default:
      return `npm install ${packageName}`;
  }
}

/**
 * Create a connection string from individual components
 * @param provider Database provider
 * @param config Connection configuration
 * @returns Connection string
 */
export function createConnectionString(
  provider: DatabaseProvider,
  config: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    schema?: string;
    ssl?: boolean;

    // Enhanced PostgreSQL parameters
    sslMode?: 'disable' | 'prefer' | 'require';
    connectionLimit?: number;
    connectTimeout?: number;
    poolTimeout?: number;
    pgBouncer?: boolean;
    applicationName?: string;
    statementCacheSize?: number;
  },
): string {
  switch (provider) {
    case 'postgresql':
      const pgPort = config.port || 5432;
      const baseUrl = `postgresql://${config.user}:${config.password}@${config.host}:${pgPort}/${config.database}`;

      // Build query parameters
      const queryParams: string[] = [];

      // Schema (most important, should be first)
      if (config.schema) {
        queryParams.push(`schema=${encodeURIComponent(config.schema)}`);
      }

      // SSL configuration
      const sslMode = config.sslMode || (config.ssl ? 'require' : undefined);
      if (sslMode) {
        queryParams.push(`sslmode=${sslMode}`);
      }

      // Connection management
      if (config.connectionLimit) {
        queryParams.push(`connection_limit=${config.connectionLimit}`);
      }
      if (config.connectTimeout) {
        queryParams.push(`connect_timeout=${config.connectTimeout}`);
      }
      if (config.poolTimeout) {
        queryParams.push(`pool_timeout=${config.poolTimeout}`);
      }

      // PgBouncer compatibility
      if (config.pgBouncer === true) {
        queryParams.push('pgbouncer=true');
      }

      // Application identification
      if (config.applicationName) {
        queryParams.push(`application_name=${encodeURIComponent(config.applicationName)}`);
      }

      // Performance tuning
      if (config.statementCacheSize) {
        queryParams.push(`statement_cache_size=${config.statementCacheSize}`);
      }

      // Combine URL with query parameters
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      return `${baseUrl}${queryString}`;

    case 'sqlite':
      return `file:${config.database || './dev.db'}`;

    case 'd1':
      throw new Error(
        'D1 does not use traditional connection strings. Use D1AdapterOptions instead.',
      );

    default:
      throw new Error(`Connection string creation not supported for provider: ${provider}`);
  }
}

/**
 * Parse a connection string into its components
 * @param connectionString Database connection string
 * @returns Parsed connection components
 */
export function parseConnectionString(connectionString: string): {
  protocol: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  query?: Record<string, string>;
} {
  try {
    const url = new URL(connectionString);

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port ? parseInt(url.port) : undefined,
      database: url.pathname.replace('/', ''),
      user: url.username,
      password: url.password,
      query,
    };
  } catch (error) {
    throw new Error(`Invalid connection string: ${connectionString}`);
  }
}

/**
 * Environment variable helpers
 */
export const envHelpers = {
  /**
   * Get database URL from environment with fallback
   */
  getDatabaseUrl(fallback?: string): string {
    return process.env.DATABASE_URL || fallback || '';
  },

  /**
   * Get all database-related environment variables
   */
  getDatabaseEnvVars(): Record<string, string | undefined> {
    return {
      DATABASE_URL: process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_SCHEMA: process.env.DB_SCHEMA,

      // Cloudflare D1
      CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID,
    };
  },

  /**
   * Validate required environment variables for a provider
   */
  validateEnvVars(provider: DatabaseProvider): boolean {
    switch (provider) {
      case 'postgresql':
        return !!process.env.DATABASE_URL;

      case 'sqlite':
        return true; // SQLite doesn't require network env vars

      case 'd1':
        return !!(
          process.env.CLOUDFLARE_D1_TOKEN &&
          process.env.CLOUDFLARE_ACCOUNT_ID &&
          process.env.CLOUDFLARE_DATABASE_ID
        );

      default:
        return false;
    }
  },
};

/**
 * Development helpers
 */
export const devHelpers = {
  /**
   * Log adapter configuration (development only)
   */
  logConfig(
    provider: DatabaseProvider,
    options: AdapterOptions,
    runtimeConfig?: RuntimeConfig,
  ): void {
    if (runtimeConfig && runtimeConfig.environment !== 'development') return;

    console.log(`🔧 Prisma Adapter Configuration:`);
    console.log(`   Provider: ${provider}`);
    console.log(`   Runtime: ${runtimeConfig?.runtime || 'nodejs'}`);
    console.log(`   Environment: ${runtimeConfig?.environment || 'development'}`);
    console.log(
      `   Options:`,
      JSON.stringify(
        options,
        (key, value) =>
          key.toLowerCase().includes('password') || key.toLowerCase().includes('token')
            ? '[REDACTED]'
            : value,
        2,
      ),
    );
  },

  /**
   * Check for potential configuration issues
   */
  checkConfiguration(provider: DatabaseProvider, runtimeConfig?: RuntimeConfig): string[] {
    const warnings: string[] = [];

    if (runtimeConfig?.runtime === 'vercel-edge' && provider === 'postgresql') {
      warnings.push(
        `⚠️  PostgreSQL adapter may not work in Vercel Edge runtime. Consider using D1 for edge-compatible database.`,
      );
    }

    if (runtimeConfig?.runtime === 'vercel-edge' && provider === 'sqlite') {
      warnings.push(
        `⚠️  SQLite adapter may not work in Vercel Edge runtime. Consider using D1 for edge-compatible database.`,
      );
    }

    return warnings;
  },
};

/**
 * Create a quick adapter configuration helper
 * NOTE: Use specific adapter imports instead: import { createNeonAdapter } from '@repo/db-prisma/adapters/neon'
 * @param provider Database provider
 * @param connectionString Database connection string
 * @returns Configuration object with provider and connection string
 */
export function createQuickAdapter(
  provider: DatabaseProvider = 'postgresql',
  connectionString?: string,
) {
  return {
    provider,
    connectionString: connectionString || envHelpers.getDatabaseUrl(),
    note: 'Use specific adapter imports: import { createNeonAdapter } from "@repo/db-prisma/adapters/neon"',
  };
}
