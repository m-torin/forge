import { allMcpFlags } from '#/lib/feature-flags/mcp-flags';
import { createFlagsDiscoveryEndpoint, getProviderData } from '@repo/feature-flags/server/next';

/**
 * GET endpoint for Vercel feature flags discovery
 * Returns MCP flags configuration for runtime feature toggling
 */
export const GET = createFlagsDiscoveryEndpoint(async () => {
  // Return provider data from MCP flags
  return getProviderData(allMcpFlags);
});
