"use server";

import { unstable_cache } from "next/cache";
import {
  findManyCollections,
  findFirstCollection,
  countCollections,
} from "../../orm/ecommerce";

// Types for collection queries
export interface CollectionsQueryOptions {
  page?: number;
  limit?: number;
  type?: string;
  sort?: "newest" | "name" | "popular";
}

export interface CollectionWithProducts {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  copy: any;
  createdAt: Date;
  updatedAt: Date;
  products?: Array<{
    id: string;
    name: string;
    sku: string;
    price: number | null;
    media?: Array<{
      id: string;
      url: string;
      altText: string | null;
    }>;
  }>;
  _count?: {
    products: number;
  };
}

// Server action to get collections
export async function getCollections(options: CollectionsQueryOptions = {}) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const { limit = 20, page = 1, sort = "newest", type } = options;

      const where: any = {
        deletedAt: null,
        status: "ACTIVE",
      };

      if (type) {
        where.type = type;
      }

      const orderBy: any = {};
      switch (sort) {
        case "name":
          orderBy.name = "asc";
          break;
        case "popular":
          orderBy.updatedAt = "desc";
          break;
        case "newest":
        default:
          orderBy.createdAt = "desc";
          break;
      }

      const [collections, totalCount] = await Promise.all([
        findManyCollections({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
            copy: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        }),
        countCollections({ where }),
      ]);

      return {
        collections: collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description: (collection.copy as any)?.description || "",
          productCount: collection._count.products,
          type: collection.type,
        })),
        currentPage: page,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },
    ["collections"],
    {
      revalidate: 3600,
      tags: ["collections"],
    },
  );

  return cached();
}

// Server action to get collection by handle
export async function getCollectionByHandle(handle: string) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const collection = await findFirstCollection({
        where: {
          OR: [
            { id: handle },
            { slug: handle },
          ],
          deletedAt: null,
          status: "ACTIVE",
        },
        include: {
          products: {
            take: 20,
            where: {
              deletedAt: null,
              status: "ACTIVE",
            },
            include: {
              media: {
                orderBy: { createdAt: "asc" },
                take: 1,
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      return collection as unknown as CollectionWithProducts | null;
    },
    [`collection-${handle}`],
    {
      revalidate: 3600,
      tags: [`collection-${handle}`, "collections"],
    },
  );

  return cached();
}

// Server action to get featured collections
export async function getFeaturedCollections(limit = 6) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const collections = await findManyCollections({
        where: {
          deletedAt: null,
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        include: {
          products: {
            take: 4,
            where: {
              deletedAt: null,
              status: "ACTIVE",
            },
            include: {
              media: {
                orderBy: { createdAt: "asc" },
                take: 1,
              },
            },
          },
        },
      });

      return collections as unknown as CollectionWithProducts[];
    },
    ["featured-collections"],
    {
      revalidate: 3600,
      tags: ["collections"],
    },
  );

  return cached();
}

// Get collection with full relations including all associated data
export async function getCollectionWithFullRelations(handle: string) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const collection = await findFirstCollection({
        where: {
          OR: [
            { id: handle },
            { slug: handle },
          ],
          deletedAt: null,
          status: "ACTIVE",
        },
        include: {
          // Products with media (many-to-many)
          products: {
            where: {
              deletedAt: null,
              status: "ACTIVE",
            },
            include: {
              media: {
                orderBy: { createdAt: "asc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          },
          
          // Brands (many-to-many)
          brands: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          
          // Taxonomies (many-to-many)
          taxonomies: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
          
          // Categories (many-to-many)
          categories: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
          
          // Media
          media: {
            orderBy: { createdAt: "asc" },
          },
          
          // Counts
          _count: {
            select: {
              products: true,
              brands: true,
              taxonomies: true,
              categories: true,
            },
          },
        },
      });

      return collection;
    },
    [`collection-full-${handle}`],
    {
      revalidate: 3600,
      tags: [`collection-${handle}`, "collections"],
    },
  );

  return cached();
}

// Update collection with product associations
export async function updateCollectionProducts(
  collectionId: string,
  productIds: string[],
) {
  "use server";

  const { updateCollection } = await import("../../orm/ecommerce");

  await updateCollection({
    where: { id: collectionId },
    data: {
      products: {
        set: [], // Disconnect all existing
        connect: productIds.map(id => ({ id })), // Connect new ones
      },
      updatedAt: new Date(),
    },
  });

  // Revalidate caches
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`collection-${collectionId}`);
  revalidateTag("collections");
}

// Add products to collection (many-to-many)
export async function addProductsToCollection(
  collectionId: string,
  productIds: string[],
) {
  "use server";

  const { updateCollection } = await import("../../orm/ecommerce");

  await updateCollection({
    where: { id: collectionId },
    data: {
      products: {
        connect: productIds.map(id => ({ id })),
      },
      updatedAt: new Date(),
    },
  });

  // Revalidate caches
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`collection-${collectionId}`);
  revalidateTag("collections");
}

// Remove products from collection (many-to-many)
export async function removeProductsFromCollection(
  collectionId: string,
  productIds: string[],
) {
  "use server";

  const { updateCollection } = await import("../../orm/ecommerce");

  await updateCollection({
    where: { id: collectionId },
    data: {
      products: {
        disconnect: productIds.map(id => ({ id })),
      },
      updatedAt: new Date(),
    },
  });

  // Revalidate caches
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`collection-${collectionId}`);
  revalidateTag("collections");
}