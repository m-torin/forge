'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new inventory record
 */
export async function createInventoryOrm(args: Prisma.InventoryCreateArgs) {
  try {
    return await prisma.inventory.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first inventory record matching criteria
 */
export async function findFirstInventoryOrm(args?: Prisma.InventoryFindFirstArgs) {
  return await prisma.inventory.findFirst(args);
}

/**
 * Find unique inventory record by ID
 */
export async function findUniqueInventoryOrm(args: Prisma.InventoryFindUniqueArgs) {
  return await prisma.inventory.findUnique(args);
}

/**
 * Find unique inventory record or throw error if not found
 */
export async function findUniqueInventoryOrmOrThrow(args: Prisma.InventoryFindUniqueOrThrowArgs) {
  try {
    return await prisma.inventory.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many inventory records with optional filtering
 */
export async function findManyInventoriesOrm(args?: Prisma.InventoryFindManyArgs) {
  return await prisma.inventory.findMany(args);
}

/**
 * Update an existing inventory record
 */
export async function updateInventoryOrm(args: Prisma.InventoryUpdateArgs) {
  try {
    return await prisma.inventory.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many inventory records matching criteria
 */
export async function updateManyInventoriesOrm(args: Prisma.InventoryUpdateManyArgs) {
  return await prisma.inventory.updateMany(args);
}

/**
 * Create or update inventory record (upsert)
 */
export async function upsertInventoryOrm(args: Prisma.InventoryUpsertArgs) {
  try {
    return await prisma.inventory.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete an inventory record
 */
export async function deleteInventoryOrm(args: Prisma.InventoryDeleteArgs) {
  try {
    return await prisma.inventory.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many inventory records matching criteria
 */
export async function deleteManyInventoriesOrm(args?: Prisma.InventoryDeleteManyArgs) {
  return await prisma.inventory.deleteMany(args);
}

/**
 * Aggregate inventory data
 */
export async function aggregateInventoriesOrm(args?: Prisma.InventoryAggregateArgs) {
  return await prisma.inventory.aggregate(args ?? {});
}

/**
 * Count inventory records matching criteria
 */
export async function countInventoriesOrm(args?: Prisma.InventoryCountArgs) {
  return await prisma.inventory.count(args);
}

/**
 * Group inventory records by specified fields
 */
export async function groupByInventoriesOrm(args: Prisma.InventoryGroupByArgs) {
  return await prisma.inventory.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find inventory records by product ID
 */
export async function findInventoriesByProductOrm(
  productId: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: productId,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records by variant ID
 */
export async function findInventoriesByVariantOrm(
  variantId: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: variantId,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records by location ID (leverages locationId index)
 */
export async function findInventoriesByLocationOrm(
  locationId: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationId: locationId,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records by location name
 */
export async function findInventoriesByLocationNameOrm(
  locationName: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationName: locationName,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have a product set (not null)
 */
export async function findInventoriesWithProductOrm(additionalArgs?: Prisma.InventoryFindManyArgs) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: {
        not: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that don't have a product (null)
 */
export async function findInventoriesWithoutProductOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: null,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have a variant set (not null)
 */
export async function findInventoriesWithVariantOrm(additionalArgs?: Prisma.InventoryFindManyArgs) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: {
        not: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that don't have a variant (null)
 */
export async function findInventoriesWithoutVariantOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: null,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have a location set (not null)
 */
export async function findInventoriesWithLocationOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationId: {
        not: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that don't have a location (null)
 */
export async function findInventoriesWithoutLocationOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationId: null,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find low stock inventory records
 */
export async function findLowStockInventoriesOrm(additionalArgs?: Prisma.InventoryFindManyArgs) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    orderBy: {
      available: 'asc',
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find out of stock inventory records
 */
export async function findOutOfStockInventoriesOrm(additionalArgs?: Prisma.InventoryFindManyArgs) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      available: {
        lte: 0,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records with available stock
 */
export async function findInStockInventoriesOrm(additionalArgs?: Prisma.InventoryFindManyArgs) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      available: {
        gt: 0,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records with reserved stock
 */
export async function findInventoriesWithReservedStockOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      reserved: {
        gt: 0,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records by quantity range
 */
export async function findInventoriesByQuantityRangeOrm(
  minQuantity: number,
  maxQuantity: number,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gte: minQuantity,
        lte: maxQuantity,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have a low stock threshold set
 */
export async function findInventoriesWithLowStockThresholdOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lowStockThreshold: {
        not: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Inventory model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find inventory records that have a product relationship
 */
export async function findInventoriesWithProductRelationOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      product: {
        isNot: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have a variant relationship
 */
export async function findInventoriesWithVariantRelationOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variant: {
        isNot: null,
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records that have transactions
 */
export async function findInventoriesWithTransactionsOrm(
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      transactions: {
        some: {},
      },
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory record with all relations included
 */
export async function findInventoryWithAllRelationsOrm(id: string) {
  return await prisma.inventory.findUnique({
    where: { id },
    include: {
      product: true,
      variant: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find inventory records created after a specific date
 */
export async function findInventoriesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
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
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records updated after a specific date
 */
export async function findInventoriesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
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
  return await prisma.inventory.findMany(args);
}

/**
 * Find recently created or updated inventory records within specified days
 */
export async function findRecentInventoriesOrm(
  days: number = 7,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.InventoryFindManyArgs = {
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
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records restocked after a specific date
 */
export async function findInventoriesRestockedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lastRestockedAt: {
        gte: date,
      },
    },
    orderBy: {
      lastRestockedAt: 'desc',
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Update inventory stock levels
 */
export async function updateInventoryStockOrm(
  id: string,
  stockData: {
    quantity?: number;
    reserved?: number;
    available?: number;
    lowStockThreshold?: number;
  },
) {
  try {
    return await prisma.inventory.update({
      where: { id },
      data: {
        ...stockData,
        ...(stockData.quantity !== undefined && {
          lastRestockedAt: new Date(),
        }),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found for stock update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Reserve inventory stock
 */
export async function reserveInventoryStockOrm(id: string, quantity: number) {
  try {
    return await prisma.inventory.update({
      where: { id },
      data: {
        reserved: {
          increment: quantity,
        },
        available: {
          decrement: quantity,
        },
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found for reservation: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Release reserved inventory stock
 */
export async function releaseInventoryStockOrm(id: string, quantity: number) {
  try {
    return await prisma.inventory.update({
      where: { id },
      data: {
        reserved: {
          decrement: quantity,
        },
        available: {
          increment: quantity,
        },
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Inventory not found for release: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find specific inventory by product, variant, and location (leverages unique constraint)
 */
export async function findInventoryByProductVariantLocationOrm(
  productId: string | null,
  variantId: string | null,
  locationId: string | null,
) {
  // If any field is null, use findFirst instead of unique constraint
  if (!productId || !variantId || !locationId) {
    return await prisma.inventory.findFirst({
      where: {
        productId,
        variantId,
        locationId,
      },
    });
  }

  return await prisma.inventory.findUnique({
    where: {
      productId_variantId_locationId: {
        productId,
        variantId,
        locationId,
      },
    },
  });
}

/**
 * Find inventory records by product and location
 */
export async function findInventoriesByProductAndLocationOrm(
  productId: string,
  locationId: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      productId: productId,
      locationId: locationId,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Find inventory records by variant and location
 */
export async function findInventoriesByVariantAndLocationOrm(
  variantId: string,
  locationId: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantId: variantId,
      locationId: locationId,
    },
  };
  return await prisma.inventory.findMany(args);
}

/**
 * Calculate total stock across all locations for a product
 */
export async function calculateProductTotalStockOrm(productId: string) {
  const result = await prisma.inventory.aggregate({
    where: {
      productId: productId,
    },
    _sum: {
      quantity: true,
      reserved: true,
      available: true,
    },
  });

  return {
    totalQuantity: result._sum.quantity || 0,
    totalReserved: result._sum.reserved || 0,
    totalAvailable: result._sum.available || 0,
  };
}

/**
 * Calculate total stock across all locations for a variant
 */
export async function calculateVariantTotalStockOrm(variantId: string) {
  const result = await prisma.inventory.aggregate({
    where: {
      variantId: variantId,
    },
    _sum: {
      quantity: true,
      reserved: true,
      available: true,
    },
  });

  return {
    totalQuantity: result._sum.quantity || 0,
    totalReserved: result._sum.reserved || 0,
    totalAvailable: result._sum.available || 0,
  };
}

/**
 * Find inventory records that need restocking (leverages locationId index)
 */
export async function findInventoriesNeedingRestockOrm(
  locationId?: string,
  additionalArgs?: Prisma.InventoryFindManyArgs,
) {
  const args: Prisma.InventoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      ...(locationId && { locationId }),
      lowStockThreshold: {
        not: null,
      },
      available: {
        lte: prisma.inventory.fields.lowStockThreshold,
      },
    },
    orderBy: {
      available: 'asc',
    },
  };
  return await prisma.inventory.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Inventory with product relation
 */
export type InventoryWithProduct = Prisma.InventoryGetPayload<{
  include: { product: true };
}>;

/**
 * Inventory with variant relation
 */
export type InventoryWithVariant = Prisma.InventoryGetPayload<{
  include: { variant: true };
}>;

/**
 * Inventory with transactions relation
 */
export type InventoryWithTransactions = Prisma.InventoryGetPayload<{
  include: { transactions: true };
}>;

/**
 * Inventory with all relations for complete data access
 */
export type InventoryWithAllRelations = Prisma.InventoryGetPayload<{
  include: {
    product: true;
    variant: true;
    transactions: true;
  };
}>;

/**
 * Inventory summary for stock management dashboards
 */
export type InventorySummary = Prisma.InventoryGetPayload<{
  select: {
    id: true;
    quantity: true;
    reserved: true;
    available: true;
    lowStockThreshold: true;
    locationId: true;
    locationName: true;
    lastRestockedAt: true;
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
    _count: {
      select: {
        transactions: true;
      };
    };
  };
}>;
