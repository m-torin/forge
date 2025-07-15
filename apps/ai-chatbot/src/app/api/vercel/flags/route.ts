import { allMcpFlags } from '#/lib/feature-flags/mcp-flags';
import * as chatFlags from '#/lib/flags';
import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';

/**
 * GET endpoint for Vercel feature flags discovery
 * Returns all flags configuration for the Flags Explorer
 */
export const GET = createFlagsDiscoveryEndpoint(async () => {
  // Combine MCP flags with chat flags
  const allFlags = {
    ...allMcpFlags,
    ...chatFlags,
  };

  return getProviderData(allFlags);
});
