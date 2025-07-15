import { createClient, type EdgeConfigClient } from '@vercel/edge-config';

import { logError, logWarn } from '@repo/observability/server/edge';
import type { Adapter } from '@vercel/flags';
import { safeEnv } from '../../env';

export interface EdgeConfigAdapterOptions {
  connectionString?: string | EdgeConfigClient;
  options?: {
    edgeConfigItemKey?: string;
    teamSlug?: string;
  };
}

/**
 * Create an Edge Config adapter for feature flags
 *
 * The adapter assumes your Edge Config contains a `flags` object (or custom key)
 * with each flag key corresponding to a flag you define in code.
 *
 * Example Edge Config structure:
 * ```json
 * {
 *   "flags": {
 *     "example-flag": true,
 *     "another-flag": "variant-a"
 *   }
 * }
 * ```
 */
export function createEdgeConfigAdapter(options: EdgeConfigAdapterOptions = {}) {
  const env = safeEnv();
  const connectionString = options.connectionString || env.EDGE_CONFIG;
  const edgeConfigItemKey = options.options?.edgeConfigItemKey || 'flags';
  const teamSlug = options.options?.teamSlug;

  if (!connectionString) {
    logWarn('Edge Config connection string not configured - feature flags will return undefined', {
      adapter: 'edge-config',
    });
    // Return a no-op adapter that returns undefined for all flags
    return function edgeConfigAdapter<T = any, E = any>(): Adapter<T, E> {
      return {
        decide: async () => undefined as any,
        config: { reportValue: true },
        origin: { provider: 'edge-config' },
      };
    };
  }

  // Create or use provided Edge Config client
  const client =
    typeof connectionString === 'string' ? createClient(connectionString) : connectionString;

  return function edgeConfigAdapter<T = any, E = any>(): Adapter<T, E> {
    return {
      decide: async ({ key }) => {
        try {
          // Get the flags object from Edge Config
          const flags = (await client.get(edgeConfigItemKey)) as Record<string, any>;

          if (!flags || typeof flags !== 'object') {
            logWarn(`Edge Config key not found or is not an object`, {
              key: edgeConfigItemKey,
              adapter: 'edge-config',
            });
            return undefined as any;
          }

          // Return the specific flag value
          const value = flags[key];

          if (value === undefined) {
            logWarn(`Flag not found in Edge Config`, {
              flag: key,
              path: `${edgeConfigItemKey}.${key}`,
              adapter: 'edge-config',
            });
          }

          return value as T;
        } catch (error) {
          logError(
            'Error reading from Edge Config',
            error instanceof Error ? error : new Error(String(error)),
            { adapter: 'edge-config' },
          );
          throw error;
        }
      },
      config: { reportValue: true },
      origin: {
        provider: 'edge-config',
        edgeConfigId:
          typeof connectionString === 'string'
            ? connectionString.split('/').pop() || ''
            : 'custom-client',
        edgeConfigItemKey,
        ...(teamSlug && { teamSlug }),
      },
    };
  };
}

/**
 * Default Edge Config adapter using environment variables
 * This will be a no-op adapter if EDGE_CONFIG is not configured
 *
 * Expects:
 * - EDGE_CONFIG environment variable with connection string
 * - Edge Config contains a `flags` object with flag values
 */
export const edgeConfigAdapter = createEdgeConfigAdapter();

/**
 * Get all flags from Edge Config for discovery endpoint
 */
export async function getEdgeConfigProviderData(options: EdgeConfigAdapterOptions = {}) {
  const env = safeEnv();
  const connectionString = options.connectionString || env.EDGE_CONFIG;
  const edgeConfigItemKey = options.options?.edgeConfigItemKey || 'flags';

  if (!connectionString) {
    logWarn('Edge Config connection string not configured - returning empty flags', {
      adapter: 'edge-config',
    });
    return {
      provider: 'edge-config',
      flags: [],
    };
  }

  const client =
    typeof connectionString === 'string' ? createClient(connectionString) : connectionString;

  try {
    const flags = (await client.get(edgeConfigItemKey)) as Record<string, any>;

    if (!flags || typeof flags !== 'object') {
      return {
        provider: 'edge-config',
        flags: [],
      };
    }

    // Transform Edge Config flags to Vercel Flags format
    const transformedFlags = Object.entries(flags).map(([key, value]) => {
      // Determine options based on value type
      let options;

      if (typeof value === 'boolean') {
        options = [
          { label: 'Enabled', value: true },
          { label: 'Disabled', value: false },
        ];
      } else if (typeof value === 'string') {
        // For string values, create options based on common patterns
        options = [{ label: value, value }];

        // If it looks like a variant (e.g., 'variant-a', 'control', etc.)
        if (value.includes('variant') || value === 'control' || value === 'test') {
          options = [
            { label: 'Control', value: 'control' },
            { label: 'Variant A', value: 'variant-a' },
            { label: 'Variant B', value: 'variant-b' },
          ];
        }
      } else if (typeof value === 'object' && value !== null) {
        // For objects, stringify as the value
        options = [{ label: 'Custom Config', value }];
      } else {
        // For other types (number, etc.)
        options = [{ label: String(value), value }];
      }

      return {
        key,
        options,
      };
    });

    return {
      provider: 'edge-config',
      flags: transformedFlags,
    };
  } catch (error) {
    logError(
      'Error fetching Edge Config provider data',
      error instanceof Error ? error : new Error(String(error)),
      { adapter: 'edge-config' },
    );
    throw error;
  }
}
