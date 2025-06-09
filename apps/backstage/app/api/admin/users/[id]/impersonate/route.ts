import { NextRequest, NextResponse } from 'next/server';
import { 
  impersonateUser 
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

    const result = await impersonateUser(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to impersonate user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      session: result.data,
      message: 'User impersonation started',
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}