import posthog from 'posthog-js';

import { logWarn } from '@repo/observability';
import type { Adapter } from 'flags';
import { safeEnv } from '../../env';

/**
 * Configuration options for PostHog client adapter
 * @param postHogKey - PostHog API key
 * @param postHogOptions - Additional PostHog initialization options
 */
export interface PostHogClientAdapterOptions {
  postHogKey?: string;
  postHogOptions?: {
    host?: string;
    [key: string]: any;
  };
}

/**
 * PostHog client adapter interface for browser environments
 * @param featureFlagPayload - Get feature flag payload with optional transformation
 * @param featureFlagValue - Get feature flag value (boolean or string)
 * @param isFeatureEnabled - Check if feature flag is enabled
 */
export interface PostHogClientAdapter {
  featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E>;
  featureFlagValue<E = any>(): Adapter<boolean | string, E>;
  isFeatureEnabled<E = any>(): Adapter<boolean, E>;
}

/**
 * Create a client-side PostHog adapter for feature flags
 * Only works in browser environments with posthog-js
 * @param options - Configuration options for the adapter
 * @returns PostHog client adapter instance
 */
export function createPostHogClientAdapter(
  options: PostHogClientAdapterOptions = {},
): PostHogClientAdapter {
  const env = safeEnv();
  const postHogKey = options.postHogKey || env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost =
    options.postHogOptions?.host || env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    const debug = env.VERCEL_ANALYTICS_DEBUG === true;
    if (debug) {
      logWarn('PostHog API key not configured - feature flags will return false');
    }
    // Return a no-op adapter that returns false for all flags
    return {
      isFeatureEnabled: () => ({
        decide: async () => false,
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      }),
      featureFlagValue: () => ({
        decide: async () => false,
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      }),
      featureFlagPayload: () => ({
        decide: async () => ({}) as any,
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      }),
    };
  }

  // Initialize PostHog client if in browser
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(postHogKey, {
      api_host: postHogHost,
      ...options.postHogOptions,
    });
  }

  return {
    isFeatureEnabled<E = any>(): Adapter<boolean, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window === 'undefined') {
            throw new Error('PostHog client adapter only works in browser environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';

          // Identify user if needed
          if (userId !== 'anonymous' && userId !== posthog.get_distinct_id()) {
            posthog.identify(userId);
          }

          return posthog.isFeatureEnabled(key) || false;
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },

    featureFlagValue<E = any>(): Adapter<boolean | string, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window === 'undefined') {
            throw new Error('PostHog client adapter only works in browser environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';

          // Identify user if needed
          if (userId !== 'anonymous' && userId !== posthog.get_distinct_id()) {
            posthog.identify(userId);
          }

          const value = posthog.getFeatureFlag(key);
          return value !== undefined ? value : false;
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },

    featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window === 'undefined') {
            throw new Error('PostHog client adapter only works in browser environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';
          const defaultPayload = {} as T;

          // Identify user if needed
          if (userId !== 'anonymous' && userId !== posthog.get_distinct_id()) {
            posthog.identify(userId);
          }

          const payload = posthog.getFeatureFlagPayload(key);
          if (payload && transform) {
            return transform(payload);
          }
          return (payload as T) || defaultPayload;
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },
  };
}

/**
 * Default client-side PostHog adapter using environment variables
 * Automatically configured from NEXT_PUBLIC_POSTHOG_KEY environment variable
 */
export const postHogClientAdapter = createPostHogClientAdapter();
