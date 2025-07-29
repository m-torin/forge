'use server';

import type { LocationType, LodgingType, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createLocationOrm(args: Prisma.LocationCreateArgs) {
  try {
    return await prisma.location.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstLocationOrm(args?: Prisma.LocationFindFirstArgs) {
  return await prisma.location.findFirst(args);
}

export async function findUniqueLocationOrm(args: Prisma.LocationFindUniqueArgs) {
  return await prisma.location.findUnique(args);
}

export async function findUniqueLocationOrmOrThrow(args: Prisma.LocationFindUniqueOrThrowArgs) {
  try {
    return await prisma.location.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Location not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyLocationsOrm(args?: Prisma.LocationFindManyArgs) {
  return await prisma.location.findMany(args);
}

// UPDATE
export async function updateLocationOrm(args: Prisma.LocationUpdateArgs) {
  try {
    return await prisma.location.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Location not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyLocationsOrm(args: Prisma.LocationUpdateManyArgs) {
  return await prisma.location.updateMany(args);
}

// UPSERT
export async function upsertLocationOrm(args: Prisma.LocationUpsertArgs) {
  try {
    return await prisma.location.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteLocationOrm(args: Prisma.LocationDeleteArgs) {
  try {
    return await prisma.location.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Location not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyLocationsOrm(args?: Prisma.LocationDeleteManyArgs) {
  return await prisma.location.deleteMany(args);
}

// AGGREGATE
export async function aggregateLocationsOrm(args?: Prisma.LocationAggregateArgs) {
  return await prisma.location.aggregate(args ?? {});
}

export async function countLocationsOrm(args?: Prisma.LocationCountArgs) {
  return await prisma.location.count(args);
}

export async function groupByLocationsOrm(args: Prisma.LocationGroupByArgs) {
  return await prisma.location.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find locations by locationType using LocationType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findLocationsByTypeOrm(
  locationType: LocationType,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationType: locationType,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find lodging locations by lodgingType using LodgingType enum
 */
export async function findLocationsByLodgingTypeOrm(
  lodgingType: LodgingType,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lodgingType: lodgingType,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that have lodgingType set (not null)
 */
export async function findLocationsWithLodgingTypeOrm(
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lodgingType: {
        not: null,
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that don't have lodgingType (null)
 */
export async function findLocationsWithoutLodgingTypeOrm(
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lodgingType: null,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find fictional locations
 */
export async function findFictionalLocationsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: true,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find real locations (non-fictional)
 */
export async function findRealLocationsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isFictional: false,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations by both locationType and lodgingType
 */
export async function findLocationsByTypeAndLodgingTypeOrm(
  locationType: LocationType,
  lodgingType: LodgingType,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationType: locationType,
      lodgingType: lodgingType,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find lodging locations specifically (locationType: LODGING)
 */
export async function findLodgingLocationsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locationType: 'LODGING',
    },
  };
  return await prisma.location.findMany(args);
}

//==============================================================================
// 3. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find locations that have associated products
 */
export async function findLocationsWithProductsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that have associated fandoms
 */
export async function findLocationsWithFandomsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandoms: {
        some: {},
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that have associated pdpJoins
 */
export async function findLocationsWithPdpJoinsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpJoins: {
        some: {},
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that have associated taxonomies
 */
export async function findLocationsWithTaxonomiesOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      taxonomies: {
        some: {},
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find locations that have associated jrFindReplaceRejects
 */
export async function findLocationsWithJrFindReplaceRejectsOrm(
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jrFindReplaceRejects: {
        some: {},
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find location with all relations included
 */
export async function findLocationWithAllRelationsOrm(id: string) {
  return await prisma.location.findUnique({
    where: { id },
    include: {
      products: true,
      fandoms: true,
      pdpJoins: true,
      taxonomies: true,
      jrFindReplaceRejects: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 4. LIFECYCLE OPERATIONS (Soft Delete Support)
//==============================================================================

/**
 * Find active (non-deleted) locations
 */
export async function findActiveLocationsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Find soft-deleted locations
 */
export async function findDeletedLocationsOrm(additionalArgs?: Prisma.LocationFindManyArgs) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Soft delete a location (set deletedAt and deletedById)
 */
export async function softDeleteLocationOrm(id: string, deletedById: string) {
  try {
    return await prisma.location.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Location not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted location (clear deletedAt and deletedById)
 */
export async function restoreLocationOrm(id: string) {
  try {
    return await prisma.location.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Location not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find locations created after a specific date
 */
export async function findLocationsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
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
  return await prisma.location.findMany(args);
}

/**
 * Find locations updated after a specific date
 */
export async function findLocationsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
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
  return await prisma.location.findMany(args);
}

/**
 * Find recently created or updated locations within specified days
 */
export async function findRecentLocationsOrm(
  days: number = 7,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.LocationFindManyArgs = {
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
  return await prisma.location.findMany(args);
}

//==============================================================================
// 5. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find location by slug (leverages unique index)
 */
export async function findLocationBySlugOrm(slug: string) {
  return await prisma.location.findUnique({
    where: { slug },
  });
}

/**
 * Search locations by name (case-insensitive contains)
 */
export async function searchLocationsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.location.findMany(args);
}

/**
 * Search locations by name or copy content (case-insensitive)
 */
export async function searchLocationsOrm(
  searchTerm: string,
  additionalArgs?: Prisma.LocationFindManyArgs,
) {
  const args: Prisma.LocationFindManyArgs = {
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
        {
          copy: {
            string_contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.location.findMany(args);
}

//==============================================================================
// 6. TYPE EXPORTS
//==============================================================================

/**
 * Location with products relation
 */
export type LocationWithProducts = Prisma.LocationGetPayload<{
  include: { products: true };
}>;

/**
 * Location with fandoms relation
 */
export type LocationWithFandoms = Prisma.LocationGetPayload<{
  include: { fandoms: true };
}>;

/**
 * Location with pdpJoins relation
 */
export type LocationWithPdpJoins = Prisma.LocationGetPayload<{
  include: { pdpJoins: true };
}>;

/**
 * Location with taxonomies relation
 */
export type LocationWithTaxonomies = Prisma.LocationGetPayload<{
  include: { taxonomies: true };
}>;

/**
 * Location with jrFindReplaceRejects relation
 */
export type LocationWithJrFindReplaceRejects = Prisma.LocationGetPayload<{
  include: { jrFindReplaceRejects: true };
}>;

/**
 * Location with all relations for complete data access
 */
export type LocationWithAllRelations = Prisma.LocationGetPayload<{
  include: {
    products: true;
    fandoms: true;
    pdpJoins: true;
    taxonomies: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted location type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedLocation = Prisma.LocationGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Location search result type for optimized queries
 */
export type LocationSearchResult = Prisma.LocationGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    locationType: true;
    lodgingType: true;
    isFictional: true;
    _count: {
      select: {
        products: true;
        fandoms: true;
        pdpJoins: true;
        taxonomies: true;
        jrFindReplaceRejects: true;
      };
    };
  };
}>;
