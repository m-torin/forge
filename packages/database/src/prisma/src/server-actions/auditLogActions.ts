/**
 * AuditLog server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateAuditLogsOrm,
  countAuditLogsOrm,
  createAuditLogOrm,
  createManyAuditLogsOrm,
  deleteAuditLogOrm,
  deleteManyAuditLogsOrm,
  findFirstAuditLogOrm,
  findFirstAuditLogOrmOrThrow,
  findManyAuditLogsOrm,
  findUniqueAuditLogOrm,
  findUniqueAuditLogOrmOrThrow,
  groupByAuditLogsOrm,
  updateAuditLogOrm,
  updateManyAuditLogsOrm,
  upsertAuditLogOrm,
} from '../orm/auth/authOrm';

export async function createAuditLogAction(args: Prisma.AuditLogCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createAuditLogOrm(args, prisma);
}

export async function createManyAuditLogsAction(
  args: Prisma.AuditLogCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyAuditLogsOrm(args, prisma);
}

export async function findFirstAuditLogAction(
  args?: Prisma.AuditLogFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstAuditLogOrm(args, prisma);
}

export async function findFirstAuditLogActionOrThrow(
  args: Prisma.AuditLogFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstAuditLogOrmOrThrow(args, prisma);
}

export async function findUniqueAuditLogAction(
  args: Prisma.AuditLogFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueAuditLogOrm(args, prisma);
}

export async function findUniqueAuditLogActionOrThrow(
  args: Prisma.AuditLogFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueAuditLogOrmOrThrow(args, prisma);
}

export async function findManyAuditLogsAction(
  args?: Prisma.AuditLogFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyAuditLogsOrm(args, prisma);
}

export async function updateAuditLogAction(args: Prisma.AuditLogUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateAuditLogOrm(args, prisma);
}

export async function updateManyAuditLogsAction(
  args: Prisma.AuditLogUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyAuditLogsOrm(args, prisma);
}

export async function upsertAuditLogAction(args: Prisma.AuditLogUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertAuditLogOrm(args, prisma);
}

export async function deleteAuditLogAction(args: Prisma.AuditLogDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteAuditLogOrm(args, prisma);
}

export async function deleteManyAuditLogsAction(
  args?: Prisma.AuditLogDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyAuditLogsOrm(args, prisma);
}

export async function aggregateAuditLogsAction(
  args: Prisma.AuditLogAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateAuditLogsOrm(args, prisma);
}

export async function countAuditLogsAction(args?: Prisma.AuditLogCountArgs, prisma?: PrismaClient) {
  'use server';
  return countAuditLogsOrm(args, prisma);
}

export async function groupByAuditLogsAction(
  args: Prisma.AuditLogGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByAuditLogsOrm(args, prisma);
}
