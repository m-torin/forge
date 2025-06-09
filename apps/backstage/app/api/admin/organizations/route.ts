import { NextRequest, NextResponse } from 'next/server';
import { 
  createOrganization 
} from '@repo/auth/server/organizations/management';
import { listAllOrganizations } from '@repo/auth/server/actions';

export async function GET(request: NextRequest) {
  try {
    const result = await listAllOrganizations();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to list organizations' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      organizations: result.data,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Error listing organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const result = await createOrganization({
      name,
      slug: finalSlug,
      description,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create organization' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      organization: result.organization,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}