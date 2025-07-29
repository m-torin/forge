'use server';

import type { MediaType, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createMediaOrm(args: Prisma.MediaCreateArgs) {
  try {
    return await prisma.media.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstMediaOrm(args?: Prisma.MediaFindFirstArgs) {
  return await prisma.media.findFirst(args);
}

export async function findUniqueMediaOrm(args: Prisma.MediaFindUniqueArgs) {
  return await prisma.media.findUnique(args);
}

export async function findUniqueMediaOrmOrThrow(args: Prisma.MediaFindUniqueOrThrowArgs) {
  try {
    return await prisma.media.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Media not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyMediaOrm(args?: Prisma.MediaFindManyArgs) {
  return await prisma.media.findMany(args);
}

// UPDATE
export async function updateMediaOrm(args: Prisma.MediaUpdateArgs) {
  try {
    return await prisma.media.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Media not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyMediaOrm(args: Prisma.MediaUpdateManyArgs) {
  return await prisma.media.updateMany(args);
}

// UPSERT
export async function upsertMediaOrm(args: Prisma.MediaUpsertArgs) {
  try {
    return await prisma.media.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteMediaOrm(args: Prisma.MediaDeleteArgs) {
  try {
    return await prisma.media.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Media not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyMediaOrm(args?: Prisma.MediaDeleteManyArgs) {
  return await prisma.media.deleteMany(args);
}

// AGGREGATE
export async function aggregateMediaOrm(args?: Prisma.MediaAggregateArgs) {
  return await prisma.media.aggregate(args ?? {});
}

export async function countMediaOrm(args?: Prisma.MediaCountArgs) {
  return await prisma.media.count(args);
}

export async function groupByMediaOrm(args: Prisma.MediaGroupByArgs) {
  return await prisma.media.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find media by type using MediaType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findMediaByTypeOrm(
  type: MediaType,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have altText set (not null)
 */
export async function findMediaWithAltTextOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      altText: {
        not: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that don't have altText (null)
 */
export async function findMediaWithoutAltTextOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      altText: null,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media by MIME type
 */
export async function findMediaByMimeTypeOrm(
  mimeType: string,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      mimeType: mimeType,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media by size range
 */
export async function findMediaBySizeRangeOrm(
  minSize: number,
  maxSize: number,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      size: {
        gte: minSize,
        lte: maxSize,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media uploaded by a specific user
 */
export async function findMediaByUserOrm(
  userId: string,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media by sort order
 */
export async function findMediaBySortOrderOrm(
  sortOrder: number,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      sortOrder: sortOrder,
    },
  };
  return await prisma.media.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Media model does not have hierarchical relationships (no parent/child structure)
// This section is intentionally empty

//==============================================================================
// 4. RELATIONSHIP QUERIES (Polymorphic)
//==============================================================================

/**
 * Find media by entity type (polymorphic)
 */
export async function findMediaByEntityTypeOrm(
  entityType:
    | 'article'
    | 'brand'
    | 'collection'
    | 'product'
    | 'taxonomy'
    | 'category'
    | 'pdpJoin'
    | 'review',
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const whereClause = {
    [`${entityType}Id`]: { not: null },
  };

  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      ...whereClause,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated user
 */
export async function findMediaWithUserOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      user: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated article
 */
export async function findMediaWithArticleOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      article: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated brand
 */
export async function findMediaWithBrandOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brand: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated collection
 */
export async function findMediaWithCollectionOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collection: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated product
 */
export async function findMediaWithProductOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      product: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated taxonomy
 */
export async function findMediaWithTaxonomyOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      taxonomy: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated category
 */
export async function findMediaWithCategoryOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      category: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated pdpJoin
 */
export async function findMediaWithPdpJoinOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      pdpJoin: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media that have associated review
 */
export async function findMediaWithReviewOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      review: {
        isNot: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find orphaned media (not attached to any entity)
 */
export async function findOrphanedMediaOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      AND: [
        { articleId: null },
        { brandId: null },
        { collectionId: null },
        { productId: null },
        { taxonomyId: null },
        { categoryId: null },
        { pdpJoinId: null },
        { reviewId: null },
      ],
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media with all relations included
 */
export async function findMediaWithAllRelationsOrm(id: string) {
  return await prisma.media.findUnique({
    where: { id },
    include: {
      user: true,
      article: true,
      brand: true,
      collection: true,
      product: true,
      taxonomy: true,
      category: true,
      pdpJoin: true,
      review: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) media
 */
export async function findActiveMediaOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find soft-deleted media
 */
export async function findDeletedMediaOrm(additionalArgs?: Prisma.MediaFindManyArgs) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Soft delete media (set deletedAt and deletedById)
 */
export async function softDeleteMediaOrm(id: string, deletedById: string) {
  try {
    return await prisma.media.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Media not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted media (clear deletedAt and deletedById)
 */
export async function restoreMediaOrm(id: string) {
  try {
    return await prisma.media.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Media not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find media created after a specific date
 */
export async function findMediaCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
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
  return await prisma.media.findMany(args);
}

/**
 * Find media updated after a specific date
 */
export async function findMediaUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
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
  return await prisma.media.findMany(args);
}

/**
 * Find recently created or updated media within specified days
 */
export async function findRecentMediaOrm(
  days: number = 7,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.MediaFindManyArgs = {
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
  return await prisma.media.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find media by URL
 */
export async function findMediaByUrlOrm(url: string) {
  return await prisma.media.findFirst({
    where: { url },
  });
}

/**
 * Search media by alt text (case-insensitive contains)
 */
export async function searchMediaByAltTextOrm(
  searchTerm: string,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      altText: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.media.findMany(args);
}

/**
 * Find media by specific entity and entity ID
 */
export async function findMediaByEntityOrm(
  entityId: string,
  entityType:
    | 'article'
    | 'brand'
    | 'collection'
    | 'product'
    | 'taxonomy'
    | 'category'
    | 'pdpJoin'
    | 'review',
) {
  const whereClause = {
    [`${entityType}Id`]: entityId,
  };

  return await prisma.media.findMany({
    where: whereClause,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

/**
 * Search media across multiple fields
 */
export async function searchMediaOrm(
  searchTerm: string,
  additionalArgs?: Prisma.MediaFindManyArgs,
) {
  const args: Prisma.MediaFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          altText: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          url: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          mimeType: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.media.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Media with user relation
 */
export type MediaWithUser = Prisma.MediaGetPayload<{
  include: { user: true };
}>;

/**
 * Media with article relation
 */
export type MediaWithArticle = Prisma.MediaGetPayload<{
  include: { article: true };
}>;

/**
 * Media with brand relation
 */
export type MediaWithBrand = Prisma.MediaGetPayload<{
  include: { brand: true };
}>;

/**
 * Media with collection relation
 */
export type MediaWithCollection = Prisma.MediaGetPayload<{
  include: { collection: true };
}>;

/**
 * Media with product relation
 */
export type MediaWithProduct = Prisma.MediaGetPayload<{
  include: { product: true };
}>;

/**
 * Media with taxonomy relation
 */
export type MediaWithTaxonomy = Prisma.MediaGetPayload<{
  include: { taxonomy: true };
}>;

/**
 * Media with category relation
 */
export type MediaWithCategory = Prisma.MediaGetPayload<{
  include: { category: true };
}>;

/**
 * Media with pdpJoin relation
 */
export type MediaWithPdpJoin = Prisma.MediaGetPayload<{
  include: { pdpJoin: true };
}>;

/**
 * Media with review relation
 */
export type MediaWithReview = Prisma.MediaGetPayload<{
  include: { review: true };
}>;

/**
 * Media with all relations for complete data access (polymorphic)
 */
export type MediaWithAllRelations = Prisma.MediaGetPayload<{
  include: {
    user: true;
    article: true;
    brand: true;
    collection: true;
    product: true;
    taxonomy: true;
    category: true;
    pdpJoin: true;
    review: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted media type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedMedia = Prisma.MediaGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Media search result type for optimized queries
 */
export type MediaSearchResult = Prisma.MediaGetPayload<{
  select: {
    id: true;
    url: true;
    altText: true;
    type: true;
    width: true;
    height: true;
    size: true;
    mimeType: true;
    sortOrder: true;
    createdAt: true;
    updatedAt: true;
    // Entity relationship indicators
    articleId: true;
    brandId: true;
    collectionId: true;
    productId: true;
    taxonomyId: true;
    categoryId: true;
    pdpJoinId: true;
    reviewId: true;
    userId: true;
  };
}>;
