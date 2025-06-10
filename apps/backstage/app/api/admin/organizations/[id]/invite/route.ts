import { NextRequest, NextResponse } from 'next/server';
import { 
  bulkInviteUsers 
} from '@repo/auth/server/organizations/management';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const body = await request.json();
    const { emails, role, message } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email is required' },
        { status: 400 }
      );
    }

    const result = await bulkInviteUsers({
      emails,
      organizationId,
      role: role || 'member',
      message,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send invitations' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      results: result.results,
      message: 'Invitations processed',
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}