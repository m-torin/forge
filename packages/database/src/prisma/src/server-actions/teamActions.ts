/**
 * Team server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateTeamsOrm,
  countTeamsOrm,
  createManyTeamsOrm,
  createTeamOrm,
  deleteManyTeamsOrm,
  deleteTeamOrm,
  findFirstTeamOrm,
  findFirstTeamOrmOrThrow,
  findManyTeamsOrm,
  findUniqueTeamOrm,
  findUniqueTeamOrmOrThrow,
  groupByTeamsOrm,
  updateManyTeamsOrm,
  updateTeamOrm,
  upsertTeamOrm,
} from '../orm/auth/authOrm';

export async function createTeamAction(args: Prisma.TeamCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createTeamOrm(args, prisma);
}

export async function createManyTeamsAction(
  args: Prisma.TeamCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyTeamsOrm(args, prisma);
}

export async function findFirstTeamAction(args?: Prisma.TeamFindFirstArgs, prisma?: PrismaClient) {
  'use server';
  return findFirstTeamOrm(args, prisma);
}

export async function findFirstTeamActionOrThrow(
  args: Prisma.TeamFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstTeamOrmOrThrow(args, prisma);
}

export async function findUniqueTeamAction(args: Prisma.TeamFindUniqueArgs, prisma?: PrismaClient) {
  'use server';
  return findUniqueTeamOrm(args, prisma);
}

export async function findUniqueTeamActionOrThrow(
  args: Prisma.TeamFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueTeamOrmOrThrow(args, prisma);
}

export async function findManyTeamsAction(args?: Prisma.TeamFindManyArgs, prisma?: PrismaClient) {
  'use server';
  return findManyTeamsOrm(args, prisma);
}

export async function updateTeamAction(args: Prisma.TeamUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateTeamOrm(args, prisma);
}

export async function updateManyTeamsAction(
  args: Prisma.TeamUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyTeamsOrm(args, prisma);
}

export async function upsertTeamAction(args: Prisma.TeamUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertTeamOrm(args, prisma);
}

export async function deleteTeamAction(args: Prisma.TeamDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteTeamOrm(args, prisma);
}

export async function deleteManyTeamsAction(
  args?: Prisma.TeamDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyTeamsOrm(args, prisma);
}

export async function aggregateTeamsAction(args: Prisma.TeamAggregateArgs, prisma?: PrismaClient) {
  'use server';
  return aggregateTeamsOrm(args, prisma);
}

export async function countTeamsAction(args?: Prisma.TeamCountArgs, prisma?: PrismaClient) {
  'use server';
  return countTeamsOrm(args, prisma);
}

export async function groupByTeamsAction(args: Prisma.TeamGroupByArgs, prisma?: PrismaClient) {
  'use server';
  return groupByTeamsOrm(args, prisma);
}
