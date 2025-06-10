import { NextRequest, NextResponse } from 'next/server';
import { 
  deleteOrganization 
} from '@repo/auth/server/organizations/management';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteOrganization(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete organization' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}