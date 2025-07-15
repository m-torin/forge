import { PostHog } from 'posthog-node';

import { logError, logWarn } from '@repo/observability/server/next';
import type { Adapter } from '@vercel/flags';
import { safeEnv } from '../../env';

export interface PostHogServerAdapterOptions {
  postHogKey?: string;
  postHogOptions?: {
    host?: string;
    [key: string]: any;
  };
}

export interface PostHogServerAdapter {
  featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E>;
  featureFlagValue<E = any>(): Adapter<boolean | string, E>;
  isFeatureEnabled<E = any>(): Adapter<boolean, E>;
}

// Server-side PostHog client (singleton)
let serverPostHogClient: PostHog | null = null;

function getServerPostHogClient(apiKey: string, host: string): PostHog {
  if (!serverPostHogClient) {
    serverPostHogClient = new PostHog(apiKey, { host });
  }
  return serverPostHogClient;
}

/**
 * Create a server-side PostHog adapter for feature flags
 * Only works in Node.js/server environments with posthog-node
 */
export function createPostHogServerAdapter(
  options: PostHogServerAdapterOptions = {},
): PostHogServerAdapter {
  const env = safeEnv();
  const postHogKey = options.postHogKey || env.POSTHOG_KEY;
  const postHogHost = options.postHogOptions?.host || env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    logWarn('PostHog API key not configured - feature flags will return false', {
      adapter: 'posthog-server',
    });
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
      featureFlagPayload: (transform?: (value: any) => any) => ({
        decide: async () => (transform ? transform({}) : {}),
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      }),
    };
  }

  return {
    isFeatureEnabled<E = any>(): Adapter<boolean, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window !== 'undefined') {
            throw new Error('PostHog server adapter only works in Node.js/server environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';

          try {
            const client = getServerPostHogClient(postHogKey, postHogHost);
            const result = await client.isFeatureEnabled(key, userId);
            return result || false;
          } catch (error) {
            logError(
              'Error checking PostHog feature flag',
              error instanceof Error ? error : new Error(String(error)),
              { adapter: 'posthog-server' },
            );
            return false;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },

    featureFlagValue<E = any>(): Adapter<boolean | string, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window !== 'undefined') {
            throw new Error('PostHog server adapter only works in Node.js/server environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';

          try {
            const client = getServerPostHogClient(postHogKey, postHogHost);
            const value = await client.getFeatureFlag(key, userId);
            return value !== undefined ? value : false;
          } catch (error) {
            logError(
              'Error getting PostHog feature flag value',
              error instanceof Error ? error : new Error(String(error)),
              { adapter: 'posthog-server' },
            );
            return false;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },

    featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E> {
      return {
        decide: async ({ entities, key }) => {
          if (typeof window !== 'undefined') {
            throw new Error('PostHog server adapter only works in Node.js/server environments');
          }

          const userId = (entities as any)?.user?.id || 'anonymous';
          const defaultPayload = {} as T;

          try {
            const client = getServerPostHogClient(postHogKey, postHogHost);
            const payload = await client.getFeatureFlagPayload(key, userId);
            if (payload && transform) {
              return transform(payload);
            }
            return (payload as T) || defaultPayload;
          } catch (error) {
            logError(
              'Error getting PostHog feature flag payload',
              error instanceof Error ? error : new Error(String(error)),
              { adapter: 'posthog-server' },
            );
            return defaultPayload;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog' },
      };
    },
  };
}

/**
 * Default server-side PostHog adapter using environment variables
 * This will be a no-op adapter if POSTHOG_KEY is not configured
 */
export const postHogServerAdapter = createPostHogServerAdapter();

/**
 * Get provider data for flags discovery endpoint
 */
export async function getProviderData(options: { personalApiKey?: string; projectId?: string }) {
  const env = safeEnv();
  const personalApiKey = options.personalApiKey || env.POSTHOG_PERSONAL_API_KEY;
  const projectId = options.projectId || env.POSTHOG_PROJECT_ID;

  if (!personalApiKey || !projectId) {
    logWarn('PostHog personal API key and project ID not configured - returning empty flags', {
      adapter: 'posthog-server',
    });
    return {
      provider: 'posthog',
      flags: [],
    };
  }

  try {
    // Fetch feature flags from PostHog API
    const response = await fetch(
      `https://app.posthog.com/api/projects/${projectId}/feature_flags/`,
      {
        headers: {
          Authorization: `Bearer ${personalApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch PostHog flags: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform PostHog flags to Vercel Flags format
    const flags = data.results.map((flag: any) => ({
      key: flag.key,
      options: flag.filters?.multivariate?.variants?.map((variant: any) => ({
        label: variant.name || variant.key,
        value: variant.key,
      })) || [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false },
      ],
    }));

    return {
      provider: 'posthog',
      flags,
    };
  } catch (error) {
    logError(
      'Error fetching PostHog provider data',
      error instanceof Error ? error : new Error(String(error)),
      { adapter: 'posthog-server' },
    );
    throw error;
  }
}
