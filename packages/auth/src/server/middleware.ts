/**
 * Middleware helpers for Next.js
 */

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';
import type { AuthSession } from '../types';

export function withAuth<T extends any[]>(
  handler: (request: NextRequest, session: AuthSession, ...args: T) => Promise<Response>,
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, session, ...args);
  };
}

export function withOrgAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    organizationId: string,
    ...args: T
  ) => Promise<Response>,
) {
  return withAuth(async (request: NextRequest, session: AuthSession, ...args: T) => {
    const organizationId = session.activeOrganizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 403 });
    }

    return handler(request, session, organizationId, ...args);
  });
}
