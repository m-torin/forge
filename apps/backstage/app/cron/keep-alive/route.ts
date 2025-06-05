import { type NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '../../../lib/auth';
import { createPrismaAdapter } from '@repo/database/prisma';

const adapter = createPrismaAdapter();

export const GET = async (request: NextRequest) => {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  await adapter.initialize();
  const database = await adapter.raw('client', {});

  const newPage = await database.page.create({
    data: {
      name: 'cron-temp',
    },
  });

  await database.page.delete({
    where: {
      id: newPage.id,
    },
  });

  return new Response('OK', { status: 200 });
};
