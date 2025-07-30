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
const apiKey = safeEnv().KNOCK_SECRET_API_KEY;
const knock = apiKey ? new Knock({ apiKey }) : null;

let hasLoggedWarning = false;

/**
 * Get the Knock client instance with lazy initialization
 * @returns Knock client instance or null if not configured
 */
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

/**
 * Proxy for Knock client that lazily initializes when accessed
 * Returns undefined for all properties when Knock is not configured
 */
export const notifications = new Proxy({} as Knock, {
  get(target, prop) {
    const knockClient = getKnock();

    if (!knockClient) {
      // Return undefined for all properties when Knock is not configured
      return undefined;
    }

    return knockClient[prop as keyof Knock];
  },
});
