'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateProductCategoriesOrm,
  countProductCategoriesOrm,
  createProductCategoryOrm,
  deleteManyProductCategoriesOrm,
  deleteProductCategoryOrm,
  findFirstProductCategoryOrm,
  findManyProductCategoriesOrm,
  findUniqueProductCategoryOrm,
  groupByProductCategoriesOrm,
  updateManyProductCategoriesOrm,
  updateProductCategoryOrm,
  upsertProductCategoryOrm,
} from '../orm/ecommerce/productCategoryOrm';

//==============================================================================
// PRODUCT CATEGORY SERVER ACTIONS
//==============================================================================

export async function createProductCategoryAction(args: Prisma.ProductCategoryCreateArgs) {
  'use server';
  return createProductCategoryOrm(args);
}

export async function findFirstProductCategoryAction(args?: Prisma.ProductCategoryFindFirstArgs) {
  'use server';
  return findFirstProductCategoryOrm(args);
}

export async function findUniqueProductCategoryAction(args: Prisma.ProductCategoryFindUniqueArgs) {
  'use server';
  return findUniqueProductCategoryOrm(args);
}

export async function findManyProductCategoriesAction(args?: Prisma.ProductCategoryFindManyArgs) {
  'use server';
  return findManyProductCategoriesOrm(args);
}

export async function updateProductCategoryAction(args: Prisma.ProductCategoryUpdateArgs) {
  'use server';
  return updateProductCategoryOrm(args);
}

export async function updateManyProductCategoriesAction(
  args: Prisma.ProductCategoryUpdateManyArgs,
) {
  'use server';
  return updateManyProductCategoriesOrm(args);
}

export async function upsertProductCategoryAction(args: Prisma.ProductCategoryUpsertArgs) {
  'use server';
  return upsertProductCategoryOrm(args);
}

export async function deleteProductCategoryAction(args: Prisma.ProductCategoryDeleteArgs) {
  'use server';
  return deleteProductCategoryOrm(args);
}

export async function deleteManyProductCategoriesAction(
  args?: Prisma.ProductCategoryDeleteManyArgs,
) {
  'use server';
  return deleteManyProductCategoriesOrm(args);
}

export async function aggregateProductCategoriesAction(args?: Prisma.ProductCategoryAggregateArgs) {
  'use server';
  return aggregateProductCategoriesOrm(args);
}

export async function countProductCategoriesAction(args?: Prisma.ProductCategoryCountArgs) {
  'use server';
  return countProductCategoriesOrm(args);
}

export async function groupByProductCategoriesAction(args: Prisma.ProductCategoryGroupByArgs) {
  'use server';
  return groupByProductCategoriesOrm(args);
}
