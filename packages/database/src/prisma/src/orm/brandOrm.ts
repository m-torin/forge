'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// BRAND CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createBrandOrm(args: Prisma.BrandCreateArgs) {
  return prisma.brand.create(args);
}

// READ
export async function findFirstBrandOrm(args?: Prisma.BrandFindFirstArgs) {
  return prisma.brand.findFirst(args);
}

export async function findUniqueBrandOrm(args: Prisma.BrandFindUniqueArgs) {
  return prisma.brand.findUnique(args);
}

export async function findManyBrandsOrm(args?: Prisma.BrandFindManyArgs) {
  return prisma.brand.findMany(args);
}

// UPDATE
export async function updateBrandOrm(args: Prisma.BrandUpdateArgs) {
  return prisma.brand.update(args);
}

export async function updateManyBrandsOrm(args: Prisma.BrandUpdateManyArgs) {
  return prisma.brand.updateMany(args);
}

// UPSERT
export async function upsertBrandOrm(args: Prisma.BrandUpsertArgs) {
  return prisma.brand.upsert(args);
}

// DELETE
export async function deleteBrandOrm(args: Prisma.BrandDeleteArgs) {
  return prisma.brand.delete(args);
}

export async function deleteManyBrandsOrm(args?: Prisma.BrandDeleteManyArgs) {
  return prisma.brand.deleteMany(args);
}

// AGGREGATE
export async function aggregateBrandsOrm<T extends Prisma.BrandAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetBrandAggregateType<T>> {
  return prisma.brand.aggregate((args ?? {}) as T);
}

export async function countBrandsOrm(args?: Prisma.BrandCountArgs) {
  return prisma.brand.count(args);
}

export async function groupByBrandsOrm(args: Prisma.BrandGroupByArgs) {
  return prisma.brand.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
