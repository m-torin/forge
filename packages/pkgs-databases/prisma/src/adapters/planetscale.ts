/**
 * PlanetScale Serverless adapter for edge runtimes
 * Optimized for Cloudflare Workers and Vercel Edge Functions
 */

import { createAdapterError, withRetry, type BaseAdapterOptions } from './base';

// Type for fetch RequestInfo to avoid DOM type conflicts
export type RequestInfo = string | URL | Request;

export interface PlanetScaleAdapterOptions extends BaseAdapterOptions {
  url: string;
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  useReplica?: boolean;
  format?: 'object' | 'array';
  as?: 'object' | 'array';
  cast?: boolean;
}

/**
 * Create a PlanetScale serverless adapter instance
 */
export async function createPlanetScaleAdapter(options: PlanetScaleAdapterOptions): Promise<any> {
  return withRetry(async () => {
    try {
      const adapterModule = await import('@prisma/adapter-planetscale' as any).catch(() => {
        throw new Error(
          '@prisma/adapter-planetscale package not found. Install with: pnpm add @prisma/adapter-planetscale',
        );
      });
      const { PrismaPlanetScale } = adapterModule;

      // Handle Cloudflare Workers cache issue
      const fetchFunction = options.fetch || createEdgeFetch();

      const adapterConfig = {
        url: options.url,
        fetch: fetchFunction,
        useReplica: options.useReplica,
        format: options.format,
        as: options.as,
        cast: options.cast,
      };

      // Remove undefined properties
      const cleanConfig = Object.fromEntries(
        Object.entries(adapterConfig).filter(([_, value]) => value !== undefined),
      );

      return new PrismaPlanetScale(cleanConfig);
    } catch (error) {
      throw createAdapterError('PlanetScale', error, 'creating adapter instance');
    }
  }, options.retries);
}

/**
 * Create a fetch function that handles edge runtime issues
 */
function createEdgeFetch(): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    // Remove 'cache' property to avoid Cloudflare Worker issues
    // See: https://github.com/cloudflare/workerd/issues/698
    if (init && 'cache' in init) {
      const { cache, ...cleanInit } = init;
      return fetch(input, cleanInit);
    }
    return fetch(input, init);
  };
}

/**
 * Create a PlanetScale adapter optimized for Cloudflare Workers
 */
export async function createCloudflareAdapter(
  url: string,
  options: Partial<PlanetScaleAdapterOptions> = {},
): Promise<any> {
  return createPlanetScaleAdapter({
    url,
    fetch: createEdgeFetch(),
    format: 'object', // Default to object format
    cast: true, // Enable type casting
    maxConnections: 2, // Cloudflare Workers need minimal connections
    connectionTimeout: 10000, // 10 second timeout
    ...options,
  });
}

/**
 * Create a PlanetScale adapter optimized for Vercel Edge Functions
 */
export async function createVercelAdapter(
  url: string,
  options: Partial<PlanetScaleAdapterOptions> = {},
): Promise<any> {
  return createPlanetScaleAdapter({
    url,
    format: 'object',
    cast: true,
    maxConnections: 2, // Edge functions need minimal connections
    connectionTimeout: 15000, // 15 second timeout for Vercel
    ...options,
  });
}

/**
 * Validate PlanetScale adapter options
 */
export function validatePlanetScaleOptions(options: PlanetScaleAdapterOptions): boolean {
  if (!options.url) {
    return false;
  }

  // Validate that URL looks like a PlanetScale connection string
  try {
    const url = new URL(options.url);

    // Check for PlanetScale-specific patterns
    if (
      !url.hostname.includes('psdb.cloud') &&
      !url.hostname.includes('planetscale.com') &&
      !url.searchParams.has('sslaccept')
    ) {
      console.warn('Connection string may not be a valid PlanetScale connection string');
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get required dependencies for PlanetScale adapter
 */
export function getPlanetScaleDependencies(): string[] {
  return ['@prisma/adapter-planetscale', '@planetscale/database'];
}

/**
 * Check if PlanetScale adapter is available in current environment
 */
export async function isPlanetScaleAvailable(): Promise<boolean> {
  try {
    await import('@prisma/adapter-planetscale' as any);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to detect if a connection string is for PlanetScale
 */
export function isPlanetScaleConnectionString(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    return (
      url.hostname.includes('psdb.cloud') ||
      url.hostname.includes('planetscale.com') ||
      url.searchParams.has('sslaccept')
    );
  } catch {
    return false;
  }
}

/**
 * Create a connection string validator for PlanetScale
 */
export function validatePlanetScaleConnectionString(connectionString: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    const url = new URL(connectionString);

    // Check protocol
    if (!url.protocol.startsWith('mysql')) {
      issues.push('PlanetScale connection string should use mysql:// protocol');
    }

    // Check hostname
    if (!url.hostname.includes('psdb.cloud') && !url.hostname.includes('planetscale.com')) {
      suggestions.push('Hostname should contain "psdb.cloud" or "planetscale.com"');
    }

    // Check for SSL
    if (!url.searchParams.has('sslaccept')) {
      suggestions.push('Consider adding sslaccept=strict for secure connections');
    }

    // Check for connection limits
    if (!url.searchParams.has('timeout')) {
      suggestions.push('Consider adding timeout parameter for better reliability');
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
      suggestions: ['Use format: mysql://user:password@host:port/database?sslaccept=strict'],
    };
  }
}

/**
 * Helper to extract database name from PlanetScale connection string
 */
export function extractDatabaseName(connectionString: string): string | null {
  try {
    const url = new URL(connectionString);
    return url.pathname.slice(1) || null; // Remove leading slash
  } catch {
    return null;
  }
}

/**
 * Helper to check if connection is using PlanetScale's branching feature
 */
export function detectPlanetScaleBranch(connectionString: string): string | null {
  try {
    const url = new URL(connectionString);
    // PlanetScale branches are often in the username format: username.branch
    const username = url.username;
    if (username && username.includes('.')) {
      return username.split('.')[1] || null;
    }
    return null;
  } catch {
    return null;
  }
}
