"use server";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import {
  findManyProducts,
  findFirstProduct,
  countProducts,
  updateProduct,
  createPdpJoin,
  deleteManyPdpJoins,
} from "../../orm/ecommerce";

// Types for product queries
export interface ProductsQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  sort?: "price" | "newest" | "name";
  search?: string;
}

export interface ProductWithMedia {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number | null;
  currency: string | null;
  type: string;
  status: string;
  attributes: any;
  createdAt: Date;
  updatedAt: Date;
  media: Array<{
    id: string;
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    type: string;
  }>;
  categories?: Array<{
    id: string;
    categoryId: string;
    productId: string;
  }>;
}

// Cached product fetching with tags
const getCachedProducts = unstable_cache(
  async (options: ProductsQueryOptions) => {
    const { limit = 20, page = 1, sort = "newest", category, brand, search } = options;

    // Build where clause
    const where: any = {
      deletedAt: null,
      status: "ACTIVE",
    };

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (search && search.length > 1) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    const orderBy: any = {};
    switch (sort) {
      case "price":
        orderBy.price = "asc";
        break;
      case "name":
        orderBy.name = "asc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      findManyProducts({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          media: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
          categories: true,
        },
      }),
      countProducts({ where }),
    ]);

    return {
      currentPage: page,
      products: products as unknown as ProductWithMedia[],
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  },
  ["products"],
  {
    revalidate: 3600, // 1 hour cache
    tags: ["products"],
  },
);

// Server action to get products
export async function getProducts(
  options: ProductsQueryOptions = {},
) {
  return getCachedProducts(options);
}

// Server action to get product by handle (id or sku)
export async function getProductByHandle(handle: string) {
  const cachedProduct = unstable_cache(
    async (productHandle: string) => {
      const product = await findFirstProduct({
        where: {
          OR: [
            { id: productHandle },
            { sku: productHandle },
          ],
          deletedAt: null,
          status: "ACTIVE",
        },
        include: {
          media: {
            orderBy: { createdAt: "asc" },
          },
          categories: true,
          barcodes: true,
        },
      });

      return product as unknown as ProductWithMedia | null;
    },
    [`product-${handle}`],
    {
      revalidate: 3600,
      tags: [`product-${handle}`, "products"],
    },
  );

  return cachedProduct(handle);
}

// Server action to get real-time inventory
export async function getProductInventory(productId: string) {
  "use server";

  const product = await findFirstProduct({
    where: { id: productId },
    select: {
      id: true,
      attributes: true,
      updatedAt: true,
    },
  });

  if (!product) {
    return null;
  }

  // Extract inventory from attributes JSON if available
  const attributes = product.attributes as any;
  const inventory = attributes?.inventory || 100; // Default to 100 if not set

  return {
    available: inventory,
    lastUpdated: product.updatedAt.toISOString(),
    productId: product.id,
    reserved: 0, // This would come from orders/cart data
  };
}

// Server action to get real-time pricing
export async function getProductPricing(
  productId: string,
  options?: {
    currency?: string;
    customerGroup?: string;
  },
) {
  "use server";

  const product = await findFirstProduct({
    where: { id: productId },
    select: {
      id: true,
      price: true,
      attributes: true,
    },
  });

  if (!product || !product.price) {
    return null;
  }

  const basePrice = Number(product.price);
  const attributes = product.attributes as any;
  const compareAtPrice = attributes?.compareAtPrice ? Number(attributes.compareAtPrice) : null;
  const discount = options?.customerGroup === "vip" ? 0.1 : 0;

  return {
    basePrice,
    compareAtPrice,
    currency: options?.currency || "USD",
    discount,
    finalPrice: basePrice * (1 - discount),
    productId: product.id,
  };
}

// Server action to track product view
export async function trackProductView(productId: string) {
  "use server";

  try {
    // Update the product's updatedAt timestamp as a proxy for view tracking
    // In production, you'd track views in a separate analytics table
    await updateProduct({
      where: { id: productId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Revalidate the product cache
    revalidateTag(`product-${productId}`);
  } catch (error) {
    console.error("Failed to track product view:", error);
  }
}

// Server action to get trending products
export async function getTrendingProducts(limit = 10) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const products = await findManyProducts({
        where: {
          deletedAt: null,
          status: "ACTIVE",
        },
        orderBy: [
          { updatedAt: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        include: {
          media: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      });

      return products as unknown as ProductWithMedia[];
    },
    ["trending-products"],
    {
      revalidate: 300, // 5 minutes for trending
      tags: ["trending"],
    },
  );

  return cached();
}

// Get product with full relations including join tables
export async function getProductWithFullRelations(handle: string) {
  "use server";

  const cachedProduct = unstable_cache(
    async (productHandle: string) => {
      const product = await findFirstProduct({
        where: {
          OR: [
            { id: productHandle },
            { sku: productHandle },
          ],
          deletedAt: null,
          status: "ACTIVE",
        },
        include: {
          // Direct relations
          media: {
            orderBy: { createdAt: "asc" },
          },
          barcodes: true,
          digitalAssets: true,
          
          // Many-to-many relations
          collections: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          taxonomies: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          
          // ProductCategory join table with nested category
          categories: {
            where: { deletedAt: null },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          
          // Reviews with user info
          reviews: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          
          // PdpJoin table for brand relations
          brands: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      return product;
    },
    [`product-full-${handle}`],
    {
      revalidate: 3600,
      tags: [`product-${handle}`, "products"],
    },
  );

  return cachedProduct(handle);
}

// Get products by brand using PdpJoin table
export async function getProductsByBrand(
  brandSlug: string,
  options: {
    page?: number;
    limit?: number;
    sort?: "price" | "newest" | "name";
  } = {},
) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const { limit = 20, page = 1, sort = "newest" } = options;

      const where: any = {
        deletedAt: null,
        status: "ACTIVE",
        brands: {
          some: {
            brand: {
              slug: brandSlug,
              deletedAt: null,
            },
          },
        },
      };

      const orderBy: any = {};
      switch (sort) {
        case "price":
          orderBy.price = "asc";
          break;
        case "name":
          orderBy.name = "asc";
          break;
        case "newest":
        default:
          orderBy.createdAt = "desc";
          break;
      }

      const [products, totalCount] = await Promise.all([
        findManyProducts({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            media: {
              orderBy: { createdAt: "asc" },
              take: 1,
            },
            brands: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        }),
        countProducts({ where }),
      ]);

      return {
        products,
        currentPage: page,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },
    [`products-brand-${brandSlug}`],
    {
      revalidate: 3600,
      tags: ["products", `brand-${brandSlug}`],
    },
  );

  return cached();
}

// Server action to search products
export async function searchProducts(
  query: string,
  options?: {
    limit?: number;
    filters?: Record<string, any>;
  },
) {
  "use server";

  if (!query || query.length < 2) {
    return { products: [], query, totalCount: 0 };
  }

  const where: any = {
    deletedAt: null,
    status: "ACTIVE",
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
    ],
  };

  // Apply additional filters if provided
  if (options?.filters) {
    Object.assign(where, options.filters);
  }

  const [products, totalCount] = await Promise.all([
    findManyProducts({
      where,
      take: options?.limit || 20,
      include: {
        media: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
    countProducts({ where }),
  ]);

  return {
    products: products as unknown as ProductWithMedia[],
    query,
    totalCount,
  };
}