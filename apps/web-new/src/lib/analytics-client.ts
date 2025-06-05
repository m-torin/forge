"use client";

// Import the client analytics from @repo/analytics-legacy
import { analytics as posthogClient } from "@repo/analytics-legacy";

// Create a wrapper that provides the same API as the Analytics emitter
// but uses the PostHog client from @repo/analytics-legacy
export const clientAnalytics = {
  track: async (event: string, properties?: Record<string, any>) => {
    // PostHog uses 'capture' method for tracking events
    if (posthogClient && typeof posthogClient.capture === "function") {
      posthogClient.capture(event, properties);
    }
    return Promise.resolve();
  },

  identify: async (userId: string, traits?: Record<string, any>) => {
    if (posthogClient && typeof posthogClient.identify === "function") {
      posthogClient.identify(userId, traits);
    }
    return Promise.resolve();
  },

  page: async (name?: string, properties?: Record<string, any>) => {
    if (posthogClient && typeof posthogClient.capture === "function") {
      posthogClient.capture("$pageview", {
        $current_url: window.location.href,
        ...properties,
      });
    }
    return Promise.resolve();
  },

  reset: async () => {
    if (posthogClient && typeof posthogClient.reset === "function") {
      posthogClient.reset();
    }
    return Promise.resolve();
  },

  group: async (groupId: string, traits?: Record<string, any>) => {
    if (posthogClient && typeof posthogClient.group === "function") {
      posthogClient.group("company", groupId, traits);
    }
    return Promise.resolve();
  },

  alias: async (userId: string, previousId?: string) => {
    if (posthogClient && typeof posthogClient.alias === "function") {
      posthogClient.alias(userId, previousId);
    }
    return Promise.resolve();
  },
};
