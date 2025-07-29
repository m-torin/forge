'use server';

import type { BrandType, ContentStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createBrandOrm(args: Prisma.BrandCreateArgs) {
  try {
    return await prisma.brand.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstBrandOrm(args?: Prisma.BrandFindFirstArgs) {
  return await prisma.brand.findFirst(args);
}

export async function findUniqueBrandOrm(args: Prisma.BrandFindUniqueArgs) {
  return await prisma.brand.findUnique(args);
}

export async function findUniqueBrandOrmOrThrow(args: Prisma.BrandFindUniqueOrThrowArgs) {
  try {
    return await prisma.brand.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyBrandsOrm(args?: Prisma.BrandFindManyArgs) {
  return await prisma.brand.findMany(args);
}

// UPDATE
export async function updateBrandOrm(args: Prisma.BrandUpdateArgs) {
  try {
    return await prisma.brand.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyBrandsOrm(args: Prisma.BrandUpdateManyArgs) {
  return await prisma.brand.updateMany(args);
}

// UPSERT
export async function upsertBrandOrm(args: Prisma.BrandUpsertArgs) {
  try {
    return await prisma.brand.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteBrandOrm(args: Prisma.BrandDeleteArgs) {
  try {
    return await prisma.brand.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyBrandsOrm(args?: Prisma.BrandDeleteManyArgs) {
  return await prisma.brand.deleteMany(args);
}

// AGGREGATE
export async function aggregateBrandsOrm(args?: Prisma.BrandAggregateArgs) {
  return await prisma.brand.aggregate(args ?? {});
}

export async function countBrandsOrm(args?: Prisma.BrandCountArgs) {
  return await prisma.brand.count(args);
}

export async function groupByBrandsOrm(args: Prisma.BrandGroupByArgs) {
  return await prisma.brand.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find brands by type using BrandType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findBrandsByTypeOrm(
  brandType: BrandType,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: brandType,
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands by status using ContentStatus enum
 */
export async function findBrandsByStatusOrm(
  status: ContentStatus,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands by both type and status
 */
export async function findBrandsByTypeAndStatusOrm(
  brandType: BrandType,
  status: ContentStatus,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: brandType,
      status: status,
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands by specific base URL
 */
export async function findBrandsByBaseUrlOrm(
  baseUrl: string,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      baseUrl: baseUrl,
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that have a baseUrl set (not null)
 */
export async function findBrandsWithBaseUrlOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      baseUrl: {
        not: null,
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that don't have a baseUrl (null)
 */
export async function findBrandsWithoutBaseUrlOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      baseUrl: null,
    },
  };
  return await prisma.brand.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find child brands of a specific parent
 */
export async function findBrandsByParentOrm(
  parentId: string,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find root brands (no parent)
 */
export async function findRootBrandsOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: null,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brand with all its children
 */
export async function findBrandWithChildrenOrm(id: string) {
  return await prisma.brand.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/**
 * Update brand display order for hierarchy management
 */
export async function updateBrandDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.brand.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find brands that have PdpJoin products
 */
export async function findBrandsWithProductsOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that have collections
 */
export async function findBrandsWithCollectionsOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collections: {
        some: {},
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that have media attachments
 */
export async function findBrandsWithMediaOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that have product identifiers
 */
export async function findBrandsWithIdentifiersOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      identifiers: {
        some: {},
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brands that have JollyRoger configuration
 */
export async function findBrandsWithJollyRogerOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      jollyRoger: {
        isNot: null,
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find brand with all relations included
 */
export async function findBrandWithAllRelationsOrm(id: string) {
  return await prisma.brand.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { orderBy: { displayOrder: 'asc' } },
      products: true,
      collections: true,
      media: true,
      jollyRoger: true,
      identifiers: true,
      manufacturedProducts: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) brands
 */
export async function findActiveBrandsOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Find soft-deleted brands
 */
export async function findDeletedBrandsOrm(additionalArgs?: Prisma.BrandFindManyArgs) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.brand.findMany(args);
}

/**
 * Soft delete a brand (set deletedAt and deletedById)
 */
export async function softDeleteBrandOrm(id: string, deletedById: string) {
  try {
    return await prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted brand (clear deletedAt and deletedById)
 */
export async function restoreBrandOrm(id: string) {
  try {
    return await prisma.brand.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Brand not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find brands created after a specific date
 */
export async function findBrandsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
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
  return await prisma.brand.findMany(args);
}

/**
 * Find brands updated after a specific date
 */
export async function findBrandsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
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
  return await prisma.brand.findMany(args);
}

/**
 * Find recently created or updated brands within specified days
 */
export async function findRecentBrandsOrm(
  days: number = 7,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.BrandFindManyArgs = {
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
  return await prisma.brand.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find brand by slug (leverages unique index)
 */
export async function findBrandBySlugOrm(slug: string) {
  return await prisma.brand.findUnique({
    where: { slug },
  });
}

/**
 * Search brands by name (case-insensitive contains)
 */
export async function searchBrandsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.BrandFindManyArgs,
) {
  const args: Prisma.BrandFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.brand.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Brand with products relation
 */
export type BrandWithProducts = Prisma.BrandGetPayload<{
  include: { products: true };
}>;

/**
 * Brand with collections relation
 */
export type BrandWithCollections = Prisma.BrandGetPayload<{
  include: { collections: true };
}>;

/**
 * Brand with JollyRoger configuration
 */
export type BrandWithJollyRoger = Prisma.BrandGetPayload<{
  include: { jollyRoger: true };
}>;

/**
 * Brand with all relations for complete data access
 */
export type BrandWithAllRelations = Prisma.BrandGetPayload<{
  include: {
    parent: true;
    children: true;
    products: true;
    collections: true;
    media: true;
    jollyRoger: true;
    identifiers: true;
    manufacturedProducts: true;
    deletedBy: true;
  };
}>;

/**
 * Brand hierarchy result type
 */
export type BrandWithChildren = Prisma.BrandGetPayload<{
  include: {
    children: true;
  };
}>;

/**
 * Brand with media relations
 */
export type BrandWithMedia = Prisma.BrandGetPayload<{
  include: { media: true };
}>;

/**
 * Brand with identifiers relations
 */
export type BrandWithIdentifiers = Prisma.BrandGetPayload<{
  include: { identifiers: true };
}>;

/**
 * Deleted brand type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedBrand = Prisma.BrandGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Brand with manufactured products relation
 */
export type BrandWithManufacturedProducts = Prisma.BrandGetPayload<{
  include: { manufacturedProducts: true };
}>;

/**
 * Brand search result type for optimized queries
 */
export type BrandSearchResult = Prisma.BrandGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    type: true;
    status: true;
    _count: {
      select: {
        products: true;
        collections: true;
        children: true;
      };
    };
  };
}>;
