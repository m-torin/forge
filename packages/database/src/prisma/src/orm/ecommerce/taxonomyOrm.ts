'use server';

import type { ContentStatus, Prisma, TaxonomyType } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTaxonomyOrm(args: Prisma.TaxonomyCreateArgs) {
  try {
    return await prisma.taxonomy.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstTaxonomyOrm(args?: Prisma.TaxonomyFindFirstArgs) {
  return await prisma.taxonomy.findFirst(args);
}

export async function findUniqueTaxonomyOrm(args: Prisma.TaxonomyFindUniqueArgs) {
  return await prisma.taxonomy.findUnique(args);
}

export async function findUniqueTaxonomyOrmOrThrow(args: Prisma.TaxonomyFindUniqueOrThrowArgs) {
  try {
    return await prisma.taxonomy.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyTaxonomiesOrm(args?: Prisma.TaxonomyFindManyArgs) {
  return await prisma.taxonomy.findMany(args);
}

// UPDATE
export async function updateTaxonomyOrm(args: Prisma.TaxonomyUpdateArgs) {
  try {
    return await prisma.taxonomy.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyTaxonomiesOrm(args: Prisma.TaxonomyUpdateManyArgs) {
  return await prisma.taxonomy.updateMany(args);
}

// UPSERT
export async function upsertTaxonomyOrm(args: Prisma.TaxonomyUpsertArgs) {
  try {
    return await prisma.taxonomy.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteTaxonomyOrm(args: Prisma.TaxonomyDeleteArgs) {
  try {
    return await prisma.taxonomy.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyTaxonomiesOrm(args?: Prisma.TaxonomyDeleteManyArgs) {
  return await prisma.taxonomy.deleteMany(args);
}

// AGGREGATE
export async function aggregateTaxonomiesOrm(args?: Prisma.TaxonomyAggregateArgs) {
  return await prisma.taxonomy.aggregate(args ?? {});
}

export async function countTaxonomiesOrm(args?: Prisma.TaxonomyCountArgs) {
  return await prisma.taxonomy.count(args);
}

export async function groupByTaxonomiesOrm(args: Prisma.TaxonomyGroupByArgs) {
  return await prisma.taxonomy.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find taxonomies by type using TaxonomyType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findTaxonomiesByTypeOrm(
  taxonomyType: TaxonomyType,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: taxonomyType,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by status using ContentStatus enum
 */
export async function findTaxonomiesByStatusOrm(
  status: ContentStatus,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by both type and status
 */
export async function findTaxonomiesByTypeAndStatusOrm(
  taxonomyType: TaxonomyType,
  status: ContentStatus,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: taxonomyType,
      status: status,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by display order
 */
export async function findTaxonomiesByDisplayOrderOrm(
  displayOrder: number,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayOrder: displayOrder,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by level
 */
export async function findTaxonomiesByLevelOrm(
  level: number,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      level: level,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have a path set (not null)
 */
export async function findTaxonomiesWithPathOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      path: {
        not: null,
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that don't have a path (null)
 */
export async function findTaxonomiesWithoutPathOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      path: null,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by specific path
 */
export async function findTaxonomiesByPathOrm(
  path: string,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      path: path,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find child taxonomies of a specific parent
 */
export async function findTaxonomiesByParentOrm(
  parentId: string,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find root taxonomies (no parent)
 */
export async function findRootTaxonomiesOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: null,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomy with all its children
 */
export async function findTaxonomyWithChildrenOrm(id: string) {
  return await prisma.taxonomy.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/**
 * Find taxonomy with parent and children relationships
 */
export async function findTaxonomyWithHierarchyOrm(id: string) {
  return await prisma.taxonomy.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          path: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          level: true,
          displayOrder: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });
}

/**
 * Update taxonomy display order for hierarchy management
 */
export async function updateTaxonomyDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.taxonomy.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update taxonomy level
 */
export async function updateTaxonomyLevelOrm(id: string, level: number) {
  try {
    return await prisma.taxonomy.update({
      where: { id },
      data: { level },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for level update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update taxonomy path
 */
export async function updateTaxonomyPathOrm(id: string, path: string | null) {
  try {
    return await prisma.taxonomy.update({
      where: { id },
      data: { path },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for path update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find taxonomies that have associated products
 */
export async function findTaxonomiesWithProductsOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have associated collections
 */
export async function findTaxonomiesWithCollectionsOrm(
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collections: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have associated pdpJoins
 */
export async function findTaxonomiesWithPdpJoinsOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpJoins: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have associated locations
 */
export async function findTaxonomiesWithLocationsOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locations: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have associated media
 */
export async function findTaxonomiesWithMediaOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have associated jrFindReplaceRejects
 */
export async function findTaxonomiesWithJrFindReplaceRejectsOrm(
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jrFindReplaceRejects: {
        some: {},
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies that have a parent relationship
 */
export async function findTaxonomiesWithParentOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parent: {
        isNot: null,
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomy with all relations included
 */
export async function findTaxonomyWithAllRelationsOrm(id: string) {
  return await prisma.taxonomy.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { orderBy: { displayOrder: 'asc' } },
      products: true,
      collections: true,
      pdpJoins: true,
      locations: true,
      media: true,
      jrFindReplaceRejects: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) taxonomies
 */
export async function findActiveTaxonomiesOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find soft-deleted taxonomies
 */
export async function findDeletedTaxonomiesOrm(additionalArgs?: Prisma.TaxonomyFindManyArgs) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Soft delete a taxonomy (set deletedAt and deletedById)
 */
export async function softDeleteTaxonomyOrm(id: string, deletedById: string) {
  try {
    return await prisma.taxonomy.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted taxonomy (clear deletedAt and deletedById)
 */
export async function restoreTaxonomyOrm(id: string) {
  try {
    return await prisma.taxonomy.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Taxonomy not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find taxonomies created after a specific date
 */
export async function findTaxonomiesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
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
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies updated after a specific date
 */
export async function findTaxonomiesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
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
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find recently created or updated taxonomies within specified days
 */
export async function findRecentTaxonomiesOrm(
  days: number = 7,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.TaxonomyFindManyArgs = {
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
  return await prisma.taxonomy.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find taxonomy by slug (leverages unique index)
 */
export async function findTaxonomyBySlugOrm(slug: string) {
  return await prisma.taxonomy.findUnique({
    where: { slug },
  });
}

/**
 * Search taxonomies by name (case-insensitive contains)
 */
export async function searchTaxonomiesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Find taxonomies by parent ID (leverages parentId index)
 */
export async function findTaxonomiesByParentIdOrm(
  parentId: string,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.taxonomy.findMany(args);
}

/**
 * Search taxonomies by name and type with hierarchy context
 */
export async function searchTaxonomiesOrm(
  searchTerm: string,
  type?: TaxonomyType,
  additionalArgs?: Prisma.TaxonomyFindManyArgs,
) {
  const whereConditions: Prisma.TaxonomyWhereInput = {
    OR: [
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        path: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ],
  };

  if (type) {
    whereConditions.type = type;
  }

  const args: Prisma.TaxonomyFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      ...whereConditions,
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.taxonomy.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Taxonomy with products relation
 */
export type TaxonomyWithProducts = Prisma.TaxonomyGetPayload<{
  include: { products: true };
}>;

/**
 * Taxonomy with collections relation
 */
export type TaxonomyWithCollections = Prisma.TaxonomyGetPayload<{
  include: { collections: true };
}>;

/**
 * Taxonomy with pdpJoins relation
 */
export type TaxonomyWithPdpJoins = Prisma.TaxonomyGetPayload<{
  include: { pdpJoins: true };
}>;

/**
 * Taxonomy with locations relation
 */
export type TaxonomyWithLocations = Prisma.TaxonomyGetPayload<{
  include: { locations: true };
}>;

/**
 * Taxonomy with media relation
 */
export type TaxonomyWithMedia = Prisma.TaxonomyGetPayload<{
  include: { media: true };
}>;

/**
 * Taxonomy with jrFindReplaceRejects relation
 */
export type TaxonomyWithJrFindReplaceRejects = Prisma.TaxonomyGetPayload<{
  include: { jrFindReplaceRejects: true };
}>;

/**
 * Taxonomy with all relations for complete data access
 */
export type TaxonomyWithAllRelations = Prisma.TaxonomyGetPayload<{
  include: {
    parent: true;
    children: true;
    products: true;
    collections: true;
    pdpJoins: true;
    locations: true;
    media: true;
    jrFindReplaceRejects: true;
    deletedBy: true;
  };
}>;

/**
 * Taxonomy hierarchy result type
 */
export type TaxonomyWithChildren = Prisma.TaxonomyGetPayload<{
  include: {
    children: true;
  };
}>;

/**
 * Taxonomy with complete hierarchy relationships
 */
export type TaxonomyWithHierarchy = Prisma.TaxonomyGetPayload<{
  include: {
    parent: {
      select: {
        id: true;
        name: true;
        slug: true;
        type: true;
        path: true;
      };
    };
    children: {
      select: {
        id: true;
        name: true;
        slug: true;
        type: true;
        level: true;
        displayOrder: true;
      };
      orderBy: {
        displayOrder: 'asc';
      };
    };
  };
}>;

/**
 * Deleted taxonomy type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedTaxonomy = Prisma.TaxonomyGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Taxonomy search result type for optimized queries
 */
export type TaxonomySearchResult = Prisma.TaxonomyGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    type: true;
    status: true;
    level: true;
    path: true;
    displayOrder: true;
    _count: {
      select: {
        children: true;
        products: true;
        collections: true;
        locations: true;
        media: true;
      };
    };
  };
}>;

/**
 * Root taxonomy with children preview and counts
 */
export type RootTaxonomyWithCounts = Prisma.TaxonomyGetPayload<{
  include: {
    _count: {
      select: {
        children: true;
        products: true;
        collections: true;
        locations: true;
      };
    };
    children: {
      select: {
        id: true;
        name: true;
        slug: true;
        type: true;
      };
      take: 3;
      orderBy: {
        displayOrder: 'asc';
      };
    };
  };
}>;
