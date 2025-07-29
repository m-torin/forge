'use server';

import type { OrderItemStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new order item
 */
export async function createOrderItemOrm(args: Prisma.OrderItemCreateArgs) {
  try {
    return await prisma.orderItem.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first order item matching criteria
 */
export async function findFirstOrderItemOrm(args?: Prisma.OrderItemFindFirstArgs) {
  return await prisma.orderItem.findFirst(args);
}

/**
 * Find unique order item by ID
 */
export async function findUniqueOrderItemOrm(args: Prisma.OrderItemFindUniqueArgs) {
  return await prisma.orderItem.findUnique(args);
}

/**
 * Find unique order item or throw error if not found
 */
export async function findUniqueOrderItemOrmOrThrow(args: Prisma.OrderItemFindUniqueOrThrowArgs) {
  try {
    return await prisma.orderItem.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many order items with optional filtering
 */
export async function findManyOrderItemsOrm(args?: Prisma.OrderItemFindManyArgs) {
  return await prisma.orderItem.findMany(args);
}

/**
 * Update an existing order item
 */
export async function updateOrderItemOrm(args: Prisma.OrderItemUpdateArgs) {
  try {
    return await prisma.orderItem.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many order items matching criteria
 */
export async function updateManyOrderItemsOrm(args: Prisma.OrderItemUpdateManyArgs) {
  return await prisma.orderItem.updateMany(args);
}

/**
 * Create or update order item (upsert)
 */
export async function upsertOrderItemOrm(args: Prisma.OrderItemUpsertArgs) {
  try {
    return await prisma.orderItem.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete an order item
 */
export async function deleteOrderItemOrm(args: Prisma.OrderItemDeleteArgs) {
  try {
    return await prisma.orderItem.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many order items matching criteria
 */
export async function deleteManyOrderItemsOrm(args?: Prisma.OrderItemDeleteManyArgs) {
  return await prisma.orderItem.deleteMany(args);
}

/**
 * Aggregate order item data
 */
export async function aggregateOrderItemsOrm(args?: Prisma.OrderItemAggregateArgs) {
  return await prisma.orderItem.aggregate(args ?? {});
}

/**
 * Count order items matching criteria
 */
export async function countOrderItemsOrm(args?: Prisma.OrderItemCountArgs) {
  return await prisma.orderItem.count(args);
}

/**
 * Group order items by specified fields
 */
export async function groupByOrderItemsOrm(args: Prisma.OrderItemGroupByArgs) {
  return await prisma.orderItem.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find order items by status using OrderItemStatus enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findOrderItemsByStatusOrm(
  status: OrderItemStatus,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find pending order items
 */
export async function findPendingOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PENDING',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find processing order items
 */
export async function findProcessingOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PROCESSING',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find fulfilled order items
 */
export async function findFulfilledOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'FULFILLED',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find cancelled order items
 */
export async function findCancelledOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'CANCELLED',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find refunded order items
 */
export async function findRefundedOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'REFUNDED',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by order ID
 */
export async function findOrderItemsByOrderOrm(
  orderId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by product ID (leverages productId index)
 */
export async function findOrderItemsByProductOrm(
  productId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: productId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by variant ID (leverages variantId index)
 */
export async function findOrderItemsByVariantOrm(
  variantId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: variantId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that have a product set (not null)
 */
export async function findOrderItemsWithProductOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: {
        not: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that don't have a product (null)
 */
export async function findOrderItemsWithoutProductOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: null,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that have a variant set (not null)
 */
export async function findOrderItemsWithVariantOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: {
        not: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that don't have a variant (null)
 */
export async function findOrderItemsWithoutVariantOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: null,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find gift order items
 */
export async function findGiftOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isGift: true,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find non-gift order items
 */
export async function findNonGiftOrderItemsOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isGift: false,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items with gift messages
 */
export async function findOrderItemsWithGiftMessageOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      giftMessage: {
        not: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by registry ID
 */
export async function findOrderItemsByRegistryOrm(
  registryId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registryId: registryId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that have a registry (not null)
 */
export async function findOrderItemsWithRegistryOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registryId: {
        not: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by SKU
 */
export async function findOrderItemsBySkuOrm(
  sku: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sku: sku,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by quantity range
 */
export async function findOrderItemsByQuantityRangeOrm(
  minQuantity: number,
  maxQuantity: number,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gte: minQuantity,
        lte: maxQuantity,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by price range
 */
export async function findOrderItemsByPriceRangeOrm(
  minPrice: number,
  maxPrice: number,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by total range
 */
export async function findOrderItemsByTotalRangeOrm(
  minTotal: number,
  maxTotal: number,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      total: {
        gte: minTotal,
        lte: maxTotal,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// OrderItem model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find order items that have an order relationship
 * Note: orderId is required, so all order items have orders
 */
export async function findOrderItemsWithOrderOrm(additionalArgs?: Prisma.OrderItemFindManyArgs) {
  // Since orderId is required, all order items have orders
  return await prisma.orderItem.findMany(additionalArgs);
}

/**
 * Find order items that have a product relationship
 */
export async function findOrderItemsWithProductRelationOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      product: {
        isNot: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that have a variant relationship
 */
export async function findOrderItemsWithVariantRelationOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variant: {
        isNot: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items that have a registry relationship
 */
export async function findOrderItemsWithRegistryRelationOrm(
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registry: {
        isNot: null,
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order item with all relations included
 */
export async function findOrderItemWithAllRelationsOrm(id: string) {
  return await prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: true,
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
 * Find order items created after a specific date
 */
export async function findOrderItemsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
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
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items updated after a specific date
 */
export async function findOrderItemsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
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
  return await prisma.orderItem.findMany(args);
}

/**
 * Find recently created or updated order items within specified days
 */
export async function findRecentOrderItemsOrm(
  days: number = 7,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.OrderItemFindManyArgs = {
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
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items fulfilled after a specific date
 */
export async function findOrderItemsFulfilledAfterOrm(
  date: Date,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fulfilledAt: {
        gte: date,
      },
    },
    orderBy: {
      fulfilledAt: 'desc',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Update order item status
 */
export async function updateOrderItemStatusOrm(
  id: string,
  status: OrderItemStatus,
  fulfilledAt?: Date,
) {
  try {
    return await prisma.orderItem.update({
      where: { id },
      data: {
        status: status,
        ...(status === 'FULFILLED' &&
          fulfilledAt && {
            fulfilledAt: fulfilledAt,
          }),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found for status update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Fulfill order item
 */
export async function fulfillOrderItemOrm(id: string) {
  try {
    return await prisma.orderItem.update({
      where: { id },
      data: {
        status: 'FULFILLED',
        fulfilledAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found for fulfillment: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Cancel order item
 */
export async function cancelOrderItemOrm(id: string) {
  try {
    return await prisma.orderItem.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`OrderItem not found for cancellation: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Search order items by product name (case-insensitive contains)
 */
export async function searchOrderItemsByProductNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productName: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Search order items by variant name (case-insensitive contains)
 */
export async function searchOrderItemsByVariantNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantName: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by order and product (leverages indexes)
 */
export async function findOrderItemsByOrderAndProductOrm(
  orderId: string,
  productId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
      productId: productId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by order and variant (leverages indexes)
 */
export async function findOrderItemsByOrderAndVariantOrm(
  orderId: string,
  variantId: string,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
      variantId: variantId,
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Calculate order total from order items
 */
export async function calculateOrderTotalFromItemsOrm(orderId: string) {
  const result = await prisma.orderItem.aggregate({
    where: {
      orderId: orderId,
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalAmount: result._sum.total || 0,
    itemCount: result._count.id,
  };
}

/**
 * Find high-value order items (potential premium orders)
 */
export async function findHighValueOrderItemsOrm(
  minTotal: number = 100,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      total: {
        gte: minTotal,
      },
    },
    orderBy: {
      total: 'desc',
    },
  };
  return await prisma.orderItem.findMany(args);
}

/**
 * Find order items by product and status (leverages indexes)
 */
export async function findOrderItemsByProductAndStatusOrm(
  productId: string,
  status: OrderItemStatus,
  additionalArgs?: Prisma.OrderItemFindManyArgs,
) {
  const args: Prisma.OrderItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: productId,
      status: status,
    },
  };
  return await prisma.orderItem.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * OrderItem with order relation
 */
export type OrderItemWithOrder = Prisma.OrderItemGetPayload<{
  include: { order: true };
}>;

/**
 * OrderItem with product relation
 */
export type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: { product: true };
}>;

/**
 * OrderItem with variant relation
 */
export type OrderItemWithVariant = Prisma.OrderItemGetPayload<{
  include: { variant: true };
}>;

/**
 * OrderItem with registry relation
 */
export type OrderItemWithRegistry = Prisma.OrderItemGetPayload<{
  include: { registry: true };
}>;

/**
 * OrderItem with all relations for complete data access
 */
export type OrderItemWithAllRelations = Prisma.OrderItemGetPayload<{
  include: {
    order: true;
    product: true;
    variant: true;
    registry: true;
  };
}>;

/**
 * OrderItem summary for order display
 */
export type OrderItemSummary = Prisma.OrderItemGetPayload<{
  select: {
    id: true;
    productName: true;
    variantName: true;
    sku: true;
    quantity: true;
    price: true;
    total: true;
    status: true;
    isGift: true;
    giftMessage: true;
    fulfilledAt: true;
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
