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
 *       include: { sessions: true, accounts: true }
 *     });
 *     setUser(user);
 *   }
 *   fetchUser();
 * }, [userId]);
 * ```
 */

'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateUsersOrm,
  countUsersOrm,
  createUserOrm,
  deleteManyUsersOrm,
  deleteUserOrm,
  findFirstUserOrm,
  findManyUsersOrm,
  findUniqueUserOrm,
  groupByUsersOrm,
  updateManyUsersOrm,
  updateUserOrm,
  upsertUserOrm,
} from '../orm/authOrm';

// ============================================================================
// USER SERVER ACTIONS
// ============================================================================

// CREATE ACTIONS
/**
 * Server action to create a new user
 */
export async function createUserAction(args: Prisma.UserCreateArgs) {
  'use server';
  return createUserOrm(args);
}

// READ ACTIONS
/**
 * Server action to find the first user matching criteria
 */
export async function findFirstUserAction(args?: Prisma.UserFindFirstArgs) {
  'use server';
  return findFirstUserOrm(args);
}

/**
 * Server action to find a unique user by ID or unique field
 */
export async function findUniqueUserAction(args: Prisma.UserFindUniqueArgs) {
  'use server';
  return findUniqueUserOrm(args);
}

/**
 * Server action to find multiple users with filtering and pagination
 */
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
