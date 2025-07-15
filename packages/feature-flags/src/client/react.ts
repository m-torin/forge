/**
 * React Integration for Feature Flags v4
 * Client-side hooks and components for React applications
 */

import { logInfo, logWarn } from '@repo/observability';
import { useCallback, useEffect, useState } from 'react';
import type { FlagContext, FlagDefinition, FlagValuesType } from '../shared/types';

/**
 * Client-side flag cache for performance
 */
const flagCache = new Map<string, { value: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Hook for evaluating a single flag in React components
 * Provides client-side flag evaluation with caching and updates
 *
 * @param flagKey - The flag key to evaluate
 * @param defaultValue - Default value if flag cannot be evaluated
 * @param context - Evaluation context (user, device, etc.)
 * @param options - Additional options for flag evaluation
 * @returns Object with flag value, loading state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { value: showBanner, loading, error } = useFlag('show-banner', false, {
 *     user: { id: 'user_123' }
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading flag</div>;
 *
 *   return showBanner ? <Banner /> : null;
 * }
 * ```
 */
export function useFlag<T = any>(
  flagKey: string,
  defaultValue: T,
  context: FlagContext = {},
  options: {
    /** Disable caching for this flag */
    disableCache?: boolean;
    /** Custom cache TTL in milliseconds */
    cacheTtl?: number;
    /** Refetch interval in milliseconds */
    refetchInterval?: number;
  } = {},
): {
  value: T;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { disableCache = false, cacheTtl = CACHE_TTL, refetchInterval } = options;

  const evaluateFlag = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless disabled)
      if (!disableCache) {
        const cached = flagCache.get(flagKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          setValue(cached.value);
          setLoading(false);
          return;
        }
      }

      // Client-side evaluation
      const evaluatedValue = await evaluateFlagClientSide(flagKey, context, defaultValue);

      // Cache the result
      if (!disableCache) {
        flagCache.set(flagKey, {
          value: evaluatedValue,
          timestamp: Date.now(),
          ttl: cacheTtl,
        });
      }

      setValue(evaluatedValue);

      logInfo('Flag evaluated via useFlag hook', {
        flagKey,
        value: evaluatedValue,
        cached: false,
        context: Object.keys(context),
      });
    } catch (err) {
      const flagError = err instanceof Error ? err : new Error('Flag evaluation failed');
      setError(flagError);
      setValue(defaultValue);

      logWarn('Flag evaluation failed in useFlag', {
        flagKey,
        error: flagError.message,
        fallbackValue: defaultValue,
      });
    } finally {
      setLoading(false);
    }
  }, [flagKey, context, defaultValue, disableCache, cacheTtl]);

  // Initial evaluation
  useEffect(() => {
    evaluateFlag();
  }, [evaluateFlag]);

  // Optional refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(evaluateFlag, refetchInterval);
    return () => clearInterval(interval);
  }, [evaluateFlag, refetchInterval]);

  return {
    value,
    loading,
    error,
    refetch: evaluateFlag,
  };
}

/**
 * Simplified hook for getting flag values without loading states
 * Best for cases where you just need the value and can accept defaults
 *
 * @param flagKey - The flag key to evaluate
 * @param defaultValue - Default value if flag cannot be evaluated
 * @param context - Evaluation context
 * @returns The flag value (defaultValue if evaluation fails)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const maxItems = useFlagValue('max-items', 10);
 *   const theme = useFlagValue('ui-theme', 'light', { user: { id: userId } });
 *
 *   return <ItemList maxItems={maxItems} theme={theme} />;
 * }
 * ```
 */
export function useFlagValue<T = any>(
  flagKey: string,
  defaultValue: T,
  context: FlagContext = {},
): T {
  const { value } = useFlag(flagKey, defaultValue, context);
  return value;
}

/**
 * Hook for managing multiple flags at once
 * Efficient for components that need several flags
 *
 * @param flagKeys - Array of flag keys to evaluate
 * @param defaultValues - Object with default values for each flag
 * @param context - Shared evaluation context
 * @returns Object with flag values, loading state, and error
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { values, loading, error } = useFlags(
 *     ['show-stats', 'enable-dark-mode', 'max-widgets'],
 *     { 'show-stats': true, 'enable-dark-mode': false, 'max-widgets': 5 }
 *   );
 *
 *   if (loading) return <Spinner />;
 *
 *   return (
 *     <div className={values['enable-dark-mode'] ? 'dark' : 'light'}>
 *       {values['show-stats'] && <StatsWidget />}
 *       <WidgetGrid maxWidgets={values['max-widgets']} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useFlags(
  flagKeys: string[],
  defaultValues: Record<string, any> = {},
  context: FlagContext = {},
): {
  values: Record<string, any>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const evaluateFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results: Record<string, any> = {};

      // Evaluate each flag
      await Promise.all(
        flagKeys.map(async flagKey => {
          try {
            const defaultValue = defaultValues[flagKey];
            const value = await evaluateFlagClientSide(flagKey, context, defaultValue);
            results[flagKey] = value;
          } catch (err) {
            logWarn('Individual flag evaluation failed in useFlags', {
              flagKey,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            results[flagKey] = defaultValues[flagKey];
          }
        }),
      );

      setValues(results);

      logInfo('Multiple flags evaluated via useFlags hook', {
        flagCount: flagKeys.length,
        evaluatedKeys: Object.keys(results),
      });
    } catch (err) {
      const flagsError = err instanceof Error ? err : new Error('Flags evaluation failed');
      setError(flagsError);
      setValues(defaultValues);
    } finally {
      setLoading(false);
    }
  }, [flagKeys, defaultValues, context]);

  useEffect(() => {
    evaluateFlags();
  }, [evaluateFlags]);

  return {
    values,
    loading,
    error,
    refetch: evaluateFlags,
  };
}

/**
 * Client-side flag evaluation logic
 * Handles evaluation without server dependencies
 */
async function evaluateFlagClientSide<T>(
  flagKey: string,
  context: FlagContext,
  defaultValue: T,
): Promise<T> {
  try {
    // In a real implementation, this would:
    // 1. Look up the flag definition from local storage or embedded data
    // 2. Apply the flag's decision logic with the provided context
    // 3. Handle adapter-based evaluation for client-compatible providers

    // For now, we'll simulate client-side evaluation
    logInfo('Evaluating flag client-side', { flagKey, context });

    // Check if we have any client-side flag definitions
    const clientFlags = getClientSideFlagDefinitions();
    const flagDef = clientFlags[flagKey];

    if (flagDef && flagDef.decide) {
      // Evaluate using the flag's decide function
      const result = await flagDef.decide(context);
      return result as T;
    }

    // Check for locally stored flag values (from SSR or previous evaluations)
    const storedValues = getStoredFlagValues();
    if (storedValues && flagKey in storedValues) {
      return storedValues[flagKey] as T;
    }

    // Fallback to simple rules based on context
    return evaluateWithSimpleRules(flagKey, context, defaultValue);
  } catch (error) {
    logWarn('Client-side flag evaluation failed', {
      flagKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return defaultValue;
  }
}

/**
 * Get client-side flag definitions (from window object or embedded data)
 */
function getClientSideFlagDefinitions(): Record<string, FlagDefinition> {
  try {
    // Try to get definitions from global window object (set by SSR)
    if (typeof window !== 'undefined' && (window as any).__FEATURE_FLAGS__) {
      return (window as any).__FEATURE_FLAGS__;
    }

    // Try to get from localStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('feature-flags-definitions');
      if (stored) {
        return JSON.parse(stored);
      }
    }

    return {};
  } catch (error) {
    logWarn('Failed to get client-side flag definitions', { error });
    return {};
  }
}

/**
 * Get stored flag values (from SSR or previous server evaluations)
 */
function getStoredFlagValues(): FlagValuesType | null {
  try {
    // Try to get values from global window object
    if (typeof window !== 'undefined' && (window as any).__FEATURE_FLAG_VALUES__) {
      return (window as any).__FEATURE_FLAG_VALUES__;
    }

    // Try to get from localStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('feature-flags-values');
      if (stored) {
        return JSON.parse(stored);
      }
    }

    return null;
  } catch (error) {
    logWarn('Failed to get stored flag values', { error });
    return null;
  }
}

/**
 * Simple rule-based evaluation for common flag patterns
 */
function evaluateWithSimpleRules<T>(flagKey: string, context: FlagContext, defaultValue: T): T {
  // Percentage-based flags (common pattern)
  if (flagKey.includes('percent') || flagKey.includes('rollout')) {
    const userId = context.user?.id || 'anonymous';
    const hash = simpleHash(userId + flagKey);
    const percentage = hash % 100;

    // Assume 50% rollout for rollout flags
    if (typeof defaultValue === 'boolean') {
      return (percentage < 50) as T;
    }
  }

  // Geographic flags
  if (flagKey.includes('geo') && context.geo?.country) {
    const country = context.geo.country.toLowerCase();
    if (flagKey.includes('us') && country === 'us') {
      return (typeof defaultValue === 'boolean' ? true : 'us-variant') as T;
    }
  }

  // Device-based flags
  if (flagKey.includes('mobile') && context.device?.type) {
    if (context.device.type === 'mobile') {
      return (typeof defaultValue === 'boolean' ? true : 'mobile-variant') as T;
    }
  }

  // Default fallback
  return defaultValue;
}

/**
 * Simple hash function for consistent percentage-based evaluation
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Utility function to clear flag cache (useful for testing)
 */
export function clearFlagCache(): void {
  flagCache.clear();
  logInfo('Flag cache cleared');
}

/**
 * Utility function to set flag values in browser storage
 * Useful for SSR hydration or testing
 */
export function setClientFlagValues(values: FlagValuesType): void {
  try {
    if (typeof window !== 'undefined') {
      (window as any).__FEATURE_FLAG_VALUES__ = values;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('feature-flags-values', JSON.stringify(values));
    }

    // Clear cache to force re-evaluation with new values
    clearFlagCache();

    logInfo('Client flag values updated', {
      valueCount: Object.keys(values).length,
    });
  } catch (error) {
    logWarn('Failed to set client flag values', { error });
  }
}
