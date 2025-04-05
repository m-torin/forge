import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get best deals across all products using the ProductPricingView
 * This demonstrates the efficiency of using database views for complex queries
 */
export async function getBestDeals(options?: {
  categoryName?: string;
  minDiscountPercent?: number;
  limit?: number;
}) {
  const limit = options?.limit || 10;
  const minDiscount = options?.minDiscountPercent || 15;

  return prisma.productPricingView.findMany({
    orderBy: {
      discountPercent: "desc",
    },
    take: limit,
    where: {
      discountPercent: { gte: minDiscount },
      isAvailable: true,
      ...(options?.categoryName ? { categoryName: options.categoryName } : {}),
    },
  });
}

/**
 * Compare prices for a specific product across different sellers
 * Uses the ProductPricingView for efficient queries
 */
export async function comparePrices(productSlug: string) {
  return prisma.productPricingView.findMany({
    orderBy: {
      priceSale: "asc",
    },
    where: {
      isAvailable: true,
      productSlug,
    },
  });
}

/**
 * Get top-performing stories based on product count and pricing
 * Demonstrates aggregation via database views
 */
export async function getTopStories(options?: {
  limit?: number;
  minProductCount?: number;
}) {
  const limit = options?.limit || 10;
  const minProducts = options?.minProductCount || 1;

  return prisma.storyStatsView.findMany({
    orderBy: [{ productCount: "desc" }, { avgPrice: "desc" }],
    take: limit,
    where: {
      productCount: { gte: minProducts },
    },
  });
}

/**
 * Get detailed statistics for a specific story
 */
export async function getStoryStats(storySlug: string) {
  return prisma.storyStatsView.findFirst({
    where: {
      storySlug,
    },
  });
}

/**
 * Get stories with the highest average product prices
 */
export async function getPremiumStories(limit = 10) {
  return prisma.storyStatsView.findMany({
    orderBy: {
      avgPrice: "desc",
    },
    take: limit,
    where: {
      avgPrice: { not: null },
      productCount: { gt: 3 }, // Ensure we have enough products for meaningful averages
    },
  });
}

/**
 * Get stories with the most sellers
 */
export async function getPopularStories(limit = 10) {
  return prisma.storyStatsView.findMany({
    orderBy: {
      sellerCount: "desc",
    },
    take: limit,
    where: {
      sellerCount: { gt: 0 },
    },
  });
}

/**
 * Generate a pricing report using both views
 * Example of combining multiple database views for complex reporting
 */
export async function generatePricingReport() {
  // Get top 5 stories by product count
  const topStories = await prisma.storyStatsView.findMany({
    orderBy: {
      productCount: "desc",
    },
    take: 5,
  });

  // For each story, get their top 3 products with the best deals
  const storyReports = await Promise.all(
    topStories.map(async (story: { storyId: number; [key: string]: any }) => {
      // Find products associated with this story using raw SQL joining the views
      const products = await prisma.$queryRaw<any[]>`
        SELECT ppv.*
        FROM product_pricing_view ppv
        JOIN _ProductToStory pts ON ppv.product_id = pts.product_id
        WHERE pts.story_id = ${story.storyId}
        AND ppv.discount_percent IS NOT NULL
        ORDER BY ppv.discount_percent DESC
        LIMIT 3
      `;

      return {
        bestDeals: products,
        story,
      };
    }),
  );

  return {
    // Add additional metrics as needed
    avgDiscount: storyReports
      .flatMap((r) => r.bestDeals)
      .filter((d) => d.discount_percent)
      .reduce(
        (sum, deal, _, array) => sum + deal.discount_percent / array.length,
        0,
      ),
    generatedAt: new Date(),
    topStories: storyReports,
  };
}
