'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createFandomOrm(args: Prisma.FandomCreateArgs) {
  try {
    return await prisma.fandom.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstFandomOrm(args?: Prisma.FandomFindFirstArgs) {
  return await prisma.fandom.findFirst(args);
}

export async function findUniqueFandomOrm(args: Prisma.FandomFindUniqueArgs) {
  return await prisma.fandom.findUnique(args);
}

export async function findUniqueFandomOrmOrThrow(args: Prisma.FandomFindUniqueOrThrowArgs) {
  try {
    return await prisma.fandom.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Fandom not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyFandomsOrm(args?: Prisma.FandomFindManyArgs) {
  return await prisma.fandom.findMany(args);
}

// UPDATE
export async function updateFandomOrm(args: Prisma.FandomUpdateArgs) {
  try {
    return await prisma.fandom.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Fandom not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyFandomsOrm(args: Prisma.FandomUpdateManyArgs) {
  return await prisma.fandom.updateMany(args);
}

export async function updateFandomsBulkOrm(
  updates: Array<{ id: string; data: Prisma.FandomUpdateInput }>,
) {
  try {
    return await prisma.$transaction(
      updates.map(update =>
        prisma.fandom.update({
          where: { id: update.id },
          data: update.data,
        }),
      ),
    );
  } catch (error) {
    handlePrismaError(error);
  }
}

// UPSERT
export async function upsertFandomOrm(args: Prisma.FandomUpsertArgs) {
  try {
    return await prisma.fandom.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteFandomOrm(args: Prisma.FandomDeleteArgs) {
  try {
    return await prisma.fandom.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Fandom not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyFandomsOrm(args?: Prisma.FandomDeleteManyArgs) {
  return await prisma.fandom.deleteMany(args);
}

// AGGREGATE
export async function aggregateFandomsOrm(args?: Prisma.FandomAggregateArgs) {
  return await prisma.fandom.aggregate(args ?? {});
}

export async function countFandomsOrm(args?: Prisma.FandomCountArgs) {
  return await prisma.fandom.count(args);
}

export async function groupByFandomsOrm(args: Prisma.FandomGroupByArgs) {
  return await prisma.fandom.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find fandoms by isFictional value
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findFandomsByIsFictionalOrm(
  isFictional: boolean,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: isFictional,
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find fictional fandoms (isFictional = true)
 */
export async function findFictionalFandomsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: true,
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find non-fictional fandoms (isFictional = false)
 */
export async function findNonFictionalFandomsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: false,
    },
  };
  return await prisma.fandom.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Fandom model does not have hierarchical relationships (no parent/child structure)
// This section is intentionally empty

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find fandoms that have associated series
 */
export async function findFandomsWithSeriesOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      series: {
        some: {},
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find fandoms that have associated stories
 */
export async function findFandomsWithStoriesOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stories: {
        some: {},
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find fandoms that have associated products
 */
export async function findFandomsWithProductsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find fandoms that have associated locations
 */
export async function findFandomsWithLocationsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locations: {
        some: {},
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find fandom with all relations included
 */
export async function findFandomWithAllRelationsOrm(id: string) {
  return await prisma.fandom.findUnique({
    where: { id },
    include: {
      series: {
        orderBy: { displayOrder: 'asc' },
      },
      stories: {
        orderBy: { displayOrder: 'asc' },
      },
      products: true,
      locations: true,
      jrFindReplaceRejects: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) fandoms
 */
export async function findActiveFandomsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Find soft-deleted fandoms
 */
export async function findDeletedFandomsOrm(additionalArgs?: Prisma.FandomFindManyArgs) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Soft delete a fandom (set deletedAt and deletedById)
 */
export async function softDeleteFandomOrm(id: string, deletedById: string) {
  try {
    return await prisma.fandom.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Fandom not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted fandom (clear deletedAt and deletedById)
 */
export async function restoreFandomOrm(id: string) {
  try {
    return await prisma.fandom.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Fandom not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find fandoms created after a specific date
 */
export async function findFandomsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const args: Prisma.FandomFindManyArgs = {
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
  return await prisma.fandom.findMany(args);
}

/**
 * Find fandoms updated after a specific date
 */
export async function findFandomsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const args: Prisma.FandomFindManyArgs = {
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
  return await prisma.fandom.findMany(args);
}

/**
 * Find recently created or updated fandoms within specified days
 */
export async function findRecentFandomsOrm(
  days: number = 7,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.FandomFindManyArgs = {
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
  return await prisma.fandom.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find fandom by slug (leverages unique index)
 */
export async function findFandomBySlugOrm(slug: string) {
  return await prisma.fandom.findUnique({
    where: { slug },
  });
}

/**
 * Search fandoms by name (case-insensitive contains)
 */
export async function searchFandomsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const args: Prisma.FandomFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.fandom.findMany(args);
}

/**
 * Search fandoms by name and description (from copy JSON field)
 */
export async function searchFandomsOrm(
  searchTerm: string,
  additionalArgs?: Prisma.FandomFindManyArgs,
) {
  const args: Prisma.FandomFindManyArgs = {
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
        // This is a basic approach; for advanced JSON search, consider using raw queries
      ],
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.fandom.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Fandom with series relation
 */
export type FandomWithSeries = Prisma.FandomGetPayload<{
  include: { series: true };
}>;

/**
 * Fandom with stories relation
 */
export type FandomWithStories = Prisma.FandomGetPayload<{
  include: { stories: true };
}>;

/**
 * Fandom with products relation
 */
export type FandomWithProducts = Prisma.FandomGetPayload<{
  include: { products: true };
}>;

/**
 * Fandom with locations relation
 */
export type FandomWithLocations = Prisma.FandomGetPayload<{
  include: { locations: true };
}>;

/**
 * Fandom with all relations for complete data access
 */
export type FandomWithAllRelations = Prisma.FandomGetPayload<{
  include: {
    series: true;
    stories: true;
    products: true;
    locations: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted fandom type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedFandom = Prisma.FandomGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Fandom search result type for optimized queries
 */
export type FandomSearchResult = Prisma.FandomGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    isFictional: true;
    _count: {
      select: {
        series: true;
        stories: true;
        products: true;
        locations: true;
      };
    };
  };
}>;
