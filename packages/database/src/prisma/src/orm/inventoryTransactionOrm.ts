'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// INVENTORYTRANSACTION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createInventoryTransactionOrm(args: Prisma.InventoryTransactionCreateArgs) {
  return prisma.inventoryTransaction.create(args);
}

// READ
export async function findFirstInventoryTransactionOrm(
  args?: Prisma.InventoryTransactionFindFirstArgs,
) {
  return prisma.inventoryTransaction.findFirst(args);
}

export async function findUniqueInventoryTransactionOrm(
  args: Prisma.InventoryTransactionFindUniqueArgs,
) {
  return prisma.inventoryTransaction.findUnique(args);
}

export async function findManyInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionFindManyArgs,
) {
  return prisma.inventoryTransaction.findMany(args);
}

// UPDATE
export async function updateInventoryTransactionOrm(args: Prisma.InventoryTransactionUpdateArgs) {
  return prisma.inventoryTransaction.update(args);
}

export async function updateManyInventoryTransactionsOrm(
  args: Prisma.InventoryTransactionUpdateManyArgs,
) {
  return prisma.inventoryTransaction.updateMany(args);
}

// UPSERT
export async function upsertInventoryTransactionOrm(args: Prisma.InventoryTransactionUpsertArgs) {
  return prisma.inventoryTransaction.upsert(args);
}

// DELETE
export async function deleteInventoryTransactionOrm(args: Prisma.InventoryTransactionDeleteArgs) {
  return prisma.inventoryTransaction.delete(args);
}

export async function deleteManyInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionDeleteManyArgs,
) {
  return prisma.inventoryTransaction.deleteMany(args);
}

// AGGREGATE
export async function aggregateInventoryTransactionsOrm(
  args?: Prisma.InventoryTransactionAggregateArgs,
) {
  return prisma.inventoryTransaction.aggregate(args ?? {});
}

export async function countInventoryTransactionsOrm(args?: Prisma.InventoryTransactionCountArgs) {
  return prisma.inventoryTransaction.count(args);
}

export async function groupByInventoryTransactionsOrm(
  args: Prisma.InventoryTransactionGroupByArgs,
) {
  return prisma.inventoryTransaction.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
