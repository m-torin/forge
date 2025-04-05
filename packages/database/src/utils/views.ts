import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get user authentication statistics
 */
export async function getUserAuthStats() {
  // This would ideally use a database view, but here we'll simulate with a raw query
  return prisma.$queryRaw<
    {
      total_users: number;
      users_with_accounts: number;
      users_with_active_sessions: number;
      avg_sessions_per_user: number;
    }[]
  >`
    SELECT
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT a.user_id) as users_with_accounts,
      COUNT(DISTINCT s.user_id) as users_with_active_sessions,
      (SELECT COUNT(*)::float / NULLIF(COUNT(DISTINCT user_id), 0) FROM sessions) as avg_sessions_per_user
    FROM users u
    LEFT JOIN accounts a ON u.id = a.user_id
    LEFT JOIN sessions s ON u.id = s.user_id AND s.expires > NOW()
  `;
}

/**
 * Get account provider distribution
 */
export async function getProviderDistribution() {
  return prisma.$queryRaw<
    {
      provider: string;
      user_count: number;
      percentage: number;
    }[]
  >`
    WITH provider_counts AS (
      SELECT
        provider,
        COUNT(DISTINCT user_id) as user_count
      FROM accounts
      GROUP BY provider
    ),
    total AS (
      SELECT COUNT(DISTINCT user_id) as total_users
      FROM accounts
    )
    SELECT
      pc.provider,
      pc.user_count,
      (pc.user_count::float / t.total_users * 100) as percentage
    FROM provider_counts pc, total t
    ORDER BY pc.user_count DESC
  `;
}

/**
 * Get session expiration analytics
 */
export async function getSessionExpiryAnalytics() {
  const now = new Date();

  return prisma.$queryRaw<
    {
      status: string;
      count: number;
      percentage: number;
    }[]
  >`
    WITH session_categories AS (
      SELECT
        CASE
          WHEN expires < ${now} THEN 'Expired'
          WHEN expires < ${new Date(now.getTime() + 1000 * 60 * 60 * 24)} THEN 'Expiring Today'
          WHEN expires < ${new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)} THEN 'Expiring This Week'
          ELSE 'Active'
        END as status,
        COUNT(*) as count
      FROM sessions
      GROUP BY status
    ),
    total AS (
      SELECT COUNT(*) as total_sessions FROM sessions
    )
    SELECT
      sc.status,
      sc.count,
      (sc.count::float / t.total_sessions * 100) as percentage
    FROM session_categories sc, total t
    ORDER BY
      CASE
        WHEN sc.status = 'Expired' THEN 1
        WHEN sc.status = 'Expiring Today' THEN 2
        WHEN sc.status = 'Expiring This Week' THEN 3
        ELSE 4
      END
  `;
}

/**
 * Generate user authentication report
 */
export async function generateAuthReport() {
  const [userStats] = await getUserAuthStats();
  const providerDistribution = await getProviderDistribution();
  const sessionStats = await getSessionExpiryAnalytics();

  // Get recently active users (users with sessions that expire in the future)
  const recentlyActiveUsers = await prisma.user.findMany({
    include: {
      sessions: {
        where: {
          expires: {
            gt: new Date(),
          },
        },
        orderBy: {
          expires: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      sessions: {
        _count: "desc",
      },
    },
    take: 5,
    where: {
      sessions: {
        some: {
          expires: {
            gt: new Date(),
          },
        },
      },
    },
  });

  return {
    generatedAt: new Date(),
    mostActiveUsers: recentlyActiveUsers,
    providerDistribution,
    sessionStats,
    userStats,
  };
}
