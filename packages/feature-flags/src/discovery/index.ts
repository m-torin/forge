// Re-export from Vercel SDK
// This includes verifyAccess and x-flags-sdk-version header
import * as vercelFlags from '@vercel/flags/next';

// Check what's available and export accordingly
export const createFlagsDiscoveryEndpoint =
  (vercelFlags as any).createFlagsDiscoveryEndpoint ||
  (() => {
    throw new Error(
      '@vercel/flags/next does not export createFlagsDiscoveryEndpoint in this version',
    );
  });
