'use server';

import {
  createOrderItemOrm,
  findFirstOrderItemOrm,
  findUniqueOrderItemOrm,
  findManyOrderItemsOrm,
  updateOrderItemOrm,
  updateManyOrderItemsOrm,
  upsertOrderItemOrm,
  deleteOrderItemOrm,
  deleteManyOrderItemsOrm,
  aggregateOrderItemsOrm,
  countOrderItemsOrm,
  groupByOrderItemsOrm,
} from '../orm/orderItemOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// ORDERITEM SERVER ACTIONS
//==============================================================================

export async function createOrderItemAction(args: Prisma.OrderItemCreateArgs) {
  'use server';
  return createOrderItemOrm(args);
}

export async function findFirstOrderItemAction(args?: Prisma.OrderItemFindFirstArgs) {
  'use server';
  return findFirstOrderItemOrm(args);
}

export async function findUniqueOrderItemAction(args: Prisma.OrderItemFindUniqueArgs) {
  'use server';
  return findUniqueOrderItemOrm(args);
}

export async function findManyOrderItemsAction(args?: Prisma.OrderItemFindManyArgs) {
  'use server';
  return findManyOrderItemsOrm(args);
}

export async function updateOrderItemAction(args: Prisma.OrderItemUpdateArgs) {
  'use server';
  return updateOrderItemOrm(args);
}

export async function updateManyOrderItemsAction(args: Prisma.OrderItemUpdateManyArgs) {
  'use server';
  return updateManyOrderItemsOrm(args);
}

export async function upsertOrderItemAction(args: Prisma.OrderItemUpsertArgs) {
  'use server';
  return upsertOrderItemOrm(args);
}

export async function deleteOrderItemAction(args: Prisma.OrderItemDeleteArgs) {
  'use server';
  return deleteOrderItemOrm(args);
}

export async function deleteManyOrderItemsAction(args?: Prisma.OrderItemDeleteManyArgs) {
  'use server';
  return deleteManyOrderItemsOrm(args);
}

export async function aggregateOrderItemsAction(args?: Prisma.OrderItemAggregateArgs) {
  'use server';
  return aggregateOrderItemsOrm(args);
}

export async function countOrderItemsAction(args?: Prisma.OrderItemCountArgs) {
  'use server';
  return countOrderItemsOrm(args);
}

export async function groupByOrderItemsAction(args: Prisma.OrderItemGroupByArgs) {
  'use server';
  return groupByOrderItemsOrm(args);
}
