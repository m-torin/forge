import { type NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '../lib/auth';

export const runtime = 'nodejs'; // Changed from edge to support auth

export const GET = async (request: NextRequest): Promise<Response> => {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return new Response('OK', { status: 200 });
};
