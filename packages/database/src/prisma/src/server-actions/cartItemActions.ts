'use server';

import {
  createCartItemOrm,
  findFirstCartItemOrm,
  findUniqueCartItemOrm,
  findManyCartItemsOrm,
  updateCartItemOrm,
  updateManyCartItemsOrm,
  upsertCartItemOrm,
  deleteCartItemOrm,
  deleteManyCartItemsOrm,
  aggregateCartItemsOrm,
  countCartItemsOrm,
  groupByCartItemsOrm,
} from '../orm/cartItemOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// CARTITEM SERVER ACTIONS
//==============================================================================

export async function createCartItemAction(args: Prisma.CartItemCreateArgs) {
  'use server';
  return createCartItemOrm(args);
}

export async function findFirstCartItemAction(args?: Prisma.CartItemFindFirstArgs) {
  'use server';
  return findFirstCartItemOrm(args);
}

export async function findUniqueCartItemAction(args: Prisma.CartItemFindUniqueArgs) {
  'use server';
  return findUniqueCartItemOrm(args);
}

export async function findManyCartItemsAction(args?: Prisma.CartItemFindManyArgs) {
  'use server';
  return findManyCartItemsOrm(args);
}

export async function updateCartItemAction(args: Prisma.CartItemUpdateArgs) {
  'use server';
  return updateCartItemOrm(args);
}

export async function updateManyCartItemsAction(args: Prisma.CartItemUpdateManyArgs) {
  'use server';
  return updateManyCartItemsOrm(args);
}

export async function upsertCartItemAction(args: Prisma.CartItemUpsertArgs) {
  'use server';
  return upsertCartItemOrm(args);
}

export async function deleteCartItemAction(args: Prisma.CartItemDeleteArgs) {
  'use server';
  return deleteCartItemOrm(args);
}

export async function deleteManyCartItemsAction(args?: Prisma.CartItemDeleteManyArgs) {
  'use server';
  return deleteManyCartItemsOrm(args);
}

export async function aggregateCartItemsAction(args?: Prisma.CartItemAggregateArgs) {
  'use server';
  return aggregateCartItemsOrm(args);
}

export async function countCartItemsAction(args?: Prisma.CartItemCountArgs) {
  'use server';
  return countCartItemsOrm(args);
}

export async function groupByCartItemsAction(args: Prisma.CartItemGroupByArgs) {
  'use server';
  return groupByCartItemsOrm(args);
}
