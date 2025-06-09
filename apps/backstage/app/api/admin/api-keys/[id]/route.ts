import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server/auth';
import { headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: keyId } = params;
    const body = await request.json();
    const { name, enabled, permissions } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    const result = await auth.api.updateApiKey({
      body: {
        keyId,
        ...(name && { name }),
        ...(enabled !== undefined && { enabled }),
        ...(permissions && { permissions }),
      },
      headers: await headers(),
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update API key' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'API key updated successfully',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: keyId } = params;

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    const result = await auth.api.revokeApiKey({
      body: { keyId },
      headers: await headers(),
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete API key' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}