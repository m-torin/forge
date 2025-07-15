/**
 * React Server Component (RSC) specific analytics utilities for Next.js 15
 * Provides server-side analytics tracking with proper caching and data flow
 */

import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { getCompleteBootstrapData } from '../shared/utils/posthog-next-utils';

import { createNextJSServerAnalytics } from './server';

import type { BootstrapData } from '../shared/types/posthog-types';
import type { AnalyticsConfig, TrackingOptions } from '../shared/types/types';

/**
 * Cached analytics instance for RSC
 * Uses React cache to ensure single instance per request
 */
const getAnalyticsInstance = cache(async (config: AnalyticsConfig) => {
  const analytics = createNextJSServerAnalytics(config);
  await analytics.initialize();
  return analytics;
});

/**
 * Track event from React Server Components
 * Automatically extracts request context
 */
export async function trackServerEvent(
  event: string,
  properties?: any,
  options?: TrackingOptions & { config?: AnalyticsConfig },
): Promise<void> {
  const config = options?.config || getDefaultConfig();
  const analytics = await getAnalyticsInstance(config);

  // Extract request context
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get('user-agent') || undefined;
  const referer = requestHeaders.get('referer') || undefined;

  const enhancedProperties = {
    ...properties,
    server_side: true,
    referer: referer,
    timestamp: new Date().toISOString(),
    user_agent: userAgent,
  };

  await analytics.track(event, enhancedProperties, options);
}

/**
 * Identify user from React Server Components
 */
export async function identifyServerUser(
  userId: string,
  traits?: any,
  options?: TrackingOptions & { config?: AnalyticsConfig },
): Promise<void> {
  const config = options?.config || getDefaultConfig();
  const analytics = await getAnalyticsInstance(config);

  const enhancedTraits = {
    ...traits,
    identified_at: new Date().toISOString(),
    identified_from: 'server',
  };

  await analytics.identify(userId, enhancedTraits, options);
}

/**
 * Track page view from React Server Components
 */
export async function trackServerPageView(
  pathname: string,
  properties?: any,
  options?: TrackingOptions & { config?: AnalyticsConfig },
): Promise<void> {
  const config = options?.config || getDefaultConfig();
  const analytics = await getAnalyticsInstance(config);

  const requestHeaders = await headers();
  const userAgent = requestHeaders.get('user-agent') || undefined;
  const referer = requestHeaders.get('referer') || undefined;

  const enhancedProperties = {
    ...properties,
    path: pathname,
    referer: referer,
    server_rendered: true,
    timestamp: new Date().toISOString(),
    user_agent: userAgent,
  };

  await analytics.page(pathname, enhancedProperties, options);
}

/**
 * Get PostHog bootstrap data for server components
 * Includes distinct ID extraction and feature flag fetching
 */
export const getServerBootstrapData = cache(
  async (
    apiKey: string,
    options?: {
      host?: string;
      timeout?: number;
    },
  ): Promise<BootstrapData> => {
    const cookieStore = cookies();
    return await getCompleteBootstrapData(cookieStore, apiKey, options);
  },
);

/**
 * Analytics provider for React Server Components
 * Use in server component layouts to provide analytics to children
 */
export async function ServerAnalyticsProvider({
  children,
  config,
  posthogApiKey,
}: {
  children: React.ReactNode;
  config?: AnalyticsConfig;
  posthogApiKey?: string;
}): Promise<React.ReactElement> {
  // Initialize analytics on the server
  if (config) {
    await getAnalyticsInstance(config);
  }

  // Get bootstrap data if PostHog is configured
  if (posthogApiKey) {
    await getServerBootstrapData(posthogApiKey);
  }

  // Return children with any necessary context
  // Note: In RSC, we can't use React context, but we can pass data via props
  return children as React.ReactElement;
}

/**
 * Higher-order component for tracking page views in server components
 */
export function withServerPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string,
) {
  return async function TrackedServerComponent(props: P) {
    // Get pathname from props or use provided name
    const pathname = pageName || (props as any).params?.pathname || 'unknown';

    // Track page view
    await trackServerPageView(pathname, {
      component: Component.name,
      props: Object.keys(props as any),
    });

    return <Component {...props} />;
  };
}

/**
 * Get default analytics configuration
 * Can be customized via environment variables
 */
function getDefaultConfig(): AnalyticsConfig {
  const config: AnalyticsConfig = {
    providers: {},
  };

  // Add providers based on environment variables
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    config.providers.posthog = {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      options: {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      },
    };
  }

  if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
    config.providers.segment = {
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    };
  }

  // Add console provider in development
  if (process.env.NODE_ENV === 'development') {
    config.providers.console = {
      options: {
        prefix: '[RSC Analytics]',
        pretty: true,
      },
    };
  }

  return config;
}

/**
 * Server action for tracking events
 * Can be called from client components
 */
export async function trackEventAction(
  event: string,
  properties?: any,
): Promise<{ success: boolean }> {
  'use server';

  try {
    await trackServerEvent(event, properties);
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

/**
 * Server action for identifying users
 * Can be called from client components
 */
export async function identifyUserAction(
  userId: string,
  traits?: any,
): Promise<{ success: boolean }> {
  'use server';

  try {
    await identifyServerUser(userId, traits);
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

// Re-export types for convenience
export type { BootstrapData } from '../shared/types/posthog-types';
export type { AnalyticsConfig, TrackingOptions } from '../shared/types/types';
