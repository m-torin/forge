/**
 * Neon Serverless adapter for edge runtimes
 * Optimized for Vercel Edge Functions and other HTTP-based environments
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

export interface NeonAdapterOptions extends BaseAdapterOptions {
  connectionString: string;
  pooled?: boolean;
  arrayMode?: boolean;
  fullResults?: boolean;
  fetchFunction?: typeof fetch;
}

/**
 * Create a Neon serverless adapter instance
 */
export async function createNeonAdapter(options: NeonAdapterOptions): Promise<any> {
  return withRetry(async () => {
    try {
      // Dynamic import with fallback for development
      const adapterModule = await import('@prisma/adapter-neon' as any).catch(() => {
        throw new Error(
          '@prisma/adapter-neon package not found. Install with: pnpm add @prisma/adapter-neon',
        );
      });
      const { PrismaNeon } = adapterModule;

      const adapterConfig = {
        connectionString: options.connectionString,
        pooled: options.pooled,
        arrayMode: options.arrayMode,
        fullResults: options.fullResults,
        fetchFunction: options.fetchFunction,
      };

      // Remove undefined properties to avoid passing them to Neon
      const cleanConfig = Object.fromEntries(
        Object.entries(adapterConfig).filter(([_, value]) => value !== undefined),
      );

      return new PrismaNeon(cleanConfig);
    } catch (error) {
      throw createAdapterError('Neon', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Create a Neon adapter with Vercel-specific optimizations
 */
export async function createVercelNeonAdapter(
  connectionString: string,
  options: Partial<NeonAdapterOptions> = {},
): Promise<any> {
  // Vercel Postgres connection strings
  const vercelConnectionString =
    connectionString ||
    (typeof process !== 'undefined' ? process.env.POSTGRES_PRISMA_URL : '') ||
    (typeof process !== 'undefined' ? process.env.DATABASE_URL : '');

  if (!vercelConnectionString) {
    throw new Error(
      'No Vercel Postgres connection string found. ' +
        'Please set POSTGRES_PRISMA_URL or DATABASE_URL environment variable.',
    );
  }

  return createNeonAdapter({
    connectionString: vercelConnectionString,
    pooled: true, // Use connection pooling for Vercel
    arrayMode: false, // Default for most use cases
    fullResults: false, // Optimize for performance
    maxConnections: 2, // Edge functions need minimal connections
    connectionTimeout: 10000, // 10 second timeout for edge
    ...options,
  });
}

/**
 * Validate Neon adapter options
 */
export function validateNeonOptions(options: NeonAdapterOptions): boolean {
  if (!options.connectionString) {
    return false;
  }

  // Validate that connection string looks like a Neon URL
  try {
    const url = new URL(options.connectionString);

    // Check for Neon-specific patterns
    if (
      !url.hostname.includes('neon') &&
      !url.searchParams.has('sslmode') &&
      !url.protocol.startsWith('postgres')
    ) {
      console.warn('Connection string may not be a valid Neon connection string');
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get required dependencies for Neon adapter
 */
export function getNeonDependencies(): string[] {
  return ['@prisma/adapter-neon', '@neondatabase/serverless'];
}

/**
 * Check if Neon adapter is available in current environment
 */
export async function isNeonAvailable(): Promise<boolean> {
  try {
    await import('@prisma/adapter-neon' as any);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to detect if a connection string is for Neon
 */
export function isNeonConnectionString(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    return (
      url.hostname.includes('neon.tech') ||
      url.hostname.includes('neon.cc') ||
      url.hostname.includes('ep-') || // Neon endpoint pattern
      url.searchParams.has('sslmode')
    );
  } catch {
    return false;
  }
}

/**
 * Create a connection string validator for Neon
 */
export function validateNeonConnectionString(connectionString: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    const url = new URL(connectionString);

    // Check protocol
    if (!url.protocol.startsWith('postgres')) {
      issues.push('Connection string should use postgresql:// protocol');
    }

    // Check hostname
    if (!url.hostname.includes('neon')) {
      suggestions.push('Hostname should contain "neon" for Neon database connections');
    }

    // Check for SSL
    if (!url.searchParams.has('sslmode') && !url.searchParams.has('ssl')) {
      suggestions.push('Consider adding sslmode=require for secure connections');
    }

    // Check for pooling parameters
    if (!url.searchParams.has('pgbouncer') && !url.searchParams.has('pooler')) {
      suggestions.push('Consider using connection pooling for better performance');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  } catch (error) {
    return {
      isValid: false,
      issues: ['Invalid URL format'],
      suggestions: ['Use format: postgresql://user:password@host:port/database?sslmode=require'],
    };
  }
}
