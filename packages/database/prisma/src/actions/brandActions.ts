'use server';

import {
  createBrandOrm,
  findFirstBrandOrm,
  findUniqueBrandOrm,
  findManyBrandsOrm,
  updateBrandOrm,
  updateManyBrandsOrm,
  upsertBrandOrm,
  deleteBrandOrm,
  deleteManyBrandsOrm,
  aggregateBrandsOrm,
  countBrandsOrm,
  groupByBrandsOrm,
} from '../orm/brandOrm';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// BRAND SERVER ACTIONS
//==============================================================================

export async function createBrandAction(args: Prisma.BrandCreateArgs) {
  'use server';
  return createBrandOrm(args);
}

export async function findFirstBrandAction(args?: Prisma.BrandFindFirstArgs) {
  'use server';
  return findFirstBrandOrm(args);
}

export async function findUniqueBrandAction(args: Prisma.BrandFindUniqueArgs) {
  'use server';
  return findUniqueBrandOrm(args);
}

export async function findManyBrandsAction(args?: Prisma.BrandFindManyArgs) {
  'use server';
  return findManyBrandsOrm(args);
}

export async function updateBrandAction(args: Prisma.BrandUpdateArgs) {
  'use server';
  return updateBrandOrm(args);
}

export async function updateManyBrandsAction(args: Prisma.BrandUpdateManyArgs) {
  'use server';
  return updateManyBrandsOrm(args);
}

export async function upsertBrandAction(args: Prisma.BrandUpsertArgs) {
  'use server';
  return upsertBrandOrm(args);
}

export async function deleteBrandAction(args: Prisma.BrandDeleteArgs) {
  'use server';
  return deleteBrandOrm(args);
}

export async function deleteManyBrandsAction(args?: Prisma.BrandDeleteManyArgs) {
  'use server';
  return deleteManyBrandsOrm(args);
}

export async function aggregateBrandsAction(args?: Prisma.BrandAggregateArgs) {
  'use server';
  return aggregateBrandsOrm(args);
}

export async function countBrandsAction(args?: Prisma.BrandCountArgs) {
  'use server';
  return countBrandsOrm(args);
}

export async function groupByBrandsAction(args: Prisma.BrandGroupByArgs) {
  'use server';
  return groupByBrandsOrm(args);
}
