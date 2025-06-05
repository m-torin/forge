/**
 * Next.js specific utilities for PostHog integration
 * Provides seamless server-side rendering and client hydration
 */

// Dynamic import of React cache for Next.js compatibility
let cache: any;
try {
  cache = require('react').cache;
} catch {
  // Fallback for non-React environments
  cache = <T extends (...args: any[]) => any>(fn: T): T => fn;
}
import type { BootstrapData, FeatureFlags } from '../types/posthog-types';
import { 
  generateDistinctId, 
  getDistinctIdFromCookies, 
  createBootstrapData,
  getCachedBootstrapData,
  setCachedBootstrapData,
  createMinimalBootstrapData
} from './posthog-bootstrap';

/**
 * Create a PostHog client for server-side operations
 */
export async function createPostHogServerClient(apiKey: string, options?: any) {
  try {
    const { PostHog } = await import('posthog-node');
    
    return new PostHog(apiKey, {
      host: 'https://app.posthog.com',
      flushAt: 1,
      flushInterval: 0,
      ...options
    });
  } catch (error) {
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
  }
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
    }
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
        timeout: options?.timeout || 5000
      });
      
      // Fetch flags and payloads
      const featureFlags = await client.getAllFlags(distinctId);
      const featureFlagPayloads: Record<string, any> = {};
      
      // Get payloads for enabled flags
      if (featureFlags) {
        const payloadPromises = Object.entries(featureFlags)
          .filter(([, value]) => value !== false)
          .map(async ([key]) => {
            try {
              const payload = await client.getFeatureFlagPayload(key, distinctId);
              if (payload) {
                featureFlagPayloads[key] = payload;
              }
            } catch (error) {
              // Continue if individual payload fetch fails - silently ignore
            }
          });
        
        await Promise.allSettled(payloadPromises);
      }
      
      // Cleanup
      await client.shutdown();
      
      const bootstrapData = createBootstrapData(distinctId, featureFlags, featureFlagPayloads);
      
      // Cache the result
      setCachedBootstrapData(distinctId, bootstrapData);
      
      return bootstrapData;
    } catch (error) {
      // Return minimal data on error
      const minimalData = createMinimalBootstrapData(distinctId);
      setCachedBootstrapData(distinctId, minimalData);
      return minimalData;
    }
  }
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
      host?: string;
      timeout?: number;
      fallbackToGenerated?: boolean;
    }
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
  }
);

/**
 * React Suspense-compatible PostHog bootstrap fetcher
 */
export function createPostHogSuspenseData(
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
  }
) {
  let status = 'pending';
  let result: BootstrapData;
  let error: any;
  
  const suspender = getCompleteBootstrapData(cookies, apiKey, options)
    .then(
      (data: any) => {
        status = 'fulfilled';
        result = data;
      },
      (err: any) => {
        status = 'rejected';
        error = err;
      }
    );
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'rejected') {
        throw error;
      }
      return result;
    }
  };
}

/**
 * Feature flag checker for server components
 */
export async function isFeatureEnabled(
  flagKey: string,
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
    defaultValue?: boolean;
  }
): Promise<boolean> {
  try {
    const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, options);
    const flagValue = bootstrapData.featureFlags?.[flagKey];
    
    if (flagValue === undefined || flagValue === null) {
      return options?.defaultValue ?? false;
    }
    
    return Boolean(flagValue);
  } catch (error) {
    return options?.defaultValue ?? false;
  }
}

/**
 * Get feature flag value for server components
 */
export async function getFeatureFlag(
  flagKey: string,
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
    defaultValue?: any;
  }
): Promise<any> {
  try {
    const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, options);
    const flagValue = bootstrapData.featureFlags?.[flagKey];
    
    if (flagValue === undefined || flagValue === null) {
      return options?.defaultValue ?? false;
    }
    
    return flagValue;
  } catch (error) {
    return options?.defaultValue ?? false;
  }
}

/**
 * Get all feature flags for server components
 */
export async function getAllFeatureFlags(
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
  }
): Promise<FeatureFlags> {
  try {
    const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, options);
    return bootstrapData.featureFlags || {};
  } catch (error) {
    return {};
  }
}

/**
 * PostHog provider configuration helper for Next.js
 */
export function createPostHogConfig(
  apiKey: string,
  options?: {
    host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    session_recording?: boolean;
    bootstrap?: BootstrapData;
    debug?: boolean;
  }
) {
  return {
    apiKey,
    options: {
      api_host: options?.host || 'https://app.posthog.com',
      autocapture: options?.autocapture ?? true,
      capture_pageview: options?.capture_pageview ?? false, // We handle manually
      disable_session_recording: !(options?.session_recording ?? true),
      bootstrap: options?.bootstrap,
      loaded: options?.debug ? (posthog: any) => {
        // Only enable debug in development
        if (options.debug) {
          posthog.debug();
        }
      } : undefined,
      ...options
    }
  };
}

/**
 * Type-safe feature flag hook factory
 */
export function createFeatureFlagHooks<T extends Record<string, any>>(
  flagKeys: T
) {
  return {
    useFeatureFlag: (key: keyof T) => {
      // This would be implemented with actual React hooks in the client
      // For now, this is a type-safe factory
      return key;
    },
    flagKeys
  };
}

/**
 * Middleware helper for PostHog tracking
 */
export function createPostHogMiddleware(apiKey: string) {
  return async (request: any, response?: any) => {
    try {
      // Extract user info from request
      const userAgent = request.headers?.get?.('user-agent') || request.headers?.['user-agent'];
      const referer = request.headers?.get?.('referer') || request.headers?.['referer'];
      const ip = request.ip || request.headers?.get?.('x-forwarded-for') || 'unknown';
      
      // Get distinct ID from cookies
      const cookies = request.cookies;
      const distinctId = getDistinctIdFromCookies(cookies, apiKey) || generateDistinctId();
      
      // Create tracking context
      const trackingContext = {
        distinctId,
        userAgent,
        referer,
        ip,
        timestamp: new Date().toISOString()
      };
      
      return trackingContext;
    } catch (error) {
      return null;
    }
  };
}

/**
 * Export commonly used utilities
 */
export {
  generateDistinctId,
  getDistinctIdFromCookies,
  createBootstrapData,
  createMinimalBootstrapData
} from './posthog-bootstrap';

// ============================================================================
// ENHANCED FEATURE FLAG UTILITIES WITH FALLBACKS
// ============================================================================

// Feature flag cache for fallback strategies
const flagCache = new Map<string, { value: any; timestamp: number; distinctId: string }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Enhanced feature flag evaluation with fallback strategies
 * Provides resilience against network failures and API timeouts
 */
export async function getFeatureFlagWithFallback(
  flagKey: string,
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
    defaultValue?: any;
    fallbackStrategy?: 'default' | 'cache' | 'previous';
    cacheKey?: string;
  }
): Promise<any> {
  const cacheKey = options?.cacheKey || `${flagKey}_${extractDistinctId(cookies)}`;
  
  try {
    // Primary attempt
    const result = await getFeatureFlag(flagKey, cookies, apiKey, options);
    if (result !== false && result !== null && result !== undefined) {
      // Cache successful result
      flagCache.set(cacheKey, {
        value: result,
        timestamp: Date.now(),
        distinctId: extractDistinctId(cookies) || 'anonymous'
      });
      return result;
    }
  } catch (error) {
    console.warn(`Feature flag ${flagKey} evaluation failed:`, error instanceof Error ? error.message : 'Unknown error');
  }

  // Fallback strategies
  switch (options?.fallbackStrategy) {
    case 'cache': {
      const cached = flagCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`Using cached value for feature flag ${flagKey}`);
        return cached.value;
      }
      break;
    }
    case 'previous': {
      // Check if we have any cached value (even expired)
      const cached = flagCache.get(cacheKey);
      if (cached) {
        console.log(`Using previous value for feature flag ${flagKey}`);
        return cached.value;
      }
      break;
    }
  }

  return options?.defaultValue ?? false;
}

/**
 * Feature flag variants and experiments support
 * Returns both the flag value and any associated payload/experiment data
 */
export async function getFeatureFlagVariant(
  flagKey: string,
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
  }
): Promise<{
  variant: string | boolean;
  payload?: any;
  isExperiment?: boolean;
}> {
  try {
    const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, options);
    const flagValue = bootstrapData.featureFlags?.[flagKey];
    const payload = bootstrapData.featureFlagPayloads?.[flagKey];
    
    return {
      variant: flagValue ?? false,
      payload,
      isExperiment: payload && typeof payload === 'object' && 'experiment_id' in payload
    };
  } catch (error) {
    console.warn(`Feature flag variant evaluation failed for ${flagKey}:`, error);
    return { variant: false };
  }
}

/**
 * Track feature flag exposure for analytics
 * Automatically sends PostHog's expected feature flag exposure events
 */
export function trackFeatureFlagExposure(
  flagKey: string,
  variant: string | boolean,
  analyticsManager: any,
  properties?: any
) {
  try {
    analyticsManager.track('$feature_flag_called', {
      $feature_flag: flagKey,
      $feature_flag_response: variant,
      $feature_flag_exposure: true,
      ...properties
    });
  } catch (error) {
    console.warn('Failed to track feature flag exposure:', error);
  }
}

/**
 * Batch feature flag evaluation for performance
 * Evaluates multiple flags in a single request
 */
export async function getMultipleFeatureFlags(
  flagKeys: string[],
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
    fallbackValues?: Record<string, any>;
  }
): Promise<Record<string, any>> {
  try {
    const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, options);
    const results: Record<string, any> = {};
    
    for (const flagKey of flagKeys) {
      results[flagKey] = bootstrapData.featureFlags?.[flagKey] ?? 
                        options?.fallbackValues?.[flagKey] ?? 
                        false;
    }
    
    return results;
  } catch (error) {
    console.warn('Batch feature flag evaluation failed:', error);
    
    // Return fallback values
    const fallbacks: Record<string, any> = {};
    for (const flagKey of flagKeys) {
      fallbacks[flagKey] = options?.fallbackValues?.[flagKey] ?? false;
    }
    return fallbacks;
  }
}

/**
 * Helper to extract distinct ID from cookies
 * Handles different cookie formats from PostHog
 */
function extractDistinctId(cookies: any): string | null {
  try {
    if (cookies && typeof cookies.get === 'function') {
      // Next.js cookies() format - look for PostHog cookie
      const possibleCookieNames = [
        'ph_phc_posthog',
        `ph_${process.env.NEXT_PUBLIC_POSTHOG_KEY}_posthog`,
        'posthog_distinct_id'
      ];
      
      for (const cookieName of possibleCookieNames) {
        const phCookie = cookies.get(cookieName);
        if (phCookie?.value) {
          try {
            const parsed = JSON.parse(phCookie.value);
            if (parsed.distinct_id) {
              return parsed.distinct_id;
            }
          } catch {
            // If it's not JSON, might be raw distinct ID
            return phCookie.value;
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}