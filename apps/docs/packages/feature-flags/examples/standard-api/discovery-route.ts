/**
 * Standard discovery endpoint following Vercel documentation
 * Place this at: app/.well-known/vercel/flags/route.ts
 */
import {
  createFlagsDiscoveryEndpoint,
  getEdgeConfigProviderData,
  getPostHogProviderData,
  getProviderData,
} from '@repo/feature-flags/server/next'; // Import all your flags

// The createFlagsDiscoveryEndpoint automatically:
// 1. Calls verifyAccess to check Authorization header
// 2. Adds x-flags-sdk-version response header
// 3. Returns 401 for unauthorized requests
import * as flags from './flags';

// Standard usage - returns metadata for all flags
export const GET = createFlagsDiscoveryEndpoint(async () => {
  const providerData = getProviderData(flags);
  // Ensure the return type matches what createFlagsDiscoveryEndpoint expects
  return {
    provider: 'code',
    flags: Array.isArray(providerData) ? providerData : (providerData as any).flags || [],
  };
});

export const GET_MULTI_PROVIDER = createFlagsDiscoveryEndpoint(async () => {
  // Get flags from code
  const codeFlags = getProviderData(flags);

  // Get flags from providers
  const [postHogFlags, edgeConfigFlags] = await Promise.all([
    getPostHogProviderData({
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
      projectId: process.env.POSTHOG_PROJECT_ID,
    }).catch(() => ({ flags: [] })),
    getEdgeConfigProviderData().catch(() => ({ flags: [] })),
  ]);

  // Combine all flags
  return {
    provider: 'multi',
    flags: [
      ...(Array.isArray(codeFlags) ? codeFlags : (codeFlags as any).flags || []),
      ...((postHogFlags as any).flags || []),
      ...((edgeConfigFlags as any).flags || []),
    ],
  };
});
