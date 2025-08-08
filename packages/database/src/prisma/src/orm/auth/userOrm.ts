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
 *     name: 'John Doe'
 *   }
 * });
 *
 * // Find user with relations
 * const userWithProfile = await findUniqueUserOrm({
 *   where: { id: user.id },
 *   include: {
 *     accounts: true,
 *     sessions: true
 *   }
 * });
 * ```
 */

'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';

// ============================================================================
// USER CRUD OPERATIONS
// ============================================================================

// CREATE OPERATIONS
/**
 * Create a new user with optional relations
 */
export async function createUserOrm(
  args: Prisma.UserCreateArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.create(args);
}

/**
 * Create multiple users at once
 */
export async function createManyUsersOrm(
  args: Prisma.UserCreateManyArgs,
): Promise<Prisma.BatchPayload> {
  return await prisma.user.createMany(args);
}

// READ OPERATIONS
/**
 * Find the first user matching the criteria
 */
export async function findFirstUserOrm(
  args?: Prisma.UserFindFirstArgs,
): Promise<Prisma.UserGetPayload<typeof args> | null> {
  return await prisma.user.findFirst(args);
}

/**
 * Find the first user matching the criteria (throws if not found)
 */
export async function findFirstUserOrmOrThrow(
  args: Prisma.UserFindFirstOrThrowArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.findFirstOrThrow(args);
}

/**
 * Find a unique user by ID or unique field
 */
export async function findUniqueUserOrm(
  args: Prisma.UserFindUniqueArgs,
): Promise<Prisma.UserGetPayload<typeof args> | null> {
  return await prisma.user.findUnique(args);
}

/**
 * Find a unique user by ID or unique field (throws if not found)
 */
export async function findUniqueUserOrmOrThrow(
  args: Prisma.UserFindUniqueOrThrowArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.findUniqueOrThrow(args);
}

/**
 * Find multiple users with filtering, sorting, and pagination
 */
export async function findManyUsersOrm(
  args?: Prisma.UserFindManyArgs,
): Promise<Prisma.UserGetPayload<typeof args>[]> {
  return await prisma.user.findMany(args);
}

// UPDATE OPERATIONS
/**
 * Update a user by ID or unique field
 */
export async function updateUserOrm(
  args: Prisma.UserUpdateArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.update(args);
}

/**
 * Update multiple users matching criteria
 */
export async function updateManyUsersOrm(
  args: Prisma.UserUpdateManyArgs,
): Promise<Prisma.BatchPayload> {
  return await prisma.user.updateMany(args);
}

/**
 * Upsert a user (create if not exists, update if exists)
 */
export async function upsertUserOrm(
  args: Prisma.UserUpsertArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.upsert(args);
}

// DELETE OPERATIONS
/**
 * Delete a user by ID or unique field
 */
export async function deleteUserOrm(
  args: Prisma.UserDeleteArgs,
): Promise<Prisma.UserGetPayload<typeof args>> {
  return await prisma.user.delete(args);
}

/**
 * Delete multiple users matching criteria
 */
export async function deleteManyUsersOrm(
  args?: Prisma.UserDeleteManyArgs,
): Promise<Prisma.BatchPayload> {
  return await prisma.user.deleteMany(args);
}

// ============================================================================
// AGGREGATIONS & ANALYTICS
// ============================================================================

/**
 * Perform aggregation operations on users (count, sum, avg, etc.)
 */
export async function aggregateUsersOrm(args?: Prisma.UserAggregateArgs) {
  return await prisma.user.aggregate(args ?? {});
}

/**
 * Count users matching the criteria
 */
export async function countUsersOrm(args?: Prisma.UserCountArgs): Promise<number> {
  return await prisma.user.count(args);
}

/**
 * Group users by specified fields and perform aggregations
 */
export async function groupByUsersOrm(args: Prisma.UserGroupByArgs) {
  return await prisma.user.groupBy(args);
}

// ============================================================================
// ENHANCED TYPE-SAFE USER OPERATIONS
// ============================================================================

/**
 * Find user with profile included
 */
export async function findUserWithProfileOrm(
  where: Prisma.UserWhereUniqueInput,
): Promise<Prisma.UserGetPayload<{ include: { accounts: true; sessions: true } }> | null> {
  return await prisma.user.findUnique({
    where,
    include: {
      accounts: true,
      sessions: true,
    },
  });
}

/**
 * Find user with all related data
 */
export async function findUserWithAllRelationsOrm(
  where: Prisma.UserWhereUniqueInput,
): Promise<Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    apiKeys: true;
    members: true;
  };
}> | null> {
  return await prisma.user.findUnique({
    where,
    include: {
      accounts: true,
      sessions: true,
      apiKeys: true,
      members: true,
    },
  });
}

/**
 * Type definition for commonly used user payload with basic relations
 */
export type UserWithBasicRelations = Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
  };
}>;

/**
 * Type definition for user with all relations
 */
export type UserWithAllRelations = Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    apiKeys: true;
    members: true;
  };
}>;
