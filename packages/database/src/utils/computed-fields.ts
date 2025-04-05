import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Find users with the most active sessions
 */
export async function findUsersWithMostSessions(limit = 20) {
  return prisma.user.findMany({
    include: {
      sessions: true,
      accounts: true,
    },
    orderBy: {
      sessions: {
        _count: "desc",
      },
    },
    take: limit,
  });
}

/**
 * Find active sessions about to expire
 */
export async function findExpiringActiveSessions(
  expiryThresholdHours = 24,
  limit = 20,
) {
  const now = new Date();
  const expiryThreshold = new Date(now);
  expiryThreshold.setHours(now.getHours() + expiryThresholdHours);

  return prisma.session.findMany({
    include: {
      user: true,
    },
    orderBy: {
      expires: "asc",
    },
    take: limit,
    where: {
      expires: {
        gt: now,
        lt: expiryThreshold,
      },
    },
  });
}

/**
 * Find users with multiple authentication methods
 */
export async function findUsersWithMultipleAuthMethods(limit = 20) {
  return prisma.user.findMany({
    include: {
      accounts: true,
    },
    orderBy: {
      accounts: {
        _count: "desc",
      },
    },
    take: limit,
    where: {
      accounts: {
        some: {},
      },
    },
  });
}
