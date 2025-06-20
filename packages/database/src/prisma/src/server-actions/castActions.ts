'use server';

import {
  createCastOrm,
  findFirstCastOrm,
  findUniqueCastOrm,
  findManyCastsOrm,
  updateCastOrm,
  updateManyCastsOrm,
  upsertCastOrm,
  deleteCastOrm,
  deleteManyCastsOrm,
  aggregateCastsOrm,
  countCastsOrm,
  groupByCastsOrm,
} from '../orm/castOrm';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// CAST SERVER ACTIONS
//==============================================================================

export async function createCastAction(args: Prisma.CastCreateArgs) {
  'use server';
  return createCastOrm(args);
}

export async function findFirstCastAction(args?: Prisma.CastFindFirstArgs) {
  'use server';
  return findFirstCastOrm(args);
}

export async function findUniqueCastAction(args: Prisma.CastFindUniqueArgs) {
  'use server';
  return findUniqueCastOrm(args);
}

export async function findManyCastsAction(args?: Prisma.CastFindManyArgs) {
  'use server';
  return findManyCastsOrm(args);
}

export async function updateCastAction(args: Prisma.CastUpdateArgs) {
  'use server';
  return updateCastOrm(args);
}

export async function updateManyCastsAction(args: Prisma.CastUpdateManyArgs) {
  'use server';
  return updateManyCastsOrm(args);
}

export async function upsertCastAction(args: Prisma.CastUpsertArgs) {
  'use server';
  return upsertCastOrm(args);
}

export async function deleteCastAction(args: Prisma.CastDeleteArgs) {
  'use server';
  return deleteCastOrm(args);
}

export async function deleteManyCastsAction(args?: Prisma.CastDeleteManyArgs) {
  'use server';
  return deleteManyCastsOrm(args);
}

export async function aggregateCastsAction(args?: Prisma.CastAggregateArgs) {
  'use server';
  return aggregateCastsOrm(args);
}

export async function countCastsAction(args?: Prisma.CastCountArgs) {
  'use server';
  return countCastsOrm(args);
}

export async function groupByCastsAction(args: Prisma.CastGroupByArgs) {
  'use server';
  return groupByCastsOrm(args);
}
