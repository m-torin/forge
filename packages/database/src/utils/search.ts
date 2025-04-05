import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Search users with text matching
 */
export async function searchUsers(
  query: string,
  options?: {
    limit?: number;
  },
) {
  const limit = options?.limit || 20;

  return prisma.user.findMany({
    include: {
      accounts: true,
      sessions: true,
    },
    take: limit,
    where: {
      OR: [{ name: { contains: query } }, { email: { contains: query } }],
    },
  });
}

/**
 * Search sessions by user ID
 */
export async function searchSessionsByUser(userId: string, limit = 20) {
  return prisma.session.findMany({
    include: {
      user: true,
    },
    take: limit,
    where: {
      userId,
    },
    orderBy: {
      expires: "desc",
    },
  });
}
