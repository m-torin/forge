/**
 * Server-side notifications exports (non-Next.js)
 *
 * This file provides server-side notifications functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/notifications/server/next' instead.
 */

import { Knock } from '@knocklabs/node';
import { safeEnv } from '../env';
// Simple no-op for now since observability import has issues
// import { logWarn } from '@repo/observability/server';
const logWarn = (_message: string, ..._args: any[]) => {
  // No-op to avoid console warnings in production
};

// Initialize Knock immediately with the API key
const apiKey = safeEnv().KNOCK_SECRET_API_KEY ?? 'test-knock-key';
const knock = new Knock({ apiKey });

let hasLoggedWarning = false;

const getKnock = () => {
  if (!apiKey) {
    if (!hasLoggedWarning) {
      logWarn('[Notifications] Knock API key not configured. Notification features are disabled.');
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
