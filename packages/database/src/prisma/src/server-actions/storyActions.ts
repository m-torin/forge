'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import {
  aggregateStoriesOrm,
  countStoriesOrm,
  createStoryOrm,
  deleteManyStoriesOrm,
  deleteStoryOrm,
  findFirstStoryOrm,
  findManyStoriesOrm,
  findUniqueStoryOrm,
  groupByStoriesOrm,
  updateManyStoriesOrm,
  updateStoryOrm,
  upsertStoryOrm,
} from '../orm/ecommerce/storyOrm';

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
