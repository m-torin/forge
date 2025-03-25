import 'server-only';
import { PostHog } from 'posthog-node';
import { keys } from '../keys';

// Initialize PostHog client for server-side usage
const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = keys();

export const analytics = new PostHog(NEXT_PUBLIC_POSTHOG_KEY, {
  host: NEXT_PUBLIC_POSTHOG_HOST,
  flushAt: 1, // Flush immediately in server environment
  flushInterval: 0,
});

export const captureServerEvent = (
  event: string,
  properties?: Record<string, any>,
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
      distinctId: 'anonymous',
      event,
      properties,
    });
  }
};

export const identifyUser = (
  userIdentifier: string,
  properties?: Record<string, any>,
) => {
  analytics.identify({
    distinctId: userIdentifier,
    properties,
  });
};
