import posthog from 'posthog-js';
import type { Adapter } from '@vercel/flags';

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
  const postHogKey = options.postHogKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost =
    options.postHogOptions?.host ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    'https://app.posthog.com';

  if (!postHogKey) {
    throw new Error(
      'PostHog API key is required. Set NEXT_PUBLIC_POSTHOG_KEY or pass postHogKey option.',
    );
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
        origin: { provider: 'posthog' },
        config: { reportValue: true },
        decide: async ({ key, entities }) => {
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
      };
    },

    featureFlagValue<E = any>(): Adapter<boolean | string, E> {
      return {
        origin: { provider: 'posthog' },
        config: { reportValue: true },
        decide: async ({ key, entities }) => {
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
      };
    },

    featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E> {
      return {
        origin: { provider: 'posthog' },
        config: { reportValue: true },
        decide: async ({ key, entities }) => {
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
      };
    },
  };
}

/**
 * Default client-side PostHog adapter using environment variables
 */
export const postHogClientAdapter = createPostHogClientAdapter();
