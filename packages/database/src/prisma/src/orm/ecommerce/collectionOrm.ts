'use server';

import type { CollectionType, ContentStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createCollectionOrm(args: Prisma.CollectionCreateArgs) {
  try {
    return await prisma.collection.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstCollectionOrm(args?: Prisma.CollectionFindFirstArgs) {
  return await prisma.collection.findFirst(args);
}

export async function findUniqueCollectionOrm(args: Prisma.CollectionFindUniqueArgs) {
  return await prisma.collection.findUnique(args);
}

export async function findUniqueCollectionOrmOrThrow(args: Prisma.CollectionFindUniqueOrThrowArgs) {
  try {
    return await prisma.collection.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Collection not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyCollectionsOrm(args?: Prisma.CollectionFindManyArgs) {
  return await prisma.collection.findMany(args);
}

// UPDATE
export async function updateCollectionOrm(args: Prisma.CollectionUpdateArgs) {
  try {
    return await prisma.collection.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Collection not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyCollectionsOrm(
  args: Prisma.CollectionUpdateManyArgs,
): Promise<Prisma.BatchPayload> {
  return await prisma.collection.updateMany(args);
}

// UPSERT
export async function upsertCollectionOrm(args: Prisma.CollectionUpsertArgs) {
  try {
    return await prisma.collection.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteCollectionOrm(args: Prisma.CollectionDeleteArgs) {
  try {
    return await prisma.collection.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Collection not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyCollectionsOrm(
  args?: Prisma.CollectionDeleteManyArgs,
): Promise<Prisma.BatchPayload> {
  return await prisma.collection.deleteMany(args);
}

// AGGREGATE
export async function aggregateCollectionsOrm(args?: Prisma.CollectionAggregateArgs) {
  return await prisma.collection.aggregate(args ?? {});
}

export async function countCollectionsOrm(args?: Prisma.CollectionCountArgs): Promise<number> {
  return await prisma.collection.count(args);
}

export async function groupByCollectionsOrm(args: Prisma.CollectionGroupByArgs) {
  return await prisma.collection.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find collections by type using CollectionType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findCollectionsByTypeOrm(
  collectionType: CollectionType,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: collectionType,
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections by status using ContentStatus enum
 */
export async function findCollectionsByStatusOrm(
  status: ContentStatus,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections by user (owner)
 */
export async function findCollectionsByUserOrm(
  userId: string,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections by both type and status
 */
export async function findCollectionsByTypeAndStatusOrm(
  collectionType: CollectionType,
  status: ContentStatus,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: collectionType,
      status: status,
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find public collections (not tied to a specific user)
 */
export async function findPublicCollectionsOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: null,
    },
  };
  return await prisma.collection.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find child collections of a specific parent
 */
export async function findCollectionsByParentOrm(
  parentId: string,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find root collections (no parent)
 */
export async function findRootCollectionsOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: null,
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collection with all its children
 */
export async function findCollectionWithChildrenOrm(id: string) {
  return await prisma.collection.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { name: 'asc' },
      },
    },
  });
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find collections that have associated products
 */
export async function findCollectionsWithProductsOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have associated brands
 */
export async function findCollectionsWithBrandsOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brands: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have taxonomies
 */
export async function findCollectionsWithTaxonomiesOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      taxonomies: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have product categories
 */
export async function findCollectionsWithCategoriesOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      categories: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have PDP joins
 */
export async function findCollectionsWithPdpJoinsOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpJoins: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have media attachments
 */
export async function findCollectionsWithMediaOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have product identifiers
 */
export async function findCollectionsWithIdentifiersOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      identifiers: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have favorites
 */
export async function findCollectionsWithFavoritesOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      favorites: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections that have registries
 */
export async function findCollectionsWithRegistriesOrm(
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registries: {
        some: {},
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collections with user relation (different from findCollectionsByUserOrm)
 * This finds collections that have a user assigned, regardless of which user
 */
export async function findCollectionsWithUserOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      user: {
        isNot: null,
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find collection with all relations included
 */
export async function findCollectionWithAllRelationsOrm(id: string) {
  return await prisma.collection.findUnique({
    where: { id },
    include: {
      user: true,
      parent: true,
      children: { orderBy: { name: 'asc' } },
      products: true,
      brands: true,
      taxonomies: true,
      categories: true,
      pdpJoins: true,
      media: true,
      favorites: true,
      registries: true,
      identifiers: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) collections
 */
export async function findActiveCollectionsOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Find soft-deleted collections
 */
export async function findDeletedCollectionsOrm(additionalArgs?: Prisma.CollectionFindManyArgs) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.collection.findMany(args);
}

/**
 * Soft delete a collection (set deletedAt and deletedById)
 */
export async function softDeleteCollectionOrm(id: string, deletedById: string) {
  try {
    return await prisma.collection.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Collection not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted collection (clear deletedAt and deletedById)
 */
export async function restoreCollectionOrm(id: string) {
  try {
    return await prisma.collection.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Collection not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find collections created after a specific date
 */
export async function findCollectionsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
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
  return await prisma.collection.findMany(args);
}

/**
 * Find collections updated after a specific date
 */
export async function findCollectionsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
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
  return await prisma.collection.findMany(args);
}

/**
 * Find recently created or updated collections within specified days
 */
export async function findRecentCollectionsOrm(
  days: number = 7,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.CollectionFindManyArgs = {
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
  return await prisma.collection.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find collection by slug (leverages unique index)
 */
export async function findCollectionBySlugOrm(slug: string) {
  return await prisma.collection.findUnique({
    where: { slug },
  });
}

/**
 * Search collections by name (case-insensitive contains)
 */
export async function searchCollectionsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.CollectionFindManyArgs,
) {
  const args: Prisma.CollectionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.collection.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Collection with products relation
 */
export type CollectionWithProducts = Prisma.CollectionGetPayload<{
  include: { products: true };
}>;

/**
 * Collection with brands relation
 */
export type CollectionWithBrands = Prisma.CollectionGetPayload<{
  include: { brands: true };
}>;

/**
 * Collection with taxonomies relation
 */
export type CollectionWithTaxonomies = Prisma.CollectionGetPayload<{
  include: { taxonomies: true };
}>;

/**
 * Collection with categories relation
 */
export type CollectionWithCategories = Prisma.CollectionGetPayload<{
  include: { categories: true };
}>;

/**
 * Collection with PDP joins relation
 */
export type CollectionWithPdpJoins = Prisma.CollectionGetPayload<{
  include: { pdpJoins: true };
}>;

/**
 * Collection with media relation
 */
export type CollectionWithMedia = Prisma.CollectionGetPayload<{
  include: { media: true };
}>;

/**
 * Collection with identifiers relation
 */
export type CollectionWithIdentifiers = Prisma.CollectionGetPayload<{
  include: { identifiers: true };
}>;

/**
 * Collection with favorites relation
 */
export type CollectionWithFavorites = Prisma.CollectionGetPayload<{
  include: { favorites: true };
}>;

/**
 * Collection with registries relation
 */
export type CollectionWithRegistries = Prisma.CollectionGetPayload<{
  include: { registries: true };
}>;

/**
 * Collection with all relations for complete data access
 */
export type CollectionWithAllRelations = Prisma.CollectionGetPayload<{
  include: {
    user: true;
    parent: true;
    children: true;
    products: true;
    brands: true;
    taxonomies: true;
    categories: true;
    pdpJoins: true;
    media: true;
    favorites: true;
    registries: true;
    identifiers: true;
    deletedBy: true;
  };
}>;

/**
 * Collection hierarchy result type
 */
export type CollectionWithChildren = Prisma.CollectionGetPayload<{
  include: {
    children: true;
  };
}>;

/**
 * Collection with user relation
 */
export type CollectionWithUser = Prisma.CollectionGetPayload<{
  include: { user: true };
}>;

/**
 * Deleted collection type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedCollection = Prisma.CollectionGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Collection search result type for optimized queries
 */
export type CollectionSearchResult = Prisma.CollectionGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    type: true;
    status: true;
    _count: {
      select: {
        products: true;
        brands: true;
        children: true;
      };
    };
  };
}>;
