"use server";

import { prisma } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// REGISTRY CRUD OPERATIONS
//==============================================================================

export async function createRegistry(args: Prisma.RegistryCreateArgs) {
  return prisma.registry.create(args);
}

export async function findManyRegistries(args?: Prisma.RegistryFindManyArgs) {
  return prisma.registry.findMany(args);
}

export async function findUniqueRegistry(args: Prisma.RegistryFindUniqueArgs) {
  return prisma.registry.findUnique(args);
}

export async function findFirstRegistry(args?: Prisma.RegistryFindFirstArgs) {
  return prisma.registry.findFirst(args);
}

export async function updateRegistry(args: Prisma.RegistryUpdateArgs) {
  return prisma.registry.update(args);
}

export async function updateManyRegistries(args: Prisma.RegistryUpdateManyArgs) {
  return prisma.registry.updateMany(args);
}

export async function upsertRegistry(args: Prisma.RegistryUpsertArgs) {
  return prisma.registry.upsert(args);
}

export async function deleteRegistry(args: Prisma.RegistryDeleteArgs) {
  return prisma.registry.delete(args);
}

export async function deleteManyRegistries(args?: Prisma.RegistryDeleteManyArgs) {
  return prisma.registry.deleteMany(args);
}

export async function countRegistries(args?: Prisma.RegistryCountArgs) {
  return prisma.registry.count(args);
}

export async function aggregateRegistries(args = {}) {
  return prisma.registry.aggregate(args);
}

export async function groupByRegistries(args: Prisma.RegistryGroupByArgs) {
  return prisma.registry.groupBy(args);
}

//==============================================================================
// REGISTRY ITEM CRUD OPERATIONS
//==============================================================================

export async function createRegistryItem(args: Prisma.RegistryItemCreateArgs) {
  return prisma.registryItem.create(args);
}

export async function findManyRegistryItems(args?: Prisma.RegistryItemFindManyArgs) {
  return prisma.registryItem.findMany(args);
}

export async function findUniqueRegistryItem(args: Prisma.RegistryItemFindUniqueArgs) {
  return prisma.registryItem.findUnique(args);
}

export async function findFirstRegistryItem(args?: Prisma.RegistryItemFindFirstArgs) {
  return prisma.registryItem.findFirst(args);
}

export async function updateRegistryItem(args: Prisma.RegistryItemUpdateArgs) {
  return prisma.registryItem.update(args);
}

export async function updateManyRegistryItems(args: Prisma.RegistryItemUpdateManyArgs) {
  return prisma.registryItem.updateMany(args);
}

export async function upsertRegistryItem(args: Prisma.RegistryItemUpsertArgs) {
  return prisma.registryItem.upsert(args);
}

export async function deleteRegistryItem(args: Prisma.RegistryItemDeleteArgs) {
  return prisma.registryItem.delete(args);
}

export async function deleteManyRegistryItems(args?: Prisma.RegistryItemDeleteManyArgs) {
  return prisma.registryItem.deleteMany(args);
}

export async function countRegistryItems(args?: Prisma.RegistryItemCountArgs) {
  return prisma.registryItem.count(args);
}

export async function aggregateRegistryItems(args = {}) {
  return prisma.registryItem.aggregate(args);
}

export async function groupByRegistryItems(args: Prisma.RegistryItemGroupByArgs) {
  return prisma.registryItem.groupBy(args);
}

//==============================================================================
// REGISTRY PURCHASE JOIN CRUD OPERATIONS
//==============================================================================

export async function createRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinCreateArgs) {
  return prisma.registryPurchaseJoin.create(args);
}

export async function findManyRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinFindManyArgs) {
  return prisma.registryPurchaseJoin.findMany(args);
}

export async function findUniqueRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinFindUniqueArgs) {
  return prisma.registryPurchaseJoin.findUnique(args);
}

export async function findFirstRegistryPurchaseJoin(args?: Prisma.RegistryPurchaseJoinFindFirstArgs) {
  return prisma.registryPurchaseJoin.findFirst(args);
}

export async function updateRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinUpdateArgs) {
  return prisma.registryPurchaseJoin.update(args);
}

export async function updateManyRegistryPurchaseJoins(args: Prisma.RegistryPurchaseJoinUpdateManyArgs) {
  return prisma.registryPurchaseJoin.updateMany(args);
}

export async function upsertRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinUpsertArgs) {
  return prisma.registryPurchaseJoin.upsert(args);
}

export async function deleteRegistryPurchaseJoin(args: Prisma.RegistryPurchaseJoinDeleteArgs) {
  return prisma.registryPurchaseJoin.delete(args);
}

export async function deleteManyRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinDeleteManyArgs) {
  return prisma.registryPurchaseJoin.deleteMany(args);
}

export async function countRegistryPurchaseJoins(args?: Prisma.RegistryPurchaseJoinCountArgs) {
  return prisma.registryPurchaseJoin.count(args);
}

export async function aggregateRegistryPurchaseJoins(args = {}) {
  return prisma.registryPurchaseJoin.aggregate(args);
}

export async function groupByRegistryPurchaseJoins(args: Prisma.RegistryPurchaseJoinGroupByArgs) {
  return prisma.registryPurchaseJoin.groupBy(args);
}

//==============================================================================
// REGISTRY USER JOIN CRUD OPERATIONS
//==============================================================================

export async function createRegistryUserJoin(args: Prisma.RegistryUserJoinCreateArgs) {
  return prisma.registryUserJoin.create(args);
}

export async function findManyRegistryUserJoins(args?: Prisma.RegistryUserJoinFindManyArgs) {
  return prisma.registryUserJoin.findMany(args);
}

export async function findUniqueRegistryUserJoin(args: Prisma.RegistryUserJoinFindUniqueArgs) {
  return prisma.registryUserJoin.findUnique(args);
}

export async function findFirstRegistryUserJoin(args?: Prisma.RegistryUserJoinFindFirstArgs) {
  return prisma.registryUserJoin.findFirst(args);
}

export async function updateRegistryUserJoin(args: Prisma.RegistryUserJoinUpdateArgs) {
  return prisma.registryUserJoin.update(args);
}

export async function updateManyRegistryUserJoins(args: Prisma.RegistryUserJoinUpdateManyArgs) {
  return prisma.registryUserJoin.updateMany(args);
}

export async function upsertRegistryUserJoin(args: Prisma.RegistryUserJoinUpsertArgs) {
  return prisma.registryUserJoin.upsert(args);
}

export async function deleteRegistryUserJoin(args: Prisma.RegistryUserJoinDeleteArgs) {
  return prisma.registryUserJoin.delete(args);
}

export async function deleteManyRegistryUserJoins(args?: Prisma.RegistryUserJoinDeleteManyArgs) {
  return prisma.registryUserJoin.deleteMany(args);
}

export async function countRegistryUserJoins(args?: Prisma.RegistryUserJoinCountArgs) {
  return prisma.registryUserJoin.count(args);
}