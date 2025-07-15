/**
 * Next.js client hooks for analytics
 */

'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { AnalyticsConfig, AnalyticsManager, TrackingOptions } from '../../shared/types/types';
import { createNextJSClientAnalytics } from './manager';

// Global analytics instance
let globalAnalytics: AnalyticsManager | null = null;

/**
 * Hook to get or create analytics instance
 */
export function useAnalytics(config?: AnalyticsConfig): AnalyticsManager | null {
  const [analytics, setAnalytics] = useState<AnalyticsManager | null>(null);

  useEffect(() => {
    if (!globalAnalytics && config) {
      const initAnalytics = async () => {
        try {
          // Note: Client-side observability handled by manager

          const instance = await createNextJSClientAnalytics(config);
          globalAnalytics = instance;
          setAnalytics(instance);
        } catch (_error) {
          // Failed to initialize analytics - silently continue
          // TODO: Add proper error logging via observability package
        }
      };
      initAnalytics();
    } else {
      setAnalytics(globalAnalytics);
    }
  }, [config]);

  return analytics;
}

/**
 * Hook for automatic page view tracking in App Router
 */
export function usePageTracking(options?: {
  trackSearch?: boolean;
  trackParams?: boolean;
  properties?: Record<string, any>;
  skip?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const tracked = useRef<string>('');

  useEffect(() => {
    if (options?.skip || !globalAnalytics) return;

    // Create unique key for this page view
    const searchString = options?.trackSearch ? searchParams.toString() : '';
    const pageKey = `${pathname}${searchString}`;

    // Avoid duplicate tracking
    if (tracked.current === pageKey) return;
    tracked.current = pageKey;

    // Build properties
    const properties: Record<string, any> = {
      ...options?.properties,
      url: window.location.href,
      path: pathname,
      referrer: document.referrer,
      title: document.title,
    };

    if (options?.trackSearch) {
      properties.search = searchString;
      properties.search_params = Object.fromEntries(searchParams.entries());
    }

    if (options?.trackParams && params) {
      properties.route_params = params;
    }

    // Track page view
    globalAnalytics.page(pathname, properties);
  }, [
    pathname,
    searchParams,
    params,
    options?.skip,
    options?.trackSearch,
    options?.trackParams,
    options?.properties,
  ]);
}

/**
 * Hook for tracking events
 */
export function useTrackEvent() {
  return useCallback((event: string, properties?: any, options?: TrackingOptions) => {
    if (!globalAnalytics) return;
    globalAnalytics.track(event, properties, options);
  }, []);
}

/**
 * Hook for user identification
 */
export function useIdentifyUser() {
  return useCallback((userId: string, traits?: any, options?: TrackingOptions) => {
    if (!globalAnalytics) return;
    globalAnalytics.identify(userId, traits, options);
  }, []);
}

/**
 * Utility to reset analytics (useful for testing)
 */
export function resetAnalytics() {
  globalAnalytics = null;
}
