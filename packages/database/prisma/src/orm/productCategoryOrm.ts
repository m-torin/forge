'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// PRODUCTCATEGORY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createProductCategoryOrm(args: Prisma.ProductCategoryCreateArgs) {
  return prisma.productCategory.create(args);
}

// READ
export async function findFirstProductCategoryOrm(args?: Prisma.ProductCategoryFindFirstArgs) {
  return prisma.productCategory.findFirst(args);
}

export async function findUniqueProductCategoryOrm(args: Prisma.ProductCategoryFindUniqueArgs) {
  return prisma.productCategory.findUnique(args);
}

export async function findManyProductCategoriesOrm(args?: Prisma.ProductCategoryFindManyArgs) {
  return prisma.productCategory.findMany(args);
}

// UPDATE
export async function updateProductCategoryOrm(args: Prisma.ProductCategoryUpdateArgs) {
  return prisma.productCategory.update(args);
}

export async function updateManyProductCategoriesOrm(args: Prisma.ProductCategoryUpdateManyArgs) {
  return prisma.productCategory.updateMany(args);
}

// UPSERT
export async function upsertProductCategoryOrm(args: Prisma.ProductCategoryUpsertArgs) {
  return prisma.productCategory.upsert(args);
}

// DELETE
export async function deleteProductCategoryOrm(args: Prisma.ProductCategoryDeleteArgs) {
  return prisma.productCategory.delete(args);
}

export async function deleteManyProductCategoriesOrm(args?: Prisma.ProductCategoryDeleteManyArgs) {
  return prisma.productCategory.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductCategoriesOrm<
  T extends Prisma.ProductCategoryAggregateArgs = {},
>(args?: T): Promise<Prisma.GetProductCategoryAggregateType<T>> {
  return prisma.productCategory.aggregate((args ?? {}) as T);
}

export async function countProductCategoriesOrm(args?: Prisma.ProductCategoryCountArgs) {
  return prisma.productCategory.count(args);
}

export async function groupByProductCategoriesOrm(args: Prisma.ProductCategoryGroupByArgs) {
  return prisma.productCategory.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
