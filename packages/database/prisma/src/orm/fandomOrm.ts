'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// FANDOM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createFandomOrm(args: Prisma.FandomCreateArgs) {
  return prisma.fandom.create(args);
}

// READ
export async function findFirstFandomOrm(args?: Prisma.FandomFindFirstArgs) {
  return prisma.fandom.findFirst(args);
}

export async function findUniqueFandomOrm(args: Prisma.FandomFindUniqueArgs) {
  return prisma.fandom.findUnique(args);
}

export async function findManyFandomsOrm(args?: Prisma.FandomFindManyArgs) {
  return prisma.fandom.findMany(args);
}

// UPDATE
export async function updateFandomOrm(args: Prisma.FandomUpdateArgs) {
  return prisma.fandom.update(args);
}

export async function updateManyFandomsOrm(args: Prisma.FandomUpdateManyArgs) {
  return prisma.fandom.updateMany(args);
}

// UPSERT
export async function upsertFandomOrm(args: Prisma.FandomUpsertArgs) {
  return prisma.fandom.upsert(args);
}

// DELETE
export async function deleteFandomOrm(args: Prisma.FandomDeleteArgs) {
  return prisma.fandom.delete(args);
}

export async function deleteManyFandomsOrm(args?: Prisma.FandomDeleteManyArgs) {
  return prisma.fandom.deleteMany(args);
}

// AGGREGATE
export async function aggregateFandomsOrm<T extends Prisma.FandomAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetFandomAggregateType<T>> {
  return prisma.fandom.aggregate((args ?? {}) as T);
}

export async function countFandomsOrm(args?: Prisma.FandomCountArgs) {
  return prisma.fandom.count(args);
}

export async function groupByFandomsOrm(args: Prisma.FandomGroupByArgs) {
  return prisma.fandom.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
