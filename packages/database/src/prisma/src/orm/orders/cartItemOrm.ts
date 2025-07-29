'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new cart item
 */
export async function createCartItemOrm(args: Prisma.CartItemCreateArgs) {
  try {
    return await prisma.cartItem.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first cart item matching criteria
 */
export async function findFirstCartItemOrm(args?: Prisma.CartItemFindFirstArgs) {
  return await prisma.cartItem.findFirst(args);
}

/**
 * Find unique cart item by ID
 */
export async function findUniqueCartItemOrm(args: Prisma.CartItemFindUniqueArgs) {
  return await prisma.cartItem.findUnique(args);
}

/**
 * Find unique cart item or throw error if not found
 */
export async function findUniqueCartItemOrmOrThrow(args: Prisma.CartItemFindUniqueOrThrowArgs) {
  try {
    return await prisma.cartItem.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many cart items with optional filtering
 */
export async function findManyCartItemsOrm(args?: Prisma.CartItemFindManyArgs) {
  return await prisma.cartItem.findMany(args);
}

/**
 * Update an existing cart item
 */
export async function updateCartItemOrm(args: Prisma.CartItemUpdateArgs) {
  try {
    return await prisma.cartItem.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many cart items matching criteria
 */
export async function updateManyCartItemsOrm(args: Prisma.CartItemUpdateManyArgs) {
  return await prisma.cartItem.updateMany(args);
}

/**
 * Create or update cart item (upsert)
 */
export async function upsertCartItemOrm(args: Prisma.CartItemUpsertArgs) {
  try {
    return await prisma.cartItem.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete a cart item
 */
export async function deleteCartItemOrm(args: Prisma.CartItemDeleteArgs) {
  try {
    return await prisma.cartItem.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many cart items matching criteria
 */
export async function deleteManyCartItemsOrm(args?: Prisma.CartItemDeleteManyArgs) {
  return await prisma.cartItem.deleteMany(args);
}

/**
 * Aggregate cart item data
 */
export async function aggregateCartItemsOrm(args?: Prisma.CartItemAggregateArgs) {
  return await prisma.cartItem.aggregate(args ?? {});
}

/**
 * Count cart items matching criteria
 */
export async function countCartItemsOrm(args?: Prisma.CartItemCountArgs) {
  return await prisma.cartItem.count(args);
}

/**
 * Group cart items by specified fields
 */
export async function groupByCartItemsOrm(args: Prisma.CartItemGroupByArgs) {
  return await prisma.cartItem.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find cart items by cart ID (leverages cartId in unique constraint)
 */
export async function findCartItemsByCartOrm(
  cartId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cartId: cartId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by product ID (leverages productId index)
 */
export async function findCartItemsByProductOrm(
  productId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: productId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by variant ID (leverages variantId index)
 */
export async function findCartItemsByVariantOrm(
  variantId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: variantId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that have a product set (not null)
 */
export async function findCartItemsWithProductOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: {
        not: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that don't have a product (null)
 */
export async function findCartItemsWithoutProductOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: null,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that have a variant set (not null)
 */
export async function findCartItemsWithVariantOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: {
        not: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that don't have a variant (null)
 */
export async function findCartItemsWithoutVariantOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: null,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find gift cart items
 */
export async function findGiftCartItemsOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isGift: true,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find non-gift cart items
 */
export async function findNonGiftCartItemsOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isGift: false,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items with gift messages
 */
export async function findCartItemsWithGiftMessageOrm(
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      giftMessage: {
        not: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items saved for later
 */
export async function findSavedForLaterCartItemsOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      savedForLater: true,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find active cart items (not saved for later)
 */
export async function findActiveCartItemsOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      savedForLater: false,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by registry ID
 */
export async function findCartItemsByRegistryOrm(
  registryId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registryId: registryId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that have a registry (not null)
 */
export async function findCartItemsWithRegistryOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registryId: {
        not: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that don't have a registry (null)
 */
export async function findCartItemsWithoutRegistryOrm(
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registryId: null,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by quantity range
 */
export async function findCartItemsByQuantityRangeOrm(
  minQuantity: number,
  maxQuantity: number,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gte: minQuantity,
        lte: maxQuantity,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by price range
 */
export async function findCartItemsByPriceRangeOrm(
  minPrice: number,
  maxPrice: number,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// CartItem model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find cart items that have a cart relationship
 * Note: cartId is required, so all cart items have carts
 */
export async function findCartItemsWithCartOrm(additionalArgs?: Prisma.CartItemFindManyArgs) {
  // Since cartId is required, all cart items have carts
  return await prisma.cartItem.findMany(additionalArgs);
}

/**
 * Find cart items that have a product relationship
 */
export async function findCartItemsWithProductRelationOrm(
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      product: {
        isNot: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that have a variant relationship
 */
export async function findCartItemsWithVariantRelationOrm(
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variant: {
        isNot: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items that have a registry relationship
 */
export async function findCartItemsWithRegistryRelationOrm(
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registry: {
        isNot: null,
      },
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart item with all relations included
 */
export async function findCartItemWithAllRelationsOrm(id: string) {
  return await prisma.cartItem.findUnique({
    where: { id },
    include: {
      cart: true,
      product: true,
      variant: true,
      registry: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find cart items created after a specific date
 */
export async function findCartItemsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
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
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items updated after a specific date
 */
export async function findCartItemsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
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
  return await prisma.cartItem.findMany(args);
}

/**
 * Find recently created or updated cart items within specified days
 */
export async function findRecentCartItemsOrm(
  days: number = 7,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.CartItemFindManyArgs = {
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
  return await prisma.cartItem.findMany(args);
}

/**
 * Move cart item to saved for later
 */
export async function moveCartItemToSavedForLaterOrm(id: string) {
  try {
    return await prisma.cartItem.update({
      where: { id },
      data: {
        savedForLater: true,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found for move to saved: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Move cart item back to active cart
 */
export async function moveCartItemToActiveOrm(id: string) {
  try {
    return await prisma.cartItem.update({
      where: { id },
      data: {
        savedForLater: false,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found for move to active: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantityOrm(id: string, quantity: number) {
  try {
    return await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: quantity,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`CartItem not found for quantity update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find specific cart item by cart, product, and variant (leverages unique constraint)
 */
export async function findCartItemByCartProductVariantOrm(
  cartId: string,
  productId: string | null,
  variantId: string | null,
) {
  // If productId or variantId is null, the unique constraint can't be used
  if (!productId || !variantId) {
    return await prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId,
      },
    });
  }

  return await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId,
        productId,
        variantId,
      },
    },
  });
}

/**
 * Find cart items by cart and product (leverages indexes)
 */
export async function findCartItemsByCartAndProductOrm(
  cartId: string,
  productId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cartId: cartId,
      productId: productId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Find cart items by cart and variant (leverages indexes)
 */
export async function findCartItemsByCartAndVariantOrm(
  cartId: string,
  variantId: string,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cartId: cartId,
      variantId: variantId,
    },
  };
  return await prisma.cartItem.findMany(args);
}

/**
 * Calculate cart total value
 */
export async function calculateCartTotalOrm(cartId: string) {
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
 * Find cart items with high quantities (potential bulk orders)
 */
export async function findHighQuantityCartItemsOrm(
  minQuantity: number = 10,
  additionalArgs?: Prisma.CartItemFindManyArgs,
) {
  const args: Prisma.CartItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gte: minQuantity,
      },
    },
    orderBy: {
      quantity: 'desc',
    },
  };
  return await prisma.cartItem.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * CartItem with cart relation
 */
export type CartItemWithCart = Prisma.CartItemGetPayload<{
  include: { cart: true };
}>;

/**
 * CartItem with product relation
 */
export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

/**
 * CartItem with variant relation
 */
export type CartItemWithVariant = Prisma.CartItemGetPayload<{
  include: { variant: true };
}>;

/**
 * CartItem with registry relation
 */
export type CartItemWithRegistry = Prisma.CartItemGetPayload<{
  include: { registry: true };
}>;

/**
 * CartItem with all relations for complete data access
 */
export type CartItemWithAllRelations = Prisma.CartItemGetPayload<{
  include: {
    cart: true;
    product: true;
    variant: true;
    registry: true;
  };
}>;

/**
 * CartItem summary for cart display
 */
export type CartItemSummary = Prisma.CartItemGetPayload<{
  select: {
    id: true;
    quantity: true;
    price: true;
    isGift: true;
    savedForLater: true;
    productId: true;
    variantId: true;
    product: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    variant: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
