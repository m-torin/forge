// Create a simple discovery endpoint function since createFlagsDiscoveryEndpoint
// is not available in @vercel/flags v3.1.1
export function createFlagsDiscoveryEndpoint(
  getProviderData: () => Promise<{ provider: string; flags: any[] }>
) {
  return async function GET() {
    try {
      const data = await getProviderData();
      return Response.json(data);
    } catch (error) {
      console.error('Error in flags discovery endpoint:', error);
      // Return empty flags instead of failing
      return Response.json({
        provider: 'fallback',
        flags: []
      });
    }
  };
}
