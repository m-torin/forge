import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get one product from each category - optimized with nativeDistinct
 * Useful for creating category showcase sections
 */
export async function getCategoryShowcaseProducts() {
  return prisma.product.findMany({
    distinct: ["categoryId"],
    include: {
      canonicalUrl: true,
      category: true,
      sellerRelationships: {
        orderBy: { discountPercent: "desc" },
        take: 1,
        where: { isAvailable: true },
      },
    },
    orderBy: {
      name: "asc",
    },
    where: {
      sellerRelationships: {
        some: {
          discountPercent: { gt: 0 },
          isAvailable: true,
        },
      },
    },
  });
}

/**
 * Get all distinct sellers for a specific product category
 * Useful for marketplace filtering
 */
export async function getDistinctSellersForCategory(categoryId: number) {
  return prisma.productSellerBrand.findMany({
    distinct: ["sellerId"],
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    where: {
      product: { categoryId },
    },
  });
}

/**
 * Get distinct products for a given story
 * Useful when a story has multiple entries for the same product with different sellers
 */
export async function getDistinctStoryProducts(storyId: number) {
  return prisma.product.findMany({
    distinct: ["id"],
    include: {
      category: true,
      sellerRelationships: {
        orderBy: { priceSale: "asc" },
        take: 1,
        where: { isAvailable: true },
      },
    },
    where: {
      stories: {
        some: { id: storyId },
      },
    },
  });
}

/**
 * Get distinct product types (variants) by media type
 * Useful for faceted navigation
 */
export async function getDistinctMediaTypes() {
  return prisma.productVariant.findMany({
    distinct: ["mediaType"],
    select: {
      mediaType: true,
    },
    where: {
      mediaType: { not: null },
    },
  });
}

/**
 * Get distinct fandoms with story counts - for homepage sections
 */
export async function getDistinctFandomsWithStories() {
  const fandoms = await prisma.fandom.findMany({
    include: {
      _count: {
        select: { stories: true },
      },
    },
  });

  // Get one story from each fandom for preview
  const fandomPreviews = await Promise.all(
    fandoms.map(async (fandom: { id: number; [key: string]: any }) => {
      const previewStory = await prisma.story.findFirst({
        include: {
          products: {
            take: 1,
          },
        },
        orderBy: { productCount: "desc" },
        where: { fandomId: fandom.id },
      });

      return {
        ...fandom,
        previewStory,
      };
    }),
  );

  return fandomPreviews;
}

/**
 * Get distinct brand types with at least one product
 * Useful for brand directory
 */
export async function getDistinctBrandTypes() {
  return prisma.brand.findMany({
    distinct: ["type"],
    orderBy: {
      type: "asc",
    },
    select: {
      type: true,
      _count: {
        select: { productsAsSeller: true },
      },
    },
    where: {
      type: { not: null },
      productsAsSeller: { some: {} },
    },
  });
}
