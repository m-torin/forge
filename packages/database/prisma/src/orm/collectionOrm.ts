'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// COLLECTION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCollectionOrm(args: Prisma.CollectionCreateArgs) {
  return prisma.collection.create(args);
}

// READ
export async function findFirstCollectionOrm(args?: Prisma.CollectionFindFirstArgs) {
  return prisma.collection.findFirst(args);
}

export async function findUniqueCollectionOrm(args: Prisma.CollectionFindUniqueArgs) {
  return prisma.collection.findUnique(args);
}

export async function findManyCollectionsOrm(args?: Prisma.CollectionFindManyArgs) {
  return prisma.collection.findMany(args);
}

// UPDATE
export async function updateCollectionOrm(args: Prisma.CollectionUpdateArgs) {
  return prisma.collection.update(args);
}

export async function updateManyCollectionsOrm(args: Prisma.CollectionUpdateManyArgs) {
  return prisma.collection.updateMany(args);
}

// UPSERT
export async function upsertCollectionOrm(args: Prisma.CollectionUpsertArgs) {
  return prisma.collection.upsert(args);
}

// DELETE
export async function deleteCollectionOrm(args: Prisma.CollectionDeleteArgs) {
  return prisma.collection.delete(args);
}

export async function deleteManyCollectionsOrm(args?: Prisma.CollectionDeleteManyArgs) {
  return prisma.collection.deleteMany(args);
}

// AGGREGATE
export async function aggregateCollectionsOrm<T extends Prisma.CollectionAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetCollectionAggregateType<T>> {
  return prisma.collection.aggregate((args ?? {}) as T);
}

export async function countCollectionsOrm(args?: Prisma.CollectionCountArgs) {
  return prisma.collection.count(args);
}

export async function groupByCollectionsOrm(args: Prisma.CollectionGroupByArgs) {
  return prisma.collection.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
