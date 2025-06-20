'use server';

import {
  createTaxonomyOrm,
  findFirstTaxonomyOrm,
  findUniqueTaxonomyOrm,
  findManyTaxonomiesOrm,
  updateTaxonomyOrm,
  updateManyTaxonomiesOrm,
  upsertTaxonomyOrm,
  deleteTaxonomyOrm,
  deleteManyTaxonomiesOrm,
  aggregateTaxonomiesOrm,
  countTaxonomiesOrm,
  groupByTaxonomiesOrm,
} from '../orm/taxonomyOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// TAXONOMY SERVER ACTIONS
//==============================================================================

export async function createTaxonomyAction(args: Prisma.TaxonomyCreateArgs) {
  'use server';
  return createTaxonomyOrm(args);
}

export async function findFirstTaxonomyAction(args?: Prisma.TaxonomyFindFirstArgs) {
  'use server';
  return findFirstTaxonomyOrm(args);
}

export async function findUniqueTaxonomyAction(args: Prisma.TaxonomyFindUniqueArgs) {
  'use server';
  return findUniqueTaxonomyOrm(args);
}

export async function findManyTaxonomiesAction(args?: Prisma.TaxonomyFindManyArgs) {
  'use server';
  return findManyTaxonomiesOrm(args);
}

export async function updateTaxonomyAction(args: Prisma.TaxonomyUpdateArgs) {
  'use server';
  return updateTaxonomyOrm(args);
}

export async function updateManyTaxonomiesAction(args: Prisma.TaxonomyUpdateManyArgs) {
  'use server';
  return updateManyTaxonomiesOrm(args);
}

export async function upsertTaxonomyAction(args: Prisma.TaxonomyUpsertArgs) {
  'use server';
  return upsertTaxonomyOrm(args);
}

export async function deleteTaxonomyAction(args: Prisma.TaxonomyDeleteArgs) {
  'use server';
  return deleteTaxonomyOrm(args);
}

export async function deleteManyTaxonomiesAction(args?: Prisma.TaxonomyDeleteManyArgs) {
  'use server';
  return deleteManyTaxonomiesOrm(args);
}

export async function aggregateTaxonomiesAction(args?: Prisma.TaxonomyAggregateArgs) {
  'use server';
  return aggregateTaxonomiesOrm(args);
}

export async function countTaxonomiesAction(args?: Prisma.TaxonomyCountArgs) {
  'use server';
  return countTaxonomiesOrm(args);
}

export async function groupByTaxonomiesAction(args: Prisma.TaxonomyGroupByArgs) {
  'use server';
  return groupByTaxonomiesOrm(args);
}

// Backward compatibility aliases
export const getTaxonomyAction = findUniqueTaxonomyAction;

// Convenience action for UI components
export async function getTaxonomiesAction(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  includeDeleted?: boolean;
}) {
  'use server';
  const { limit = 50, page = 1, search, status, includeDeleted = false } = params || {};
  const skip = (page - 1) * limit;

  const where: Prisma.TaxonomyWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
  };

  const [taxonomies, total] = await Promise.all([
    findManyTaxonomiesOrm({
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
    countTaxonomiesOrm({ where }),
  ]);

  return {
    data: taxonomies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
