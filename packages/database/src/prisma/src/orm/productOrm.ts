'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// PRODUCT CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createProductOrm(args: Prisma.ProductCreateArgs) {
  return prisma.product.create(args);
}

// READ
export async function findFirstProductOrm(args?: Prisma.ProductFindFirstArgs) {
  return prisma.product.findFirst(args);
}

export async function findUniqueProductOrm(args: Prisma.ProductFindUniqueArgs) {
  return prisma.product.findUnique(args);
}

export async function findManyProductsOrm(args?: Prisma.ProductFindManyArgs) {
  return prisma.product.findMany(args);
}

// UPDATE
export async function updateProductOrm(args: Prisma.ProductUpdateArgs) {
  return prisma.product.update(args);
}

export async function updateManyProductsOrm(args: Prisma.ProductUpdateManyArgs) {
  return prisma.product.updateMany(args);
}

// UPSERT
export async function upsertProductOrm(args: Prisma.ProductUpsertArgs) {
  return prisma.product.upsert(args);
}

// DELETE
export async function deleteProductOrm(args: Prisma.ProductDeleteArgs) {
  return prisma.product.delete(args);
}

export async function deleteManyProductsOrm(args?: Prisma.ProductDeleteManyArgs) {
  return prisma.product.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductsOrm<T extends Prisma.ProductAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetProductAggregateType<T>> {
  return prisma.product.aggregate((args ?? {}) as T);
}

export async function countProductsOrm(args?: Prisma.ProductCountArgs) {
  return prisma.product.count(args);
}

export async function groupByProductsOrm(args: Prisma.ProductGroupByArgs) {
  return prisma.product.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// PDP JOIN CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createPdpJoinOrm(args: Prisma.PdpJoinCreateArgs) {
  return prisma.pdpJoin.create(args);
}

// READ
export async function findFirstPdpJoinOrm(args?: Prisma.PdpJoinFindFirstArgs) {
  return prisma.pdpJoin.findFirst(args);
}

export async function findUniquePdpJoinOrm(args: Prisma.PdpJoinFindUniqueArgs) {
  return prisma.pdpJoin.findUnique(args);
}

export async function findManyPdpJoinsOrm(args?: Prisma.PdpJoinFindManyArgs) {
  return prisma.pdpJoin.findMany(args);
}

// UPDATE
export async function updatePdpJoinOrm(args: Prisma.PdpJoinUpdateArgs) {
  return prisma.pdpJoin.update(args);
}

export async function updateManyPdpJoinsOrm(args: Prisma.PdpJoinUpdateManyArgs) {
  return prisma.pdpJoin.updateMany(args);
}

// UPSERT
export async function upsertPdpJoinOrm(args: Prisma.PdpJoinUpsertArgs) {
  return prisma.pdpJoin.upsert(args);
}

// DELETE
export async function deletePdpJoinOrm(args: Prisma.PdpJoinDeleteArgs) {
  return prisma.pdpJoin.delete(args);
}

export async function deleteManyPdpJoinsOrm(args?: Prisma.PdpJoinDeleteManyArgs) {
  return prisma.pdpJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregatePdpJoinsOrm<T extends Prisma.PdpJoinAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetPdpJoinAggregateType<T>> {
  return prisma.pdpJoin.aggregate((args ?? {}) as T);
}

export async function countPdpJoinsOrm(args?: Prisma.PdpJoinCountArgs) {
  return prisma.pdpJoin.count(args);
}

export async function groupByPdpJoinsOrm(args: Prisma.PdpJoinGroupByArgs) {
  return prisma.pdpJoin.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// PDP URL CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createPdpUrlOrm(args: Prisma.PdpUrlCreateArgs) {
  return prisma.pdpUrl.create(args);
}

// READ
export async function findFirstPdpUrlOrm(args?: Prisma.PdpUrlFindFirstArgs) {
  return prisma.pdpUrl.findFirst(args);
}

export async function findUniquePdpUrlOrm(args: Prisma.PdpUrlFindUniqueArgs) {
  return prisma.pdpUrl.findUnique(args);
}

export async function findManyPdpUrlsOrm(args?: Prisma.PdpUrlFindManyArgs) {
  return prisma.pdpUrl.findMany(args);
}

// UPDATE
export async function updatePdpUrlOrm(args: Prisma.PdpUrlUpdateArgs) {
  return prisma.pdpUrl.update(args);
}

export async function updateManyPdpUrlsOrm(args: Prisma.PdpUrlUpdateManyArgs) {
  return prisma.pdpUrl.updateMany(args);
}

// UPSERT
export async function upsertPdpUrlOrm(args: Prisma.PdpUrlUpsertArgs) {
  return prisma.pdpUrl.upsert(args);
}

// DELETE
export async function deletePdpUrlOrm(args: Prisma.PdpUrlDeleteArgs) {
  return prisma.pdpUrl.delete(args);
}

export async function deleteManyPdpUrlsOrm(args?: Prisma.PdpUrlDeleteManyArgs) {
  return prisma.pdpUrl.deleteMany(args);
}

// AGGREGATE
export async function aggregatePdpUrlsOrm<T extends Prisma.PdpUrlAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetPdpUrlAggregateType<T>> {
  return prisma.pdpUrl.aggregate((args ?? {}) as T);
}

export async function countPdpUrlsOrm(args?: Prisma.PdpUrlCountArgs) {
  return prisma.pdpUrl.count(args);
}

export async function groupByPdpUrlsOrm(args: Prisma.PdpUrlGroupByArgs) {
  return prisma.pdpUrl.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// PRODUCT IDENTIFIERS CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createProductIdentifiersOrm(args: Prisma.ProductIdentifiersCreateArgs) {
  return prisma.productIdentifiers.create(args);
}

// READ
export async function findFirstProductIdentifiersOrm(
  args?: Prisma.ProductIdentifiersFindFirstArgs,
) {
  return prisma.productIdentifiers.findFirst(args);
}

export async function findUniqueProductIdentifiersOrm(
  args: Prisma.ProductIdentifiersFindUniqueArgs,
) {
  return prisma.productIdentifiers.findUnique(args);
}

export async function findManyProductIdentifiersOrm(args?: Prisma.ProductIdentifiersFindManyArgs) {
  return prisma.productIdentifiers.findMany(args);
}

// UPDATE
export async function updateProductIdentifiersOrm(args: Prisma.ProductIdentifiersUpdateArgs) {
  return prisma.productIdentifiers.update(args);
}

export async function updateManyProductIdentifiersOrm(
  args: Prisma.ProductIdentifiersUpdateManyArgs,
) {
  return prisma.productIdentifiers.updateMany(args);
}

// UPSERT
export async function upsertProductIdentifiersOrm(args: Prisma.ProductIdentifiersUpsertArgs) {
  return prisma.productIdentifiers.upsert(args);
}

// DELETE
export async function deleteProductIdentifiersOrm(args: Prisma.ProductIdentifiersDeleteArgs) {
  return prisma.productIdentifiers.delete(args);
}

export async function deleteManyProductIdentifiersOrm(
  args?: Prisma.ProductIdentifiersDeleteManyArgs,
) {
  return prisma.productIdentifiers.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductIdentifiersOrm<
  T extends Prisma.ProductIdentifiersAggregateArgs = {},
>(args?: T): Promise<Prisma.GetProductIdentifiersAggregateType<T>> {
  return prisma.productIdentifiers.aggregate((args ?? {}) as T);
}

export async function countProductIdentifiersOrm(args?: Prisma.ProductIdentifiersCountArgs) {
  return prisma.productIdentifiers.count(args);
}

export async function groupByProductIdentifiersOrm(args: Prisma.ProductIdentifiersGroupByArgs) {
  return prisma.productIdentifiers.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
