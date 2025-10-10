/**
 * TwoFactor server actions for Next.js applications
 */

"use server";

import type { Prisma, PrismaClient } from "../../../../prisma-generated/client";
import {
  aggregateTwoFactorsOrm,
  countTwoFactorsOrm,
  createManyTwoFactorsOrm,
  createTwoFactorOrm,
  deleteManyTwoFactorsOrm,
  deleteTwoFactorOrm,
  findFirstTwoFactorOrm,
  findFirstTwoFactorOrmOrThrow,
  findManyTwoFactorsOrm,
  findUniqueTwoFactorOrm,
  findUniqueTwoFactorOrmOrThrow,
  groupByTwoFactorsOrm,
  updateManyTwoFactorsOrm,
  updateTwoFactorOrm,
  upsertTwoFactorOrm,
} from "../orm/auth/authOrm";

export async function createTwoFactorAction(
  args: Prisma.TwoFactorCreateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return createTwoFactorOrm(args, prisma);
}

export async function createManyTwoFactorsAction(
  args: Prisma.TwoFactorCreateManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return createManyTwoFactorsOrm(args, prisma);
}

export async function findFirstTwoFactorAction(
  args?: Prisma.TwoFactorFindFirstArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findFirstTwoFactorOrm(args, prisma);
}

export async function findFirstTwoFactorActionOrThrow(
  args: Prisma.TwoFactorFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findFirstTwoFactorOrmOrThrow(args, prisma);
}

export async function findUniqueTwoFactorAction(
  args: Prisma.TwoFactorFindUniqueArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findUniqueTwoFactorOrm(args, prisma);
}

export async function findUniqueTwoFactorActionOrThrow(
  args: Prisma.TwoFactorFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findUniqueTwoFactorOrmOrThrow(args, prisma);
}

export async function findManyTwoFactorsAction(
  args?: Prisma.TwoFactorFindManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findManyTwoFactorsOrm(args, prisma);
}

export async function updateTwoFactorAction(
  args: Prisma.TwoFactorUpdateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return updateTwoFactorOrm(args, prisma);
}

export async function updateManyTwoFactorsAction(
  args: Prisma.TwoFactorUpdateManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return updateManyTwoFactorsOrm(args, prisma);
}

export async function upsertTwoFactorAction(
  args: Prisma.TwoFactorUpsertArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return upsertTwoFactorOrm(args, prisma);
}

export async function deleteTwoFactorAction(
  args: Prisma.TwoFactorDeleteArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return deleteTwoFactorOrm(args, prisma);
}

export async function deleteManyTwoFactorsAction(
  args?: Prisma.TwoFactorDeleteManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return deleteManyTwoFactorsOrm(args, prisma);
}

export async function aggregateTwoFactorsAction(
  args: Prisma.TwoFactorAggregateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return aggregateTwoFactorsOrm(args, prisma);
}

export async function countTwoFactorsAction(
  args?: Prisma.TwoFactorCountArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return countTwoFactorsOrm(args, prisma);
}

export async function groupByTwoFactorsAction(
  args: Prisma.TwoFactorGroupByArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return groupByTwoFactorsOrm(args, prisma);
}
