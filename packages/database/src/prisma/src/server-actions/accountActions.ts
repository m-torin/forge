/**
 * Account server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 *
 * @example
 * ```typescript
 * // In a client component
 * import { createAccountAction, findUniqueAccountAction } from '@repo/database/prisma/server/next';
 *
 * // Form submission
 * async function handleSubmit(formData: FormData) {
 *   const account = await createAccountAction({
 *     data: {
 *       provider: formData.get('provider') as string,
 *       providerAccountId: formData.get('providerAccountId') as string,
 *       userId: formData.get('userId') as string,
 *       type: 'oauth'
 *     }
 *   });
 *   console.log('Created account:', account);
 * }
 * ```
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateAccountsOrm,
  countAccountsOrm,
  createAccountOrm,
  createManyAccountsOrm,
  deleteAccountOrm,
  deleteManyAccountsOrm,
  findFirstAccountOrm,
  findFirstAccountOrmOrThrow,
  findManyAccountsOrm,
  findUniqueAccountOrm,
  findUniqueAccountOrmOrThrow,
  groupByAccountsOrm,
  updateAccountOrm,
  updateManyAccountsOrm,
  upsertAccountOrm,
} from '../orm/auth/authOrm';

// ============================================================================
// ACCOUNT SERVER ACTIONS
// ============================================================================

// CREATE ACTIONS
/**
 * Server action to create a new account
 */
export async function createAccountAction(args: Prisma.AccountCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createAccountOrm(args, prisma);
}

/**
 * Server action to create multiple accounts
 */
export async function createManyAccountsAction(
  args: Prisma.AccountCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyAccountsOrm(args, prisma);
}

// READ ACTIONS
/**
 * Server action to find the first account matching criteria
 */
export async function findFirstAccountAction(
  args?: Prisma.AccountFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstAccountOrm(args, prisma);
}

/**
 * Server action to find the first account matching criteria or throw if not found
 */
export async function findFirstAccountActionOrThrow(
  args: Prisma.AccountFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstAccountOrmOrThrow(args, prisma);
}

/**
 * Server action to find a unique account by ID or unique field
 */
export async function findUniqueAccountAction(
  args: Prisma.AccountFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueAccountOrm(args, prisma);
}

/**
 * Server action to find a unique account by ID or unique field or throw if not found
 */
export async function findUniqueAccountActionOrThrow(
  args: Prisma.AccountFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueAccountOrmOrThrow(args, prisma);
}

/**
 * Server action to find multiple accounts with filtering and pagination
 */
export async function findManyAccountsAction(
  args?: Prisma.AccountFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyAccountsOrm(args, prisma);
}

// UPDATE ACTIONS
/**
 * Server action to update an account
 */
export async function updateAccountAction(args: Prisma.AccountUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateAccountOrm(args, prisma);
}

/**
 * Server action to update multiple accounts
 */
export async function updateManyAccountsAction(
  args: Prisma.AccountUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyAccountsOrm(args, prisma);
}

/**
 * Server action to upsert an account (update or create)
 */
export async function upsertAccountAction(args: Prisma.AccountUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertAccountOrm(args, prisma);
}

// DELETE ACTIONS
/**
 * Server action to delete an account
 */
export async function deleteAccountAction(args: Prisma.AccountDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteAccountOrm(args, prisma);
}

/**
 * Server action to delete multiple accounts
 */
export async function deleteManyAccountsAction(
  args?: Prisma.AccountDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyAccountsOrm(args, prisma);
}

// AGGREGATE ACTIONS
/**
 * Server action to aggregate accounts data
 */
export async function aggregateAccountsAction(
  args: Prisma.AccountAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateAccountsOrm(args, prisma);
}

/**
 * Server action to count accounts
 */
export async function countAccountsAction(args?: Prisma.AccountCountArgs, prisma?: PrismaClient) {
  'use server';
  return countAccountsOrm(args, prisma);
}

/**
 * Server action to group accounts by specific fields
 */
export async function groupByAccountsAction(
  args: Prisma.AccountGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByAccountsOrm(args, prisma);
}
