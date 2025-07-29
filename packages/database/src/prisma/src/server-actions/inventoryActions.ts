'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateInventoriesOrm,
  countInventoriesOrm,
  // Inventory CRUD functions
  createInventoryOrm,
  deleteInventoryOrm,
  deleteManyInventoriesOrm,
  findFirstInventoryOrm,
  findManyInventoriesOrm,
  findUniqueInventoryOrm,
  groupByInventoriesOrm,
  updateInventoryOrm,
  updateManyInventoriesOrm,
  upsertInventoryOrm,
} from '../orm/orders/inventoryOrm';

//==============================================================================
// INVENTORY SERVER ACTIONS
//==============================================================================

export async function createInventoryAction(args: Prisma.InventoryCreateArgs) {
  'use server';
  return createInventoryOrm(args);
}

export async function findFirstInventoryAction(args?: Prisma.InventoryFindFirstArgs) {
  'use server';
  return findFirstInventoryOrm(args);
}

export async function findUniqueInventoryAction(args: Prisma.InventoryFindUniqueArgs) {
  'use server';
  return findUniqueInventoryOrm(args);
}

export async function findManyInventoriesAction(args?: Prisma.InventoryFindManyArgs) {
  'use server';
  return findManyInventoriesOrm(args);
}

export async function updateInventoryAction(args: Prisma.InventoryUpdateArgs) {
  'use server';
  return updateInventoryOrm(args);
}

export async function updateManyInventoriesAction(args: Prisma.InventoryUpdateManyArgs) {
  'use server';
  return updateManyInventoriesOrm(args);
}

export async function upsertInventoryAction(args: Prisma.InventoryUpsertArgs) {
  'use server';
  return upsertInventoryOrm(args);
}

export async function deleteInventoryAction(args: Prisma.InventoryDeleteArgs) {
  'use server';
  return deleteInventoryOrm(args);
}

export async function deleteManyInventoriesAction(args?: Prisma.InventoryDeleteManyArgs) {
  'use server';
  return deleteManyInventoriesOrm(args);
}

export async function aggregateInventoriesAction(args?: Prisma.InventoryAggregateArgs) {
  'use server';
  return aggregateInventoriesOrm(args);
}

export async function countInventoriesAction(args?: Prisma.InventoryCountArgs) {
  'use server';
  return countInventoriesOrm(args);
}

export async function groupByInventoriesAction(args: Prisma.InventoryGroupByArgs) {
  'use server';
  return groupByInventoriesOrm(args);
}
