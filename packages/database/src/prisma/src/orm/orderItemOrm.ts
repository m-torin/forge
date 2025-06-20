'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// ORDERITEM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrderItemOrm(args: Prisma.OrderItemCreateArgs) {
  return prisma.orderItem.create(args);
}

// READ
export async function findFirstOrderItemOrm(args?: Prisma.OrderItemFindFirstArgs) {
  return prisma.orderItem.findFirst(args);
}

export async function findUniqueOrderItemOrm(args: Prisma.OrderItemFindUniqueArgs) {
  return prisma.orderItem.findUnique(args);
}

export async function findManyOrderItemsOrm(args?: Prisma.OrderItemFindManyArgs) {
  return prisma.orderItem.findMany(args);
}

// UPDATE
export async function updateOrderItemOrm(args: Prisma.OrderItemUpdateArgs) {
  return prisma.orderItem.update(args);
}

export async function updateManyOrderItemsOrm(args: Prisma.OrderItemUpdateManyArgs) {
  return prisma.orderItem.updateMany(args);
}

// UPSERT
export async function upsertOrderItemOrm(args: Prisma.OrderItemUpsertArgs) {
  return prisma.orderItem.upsert(args);
}

// DELETE
export async function deleteOrderItemOrm(args: Prisma.OrderItemDeleteArgs) {
  return prisma.orderItem.delete(args);
}

export async function deleteManyOrderItemsOrm(args?: Prisma.OrderItemDeleteManyArgs) {
  return prisma.orderItem.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrderItemsOrm(args?: Prisma.OrderItemAggregateArgs) {
  return prisma.orderItem.aggregate(args ?? {});
}

export async function countOrderItemsOrm(args?: Prisma.OrderItemCountArgs) {
  return prisma.orderItem.count(args);
}

export async function groupByOrderItemsOrm(args: Prisma.OrderItemGroupByArgs) {
  return prisma.orderItem.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
