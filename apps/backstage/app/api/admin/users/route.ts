import { NextRequest, NextResponse } from 'next/server';
import { 
  createUser, 
  listUsers 
} from '@repo/auth/server/admin-management';
import { createServerObservability } from '@repo/observability/server/next';

export async function GET(request: NextRequest) {
  const observability = await createServerObservability();
  const transaction = observability.startTransaction('api.admin.users.list', {
    op: 'http.server',
    tags: {
      'http.method': 'GET',
      'http.route': '/api/admin/users',
    },
  });

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;

    transaction?.setData('query_params', { limit, offset, search });

    const result = await listUsers({ limit, offset, search });
    
    if (!result.success) {
      transaction?.setStatus('invalid_argument');
      return NextResponse.json(
        { error: result.error || 'Failed to list users' },
        { status: 400 }
      );
    }

    transaction?.setStatus('ok');
    transaction?.setData('user_count', result.data?.length || 0);

    return NextResponse.json({
      users: result.data,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error('Error listing users:', error);
    transaction?.setStatus('internal_error');
    observability.captureException(error as Error, {
      tags: {
        endpoint: '/api/admin/users',
        method: 'GET',
      },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    transaction?.finish();
  }
}

export async function POST(request: NextRequest) {
  const observability = await createServerObservability();
  const transaction = observability.startTransaction('api.admin.users.create', {
    op: 'http.server',
    tags: {
      'http.method': 'POST',
      'http.route': '/api/admin/users',
    },
  });

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email) {
      transaction?.setStatus('invalid_argument');
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    transaction?.setData('user_email', email);

    const result = await createUser({
      name,
      email,
      password,
      role: role || 'user',
    });
    
    if (!result.success) {
      transaction?.setStatus('invalid_argument');
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: 400 }
      );
    }

    transaction?.setStatus('ok');
    transaction?.setData('user_id', result.data?.id);

    return NextResponse.json({
      user: result.data,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    transaction?.setStatus('internal_error');
    observability.captureException(error as Error, {
      tags: {
        endpoint: '/api/admin/users',
        method: 'POST',
      },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    transaction?.finish();
  }
}