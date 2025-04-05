import "server-only";
import { PostHog } from "posthog-node";

import { keys } from "../keys";

// Initialize PostHog client for server-side usage
const { NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY } = keys();

export const analytics = new PostHog(NEXT_PUBLIC_POSTHOG_KEY, {
  flushAt: 1, // Flush immediately in server environment
  flushInterval: 0,
  host: NEXT_PUBLIC_POSTHOG_HOST,
});

export const captureServerEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null>,
  userIdentifier?: string,
) => {
  if (userIdentifier) {
    analytics.capture({
      distinctId: userIdentifier,
      event,
      properties,
    });
  } else {
    // Anonymous event
    analytics.capture({
      distinctId: "anonymous",
      event,
      properties,
    });
  }
};

export const identifyUser = (
  userIdentifier: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  analytics.identify({
    distinctId: userIdentifier,
    properties,
  });
};
