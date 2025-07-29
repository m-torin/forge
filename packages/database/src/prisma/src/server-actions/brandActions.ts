'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateBrandsOrm,
  countBrandsOrm,
  createBrandOrm,
  deleteBrandOrm,
  deleteManyBrandsOrm,
  findFirstBrandOrm,
  findManyBrandsOrm,
  findUniqueBrandOrm,
  groupByBrandsOrm,
  updateBrandOrm,
  updateManyBrandsOrm,
  upsertBrandOrm,
} from '../orm/ecommerce/brandOrm';

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

// Convenience action for UI components
export async function getBrandsAction(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  includeDeleted?: boolean;
}) {
  'use server';
  const { limit = 50, page = 1, search, status, includeDeleted = false } = params || {};
  const skip = (page - 1) * limit;

  const where: Prisma.BrandWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
  };

  const [brands, total] = await Promise.all([
    findManyBrandsOrm({
      where,
      take: limit,
      skip,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
    countBrandsOrm({ where }),
  ]);

  return {
    data: brands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
