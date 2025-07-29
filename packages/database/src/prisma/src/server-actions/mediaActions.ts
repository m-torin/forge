'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateMediaOrm,
  countMediaOrm,
  createMediaOrm,
  deleteManyMediaOrm,
  deleteMediaOrm,
  findFirstMediaOrm,
  findManyMediaOrm,
  findUniqueMediaOrm,
  groupByMediaOrm,
  updateManyMediaOrm,
  updateMediaOrm,
  upsertMediaOrm,
} from '../orm/ecommerce/mediaOrm';

//==============================================================================
// MEDIA SERVER ACTIONS
//==============================================================================

export async function createMediaAction(args: Prisma.MediaCreateArgs) {
  'use server';
  return createMediaOrm(args);
}

export async function findFirstMediaAction(args?: Prisma.MediaFindFirstArgs) {
  'use server';
  return findFirstMediaOrm(args);
}

export async function findUniqueMediaAction(args: Prisma.MediaFindUniqueArgs) {
  'use server';
  return findUniqueMediaOrm(args);
}

export async function findManyMediaAction(args?: Prisma.MediaFindManyArgs) {
  'use server';
  return findManyMediaOrm(args);
}

export async function updateMediaAction(args: Prisma.MediaUpdateArgs) {
  'use server';
  return updateMediaOrm(args);
}

export async function updateManyMediaAction(args: Prisma.MediaUpdateManyArgs) {
  'use server';
  return updateManyMediaOrm(args);
}

export async function upsertMediaAction(args: Prisma.MediaUpsertArgs) {
  'use server';
  return upsertMediaOrm(args);
}

export async function deleteMediaAction(args: Prisma.MediaDeleteArgs) {
  'use server';
  return deleteMediaOrm(args);
}

export async function deleteManyMediaAction(args?: Prisma.MediaDeleteManyArgs) {
  'use server';
  return deleteManyMediaOrm(args);
}

export async function aggregateMediaAction(args?: Prisma.MediaAggregateArgs) {
  'use server';
  return aggregateMediaOrm(args);
}

export async function countMediaAction(args?: Prisma.MediaCountArgs) {
  'use server';
  return countMediaOrm(args);
}

export async function groupByMediaAction(args: Prisma.MediaGroupByArgs) {
  'use server';
  return groupByMediaOrm(args);
}
