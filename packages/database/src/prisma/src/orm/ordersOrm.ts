'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// ORDER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrderOrm(args: Prisma.OrderCreateArgs) {
  return prisma.order.create(args);
}

// READ
export async function findFirstOrderOrm(args?: Prisma.OrderFindFirstArgs) {
  return prisma.order.findFirst(args);
}

export async function findUniqueOrderOrm(args: Prisma.OrderFindUniqueArgs) {
  return prisma.order.findUnique(args);
}

export async function findManyOrdersOrm(args?: Prisma.OrderFindManyArgs) {
  return prisma.order.findMany(args);
}

// UPDATE
export async function updateOrderOrm(args: Prisma.OrderUpdateArgs) {
  return prisma.order.update(args);
}

export async function updateManyOrdersOrm(args: Prisma.OrderUpdateManyArgs) {
  return prisma.order.updateMany(args);
}

// UPSERT
export async function upsertOrderOrm(args: Prisma.OrderUpsertArgs) {
  return prisma.order.upsert(args);
}

// DELETE
export async function deleteOrderOrm(args: Prisma.OrderDeleteArgs) {
  return prisma.order.delete(args);
}

export async function deleteManyOrdersOrm(args?: Prisma.OrderDeleteManyArgs) {
  return prisma.order.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrdersOrm(args?: Prisma.OrderAggregateArgs) {
  return prisma.order.aggregate(args ?? {});
}

export async function countOrdersOrm(args?: Prisma.OrderCountArgs) {
  return prisma.order.count(args);
}

export async function groupByOrdersOrm(args: Prisma.OrderGroupByArgs) {
  return prisma.order.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
