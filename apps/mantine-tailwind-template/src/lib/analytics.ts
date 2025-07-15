/**
 * Analytics configuration and setup
 *
 * This file demonstrates the emitter-first approach from @repo/analytics
 * with console provider for development tracking.
 */

import {
  ContextBuilder,
  createAnonymousSession,
  createUserSession,
  EventBatch,
  identify,
  page,
  track,
  withMetadata,
} from '@repo/analytics/client/next';

import { logInfo, logWarn } from '@repo/observability';

// Direct emitter-based tracking functions
export async function trackEvent(eventName: string, properties?: any) {
  try {
    track(eventName, properties);
    logInfo('[Analytics] Track:', { event: eventName, properties });
  } catch (error) {
    logWarn('Analytics tracking failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function trackPageView(pageName: string, properties?: any) {
  try {
    page(undefined, pageName, properties);
    logInfo('[Analytics] Page:', { page: pageName, properties });
  } catch (error) {
    logWarn('Page tracking failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function trackIdentify(userId: string, traits?: any) {
  try {
    identify(userId, traits);
    logInfo('[Analytics] Identify:', { userId, traits });
  } catch (error) {
    logWarn('Identify tracking failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Re-export emitter functions for easy access
export {
  ContextBuilder,
  createAnonymousSession,
  createUserSession,
  EventBatch,
  identify,
  page,
  track,
  withMetadata,
};

// Common analytics events for the template app
export const AnalyticsEvents = {
  // Page events
  PAGE_VIEWED: 'Page Viewed',

  // Component interactions
  THEME_CHANGED: 'Theme Changed',
  LANGUAGE_CHANGED: 'Language Changed',
  FEATURE_CARD_CLICKED: 'Feature Card Clicked',
  FEATURE_CARD_HOVERED: 'Feature Card Hovered',

  // Feature flag events
  FEATURE_FLAG_EVALUATED: 'Feature Flag Evaluated',
  FEATURE_USED: 'Feature Used',

  // User actions
  APP_INITIALIZED: 'App Initialized',
  SESSION_STARTED: 'Session Started',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
