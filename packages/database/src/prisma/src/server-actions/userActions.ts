/**
 * User server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 *
 * @example
 * ```typescript
 * // In a client component
 * import { createUserAction, findUniqueUserAction } from '@repo/database/prisma/server/next';
 *
 * // Form submission
 * async function handleSubmit(formData: FormData) {
 *   const user = await createUserAction({
 *     data: {
 *       email: formData.get('email') as string,
 *       name: formData.get('name') as string
 *     }
 *   });
 *   console.log('Created user:', user);
 * }
 *
 * // Data fetching in useEffect
 * useEffect(() => {
 *   async function fetchUser() {
 *     const user = await findUniqueUserAction({
 *       where: { id: userId },
 *       include: { profile: true }
 *     });
 *     setUser(user);
 *   }
 *   fetchUser();
 * }, [userId]);
 * ```
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateUsersOrm,
  countUsersOrm,
  createManyUsersOrm,
  createUserOrm,
  deleteManyUsersOrm,
  deleteUserOrm,
  findFirstUserOrm,
  findFirstUserOrmOrThrow,
  findManyUsersOrm,
  findUniqueUserOrm,
  findUniqueUserOrmOrThrow,
  groupByUsersOrm,
  updateManyUsersOrm,
  updateUserOrm,
  upsertUserOrm,
} from '../orm/auth/authOrm';

// ============================================================================
// USER SERVER ACTIONS
// ============================================================================

// CREATE ACTIONS
/**
 * Server action to create a new user
 */
export async function createUserAction(args: Prisma.UserCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createUserOrm(args, prisma);
}

/**
 * Server action to create multiple users
 */
export async function createManyUsersAction(
  args: Prisma.UserCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyUsersOrm(args, prisma);
}

// READ ACTIONS
/**
 * Server action to find the first user matching criteria
 */
export async function findFirstUserAction(args?: Prisma.UserFindFirstArgs, prisma?: PrismaClient) {
  'use server';
  return findFirstUserOrm(args, prisma);
}

/**
 * Server action to find the first user matching criteria or throw if not found
 */
export async function findFirstUserActionOrThrow(
  args: Prisma.UserFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstUserOrmOrThrow(args, prisma);
}

/**
 * Server action to find a unique user by ID or unique field
 */
export async function findUniqueUserAction(args: Prisma.UserFindUniqueArgs, prisma?: PrismaClient) {
  'use server';
  return findUniqueUserOrm(args, prisma);
}

/**
 * Server action to find a unique user by ID or unique field or throw if not found
 */
export async function findUniqueUserActionOrThrow(
  args: Prisma.UserFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueUserOrmOrThrow(args, prisma);
}

/**
 * Server action to find multiple users with filtering and pagination
 */
export async function findManyUsersAction(args?: Prisma.UserFindManyArgs, prisma?: PrismaClient) {
  'use server';
  return findManyUsersOrm(args, prisma);
}

export async function updateUserAction(args: Prisma.UserUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateUserOrm(args, prisma);
}

export async function updateManyUsersAction(
  args: Prisma.UserUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyUsersOrm(args, prisma);
}

export async function upsertUserAction(args: Prisma.UserUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertUserOrm(args, prisma);
}

export async function deleteUserAction(args: Prisma.UserDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteUserOrm(args, prisma);
}

export async function deleteManyUsersAction(
  args?: Prisma.UserDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyUsersOrm(args, prisma);
}

export async function aggregateUsersAction(args: Prisma.UserAggregateArgs, prisma?: PrismaClient) {
  'use server';
  return aggregateUsersOrm(args, prisma);
}

export async function countUsersAction(args?: Prisma.UserCountArgs, prisma?: PrismaClient) {
  'use server';
  return countUsersOrm(args, prisma);
}

export async function groupByUsersAction(args: Prisma.UserGroupByArgs, prisma?: PrismaClient) {
  'use server';
  return groupByUsersOrm(args, prisma);
}
