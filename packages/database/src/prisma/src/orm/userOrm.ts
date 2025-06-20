/**
 * User ORM operations for server-side database interactions
 * Provides type-safe CRUD operations for User model
 *
 * @example
 * ```typescript
 * import { createUserOrm, findUniqueUserOrm } from '@repo/database/prisma';
 *
 * // Create a new user
 * const user = await createUserOrm({
 *   data: {
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     profile: {
 *       create: { bio: 'Hello world' }
 *     }
 *   }
 * });
 *
 * // Find user with relations
 * const userWithProfile = await findUniqueUserOrm({
 *   where: { id: user.id },
 *   include: {
 *     profile: true,
 *     orders: { take: 5 }
 *   }
 * });
 * ```
 */

'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

// ============================================================================
// USER CRUD OPERATIONS
// ============================================================================

// CREATE OPERATIONS
/**
 * Create a new user with optional relations
 */
export async function createUserOrm(args: Prisma.UserCreateArgs) {
  return prisma.user.create(args);
}

// READ OPERATIONS
/**
 * Find the first user matching the criteria
 */
export async function findFirstUserOrm(args?: Prisma.UserFindFirstArgs) {
  return prisma.user.findFirst(args);
}

/**
 * Find a unique user by ID or unique field
 */
export async function findUniqueUserOrm(args: Prisma.UserFindUniqueArgs) {
  return prisma.user.findUnique(args);
}

/**
 * Find multiple users with filtering, sorting, and pagination
 */
export async function findManyUsersOrm(args?: Prisma.UserFindManyArgs) {
  return prisma.user.findMany(args);
}

// UPDATE OPERATIONS
/**
 * Update a single user by ID or unique field
 */
export async function updateUserOrm(args: Prisma.UserUpdateArgs) {
  return prisma.user.update(args);
}

/**
 * Update multiple users matching the criteria
 */
export async function updateManyUsersOrm(args: Prisma.UserUpdateManyArgs) {
  return prisma.user.updateMany(args);
}

// UPSERT OPERATIONS
/**
 * Create or update a user (insert if not exists, update if exists)
 */
export async function upsertUserOrm(args: Prisma.UserUpsertArgs) {
  return prisma.user.upsert(args);
}

// DELETE OPERATIONS
/**
 * Delete a single user by ID or unique field
 */
export async function deleteUserOrm(args: Prisma.UserDeleteArgs) {
  return prisma.user.delete(args);
}

/**
 * Delete multiple users matching the criteria
 */
export async function deleteManyUsersOrm(args?: Prisma.UserDeleteManyArgs) {
  return prisma.user.deleteMany(args);
}

// ============================================================================
// AGGREGATIONS & ANALYTICS
// ============================================================================

/**
 * Perform aggregation operations on users (count, sum, avg, etc.)
 */
export async function aggregateUsersOrm(args: Prisma.UserAggregateArgs) {
  return prisma.user.aggregate(args);
}

/**
 * Count users matching the criteria
 */
export async function countUsersOrm(args?: Prisma.UserCountArgs) {
  return prisma.user.count(args);
}

/**
 * Group users by specified fields and perform aggregations
 */
export async function groupByUsersOrm(args: Prisma.UserGroupByArgs) {
  return prisma.user.groupBy(args as any);
}
