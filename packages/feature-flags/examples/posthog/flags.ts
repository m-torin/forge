import { flag } from '@vercel/flags/next';
import { postHogServerAdapter } from '@repo/feature-flags/server/next';
import { dedupe } from '@vercel/flags/next';
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
  key: 'posthog-is-feature-enabled',
  adapter: postHogServerAdapter.isFeatureEnabled(),
  identify,
});

// Multivariate flag using PostHog
export const myFlagVariant = flag({
  key: 'posthog-feature-flag-value',
  adapter: postHogServerAdapter.featureFlagValue(),
  identify,
});

// Flag with payload using PostHog
export const myFlagPayload = flag({
  key: 'posthog-feature-flag-payload',
  adapter: postHogServerAdapter.featureFlagPayload((v) => v),
  defaultValue: {},
  identify,
});
