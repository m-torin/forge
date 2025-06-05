"use client";

import { createClientAnalytics } from "@repo/analytics/client";

// Create client analytics instance
const analyticsInstance = createClientAnalytics({
  providers: {
    posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY
      ? {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          config: {
            apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          },
        }
      : undefined,
    segment: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY
      ? {
          writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
        }
      : undefined,
    console: {
      enabled: process.env.NODE_ENV === "development",
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Initialize analytics
let clientAnalyticsReady: Promise<any> | null = null;

// Export analytics instance wrapper
export const clientAnalytics = {
  track: async (event: string, properties?: Record<string, any>) => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    return analytics.track(event, properties);
  },

  identify: async (userId: string, traits?: Record<string, any>) => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    return analytics.identify(userId, traits);
  },

  page: async (name?: string, properties?: Record<string, any>) => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    return analytics.page(name, properties);
  },

  reset: async () => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    // Reset functionality - call reset on underlying providers if available
    const posthogProvider = analytics.getProvider('posthog');
    if (posthogProvider && typeof posthogProvider.reset === 'function') {
      posthogProvider.reset();
    }
    return Promise.resolve();
  },

  group: async (groupId: string, traits?: Record<string, any>) => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    return analytics.group(groupId, traits);
  },

  alias: async (userId: string, previousId?: string) => {
    if (!clientAnalyticsReady) {
      clientAnalyticsReady = analyticsInstance;
      await clientAnalyticsReady;
    }
    const analytics = await clientAnalyticsReady;
    return analytics.alias(userId, previousId);
  },
};
