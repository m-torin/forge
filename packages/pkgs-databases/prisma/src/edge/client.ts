/**
 * Edge-optimized Prisma client factory
 * Designed for Vercel Edge Functions, Cloudflare Workers, and other edge runtimes
 */

import type { PrismaClient as GeneratedClient } from '../../generated/client/client';
import { softDeleteMiddleware } from '../prisma/soft-delete-middleware';

export interface EdgeClientOptions {
  adapter?: any;
  datasourceUrl?: string;
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
  maxConnections?: number;
  connectionTimeout?: number;
  autoSelectAdapter?: boolean;
}

/**
 * Create an edge-optimized Prisma client
 */
export async function createEdgeClient(options: EdgeClientOptions = {}): Promise<GeneratedClient> {
  // Auto-select adapter if not provided and autoSelectAdapter is true (default)
  let adapter = options.adapter;

  if (!adapter && options.autoSelectAdapter !== false) {
    const { autoSelectAdapter } = await import('../runtime/selector');
    const result = await autoSelectAdapter({
      connectionString: options.datasourceUrl,
      log: options.log,
    });
    adapter = result.adapter;
  }

  // Lazy load the client to optimize bundle size
  const { PrismaClient } = await import('../../generated/client/client');

  const client = new PrismaClient({
    adapter,
    datasourceUrl: options.datasourceUrl,
    log: options.log || ['error', 'warn'], // Minimal logging for edge
    // Edge-specific optimizations
    __internal: {
      engine: {
        // Query compiler optimizations for edge
        previewFeatures: ['queryCompiler'],
      },
    },
  } as any) as unknown as GeneratedClient;
  // Apply soft-delete middleware (guarded by model allowlist)
  softDeleteMiddleware(client as any);
  return client;
}

/**
 * Create a client specifically optimized for Vercel Edge Functions
 */
export async function createVercelEdgeClient(
  options: Omit<EdgeClientOptions, 'autoSelectAdapter'> = {},
): Promise<GeneratedClient> {
  const { detectRuntime } = await import('../runtime/detector');
  const runtime = detectRuntime();

  if (runtime.runtime !== 'vercel-edge') {
    console.warn('createVercelEdgeClient called outside Vercel Edge Runtime');
  }

  return createEdgeClient({
    ...options,
    maxConnections: 2, // Vercel Edge needs minimal connections
    connectionTimeout: 10000, // 10 second timeout
    log: ['error'], // Minimal logging for performance
    autoSelectAdapter: true,
  });
}

/**
 * Create a client specifically optimized for Cloudflare Workers
 */
export async function createCloudflareClient(
  options: Omit<EdgeClientOptions, 'autoSelectAdapter'> = {},
): Promise<GeneratedClient> {
  const { detectRuntime } = await import('../runtime/detector');
  const runtime = detectRuntime();

  if (runtime.runtime !== 'cloudflare') {
    console.warn('createCloudflareClient called outside Cloudflare Workers runtime');
  }

  return createEdgeClient({
    ...options,
    maxConnections: 2, // Cloudflare Workers need minimal connections
    connectionTimeout: 15000, // 15 second timeout
    log: ['error'], // Minimal logging for performance
    autoSelectAdapter: true,
  });
}

/**
 * Create a client with connection pooling support (for Vercel Fluid)
 */
export async function createPooledEdgeClient(
  options: EdgeClientOptions & {
    pooling?: {
      enabled: boolean;
      maxConnections?: number;
      idleTimeout?: number;
    };
  } = {},
): Promise<GeneratedClient> {
  if (options.pooling?.enabled) {
    // Import pooling utilities only when needed
    const { createPooledAdapter } = await import('./pooling');

    if (!options.adapter && !options.datasourceUrl) {
      throw new Error('Either adapter or datasourceUrl must be provided for pooled connections');
    }

    // Create pooled adapter if not already provided
    if (!options.adapter && options.datasourceUrl) {
      const { detectRuntime } = await import('../runtime/detector');
      const runtime = detectRuntime();

      let provider: 'postgresql' | 'neon' = 'postgresql';
      if (runtime.runtime === 'vercel-edge' || options.datasourceUrl.includes('neon.tech')) {
        provider = 'neon';
      }

      const pooledAdapter = createPooledAdapter({
        provider,
        connectionString: options.datasourceUrl,
        maxConnections: options.pooling?.maxConnections || 2,
      });

      options.adapter = pooledAdapter.getPool?.() || pooledAdapter;
    }
  }

  return createEdgeClient(options);
}

/**
 * Helper to validate edge client configuration
 */
export function validateEdgeClientOptions(options: EdgeClientOptions): {
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

  if (options.maxConnections && options.maxConnections > 5) {
    suggestions.push('Consider using fewer than 5 connections for edge environments');
  }

  if (options.connectionTimeout && options.connectionTimeout > 30000) {
    suggestions.push('Consider using a shorter connection timeout for edge environments');
  }

  if (options.log && options.log.includes('query')) {
    suggestions.push('Avoid query logging in production edge environments for better performance');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Module-level singleton client for edge environments
 */
let defaultEdgeClient: GeneratedClient | null = null;

/**
 * Get synchronous default edge client (recommended for ORM modules in edge)
 * Uses Neon adapter optimized for serverless/edge environments
 */
export function getDefaultEdgeClientSync(): GeneratedClient {
  if (!defaultEdgeClient) {
    try {
      // Use Neon adapter for edge - optimized for serverless
      const { PrismaNeon } = require('@prisma/adapter-neon');
      const { PrismaClient } = require('../../generated/client/client');

      const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/db';
      const adapter = new PrismaNeon({ connectionString });

      defaultEdgeClient = new PrismaClient({
        adapter,
        log: ['error'], // Minimal logging for edge
      }) as GeneratedClient;

      // Apply middleware
      const { softDeleteMiddleware } = require('../prisma/soft-delete-middleware');
      softDeleteMiddleware(defaultEdgeClient as any);
    } catch (error) {
      console.error(
        '[Edge Client] Failed to create default client:',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to initialize default edge Prisma client');
    }
  }
  return defaultEdgeClient;
}

/**
 * Get a default edge client (compatibility function for ORM modules)
 * Returns an edge-optimized client with default settings
 */
export async function getClient(options?: EdgeClientOptions): Promise<GeneratedClient> {
  if (!options || Object.keys(options).length === 0) {
    // Return sync client for default usage
    return getDefaultEdgeClientSync();
  }
  return createEdgeClient(options);
}
