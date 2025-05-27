import { type NextRequest, NextResponse } from 'next/server';

import { hasPermission, requireAuth } from '@repo/auth/server-utils';

export async function GET(request: NextRequest) {
  // The middleware already checked for authentication
  // This is just an extra check for the session data
  const session = await requireAuth(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return protected data
  return NextResponse.json({
    authMethod: request.headers.get('x-auth-method') || 'unknown',
    message: 'Hello from protected API endpoint',
    // Include organization data if available
    organization: session.session?.activeOrganizationId || null,
    timestamp: new Date().toISOString(),
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  });
}

export async function POST(request: NextRequest) {
  // Use the helper to check permissions
  const hasWritePermission = await hasPermission(request, {
    write: ['user'],
  });

  if (!hasWritePermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Requires write:user permission.' },
      { status: 403 },
    );
  }

  // Get the session data
  const session = await requireAuth(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process the write operation
  const body = await request.json();

  return NextResponse.json({
    data: body,
    message: 'Data written successfully',
    timestamp: new Date().toISOString(),
    userId: session.user.id,
  });
}
