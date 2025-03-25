import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Find products on sale with the highest discounts
 * Demonstrates filtering and sorting by computed fields
 */
export async function findBestDiscounts(options?: {
  minDiscountPercent?: number;
  limit?: number;
  categoryId?: number;
  sellerId?: number;
}) {
  const minDiscount = options?.minDiscountPercent || 10;
  const limit = options?.limit || 20;

  return prisma.productSellerBrand.findMany({
    where: {
      discountPercent: { gte: minDiscount },
      isAvailable: true,
      ...(options?.categoryId ? { product: { categoryId: options.categoryId } } : {}),
      ...(options?.sellerId ? { sellerId: options.sellerId } : {}),
    },
    include: {
      product: {
        include: {
          category: true,
          canonicalUrl: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      discountPercent: 'desc',
    },
    take: limit,
  });
}

/**
 * Find products with the highest profit margins
 * Another example of using computed fields for business intelligence
 */
export async function findHighProfitMarginProducts(options?: {
  minProfitMargin?: number;
  limit?: number;
  categoryId?: number;
}) {
  const minMargin = options?.minProfitMargin || 25;
  const limit = options?.limit || 20;

  return prisma.productSellerBrand.findMany({
    where: {
      profitMargin: { gte: minMargin },
      isAvailable: true,
      ...(options?.categoryId ? { product: { categoryId: options.categoryId } } : {}),
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      profitMargin: 'desc',
    },
    take: limit,
  });
}

/**
 * Find optimal products based on both discount and profit margin
 * Shows how to combine multiple computed fields for advanced filtering
 */
export async function findOptimalProducts(options?: {
  minDiscountPercent?: number;
  minProfitMargin?: number;
  limit?: number;
}) {
  const minDiscount = options?.minDiscountPercent || 10;
  const minMargin = options?.minProfitMargin || 20;
  const limit = options?.limit || 20;

  return prisma.productSellerBrand.findMany({
    where: {
      discountPercent: { gte: minDiscount },
      profitMargin: { gte: minMargin },
      isAvailable: true,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      seller: true,
    },
    orderBy: [
      // Combined ordering for optimal products
      { discountPercent: 'desc' },
      { profitMargin: 'desc' },
    ],
    take: limit,
  });
}

/**
 * Group products by discount ranges
 * Shows how to create reporting buckets based on computed fields
 */
export async function getDiscountDistribution() {
  // Using raw SQL for this complex aggregation
  return prisma.$queryRaw<Array<{ range: string; count: number }>>`
    SELECT 
      CASE 
        WHEN discount_percent >= 50 THEN 'Over 50%'
        WHEN discount_percent >= 30 THEN '30% - 49%'
        WHEN discount_percent >= 20 THEN '20% - 29%'
        WHEN discount_percent >= 10 THEN '10% - 19%'
        WHEN discount_percent >= 5 THEN '5% - 9%'
        WHEN discount_percent > 0 THEN 'Under 5%'
        ELSE 'No Discount'
      END as range,
      COUNT(*) as count
    FROM product_seller_brands
    WHERE is_available = true
    GROUP BY range
    ORDER BY 
      CASE 
        WHEN range = 'Over 50%' THEN 1
        WHEN range = '30% - 49%' THEN 2
        WHEN range = '20% - 29%' THEN 3
        WHEN range = '10% - 19%' THEN 4
        WHEN range = '5% - 9%' THEN 5
        WHEN range = 'Under 5%' THEN 6
        ELSE 7
      END
  `;
}

/**
 * Get products with the same discount percentage
 * Useful for creating "similar deals" recommendations
 */
export async function getSimilarDiscounts(productId: number, sellerId: number, range = 5) {
  // First get the discount percent of the target product
  const targetProduct = await prisma.productSellerBrand.findUnique({
    where: {
      productId_sellerId: {
        productId,
        sellerId,
      },
    },
    select: {
      discountPercent: true,
    },
  });

  if (!targetProduct || !targetProduct.discountPercent) {
    return [];
  }

  // Find products with similar discount percentage
  return prisma.productSellerBrand.findMany({
    where: {
      NOT: {
        productId_sellerId: {
          productId,
          sellerId,
        },
      },
      discountPercent: {
        gte: targetProduct.discountPercent - range,
        lte: targetProduct.discountPercent + range,
      },
      isAvailable: true,
    },
    include: {
      product: true,
      seller: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      // Order by how close the discount is to the target
      discountPercent: 'desc',
    },
    take: 10,
  });
}
