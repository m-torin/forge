/**
 * Passkey server actions for Next.js applications
 */

"use server";

import type { Prisma, PrismaClient } from "../../../../prisma-generated/client";
import {
  aggregatePasskeysOrm,
  countPasskeysOrm,
  createManyPasskeysOrm,
  createPasskeyOrm,
  deleteManyPasskeysOrm,
  deletePasskeyOrm,
  findFirstPasskeyOrm,
  findFirstPasskeyOrmOrThrow,
  findManyPasskeysOrm,
  findUniquePasskeyOrm,
  findUniquePasskeyOrmOrThrow,
  groupByPasskeysOrm,
  updateManyPasskeysOrm,
  updatePasskeyOrm,
  upsertPasskeyOrm,
} from "../orm/auth/authOrm";

export async function createPasskeyAction(
  args: Prisma.PasskeyCreateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return createPasskeyOrm(args, prisma);
}

export async function createManyPasskeysAction(
  args: Prisma.PasskeyCreateManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return createManyPasskeysOrm(args, prisma);
}

export async function findFirstPasskeyAction(
  args?: Prisma.PasskeyFindFirstArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findFirstPasskeyOrm(args, prisma);
}

export async function findFirstPasskeyActionOrThrow(
  args: Prisma.PasskeyFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findFirstPasskeyOrmOrThrow(args, prisma);
}

export async function findUniquePasskeyAction(
  args: Prisma.PasskeyFindUniqueArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findUniquePasskeyOrm(args, prisma);
}

export async function findUniquePasskeyActionOrThrow(
  args: Prisma.PasskeyFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findUniquePasskeyOrmOrThrow(args, prisma);
}

export async function findManyPasskeysAction(
  args?: Prisma.PasskeyFindManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return findManyPasskeysOrm(args, prisma);
}

export async function updatePasskeyAction(
  args: Prisma.PasskeyUpdateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return updatePasskeyOrm(args, prisma);
}

export async function updateManyPasskeysAction(
  args: Prisma.PasskeyUpdateManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return updateManyPasskeysOrm(args, prisma);
}

export async function upsertPasskeyAction(
  args: Prisma.PasskeyUpsertArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return upsertPasskeyOrm(args, prisma);
}

export async function deletePasskeyAction(
  args: Prisma.PasskeyDeleteArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return deletePasskeyOrm(args, prisma);
}

export async function deleteManyPasskeysAction(
  args?: Prisma.PasskeyDeleteManyArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return deleteManyPasskeysOrm(args, prisma);
}

export async function aggregatePasskeysAction(
  args: Prisma.PasskeyAggregateArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return aggregatePasskeysOrm(args, prisma);
}

export async function countPasskeysAction(
  args?: Prisma.PasskeyCountArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return countPasskeysOrm(args, prisma);
}

export async function groupByPasskeysAction(
  args: Prisma.PasskeyGroupByArgs,
  prisma?: PrismaClient,
) {
  "use server";
  return groupByPasskeysOrm(args, prisma);
}
