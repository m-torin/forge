'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// INVENTORY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createInventoryOrm(args: Prisma.InventoryCreateArgs) {
  return prisma.inventory.create(args);
}

// READ
export async function findFirstInventoryOrm(args?: Prisma.InventoryFindFirstArgs) {
  return prisma.inventory.findFirst(args);
}

export async function findUniqueInventoryOrm(args: Prisma.InventoryFindUniqueArgs) {
  return prisma.inventory.findUnique(args);
}

export async function findManyInventoriesOrm(args?: Prisma.InventoryFindManyArgs) {
  return prisma.inventory.findMany(args);
}

// UPDATE
export async function updateInventoryOrm(args: Prisma.InventoryUpdateArgs) {
  return prisma.inventory.update(args);
}

export async function updateManyInventoriesOrm(args: Prisma.InventoryUpdateManyArgs) {
  return prisma.inventory.updateMany(args);
}

// UPSERT
export async function upsertInventoryOrm(args: Prisma.InventoryUpsertArgs) {
  return prisma.inventory.upsert(args);
}

// DELETE
export async function deleteInventoryOrm(args: Prisma.InventoryDeleteArgs) {
  return prisma.inventory.delete(args);
}

export async function deleteManyInventoriesOrm(args?: Prisma.InventoryDeleteManyArgs) {
  return prisma.inventory.deleteMany(args);
}

// AGGREGATE
export async function aggregateInventoriesOrm(args?: Prisma.InventoryAggregateArgs) {
  return prisma.inventory.aggregate(args ?? {});
}

export async function countInventoriesOrm(args?: Prisma.InventoryCountArgs) {
  return prisma.inventory.count(args);
}

export async function groupByInventoriesOrm(args: Prisma.InventoryGroupByArgs) {
  return prisma.inventory.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
