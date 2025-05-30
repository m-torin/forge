import { createPrismaAdapter } from '@repo/database/prisma';

const adapter = createPrismaAdapter();

export const GET = async () => {
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
