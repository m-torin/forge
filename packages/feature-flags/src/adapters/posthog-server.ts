import { PostHog } from 'posthog-node';

import type { Adapter } from '@vercel/flags';

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
  const postHogKey = options.postHogKey || process.env.POSTHOG_KEY;
  const postHogHost =
    options.postHogOptions?.host || process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    throw new Error('PostHog API key is required. Set POSTHOG_KEY or pass postHogKey option.');
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
            console.error('Error checking PostHog feature flag:', error);
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
            console.error('Error getting PostHog feature flag value:', error);
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
            console.error('Error getting PostHog feature flag payload:', error);
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
 */
export const postHogServerAdapter = createPostHogServerAdapter();

/**
 * Get provider data for flags discovery endpoint
 */
export async function getProviderData(options: { personalApiKey?: string; projectId?: string }) {
  const personalApiKey = options.personalApiKey || process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = options.projectId || process.env.POSTHOG_PROJECT_ID;

  if (!personalApiKey || !projectId) {
    throw new Error('PostHog personal API key and project ID are required for provider data');
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
    console.error('Error fetching PostHog provider data:', error);
    throw error;
  }
}
