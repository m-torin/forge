/**
 * Server-only PostHog utilities for Next.js
 * These utilities should only be imported in server-side code
 */

// Dynamic import of React cache for Next.js compatibility
import { BootstrapData } from '../types/posthog-types';

import {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getCachedBootstrapData,
  getDistinctIdFromCookies,
  setCachedBootstrapData,
} from './posthog-bootstrap';
let cache: any;
try {
  cache = require('react').cache;
} catch {
  // Fallback for non-React environments
  cache = <T extends (...args: any[]) => any>(fn: T): T => fn;
}

/**
 * Create a PostHog client for server-side operations
 */
export async function createPostHogServerClient(apiKey: string, options?: any) {
  try {
    const { PostHog } = await import('posthog-node');

    return new PostHog(apiKey, {
      flushAt: 1,
      flushInterval: 0,
      host: 'https://app.posthog.com',
      ...options,
    });
  } catch (_error: any) {
    throw new Error('PostHog Node.js SDK not available. Install with: npm install posthog-node');
  }
}

/**
 * Get or generate distinct ID for server-side operations
 * Uses React cache to ensure consistent ID across server renders
 */
export const getOrGenerateDistinctId = cache(
  async (cookies: any, apiKey: string): Promise<string> => {
    // Try to get from cookies first
    const existingId = getDistinctIdFromCookies(cookies, apiKey);
    if (existingId) {
      return existingId;
    }

    // Generate new ID
    return generateDistinctId();
  },
);

/**
 * Fetch PostHog bootstrap data on the server
 * Uses React cache to prevent duplicate requests
 */
export const getPostHogBootstrapData = cache(
  async (
    apiKey: string,
    distinctId: string,
    options?: {
      host?: string;
      timeout?: number;
    },
  ): Promise<BootstrapData> => {
    // Check cache first
    const cached = getCachedBootstrapData(distinctId);
    if (cached) {
      return cached;
    }

    try {
      const client = await createPostHogServerClient(apiKey, {
        host: options?.host,
        // Add timeout for server-side requests
        timeout: options?.timeout ?? 5000,
      });

      // Cleanup
      await client.shutdown();

      const bootstrapData = createBootstrapData(distinctId);

      // Cache the result
      setCachedBootstrapData(distinctId, bootstrapData);

      return bootstrapData;
    } catch (_error: any) {
      // Return minimal data on error
      const minimalData = createMinimalBootstrapData(distinctId);
      setCachedBootstrapData(distinctId, minimalData);
      return minimalData;
    }
  },
);

/**
 * Complete bootstrap data fetcher for Next.js apps
 * Handles cookies, distinct ID generation, and flag fetching
 */
export const getCompleteBootstrapData = cache(
  async (
    cookies: any,
    apiKey: string,
    options?: {
      fallbackToGenerated?: boolean;
      host?: string;
      timeout?: number;
    },
  ): Promise<BootstrapData> => {
    try {
      // Get or generate distinct ID
      const distinctId = await getOrGenerateDistinctId(cookies, apiKey);

      // Fetch bootstrap data
      return await getPostHogBootstrapData(apiKey, distinctId, options);
    } catch (error: any) {
      if (options?.fallbackToGenerated !== false) {
        // Fallback to generated ID with empty flags
        const fallbackId = generateDistinctId();
        return createMinimalBootstrapData(fallbackId);
      }

      throw error;
    }
  },
);

/**
 * Middleware helper for PostHog tracking
 */
export function createPostHogMiddleware(apiKey: string) {
  return async (request: any, _response?: any) => {
    try {
      // Extract user info from request
      const userAgent = request.headers?.get?.('user-agent') ?? request.headers?.['user-agent'];
      const referer = request.headers?.get?.('referer') ?? request.headers?.['referer'];
      const ip = request.ip ?? request.headers?.get?.('x-forwarded-for') ?? 'unknown';

      // Get distinct ID from cookies
      const cookies = request.cookies;
      const distinctId = getDistinctIdFromCookies(cookies, apiKey) ?? generateDistinctId();

      // Create tracking context
      return {
        distinctId,
        ip,
        referer,
        timestamp: new Date().toISOString(),
        userAgent,
      };
    } catch (_error: any) {
      return null;
    }
  };
}

/**
 * React Suspense-compatible PostHog bootstrap fetcher
 */
export function createPostHogSuspenseData(
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
  },
) {
  let status = 'pending';
  let result: BootstrapData;
  let error: any;

  // eslint-disable-next-line promise/prefer-await-to-then
  const suspender = getCompleteBootstrapData(cookies, apiKey, options).then(
    // eslint-disable-next-line promise/always-return
    (data: any) => {
      status = 'fulfilled';
      result = data;
    },
    (err: any) => {
      status = 'rejected';
      error = err;
    },
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'rejected') {
        throw error;
      }
      return result;
    },
  };
}

/**
 * Export commonly used utilities (server-safe only)
 */
export {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from './posthog-bootstrap';
