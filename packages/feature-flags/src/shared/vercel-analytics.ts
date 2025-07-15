/**
 * Vercel Analytics Integration for Flags v4
 * Implements unstable_getFlagsProps() and unstable_setGlobalFlagsAnalyticsKeys()
 */

import { logInfo, logWarn } from '@repo/observability';
import { safeEnv } from '../../env';

/**
 * Global analytics keys storage
 * These keys are used by Vercel Analytics to track flag exposures
 */
let globalAnalyticsKeys: string[] = [];

/**
 * Set global flag analytics keys for Vercel Analytics integration
 * This function configures which flag keys should be tracked by analytics
 *
 * @param keys - Array of flag keys to track in analytics
 *
 * @example
 * ```typescript
 * import { unstable_setGlobalFlagsAnalyticsKeys } from '@repo/feature-flags';
 *
 * unstable_setGlobalFlagsAnalyticsKeys([
 *   'checkout-flow',
 *   'hero-banner',
 *   'payment-methods'
 * ]);
 * ```
 */
export function unstable_setGlobalFlagsAnalyticsKeys(keys: string[]): void {
  if (!Array.isArray(keys)) {
    logWarn('unstable_setGlobalFlagsAnalyticsKeys called with non-array', { keys });
    return;
  }

  const validKeys = keys.filter(key => {
    if (typeof key !== 'string' || key.length === 0) {
      logWarn('Skipping invalid analytics key', { key, type: typeof key });
      return false;
    }
    return true;
  });

  globalAnalyticsKeys = [...validKeys];

  logInfo('Global flag analytics keys updated', {
    keyCount: globalAnalyticsKeys.length,
    keys: globalAnalyticsKeys,
  });

  // Emit event for analytics systems to pick up
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const event = new CustomEvent('flags-analytics-keys-updated', {
      detail: { keys: globalAnalyticsKeys },
    });
    globalThis.dispatchEvent(event);
  }
}

/**
 * Get current global analytics keys
 * @returns Array of currently configured analytics keys
 */
export function getGlobalAnalyticsKeys(): string[] {
  return [...globalAnalyticsKeys];
}

/**
 * Retrieve flag properties formatted for Vercel Analytics
 * This function prepares flag data in the format expected by Vercel Analytics
 *
 * @param options - Configuration options for flag props retrieval
 * @returns Promise resolving to analytics-formatted flag properties
 *
 * @example
 * ```typescript
 * import { unstable_getFlagsProps } from '@repo/feature-flags';
 *
 * // In a Next.js page or component
 * const flagProps = await unstable_getFlagsProps({
 *   context: { userId: 'user_123' },
 *   includeMetadata: true
 * });
 *
 * // Use with Vercel Analytics
 * track('page_view', flagProps);
 * ```
 */
export async function unstable_getFlagsProps(
  options: {
    /**
     * User/request context for flag evaluation
     */
    context?: Record<string, any>;

    /**
     * Whether to include flag metadata in the response
     */
    includeMetadata?: boolean;

    /**
     * Specific flag keys to include (defaults to global analytics keys)
     */
    flagKeys?: string[];

    /**
     * Whether to include flag values or just keys
     */
    includeValues?: boolean;

    /**
     * Environment to filter flags for
     */
    environment?: string;
  } = {},
): Promise<Record<string, any>> {
  const {
    context = {},
    includeMetadata = true,
    flagKeys,
    includeValues = true,
    environment,
  } = options;

  const env = safeEnv();
  const targetKeys = flagKeys || globalAnalyticsKeys;

  if (targetKeys.length === 0) {
    logWarn('No analytics keys configured for unstable_getFlagsProps', {
      hasGlobalKeys: globalAnalyticsKeys.length > 0,
      providedKeys: flagKeys?.length || 0,
    });
    return {};
  }

  logInfo('Generating Vercel Analytics flag props', {
    keyCount: targetKeys.length,
    includeMetadata,
    includeValues,
    environment,
    contextKeys: Object.keys(context),
  });

  const flagProps: Record<string, any> = {};

  // Base analytics properties
  const baseProps = {
    timestamp: new Date().toISOString(),
    environment: environment || env.NODE_ENV || 'development',
    ...(includeMetadata && {
      sdkVersion: '4.0.1',
      analyticsVersion: 'v1',
      context: {
        userAgent: context.userAgent || 'unknown',
        userId: context.userId || context.user?.id || 'anonymous',
        sessionId: context.sessionId || 'unknown',
      },
    }),
  };

  // Add flag-specific properties
  for (const flagKey of targetKeys) {
    try {
      const flagData: Record<string, any> = {
        key: flagKey,
        tracked: true,
      };

      if (includeValues) {
        // In a real implementation, this would evaluate the actual flag
        // For now, we'll create a placeholder structure
        flagData.value = await evaluateFlagForAnalytics(flagKey, context);
        flagData.source = 'feature-flags-package';
      }

      if (includeMetadata) {
        flagData.evaluatedAt = new Date().toISOString();
        flagData.context = context;
      }

      flagProps[`flag_${flagKey.replace(/[^a-zA-Z0-9]/g, '_')}`] = flagData;
    } catch (error) {
      logWarn('Failed to generate props for flag', {
        flagKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Include error information in analytics
      flagProps[`flag_${flagKey.replace(/[^a-zA-Z0-9]/g, '_')}_error`] = {
        key: flagKey,
        error: true,
        message: error instanceof Error ? error.message : 'Evaluation failed',
      };
    }
  }

  const result = {
    ...baseProps,
    flags: flagProps,
    flagCount: Object.keys(flagProps).length,
  };

  logInfo('Vercel Analytics flag props generated', {
    propCount: Object.keys(result).length,
    flagCount: Object.keys(flagProps).length,
  });

  return result;
}

/**
 * Helper function to evaluate a flag for analytics purposes
 * This is a placeholder that would integrate with actual flag evaluation logic
 */
async function evaluateFlagForAnalytics(
  flagKey: string,
  context: Record<string, any>,
): Promise<any> {
  // In a real implementation, this would:
  // 1. Look up the flag definition
  // 2. Evaluate it with the given context
  // 3. Return the resolved value

  // For now, return a placeholder value
  logInfo('Evaluating flag for analytics', { flagKey, context });

  // Simulate flag evaluation based on key patterns
  if (flagKey.includes('banner')) {
    return Math.random() > 0.5; // Boolean flag
  } else if (flagKey.includes('variant') || flagKey.includes('version')) {
    return ['a', 'b', 'control'][Math.floor(Math.random() * 3)]; // String variant
  } else if (flagKey.includes('count') || flagKey.includes('limit')) {
    return Math.floor(Math.random() * 100); // Numeric flag
  }

  return true; // Default boolean
}

/**
 * Comprehensive analytics tracking with flag exposure logging
 * Integrates with the reportValue function for comprehensive tracking
 */
export function trackFlagExposure(
  flagKey: string,
  value: any,
  context: Record<string, any> = {},
): void {
  if (!globalAnalyticsKeys.includes(flagKey)) {
    logInfo('Flag not in analytics keys, skipping exposure tracking', {
      flagKey,
      configuredKeys: globalAnalyticsKeys.length,
    });
    return;
  }

  const exposureData = {
    flagKey,
    value,
    timestamp: new Date().toISOString(),
    context,
    type: 'flag_exposure',
  };

  logInfo('Flag exposure tracked', exposureData);

  // Emit custom event for analytics integration
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const event = new CustomEvent('flag-exposure-tracked', {
      detail: exposureData,
    });
    globalThis.dispatchEvent(event);
  }

  // This would integrate with @repo/analytics in a real implementation
  // For now, we just log the exposure
}

/**
 * Get analytics configuration status
 * Useful for debugging and health checks
 */
export function getAnalyticsStatus(): {
  configured: boolean;
  keyCount: number;
  keys: string[];
  environment: string;
} {
  const env = safeEnv();

  return {
    configured: globalAnalyticsKeys.length > 0,
    keyCount: globalAnalyticsKeys.length,
    keys: [...globalAnalyticsKeys],
    environment: env.NODE_ENV || 'development',
  };
}

/**
 * Reset analytics configuration (useful for testing)
 */
export function resetAnalyticsConfig(): void {
  globalAnalyticsKeys = [];
  logInfo('Analytics configuration reset');
}

/**
 * Advanced Experiment Tracking Callbacks
 * Comprehensive tracking for A/B tests and experimentation
 */

/**
 * Callback function type for experiment exposure events
 */
export type ExperimentExposureCallback = (event: ExperimentExposureEvent) => void | Promise<void>;

/**
 * Callback function type for experiment assignment events
 */
export type ExperimentAssignmentCallback = (
  event: ExperimentAssignmentEvent,
) => void | Promise<void>;

/**
 * Callback function type for experiment conversion events
 */
export type ExperimentConversionCallback = (
  event: ExperimentConversionEvent,
) => void | Promise<void>;

/**
 * Experiment exposure event data
 */
export interface ExperimentExposureEvent {
  /** Experiment identifier */
  experimentId: string;

  /** Variant/treatment assigned to user */
  variant: string;

  /** Flag key associated with experiment */
  flagKey: string;

  /** User identifier */
  userId?: string;

  /** Session identifier */
  sessionId?: string;

  /** Exposure timestamp */
  timestamp: string;

  /** Additional experiment context */
  context: Record<string, any>;

  /** Experiment metadata */
  metadata?: {
    experimentName?: string;
    hypothesis?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Experiment assignment event data
 */
export interface ExperimentAssignmentEvent {
  /** Experiment identifier */
  experimentId: string;

  /** Assigned variant */
  variant: string;

  /** Flag key */
  flagKey: string;

  /** User identifier */
  userId?: string;

  /** Assignment reason (e.g., 'random', 'override', 'sticky') */
  reason: string;

  /** Assignment timestamp */
  timestamp: string;

  /** Assignment context */
  context: Record<string, any>;
}

/**
 * Experiment conversion event data
 */
export interface ExperimentConversionEvent {
  /** Experiment identifier */
  experimentId: string;

  /** User's assigned variant */
  variant: string;

  /** Conversion event name */
  eventName: string;

  /** Conversion value (revenue, score, etc.) */
  value?: number;

  /** User identifier */
  userId?: string;

  /** Session identifier */
  sessionId?: string;

  /** Conversion timestamp */
  timestamp: string;

  /** Additional conversion properties */
  properties?: Record<string, any>;
}

/**
 * Global experiment tracking callbacks
 */
let exposureCallbacks: ExperimentExposureCallback[] = [];
let assignmentCallbacks: ExperimentAssignmentCallback[] = [];
let conversionCallbacks: ExperimentConversionCallback[] = [];

/**
 * Register callback for experiment exposure events
 * Called when a user is exposed to an experiment (sees the variant)
 *
 * @param callback - Function to call on exposure events
 *
 * @example
 * ```typescript
 * import { onExperimentExposure } from '@repo/feature-flags';
 *
 * onExperimentExposure(async (event) => {
 *   await analytics.track('Experiment Exposure', {
 *     experiment_id: event.experimentId,
 *     variant: event.variant,
 *     user_id: event.userId
 *   });
 * });
 * ```
 */
export function onExperimentExposure(callback: ExperimentExposureCallback): void {
  exposureCallbacks.push(callback);
  logInfo('Experiment exposure callback registered', {
    callbackCount: exposureCallbacks.length,
  });
}

/**
 * Register callback for experiment assignment events
 * Called when a user is first assigned to an experiment variant
 *
 * @param callback - Function to call on assignment events
 *
 * @example
 * ```typescript
 * onExperimentAssignment((event) => {
 *   console.log(`User ${event.userId} assigned to ${event.variant} for ${event.experimentId}`);
 * });
 * ```
 */
export function onExperimentAssignment(callback: ExperimentAssignmentCallback): void {
  assignmentCallbacks.push(callback);
  logInfo('Experiment assignment callback registered', {
    callbackCount: assignmentCallbacks.length,
  });
}

/**
 * Register callback for experiment conversion events
 * Called when a user completes a conversion goal
 *
 * @param callback - Function to call on conversion events
 *
 * @example
 * ```typescript
 * onExperimentConversion(async (event) => {
 *   await analytics.track('Experiment Conversion', {
 *     experiment_id: event.experimentId,
 *     variant: event.variant,
 *     event_name: event.eventName,
 *     value: event.value
 *   });
 * });
 * ```
 */
export function onExperimentConversion(callback: ExperimentConversionCallback): void {
  conversionCallbacks.push(callback);
  logInfo('Experiment conversion callback registered', {
    callbackCount: conversionCallbacks.length,
  });
}

/**
 * Track experiment exposure event
 * Call this when a user is exposed to an experiment variant
 *
 * @param event - Exposure event data
 */
export async function trackExperimentExposure(event: ExperimentExposureEvent): Promise<void> {
  logInfo('Tracking experiment exposure', {
    experimentId: event.experimentId,
    variant: event.variant,
    flagKey: event.flagKey,
    userId: event.userId,
  });

  // Execute all registered callbacks
  await Promise.allSettled(
    exposureCallbacks.map(async callback => {
      try {
        await callback(event);
      } catch (error) {
        logWarn('Experiment exposure callback failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          experimentId: event.experimentId,
        });
      }
    }),
  );

  // Emit global event
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const customEvent = new CustomEvent('experiment-exposure', { detail: event });
    globalThis.dispatchEvent(customEvent);
  }
}

/**
 * Track experiment assignment event
 * Call this when a user is first assigned to an experiment
 *
 * @param event - Assignment event data
 */
export async function trackExperimentAssignment(event: ExperimentAssignmentEvent): Promise<void> {
  logInfo('Tracking experiment assignment', {
    experimentId: event.experimentId,
    variant: event.variant,
    userId: event.userId,
    reason: event.reason,
  });

  // Execute all registered callbacks
  await Promise.allSettled(
    assignmentCallbacks.map(async callback => {
      try {
        await callback(event);
      } catch (error) {
        logWarn('Experiment assignment callback failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          experimentId: event.experimentId,
        });
      }
    }),
  );

  // Emit global event
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const customEvent = new CustomEvent('experiment-assignment', { detail: event });
    globalThis.dispatchEvent(customEvent);
  }
}

/**
 * Track experiment conversion event
 * Call this when a user completes a conversion goal
 *
 * @param event - Conversion event data
 */
export async function trackExperimentConversion(event: ExperimentConversionEvent): Promise<void> {
  logInfo('Tracking experiment conversion', {
    experimentId: event.experimentId,
    variant: event.variant,
    eventName: event.eventName,
    value: event.value,
    userId: event.userId,
  });

  // Execute all registered callbacks
  await Promise.allSettled(
    conversionCallbacks.map(async callback => {
      try {
        await callback(event);
      } catch (error) {
        logWarn('Experiment conversion callback failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          experimentId: event.experimentId,
          eventName: event.eventName,
        });
      }
    }),
  );

  // Emit global event
  if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
    const customEvent = new CustomEvent('experiment-conversion', { detail: event });
    globalThis.dispatchEvent(customEvent);
  }
}

/**
 * Comprehensive flag exposure tracking with experiment context
 * Extends the basic trackFlagExposure with experiment awareness
 */
export function trackFlagExposureWithExperiment(
  flagKey: string,
  value: any,
  context: Record<string, any> = {},
  experimentConfig?: {
    experimentId: string;
    variant: string;
    metadata?: Record<string, any>;
  },
): void {
  // First, track the basic flag exposure
  trackFlagExposure(flagKey, value, context);

  // If experiment config is provided, also track experiment exposure
  if (experimentConfig) {
    const exposureEvent: ExperimentExposureEvent = {
      experimentId: experimentConfig.experimentId,
      variant: experimentConfig.variant,
      flagKey,
      userId: context.userId || context.user?.id,
      sessionId: context.sessionId,
      timestamp: new Date().toISOString(),
      context,
      metadata: experimentConfig.metadata,
    };

    // Track asynchronously to avoid blocking
    (async () => {
      try {
        await trackExperimentExposure(exposureEvent);
      } catch (error) {
        logWarn('Failed to track experiment exposure', {
          error: error instanceof Error ? error.message : 'Unknown error',
          flagKey,
          experimentId: experimentConfig.experimentId,
        });
      }
    })();
  }
}

/**
 * Batch experiment event tracking for performance
 * Useful when tracking many events at once
 */
export async function trackExperimentEventsBatch(events: {
  exposures?: ExperimentExposureEvent[];
  assignments?: ExperimentAssignmentEvent[];
  conversions?: ExperimentConversionEvent[];
}): Promise<void> {
  const { exposures = [], assignments = [], conversions = [] } = events;

  logInfo('Tracking experiment events batch', {
    exposureCount: exposures.length,
    assignmentCount: assignments.length,
    conversionCount: conversions.length,
  });

  // Track all events in parallel
  await Promise.allSettled([
    ...exposures.map(event => trackExperimentExposure(event)),
    ...assignments.map(event => trackExperimentAssignment(event)),
    ...conversions.map(event => trackExperimentConversion(event)),
  ]);
}

/**
 * Clear all experiment tracking callbacks (useful for testing)
 */
export function clearExperimentCallbacks(): void {
  exposureCallbacks = [];
  assignmentCallbacks = [];
  conversionCallbacks = [];
  logInfo('All experiment callbacks cleared');
}

/**
 * Get current experiment tracking status
 */
export function getExperimentTrackingStatus(): {
  exposureCallbacks: number;
  assignmentCallbacks: number;
  conversionCallbacks: number;
} {
  return {
    exposureCallbacks: exposureCallbacks.length,
    assignmentCallbacks: assignmentCallbacks.length,
    conversionCallbacks: conversionCallbacks.length,
  };
}
