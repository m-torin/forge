/**
 * Session server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 *
 * @example
 * ```typescript
 * // In a client component
 * import { createSessionAction, findUniqueSessionAction } from '@repo/database/prisma/server/next';
 *
 * // Form submission
 * async function handleSubmit(formData: FormData) {
 *   const session = await createSessionAction({
 *     data: {
 *       token: formData.get('token') as string,
 *       userId: formData.get('userId') as string,
 *       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
 *     }
 *   });
 *   console.log('Created session:', session);
 * }
 *
 * // Data fetching in useEffect
 * useEffect(() => {
 *   async function fetchSession() {
 *     const session = await findUniqueSessionAction({
 *       where: { token: sessionToken },
 *       include: { user: true }
 *     });
 *     setSession(session);
 *   }
 *   fetchSession();
 * }, [sessionToken]);
 * ```
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateSessionsOrm,
  countSessionsOrm,
  createManySessionsOrm,
  createSessionOrm,
  deleteManySessionsOrm,
  deleteSessionOrm,
  findFirstSessionOrm,
  findFirstSessionOrmOrThrow,
  findManySessionsOrm,
  findUniqueSessionOrm,
  findUniqueSessionOrmOrThrow,
  groupBySessionsOrm,
  updateManySessionsOrm,
  updateSessionOrm,
  upsertSessionOrm,
} from '../orm/auth/authOrm';

// ============================================================================
// SESSION SERVER ACTIONS
// ============================================================================

// CREATE ACTIONS
/**
 * Server action to create a new session
 */
export async function createSessionAction(args: Prisma.SessionCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createSessionOrm(args, prisma);
}

/**
 * Server action to create multiple sessions
 */
export async function createManySessionsAction(
  args: Prisma.SessionCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManySessionsOrm(args, prisma);
}

// READ ACTIONS
/**
 * Server action to find the first session matching criteria
 */
export async function findFirstSessionAction(
  args?: Prisma.SessionFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstSessionOrm(args, prisma);
}

/**
 * Server action to find the first session matching criteria or throw if not found
 */
export async function findFirstSessionActionOrThrow(
  args: Prisma.SessionFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstSessionOrmOrThrow(args, prisma);
}

/**
 * Server action to find a unique session by ID or unique field
 */
export async function findUniqueSessionAction(
  args: Prisma.SessionFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueSessionOrm(args, prisma);
}

/**
 * Server action to find a unique session by ID or unique field or throw if not found
 */
export async function findUniqueSessionActionOrThrow(
  args: Prisma.SessionFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueSessionOrmOrThrow(args, prisma);
}

/**
 * Server action to find multiple sessions with filtering and pagination
 */
export async function findManySessionsAction(
  args?: Prisma.SessionFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManySessionsOrm(args, prisma);
}

// UPDATE ACTIONS
/**
 * Server action to update a session
 */
export async function updateSessionAction(args: Prisma.SessionUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateSessionOrm(args, prisma);
}

/**
 * Server action to update multiple sessions
 */
export async function updateManySessionsAction(
  args: Prisma.SessionUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManySessionsOrm(args, prisma);
}

/**
 * Server action to upsert a session (update or create)
 */
export async function upsertSessionAction(args: Prisma.SessionUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertSessionOrm(args, prisma);
}

// DELETE ACTIONS
/**
 * Server action to delete a session
 */
export async function deleteSessionAction(args: Prisma.SessionDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteSessionOrm(args, prisma);
}

/**
 * Server action to delete multiple sessions
 */
export async function deleteManySessionsAction(
  args?: Prisma.SessionDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManySessionsOrm(args, prisma);
}

// AGGREGATE ACTIONS
/**
 * Server action to aggregate sessions data
 */
export async function aggregateSessionsAction(
  args: Prisma.SessionAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateSessionsOrm(args, prisma);
}

/**
 * Server action to count sessions
 */
export async function countSessionsAction(args?: Prisma.SessionCountArgs, prisma?: PrismaClient) {
  'use server';
  return countSessionsOrm(args, prisma);
}

/**
 * Server action to group sessions by specific fields
 */
export async function groupBySessionsAction(
  args: Prisma.SessionGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupBySessionsOrm(args, prisma);
}
