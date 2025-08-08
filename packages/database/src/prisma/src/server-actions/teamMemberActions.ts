/**
 * TeamMember server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateTeamMembersOrm,
  countTeamMembersOrm,
  createManyTeamMembersOrm,
  createTeamMemberOrm,
  deleteManyTeamMembersOrm,
  deleteTeamMemberOrm,
  findFirstTeamMemberOrm,
  findFirstTeamMemberOrmOrThrow,
  findManyTeamMembersOrm,
  findUniqueTeamMemberOrm,
  findUniqueTeamMemberOrmOrThrow,
  groupByTeamMembersOrm,
  updateManyTeamMembersOrm,
  updateTeamMemberOrm,
  upsertTeamMemberOrm,
} from '../orm/auth/authOrm';

export async function createTeamMemberAction(
  args: Prisma.TeamMemberCreateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createTeamMemberOrm(args, prisma);
}

export async function createManyTeamMembersAction(
  args: Prisma.TeamMemberCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyTeamMembersOrm(args, prisma);
}

export async function findFirstTeamMemberAction(
  args?: Prisma.TeamMemberFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstTeamMemberOrm(args, prisma);
}

export async function findFirstTeamMemberActionOrThrow(
  args: Prisma.TeamMemberFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstTeamMemberOrmOrThrow(args, prisma);
}

export async function findUniqueTeamMemberAction(
  args: Prisma.TeamMemberFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueTeamMemberOrm(args, prisma);
}

export async function findUniqueTeamMemberActionOrThrow(
  args: Prisma.TeamMemberFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueTeamMemberOrmOrThrow(args, prisma);
}

export async function findManyTeamMembersAction(
  args?: Prisma.TeamMemberFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyTeamMembersOrm(args, prisma);
}

export async function updateTeamMemberAction(
  args: Prisma.TeamMemberUpdateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateTeamMemberOrm(args, prisma);
}

export async function updateManyTeamMembersAction(
  args: Prisma.TeamMemberUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyTeamMembersOrm(args, prisma);
}

export async function upsertTeamMemberAction(
  args: Prisma.TeamMemberUpsertArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return upsertTeamMemberOrm(args, prisma);
}

export async function deleteTeamMemberAction(
  args: Prisma.TeamMemberDeleteArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteTeamMemberOrm(args, prisma);
}

export async function deleteManyTeamMembersAction(
  args?: Prisma.TeamMemberDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyTeamMembersOrm(args, prisma);
}

export async function aggregateTeamMembersAction(
  args: Prisma.TeamMemberAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateTeamMembersOrm(args, prisma);
}

export async function countTeamMembersAction(
  args?: Prisma.TeamMemberCountArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return countTeamMembersOrm(args, prisma);
}

export async function groupByTeamMembersAction(
  args: Prisma.TeamMemberGroupByArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return groupByTeamMembersOrm(args, prisma);
}
