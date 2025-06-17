'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// MEDIA CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createMediaOrm(args: Prisma.MediaCreateArgs) {
  return prisma.media.create(args);
}

// READ
export async function findFirstMediaOrm(args?: Prisma.MediaFindFirstArgs) {
  return prisma.media.findFirst(args);
}

export async function findUniqueMediaOrm(args: Prisma.MediaFindUniqueArgs) {
  return prisma.media.findUnique(args);
}

export async function findManyMediaOrm(args?: Prisma.MediaFindManyArgs) {
  return prisma.media.findMany(args);
}

// UPDATE
export async function updateMediaOrm(args: Prisma.MediaUpdateArgs) {
  return prisma.media.update(args);
}

export async function updateManyMediaOrm(args: Prisma.MediaUpdateManyArgs) {
  return prisma.media.updateMany(args);
}

// UPSERT
export async function upsertMediaOrm(args: Prisma.MediaUpsertArgs) {
  return prisma.media.upsert(args);
}

// DELETE
export async function deleteMediaOrm(args: Prisma.MediaDeleteArgs) {
  return prisma.media.delete(args);
}

export async function deleteManyMediaOrm(args?: Prisma.MediaDeleteManyArgs) {
  return prisma.media.deleteMany(args);
}

// AGGREGATE
export async function aggregateMediaOrm<T extends Prisma.MediaAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetMediaAggregateType<T>> {
  return prisma.media.aggregate((args ?? {}) as T);
}

export async function countMediaOrm(args?: Prisma.MediaCountArgs) {
  return prisma.media.count(args);
}

export async function groupByMediaOrm(args: Prisma.MediaGroupByArgs) {
  return prisma.media.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
