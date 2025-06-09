import { NextRequest, NextResponse } from 'next/server';
import { 
  unbanUser 
} from '@repo/auth/server/admin-management';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await unbanUser(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to unban user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}