import { type NextRequest, NextResponse } from 'next/server';

import { homeFlag } from './flags';

export const config = { matcher: ['/'] };

export async function middleware(request: NextRequest) {
  const home = await homeFlag();

  // Determine which version to show based on the feature flag
  const version = home ? '/home-b' : '/home-a';

  // Rewrite the request to the appropriate version
  const nextUrl = new URL(version, request.url);
  return NextResponse.rewrite(nextUrl);
}
