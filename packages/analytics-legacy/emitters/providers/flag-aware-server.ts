import { Analytics } from '../analytics';

import type { AnalyticsFlags } from '../../types/flags';
import type { AnalyticsProviders } from '../analytics';

/**
 * Create server-side analytics instance with feature flags
 * This is meant to be used at the application level where flags are resolved
 */
export function createFlagAwareAnalytics(
  flags: AnalyticsFlags,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
    googleAnalytics?: { measurementId: string };
    userId?: string;
    anonymousId?: string;
  },
) {
  // Check if analytics is enabled at all
  if (!flags.enabled) {
    // Return a no-op analytics instance
    return new Analytics({
      disabled: true,
    });
  }

  // Check environment restrictions
  const _isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (flags.productionOnly && !isProduction) {
    return new Analytics({ disabled: true });
  }

  // Build providers config based on flags
  const providers: AnalyticsProviders = {};

  if (flags.segmentEnabled && options?.segment) {
    providers.segment = {
      writeKey: options.segment.writeKey,
    };
  }

  if (flags.posthogEnabled && options?.posthog) {
    providers.posthog = {
      apiKey: options.posthog.apiKey,
      config: {
        apiHost: options.posthog.apiHost,
      },
    };
  }

  if (flags.googleEnabled && options?.googleAnalytics) {
    // Note: Google Analytics doesn't work server-side
    console.warn('[Analytics] Google Analytics is not supported server-side');
  }

  const analytics = new Analytics({
    providers,
    debug: flags.debug,
    defaultAnonymousId: options?.anonymousId,
    defaultUserId: options?.userId,
  });

  return analytics;
}

/**
 * Track server event with feature flags
 */
export async function trackFlagAwareEvent(
  flags: AnalyticsFlags,
  event: string,
  properties?: Record<string, any>,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
    userId?: string;
    anonymousId?: string;
  },
) {
  const analytics = createFlagAwareAnalytics(flags, options);

  await analytics.track(event, properties);
  await analytics.flush();
}

/**
 * Identify user with feature flags
 */
export async function identifyFlagAwareUser(
  flags: AnalyticsFlags,
  userId: string,
  traits?: Record<string, any>,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
  },
) {
  const analytics = createFlagAwareAnalytics(flags, {
    ...options,
    userId,
  });

  await analytics.identify(userId, traits);
  await analytics.flush();
}

/**
 * HOC for server actions with flag-aware analytics
 */
export function withFlagAwareAnalytics<T extends (...args: any[]) => any>(
  flags: AnalyticsFlags,
  action: T,
  eventName: string,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
  },
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;

    try {
      const result = await action(...args);
      success = true;
      return result;
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      await trackFlagAwareEvent(
        flags,
        eventName,
        {
          duration: Date.now() - startTime,
          error: error?.message,
          success,
        },
        options,
      );
    }
  }) as T;
}
