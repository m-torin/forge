import { type NextRequest, NextResponse } from 'next/server';

import { FLAGS } from './types/flags';

/**
 * API handler for Vercel Toolbar to access flag definitions
 * Used in /api/flags/route.ts endpoints
 */
export const getFlags = async (request: NextRequest) => {
  // Simple auth check - in production you'd want proper authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(null, { status: 401 });
  }

  // Convert our FLAGS constant to the format expected by Vercel Toolbar
  const definitions = Object.entries(FLAGS).reduce(
    (acc, [category, flags]) => {
      Object.entries(flags).forEach(([key, value]) => {
        if (typeof value === 'string') {
          acc[value] = {
            description: `${category}.${key} feature flag`,
            options: [{ value: true }, { value: false }],
            origin: 'LOCAL_FLAGS environment variable (dev only)',
          };
        }
      });
      return acc;
    },
    {} as Record<string, any>,
  );

  return NextResponse.json({
    definitions,
  });
};
