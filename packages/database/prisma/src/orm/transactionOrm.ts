'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// TRANSACTION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTransactionOrm(args: Prisma.TransactionCreateArgs) {
  return prisma.transaction.create(args);
}

// READ
export async function findFirstTransactionOrm(args?: Prisma.TransactionFindFirstArgs) {
  return prisma.transaction.findFirst(args);
}

export async function findUniqueTransactionOrm(args: Prisma.TransactionFindUniqueArgs) {
  return prisma.transaction.findUnique(args);
}

export async function findManyTransactionsOrm(args?: Prisma.TransactionFindManyArgs) {
  return prisma.transaction.findMany(args);
}

// UPDATE
export async function updateTransactionOrm(args: Prisma.TransactionUpdateArgs) {
  return prisma.transaction.update(args);
}

export async function updateManyTransactionsOrm(args: Prisma.TransactionUpdateManyArgs) {
  return prisma.transaction.updateMany(args);
}

// UPSERT
export async function upsertTransactionOrm(args: Prisma.TransactionUpsertArgs) {
  return prisma.transaction.upsert(args);
}

// DELETE
export async function deleteTransactionOrm(args: Prisma.TransactionDeleteArgs) {
  return prisma.transaction.delete(args);
}

export async function deleteManyTransactionsOrm(args?: Prisma.TransactionDeleteManyArgs) {
  return prisma.transaction.deleteMany(args);
}

// AGGREGATE
export async function aggregateTransactionsOrm(args?: Prisma.TransactionAggregateArgs) {
  return prisma.transaction.aggregate(args ?? {});
}

export async function countTransactionsOrm(args?: Prisma.TransactionCountArgs) {
  return prisma.transaction.count(args);
}

export async function groupByTransactionsOrm(args: Prisma.TransactionGroupByArgs) {
  return prisma.transaction.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
