'use server';

import {
  createUserOrm,
  findFirstUserOrm,
  findUniqueUserOrm,
  findManyUsersOrm,
  updateUserOrm,
  updateManyUsersOrm,
  upsertUserOrm,
  deleteUserOrm,
  deleteManyUsersOrm,
  aggregateUsersOrm,
  countUsersOrm,
  groupByUsersOrm,
} from '../orm/userOrm';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// USER SERVER ACTIONS
//==============================================================================

export async function createUserAction(args: Prisma.UserCreateArgs) {
  'use server';
  return createUserOrm(args);
}

export async function findFirstUserAction(args?: Prisma.UserFindFirstArgs) {
  'use server';
  return findFirstUserOrm(args);
}

export async function findUniqueUserAction(args: Prisma.UserFindUniqueArgs) {
  'use server';
  return findUniqueUserOrm(args);
}

export async function findManyUsersAction(args?: Prisma.UserFindManyArgs) {
  'use server';
  return findManyUsersOrm(args);
}

export async function updateUserAction(args: Prisma.UserUpdateArgs) {
  'use server';
  return updateUserOrm(args);
}

export async function updateManyUsersAction(args: Prisma.UserUpdateManyArgs) {
  'use server';
  return updateManyUsersOrm(args);
}

export async function upsertUserAction(args: Prisma.UserUpsertArgs) {
  'use server';
  return upsertUserOrm(args);
}

export async function deleteUserAction(args: Prisma.UserDeleteArgs) {
  'use server';
  return deleteUserOrm(args);
}

export async function deleteManyUsersAction(args?: Prisma.UserDeleteManyArgs) {
  'use server';
  return deleteManyUsersOrm(args);
}

export async function aggregateUsersAction(args: Prisma.UserAggregateArgs) {
  'use server';
  return aggregateUsersOrm(args);
}

export async function countUsersAction(args?: Prisma.UserCountArgs) {
  'use server';
  return countUsersOrm(args);
}

export async function groupByUsersAction(args: Prisma.UserGroupByArgs) {
  'use server';
  return groupByUsersOrm(args);
}
