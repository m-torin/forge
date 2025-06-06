/**
 * Standard discovery endpoint following Vercel documentation
 * Place this at: app/.well-known/vercel/flags/route.ts
 */
import { getProviderData, createFlagsDiscoveryEndpoint } from '@repo/feature-flags/server/next';
import * as flags from './flags'; // Import all your flags

// Standard usage - returns metadata for all flags
export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});

// The createFlagsDiscoveryEndpoint automatically:
// 1. Calls verifyAccess to check Authorization header
// 2. Adds x-flags-sdk-version response header
// 3. Returns 401 for unauthorized requests

// For custom providers (PostHog, Edge Config), you can combine multiple sources:
import { getPostHogProviderData, getEdgeConfigProviderData } from '@repo/feature-flags/server/next';

export const GET_MULTI_PROVIDER = createFlagsDiscoveryEndpoint(async () => {
  // Get flags from code
  const codeFlags = getProviderData(flags);

  // Get flags from providers
  const [postHogFlags, edgeConfigFlags] = await Promise.all([
    getPostHogProviderData().catch(() => ({ flags: [] })),
    getEdgeConfigProviderData().catch(() => ({ flags: [] })),
  ]);

  // Combine all flags
  return {
    provider: 'multi',
    flags: [...codeFlags.flags, ...postHogFlags.flags, ...edgeConfigFlags.flags],
  };
});
