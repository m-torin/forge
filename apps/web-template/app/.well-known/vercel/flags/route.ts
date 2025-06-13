import {
  createFlagsDiscoveryEndpoint,
  getPostHogProviderData,
} from '@repo/feature-flags/server/next';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getPostHogProviderData({
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
  });
});
