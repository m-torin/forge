import 'server-only';
import { PostHog } from 'posthog-node';

import { keys } from '../keys';

let analyticsInstance: PostHog | null = null;
let hasLoggedWarning = false;

export const analytics = new Proxy({} as PostHog, {
  get(_, prop) {
    const { NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY } = keys();

    // Return no-op functions if keys are missing
    if (!NEXT_PUBLIC_POSTHOG_KEY || !NEXT_PUBLIC_POSTHOG_HOST) {
      if (!hasLoggedWarning) {
        console.warn(
          '[Server] PostHog analytics is disabled: Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST',
        );
        hasLoggedWarning = true;
      }

      if (typeof prop === 'string' && ['alias', 'capture', 'identify', 'shutdown'].includes(prop)) {
        return (..._args: any[]) => Promise.resolve();
      }
      return undefined;
    }

    // Initialize PostHog instance on first use
    if (!analyticsInstance) {
      analyticsInstance = new PostHog(NEXT_PUBLIC_POSTHOG_KEY, {
        // Don't batch events and flush immediately - we're running in a serverless environment
        flushAt: 1,
        flushInterval: 0,
        host: NEXT_PUBLIC_POSTHOG_HOST,
      });
    }

    return analyticsInstance[prop as keyof PostHog];
  },
});
