import { type NextRequest } from 'next/server';

import { countUsersOrm } from '@repo/database/prisma';

export const dynamic = 'force-dynamic';

export const GET = async (_request: NextRequest) => {
  // Simple database keep-alive query using ORM function
  const count = await countUsersOrm();

  return new Response(`OK - Users: ${count}`, { status: 200 });
};
