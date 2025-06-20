'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// REGISTRY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createRegistryOrm(args: Prisma.RegistryCreateArgs) {
  return prisma.registry.create(args);
}

// READ
export async function findFirstRegistryOrm(args?: Prisma.RegistryFindFirstArgs) {
  return prisma.registry.findFirst(args);
}

export async function findUniqueRegistryOrm(args: Prisma.RegistryFindUniqueArgs) {
  return prisma.registry.findUnique(args);
}

export async function findManyRegistriesOrm(args?: Prisma.RegistryFindManyArgs) {
  return prisma.registry.findMany(args);
}

// UPDATE
export async function updateRegistryOrm(args: Prisma.RegistryUpdateArgs) {
  return prisma.registry.update(args);
}

export async function updateManyRegistriesOrm(args: Prisma.RegistryUpdateManyArgs) {
  return prisma.registry.updateMany(args);
}

// UPSERT
export async function upsertRegistryOrm(args: Prisma.RegistryUpsertArgs) {
  return prisma.registry.upsert(args);
}

// DELETE
export async function deleteRegistryOrm(args: Prisma.RegistryDeleteArgs) {
  return prisma.registry.delete(args);
}

export async function deleteManyRegistriesOrm(args?: Prisma.RegistryDeleteManyArgs) {
  return prisma.registry.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistriesOrm(args?: Prisma.RegistryAggregateArgs) {
  return prisma.registry.aggregate(args ?? {});
}

export async function countRegistriesOrm(args?: Prisma.RegistryCountArgs) {
  return prisma.registry.count(args);
}

export async function groupByRegistriesOrm(args: Prisma.RegistryGroupByArgs) {
  return prisma.registry.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// REGISTRYITEM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createRegistryItemOrm(args: Prisma.RegistryItemCreateArgs) {
  return prisma.registryItem.create(args);
}

// READ
export async function findFirstRegistryItemOrm(args?: Prisma.RegistryItemFindFirstArgs) {
  return prisma.registryItem.findFirst(args);
}

export async function findUniqueRegistryItemOrm(args: Prisma.RegistryItemFindUniqueArgs) {
  return prisma.registryItem.findUnique(args);
}

export async function findManyRegistryItemsOrm(args?: Prisma.RegistryItemFindManyArgs) {
  return prisma.registryItem.findMany(args);
}

// UPDATE
export async function updateRegistryItemOrm(args: Prisma.RegistryItemUpdateArgs) {
  return prisma.registryItem.update(args);
}

export async function updateManyRegistryItemsOrm(args: Prisma.RegistryItemUpdateManyArgs) {
  return prisma.registryItem.updateMany(args);
}

// UPSERT
export async function upsertRegistryItemOrm(args: Prisma.RegistryItemUpsertArgs) {
  return prisma.registryItem.upsert(args);
}

// DELETE
export async function deleteRegistryItemOrm(args: Prisma.RegistryItemDeleteArgs) {
  return prisma.registryItem.delete(args);
}

export async function deleteManyRegistryItemsOrm(args?: Prisma.RegistryItemDeleteManyArgs) {
  return prisma.registryItem.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryItemsOrm(args?: Prisma.RegistryItemAggregateArgs) {
  return prisma.registryItem.aggregate(args ?? {});
}

export async function countRegistryItemsOrm(args?: Prisma.RegistryItemCountArgs) {
  return prisma.registryItem.count(args);
}

export async function groupByRegistryItemsOrm(args: Prisma.RegistryItemGroupByArgs) {
  return prisma.registryItem.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// REGISTRYPURCHASEJOIN CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinCreateArgs) {
  return prisma.registryPurchaseJoin.create(args);
}

// READ
export async function findFirstRegistryPurchaseJoinOrm(
  args?: Prisma.RegistryPurchaseJoinFindFirstArgs,
) {
  return prisma.registryPurchaseJoin.findFirst(args);
}

export async function findUniqueRegistryPurchaseJoinOrm(
  args: Prisma.RegistryPurchaseJoinFindUniqueArgs,
) {
  return prisma.registryPurchaseJoin.findUnique(args);
}

export async function findManyRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  return prisma.registryPurchaseJoin.findMany(args);
}

// UPDATE
export async function updateRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinUpdateArgs) {
  return prisma.registryPurchaseJoin.update(args);
}

export async function updateManyRegistryPurchaseJoinsOrm(
  args: Prisma.RegistryPurchaseJoinUpdateManyArgs,
) {
  return prisma.registryPurchaseJoin.updateMany(args);
}

// UPSERT
export async function upsertRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinUpsertArgs) {
  return prisma.registryPurchaseJoin.upsert(args);
}

// DELETE
export async function deleteRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinDeleteArgs) {
  return prisma.registryPurchaseJoin.delete(args);
}

export async function deleteManyRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinDeleteManyArgs,
) {
  return prisma.registryPurchaseJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinAggregateArgs,
) {
  return prisma.registryPurchaseJoin.aggregate(args ?? {});
}

export async function countRegistryPurchaseJoinsOrm(args?: Prisma.RegistryPurchaseJoinCountArgs) {
  return prisma.registryPurchaseJoin.count(args);
}

export async function groupByRegistryPurchaseJoinsOrm(
  args: Prisma.RegistryPurchaseJoinGroupByArgs,
) {
  return prisma.registryPurchaseJoin.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// REGISTRYUSERJOIN CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createRegistryUserJoinOrm(args: Prisma.RegistryUserJoinCreateArgs) {
  return prisma.registryUserJoin.create(args);
}

// READ
export async function findFirstRegistryUserJoinOrm(args?: Prisma.RegistryUserJoinFindFirstArgs) {
  return prisma.registryUserJoin.findFirst(args);
}

export async function findUniqueRegistryUserJoinOrm(args: Prisma.RegistryUserJoinFindUniqueArgs) {
  return prisma.registryUserJoin.findUnique(args);
}

export async function findManyRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinFindManyArgs) {
  return prisma.registryUserJoin.findMany(args);
}

// UPDATE
export async function updateRegistryUserJoinOrm(args: Prisma.RegistryUserJoinUpdateArgs) {
  return prisma.registryUserJoin.update(args);
}

export async function updateManyRegistryUserJoinsOrm(args: Prisma.RegistryUserJoinUpdateManyArgs) {
  return prisma.registryUserJoin.updateMany(args);
}

// UPSERT
export async function upsertRegistryUserJoinOrm(args: Prisma.RegistryUserJoinUpsertArgs) {
  return prisma.registryUserJoin.upsert(args);
}

// DELETE
export async function deleteRegistryUserJoinOrm(args: Prisma.RegistryUserJoinDeleteArgs) {
  return prisma.registryUserJoin.delete(args);
}

export async function deleteManyRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinDeleteManyArgs) {
  return prisma.registryUserJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinAggregateArgs) {
  return prisma.registryUserJoin.aggregate(args ?? {});
}

export async function countRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinCountArgs) {
  return prisma.registryUserJoin.count(args);
}

export async function groupByRegistryUserJoinsOrm(args: Prisma.RegistryUserJoinGroupByArgs) {
  return prisma.registryUserJoin.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
