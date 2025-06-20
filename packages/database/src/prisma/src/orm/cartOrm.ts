'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// CART CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCartOrm(args: Prisma.CartCreateArgs) {
  return prisma.cart.create(args);
}

// READ
export async function findFirstCartOrm(args?: Prisma.CartFindFirstArgs) {
  return prisma.cart.findFirst(args);
}

export async function findUniqueCartOrm(args: Prisma.CartFindUniqueArgs) {
  return prisma.cart.findUnique(args);
}

export async function findManyCartsOrm(args?: Prisma.CartFindManyArgs) {
  return prisma.cart.findMany(args);
}

// UPDATE
export async function updateCartOrm(args: Prisma.CartUpdateArgs) {
  return prisma.cart.update(args);
}

export async function updateManyCartsOrm(args: Prisma.CartUpdateManyArgs) {
  return prisma.cart.updateMany(args);
}

// UPSERT
export async function upsertCartOrm(args: Prisma.CartUpsertArgs) {
  return prisma.cart.upsert(args);
}

// DELETE
export async function deleteCartOrm(args: Prisma.CartDeleteArgs) {
  return prisma.cart.delete(args);
}

export async function deleteManyCartsOrm(args?: Prisma.CartDeleteManyArgs) {
  return prisma.cart.deleteMany(args);
}

// AGGREGATE
export async function aggregateCartsOrm(args?: Prisma.CartAggregateArgs) {
  return prisma.cart.aggregate(args ?? {});
}

export async function countCartsOrm(args?: Prisma.CartCountArgs) {
  return prisma.cart.count(args);
}

export async function groupByCartsOrm(args: Prisma.CartGroupByArgs) {
  return prisma.cart.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
