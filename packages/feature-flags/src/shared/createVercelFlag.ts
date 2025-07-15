import { logError, logInfo, logWarn } from '@repo/observability';
import { dedupe, flag } from 'flags/next';
import { safeEnv } from '../../env';
import {
  checkEnvironmentOverride,
  createDeterministicHash,
  extractRequestContext,
  extractUserContext,
  getOfflineRolloutPercentage,
  getOfflineVariant,
  getTimeBasedFlag,
} from './context-extraction';

import type { CookieStore, HeaderStore } from './types';

// Import analytics functions (avoid circular dependency)
let trackFlagEvaluationImport: typeof import('../server/analytics').trackFlagEvaluation | undefined;

// Lazy load analytics to avoid circular dependency
async function trackFlagEvaluationAsync<T>(
  key: string,
  value: T,
  context: UnifiedContext,
  source: 'primary' | 'secondary' | 'offline',
): Promise<void> {
  try {
    if (!trackFlagEvaluationImport) {
      // Dynamic import to avoid circular dependency
      const analyticsModule = await import('../server/analytics');
      trackFlagEvaluationImport = analyticsModule.trackFlagEvaluation;
    }

    if (trackFlagEvaluationImport) {
      await trackFlagEvaluationImport(key, value, {
        userId: context.user.id,
        sessionId: context.user.sessionId,
        country: context.request.country,
        environment: context.request.environment,
        source,
        tier: context.user.tier,
        visitorId: context.visitor.id,
      });
    }
  } catch (error) {
    // Silently fail analytics tracking to not affect flag evaluation
    logInfo('Analytics tracking failed (non-critical)', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Adapter priority chain for transparent fallback
export type AdapterChain<T = any> = {
  primary?: () => any;
  secondary?: () => any;
  offline: OfflineFallbackConfig<T>;
};

// Offline fallback configuration
export type OfflineFallbackConfig<T = any> = {
  type: 'boolean' | 'variant' | 'percentage' | 'custom' | 'time-based';
  variants?: T[];
  percentage?: number;
  customLogic?: (context: UnifiedContext) => T;
  schedule?: {
    start?: Date | string;
    end?: Date | string;
    days?: number[];
    hours?: number[];
  };
};

// Unified context that works for all scenarios
export interface UnifiedContext {
  user: {
    id: string;
    tier?: string;
    sessionId: string;
  };
  visitor: {
    id: string;
  };
  request: {
    country: string;
    userAgent: string;
    environment: string;
    deployment: string;
  };
  timestamp: number;
}

// Flag options with transparent fallback (using modern FlagDefinition)
export interface VercelFlagOptions<T = any> {
  key: string;
  description?: string;
  adapters: AdapterChain<T>;
  defaultValue?: T;
  options?: Array<{ label: string; value: T }>;
}

/**
 * Extract unified context from Next.js request using dedupe for performance
 */
export const extractUnifiedContext = dedupe(
  async ({
    cookies,
    headers,
  }: {
    cookies: CookieStore;
    headers: HeaderStore;
  }): Promise<UnifiedContext> => {
    const userContext = extractUserContext(cookies);
    const requestContext = extractRequestContext(headers);

    // Determine user tier from context clues
    let userTier = 'free';
    if (userContext.userId.includes('pro') || cookies.get('subscription')?.value === 'pro') {
      userTier = 'pro';
    }
    if (
      userContext.userId.includes('premium') ||
      cookies.get('subscription')?.value === 'premium'
    ) {
      userTier = 'premium';
    }

    return {
      user: {
        id: userContext.userId,
        tier: userTier,
        sessionId: userContext.sessionId,
      },
      visitor: {
        id: userContext.visitorId,
      },
      request: requestContext,
      timestamp: Date.now(),
    };
  },
);

/**
 * Create intelligent adapter with transparent online/offline fallback
 */
function createIntelligentAdapter<T>(
  key: string,
  adapters: AdapterChain<T>,
): import('flags').Adapter<T, UnifiedContext> {
  return {
    decide: async ({ entities, ...context }) => {
      let result: T | undefined;
      let source: 'primary' | 'secondary' | 'offline' = 'offline';

      // Try primary adapter first
      if (adapters.primary) {
        try {
          const primaryAdapter = adapters.primary();
          const primaryResult = await primaryAdapter.decide({ entities, ...context });
          if (primaryResult !== undefined && primaryResult !== null) {
            result = primaryResult;
            source = 'primary';
          }
        } catch (error) {
          logWarn('Primary adapter failed, falling back to secondary', {
            key,
            error: error instanceof Error ? error.message : String(error),
            adapter: 'primary',
          });
        }
      }

      // Try secondary adapter if primary failed
      if (result === undefined && adapters.secondary) {
        try {
          const secondaryAdapter = adapters.secondary();
          const secondaryResult = await secondaryAdapter.decide({ entities, ...context });
          if (secondaryResult !== undefined && secondaryResult !== null) {
            result = secondaryResult;
            source = 'secondary';
          }
        } catch (error) {
          logWarn('Secondary adapter failed, falling back to offline', {
            key,
            error: error instanceof Error ? error.message : String(error),
            adapter: 'secondary',
          });
        }
      }

      // Fallback to offline logic
      if (result === undefined) {
        result = executeOfflineFallback(key, adapters.offline, entities as UnifiedContext);
        source = 'offline';
      }

      // Track flag evaluation with analytics (async, non-blocking)
      try {
        await trackFlagEvaluationAsync(key, result, entities as UnifiedContext, source);
      } catch (error) {
        logWarn('Analytics tracking failed', {
          key,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return result;
    },
    config: { reportValue: true },
    origin: { provider: 'intelligent-chain' },
  };
}

/**
 * Execute offline fallback logic
 */
function executeOfflineFallback<T>(
  key: string,
  config: OfflineFallbackConfig<T>,
  context: UnifiedContext,
): T {
  try {
    // Check environment override first
    const envOverride = checkEnvironmentOverride(key);
    if (envOverride !== undefined) {
      return envOverride as T;
    }

    const contextString = context.user.id + context.visitor.id;

    switch (config.type) {
      case 'boolean':
        return getOfflineRolloutPercentage(key, contextString, config.percentage || 50) as T;

      case 'variant':
        if (!config.variants || config.variants.length === 0) {
          throw new Error('Variants must be provided for variant type');
        }
        return getOfflineVariant(key, contextString, config.variants);

      case 'percentage':
        return getOfflineRolloutPercentage(key, contextString, config.percentage || 0) as T;

      case 'time-based':
        if (!config.schedule) {
          throw new Error('Schedule must be provided for time-based type');
        }
        return getTimeBasedFlag(key, config.schedule) as T;

      case 'custom':
        if (!config.customLogic) {
          throw new Error('Custom logic must be provided for custom type');
        }
        return config.customLogic(context);

      default:
        // Default boolean fallback
        return (createDeterministicHash(key + contextString) % 2 === 0) as T;
    }
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Offline fallback failed: ' + String(error)),
      { key, fallbackType: config.type },
    );

    // Ultimate fallback - return safe default
    if (config.variants && config.variants.length > 0) {
      return config.variants[0];
    }
    return false as T;
  }
}

/**
 * Create a unified Vercel flag with transparent online/offline operation
 *
 * @example
 * ```typescript
 * export const myFlag = createVercelFlag({
 *   key: 'my-feature',
 *   description: 'My awesome feature',
 *   adapters: {
 *     primary: () => postHogServerAdapter.isFeatureEnabled(),
 *     secondary: () => edgeConfigAdapter(),
 *     offline: { type: 'percentage', percentage: 25 }
 *   },
 *   options: [
 *     { label: 'Enabled', value: true },
 *     { label: 'Disabled', value: false }
 *   ]
 * });
 * ```
 */
export function createVercelFlag<T = boolean>(options: VercelFlagOptions<T>) {
  const { adapters, description, defaultValue, options: flagOptions, key } = options;

  return flag<T>({
    key,
    description,
    defaultValue,
    options: flagOptions as any,
    adapter: createIntelligentAdapter(key, adapters),
    // Identify function that extracts unified context using dedupe
    identify: async ({ cookies, headers }) => {
      try {
        return await extractUnifiedContext({ cookies, headers });
      } catch (error) {
        logWarn('Context extraction failed, using minimal context', {
          key,
          error: error instanceof Error ? error.message : String(error),
        });

        // Minimal fallback context
        return {
          user: {
            id: cookies?.get('user-id')?.value || 'anonymous',
            sessionId: 'session-' + Date.now().toString(36),
          },
          visitor: {
            id: cookies?.get('visitor-id')?.value || 'visitor-' + Date.now().toString(36),
          },
          request: {
            country: headers?.get('x-country') || 'US',
            userAgent: headers?.get('user-agent') || 'unknown',
            environment: safeEnv().NODE_ENV || 'development',
            deployment: process.env.DEPLOYMENT_ID || 'local', // DEPLOYMENT_ID not in env schema
          },
          timestamp: Date.now(),
        };
      }
    },
  });
}

// Convenience functions for common patterns
export const createBooleanFlag = (
  key: string,
  options: {
    description?: string;
    primaryAdapter?: () => import('flags').Adapter<boolean, UnifiedContext>;
    secondaryAdapter?: () => import('flags').Adapter<boolean, UnifiedContext>;
    percentage?: number;
  },
) =>
  createVercelFlag({
    key,
    description: options.description,
    adapters: {
      primary: options.primaryAdapter,
      secondary: options.secondaryAdapter,
      offline: { type: 'percentage', percentage: options.percentage || 50 },
    },
    options: [
      { label: 'Enabled', value: true },
      { label: 'Disabled', value: false },
    ],
  });

export const createVariantFlag = <T>(
  key: string,
  variants: { label: string; value: T }[],
  options: {
    description?: string;
    primaryAdapter?: () => import('flags').Adapter<T, UnifiedContext>;
    secondaryAdapter?: () => import('flags').Adapter<T, UnifiedContext>;
  },
) =>
  createVercelFlag({
    key,
    description: options.description,
    adapters: {
      primary: options.primaryAdapter,
      secondary: options.secondaryAdapter,
      offline: { type: 'variant', variants: variants.map(v => v.value) },
    },
    options: variants,
  });

export const createRolloutFlag = (
  key: string,
  percentage: number,
  options: {
    description?: string;
    primaryAdapter?: () => import('flags').Adapter<boolean, UnifiedContext>;
    secondaryAdapter?: () => import('flags').Adapter<boolean, UnifiedContext>;
  },
) =>
  createVercelFlag({
    key,
    description: options.description,
    adapters: {
      primary: options.primaryAdapter,
      secondary: options.secondaryAdapter,
      offline: { type: 'percentage', percentage },
    },
    options: [
      { label: 'Enabled', value: true },
      { label: 'Disabled', value: false },
    ],
  });
