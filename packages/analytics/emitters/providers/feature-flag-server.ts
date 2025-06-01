import {
  analyticsDebugMode,
  analyticsDevelopmentMode,
  analyticsEnabled,
  analyticsProductionOnly,
  googleAnalyticsEnabled,
  posthogAnalyticsEnabled,
  segmentAnalyticsEnabled,
} from '../../flags-server';
import { Analytics } from '../analytics';

import type { AnalyticsProviders } from '../analytics';

/**
 * Create server-side analytics instance with feature flag checks
 */
export async function createFeatureFlaggedAnalytics(options?: {
  segment?: { writeKey: string };
  posthog?: { apiKey: string; apiHost?: string };
  googleAnalytics?: { measurementId: string };
  userId?: string;
  anonymousId?: string;
}) {
  // Check if analytics is enabled at all
  const isEnabled = await analyticsEnabled();
  
  if (!isEnabled) {
    // Return a no-op analytics instance
    return new Analytics({
      disabled: true,
    });
  }

  // Check environment restrictions
  const [prodOnly, devMode] = await Promise.all([
    analyticsProductionOnly(),
    analyticsDevelopmentMode(),
  ]);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (prodOnly && !isProduction) {
    return new Analytics({ disabled: true });
  }

  if (devMode && !isDevelopment) {
    return new Analytics({ disabled: true });
  }

  // Check which services are enabled
  const [
    segmentEnabled,
    posthogEnabled,
    googleEnabled,
    debugMode,
  ] = await Promise.all([
    segmentAnalyticsEnabled(),
    posthogAnalyticsEnabled(),
    googleAnalyticsEnabled(),
    analyticsDebugMode(),
  ]);

  // Build providers config based on flags
  const providers: AnalyticsProviders = {};

  if (segmentEnabled && options?.segment) {
    providers.segment = {
      writeKey: options.segment.writeKey,
    };
  }

  if (posthogEnabled && options?.posthog) {
    providers.posthog = {
      apiKey: options.posthog.apiKey,
      config: {
        apiHost: options.posthog.apiHost,
      },
    };
  }

  if (googleEnabled && options?.googleAnalytics) {
    // Note: Google Analytics doesn't work server-side
    console.warn('[Analytics] Google Analytics is not supported server-side');
  }

  const analytics = new Analytics({
    providers,
    debug: debugMode,
    defaultAnonymousId: options?.anonymousId,
    defaultUserId: options?.userId,
  });

  return analytics;
}

/**
 * Track server event with feature flag checks
 */
export async function trackFeatureFlaggedEvent(
  event: string,
  properties?: Record<string, any>,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
    userId?: string;
    anonymousId?: string;
  }
) {
  const analytics = await createFeatureFlaggedAnalytics(options);
  
  await analytics.track(event, properties);
  await analytics.flush();
}

/**
 * Identify user with feature flag checks
 */
export async function identifyFeatureFlaggedUser(
  userId: string,
  traits?: Record<string, any>,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
  }
) {
  const analytics = await createFeatureFlaggedAnalytics({
    ...options,
    userId,
  });
  
  await analytics.identify(userId, traits);
  await analytics.flush();
}

/**
 * HOC for server actions with feature-flagged analytics
 */
export function withFeatureFlaggedAnalytics<T extends (...args: any[]) => any>(
  action: T,
  eventName: string,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
  }
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
      await trackFeatureFlaggedEvent(
        eventName,
        {
          duration: Date.now() - startTime,
          error: error?.message,
          success,
        },
        options
      );
    }
  }) as T;
}