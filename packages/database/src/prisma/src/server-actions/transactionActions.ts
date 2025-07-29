'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateTransactionsOrm,
  countTransactionsOrm,
  createTransactionOrm,
  deleteManyTransactionsOrm,
  deleteTransactionOrm,
  findFirstTransactionOrm,
  findManyTransactionsOrm,
  findUniqueTransactionOrm,
  groupByTransactionsOrm,
  updateManyTransactionsOrm,
  updateTransactionOrm,
  upsertTransactionOrm,
} from '../orm/orders/transactionOrm';

//==============================================================================
// TRANSACTION SERVER ACTIONS
//==============================================================================

export async function createTransactionAction(args: Prisma.TransactionCreateArgs) {
  'use server';
  return createTransactionOrm(args);
}

export async function findFirstTransactionAction(args?: Prisma.TransactionFindFirstArgs) {
  'use server';
  return findFirstTransactionOrm(args);
}

export async function findUniqueTransactionAction(args: Prisma.TransactionFindUniqueArgs) {
  'use server';
  return findUniqueTransactionOrm(args);
}

export async function findManyTransactionsAction(args?: Prisma.TransactionFindManyArgs) {
  'use server';
  return findManyTransactionsOrm(args);
}

export async function updateTransactionAction(args: Prisma.TransactionUpdateArgs) {
  'use server';
  return updateTransactionOrm(args);
}

export async function updateManyTransactionsAction(args: Prisma.TransactionUpdateManyArgs) {
  'use server';
  return updateManyTransactionsOrm(args);
}

export async function upsertTransactionAction(args: Prisma.TransactionUpsertArgs) {
  'use server';
  return upsertTransactionOrm(args);
}

export async function deleteTransactionAction(args: Prisma.TransactionDeleteArgs) {
  'use server';
  return deleteTransactionOrm(args);
}

export async function deleteManyTransactionsAction(args?: Prisma.TransactionDeleteManyArgs) {
  'use server';
  return deleteManyTransactionsOrm(args);
}

export async function aggregateTransactionsAction(args?: Prisma.TransactionAggregateArgs) {
  'use server';
  return aggregateTransactionsOrm(args);
}

export async function countTransactionsAction(args?: Prisma.TransactionCountArgs) {
  'use server';
  return countTransactionsOrm(args);
}

export async function groupByTransactionsAction(args: Prisma.TransactionGroupByArgs) {
  'use server';
  return groupByTransactionsOrm(args);
}
