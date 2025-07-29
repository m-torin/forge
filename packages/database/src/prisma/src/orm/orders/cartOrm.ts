'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// CART CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCartOrm(args: Prisma.CartCreateArgs) {
  try {
    return await prisma.cart.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstCartOrm(args?: Prisma.CartFindFirstArgs) {
  return await prisma.cart.findFirst(args);
}

export async function findUniqueCartOrm(args: Prisma.CartFindUniqueArgs) {
  return await prisma.cart.findUnique(args);
}

export async function findManyCartsOrm(args?: Prisma.CartFindManyArgs) {
  return await prisma.cart.findMany(args);
}

// UPDATE
export async function updateCartOrm(args: Prisma.CartUpdateArgs) {
  try {
    return await prisma.cart.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cart not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyCartsOrm(args: Prisma.CartUpdateManyArgs) {
  return await prisma.cart.updateMany(args);
}

// UPSERT
export async function upsertCartOrm(args: Prisma.CartUpsertArgs) {
  try {
    return await prisma.cart.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteCartOrm(args: Prisma.CartDeleteArgs) {
  try {
    return await prisma.cart.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cart not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyCartsOrm(args?: Prisma.CartDeleteManyArgs) {
  return await prisma.cart.deleteMany(args);
}

// AGGREGATE
export async function aggregateCartsOrm(args?: Prisma.CartAggregateArgs) {
  return await prisma.cart.aggregate(args ?? {});
}

export async function countCartsOrm(args?: Prisma.CartCountArgs) {
  return await prisma.cart.count(args);
}

export async function groupByCartsOrm(args: Prisma.CartGroupByArgs) {
  return await prisma.cart.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find carts by user ID
 */
export async function findCartsByUserOrm(userId: string, additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts by session ID
 */
export async function findCartsBySessionOrm(
  sessionId: string,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sessionId: sessionId,
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts that have a user set (not null)
 */
export async function findCartsWithUserOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: {
        not: null,
      },
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts that don't have a user (guest carts)
 */
export async function findGuestCartsOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: null,
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts that have a session ID set (not null)
 */
export async function findCartsWithSessionOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sessionId: {
        not: null,
      },
    },
  };
  return await prisma.cart.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Cart model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find carts that have a user relationship
 */
export async function findCartsWithUserRelationOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      user: {
        isNot: null,
      },
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts that have cart items
 */
export async function findCartsWithItemsOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      items: {
        some: {},
      },
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find empty carts (no cart items)
 */
export async function findEmptyCartsOrm(additionalArgs?: Prisma.CartFindManyArgs) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      items: {
        none: {},
      },
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find cart with all relations included
 */
export async function findCartWithAllRelationsOrm(id: string) {
  return await prisma.cart.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find carts created after a specific date
 */
export async function findCartsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find carts updated after a specific date
 */
export async function findCartsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find recently created or updated carts within specified days
 */
export async function findRecentCartsOrm(
  days: number = 7,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Find abandoned carts (not updated recently)
 */
export async function findAbandonedCartsOrm(
  days: number = 7,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        lt: cutoffDate,
      },
      items: {
        some: {}, // Only carts with items
      },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  };
  return await prisma.cart.findMany(args);
}

/**
 * Merge guest cart into user cart
 */
export async function mergeCartOrm(fromCartId: string, toCartId: string) {
  return await prisma.$transaction(async tx => {
    // Move all cart items from guest cart to user cart
    await tx.cartItem.updateMany({
      where: { cartId: fromCartId },
      data: { cartId: toCartId },
    });

    // Delete the guest cart
    await tx.cart.delete({
      where: { id: fromCartId },
    });

    // Return the updated user cart
    return await tx.cart.findUnique({
      where: { id: toCartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  });
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find cart by user or session (leverages unique constraints)
 */
export async function findCartByUserOrSessionOrm(userId?: string, sessionId?: string) {
  if (userId) {
    return await prisma.cart.findUnique({
      where: { userId },
    });
  }

  if (sessionId) {
    return await prisma.cart.findFirst({
      where: { sessionId },
    });
  }

  return null;
}

/**
 * Calculate cart total and item count
 */
export async function calculateCartSummaryOrm(cartId: string) {
  const result = await prisma.cartItem.aggregate({
    where: {
      cartId: cartId,
      savedForLater: false, // Only active items
    },
    _sum: {
      price: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalPrice: result._sum.price || 0,
    itemCount: result._count.id,
  };
}

/**
 * Find carts with high item counts (potential bulk orders)
 */
export async function findHighItemCountCartsOrm(
  minItemCount: number = 10,
  additionalArgs?: Prisma.CartFindManyArgs,
) {
  const args: Prisma.CartFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      items: {
        some: {},
      },
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  };

  const carts = await prisma.cart.findMany(args);

  // Filter by item count (Prisma doesn't support direct count filtering in where)
  return carts.filter(cart => (cart as any)._count?.items >= minItemCount);
}

/**
 * Clean up empty abandoned carts
 */
export async function cleanupEmptyAbandonedCartsOrm(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await prisma.cart.deleteMany({
    where: {
      updatedAt: {
        lt: cutoffDate,
      },
      items: {
        none: {},
      },
    },
  });
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Cart with user relation
 */
export type CartWithUser = Prisma.CartGetPayload<{
  include: { user: true };
}>;

/**
 * Cart with cart items relation
 */
export type CartWithItems = Prisma.CartGetPayload<{
  include: { items: true };
}>;

/**
 * Cart with cart items and products
 */
export type CartWithItemsAndProducts = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        variant: true;
      };
    };
  };
}>;

/**
 * Cart with all relations for complete data access
 */
export type CartWithAllRelations = Prisma.CartGetPayload<{
  include: {
    user: true;
    items: {
      include: {
        product: true;
        variant: true;
      };
    };
  };
}>;

/**
 * Cart summary for cart display
 */
export type CartSummary = Prisma.CartGetPayload<{
  select: {
    id: true;
    userId: true;
    sessionId: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        items: true;
      };
    };
  };
}>;
