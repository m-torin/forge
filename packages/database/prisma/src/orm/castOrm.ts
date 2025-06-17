'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// CAST CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCastOrm(args: Prisma.CastCreateArgs) {
  return prisma.cast.create(args);
}

// READ
export async function findFirstCastOrm(args?: Prisma.CastFindFirstArgs) {
  return prisma.cast.findFirst(args);
}

export async function findUniqueCastOrm(args: Prisma.CastFindUniqueArgs) {
  return prisma.cast.findUnique(args);
}

export async function findManyCastsOrm(args?: Prisma.CastFindManyArgs) {
  return prisma.cast.findMany(args);
}

// UPDATE
export async function updateCastOrm(args: Prisma.CastUpdateArgs) {
  return prisma.cast.update(args);
}

export async function updateManyCastsOrm(args: Prisma.CastUpdateManyArgs) {
  return prisma.cast.updateMany(args);
}

// UPSERT
export async function upsertCastOrm(args: Prisma.CastUpsertArgs) {
  return prisma.cast.upsert(args);
}

// DELETE
export async function deleteCastOrm(args: Prisma.CastDeleteArgs) {
  return prisma.cast.delete(args);
}

export async function deleteManyCastsOrm(args?: Prisma.CastDeleteManyArgs) {
  return prisma.cast.deleteMany(args);
}

// AGGREGATE
export async function aggregateCastsOrm<T extends Prisma.CastAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetCastAggregateType<T>> {
  return prisma.cast.aggregate((args ?? {}) as T);
}

export async function countCastsOrm(args?: Prisma.CastCountArgs) {
  return prisma.cast.count(args);
}

export async function groupByCastsOrm(args: Prisma.CastGroupByArgs) {
  return prisma.cast.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
