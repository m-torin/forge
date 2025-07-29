'use server';

import type { ContentStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createProductCategoryOrm(args: Prisma.ProductCategoryCreateArgs) {
  try {
    return await prisma.productCategory.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstProductCategoryOrm(args?: Prisma.ProductCategoryFindFirstArgs) {
  return await prisma.productCategory.findFirst(args);
}

export async function findUniqueProductCategoryOrm(args: Prisma.ProductCategoryFindUniqueArgs) {
  return await prisma.productCategory.findUnique(args);
}

export async function findUniqueProductCategoryOrmOrThrow(
  args: Prisma.ProductCategoryFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.productCategory.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyProductCategoriesOrm(args?: Prisma.ProductCategoryFindManyArgs) {
  return await prisma.productCategory.findMany(args);
}

// UPDATE
export async function updateProductCategoryOrm(args: Prisma.ProductCategoryUpdateArgs) {
  try {
    return await prisma.productCategory.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyProductCategoriesOrm(args: Prisma.ProductCategoryUpdateManyArgs) {
  return await prisma.productCategory.updateMany(args);
}

// UPSERT
export async function upsertProductCategoryOrm(args: Prisma.ProductCategoryUpsertArgs) {
  try {
    return await prisma.productCategory.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteProductCategoryOrm(args: Prisma.ProductCategoryDeleteArgs) {
  try {
    return await prisma.productCategory.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyProductCategoriesOrm(args?: Prisma.ProductCategoryDeleteManyArgs) {
  return await prisma.productCategory.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductCategoriesOrm(args?: Prisma.ProductCategoryAggregateArgs) {
  return await prisma.productCategory.aggregate(args ?? {});
}

export async function countProductCategoriesOrm(args?: Prisma.ProductCategoryCountArgs) {
  return await prisma.productCategory.count(args);
}

export async function groupByProductCategoriesOrm(args: Prisma.ProductCategoryGroupByArgs) {
  return await prisma.productCategory.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find categories by status using ContentStatus enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findCategoriesByStatusOrm(
  status: ContentStatus,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find published categories
 */
export async function findPublishedCategoriesOrm(
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PUBLISHED',
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find draft categories
 */
export async function findDraftCategoriesOrm(additionalArgs?: Prisma.ProductCategoryFindManyArgs) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'DRAFT',
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find categories by specific display order
 */
export async function findCategoriesByDisplayOrderOrm(
  displayOrder: number,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayOrder: displayOrder,
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find categories within a display order range
 */
export async function findCategoriesByDisplayOrderRangeOrm(
  minOrder: number,
  maxOrder: number,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayOrder: {
        gte: minOrder,
        lte: maxOrder,
      },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.productCategory.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find child categories of a specific parent
 */
export async function findCategoriesByParentOrm(
  parentId: string,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find root categories (no parent)
 */
export async function findRootCategoriesOrm(additionalArgs?: Prisma.ProductCategoryFindManyArgs) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: null,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find leaf categories (categories with no children)
 */
export async function findLeafCategoriesOrm(additionalArgs?: Prisma.ProductCategoryFindManyArgs) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      children: {
        none: {},
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find category with all its children
 */
export async function findCategoryWithChildrenOrm(id: string) {
  return await prisma.productCategory.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/**
 * Find category hierarchy (children and descendants up to specified depth)
 */
export async function findCategoryHierarchyOrm(id: string, maxDepth: number = 3) {
  return await prisma.productCategory.findUnique({
    where: { id },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: maxDepth > 2,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
      parent: true,
    },
  });
}

/**
 * Update category display order for hierarchy management
 */
export async function updateCategoryDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.productCategory.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find categories that have associated products
 */
export async function findCategoriesWithProductsOrm(
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      products: {
        some: {},
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find categories that have associated collections
 */
export async function findCategoriesWithCollectionsOrm(
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collections: {
        some: {},
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find categories that have associated media
 */
export async function findCategoriesWithMediaOrm(
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find category with all relations included
 */
export async function findCategoryWithAllRelationsOrm(id: string) {
  return await prisma.productCategory.findUnique({
    where: { id },
    include: {
      products: true,
      collections: true,
      media: true,
      parent: true,
      children: { orderBy: { displayOrder: 'asc' } },
      deletedBy: true,
    },
  });
}

/**
 * Find category with products and hierarchy
 */
export async function findCategoryWithProductsAndHierarchyOrm(id: string) {
  return await prisma.productCategory.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          media: true,
          identifiers: true,
        },
      },
      parent: true,
      children: {
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) categories
 */
export async function findActiveCategoriesOrm(additionalArgs?: Prisma.ProductCategoryFindManyArgs) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Find soft-deleted categories
 */
export async function findDeletedCategoriesOrm(
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Soft delete a category (set deletedAt and deletedById)
 */
export async function softDeleteCategoryOrm(id: string, deletedById: string) {
  try {
    return await prisma.productCategory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted category (clear deletedAt and deletedById)
 */
export async function restoreCategoryOrm(id: string) {
  try {
    return await prisma.productCategory.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductCategory not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find categories created after a specific date
 */
export async function findCategoriesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
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
  return await prisma.productCategory.findMany(args);
}

/**
 * Find categories updated after a specific date
 */
export async function findCategoriesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
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
  return await prisma.productCategory.findMany(args);
}

/**
 * Find recently created or updated categories within specified days
 */
export async function findRecentCategoriesOrm(
  days: number = 7,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.ProductCategoryFindManyArgs = {
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
  return await prisma.productCategory.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find category by slug (leverages unique index)
 */
export async function findCategoryBySlugOrm(slug: string) {
  return await prisma.productCategory.findUnique({
    where: { slug },
  });
}

/**
 * Search categories by name (case-insensitive contains)
 */
export async function searchCategoriesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.productCategory.findMany(args);
}

/**
 * Search categories by name or copy content (case-insensitive)
 */
export async function searchCategoriesOrm(
  searchTerm: string,
  additionalArgs?: Prisma.ProductCategoryFindManyArgs,
) {
  const args: Prisma.ProductCategoryFindManyArgs = {
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
  return await prisma.productCategory.findMany(args);
}

/**
 * Find root categories with children count (optimized for category trees)
 */
export async function findRootCategoriesWithCountsOrm() {
  return await prisma.productCategory.findMany({
    where: {
      parentId: null,
      deletedAt: null,
    },
    include: {
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          displayOrder: true,
        },
        where: {
          deletedAt: null,
        },
        orderBy: { displayOrder: 'asc' },
      },
      _count: {
        select: {
          products: true,
          collections: true,
          children: true,
        },
      },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Category with products relation
 */
export type CategoryWithProducts = Prisma.ProductCategoryGetPayload<{
  include: { products: true };
}>;

/**
 * Category with collections relation
 */
export type CategoryWithCollections = Prisma.ProductCategoryGetPayload<{
  include: { collections: true };
}>;

/**
 * Category with media relation
 */
export type CategoryWithMedia = Prisma.ProductCategoryGetPayload<{
  include: { media: true };
}>;

/**
 * Category with children relation
 */
export type CategoryWithChildren = Prisma.ProductCategoryGetPayload<{
  include: { children: true };
}>;

/**
 * Category with parent relation
 */
export type CategoryWithParent = Prisma.ProductCategoryGetPayload<{
  include: { parent: true };
}>;

/**
 * Category with full hierarchy
 */
export type CategoryWithHierarchy = Prisma.ProductCategoryGetPayload<{
  include: {
    children: {
      include: {
        children: {
          include: {
            children: true;
          };
        };
      };
    };
    parent: true;
  };
}>;

/**
 * Category with products and hierarchy for complete view
 */
export type CategoryWithProductsAndHierarchy = Prisma.ProductCategoryGetPayload<{
  include: {
    products: {
      include: {
        media: true;
        identifiers: true;
      };
    };
    parent: true;
    children: {
      include: {
        _count: {
          select: {
            products: true;
          };
        };
      };
    };
  };
}>;

/**
 * Category with all relations for complete data access
 */
export type CategoryWithAllRelations = Prisma.ProductCategoryGetPayload<{
  include: {
    products: true;
    collections: true;
    media: true;
    parent: true;
    children: true;
    deletedBy: true;
  };
}>;

/**
 * Root category with children count
 */
export type RootCategoryWithCounts = Prisma.ProductCategoryGetPayload<{
  include: {
    children: {
      select: {
        id: true;
        name: true;
        slug: true;
        status: true;
        displayOrder: true;
      };
    };
    _count: {
      select: {
        products: true;
        collections: true;
        children: true;
      };
    };
  };
}>;

/**
 * Deleted category type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedCategory = Prisma.ProductCategoryGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Category search result type for optimized queries
 */
export type CategorySearchResult = Prisma.ProductCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    status: true;
    displayOrder: true;
    parentId: true;
    _count: {
      select: {
        products: true;
        collections: true;
        children: true;
        media: true;
      };
    };
  };
}>;

/**
 * Category hierarchy path result for breadcrumb generation
 */
export type CategoryHierarchyPath = Prisma.ProductCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    parent: {
      select: {
        id: true;
        name: true;
        slug: true;
        parent: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
      };
    };
  };
}>;
