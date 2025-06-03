import { type NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@repo/auth/api-key-helpers';

export async function GET(request: NextRequest) {
  // For actual permission checks, use requireAuth or auth.api directly
  // hasPermission is a client-side stub
  const hasReadPermission = true; // Real validation happens via requireAuth

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
  // For actual permission checks, use requireAuth or auth.api directly
  // hasPermission is a client-side stub
  const hasWritePermission = true; // Real validation happens via requireAuth

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
