/**
 * Next.js specific utilities for PostHog integration
 * Provides seamless server-side rendering and client hydration
 */

import {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getCachedBootstrapData,
  getDistinctIdFromCookies,
  setCachedBootstrapData,
} from './posthog-bootstrap';

// Dynamic import of React cache for Next.js compatibility
import type { BootstrapData } from '../types/posthog-types';
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
async function createPostHogServerClient(apiKey: string, options?: any) {
  if (typeof window !== 'undefined') {
    throw new Error('createPostHogServerClient should only be called on the server');
  }

  try {
    const { PostHog } = await import('posthog-node');

    return new PostHog(apiKey, {
      flushAt: 1,
      flushInterval: 0,
      host: 'https://app.posthog.com',
      ...options,
    });
  } catch (_error) {
    throw new Error('PostHog Node.js SDK not available. Install with: npm install posthog-node');
  }
}

/**
 * Get or generate distinct ID for server-side operations
 * Uses React cache to ensure consistent ID across server renders
 */
const getOrGenerateDistinctId = cache(async (cookies: any, apiKey: string): Promise<string> => {
  // Try to get from cookies first
  const existingId = getDistinctIdFromCookies(cookies, apiKey);
  if (existingId) {
    return existingId;
  }

  // Generate new ID
  return generateDistinctId();
});

/**
 * Fetch PostHog bootstrap data on the server
 * Uses React cache to prevent duplicate requests
 */
const getPostHogBootstrapData = cache(
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
        timeout: options?.timeout || 5000,
      });

      // Cleanup
      await client.shutdown();

      const bootstrapData = createBootstrapData(distinctId);

      // Cache the result
      setCachedBootstrapData(distinctId, bootstrapData);

      return bootstrapData;
    } catch (_error) {
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
const getCompleteBootstrapData = cache(
  async (
    cookies: any,
    apiKey: string,
    options?: {
      host?: string;
      timeout?: number;
      fallbackToGenerated?: boolean;
    },
  ): Promise<BootstrapData> => {
    try {
      // Get or generate distinct ID
      const distinctId = await getOrGenerateDistinctId(cookies, apiKey);

      // Fetch bootstrap data
      return await getPostHogBootstrapData(apiKey, distinctId, options);
    } catch (error) {
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
 * React Suspense-compatible PostHog bootstrap fetcher
 */
function createPostHogSuspenseData(
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

  const suspender = (async () => {
    try {
      const data = await getCompleteBootstrapData(cookies, apiKey, options);
      status = 'fulfilled';
      result = data;
      return data;
    } catch (err) {
      status = 'rejected';
      error = err;
      throw err;
    }
  })();

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
 * PostHog provider configuration helper for Next.js
 */
function createPostHogConfig(
  apiKey: string,
  options?: {
    host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    session_recording?: boolean;
    bootstrap?: BootstrapData;
    debug?: boolean;
  },
) {
  return {
    apiKey,
    options: {
      api_host: options?.host || 'https://app.posthog.com',
      autocapture: options?.autocapture ?? true,
      bootstrap: options?.bootstrap,
      capture_pageview: options?.capture_pageview ?? false, // We handle manually
      disable_session_recording: !(options?.session_recording ?? true),
      loaded: options?.debug
        ? (posthog: any) => {
            // Only enable debug in development
            if (options.debug) {
              posthog.debug();
            }
          }
        : undefined,
      ...options,
    },
  };
}

/**
 * Middleware helper for PostHog tracking
 */
function createPostHogMiddleware(apiKey: string) {
  return async (request: any, _response?: any) => {
    try {
      // Extract user info from request
      const userAgent = request.headers?.get?.('user-agent') || request.headers?.['user-agent'];
      const referer = request.headers?.get?.('referer') || request.headers?.['referer'];
      const ip = request.ip || request.headers?.get?.('x-forwarded-for') || 'unknown';

      // Get distinct ID from cookies
      const cookies = request.cookies;
      const distinctId = getDistinctIdFromCookies(cookies, apiKey) || generateDistinctId();

      // Create tracking context
      return {
        distinctId,
        ip,
        referer,
        timestamp: new Date().toISOString(),
        userAgent,
      };
    } catch (_error) {
      return null;
    }
  };
}

/**
 * Export commonly used utilities
 */
export {
  createPostHogConfig,
  createPostHogMiddleware,
  createPostHogServerClient,
  createPostHogSuspenseData,
  getCompleteBootstrapData,
  getOrGenerateDistinctId,
  getPostHogBootstrapData,
};
