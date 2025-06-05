import 'server-only';

import { prisma as database } from '@repo/database/prisma';

export const getCurrentOrganization = async (userId: string) => {
  // Better Auth stores active organization differently
  // We need to find the active member for the user
  const activeMember = await (database as any).member.findFirst({
    include: {
      organization: true,
    },
    orderBy: {
      updatedAt: 'desc', // Get the most recently active
    },
    where: {
      userId: userId,
      // All members have a role, so we don't need to filter by it
    },
  });

  return activeMember?.organization || null;
};
