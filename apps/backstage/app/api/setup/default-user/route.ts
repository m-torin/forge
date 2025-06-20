import { createUserAction } from '@repo/auth/server/next';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 },
      );
    }

    const defaultUser = {
      email: 'admin@localhost',
      name: 'Admin User',
      password: 'admin123',
      role: 'super-admin' as const,
    };

    const result = await createUserAction(defaultUser);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Default admin user created successfully',
        user: {
          email: defaultUser.email,
          name: defaultUser.name,
          role: defaultUser.role,
        },
        credentials: {
          email: defaultUser.email,
          password: defaultUser.password,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          credentials: {
            email: defaultUser.email,
            password: defaultUser.password,
          },
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Error creating default user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        credentials: {
          email: 'admin@localhost',
          password: 'admin123',
        },
      },
      { status: 500 },
    );
  }
}
