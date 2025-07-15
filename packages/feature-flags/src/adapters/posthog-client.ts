import posthog from 'posthog-js';

import type { Adapter } from '@vercel/flags';
import { safeEnv } from '../../env';

export interface PostHogClientAdapterOptions {
  postHogKey?: string;
  postHogOptions?: {
    host?: string;
    [key: string]: any;
  };
}

export interface PostHogClientAdapter {
  featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E>;
  featureFlagValue<E = any>(): Adapter<boolean | string, E>;
  isFeatureEnabled<E = any>(): Adapter<boolean, E>;
}

/**
 * Create a client-side PostHog adapter for feature flags
 * Only works in browser environments with posthog-js
 */
export function createPostHogClientAdapter(
  options: PostHogClientAdapterOptions = {},
): PostHogClientAdapter {
  const env = safeEnv();
  const postHogKey = options.postHogKey || env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost =
    options.postHogOptions?.host || env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    console.warn('PostHog API key not configured - feature flags will return false');
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
 */
export const postHogClientAdapter = createPostHogClientAdapter();
