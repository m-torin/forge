/**
 * Invitation server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateInvitationsOrm,
  countInvitationsOrm,
  createInvitationOrm,
  createManyInvitationsOrm,
  deleteInvitationOrm,
  deleteManyInvitationsOrm,
  findFirstInvitationOrm,
  findFirstInvitationOrmOrThrow,
  findManyInvitationsOrm,
  findUniqueInvitationOrm,
  findUniqueInvitationOrmOrThrow,
  groupByInvitationsOrm,
  updateInvitationOrm,
  updateManyInvitationsOrm,
  upsertInvitationOrm,
} from '../orm/auth/authOrm';

export async function createInvitationAction(
  args: Prisma.InvitationCreateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createInvitationOrm(args, prisma);
}

export async function createManyInvitationsAction(
  args: Prisma.InvitationCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyInvitationsOrm(args, prisma);
}

export async function findFirstInvitationAction(
  args?: Prisma.InvitationFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstInvitationOrm(args, prisma);
}

export async function findFirstInvitationActionOrThrow(
  args: Prisma.InvitationFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstInvitationOrmOrThrow(args, prisma);
}

export async function findUniqueInvitationAction(
  args: Prisma.InvitationFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueInvitationOrm(args, prisma);
}

export async function findUniqueInvitationActionOrThrow(
  args: Prisma.InvitationFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueInvitationOrmOrThrow(args, prisma);
}

export async function findManyInvitationsAction(
  args?: Prisma.InvitationFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyInvitationsOrm(args, prisma);
}

export async function updateInvitationAction(
  args: Prisma.InvitationUpdateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateInvitationOrm(args, prisma);
}

export async function updateManyInvitationsAction(
  args: Prisma.InvitationUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyInvitationsOrm(args, prisma);
}

export async function upsertInvitationAction(
  args: Prisma.InvitationUpsertArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return upsertInvitationOrm(args, prisma);
}

export async function deleteInvitationAction(
  args: Prisma.InvitationDeleteArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteInvitationOrm(args, prisma);
}

export async function deleteManyInvitationsAction(
  args?: Prisma.InvitationDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyInvitationsOrm(args, prisma);
}

export async function aggregateInvitationsAction(
  args: Prisma.InvitationAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateInvitationsOrm(args, prisma);
}

export async function countInvitationsAction(
  args?: Prisma.InvitationCountArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return countInvitationsOrm(args, prisma);
}

export async function groupByInvitationsAction(
  args: Prisma.InvitationGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByInvitationsOrm(args, prisma);
}
