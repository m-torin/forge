/**
 * Registry-specific database utilities
 * Provides specialized functions for registry analytics and complex queries
 */

'use server';

import { prisma } from '../../clients/standard';

/**
 * Get monthly registry activity for the last 12 months
 */
export async function getMonthlyRegistryActivity() {
  const result = await prisma.$queryRaw<
    Array<{
      month: string;
      registriesCreated: bigint;
    }>
  >`
    SELECT
      TO_CHAR(date_trunc('month', "createdAt"), 'YYYY-MM') as month,
      COUNT(*) as "registriesCreated"
    FROM "Registry"
    WHERE "deletedAt" IS NULL
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY date_trunc('month', "createdAt")
    ORDER BY month
  `;

  return result.map((row) => ({
    month: row.month,
    registriesCreated: Number(row.registriesCreated),
  }));
}

/**
 * Get top products in registries with conversion rates
 */
export async function getTopRegistryProducts(limit = 20) {
  const result = await prisma.$queryRaw<
    Array<{
      productId: string;
      productName: string;
      timesAdded: bigint;
      timesPurchased: bigint;
      conversionRate: number;
    }>
  >`
    SELECT
      ri."productId",
      p.name as "productName",
      COUNT(*) as "timesAdded",
      COUNT(CASE WHEN ri.purchased = true THEN 1 END) as "timesPurchased",
      ROUND(
        (COUNT(CASE WHEN ri.purchased = true THEN 1 END)::decimal / COUNT(*)) * 100, 2
      ) as "conversionRate"
    FROM "RegistryItem" ri
    JOIN "Product" p ON ri."productId" = p.id
    WHERE ri."deletedAt" IS NULL AND ri."productId" IS NOT NULL
    GROUP BY ri."productId", p.name
    HAVING COUNT(*) >= 3
    ORDER BY "timesAdded" DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    timesAdded: Number(row.timesAdded),
    timesPurchased: Number(row.timesPurchased),
    conversionRate: Number(row.conversionRate),
  }));
}

/**
 * Get user engagement metrics for registries
 */
export async function getRegistryUserEngagement() {
  const result = await prisma.$queryRaw<
    Array<{
      averageItemsPerRegistry: number;
      uniqueCreators: bigint;
      totalRegistries: bigint;
      publicRegistriesPercentage: number;
    }>
  >`
    SELECT
      ROUND(AVG(item_count), 2) as "averageItemsPerRegistry",
      COUNT(DISTINCT r."createdByUserId") as "uniqueCreators",
      COUNT(*) as "totalRegistries",
      ROUND(
        (COUNT(CASE WHEN r."isPublic" = true THEN 1 END)::decimal / COUNT(*)) * 100, 2
      ) as "publicRegistriesPercentage"
    FROM "Registry" r
    LEFT JOIN (
      SELECT "registryId", COUNT(*) as item_count
      FROM "RegistryItem"
      WHERE "deletedAt" IS NULL
      GROUP BY "registryId"
    ) items ON r.id = items."registryId"
    WHERE r."deletedAt" IS NULL
  `;

  const data = result[0];
  return {
    averageItemsPerRegistry: Number(data?.averageItemsPerRegistry || 0),
    uniqueCreators: Number(data?.uniqueCreators || 0),
    totalRegistries: Number(data?.totalRegistries || 0),
    publicRegistriesPercentage: Number(data?.publicRegistriesPercentage || 0),
  };
}

/**
 * Get registry purchase activity analytics for the last 12 months
 */
export async function getRegistryPurchaseActivity(registryId?: string) {
  const registryFilter = registryId ? `AND ri."registryId" = '${registryId}'` : '';

  const result = await prisma.$queryRaw<
    Array<{
      month: string;
      purchases: bigint;
      totalQuantity: bigint;
      averagePrice: number;
    }>
  >`
    SELECT
      TO_CHAR(date_trunc('month', rp."purchaseDate"), 'YYYY-MM') as month,
      COUNT(*) as purchases,
      SUM(rp.quantity) as "totalQuantity",
      AVG(rp.price) as "averagePrice"
    FROM "RegistryPurchaseJoin" rp
    JOIN "RegistryItem" ri ON rp."registryItemId" = ri.id
    WHERE ri."deletedAt" IS NULL
      AND rp."purchaseDate" >= NOW() - INTERVAL '12 months'
      ${registryFilter}
    GROUP BY date_trunc('month', rp."purchaseDate")
    ORDER BY month DESC
  `;

  return result.map((row) => ({
    month: row.month,
    purchases: Number(row.purchases),
    totalQuantity: Number(row.totalQuantity),
    averagePrice: Number(row.averagePrice || 0),
  }));
}
