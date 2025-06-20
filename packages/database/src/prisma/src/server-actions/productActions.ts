'use server';

import {
  createProductOrm,
  findFirstProductOrm,
  findUniqueProductOrm,
  findManyProductsOrm,
  updateProductOrm,
  updateManyProductsOrm,
  upsertProductOrm,
  deleteProductOrm,
  deleteManyProductsOrm,
  aggregateProductsOrm,
  countProductsOrm,
  groupByProductsOrm,
  createProductIdentifiersOrm,
  findFirstProductIdentifiersOrm,
  findUniqueProductIdentifiersOrm,
  findManyProductIdentifiersOrm,
  updateProductIdentifiersOrm,
  updateManyProductIdentifiersOrm,
  upsertProductIdentifiersOrm,
  deleteProductIdentifiersOrm,
  deleteManyProductIdentifiersOrm,
  aggregateProductIdentifiersOrm,
  countProductIdentifiersOrm,
  groupByProductIdentifiersOrm,
} from '../orm/productOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// PRODUCT SERVER ACTIONS
//==============================================================================

export async function createProductAction(args: Prisma.ProductCreateArgs) {
  'use server';
  return createProductOrm(args);
}

export async function findFirstProductAction(args?: Prisma.ProductFindFirstArgs) {
  'use server';
  return findFirstProductOrm(args);
}

export async function findUniqueProductAction(args: Prisma.ProductFindUniqueArgs) {
  'use server';
  return findUniqueProductOrm(args);
}

export async function findManyProductsAction(args?: Prisma.ProductFindManyArgs) {
  'use server';
  return findManyProductsOrm(args);
}

export async function updateProductAction(args: Prisma.ProductUpdateArgs) {
  'use server';
  return updateProductOrm(args);
}

export async function updateManyProductsAction(args: Prisma.ProductUpdateManyArgs) {
  'use server';
  return updateManyProductsOrm(args);
}

export async function upsertProductAction(args: Prisma.ProductUpsertArgs) {
  'use server';
  return upsertProductOrm(args);
}

export async function deleteProductAction(args: Prisma.ProductDeleteArgs) {
  'use server';
  return deleteProductOrm(args);
}

export async function deleteManyProductsAction(args?: Prisma.ProductDeleteManyArgs) {
  'use server';
  return deleteManyProductsOrm(args);
}

export async function aggregateProductsAction(args?: Prisma.ProductAggregateArgs) {
  'use server';
  return aggregateProductsOrm(args);
}

export async function countProductsAction(args?: Prisma.ProductCountArgs) {
  'use server';
  return countProductsOrm(args);
}

export async function groupByProductsAction(args: Prisma.ProductGroupByArgs) {
  'use server';
  return groupByProductsOrm(args);
}

//==============================================================================
// PRODUCT IDENTIFIERS SERVER ACTIONS
//==============================================================================

export async function createProductIdentifiersAction(args: Prisma.ProductIdentifiersCreateArgs) {
  'use server';
  return createProductIdentifiersOrm(args);
}

export async function findFirstProductIdentifiersAction(
  args?: Prisma.ProductIdentifiersFindFirstArgs,
) {
  'use server';
  return findFirstProductIdentifiersOrm(args);
}

export async function findUniqueProductIdentifiersAction(
  args: Prisma.ProductIdentifiersFindUniqueArgs,
) {
  'use server';
  return findUniqueProductIdentifiersOrm(args);
}

export async function findManyProductIdentifiersAction(
  args?: Prisma.ProductIdentifiersFindManyArgs,
) {
  'use server';
  return findManyProductIdentifiersOrm(args);
}

export async function updateProductIdentifiersAction(args: Prisma.ProductIdentifiersUpdateArgs) {
  'use server';
  return updateProductIdentifiersOrm(args);
}

export async function updateManyProductIdentifiersAction(
  args: Prisma.ProductIdentifiersUpdateManyArgs,
) {
  'use server';
  return updateManyProductIdentifiersOrm(args);
}

export async function upsertProductIdentifiersAction(args: Prisma.ProductIdentifiersUpsertArgs) {
  'use server';
  return upsertProductIdentifiersOrm(args);
}

export async function deleteProductIdentifiersAction(args: Prisma.ProductIdentifiersDeleteArgs) {
  'use server';
  return deleteProductIdentifiersOrm(args);
}

export async function deleteManyProductIdentifiersAction(
  args?: Prisma.ProductIdentifiersDeleteManyArgs,
) {
  'use server';
  return deleteManyProductIdentifiersOrm(args);
}

export async function aggregateProductIdentifiersAction(
  args?: Prisma.ProductIdentifiersAggregateArgs,
) {
  'use server';
  return aggregateProductIdentifiersOrm(args);
}

export async function countProductIdentifiersAction(args?: Prisma.ProductIdentifiersCountArgs) {
  'use server';
  return countProductIdentifiersOrm(args);
}

export async function groupByProductIdentifiersAction(args: Prisma.ProductIdentifiersGroupByArgs) {
  'use server';
  return groupByProductIdentifiersOrm(args);
}

//==============================================================================
// BACKWARD COMPATIBILITY ALIASES
//==============================================================================

// These aliases provide backward compatibility with existing code
export const getProductAction = findUniqueProductAction;
export const getProductsAction = findManyProductsAction;

// Convenience wrapper that adds pagination and filtering
export async function getProductsWithOptionsAction(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  includeDeleted?: boolean;
}) {
  'use server';
  const { limit = 50, page = 1, search, status, includeDeleted = false } = params || {};
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status: status as any }),
  };

  const [products, total] = await Promise.all([
    findManyProductsOrm({
      where,
      take: limit,
      skip,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            media: true,
          },
        },
      },
    }),
    countProductsOrm({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

//==============================================================================
// EXTENDED PRODUCT ACTIONS (With Full Relations)
//==============================================================================

export async function getProductsWithFullOptionsAction(args?: Prisma.ProductFindManyArgs) {
  'use server';
  return findManyProductsOrm({
    ...args,
    include: {
      collections: true,
      taxonomies: true,
      media: true,
      identifiers: true,
      ...args?.include,
    },
  });
}

export async function updateManyProductsWithFullOptionsAction(args: Prisma.ProductUpdateManyArgs) {
  'use server';
  return updateManyProductsOrm(args);
}
