'use server';

import {
  createCollectionOrm,
  findFirstCollectionOrm,
  findUniqueCollectionOrm,
  findManyCollectionsOrm,
  updateCollectionOrm,
  updateManyCollectionsOrm,
  upsertCollectionOrm,
  deleteCollectionOrm,
  deleteManyCollectionsOrm,
  aggregateCollectionsOrm,
  countCollectionsOrm,
  groupByCollectionsOrm,
} from '../orm/collectionOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// COLLECTION SERVER ACTIONS
//==============================================================================

export async function createCollectionAction(args: Prisma.CollectionCreateArgs) {
  'use server';
  return createCollectionOrm(args);
}

export async function findFirstCollectionAction(args?: Prisma.CollectionFindFirstArgs) {
  'use server';
  return findFirstCollectionOrm(args);
}

export async function findUniqueCollectionAction(args: Prisma.CollectionFindUniqueArgs) {
  'use server';
  return findUniqueCollectionOrm(args);
}

export async function findManyCollectionsAction(args?: Prisma.CollectionFindManyArgs) {
  'use server';
  return findManyCollectionsOrm(args);
}

export async function updateCollectionAction(args: Prisma.CollectionUpdateArgs) {
  'use server';
  return updateCollectionOrm(args);
}

export async function updateManyCollectionsAction(args: Prisma.CollectionUpdateManyArgs) {
  'use server';
  return updateManyCollectionsOrm(args);
}

export async function upsertCollectionAction(args: Prisma.CollectionUpsertArgs) {
  'use server';
  return upsertCollectionOrm(args);
}

export async function deleteCollectionAction(args: Prisma.CollectionDeleteArgs) {
  'use server';
  return deleteCollectionOrm(args);
}

export async function deleteManyCollectionsAction(args?: Prisma.CollectionDeleteManyArgs) {
  'use server';
  return deleteManyCollectionsOrm(args);
}

export async function aggregateCollectionsAction(args?: Prisma.CollectionAggregateArgs) {
  'use server';
  return aggregateCollectionsOrm(args);
}

export async function countCollectionsAction(args?: Prisma.CollectionCountArgs) {
  'use server';
  return countCollectionsOrm(args);
}

export async function groupByCollectionsAction(args: Prisma.CollectionGroupByArgs) {
  'use server';
  return groupByCollectionsOrm(args);
}

// Convenience action for UI components
export async function getCollectionsAction(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  includeDeleted?: boolean;
}) {
  'use server';
  const { limit = 50, page = 1, search, status, includeDeleted = false } = params || {};
  const skip = (page - 1) * limit;

  const where: Prisma.CollectionWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
  };

  const [collections, total] = await Promise.all([
    findManyCollectionsOrm({
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
    countCollectionsOrm({ where }),
  ]);

  return {
    data: collections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
