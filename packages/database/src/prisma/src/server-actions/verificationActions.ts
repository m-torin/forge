/**
 * Verification server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateVerificationsOrm,
  countVerificationsOrm,
  createManyVerificationsOrm,
  createVerificationOrm,
  deleteManyVerificationsOrm,
  deleteVerificationOrm,
  findFirstVerificationOrm,
  findFirstVerificationOrmOrThrow,
  findManyVerificationsOrm,
  findUniqueVerificationOrm,
  findUniqueVerificationOrmOrThrow,
  groupByVerificationsOrm,
  updateManyVerificationsOrm,
  updateVerificationOrm,
  upsertVerificationOrm,
} from '../orm/auth/authOrm';

// CREATE ACTIONS
export async function createVerificationAction(
  args: Prisma.VerificationCreateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createVerificationOrm(args, prisma);
}

export async function createManyVerificationsAction(
  args: Prisma.VerificationCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyVerificationsOrm(args, prisma);
}

// READ ACTIONS
export async function findFirstVerificationAction(
  args?: Prisma.VerificationFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstVerificationOrm(args, prisma);
}

export async function findFirstVerificationActionOrThrow(
  args: Prisma.VerificationFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstVerificationOrmOrThrow(args, prisma);
}

export async function findUniqueVerificationAction(
  args: Prisma.VerificationFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueVerificationOrm(args, prisma);
}

export async function findUniqueVerificationActionOrThrow(
  args: Prisma.VerificationFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueVerificationOrmOrThrow(args, prisma);
}

export async function findManyVerificationsAction(
  args?: Prisma.VerificationFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyVerificationsOrm(args, prisma);
}

// UPDATE ACTIONS
export async function updateVerificationAction(
  args: Prisma.VerificationUpdateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateVerificationOrm(args, prisma);
}

export async function updateManyVerificationsAction(
  args: Prisma.VerificationUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyVerificationsOrm(args, prisma);
}

export async function upsertVerificationAction(
  args: Prisma.VerificationUpsertArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return upsertVerificationOrm(args, prisma);
}

// DELETE ACTIONS
export async function deleteVerificationAction(
  args: Prisma.VerificationDeleteArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteVerificationOrm(args, prisma);
}

export async function deleteManyVerificationsAction(
  args?: Prisma.VerificationDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyVerificationsOrm(args, prisma);
}

// AGGREGATE ACTIONS
export async function aggregateVerificationsAction(
  args: Prisma.VerificationAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateVerificationsOrm(args, prisma);
}

export async function countVerificationsAction(
  args?: Prisma.VerificationCountArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return countVerificationsOrm(args, prisma);
}

export async function groupByVerificationsAction(
  args: Prisma.VerificationGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByVerificationsOrm(args, prisma);
}
