import { type NextRequest, NextResponse } from 'next/server';

import { hasPermission, requireAuth } from '@repo/auth/server-utils';

export async function GET(request: NextRequest) {
  // Check permissions for API key
  const hasReadPermission = await hasPermission(request, {
    read: ['user'],
  });

  if (!hasReadPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Requires read:user permission.' },
      { status: 403 },
    );
  }

  const session = await requireAuth(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      createdAt: session.user.createdAt,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
    },
  });
}

export async function PATCH(request: NextRequest) {
  // Check permissions for API key
  const hasWritePermission = await hasPermission(request, {
    write: ['user'],
  });

  if (!hasWritePermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Requires write:user permission.' },
      { status: 403 },
    );
  }

  const session = await requireAuth(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();

  // Here you would normally update the user in the database
  // For now, we'll just return the updated data
  return NextResponse.json({
    message: 'User updated successfully',
    user: {
      ...session.user,
      ...updates,
    },
  });
}
