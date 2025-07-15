import { dedupe, flag } from '@vercel/flags/next';

import { postHogServerAdapter } from '@repo/feature-flags/server/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

interface Entities {
  user?: { id: string };
}

const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
});

// Basic boolean flag using PostHog
export const myFlag = flag({
  identify,
  adapter: postHogServerAdapter.isFeatureEnabled(),
  key: 'posthog-is-feature-enabled',
});

// Multivariate flag using PostHog
export const myFlagVariant = flag({
  identify,
  adapter: postHogServerAdapter.featureFlagValue(),
  key: 'posthog-feature-flag-value',
});

// Flag with payload using PostHog
export const myFlagPayload = flag({
  identify,
  adapter: postHogServerAdapter.featureFlagPayload(v => v),
  defaultValue: {},
  key: 'posthog-feature-flag-payload',
});
