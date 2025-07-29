'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateInventoryTransactionsOrm,
  countInventoryTransactionsOrm,
  createInventoryTransactionOrm,
  deleteInventoryTransactionOrm,
  deleteManyInventoryTransactionsOrm,
  findFirstInventoryTransactionOrm,
  findManyInventoryTransactionsOrm,
  findUniqueInventoryTransactionOrm,
  groupByInventoryTransactionsOrm,
  updateInventoryTransactionOrm,
  updateManyInventoryTransactionsOrm,
  upsertInventoryTransactionOrm,
} from '../orm/orders/inventoryTransactionOrm';

//==============================================================================
// INVENTORYTRANSACTION SERVER ACTIONS
//==============================================================================

export async function createInventoryTransactionAction(
  args: Prisma.InventoryTransactionCreateArgs,
) {
  'use server';
  return createInventoryTransactionOrm(args);
}

export async function findFirstInventoryTransactionAction(
  args?: Prisma.InventoryTransactionFindFirstArgs,
) {
  'use server';
  return findFirstInventoryTransactionOrm(args);
}

export async function findUniqueInventoryTransactionAction(
  args: Prisma.InventoryTransactionFindUniqueArgs,
) {
  'use server';
  return findUniqueInventoryTransactionOrm(args);
}

export async function findManyInventoryTransactionsAction(
  args?: Prisma.InventoryTransactionFindManyArgs,
) {
  'use server';
  return findManyInventoryTransactionsOrm(args);
}

export async function updateInventoryTransactionAction(
  args: Prisma.InventoryTransactionUpdateArgs,
) {
  'use server';
  return updateInventoryTransactionOrm(args);
}

export async function updateManyInventoryTransactionsAction(
  args: Prisma.InventoryTransactionUpdateManyArgs,
) {
  'use server';
  return updateManyInventoryTransactionsOrm(args);
}

export async function upsertInventoryTransactionAction(
  args: Prisma.InventoryTransactionUpsertArgs,
) {
  'use server';
  return upsertInventoryTransactionOrm(args);
}

export async function deleteInventoryTransactionAction(
  args: Prisma.InventoryTransactionDeleteArgs,
) {
  'use server';
  return deleteInventoryTransactionOrm(args);
}

export async function deleteManyInventoryTransactionsAction(
  args?: Prisma.InventoryTransactionDeleteManyArgs,
) {
  'use server';
  return deleteManyInventoryTransactionsOrm(args);
}

export async function aggregateInventoryTransactionsAction(
  args?: Prisma.InventoryTransactionAggregateArgs,
) {
  'use server';
  return aggregateInventoryTransactionsOrm(args);
}

export async function countInventoryTransactionsAction(
  args?: Prisma.InventoryTransactionCountArgs,
) {
  'use server';
  return countInventoryTransactionsOrm(args);
}

export async function groupByInventoryTransactionsAction(
  args: Prisma.InventoryTransactionGroupByArgs,
) {
  'use server';
  return groupByInventoryTransactionsOrm(args);
}
