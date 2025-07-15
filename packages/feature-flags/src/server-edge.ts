/**
 * Server-side Edge Runtime feature flags exports
 * Edge-compatible utilities for Next.js middleware and edge functions
 *
 * @example
 * ```typescript
 * import {
 *   createPostHogEdgeAdapter,
 *   createEdgeConfigAdapter,
 *   getPostHogProviderData
 * } from '@repo/feature-flags/server/edge';
 *
 * // Use adapters in edge runtime (middleware, edge functions)
 * const postHog = createPostHogEdgeAdapter({ postHogKey: 'xxx' });
 * const edgeConfig = createEdgeConfigAdapter({ connectionString: 'yyy' });
 * ```
 */

import { logError, logWarn } from '@repo/observability/server/edge';
import type { Adapter } from '@vercel/flags';
import { safeEnv } from '../env';

// Re-export Edge Config adapter (already edge-compatible)
export {
  createEdgeConfigAdapter,
  edgeConfigAdapter,
  getEdgeConfigProviderData,
} from './adapters/edge-config';

export type { EdgeConfigAdapterOptions } from './adapters/edge-config';

// Edge-compatible PostHog adapter using fetch API
export interface PostHogEdgeAdapterOptions {
  postHogKey?: string;
  postHogHost?: string;
}

export interface PostHogEdgeAdapter {
  featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E>;
  featureFlagValue<E = any>(): Adapter<boolean | string, E>;
  isFeatureEnabled<E = any>(): Adapter<boolean, E>;
}

/**
 * Create an edge-compatible PostHog adapter for feature flags
 * Uses fetch API instead of posthog-node for edge runtime compatibility
 */
export function createPostHogEdgeAdapter(
  options: PostHogEdgeAdapterOptions = {},
): PostHogEdgeAdapter {
  const env = safeEnv();
  const postHogKey = options.postHogKey || env.POSTHOG_KEY;
  const postHogHost = options.postHogHost || env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!postHogKey) {
    logWarn('PostHog API key not configured - feature flags will return false', {
      provider: 'posthog-edge',
    });
    // Return a no-op adapter that returns false for all flags
    return {
      isFeatureEnabled: () => ({
        decide: async () => false,
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      }),
      featureFlagValue: () => ({
        decide: async () => false,
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      }),
      featureFlagPayload: () => ({
        decide: async () => ({}) as any,
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      }),
    };
  }

  return {
    isFeatureEnabled<E = any>(): Adapter<boolean, E> {
      return {
        decide: async ({ entities, key }) => {
          try {
            const userId = (entities as any)?.user?.id || 'anonymous';

            const response = await fetch(`${postHogHost}/decide/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${postHogKey}`,
              },
              body: JSON.stringify({
                api_key: postHogKey,
                distinct_id: userId,
                person_properties: (entities as any)?.user || {},
              }),
            });

            if (!response.ok) {
              logWarn('PostHog API error', { status: response.status, provider: 'posthog-edge' });
              return false;
            }

            const data = await response.json();
            return Boolean(data.featureFlags?.[key]);
          } catch (error) {
            logError(
              'PostHog edge adapter error',
              error instanceof Error ? error : new Error(String(error)),
            );
            return false;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      };
    },

    featureFlagValue<E = any>(): Adapter<boolean | string, E> {
      return {
        decide: async ({ entities, key }) => {
          try {
            const userId = (entities as any)?.user?.id || 'anonymous';

            const response = await fetch(`${postHogHost}/decide/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${postHogKey}`,
              },
              body: JSON.stringify({
                api_key: postHogKey,
                distinct_id: userId,
                person_properties: (entities as any)?.user || {},
              }),
            });

            if (!response.ok) {
              logWarn('PostHog API error', { status: response.status, provider: 'posthog-edge' });
              return false;
            }

            const data = await response.json();
            const value = data.featureFlags?.[key];
            return value !== undefined ? value : false;
          } catch (error) {
            logError(
              'PostHog edge adapter error',
              error instanceof Error ? error : new Error(String(error)),
            );
            return false;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      };
    },

    featureFlagPayload<T = any, E = any>(transform?: (value: any) => T): Adapter<T, E> {
      return {
        decide: async ({ entities, key }) => {
          try {
            const userId = (entities as any)?.user?.id || 'anonymous';
            const defaultPayload = {} as T;

            const response = await fetch(`${postHogHost}/decide/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${postHogKey}`,
              },
              body: JSON.stringify({
                api_key: postHogKey,
                distinct_id: userId,
                person_properties: (entities as any)?.user || {},
              }),
            });

            if (!response.ok) {
              logWarn('PostHog API error', { status: response.status, provider: 'posthog-edge' });
              return defaultPayload;
            }

            const data = await response.json();
            const payload = data.featureFlagPayloads?.[key];

            if (payload && transform) {
              return transform(payload);
            }
            return (payload as T) || defaultPayload;
          } catch (error) {
            logError(
              'PostHog edge adapter error',
              error instanceof Error ? error : new Error(String(error)),
            );
            return {} as T;
          }
        },
        config: { reportValue: true },
        origin: { provider: 'posthog-edge' },
      };
    },
  };
}

/**
 * Default edge-compatible PostHog adapter using environment variables
 * This will be a no-op adapter if POSTHOG_KEY is not configured
 */
export const postHogEdgeAdapter = createPostHogEdgeAdapter();

/**
 * Get provider data for flags discovery endpoint (edge-compatible)
 * Uses fetch API instead of Node.js libraries
 */
export async function getPostHogProviderData(options: {
  personalApiKey?: string;
  projectId?: string;
  postHogHost?: string;
}) {
  const env = safeEnv();
  const personalApiKey = options.personalApiKey || env.POSTHOG_PERSONAL_API_KEY;
  const projectId = options.projectId || env.POSTHOG_PROJECT_ID;
  const postHogHost = options.postHogHost || env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!personalApiKey || !projectId) {
    logWarn('PostHog personal API key and project ID not configured - returning empty flags', {
      provider: 'posthog-edge',
    });
    return {
      provider: 'posthog-edge',
      flags: [],
    };
  }

  try {
    const response = await fetch(`${postHogHost}/api/projects/${projectId}/feature_flags/`, {
      headers: {
        Authorization: `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      logWarn('PostHog API error', { status: response.status, provider: 'posthog-edge' });
      return {
        provider: 'posthog-edge',
        flags: [],
      };
    }

    const data = await response.json();
    const flags = data.results || [];

    // Transform PostHog flags to Vercel Flags format
    const transformedFlags = flags.map((flag: any) => ({
      key: flag.key,
      options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false },
      ],
    }));

    return {
      provider: 'posthog-edge',
      flags: transformedFlags,
    };
  } catch (error) {
    logError(
      'Error fetching PostHog provider data',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
