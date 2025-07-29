'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createSeriesOrm(args: Prisma.SeriesCreateArgs) {
  try {
    return await prisma.series.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstSeriesOrm(args?: Prisma.SeriesFindFirstArgs) {
  return await prisma.series.findFirst(args);
}

export async function findUniqueSeriesOrm(args: Prisma.SeriesFindUniqueArgs) {
  return await prisma.series.findUnique(args);
}

export async function findUniqueSeriesOrmOrThrow(args: Prisma.SeriesFindUniqueOrThrowArgs) {
  try {
    return await prisma.series.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManySeriesOrm(args?: Prisma.SeriesFindManyArgs) {
  return await prisma.series.findMany(args);
}

// UPDATE
export async function updateSeriesOrm(args: Prisma.SeriesUpdateArgs) {
  try {
    return await prisma.series.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManySeriesOrm(args: Prisma.SeriesUpdateManyArgs) {
  return await prisma.series.updateMany(args);
}

// UPSERT
export async function upsertSeriesOrm(args: Prisma.SeriesUpsertArgs) {
  try {
    return await prisma.series.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteSeriesOrm(args: Prisma.SeriesDeleteArgs) {
  try {
    return await prisma.series.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManySeriesOrm(args?: Prisma.SeriesDeleteManyArgs) {
  return await prisma.series.deleteMany(args);
}

// AGGREGATE
export async function aggregateSeriesOrm(args?: Prisma.SeriesAggregateArgs) {
  return await prisma.series.aggregate(args ?? {});
}

export async function countSeriesOrm(args?: Prisma.SeriesCountArgs) {
  return await prisma.series.count(args);
}

export async function groupBySeriesOrm(args: Prisma.SeriesGroupByArgs) {
  return await prisma.series.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find series by isFictional value
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findSeriesByIsFictionalOrm(
  isFictional: boolean,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: isFictional,
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find fictional series (isFictional = true)
 */
export async function findFictionalSeriesOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: true,
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find non-fictional series (isFictional = false)
 */
export async function findNonFictionalSeriesOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: false,
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series by fandom ID
 */
export async function findSeriesByFandomOrm(
  fandomId: string,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: fandomId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series that have a fandom assigned (fandomId not null)
 */
export async function findSeriesWithFandomOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: {
        not: null,
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series that don't have a fandom assigned (fandomId null)
 */
export async function findSeriesWithoutFandomOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: null,
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series by display order
 */
export async function findSeriesByDisplayOrderOrm(
  displayOrder: number,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayOrder: displayOrder,
    },
  };
  return await prisma.series.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Series model does not have hierarchical relationships (no parent/child structure)
// This section is intentionally empty

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find series that have associated stories
 */
export async function findSeriesWithStoriesOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stories: {
        some: {},
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series that have associated products
 */
export async function findSeriesWithProductsOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series that have associated jrFindReplaceRejects
 */
export async function findSeriesWithJrFindReplaceRejectsOrm(
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jrFindReplaceRejects: {
        some: {},
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series that have a fandom relationship
 */
export async function findSeriesWithFandomRelationOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandom: {
        isNot: null,
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series with all relations included
 */
export async function findSeriesWithAllRelationsOrm(id: string) {
  return await prisma.series.findUnique({
    where: { id },
    include: {
      fandom: true,
      stories: {
        orderBy: { displayOrder: 'asc' },
      },
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
 * Find active (non-deleted) series
 */
export async function findActiveSeriesOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find soft-deleted series
 */
export async function findDeletedSeriesOrm(additionalArgs?: Prisma.SeriesFindManyArgs) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Soft delete a series (set deletedAt and deletedById)
 */
export async function softDeleteSeriesOrm(id: string, deletedById: string) {
  try {
    return await prisma.series.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted series (clear deletedAt and deletedById)
 */
export async function restoreSeriesOrm(id: string) {
  try {
    return await prisma.series.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find series created after a specific date
 */
export async function findSeriesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
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
  return await prisma.series.findMany(args);
}

/**
 * Find series updated after a specific date
 */
export async function findSeriesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
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
  return await prisma.series.findMany(args);
}

/**
 * Find recently created or updated series within specified days
 */
export async function findRecentSeriesOrm(
  days: number = 7,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.SeriesFindManyArgs = {
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
  return await prisma.series.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find series by slug (leverages unique index)
 */
export async function findSeriesBySlugOrm(slug: string) {
  return await prisma.series.findUnique({
    where: { slug },
  });
}

/**
 * Search series by name (case-insensitive contains)
 */
export async function searchSeriesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Find series by fandom ID (leverages fandomId index)
 */
export async function findSeriesByFandomIdOrm(
  fandomId: string,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandomId: fandomId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.series.findMany(args);
}

/**
 * Search series across multiple fields
 */
export async function searchSeriesOrm(
  searchTerm: string,
  additionalArgs?: Prisma.SeriesFindManyArgs,
) {
  const args: Prisma.SeriesFindManyArgs = {
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
  return await prisma.series.findMany(args);
}

/**
 * Update series display order
 */
export async function updateSeriesDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.series.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Series not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Series with fandom relation
 */
export type SeriesWithFandom = Prisma.SeriesGetPayload<{
  include: { fandom: true };
}>;

/**
 * Series with stories relation
 */
export type SeriesWithStories = Prisma.SeriesGetPayload<{
  include: { stories: true };
}>;

/**
 * Series with products relation
 */
export type SeriesWithProducts = Prisma.SeriesGetPayload<{
  include: { products: true };
}>;

/**
 * Series with jrFindReplaceRejects relation
 */
export type SeriesWithJrFindReplaceRejects = Prisma.SeriesGetPayload<{
  include: { jrFindReplaceRejects: true };
}>;

/**
 * Series with all relations for complete data access
 */
export type SeriesWithAllRelations = Prisma.SeriesGetPayload<{
  include: {
    fandom: true;
    stories: true;
    products: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted series type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedSeries = Prisma.SeriesGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Series search result type for optimized queries
 */
export type SeriesSearchResult = Prisma.SeriesGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    fandomId: true;
    displayOrder: true;
    isFictional: true;
    _count: {
      select: {
        stories: true;
        products: true;
        jrFindReplaceRejects: true;
      };
    };
  };
}>;
