/**
 * Example .well-known/vercel/flags/route.ts file for PostHog
 *
 * This file should be placed at app/.well-known/vercel/flags/route.ts
 * in your Next.js application
 */
import {
  createFlagsDiscoveryEndpoint,
  getPostHogProviderData,
} from '@repo/feature-flags/server/next';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getPostHogProviderData({
    // These can be set via environment variables:
    // POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
  });
});
