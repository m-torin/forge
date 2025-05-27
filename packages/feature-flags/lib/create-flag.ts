import { flag } from 'flags/next';

import { analytics } from '@repo/analytics/posthog/server';
import { currentUser } from '@repo/auth/server';

export const createFlag = (key: string) =>
  flag({
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
