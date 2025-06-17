/**
 * Server-side notifications exports (non-Next.js)
 *
 * This file provides server-side notifications functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/notifications/server/next' instead.
 */

import { Knock } from '@knocklabs/node';
import { keys } from '../keys';

// Initialize Knock immediately with the API key
const apiKey = keys().KNOCK_SECRET_API_KEY ?? 'test-knock-key';
const knock = new Knock({ apiKey });

let hasLoggedWarning = false;

const getKnock = () => {
  if (!apiKey) {
    if (!hasLoggedWarning) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Notifications] Knock API key not configured. Notification features are disabled.',
      );
      hasLoggedWarning = true;
    }
    return null;
  }

  return knock;
};

// Export a proxy that lazily initializes Knock
export const notifications = new Proxy({} as Knock, {
  get(target, prop) {
    const knockClient = getKnock();

    if (!knockClient) {
      // Return no-op functions for common methods
      if (typeof prop === 'string' && ['notify', 'send', 'trigger'].includes(prop)) {
        return async () => {
          // Silently do nothing when Knock is not configured
        };
      }
      return undefined;
    }

    return knockClient[prop as keyof Knock];
  },
});
