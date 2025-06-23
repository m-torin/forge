'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyFavoritesOrm,
  countFavoritesOrm,
  createFavoriteOrm,
  deleteFavoriteOrm,
  findFirstFavoriteOrm,
  deleteManyFavoritesOrm,
  groupByFavoritesOrm,
  findManyUsersOrm,
  findManyProductsOrm,
  findManyCollectionsOrm,
  findUniqueFavoriteOrm,
  findUniqueProductOrm,
  findUniqueCollectionOrm,
  findManyFavoriteJoinsOrm,
  prisma,
} from '@repo/database/prisma';

/**
 * Favorites management actions for PIM3
 *
 * These actions provide user favorites management functionality:
 * - Favorite CRUD operations
 * - User favorites tracking
 * - Product and collection favorites
 * - Analytics and reporting
 */

// Get favorites with pagination and filtering
export async function getFavorites(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  productId?: string;
  collectionId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const {
      limit = 50,
      page = 1,
      userId,
      productId,
      collectionId,
      search,
      startDate,
      endDate,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.FavoriteJoinWhereInput = {
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { collection: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(userId && { userId }),
      ...(productId && { productId }),
      ...(collectionId && { collectionId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [favorites, total] = await Promise.all([
      findManyFavoritesOrm({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              price: true,
              currency: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        where,
      }),
      countFavoritesOrm({ where }),
    ]);

    return {
      data: favorites,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load favorites', success: false as const };
  }
}

// Get a single favorite by ID
export async function getFavorite(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const favorite = await findUniqueFavoriteOrm({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            price: true,
            currency: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
      where: { id },
    });

    if (!favorite) {
      return { error: 'Favorite not found', success: false as const };
    }

    return { data: favorite, success: true as const };
  } catch (error) {
    return { error: 'Failed to load favorite', success: false as const };
  }
}

// Create a new favorite
export async function createFavorite(data: {
  userId: string;
  productId?: string;
  collectionId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Validate that either productId or collectionId is provided
    if (!data.productId && !data.collectionId) {
      return {
        error: 'Either productId or collectionId must be provided',
        success: false as const,
      };
    }

    // Check if favorite already exists
    const existingFavorite = await findFirstFavoriteOrm({
      where: {
        userId: data.userId,
        productId: data.productId || null,
        collectionId: data.collectionId || null,
      },
    });

    if (existingFavorite) {
      return { error: 'Item is already in favorites', success: false as const };
    }

    const favorite = await createFavoriteOrm({
      data: {
        userId: data.userId,
        productId: data.productId,
        collectionId: data.collectionId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/pim3/favorites');
    return { data: favorite, success: true as const };
  } catch (error) {
    return { error: 'Failed to create favorite', success: false as const };
  }
}

// Remove a favorite
export async function deleteFavorite(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const favorite = await deleteFavoriteOrm({
      where: { id },
    });

    revalidatePath('/pim3/favorites');
    return { data: favorite, success: true as const };
  } catch (error) {
    return { error: 'Failed to remove favorite', success: false as const };
  }
}

// Remove favorite by user and item
export async function removeFavoriteByItem(data: {
  userId: string;
  productId?: string;
  collectionId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const favorite = await deleteManyFavoritesOrm({
      where: {
        userId: data.userId,
        productId: data.productId || null,
        collectionId: data.collectionId || null,
      },
    });

    revalidatePath('/pim3/favorites');
    return { data: favorite, success: true as const };
  } catch (error) {
    return { error: 'Failed to remove favorite', success: false as const };
  }
}

// Get user's favorites
export async function getUserFavorites(
  userId: string,
  params?: {
    type?: 'product' | 'collection';
    page?: number;
    limit?: number;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { type, page = 1, limit = 50 } = params || {};
    const skip = (page - 1) * limit;

    const where: Prisma.FavoriteJoinWhereInput = {
      userId,
      ...(type === 'product' && { productId: { not: null } }),
      ...(type === 'collection' && { collectionId: { not: null } }),
    };

    const [favorites, total] = await Promise.all([
      findManyFavoritesOrm({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              price: true,
              currency: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        where,
      }),
      countFavoritesOrm({ where }),
    ]);

    return {
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load user favorites', success: false as const };
  }
}

// Bulk remove favorites
export async function bulkDeleteFavorites(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await deleteManyFavoritesOrm({
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/favorites');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to remove favorites', success: false as const };
  }
}

// Get favorites analytics
export async function getFavoritesAnalytics(params?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { startDate, endDate, userId } = params || {};

    const where: Prisma.FavoriteJoinWhereInput = {
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(userId && { userId }),
    };

    const [totalFavorites, productFavorites, collectionFavorites, uniqueUsers, recentFavorites] =
      await Promise.all([
        countFavoritesOrm({ where }),
        countFavoritesOrm({ where: { ...where, productId: { not: null } } }),
        countFavoritesOrm({ where: { ...where, collectionId: { not: null } } }),
        findManyFavoriteJoinsOrm({
          select: { userId: true },
          where,
          distinct: ['userId'],
        }).then((users) => users.length),
        findManyFavoritesOrm({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ createdAt: 'desc' }],
          take: 10,
          where,
        }),
      ]);

    const averageFavoritesPerUser = uniqueUsers > 0 ? totalFavorites / uniqueUsers : 0;

    return {
      data: {
        totalFavorites,
        productFavorites,
        collectionFavorites,
        uniqueUsers,
        averageFavoritesPerUser: Number(averageFavoritesPerUser.toFixed(2)),
        recentFavorites,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load favorites analytics', success: false as const };
  }
}

// Get most favorited items
export async function getMostFavoritedItems(params?: {
  type?: 'product' | 'collection';
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { type, limit = 10, startDate, endDate } = params || {};

    const where: Prisma.FavoriteJoinWhereInput = {
      ...(type === 'product' && { productId: { not: null } }),
      ...(type === 'collection' && { collectionId: { not: null } }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    if (type === 'product' || !type) {
      const productFavorites = await groupByFavoritesOrm({
        by: ['productId'],
        where: { ...where, productId: { not: null } },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: limit,
      });

      const productDetails = await Promise.all(
        productFavorites.map(async (item) => {
          const product = await findUniqueProductOrm({
            where: { id: item.productId! },
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              price: true,
              currency: true,
            },
          });
          return {
            product,
            favoriteCount: item._count.productId,
          };
        }),
      );

      return {
        data: {
          products: productDetails.filter((item) => item.product),
        },
        success: true as const,
      };
    }

    if (type === 'collection') {
      const collectionFavorites = await groupByFavoritesOrm({
        by: ['collectionId'],
        where: { ...where, collectionId: { not: null } },
        _count: { collectionId: true },
        orderBy: { _count: { collectionId: 'desc' } },
        take: limit,
      });

      const collectionDetails = await Promise.all(
        collectionFavorites.map(async (item) => {
          const collection = await findUniqueCollectionOrm({
            where: { id: item.collectionId! },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          });
          return {
            collection,
            favoriteCount: item._count.collectionId,
          };
        }),
      );

      return {
        data: {
          collections: collectionDetails.filter((item) => item.collection),
        },
        success: true as const,
      };
    }

    return { data: {}, success: true as const };
  } catch (error) {
    return { error: 'Failed to load most favorited items', success: false as const };
  }
}
