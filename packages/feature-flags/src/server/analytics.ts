/**
 * Vercel Analytics integration for feature flags
 * Tracks flag evaluations and A/B test outcomes
 */

import { logError, logInfo } from '@repo/observability';
import { safeEnv } from '../../env';

/**
 * Track feature flag evaluation with Vercel Analytics
 */
export async function trackFlagEvaluation(
  flagKey: string,
  flagValue: any,
  context: {
    userId?: string;
    sessionId?: string;
    country?: string;
    environment?: string;
    [key: string]: any;
  } = {},
): Promise<void> {
  const env = safeEnv();

  // Only track in production or when explicitly enabled
  if (env.NODE_ENV !== 'production' && !env.VERCEL_ANALYTICS_DEBUG) {
    return;
  }

  try {
    // Use Vercel Analytics track function
    if (typeof window !== 'undefined' && window.va) {
      // Client-side tracking
      window.va('event', {
        name: 'Feature Flag Evaluated',
        flag_key: flagKey,
        flag_value: String(flagValue),
        user_id: context.userId || 'anonymous',
        session_id: context.sessionId,
        country: context.country,
        environment: context.environment || env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Server-side tracking via edge function
      await fetch('/_vercel/insights/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'Feature Flag Evaluated',
          properties: {
            flag_key: flagKey,
            flag_value: String(flagValue),
            user_id: context.userId || 'anonymous',
            session_id: context.sessionId,
            country: context.country,
            environment: context.environment || env.NODE_ENV || 'unknown',
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }

    logInfo('Flag evaluation tracked', {
      flagKey,
      flagValue,
      context: Object.keys(context),
    });
  } catch (error) {
    logError(error instanceof Error ? error.message : 'Analytics tracking failed', {
      flagKey,
      flagValue,
      context: 'analytics-tracking',
    });
  }
}

/**
 * Track A/B test assignment for analytics
 */
export async function trackExperimentAssignment(
  experimentKey: string,
  variant: string,
  context: {
    userId?: string;
    sessionId?: string;
    country?: string;
    environment?: string;
    [key: string]: any;
  } = {},
): Promise<void> {
  const env = safeEnv();

  if (env.NODE_ENV !== 'production' && !env.VERCEL_ANALYTICS_DEBUG) {
    return;
  }

  try {
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: 'Experiment Assignment',
        experiment_key: experimentKey,
        variant,
        user_id: context.userId || 'anonymous',
        session_id: context.sessionId,
        country: context.country,
        environment: context.environment || env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } else {
      await fetch('/_vercel/insights/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'Experiment Assignment',
          properties: {
            experiment_key: experimentKey,
            variant,
            user_id: context.userId || 'anonymous',
            session_id: context.sessionId,
            country: context.country,
            environment: context.environment || env.NODE_ENV || 'unknown',
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }

    logInfo('Experiment assignment tracked', {
      experimentKey,
      variant,
      context: Object.keys(context),
    });
  } catch (error) {
    logError(error instanceof Error ? error.message : 'Experiment tracking failed', {
      experimentKey,
      variant,
      context: 'experiment-tracking',
    });
  }
}

/**
 * Track feature flag conversion events
 */
export async function trackFlagConversion(
  flagKey: string,
  conversionEvent: string,
  value?: number,
  context: {
    userId?: string;
    sessionId?: string;
    country?: string;
    environment?: string;
    [key: string]: any;
  } = {},
): Promise<void> {
  const env = safeEnv();

  if (env.NODE_ENV !== 'production' && !env.VERCEL_ANALYTICS_DEBUG) {
    return;
  }

  try {
    const eventData = {
      event: 'Feature Flag Conversion',
      properties: {
        flag_key: flagKey,
        conversion_event: conversionEvent,
        conversion_value: value,
        user_id: context.userId || 'anonymous',
        session_id: context.sessionId,
        country: context.country,
        environment: context.environment || env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
      },
    };

    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: eventData.event,
        ...eventData.properties,
      });
    } else {
      await fetch('/_vercel/insights/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    }

    logInfo('Flag conversion tracked', {
      flagKey,
      conversionEvent,
      value,
      context: Object.keys(context),
    });
  } catch (error) {
    logError(error instanceof Error ? error.message : 'Conversion tracking failed', {
      flagKey,
      conversionEvent,
      value,
      context: 'conversion-tracking',
    });
  }
}

/**
 * Batch track multiple flag evaluations for performance
 */
export async function trackFlagEvaluationsBatch(
  evaluations: Array<{
    flagKey: string;
    flagValue: any;
    context?: Record<string, any>;
  }>,
  commonContext: {
    userId?: string;
    sessionId?: string;
    country?: string;
    environment?: string;
    [key: string]: any;
  } = {},
): Promise<void> {
  const env = safeEnv();

  if (env.NODE_ENV !== 'production' && !env.VERCEL_ANALYTICS_DEBUG) {
    return;
  }

  if (evaluations.length === 0) return;

  try {
    const batchData = evaluations.map(({ flagKey, flagValue, context = {} }) => ({
      event: 'Feature Flag Evaluated',
      properties: {
        flag_key: flagKey,
        flag_value: String(flagValue),
        user_id: commonContext.userId || context.userId || 'anonymous',
        session_id: commonContext.sessionId || context.sessionId,
        country: commonContext.country || context.country,
        environment: commonContext.environment || context.environment || env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        batch_id: crypto.randomUUID(),
        batch_size: evaluations.length,
      },
    }));

    if (typeof window !== 'undefined' && window.va) {
      // Track each event individually on client-side
      batchData.forEach(data => {
        window.va?.('event', {
          name: data.event,
          ...data.properties,
        });
      });
    } else {
      // Send as batch on server-side
      await fetch('/_vercel/insights/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: batchData }),
      });
    }

    logInfo('Batch flag evaluations tracked', {
      batchSize: evaluations.length,
      flags: evaluations.map(e => e.flagKey),
    });
  } catch (error) {
    logError(error instanceof Error ? error.message : 'Batch tracking failed', {
      batchSize: evaluations.length,
      context: 'batch-tracking',
    });
  }
}

/**
 * Analytics configuration and utilities
 */
export const analyticsConfig = {
  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    const env = safeEnv();
    return env.NODE_ENV === 'production' || !!env.VERCEL_ANALYTICS_DEBUG;
  },

  /**
   * Initialize client-side analytics
   */
  initializeClient(): void {
    if (typeof window === 'undefined') return;

    // Inject Vercel Analytics script if not already present
    if (!document.querySelector('script[src*="_vercel/insights/script.js"]')) {
      const script = document.createElement('script');
      script.defer = true;
      script.src = '/_vercel/insights/script.js';
      document.head.appendChild(script);
    }
  },

  /**
   * Get session-scoped analytics context
   */
  getSessionContext(): {
    sessionId: string;
    timestamp: string;
    userAgent?: string;
    referrer?: string;
  } {
    const sessionId =
      typeof window !== 'undefined'
        ? window.sessionStorage?.getItem('analytics-session-id') || crypto.randomUUID()
        : crypto.randomUUID();

    if (typeof window !== 'undefined' && !window.sessionStorage?.getItem('analytics-session-id')) {
      window.sessionStorage?.setItem('analytics-session-id', sessionId);
    }

    return {
      sessionId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };
  },
};

// Type declarations for Vercel Analytics
declare global {
  interface Window {
    va?: (event: 'event' | 'beforeSend' | 'pageview', properties?: unknown) => void;
  }
}

// Export all analytics functions
export {
  trackFlagEvaluation as track,
  trackFlagEvaluationsBatch as trackBatch,
  trackFlagConversion as trackConversion,
  trackExperimentAssignment as trackExperiment,
};
