import { NextRequest, NextResponse } from 'next/server';
import { 
  banUser 
} from '@repo/auth/server/admin-management';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, expiresAt } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await banUser(
      id,
      reason,
      expiresAt ? new Date(expiresAt) : undefined
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to ban user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'User banned successfully',
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}