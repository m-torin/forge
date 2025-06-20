'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// CARTITEM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCartItemOrm(args: Prisma.CartItemCreateArgs) {
  return prisma.cartItem.create(args);
}

// READ
export async function findFirstCartItemOrm(args?: Prisma.CartItemFindFirstArgs) {
  return prisma.cartItem.findFirst(args);
}

export async function findUniqueCartItemOrm(args: Prisma.CartItemFindUniqueArgs) {
  return prisma.cartItem.findUnique(args);
}

export async function findManyCartItemsOrm(args?: Prisma.CartItemFindManyArgs) {
  return prisma.cartItem.findMany(args);
}

// UPDATE
export async function updateCartItemOrm(args: Prisma.CartItemUpdateArgs) {
  return prisma.cartItem.update(args);
}

export async function updateManyCartItemsOrm(args: Prisma.CartItemUpdateManyArgs) {
  return prisma.cartItem.updateMany(args);
}

// UPSERT
export async function upsertCartItemOrm(args: Prisma.CartItemUpsertArgs) {
  return prisma.cartItem.upsert(args);
}

// DELETE
export async function deleteCartItemOrm(args: Prisma.CartItemDeleteArgs) {
  return prisma.cartItem.delete(args);
}

export async function deleteManyCartItemsOrm(args?: Prisma.CartItemDeleteManyArgs) {
  return prisma.cartItem.deleteMany(args);
}

// AGGREGATE
export async function aggregateCartItemsOrm(args?: Prisma.CartItemAggregateArgs) {
  return prisma.cartItem.aggregate(args ?? {});
}

export async function countCartItemsOrm(args?: Prisma.CartItemCountArgs) {
  return prisma.cartItem.count(args);
}

export async function groupByCartItemsOrm(args: Prisma.CartItemGroupByArgs) {
  return prisma.cartItem.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
