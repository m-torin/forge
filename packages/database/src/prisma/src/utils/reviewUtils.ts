/**
 * Review-specific database utilities
 * Provides specialized functions for review analytics and spam detection
 */

'use server';

import { prisma } from '../../clients/standard';

/**
 * Count suspicious/spam reviews using complex criteria
 * Reviews are considered suspicious if they have many votes but low helpfulness ratio
 */
export async function countSuspiciousReviews(): Promise<number> {
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM "Review"
    WHERE "deletedAt" IS NULL
      AND "status" = 'PUBLISHED'
      AND "totalVotes" > 5
      AND "helpfulCount" < ("totalVotes"::float / 3)
  `;

  return Number(result[0]?.count || 0);
}

/**
 * Get review analytics with complex aggregations
 */
export async function getReviewAnalyticsData() {
  const result = await prisma.$queryRaw<
    Array<{
      rating: number;
      count: bigint;
    }>
  >`
    SELECT
      "rating",
      COUNT(*) as count
    FROM "Review"
    WHERE "deletedAt" IS NULL
      AND "status" = 'PUBLISHED'
    GROUP BY "rating"
    ORDER BY "rating" DESC
  `;

  return result.map((row) => ({
    rating: row.rating,
    count: Number(row.count),
  }));
}

/**
 * Get top products by review count and average rating
 */
export async function getTopProductsByReviews(limit = 10) {
  const result = await prisma.$queryRaw<
    Array<{
      productId: string;
      productName: string;
      averageRating: number;
      reviewCount: bigint;
    }>
  >`
    SELECT
      p."id" as "productId",
      p."name" as "productName",
      AVG(r."rating") as "averageRating",
      COUNT(r."id") as "reviewCount"
    FROM "Product" p
    INNER JOIN "Review" r ON p."id" = r."productId"
    WHERE p."deletedAt" IS NULL
      AND r."deletedAt" IS NULL
      AND r."status" = 'PUBLISHED'
    GROUP BY p."id", p."name"
    HAVING COUNT(r."id") >= 3
    ORDER BY "reviewCount" DESC, "averageRating" DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    averageRating: Number(row.averageRating),
    reviewCount: Number(row.reviewCount),
  }));
}
