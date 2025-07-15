import { Knock } from '@knocklabs/node';
import { logWarn } from '@repo/observability/server/next';

import { safeEnv } from './env';

// Initialize Knock immediately with the API key
const apiKey = safeEnv().KNOCK_SECRET_API_KEY || 'test-knock-key';
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

export { NotificationsProvider, notify } from './mantine-notifications';
