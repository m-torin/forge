'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateFandomsOrm,
  countFandomsOrm,
  createFandomOrm,
  deleteFandomOrm,
  deleteManyFandomsOrm,
  findFirstFandomOrm,
  findManyFandomsOrm,
  findUniqueFandomOrm,
  groupByFandomsOrm,
  updateFandomOrm,
  updateFandomsBulkOrm,
  updateManyFandomsOrm,
  upsertFandomOrm,
} from '../orm/ecommerce/fandomOrm';

//==============================================================================
// FANDOM SERVER ACTIONS
//==============================================================================

export async function createFandomAction(args: Prisma.FandomCreateArgs) {
  'use server';
  return createFandomOrm(args);
}

export async function findFirstFandomAction(args?: Prisma.FandomFindFirstArgs) {
  'use server';
  return findFirstFandomOrm(args);
}

export async function findUniqueFandomAction(args: Prisma.FandomFindUniqueArgs) {
  'use server';
  return findUniqueFandomOrm(args);
}

export async function findManyFandomsAction(args?: Prisma.FandomFindManyArgs) {
  'use server';
  return findManyFandomsOrm(args);
}

export async function updateFandomAction(args: Prisma.FandomUpdateArgs) {
  'use server';
  return updateFandomOrm(args);
}

export async function updateManyFandomsAction(args: Prisma.FandomUpdateManyArgs) {
  'use server';
  return updateManyFandomsOrm(args);
}

export async function upsertFandomAction(args: Prisma.FandomUpsertArgs) {
  'use server';
  return upsertFandomOrm(args);
}

export async function deleteFandomAction(args: Prisma.FandomDeleteArgs) {
  'use server';
  return deleteFandomOrm(args);
}

export async function deleteManyFandomsAction(args?: Prisma.FandomDeleteManyArgs) {
  'use server';
  return deleteManyFandomsOrm(args);
}

export async function aggregateFandomsAction(args?: Prisma.FandomAggregateArgs) {
  'use server';
  return aggregateFandomsOrm(args);
}

export async function countFandomsAction(args?: Prisma.FandomCountArgs) {
  'use server';
  return countFandomsOrm(args);
}

export async function groupByFandomsAction(args: Prisma.FandomGroupByArgs) {
  'use server';
  return groupByFandomsOrm(args);
}

export async function updateFandomsBulkAction(
  updates: Array<{ id: string; data: Prisma.FandomUpdateInput }>,
) {
  'use server';
  return updateFandomsBulkOrm(updates);
}

export async function checkFandomSlugExistsAction(slug: string, excludeId?: string) {
  'use server';
  const existing = await findFirstFandomOrm({
    where: {
      slug,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { id: true },
  });
  return !!existing;
}
