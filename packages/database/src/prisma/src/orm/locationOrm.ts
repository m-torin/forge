'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// LOCATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createLocationOrm(args: Prisma.LocationCreateArgs) {
  return prisma.location.create(args);
}

// READ
export async function findFirstLocationOrm(args?: Prisma.LocationFindFirstArgs) {
  return prisma.location.findFirst(args);
}

export async function findUniqueLocationOrm(args: Prisma.LocationFindUniqueArgs) {
  return prisma.location.findUnique(args);
}

export async function findManyLocationsOrm(args?: Prisma.LocationFindManyArgs) {
  return prisma.location.findMany(args);
}

// UPDATE
export async function updateLocationOrm(args: Prisma.LocationUpdateArgs) {
  return prisma.location.update(args);
}

export async function updateManyLocationsOrm(args: Prisma.LocationUpdateManyArgs) {
  return prisma.location.updateMany(args);
}

// UPSERT
export async function upsertLocationOrm(args: Prisma.LocationUpsertArgs) {
  return prisma.location.upsert(args);
}

// DELETE
export async function deleteLocationOrm(args: Prisma.LocationDeleteArgs) {
  return prisma.location.delete(args);
}

export async function deleteManyLocationsOrm(args?: Prisma.LocationDeleteManyArgs) {
  return prisma.location.deleteMany(args);
}

// AGGREGATE
export async function aggregateLocationsOrm<T extends Prisma.LocationAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetLocationAggregateType<T>> {
  return prisma.location.aggregate((args ?? {}) as T);
}

export async function countLocationsOrm(args?: Prisma.LocationCountArgs) {
  return prisma.location.count(args);
}

export async function groupByLocationsOrm(args: Prisma.LocationGroupByArgs) {
  return prisma.location.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
