'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateSeriesOrm,
  countSeriesOrm,
  createSeriesOrm,
  deleteManySeriesOrm,
  deleteSeriesOrm,
  findFirstSeriesOrm,
  findManySeriesOrm,
  findUniqueSeriesOrm,
  groupBySeriesOrm,
  updateManySeriesOrm,
  updateSeriesOrm,
  upsertSeriesOrm,
} from '../orm/ecommerce/seriesOrm';

//==============================================================================
// SERIES SERVER ACTIONS
//==============================================================================

export async function createSeriesAction(args: Prisma.SeriesCreateArgs) {
  'use server';
  return createSeriesOrm(args);
}

export async function findFirstSeriesAction(args?: Prisma.SeriesFindFirstArgs) {
  'use server';
  return findFirstSeriesOrm(args);
}

export async function findUniqueSeriesAction(args: Prisma.SeriesFindUniqueArgs) {
  'use server';
  return findUniqueSeriesOrm(args);
}

export async function findManySeriesAction(args?: Prisma.SeriesFindManyArgs) {
  'use server';
  return findManySeriesOrm(args);
}

export async function updateSeriesAction(args: Prisma.SeriesUpdateArgs) {
  'use server';
  return updateSeriesOrm(args);
}

export async function updateManySeriesAction(args: Prisma.SeriesUpdateManyArgs) {
  'use server';
  return updateManySeriesOrm(args);
}

export async function upsertSeriesAction(args: Prisma.SeriesUpsertArgs) {
  'use server';
  return upsertSeriesOrm(args);
}

export async function deleteSeriesAction(args: Prisma.SeriesDeleteArgs) {
  'use server';
  return deleteSeriesOrm(args);
}

export async function deleteManySeriesAction(args?: Prisma.SeriesDeleteManyArgs) {
  'use server';
  return deleteManySeriesOrm(args);
}

export async function aggregateSeriesAction(args?: Prisma.SeriesAggregateArgs) {
  'use server';
  return aggregateSeriesOrm(args);
}

export async function countSeriesAction(args?: Prisma.SeriesCountArgs) {
  'use server';
  return countSeriesOrm(args);
}

export async function groupBySeriesAction(args: Prisma.SeriesGroupByArgs) {
  'use server';
  return groupBySeriesOrm(args);
}
