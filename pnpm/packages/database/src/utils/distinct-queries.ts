import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get one product from each category - optimized with nativeDistinct
 * Useful for creating category showcase sections
 */
export async function getCategoryShowcaseProducts() {
  return prisma.product.findMany({
    distinct: ['categoryId'],
    where: {
      sellerRelationships: {
        some: {
          isAvailable: true,
          discountPercent: { gt: 0 }
        }
      }
    },
    include: {
      category: true,
      sellerRelationships: {
        take: 1,
        where: { isAvailable: true },
        orderBy: { discountPercent: 'desc' }
      },
      canonicalUrl: true
    },
    orderBy: {
      name: 'asc'
    }
  });
}

/**
 * Get all distinct sellers for a specific product category
 * Useful for marketplace filtering
 */
export async function getDistinctSellersForCategory(categoryId: number) {
  return prisma.productSellerBrand.findMany({
    where: {
      product: { categoryId }
    },
    distinct: ['sellerId'],
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}

/**
 * Get distinct products for a given story
 * Useful when a story has multiple entries for the same product with different sellers
 */
export async function getDistinctStoryProducts(storyId: number) {
  return prisma.product.findMany({
    where: {
      stories: {
        some: { id: storyId }
      }
    },
    distinct: ['id'],
    include: {
      sellerRelationships: {
        take: 1,
        where: { isAvailable: true },
        orderBy: { priceSale: 'asc' }
      },
      category: true
    }
  });
}

/**
 * Get distinct product types (variants) by media type
 * Useful for faceted navigation
 */
export async function getDistinctMediaTypes() {
  return prisma.productVariant.findMany({
    where: {
      mediaType: { not: null }
    },
    distinct: ['mediaType'],
    select: {
      mediaType: true
    }
  });
}

/**
 * Get distinct fandoms with story counts - for homepage sections
 */
export async function getDistinctFandomsWithStories() {
  const fandoms = await prisma.fandom.findMany({
    include: {
      _count: {
        select: { stories: true }
      }
    }
  });

  // Get one story from each fandom for preview
  const fandomPreviews = await Promise.all(
    fandoms.map(async (fandom) => {
      const previewStory = await prisma.story.findFirst({
        where: { fandomId: fandom.id },
        orderBy: { productCount: 'desc' },
        include: {
          products: {
            take: 1
          }
        }
      });
      
      return {
        ...fandom,
        previewStory
      };
    })
  );
  
  return fandomPreviews;
}

/**
 * Get distinct brand types with at least one product
 * Useful for brand directory
 */
export async function getDistinctBrandTypes() {
  return prisma.brand.findMany({
    where: {
      type: { not: null },
      productsAsSeller: { some: {} }
    },
    distinct: ['type'],
    select: {
      type: true,
      _count: {
        select: { productsAsSeller: true }
      }
    },
    orderBy: {
      type: 'asc'
    }
  });
}
