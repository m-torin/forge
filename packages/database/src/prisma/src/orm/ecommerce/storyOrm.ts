'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createStoryOrm(args: Prisma.StoryCreateArgs) {
  try {
    return await prisma.story.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstStoryOrm(args?: Prisma.StoryFindFirstArgs) {
  return await prisma.story.findFirst(args);
}

export async function findUniqueStoryOrm(args: Prisma.StoryFindUniqueArgs) {
  return await prisma.story.findUnique(args);
}

export async function findUniqueStoryOrmOrThrow(args: Prisma.StoryFindUniqueOrThrowArgs) {
  try {
    return await prisma.story.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyStoriesOrm(args?: Prisma.StoryFindManyArgs) {
  return await prisma.story.findMany(args);
}

// UPDATE
export async function updateStoryOrm(args: Prisma.StoryUpdateArgs) {
  try {
    return await prisma.story.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyStoriesOrm(args: Prisma.StoryUpdateManyArgs) {
  return await prisma.story.updateMany(args);
}

// UPSERT
export async function upsertStoryOrm(args: Prisma.StoryUpsertArgs) {
  try {
    return await prisma.story.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteStoryOrm(args: Prisma.StoryDeleteArgs) {
  try {
    return await prisma.story.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyStoriesOrm(args?: Prisma.StoryDeleteManyArgs) {
  return await prisma.story.deleteMany(args);
}

// AGGREGATE
export async function aggregateStoriesOrm(args?: Prisma.StoryAggregateArgs) {
  return await prisma.story.aggregate(args ?? {});
}

export async function countStoriesOrm(args?: Prisma.StoryCountArgs) {
  return await prisma.story.count(args);
}

export async function groupByStoriesOrm(args: Prisma.StoryGroupByArgs) {
  return await prisma.story.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find stories by isFictional value
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findStoriesByIsFictionalOrm(
  isFictional: boolean,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: isFictional,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find fictional stories (isFictional = true)
 */
export async function findFictionalStoriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: true,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find non-fictional stories (isFictional = false)
 */
export async function findNonFictionalStoriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: false,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories by series ID
 */
export async function findStoriesBySeriesOrm(
  seriesId: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      seriesId: seriesId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that have a series assigned (seriesId not null)
 */
export async function findStoriesWithSeriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      seriesId: {
        not: null,
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that don't have a series assigned (seriesId null)
 */
export async function findStoriesWithoutSeriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      seriesId: null,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories by fandom ID
 */
export async function findStoriesByFandomOrm(
  fandomId: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: fandomId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that have a fandom assigned (fandomId not null)
 */
export async function findStoriesWithFandomOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: {
        not: null,
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that don't have a fandom assigned (fandomId null)
 */
export async function findStoriesWithoutFandomOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: null,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories by display order
 */
export async function findStoriesByDisplayOrderOrm(
  displayOrder: number,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayOrder: displayOrder,
    },
  };
  return await prisma.story.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Story model does not have hierarchical relationships (no parent/child structure)
// This section is intentionally empty

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find stories that have associated products
 */
export async function findStoriesWithProductsOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that have associated jrFindReplaceRejects
 */
export async function findStoriesWithJrFindReplaceRejectsOrm(
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jrFindReplaceRejects: {
        some: {},
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that have a series relationship
 */
export async function findStoriesWithSeriesRelationOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      series: {
        isNot: null,
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories that have a fandom relationship
 */
export async function findStoriesWithFandomRelationOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandom: {
        isNot: null,
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find story with all relations included
 */
export async function findStoryWithAllRelationsOrm(id: string) {
  return await prisma.story.findUnique({
    where: { id },
    include: {
      series: true,
      fandom: true,
      products: true,
      jrFindReplaceRejects: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) stories
 */
export async function findActiveStoriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find soft-deleted stories
 */
export async function findDeletedStoriesOrm(additionalArgs?: Prisma.StoryFindManyArgs) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Soft delete a story (set deletedAt and deletedById)
 */
export async function softDeleteStoryOrm(id: string, deletedById: string) {
  try {
    return await prisma.story.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted story (clear deletedAt and deletedById)
 */
export async function restoreStoryOrm(id: string) {
  try {
    return await prisma.story.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find stories created after a specific date
 */
export async function findStoriesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories updated after a specific date
 */
export async function findStoriesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find recently created or updated stories within specified days
 */
export async function findRecentStoriesOrm(
  days: number = 7,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.story.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find story by slug (leverages unique index)
 */
export async function findStoryBySlugOrm(slug: string) {
  return await prisma.story.findUnique({
    where: { slug },
  });
}

/**
 * Search stories by name (case-insensitive contains)
 */
export async function searchStoriesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories by series ID (leverages seriesId index)
 */
export async function findStoriesBySeriesIdOrm(
  seriesId: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      seriesId: seriesId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Find stories by fandom ID (leverages fandomId index)
 */
export async function findStoriesByFandomIdOrm(
  fandomId: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: fandomId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Search stories across multiple fields
 */
export async function searchStoriesOrm(
  searchTerm: string,
  additionalArgs?: Prisma.StoryFindManyArgs,
) {
  const args: Prisma.StoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Note: JSON search capabilities depend on database configuration
        // For advanced JSON search in copy field, consider using raw queries
      ],
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.story.findMany(args);
}

/**
 * Update story display order
 */
export async function updateStoryDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.story.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Story not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Story with series relation
 */
export type StoryWithSeries = Prisma.StoryGetPayload<{
  include: { series: true };
}>;

/**
 * Story with fandom relation
 */
export type StoryWithFandom = Prisma.StoryGetPayload<{
  include: { fandom: true };
}>;

/**
 * Story with products relation
 */
export type StoryWithProducts = Prisma.StoryGetPayload<{
  include: { products: true };
}>;

/**
 * Story with jrFindReplaceRejects relation
 */
export type StoryWithJrFindReplaceRejects = Prisma.StoryGetPayload<{
  include: { jrFindReplaceRejects: true };
}>;

/**
 * Story with all relations for complete data access
 */
export type StoryWithAllRelations = Prisma.StoryGetPayload<{
  include: {
    series: true;
    fandom: true;
    products: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted story type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedStory = Prisma.StoryGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Story search result type for optimized queries
 */
export type StorySearchResult = Prisma.StoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    seriesId: true;
    fandomId: true;
    displayOrder: true;
    isFictional: true;
    _count: {
      select: {
        products: true;
        jrFindReplaceRejects: true;
      };
    };
  };
}>;
