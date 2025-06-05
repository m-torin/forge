import { createServerAnalytics as createAnalytics } from "@repo/analytics/server";

// Create server analytics instance
const serverAnalyticsInstance = createAnalytics({
  providers: {
    posthog: process.env.POSTHOG_API_KEY
      ? {
          apiKey: process.env.POSTHOG_API_KEY,
          config: {
            apiHost: process.env.POSTHOG_HOST || "https://app.posthog.com",
          },
        }
      : undefined,
    segment: process.env.SEGMENT_WRITE_KEY
      ? {
          writeKey: process.env.SEGMENT_WRITE_KEY,
          config: {
            flushAt: 20,
            flushInterval: 10000,
          },
        }
      : undefined,
    console: {
      enabled: process.env.NODE_ENV === "development",
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Initialize and export the server analytics instance
let serverAnalyticsReady: Promise<any> | null = null;

async function getServerAnalytics() {
  if (!serverAnalyticsReady) {
    serverAnalyticsReady = serverAnalyticsInstance.then(async (analytics) => {
      await analytics.initialize();
      return analytics;
    });
  }
  return serverAnalyticsReady;
}

export const serverAnalytics = {
  track: async (event: string, properties?: Record<string, any>) => {
    const analytics = await getServerAnalytics();
    return analytics.track(event, properties);
  },
  identify: async (userId: string, traits?: Record<string, any>) => {
    const analytics = await getServerAnalytics();
    return analytics.identify(userId, traits);
  },
  page: async (name?: string, properties?: Record<string, any>) => {
    const analytics = await getServerAnalytics();
    return analytics.page(name, properties);
  },
  group: async (groupId: string, traits?: Record<string, any>) => {
    const analytics = await getServerAnalytics();
    return analytics.group(groupId, traits);
  },
  alias: async (userId: string, previousId?: string) => {
    const analytics = await getServerAnalytics();
    return analytics.alias(userId, previousId);
  },
};

// You can also create a custom Analytics instance for server-side use if needed
export function createServerAnalytics() {
  return createAnalytics({
    providers: {
      posthog: process.env.POSTHOG_API_KEY
        ? {
            apiKey: process.env.POSTHOG_API_KEY,
            config: {
              apiHost: process.env.POSTHOG_HOST || "https://app.posthog.com",
            },
          }
        : undefined,
      segment: process.env.SEGMENT_WRITE_KEY
        ? {
            writeKey: process.env.SEGMENT_WRITE_KEY,
            config: {
              flushAt: 20,
              flushInterval: 10000,
            },
          }
        : undefined,
      console: {
        enabled: process.env.NODE_ENV === "development",
      },
    },
    debug: process.env.NODE_ENV === "development",
  });
}
