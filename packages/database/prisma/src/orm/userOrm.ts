'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// USER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createUserOrm(args: Prisma.UserCreateArgs) {
  return prisma.user.create(args);
}

// READ
export async function findFirstUserOrm(args?: Prisma.UserFindFirstArgs) {
  return prisma.user.findFirst(args);
}

export async function findUniqueUserOrm(args: Prisma.UserFindUniqueArgs) {
  return prisma.user.findUnique(args);
}

export async function findManyUsersOrm(args?: Prisma.UserFindManyArgs) {
  return prisma.user.findMany(args);
}

// UPDATE
export async function updateUserOrm(args: Prisma.UserUpdateArgs) {
  return prisma.user.update(args);
}

export async function updateManyUsersOrm(args: Prisma.UserUpdateManyArgs) {
  return prisma.user.updateMany(args);
}

// UPSERT
export async function upsertUserOrm(args: Prisma.UserUpsertArgs) {
  return prisma.user.upsert(args);
}

// DELETE
export async function deleteUserOrm(args: Prisma.UserDeleteArgs) {
  return prisma.user.delete(args);
}

export async function deleteManyUsersOrm(args?: Prisma.UserDeleteManyArgs) {
  return prisma.user.deleteMany(args);
}

// AGGREGATIONS & UTILS
export async function aggregateUsersOrm(args: Prisma.UserAggregateArgs) {
  return prisma.user.aggregate(args);
}

export async function countUsersOrm(args?: Prisma.UserCountArgs) {
  return prisma.user.count(args);
}

export async function groupByUsersOrm(args: Prisma.UserGroupByArgs) {
  return prisma.user.groupBy(args as any);
}
