import { type NextRequest } from 'next/server';

import { prisma } from '@repo/database/prisma';

export const dynamic = 'force-dynamic';

export const GET = async (_request: NextRequest) => {
  // Simple database keep-alive query
  const count = await prisma.user.count();

  return new Response(`OK - Users: ${count}`, { status: 200 });
};
