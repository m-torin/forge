import { flag } from 'flags/next';

import { analytics } from '@repo/analytics/posthog/server';
import { currentUser } from '@repo/auth/server';

import { keys } from '../keys';

let hasLoggedWarning = false;

export const createFlag = (key: string) => {
  const flagsSecret = keys().FLAGS_SECRET;

  if (!flagsSecret) {
    if (!hasLoggedWarning) {
      console.warn('[Feature Flags] FLAGS_SECRET not configured. Feature flags are disabled.');
      hasLoggedWarning = true;
    }

    // Return a simple flag that always returns the default value
    return {
      decide: async () => false,
      defaultValue: false,
      key,
    };
  }

  return flag({
    async decide() {
      const user = await currentUser();

      if (!user) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, user.id);

      return isEnabled ?? (this.defaultValue as boolean);
    },
    defaultValue: false,
    key,
  });
};
