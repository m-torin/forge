import { type NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@repo/auth/api-key-helpers';

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
