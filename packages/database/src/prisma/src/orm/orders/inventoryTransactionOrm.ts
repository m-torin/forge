'use server';

import type { InventoryTransactionType, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new inventory transaction
 */
export async function createInventoryTransactionOrm(args: Prisma.InventoryTransactionCreateArgs) {
  try {
    return await prisma.inventoryTransaction.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first inventory transaction matching criteria
 */
export async function findFirstInventoryTransactionOrm(
  args?: Prisma.InventoryTransactionFindFirstArgs,
) {
  return await prisma.inventoryTransaction.findFirst(args);
}

/**
 * Find unique inventory transaction by ID
 */
export async function findUniqueInventoryTransactionOrm(
  args: Prisma.InventoryTransactionFindUniqueArgs,
) {
  return await prisma.inventoryTransaction.findUnique(args);
}

/**
 * Find unique inventory transaction or throw error if not found
 */
export async function findUniqueInventoryTransactionOrmOrThrow(
  args: Prisma.InventoryTransactionFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.inventoryTransaction.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(
        `InventoryTransaction not found with criteria: ${JSON.stringify(args.where)}`,
      );
    }
    handlePrismaError(error);
  }
}

/**
 * Find many inventory transactions with optional filtering
 */
export async function findManyInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionFindManyArgs,
) {
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Update an existing inventory transaction
 */
export async function updateInventoryTransactionOrm(args: Prisma.InventoryTransactionUpdateArgs) {
  try {
    return await prisma.inventoryTransaction.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`InventoryTransaction not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many inventory transactions matching criteria
 */
export async function updateManyInventoryTransactionsOrm(
  args: Prisma.InventoryTransactionUpdateManyArgs,
) {
  return await prisma.inventoryTransaction.updateMany(args);
}

/**
 * Create or update inventory transaction (upsert)
 */
export async function upsertInventoryTransactionOrm(args: Prisma.InventoryTransactionUpsertArgs) {
  try {
    return await prisma.inventoryTransaction.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete an inventory transaction
 */
export async function deleteInventoryTransactionOrm(args: Prisma.InventoryTransactionDeleteArgs) {
  try {
    return await prisma.inventoryTransaction.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`InventoryTransaction not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many inventory transactions matching criteria
 */
export async function deleteManyInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionDeleteManyArgs,
) {
  return await prisma.inventoryTransaction.deleteMany(args);
}

/**
 * Aggregate inventory transaction data
 */
export async function aggregateInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionAggregateArgs,
) {
  return await prisma.inventoryTransaction.aggregate(args ?? {});
}

/**
 * Count inventory transactions matching criteria
 */
export async function countInventoryTransactionsOrm(args?: Prisma.InventoryTransactionCountArgs) {
  return await prisma.inventoryTransaction.count(args);
}

/**
 * Group inventory transactions by specified fields
 */
export async function groupByInventoryTransactionsOrm(
  args: Prisma.InventoryTransactionGroupByArgs,
) {
  return await prisma.inventoryTransaction.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find inventory transactions by type using InventoryTransactionType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findInventoryTransactionsByTypeOrm(
  type: InventoryTransactionType,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find restock transactions
 */
export async function findRestockTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'RESTOCK',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find sale transactions
 */
export async function findSaleTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'SALE',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find return transactions
 */
export async function findReturnTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'RETURN',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find adjustment transactions
 */
export async function findAdjustmentTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'ADJUSTMENT',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find reservation transactions
 */
export async function findReservationTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'RESERVATION',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find release transactions
 */
export async function findReleaseTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'RELEASE',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions by inventory ID (leverages inventoryId index)
 */
export async function findInventoryTransactionsByInventoryOrm(
  inventoryId: string,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      inventoryId: inventoryId,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions by reference type and ID (leverages compound index)
 */
export async function findInventoryTransactionsByReferenceOrm(
  referenceType: string,
  referenceId: string,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      referenceType: referenceType,
      referenceId: referenceId,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions that have a reference type set (not null)
 */
export async function findInventoryTransactionsWithReferenceOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      referenceType: {
        not: null,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions that don't have a reference (null)
 */
export async function findInventoryTransactionsWithoutReferenceOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      referenceType: null,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions by created by user
 */
export async function findInventoryTransactionsByCreatedByOrm(
  createdBy: string,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdBy: createdBy,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions that have a creator set (not null)
 */
export async function findInventoryTransactionsWithCreatorOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdBy: {
        not: null,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions that don't have a creator (null)
 */
export async function findInventoryTransactionsWithoutCreatorOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdBy: null,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions by quantity range
 */
export async function findInventoryTransactionsByQuantityRangeOrm(
  minQuantity: number,
  maxQuantity: number,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gte: minQuantity,
        lte: maxQuantity,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find positive inventory transactions (additions)
 */
export async function findPositiveInventoryTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        gt: 0,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find negative inventory transactions (removals)
 */
export async function findNegativeInventoryTransactionsOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      quantity: {
        lt: 0,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions with notes
 */
export async function findInventoryTransactionsWithNotesOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notes: {
        not: null,
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// InventoryTransaction model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find inventory transactions that have an inventory relationship
 * Note: inventoryId is required, so all transactions have inventory
 */
export async function findInventoryTransactionsWithInventoryOrm(
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  // Since inventoryId is required, all transactions have inventory
  return await prisma.inventoryTransaction.findMany(additionalArgs);
}

/**
 * Find inventory transaction with all relations included
 */
export async function findInventoryTransactionWithAllRelationsOrm(id: string) {
  return await prisma.inventoryTransaction.findUnique({
    where: { id },
    include: {
      inventory: {
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
 * Find inventory transactions created after a specific date
 */
export async function findInventoryTransactionsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
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
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find recent inventory transactions within specified days
 */
export async function findRecentInventoryTransactionsOrm(
  days: number = 7,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Create inventory transaction with automatic inventory update
 */
export async function createInventoryTransactionWithUpdateOrm(
  inventoryId: string,
  transactionData: {
    type: InventoryTransactionType;
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdBy?: string;
  },
) {
  return await prisma.$transaction(async tx => {
    // Create the transaction
    const transaction = await tx.inventoryTransaction.create({
      data: {
        inventoryId,
        ...transactionData,
      },
    });

    // Update inventory quantities
    await tx.inventory.update({
      where: { id: inventoryId },
      data: {
        quantity: {
          increment: transactionData.quantity,
        },
        // Update available quantity (quantity - reserved)
        available: {
          increment: transactionData.quantity,
        },
      },
    });

    return transaction;
  });
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find inventory transactions by inventory and type (leverages inventoryId index)
 */
export async function findInventoryTransactionsByInventoryAndTypeOrm(
  inventoryId: string,
  type: InventoryTransactionType,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      inventoryId: inventoryId,
      type: type,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Find inventory transactions by reference and type (leverages compound index)
 */
export async function findInventoryTransactionsByReferenceAndTypeOrm(
  referenceType: string,
  referenceId: string,
  type: InventoryTransactionType,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      referenceType: referenceType,
      referenceId: referenceId,
      type: type,
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Calculate total quantity changes for an inventory
 */
export async function calculateInventoryQuantityChangesOrm(inventoryId: string) {
  const result = await prisma.inventoryTransaction.aggregate({
    where: {
      inventoryId: inventoryId,
    },
    _sum: {
      quantity: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalQuantityChange: result._sum.quantity || 0,
    transactionCount: result._count.id,
  };
}

/**
 * Calculate total quantity changes by type for an inventory
 */
export async function calculateInventoryQuantityChangesByTypeOrm(
  inventoryId: string,
  type: InventoryTransactionType,
) {
  const result = await prisma.inventoryTransaction.aggregate({
    where: {
      inventoryId: inventoryId,
      type: type,
    },
    _sum: {
      quantity: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalQuantityChange: result._sum.quantity || 0,
    transactionCount: result._count.id,
  };
}

/**
 * Find large quantity inventory transactions (potential audit items)
 */
export async function findLargeQuantityInventoryTransactionsOrm(
  minAbsQuantity: number = 100,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          quantity: {
            gte: minAbsQuantity,
          },
        },
        {
          quantity: {
            lte: -minAbsQuantity,
          },
        },
      ],
    },
    orderBy: {
      quantity: 'desc',
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

/**
 * Search inventory transactions by notes (case-insensitive contains)
 */
export async function searchInventoryTransactionsByNotesOrm(
  searchTerm: string,
  additionalArgs?: Prisma.InventoryTransactionFindManyArgs,
) {
  const args: Prisma.InventoryTransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notes: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.inventoryTransaction.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * InventoryTransaction with inventory relation
 */
export type InventoryTransactionWithInventory = Prisma.InventoryTransactionGetPayload<{
  include: { inventory: true };
}>;

/**
 * InventoryTransaction with inventory and product relations
 */
export type InventoryTransactionWithInventoryAndProduct = Prisma.InventoryTransactionGetPayload<{
  include: {
    inventory: {
      include: {
        product: true;
        variant: true;
      };
    };
  };
}>;

/**
 * InventoryTransaction with all relations for complete data access
 */
export type InventoryTransactionWithAllRelations = Prisma.InventoryTransactionGetPayload<{
  include: {
    inventory: {
      include: {
        product: true;
        variant: true;
      };
    };
  };
}>;

/**
 * InventoryTransaction summary for audit trails
 */
export type InventoryTransactionSummary = Prisma.InventoryTransactionGetPayload<{
  select: {
    id: true;
    type: true;
    quantity: true;
    referenceType: true;
    referenceId: true;
    notes: true;
    createdAt: true;
    createdBy: true;
    inventoryId: true;
    inventory: {
      select: {
        id: true;
        quantity: true;
        available: true;
        locationId: true;
        locationName: true;
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
    };
  };
}>;
