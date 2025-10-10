// PostHog import is now dynamic to prevent client bundling issues

import { logError, logWarn } from '@repo/observability';
import type { Adapter } from 'flags';
import { safeEnv } from '../../env';

/**
 * Configuration options for PostHog server adapter
 * @param postHogKey - PostHog API key
 * @param postHogOptions - Additional PostHog client options
 */
export interface PostHogServerAdapterOptions {
  postHogKey?: string;
  postHogOptions?: {
    host?: string;
    [key: string]: any;
  };
}

/**
 * PostHog server adapter interface for Node.js environments
 * @param featureFlagPayload - Get feature flag payload with optional transformation
 * @param featureFlagValue - Get feature flag value (boolean or string)
 * @param isFeatureEnabled - Check if feature flag is enabled
 */
export interface PostHogServerAdapter {
  featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E>;
  featureFlagValue<E = any>(): Adapter<boolean | string, E>;
  isFeatureEnabled<E = any>(): Adapter<boolean, E>;
}

// Dynamic PostHog import type
type PostHogClient = import('posthog-node').PostHog;

// Server-side PostHog client (singleton)
let serverPostHogClient: PostHogClient | null = null;

/**
 * Get or create singleton PostHog server client with dynamic import
 * @param apiKey - PostHog API key
 * @param host - PostHog host URL
 * @returns PostHog client instance
 */
async function getServerPostHogClient(apiKey: string, host: string): Promise<PostHogClient> {
  if (!serverPostHogClient) {
    const { PostHog } = await import('posthog-node');
    serverPostHogClient = new PostHog(apiKey, { host });
  }
  return serverPostHogClient;
}

/**
 * Create a server-side PostHog adapter for feature flags
 * Only works in Node.js/server environments with posthog-node
 * @param options - Configuration options for the adapter
 * @returns PostHog server adapter instance
 */
export function createPostHogServerAdapter(
  options: PostHogServerAdapterOptions = {},
): PostHogServerAdapter {
  const env = safeEnv();
  const postHogKey = options.postHogKey || env.POSTHOG_KEY;
  const postHogHost = options.postHogOptions?.host || env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    const debug = env.VERCEL_ANALYTICS_DEBUG === true;
    if (debug) {
      logWarn('PostHog API key not configured - using offline fallback mode', {
        adapter: 'posthog-server',
        mode: 'offline-fallback',
      });
    }
    // Return an offline-compatible adapter with local fallbacks
    return {
      isFeatureEnabled: () => ({
        decide: async ({ key, entities }) => {
          // Offline fallback: use local context for basic feature detection
          const contextEntity = entities as any;
          const userId = contextEntity?.user?.id || 'anonymous';
          // Simple hash-based determination for consistency
          const hash = (key + userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return hash % 2 === 0; // 50% rollout offline
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-offline' },
      }),
      featureFlagValue: () => ({
        decide: async ({ key, entities }) => {
          // Offline fallback: return simple variants
          const contextEntity = entities as any;
          const userId = contextEntity?.user?.id || 'anonymous';
          const hash = (key + userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return hash % 3 === 0 ? 'variant-a' : hash % 3 === 1 ? 'variant-b' : 'control';
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-offline' },
      }),
      featureFlagPayload: (transform?: (value: any) => any) => ({
        decide: async ({ key, entities }) => {
          // Offline fallback: return minimal payload
          const contextEntity = entities as any;
          const defaultPayload = {
            key,
            userId: contextEntity?.user?.id || 'anonymous',
            offline: true,
            timestamp: Date.now(),
          };
          return transform ? transform(defaultPayload) : defaultPayload;
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-offline' },
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
            const client = await getServerPostHogClient(postHogKey, postHogHost);
            const result = await client.isFeatureEnabled(key, userId);
            return result || false;
          } catch (error) {
            logError(
              error instanceof Error
                ? error.message
                : 'Error checking PostHog feature flag: ' + String(error),
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
            const client = await getServerPostHogClient(postHogKey, postHogHost);
            const value = await client.getFeatureFlag(key, userId);
            return value !== undefined ? value : false;
          } catch (error) {
            logError(
              error instanceof Error
                ? error.message
                : 'Error getting PostHog feature flag value: ' + String(error),
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
            const client = await getServerPostHogClient(postHogKey, postHogHost);
            const payload = await client.getFeatureFlagPayload(key, userId);
            if (payload && transform) {
              return transform(payload);
            }
            return (payload as T) || defaultPayload;
          } catch (error) {
            logError(
              error instanceof Error
                ? error.message
                : 'Error getting PostHog feature flag payload: ' + String(error),
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
 * Automatically configured from POSTHOG_KEY environment variable
 * Falls back to offline mode if not configured
 */
// Lazy/default adapter to avoid side effects at module load.
// The actual adapter is created on first property access.
let internalPostHogServerAdapter: PostHogServerAdapter | null = null;
export const postHogServerAdapter: PostHogServerAdapter = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!internalPostHogServerAdapter) {
        internalPostHogServerAdapter = createPostHogServerAdapter();
      }
      return (internalPostHogServerAdapter as unknown as Record<string | symbol, unknown>)[
        prop
      ] as PostHogServerAdapter[keyof PostHogServerAdapter];
    },
  },
  // TypeScript type coercion for proxy instance
) as unknown as PostHogServerAdapter;

/**
 * Get provider data for flags discovery endpoint
 * @param options - Configuration options with personal API key and project ID
 * @returns Promise with provider data and flags array
 */
export async function getProviderData(options: { personalApiKey?: string; projectId?: string }) {
  const env = safeEnv();
  const personalApiKey = options.personalApiKey || env.POSTHOG_PERSONAL_API_KEY;
  const projectId = options.projectId || env.POSTHOG_PROJECT_ID;

  if (!personalApiKey || !projectId) {
    const debug = env.VERCEL_ANALYTICS_DEBUG === true;
    if (debug) {
      logWarn('PostHog personal API key and project ID not configured - returning empty flags', {
        adapter: 'posthog-server',
      });
    }
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
      error instanceof Error
        ? error.message
        : 'Error fetching PostHog provider data: ' + String(error),
      { adapter: 'posthog-server' },
    );
    throw error;
  }
}

/**
 * Reset the singleton PostHog client - for testing only
 * @internal
 */
export function resetPostHogClient() {
  serverPostHogClient = null;
}
