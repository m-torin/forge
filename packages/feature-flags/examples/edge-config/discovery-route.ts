/**
 * Example .well-known/vercel/flags/route.ts file for Edge Config
 *
 * This file should be placed at app/.well-known/vercel/flags/route.ts
 * in your Next.js application
 */
import {
  createFlagsDiscoveryEndpoint,
  getEdgeConfigProviderData,
} from '@repo/feature-flags/server/next';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getEdgeConfigProviderData({
    // Uses EDGE_CONFIG environment variable by default
    // Or specify custom connection string:
    // connectionString: process.env.OTHER_EDGE_CONFIG,
    options: {
      // edgeConfigItemKey: 'flags', // default
      // teamSlug: 'my-team', // optional, for dashboard links
    },
  });
});
