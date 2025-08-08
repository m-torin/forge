/**
 * Member server actions for Next.js applications
 * Provides server-side functions that can be called from client components
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateMembersOrm,
  countMembersOrm,
  createManyMembersOrm,
  createMemberOrm,
  deleteManyMembersOrm,
  deleteMemberOrm,
  findFirstMemberOrm,
  findFirstMemberOrmOrThrow,
  findManyMembersOrm,
  findUniqueMemberOrm,
  findUniqueMemberOrmOrThrow,
  groupByMembersOrm,
  updateManyMembersOrm,
  updateMemberOrm,
  upsertMemberOrm,
} from '../orm/auth/authOrm';

// CREATE ACTIONS
export async function createMemberAction(args: Prisma.MemberCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createMemberOrm(args, prisma);
}

export async function createManyMembersAction(
  args: Prisma.MemberCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyMembersOrm(args, prisma);
}

// READ ACTIONS
export async function findFirstMemberAction(
  args?: Prisma.MemberFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstMemberOrm(args, prisma);
}

export async function findFirstMemberActionOrThrow(
  args: Prisma.MemberFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstMemberOrmOrThrow(args, prisma);
}

export async function findUniqueMemberAction(
  args: Prisma.MemberFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueMemberOrm(args, prisma);
}

export async function findUniqueMemberActionOrThrow(
  args: Prisma.MemberFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueMemberOrmOrThrow(args, prisma);
}

export async function findManyMembersAction(
  args?: Prisma.MemberFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyMembersOrm(args, prisma);
}

// UPDATE ACTIONS
export async function updateMemberAction(args: Prisma.MemberUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateMemberOrm(args, prisma);
}

export async function updateManyMembersAction(
  args: Prisma.MemberUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyMembersOrm(args, prisma);
}

export async function upsertMemberAction(args: Prisma.MemberUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertMemberOrm(args, prisma);
}

// DELETE ACTIONS
export async function deleteMemberAction(args: Prisma.MemberDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteMemberOrm(args, prisma);
}

export async function deleteManyMembersAction(
  args?: Prisma.MemberDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyMembersOrm(args, prisma);
}

// AGGREGATE ACTIONS
export async function aggregateMembersAction(
  args: Prisma.MemberAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateMembersOrm(args, prisma);
}

export async function countMembersAction(args?: Prisma.MemberCountArgs, prisma?: PrismaClient) {
  'use server';
  return countMembersOrm(args, prisma);
}

export async function groupByMembersAction(args: Prisma.MemberGroupByArgs, prisma?: PrismaClient) {
  'use server';
  return groupByMembersOrm(args, prisma);
}
