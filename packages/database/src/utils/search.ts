import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Search products with fuzzy text matching and weighted ranking
 * Leverages PostgreSQL trigram indexes and full-text search capabilities
 */
export async function searchProducts(
  query: string,
  options?: {
    categories?: string[];
    limit?: number;
    includeUnavailable?: boolean;
  },
) {
  // Default options
  const limit = options?.limit || 20;
  const includeUnavailable = options?.includeUnavailable || false;

  // Base search criteria using Prisma's built-in search
  const baseWhere: Prisma.ProductWhereInput = {
    OR: [
      { name: { search: query } },
      { fullMarkdown: { search: query } },
      { previewCopy: { search: query } },
    ],
  };

  // Add category filter if provided
  if (options?.categories && options.categories.length > 0) {
    baseWhere.category = {
      slug: { in: options.categories },
    };
  }

  // Add availability filter
  if (!includeUnavailable) {
    baseWhere.sellerRelationships = {
      some: {
        isAvailable: true,
      },
    };
  }

  // Execute the search
  return prisma.product.findMany({
    include: {
      canonicalUrl: true,
      category: true,
      sellerRelationships: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: 3, // Just include top 3 seller relationships
        where: includeUnavailable ? {} : { isAvailable: true },
      },
    },
    take: limit,
    where: baseWhere,
  });
}

/**
 * Advanced search using PostgreSQL's native similarity features
 * Provides more control over the search algorithm and ranking
 */
export async function advancedSearch(
  query: string,
  options?: {
    categories?: string[];
    limit?: number;
    threshold?: number; // similarity threshold (0-1)
  },
) {
  const limit = options?.limit || 20;
  const threshold = options?.threshold || 0.3;
  const categoryFilter = options?.categories?.length
    ? `AND pc.slug IN (${options.categories.map((c) => `'${c}'`).join(",")})`
    : "";

  // Use raw SQL for advanced control over the search algorithm
  const products = await prisma.$queryRaw<any[]>`
    SELECT
      p.id,
      p.name,
      p.slug,
      pc.name as category_name,
      similarity(p.name, ${query}) * 2.0 +
      similarity(COALESCE(p.full_markdown, ''), ${query}) * 0.5 +
      similarity(COALESCE(p.preview_copy, ''), ${query}) * 0.8 AS rank
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    WHERE
      (similarity(p.name, ${query}) > ${threshold} OR
       similarity(COALESCE(p.full_markdown, ''), ${query}) > ${threshold} OR
       similarity(COALESCE(p.preview_copy, ''), ${query}) > ${threshold})
      ${Prisma.raw(categoryFilter)}
    ORDER BY rank DESC
    LIMIT ${limit};
  `;

  // If you need the associated relationships, fetch them separately
  if (products.length > 0) {
    const productIds = products.map((p: { id: number }) => p.id);
    const relationships = await prisma.productSellerBrand.findMany({
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
        isAvailable: true,
        productId: { in: productIds },
      },
    });

    // Group relationships by product ID
    const relationshipsByProduct = relationships.reduce(
      (
        acc: Record<number, typeof relationships>,
        rel: { productId: number; [key: string]: any },
      ) => {
        if (!acc[rel.productId]) {
          acc[rel.productId] = [];
        }
        acc[rel.productId].push(rel);
        return acc;
      },
      {} as Record<number, typeof relationships>,
    );

    // Attach relationships to products
    return products.map((product: { id: number; [key: string]: any }) => ({
      ...product,
      sellerRelationships: relationshipsByProduct[product.id] || [],
    }));
  }

  return products;
}

/**
 * Search stories with fuzzy matching
 */
export async function searchStories(query: string, limit = 20) {
  return prisma.story.findMany({
    include: {
      cast: true,
      fandom: true,
    },
    take: limit,
    where: {
      OR: [
        { name: { search: query } },
        { fullMarkdown: { search: query } },
        { shortDescription: { search: query } },
        { fullDescription: { search: query } },
      ],
    },
  });
}
