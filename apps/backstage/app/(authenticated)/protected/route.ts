import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';

export async function GET(request: NextRequest) {
  // Better Auth automatically checks for API keys in the x-api-key header
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide a valid API key or authentication.' },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authentication: {
      method: request.headers.get('x-api-key') ? 'api_key' : 'session',
      userId: session.user.id,
    },
    endpoints: {
      '/protected/example': 'Example protected endpoint',
      '/protected/organization': 'Get organization information',
      '/protected/user': 'Get user information',
    },
    message: 'Welcome to the protected API',
  });
}
