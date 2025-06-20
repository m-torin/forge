'use server';

import {
  createSeriesOrm,
  findFirstSeriesOrm,
  findUniqueSeriesOrm,
  findManySeriesOrm,
  updateSeriesOrm,
  updateManySeriesOrm,
  upsertSeriesOrm,
  deleteSeriesOrm,
  deleteManySeriesOrm,
  aggregateSeriesOrm,
  countSeriesOrm,
  groupBySeriesOrm,
  createStoryOrm,
  findFirstStoryOrm,
  findUniqueStoryOrm,
  findManyStoriesOrm,
  updateStoryOrm,
  updateManyStoriesOrm,
  upsertStoryOrm,
  deleteStoryOrm,
  deleteManyStoriesOrm,
  aggregateStoriesOrm,
  countStoriesOrm,
  groupByStoriesOrm,
} from '../orm/storyOrm';
import type { Prisma } from '../../../../prisma-generated/client';

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

//==============================================================================
// STORY SERVER ACTIONS
//==============================================================================

export async function createStoryAction(args: Prisma.StoryCreateArgs) {
  'use server';
  return createStoryOrm(args);
}

export async function findFirstStoryAction(args?: Prisma.StoryFindFirstArgs) {
  'use server';
  return findFirstStoryOrm(args);
}

export async function findUniqueStoryAction(args: Prisma.StoryFindUniqueArgs) {
  'use server';
  return findUniqueStoryOrm(args);
}

export async function findManyStoriesAction(args?: Prisma.StoryFindManyArgs) {
  'use server';
  return findManyStoriesOrm(args);
}

export async function updateStoryAction(args: Prisma.StoryUpdateArgs) {
  'use server';
  return updateStoryOrm(args);
}

export async function updateManyStoriesAction(args: Prisma.StoryUpdateManyArgs) {
  'use server';
  return updateManyStoriesOrm(args);
}

export async function upsertStoryAction(args: Prisma.StoryUpsertArgs) {
  'use server';
  return upsertStoryOrm(args);
}

export async function deleteStoryAction(args: Prisma.StoryDeleteArgs) {
  'use server';
  return deleteStoryOrm(args);
}

export async function deleteManyStoriesAction(args?: Prisma.StoryDeleteManyArgs) {
  'use server';
  return deleteManyStoriesOrm(args);
}

export async function aggregateStoriesAction(args?: Prisma.StoryAggregateArgs) {
  'use server';
  return aggregateStoriesOrm(args);
}

export async function countStoriesAction(args?: Prisma.StoryCountArgs) {
  'use server';
  return countStoriesOrm(args);
}

export async function groupByStoriesAction(args: Prisma.StoryGroupByArgs) {
  'use server';
  return groupByStoriesOrm(args);
}
