'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCastOrm(args: Prisma.CastCreateArgs) {
  try {
    return await prisma.cast.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstCastOrm(args?: Prisma.CastFindFirstArgs) {
  return await prisma.cast.findFirst(args);
}

export async function findUniqueCastOrm(args: Prisma.CastFindUniqueArgs) {
  return await prisma.cast.findUnique(args);
}

export async function findUniqueCastOrmOrThrow(args: Prisma.CastFindUniqueOrThrowArgs) {
  try {
    return await prisma.cast.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cast member not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyCastsOrm(args?: Prisma.CastFindManyArgs) {
  return await prisma.cast.findMany(args);
}

// UPDATE
export async function updateCastOrm(args: Prisma.CastUpdateArgs) {
  try {
    return await prisma.cast.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cast member not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyCastsOrm(args: Prisma.CastUpdateManyArgs) {
  return await prisma.cast.updateMany(args);
}

// UPSERT
export async function upsertCastOrm(args: Prisma.CastUpsertArgs) {
  try {
    return await prisma.cast.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteCastOrm(args: Prisma.CastDeleteArgs) {
  try {
    return await prisma.cast.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cast member not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyCastsOrm(args?: Prisma.CastDeleteManyArgs) {
  return await prisma.cast.deleteMany(args);
}

// AGGREGATE
export async function aggregateCastsOrm(args?: Prisma.CastAggregateArgs) {
  return await prisma.cast.aggregate(args ?? {});
}

export async function countCastsOrm(args?: Prisma.CastCountArgs) {
  return await prisma.cast.count(args);
}

export async function groupByCastsOrm(args: Prisma.CastGroupByArgs) {
  return await prisma.cast.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find casts by fictional status using boolean field
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findCastsByFictionalStatusOrm(
  isFictional: boolean,
  additionalArgs?: Prisma.CastFindManyArgs,
) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: isFictional,
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Find fictional cast members
 */
export async function findFictionalCastsOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: true,
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Find real (non-fictional) cast members
 */
export async function findRealCastsOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: false,
    },
  };
  return await prisma.cast.findMany(args);
}

//==============================================================================
// 3. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find casts that have associated products
 */
export async function findCastsWithProductsOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Find casts that have JollyRoger find/replace rules
 */
export async function findCastsWithJrFindReplaceOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jrFindReplaceRejects: {
        some: {},
      },
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Find cast with all relations included
 */
export async function findCastWithAllRelationsOrm(id: string) {
  return await prisma.cast.findUnique({
    where: { id },
    include: {
      products: true,
      jrFindReplaceRejects: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 4. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) casts
 */
export async function findActiveCastsOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Find soft-deleted casts
 */
export async function findDeletedCastsOrm(additionalArgs?: Prisma.CastFindManyArgs) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.cast.findMany(args);
}

/**
 * Soft delete a cast (set deletedAt and deletedById)
 */
export async function softDeleteCastOrm(id: string, deletedById: string) {
  try {
    return await prisma.cast.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cast not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted cast (clear deletedAt and deletedById)
 */
export async function restoreCastOrm(id: string) {
  try {
    return await prisma.cast.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Cast not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find casts created after a specific date
 */
export async function findCastsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CastFindManyArgs,
) {
  const args: Prisma.CastFindManyArgs = {
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
  return await prisma.cast.findMany(args);
}

/**
 * Find casts updated after a specific date
 */
export async function findCastsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CastFindManyArgs,
) {
  const args: Prisma.CastFindManyArgs = {
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
  return await prisma.cast.findMany(args);
}

/**
 * Find recently created or updated casts within specified days
 */
export async function findRecentCastsOrm(
  days: number = 7,
  additionalArgs?: Prisma.CastFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.CastFindManyArgs = {
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
  return await prisma.cast.findMany(args);
}

//==============================================================================
// 5. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find cast by slug (leverages unique index)
 */
export async function findCastBySlugOrm(slug: string) {
  return await prisma.cast.findUnique({
    where: { slug },
  });
}

/**
 * Search casts by name (case-insensitive contains)
 */
export async function searchCastsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.CastFindManyArgs,
) {
  const args: Prisma.CastFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.cast.findMany(args);
}

//==============================================================================
// 6. TYPE EXPORTS
//==============================================================================

/**
 * Cast with products relation
 */
export type CastWithProducts = Prisma.CastGetPayload<{
  include: { products: true };
}>;

/**
 * Cast with JollyRoger find/replace rules
 */
export type CastWithJrFindReplace = Prisma.CastGetPayload<{
  include: { jrFindReplaceRejects: true };
}>;

/**
 * Cast with all relations for complete data access
 */
export type CastWithAllRelations = Prisma.CastGetPayload<{
  include: {
    products: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted cast type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedCast = Prisma.CastGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Cast search result type for optimized queries
 */
export type CastSearchResult = Prisma.CastGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    isFictional: true;
    _count: {
      select: {
        products: true;
        jrFindReplaceRejects: true;
      };
    };
  };
}>;
