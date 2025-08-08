/**
 * BackupCode server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateBackupCodesOrm,
  countBackupCodesOrm,
  createBackupCodeOrm,
  createManyBackupCodesOrm,
  deleteBackupCodeOrm,
  deleteManyBackupCodesOrm,
  findFirstBackupCodeOrm,
  findFirstBackupCodeOrmOrThrow,
  findManyBackupCodesOrm,
  findUniqueBackupCodeOrm,
  findUniqueBackupCodeOrmOrThrow,
  groupByBackupCodesOrm,
  updateBackupCodeOrm,
  updateManyBackupCodesOrm,
  upsertBackupCodeOrm,
} from '../orm/auth/authOrm';

export async function createBackupCodeAction(
  args: Prisma.BackupCodeCreateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createBackupCodeOrm(args, prisma);
}

export async function createManyBackupCodesAction(
  args: Prisma.BackupCodeCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyBackupCodesOrm(args, prisma);
}

export async function findFirstBackupCodeAction(
  args?: Prisma.BackupCodeFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstBackupCodeOrm(args, prisma);
}

export async function findFirstBackupCodeActionOrThrow(
  args: Prisma.BackupCodeFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstBackupCodeOrmOrThrow(args, prisma);
}

export async function findUniqueBackupCodeAction(
  args: Prisma.BackupCodeFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueBackupCodeOrm(args, prisma);
}

export async function findUniqueBackupCodeActionOrThrow(
  args: Prisma.BackupCodeFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueBackupCodeOrmOrThrow(args, prisma);
}

export async function findManyBackupCodesAction(
  args?: Prisma.BackupCodeFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyBackupCodesOrm(args, prisma);
}

export async function updateBackupCodeAction(
  args: Prisma.BackupCodeUpdateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateBackupCodeOrm(args, prisma);
}

export async function updateManyBackupCodesAction(
  args: Prisma.BackupCodeUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyBackupCodesOrm(args, prisma);
}

export async function upsertBackupCodeAction(
  args: Prisma.BackupCodeUpsertArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return upsertBackupCodeOrm(args, prisma);
}

export async function deleteBackupCodeAction(
  args: Prisma.BackupCodeDeleteArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteBackupCodeOrm(args, prisma);
}

export async function deleteManyBackupCodesAction(
  args?: Prisma.BackupCodeDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyBackupCodesOrm(args, prisma);
}

export async function aggregateBackupCodesAction(
  args: Prisma.BackupCodeAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateBackupCodesOrm(args, prisma);
}

export async function countBackupCodesAction(
  args?: Prisma.BackupCodeCountArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return countBackupCodesOrm(args, prisma);
}

export async function groupByBackupCodesAction(
  args: Prisma.BackupCodeGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByBackupCodesOrm(args, prisma);
}
