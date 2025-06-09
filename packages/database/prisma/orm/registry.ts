"use server";

import { database } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// REGISTRY CRUD OPERATIONS
//==============================================================================

export async function createRegistry(data: Prisma.RegistryCreateInput) {
  return database.registry.create({ data });
}

export async function findManyRegistries(args?: Prisma.RegistryFindManyArgs) {
  return database.registry.findMany(args);
}

export async function findUniqueRegistry(args: Prisma.RegistryFindUniqueArgs) {
  return database.registry.findUnique(args);
}

export async function findFirstRegistry(args?: Prisma.RegistryFindFirstArgs) {
  return database.registry.findFirst(args);
}

export async function updateRegistry(args: Prisma.RegistryUpdateArgs) {
  return database.registry.update(args);
}

export async function updateManyRegistries(args: Prisma.RegistryUpdateManyArgs) {
  return database.registry.updateMany(args);
}

export async function upsertRegistry(args: Prisma.RegistryUpsertArgs) {
  return database.registry.upsert(args);
}

export async function deleteRegistry(args: Prisma.RegistryDeleteArgs) {
  return database.registry.delete(args);
}

export async function deleteManyRegistries(args?: Prisma.RegistryDeleteManyArgs) {
  return database.registry.deleteMany(args);
}

export async function countRegistries(args?: Prisma.RegistryCountArgs) {
  return database.registry.count(args);
}

export async function aggregateRegistries(args?: Prisma.RegistryAggregateArgs) {
  return database.registry.aggregate(args);
}

export async function groupByRegistries(args: Prisma.RegistryGroupByArgs) {
  return database.registry.groupBy(args);
}

//==============================================================================
// REGISTRY ITEM CRUD OPERATIONS
//==============================================================================

export async function createRegistryItem(data: Prisma.RegistryItemCreateInput) {
  return database.registryItem.create({ data });
}

export async function findManyRegistryItems(args?: Prisma.RegistryItemFindManyArgs) {
  return database.registryItem.findMany(args);
}

export async function findUniqueRegistryItem(args: Prisma.RegistryItemFindUniqueArgs) {
  return database.registryItem.findUnique(args);
}

export async function findFirstRegistryItem(args?: Prisma.RegistryItemFindFirstArgs) {
  return database.registryItem.findFirst(args);
}

export async function updateRegistryItem(args: Prisma.RegistryItemUpdateArgs) {
  return database.registryItem.update(args);
}

export async function updateManyRegistryItems(args: Prisma.RegistryItemUpdateManyArgs) {
  return database.registryItem.updateMany(args);
}

export async function upsertRegistryItem(args: Prisma.RegistryItemUpsertArgs) {
  return database.registryItem.upsert(args);
}

export async function deleteRegistryItem(args: Prisma.RegistryItemDeleteArgs) {
  return database.registryItem.delete(args);
}

export async function deleteManyRegistryItems(args?: Prisma.RegistryItemDeleteManyArgs) {
  return database.registryItem.deleteMany(args);
}

export async function countRegistryItems(args?: Prisma.RegistryItemCountArgs) {
  return database.registryItem.count(args);
}

export async function aggregateRegistryItems(args?: Prisma.RegistryItemAggregateArgs) {
  return database.registryItem.aggregate(args);
}

export async function groupByRegistryItems(args: Prisma.RegistryItemGroupByArgs) {
  return database.registryItem.groupBy(args);
}

//==============================================================================
// REGISTRY PURCHASE JOIN CRUD OPERATIONS
//==============================================================================

export async function createRegistryPurchaseJoin(data: Prisma.RegistryPurchaseJoinCreateInput) {
  return database.registryPurchaseJoin.create({ data });
}

export async function findManyRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinFindManyArgs) {
  return database.registryPurchaseJoin.findMany(args);
}

export async function findUniqueRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinFindUniqueArgs) {
  return database.registryPurchaseJoin.findUnique(args);
}

export async function findFirstRegistryPurchaseJoin(args?: Prisma.RegistryPurchaseJoinFindFirstArgs) {
  return database.registryPurchaseJoin.findFirst(args);
}

export async function updateRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinUpdateArgs) {
  return database.registryPurchaseJoin.update(args);
}

export async function updateManyRegistryPurchaseJoins(args: Prisma.RegistryPurchaseJoinUpdateManyArgs) {
  return database.registryPurchaseJoin.updateMany(args);
}

export async function upsertRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinUpsertArgs) {
  return database.registryPurchaseJoin.upsert(args);
}

export async function deleteRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinDeleteArgs) {
  return database.registryPurchaseJoin.delete(args);
}

export async function deleteManyRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinDeleteManyArgs) {
  return database.registryPurchaseJoin.deleteMany(args);
}

export async function countRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinCountArgs) {
  return database.registryPurchaseJoin.count(args);
}

export async function aggregateRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinAggregateArgs) {
  return database.registryPurchaseJoin.aggregate(args);
}

export async function groupByRegistryPurchaseJoins(args: Prisma.RegistryPurchaseJoinGroupByArgs) {
  return database.registryPurchaseJoin.groupBy(args);
}

//==============================================================================
// REGISTRY USER JOIN CRUD OPERATIONS
//==============================================================================

export async function createRegistryUserJoin(data: Prisma.RegistryUserJoinCreateInput) {
  return database.registryUserJoin.create({ data });
}

export async function findManyRegistryUserJoins(args?: Prisma.RegistryUserJoinFindManyArgs) {
  return database.registryUserJoin.findMany(args);
}

export async function findUniqueRegistryUserJoin(args: Prisma.RegistryUserJoinFindUniqueArgs) {
  return database.registryUserJoin.findUnique(args);
}

export async function findFirstRegistryUserJoin(args?: Prisma.RegistryUserJoinFindFirstArgs) {
  return database.registryUserJoin.findFirst(args);
}

export async function updateRegistryUserJoin(args: Prisma.RegistryUserJoinUpdateArgs) {
  return database.registryUserJoin.update(args);
}

export async function updateManyRegistryUserJoins(args: Prisma.RegistryUserJoinUpdateManyArgs) {
  return database.registryUserJoin.updateMany(args);
}

export async function upsertRegistryUserJoin(args: Prisma.RegistryUserJoinUpsertArgs) {
  return database.registryUserJoin.upsert(args);
}

export async function deleteRegistryUserJoin(args: Prisma.RegistryUserJoinDeleteArgs) {
  return database.registryUserJoin.delete(args);
}

export async function deleteManyRegistryUserJoins(args?: Prisma.RegistryUserJoinDeleteManyArgs) {
  return database.registryUserJoin.deleteMany(args);
}

export async function countRegistryUserJoins(args?: Prisma.RegistryUserJoinCountArgs) {
  return database.registryUserJoin.count(args);
}