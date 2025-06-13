'use client';

import { AnalyticsProvider as BaseAnalyticsProvider } from '@repo/analytics/client/next';

import { AnalyticsConfig } from '@repo/analytics/types';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Build analytics configuration
  const config: AnalyticsConfig = {
    debug: process.env.NODE_ENV === 'development',
    providers: {
      // Console provider for development
      console: {},
      // Add other providers as needed (they're optional)
      // segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY },
      // posthog: { apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY },
      // vercel: {}, // Auto-configured
    },
  };

  return (
    <BaseAnalyticsProvider
      autoPageTracking={true}
      config={config}
      pageTrackingOptions={{
        trackParams: false, // Don't track route params by default
        trackSearch: true, // Track search params
      }}
    >
      {children}
    </BaseAnalyticsProvider>
  );
}
