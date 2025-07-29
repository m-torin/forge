import { precompute } from '@vercel/flags/next';
import { type NextRequest, NextResponse } from 'next/server';
import { offlineFlags } from './flags';

export const config = {
  matcher: ['/examples/offline/:path*'],
};

export async function middleware(request: NextRequest) {
  // Get context for flag evaluation
  const context = {
    cookies: request.cookies,
    headers: request.headers,
  };

  try {
    // Precompute all offline flags - no network dependencies
    const flagValues = await precompute(offlineFlags, context);

    // Add flag values to response headers for debugging
    const response = NextResponse.next();

    // Set computed flag values as headers (for debugging)
    response.headers.set('x-flags-computed', 'true');
    response.headers.set('x-flags-count', offlineFlags.length.toString());
    response.headers.set('x-flags-values', JSON.stringify(flagValues));

    // Add visitor ID if not present (air-gapped ID generation)
    if (!request.cookies.get('visitor-id')) {
      const visitorId = `visitor-${Math.random().toString(36).slice(2, 11)}`;
      response.cookies.set('visitor-id', visitorId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    // Add deployment context for maintenance flag
    response.headers.set('x-deployment-id', process.env.DEPLOYMENT_ID || 'local-dev');
    response.headers.set('x-environment', process.env.NODE_ENV || 'development');

    return response;
  } catch (error) {
    // Even if flag evaluation fails, continue with request
    console.warn('Offline flag evaluation failed:', error);
    return NextResponse.next();
  }
}
