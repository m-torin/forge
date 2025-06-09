import { NextRequest, NextResponse } from 'next/server';
import { listApiKeys } from '@repo/auth/server/admin-management';
import { auth } from '@repo/auth/server/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const result = await listApiKeys();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to list API keys' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      apiKeys: result.data,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, permissions, expiresAt, metadata, organizationId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    const result = await auth.api.createApiKey({
      body: {
        name,
        permissions: permissions && permissions.length > 0 ? permissions : ['read'],
        ...(expiresAt && { expiresAt }),
        ...(metadata && { metadata }),
        ...(organizationId && { organizationId }),
      },
      headers: await headers(),
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create API key' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      apiKey: result.apiKey,
      keyId: result.keyId,
      message: 'API key created successfully',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}