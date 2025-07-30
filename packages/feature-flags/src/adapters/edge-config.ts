import { createClient, type EdgeConfigClient } from '@vercel/edge-config';

import { logError, logWarn } from '@repo/observability';
import type { Adapter } from 'flags';
import { safeEnv } from '../../env';

/**
 * Configuration options for Edge Config adapter
 * @param connectionString - Edge Config connection string or client instance
 * @param options - Additional options for Edge Config adapter
 */
export interface EdgeConfigAdapterOptions {
  connectionString?: string | EdgeConfigClient;
  options?: {
    edgeConfigItemKey?: string;
    teamSlug?: string;
  };
}

/**
 * Create an Edge Config adapter for feature flags
 * The adapter assumes your Edge Config contains a `flags` object (or custom key)
 * with each flag key corresponding to a flag you define in code
 * @param options - Configuration options for the adapter
 * @returns Edge Config adapter function
 * @example
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
    logWarn('Edge Config connection string not configured - using offline fallback mode', {
      adapter: 'edge-config',
      mode: 'offline-fallback',
    });
    // Return an offline-compatible adapter with local fallbacks
    return function edgeConfigAdapter<T = any, E = any>(): Adapter<T, E> {
      return {
        decide: async ({ key, entities }) => {
          // Offline fallback: use environment variables or default values
          const envValue = process.env[`FLAG_${key.toUpperCase().replace(/-/g, '_')}`];
          if (envValue !== undefined) {
            // Parse boolean, number, or keep as string
            if (envValue === 'true') return true as T;
            if (envValue === 'false') return false as T;
            if (!isNaN(Number(envValue))) return Number(envValue) as T;
            return envValue as T;
          }

          // Fallback to deterministic local evaluation
          const contextEntity = entities as any;
          const context = contextEntity?.user?.id || contextEntity?.visitor?.id || 'anonymous';
          const hash = (key + context).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

          // Return boolean by default for offline mode
          return (hash % 2 === 0) as T;
        },
        config: { reportValue: true },
        origin: { provider: 'edge-config-offline' },
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
            error instanceof Error
              ? error
              : new Error('Error reading from Edge Config: ' + String(error)),
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
 * Automatically configured from EDGE_CONFIG environment variable
 * Falls back to offline mode if not configured
 */
export const edgeConfigAdapter = createEdgeConfigAdapter();

/**
 * Get all flags from Edge Config for discovery endpoint
 * @param options - Configuration options for Edge Config connection
 * @returns Promise with provider data and flags array
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
      error instanceof Error
        ? error
        : new Error('Error fetching Edge Config provider data: ' + String(error)),
      { adapter: 'edge-config' },
    );
    throw error;
  }
}
