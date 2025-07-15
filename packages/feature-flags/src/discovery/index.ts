import { logError } from '@repo/observability/server/next';

// Create a simple discovery endpoint function since createFlagsDiscoveryEndpoint
// is not available in @vercel/flags v3.1.1
export function createFlagsDiscoveryEndpoint(
  getProviderData: () => Promise<{ provider: string; flags: any[] }>,
) {
  return async function GET() {
    try {
      const data = await getProviderData();
      return Response.json(data);
    } catch (error) {
      logError(
        'Error in flags discovery endpoint',
        error instanceof Error ? error : new Error(String(error)),
        { endpoint: 'discovery' },
      );
      // Return empty flags instead of failing
      return Response.json({
        provider: 'fallback',
        flags: [],
      });
    }
  };
}
