'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// SERIES CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createSeriesOrm(args: Prisma.SeriesCreateArgs) {
  return prisma.series.create(args);
}

// READ
export async function findFirstSeriesOrm(args?: Prisma.SeriesFindFirstArgs) {
  return prisma.series.findFirst(args);
}

export async function findUniqueSeriesOrm(args: Prisma.SeriesFindUniqueArgs) {
  return prisma.series.findUnique(args);
}

export async function findManySeriesOrm(args?: Prisma.SeriesFindManyArgs) {
  return prisma.series.findMany(args);
}

// UPDATE
export async function updateSeriesOrm(args: Prisma.SeriesUpdateArgs) {
  return prisma.series.update(args);
}

export async function updateManySeriesOrm(args: Prisma.SeriesUpdateManyArgs) {
  return prisma.series.updateMany(args);
}

// UPSERT
export async function upsertSeriesOrm(args: Prisma.SeriesUpsertArgs) {
  return prisma.series.upsert(args);
}

// DELETE
export async function deleteSeriesOrm(args: Prisma.SeriesDeleteArgs) {
  return prisma.series.delete(args);
}

export async function deleteManySeriesOrm(args?: Prisma.SeriesDeleteManyArgs) {
  return prisma.series.deleteMany(args);
}

// AGGREGATE
export async function aggregateSeriesOrm<T extends Prisma.SeriesAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetSeriesAggregateType<T>> {
  return prisma.series.aggregate((args ?? {}) as T);
}

export async function countSeriesOrm(args?: Prisma.SeriesCountArgs) {
  return prisma.series.count(args);
}

export async function groupBySeriesOrm(args: Prisma.SeriesGroupByArgs) {
  return prisma.series.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// STORY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createStoryOrm(args: Prisma.StoryCreateArgs) {
  return prisma.story.create(args);
}

// READ
export async function findFirstStoryOrm(args?: Prisma.StoryFindFirstArgs) {
  return prisma.story.findFirst(args);
}

export async function findUniqueStoryOrm(args: Prisma.StoryFindUniqueArgs) {
  return prisma.story.findUnique(args);
}

export async function findManyStoriesOrm(args?: Prisma.StoryFindManyArgs) {
  return prisma.story.findMany(args);
}

// UPDATE
export async function updateStoryOrm(args: Prisma.StoryUpdateArgs) {
  return prisma.story.update(args);
}

export async function updateManyStoriesOrm(args: Prisma.StoryUpdateManyArgs) {
  return prisma.story.updateMany(args);
}

// UPSERT
export async function upsertStoryOrm(args: Prisma.StoryUpsertArgs) {
  return prisma.story.upsert(args);
}

// DELETE
export async function deleteStoryOrm(args: Prisma.StoryDeleteArgs) {
  return prisma.story.delete(args);
}

export async function deleteManyStoriesOrm(args?: Prisma.StoryDeleteManyArgs) {
  return prisma.story.deleteMany(args);
}

// AGGREGATE
export async function aggregateStoriesOrm<T extends Prisma.StoryAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetStoryAggregateType<T>> {
  return prisma.story.aggregate((args ?? {}) as T);
}

export async function countStoriesOrm(args?: Prisma.StoryCountArgs) {
  return prisma.story.count(args);
}

export async function groupByStoriesOrm(args: Prisma.StoryGroupByArgs) {
  return prisma.story.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
