import { type NextRequest, NextResponse } from 'next/server';

import { basicEdgeMiddlewareFlag } from './flags';

export const config = {
  matcher: ['/examples/feature-flags-in-edge-middleware'],
};

export async function middleware(request: NextRequest) {
  const active = await basicEdgeMiddlewareFlag();
  const variant = active ? 'variant-on' : 'variant-off';

  return NextResponse.rewrite(
    new URL(`/examples/feature-flags-in-edge-middleware/${variant}`, request.url),
  );
}
