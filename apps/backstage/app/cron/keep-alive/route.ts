import { type NextRequest } from 'next/server';

import { createPrismaAdapter } from '@repo/database/prisma';

export const dynamic = 'force-dynamic';

const adapter = createPrismaAdapter();

export const GET = async (request: NextRequest) => {
  // No auth validation in demo mode
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
