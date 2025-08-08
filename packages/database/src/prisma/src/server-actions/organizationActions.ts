/**
 * Organization server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateOrganizationsOrm,
  countOrganizationsOrm,
  createManyOrganizationsOrm,
  createOrganizationOrm,
  deleteManyOrganizationsOrm,
  deleteOrganizationOrm,
  findFirstOrganizationOrm,
  findFirstOrganizationOrmOrThrow,
  findManyOrganizationsOrm,
  findUniqueOrganizationOrm,
  findUniqueOrganizationOrmOrThrow,
  groupByOrganizationsOrm,
  updateManyOrganizationsOrm,
  updateOrganizationOrm,
  upsertOrganizationOrm,
} from '../orm/auth/authOrm';

// CREATE ACTIONS
export async function createOrganizationAction(
  args: Prisma.OrganizationCreateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createOrganizationOrm(args, prisma);
}

export async function createManyOrganizationsAction(
  args: Prisma.OrganizationCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyOrganizationsOrm(args, prisma);
}

// READ ACTIONS
export async function findFirstOrganizationAction(
  args?: Prisma.OrganizationFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstOrganizationOrm(args, prisma);
}

export async function findFirstOrganizationActionOrThrow(
  args: Prisma.OrganizationFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstOrganizationOrmOrThrow(args, prisma);
}

export async function findUniqueOrganizationAction(
  args: Prisma.OrganizationFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueOrganizationOrm(args, prisma);
}

export async function findUniqueOrganizationActionOrThrow(
  args: Prisma.OrganizationFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueOrganizationOrmOrThrow(args, prisma);
}

export async function findManyOrganizationsAction(
  args?: Prisma.OrganizationFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyOrganizationsOrm(args, prisma);
}

// UPDATE ACTIONS
export async function updateOrganizationAction(
  args: Prisma.OrganizationUpdateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateOrganizationOrm(args, prisma);
}

export async function updateManyOrganizationsAction(
  args: Prisma.OrganizationUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyOrganizationsOrm(args, prisma);
}

export async function upsertOrganizationAction(
  args: Prisma.OrganizationUpsertArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return upsertOrganizationOrm(args, prisma);
}

// DELETE ACTIONS
export async function deleteOrganizationAction(
  args: Prisma.OrganizationDeleteArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteOrganizationOrm(args, prisma);
}

export async function deleteManyOrganizationsAction(
  args?: Prisma.OrganizationDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyOrganizationsOrm(args, prisma);
}

// AGGREGATE ACTIONS
export async function aggregateOrganizationsAction(
  args: Prisma.OrganizationAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateOrganizationsOrm(args, prisma);
}

export async function countOrganizationsAction(
  args?: Prisma.OrganizationCountArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return countOrganizationsOrm(args, prisma);
}

export async function groupByOrganizationsAction(
  args: Prisma.OrganizationGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByOrganizationsOrm(args, prisma);
}
