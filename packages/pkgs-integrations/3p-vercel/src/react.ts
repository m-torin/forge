/**
 * Vercel Analytics React Components
 * Based on official @vercel/analytics/react patterns
 */

import React from 'react';
import type { AnalyticsProps, BeforeSendEvent } from './types';

// Re-export the track function for programmatic tracking
export async function track(name: string, data?: Record<string, any>): Promise<void> {
  try {
    const { track } = await import('@vercel/analytics');
    if (data) {
      track(name, data);
    } else {
      track(name);
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
}

// Generic React Analytics Component wrapper
export function Analytics(props: AnalyticsProps = {}) {
  const [AnalyticsComponent, setAnalyticsComponent] =
    React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('@vercel/analytics/react')
      .then(module => {
        setAnalyticsComponent(() => module.Analytics);
      })
      .catch(error => {
        console.warn('Failed to load Vercel Analytics:', error);
      });
  }, []);

  if (!AnalyticsComponent) {
    return null;
  }

  return React.createElement(AnalyticsComponent, props);
}

// Alternative injection method for Create React App and similar
export async function inject(options: AnalyticsProps = {}): Promise<void> {
  try {
    const { inject } = await import('@vercel/analytics');
    inject(options);
  } catch (error) {
    console.warn('Failed to inject Vercel Analytics:', error);
  }
}

// TypeScript-safe track function with proper typing
export async function trackEvent(name: string, data?: Record<string, any>): Promise<void> {
  return track(name, data);
}

// Utility function to create beforeSend handlers
export function createBeforeSendHandler(
  handler: (event: BeforeSendEvent) => BeforeSendEvent | null,
): (event: BeforeSendEvent) => BeforeSendEvent | null {
  return handler;
}

// Common beforeSend patterns
export const beforeSendPatterns = {
  // Remove query parameters
  removeQueryParams: (params: string[]) => (event: BeforeSendEvent) => {
    try {
      const url = new URL(event.url);
      params.forEach(param => url.searchParams.delete(param));
      return { ...event, url: url.toString() };
    } catch {
      return event;
    }
  },

  // Exclude private routes
  excludePrivateRoutes: (patterns: (string | RegExp)[]) => (event: BeforeSendEvent) => {
    for (const pattern of patterns) {
      if (typeof pattern === 'string' && event.url.includes(pattern)) {
        return null;
      }
      if (pattern instanceof RegExp && pattern.test(event.url)) {
        return null;
      }
    }
    return event;
  },

  // User opt-out check
  respectOptOut:
    (storageKey: string = 'va-disable') =>
    (event: BeforeSendEvent) => {
      if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
        return null;
      }
      return event;
    },
};

// React hook for analytics
export function useAnalytics() {
  return {
    track: trackEvent,
    identify: async (userId: string, traits?: Record<string, any>) => {
      // Vercel Analytics doesn't have native identify, track as event
      await trackEvent('User Identified', {
        user_id: userId,
        ...traits,
      });
    },
    page: async (name?: string, properties?: Record<string, any>) => {
      // Page views are automatic, but we can track custom page data
      if (properties && Object.keys(properties).length > 0) {
        await trackEvent('Page Viewed', {
          page_name: name,
          ...properties,
        });
      }
    },
  };
}

// Debug utilities
export function enableDebugMode(): void {
  if (typeof window !== 'undefined') {
    (window as any).__VERCEL_ANALYTICS_DEBUG__ = true;
  }
}

export function disableDebugMode(): void {
  if (typeof window !== 'undefined') {
    (window as any).__VERCEL_ANALYTICS_DEBUG__ = false;
  }
}
