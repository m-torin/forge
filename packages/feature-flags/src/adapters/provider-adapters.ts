/**
 * Modern adapter implementations using official @flags-sdk packages
 * This replaces our custom adapter implementations with standard ones
 */

// TODO: Replace with actual SDK packages when available
// For now, using our existing adapters with modern interface
import { logInfo, logWarn } from '@repo/observability';
import { safeEnv } from '../../env';
import { edgeConfigAdapter as legacyEdgeConfigAdapter } from './edge-config';
import { postHogServerAdapter } from './posthog-server';

/**
 * Create PostHog adapter with proper configuration
 */
export function createPostHogAdapter() {
  const env = safeEnv();

  if (!env.POSTHOG_KEY) {
    logWarn('PostHog key not configured - adapter will use offline fallback', {
      adapter: 'posthog',
      mode: 'offline-fallback',
    });
  }

  logInfo('PostHog adapter configured', {
    hasKey: !!env.POSTHOG_KEY,
    host: env.POSTHOG_HOST || 'https://app.posthog.com',
  });

  return postHogServerAdapter;
}

/**
 * Create Edge Config adapter with proper configuration
 */
export function createEdgeConfigAdapter() {
  const env = safeEnv();

  if (!env.EDGE_CONFIG) {
    logWarn('Edge Config connection string not configured - adapter will use offline fallback', {
      adapter: 'edge-config',
      mode: 'offline-fallback',
    });
  }

  logInfo('Edge Config adapter configured', {
    hasConnection: !!env.EDGE_CONFIG,
  });

  return legacyEdgeConfigAdapter;
}

// Export pre-configured adapter instances
export const modernPostHogAdapter = createPostHogAdapter();
export const modernEdgeConfigAdapter = createEdgeConfigAdapter();

/**
 * Adapter compatibility layer for our unified system
 * Maps modern adapters to our transparent fallback system
 */
export function createAdapterChain(options: {
  primary: 'posthog' | 'edge-config' | 'custom';
  secondary?: 'posthog' | 'edge-config' | 'custom';
  customPrimary?: () => any;
  customSecondary?: () => any;
}) {
  const { primary, secondary, customPrimary, customSecondary } = options;

  const getAdapter = (type: string, customAdapter?: () => any) => {
    switch (type) {
      case 'posthog':
        return () => modernPostHogAdapter.isFeatureEnabled;
      case 'edge-config':
        return () => modernEdgeConfigAdapter;
      case 'custom':
        return customAdapter;
      default:
        throw new Error(`Unknown adapter type: ${type}`);
    }
  };

  return {
    primary: getAdapter(primary, customPrimary),
    secondary: secondary ? getAdapter(secondary, customSecondary) : undefined,
  };
}

/**
 * Helper for creating PostHog variant flags
 */
export function createPostHogVariantAdapter() {
  return () => modernPostHogAdapter.featureFlagValue;
}

/**
 * Helper for creating PostHog payload flags
 */
export function createPostHogPayloadAdapter<T>(_transform?: (payload: any) => T) {
  return () => modernPostHogAdapter.featureFlagPayload;
}

/**
 * Migration helper: Convert old custom adapters to modern ones
 * This helps transition from our custom implementations
 */
export function migrateAdapter(adapterType: string): (() => any) | undefined {
  switch (adapterType) {
    case 'postHogServerAdapter.isFeatureEnabled':
      logInfo('Migrating custom PostHog adapter to modern interface');
      return () => modernPostHogAdapter.isFeatureEnabled;

    case 'postHogServerAdapter.featureFlagValue':
      logInfo('Migrating custom PostHog variant adapter to modern interface');
      return () => modernPostHogAdapter.featureFlagValue;

    case 'postHogServerAdapter.featureFlagPayload':
      logInfo('Migrating custom PostHog payload adapter to modern interface');
      return () => modernPostHogAdapter.featureFlagPayload;

    case 'edgeConfigAdapter':
      logInfo('Migrating custom Edge Config adapter to modern interface');
      return () => modernEdgeConfigAdapter;

    default:
      logWarn(`Unknown adapter type for migration: ${adapterType}`);
      return undefined;
  }
}

/**
 * Validate adapter configuration
 */
export function validateAdapterConfig(): {
  posthog: { available: boolean; reason?: string };
  edgeConfig: { available: boolean; reason?: string };
} {
  const env = safeEnv();

  return {
    posthog: {
      available: !!env.POSTHOG_KEY,
      reason: !env.POSTHOG_KEY ? 'POSTHOG_KEY not configured' : undefined,
    },
    edgeConfig: {
      available: !!env.EDGE_CONFIG,
      reason: !env.EDGE_CONFIG ? 'EDGE_CONFIG not configured' : undefined,
    },
  };
}
