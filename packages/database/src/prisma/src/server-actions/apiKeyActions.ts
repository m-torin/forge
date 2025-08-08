/**
 * ApiKey server actions for Next.js applications
 */

'use server';

import type { Prisma, PrismaClient } from '../../../../prisma-generated/client';
import {
  aggregateApiKeysOrm,
  countApiKeysOrm,
  createApiKeyOrm,
  createManyApiKeysOrm,
  deleteApiKeyOrm,
  deleteManyApiKeysOrm,
  findFirstApiKeyOrm,
  findFirstApiKeyOrmOrThrow,
  findManyApiKeysOrm,
  findUniqueApiKeyOrm,
  findUniqueApiKeyOrmOrThrow,
  groupByApiKeysOrm,
  updateApiKeyOrm,
  updateManyApiKeysOrm,
  upsertApiKeyOrm,
} from '../orm/auth/authOrm';

export async function createApiKeyAction(args: Prisma.ApiKeyCreateArgs, prisma?: PrismaClient) {
  'use server';
  return createApiKeyOrm(args, prisma);
}

export async function createManyApiKeysAction(
  args: Prisma.ApiKeyCreateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return createManyApiKeysOrm(args, prisma);
}

export async function findFirstApiKeyAction(
  args?: Prisma.ApiKeyFindFirstArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstApiKeyOrm(args, prisma);
}

export async function findFirstApiKeyActionOrThrow(
  args: Prisma.ApiKeyFindFirstOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findFirstApiKeyOrmOrThrow(args, prisma);
}

export async function findUniqueApiKeyAction(
  args: Prisma.ApiKeyFindUniqueArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueApiKeyOrm(args, prisma);
}

export async function findUniqueApiKeyActionOrThrow(
  args: Prisma.ApiKeyFindUniqueOrThrowArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findUniqueApiKeyOrmOrThrow(args, prisma);
}

export async function findManyApiKeysAction(
  args?: Prisma.ApiKeyFindManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return findManyApiKeysOrm(args, prisma);
}

export async function updateApiKeyAction(args: Prisma.ApiKeyUpdateArgs, prisma?: PrismaClient) {
  'use server';
  return updateApiKeyOrm(args, prisma);
}

export async function updateManyApiKeysAction(
  args: Prisma.ApiKeyUpdateManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return updateManyApiKeysOrm(args, prisma);
}

export async function upsertApiKeyAction(args: Prisma.ApiKeyUpsertArgs, prisma?: PrismaClient) {
  'use server';
  return upsertApiKeyOrm(args, prisma);
}

export async function deleteApiKeyAction(args: Prisma.ApiKeyDeleteArgs, prisma?: PrismaClient) {
  'use server';
  return deleteApiKeyOrm(args, prisma);
}

export async function deleteManyApiKeysAction(
  args?: Prisma.ApiKeyDeleteManyArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return deleteManyApiKeysOrm(args, prisma);
}

export async function aggregateApiKeysAction(
  args: Prisma.ApiKeyAggregateArgs,
  prisma?: PrismaClient,
) {
  'use server';
  return aggregateApiKeysOrm(args, prisma);
}

export async function countApiKeysAction(args?: Prisma.ApiKeyCountArgs, prisma?: PrismaClient) {
  'use server';
  return countApiKeysOrm(args, prisma);
}

export async function groupByApiKeysAction(args: Prisma.ApiKeyGroupByArgs, prisma?: PrismaClient) {
  'use server';
  return groupByApiKeysOrm(args, prisma);
}
