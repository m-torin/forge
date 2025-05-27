import { type NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@repo/auth/server-utils';

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);

  return NextResponse.json({
    app: 'web',
    authenticated: !!session,
    authMethod: request.headers.get('x-auth-method') || 'unknown',
    message: 'This endpoint accepts both API keys and session authentication',
    userId: session?.user?.id || null,
  });
}
