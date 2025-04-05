import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get distinct providers from user accounts
 */
export async function getDistinctProviders() {
  return prisma.account.findMany({
    distinct: ["provider"],
    select: {
      provider: true,
      _count: {
        select: { user: true },
      },
    },
    where: {
      provider: { not: null },
    },
  });
}

/**
 * Get users with distinct session expiry ranges
 */
export async function getUsersBySessionExpiryRange() {
  const now = new Date();

  // Expiring today
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Expiring this week
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  // Expiring this month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    expiringToday: await getSessionsByRange(now, endOfDay),
    expiringThisWeek: await getSessionsByRange(now, endOfWeek),
    expiringThisMonth: await getSessionsByRange(now, endOfMonth),
    expired: await getSessionsByRange(undefined, now, true),
  };
}

async function getSessionsByRange(start?: Date, end?: Date, expired = false) {
  const where: any = {};

  if (expired) {
    where.expires = { lt: end };
  } else {
    where.expires = {};
    if (start) where.expires.gte = start;
    if (end) where.expires.lte = end;
  }

  return prisma.session.findMany({
    distinct: ["userId"],
    include: {
      user: true,
    },
    where,
  });
}

/**
 * Get users with multiple accounts by provider
 */
export async function getUsersWithMultipleProviders() {
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
    },
    where: {
      accounts: {
        some: {},
      },
    },
  });

  // Filter to only users with multiple distinct providers
  return users.filter((user) => {
    const distinctProviders = new Set(user.accounts.map((a) => a.provider));
    return distinctProviders.size > 1;
  });
}
