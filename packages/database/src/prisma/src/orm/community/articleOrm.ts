'use server';

import type { ContentStatus, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new article
 */
export async function createArticleOrm(args: Prisma.ArticleCreateArgs) {
  try {
    return await prisma.article.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first article matching criteria
 */
export async function findFirstArticleOrm(args?: Prisma.ArticleFindFirstArgs) {
  return await prisma.article.findFirst(args);
}

/**
 * Find unique article by ID or slug
 */
export async function findUniqueArticleOrm(args: Prisma.ArticleFindUniqueArgs) {
  return await prisma.article.findUnique(args);
}

/**
 * Find unique article or throw error if not found
 */
export async function findUniqueArticleOrmOrThrow(args: Prisma.ArticleFindUniqueOrThrowArgs) {
  try {
    return await prisma.article.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Article not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many articles with optional filtering
 */
export async function findManyArticlesOrm(args?: Prisma.ArticleFindManyArgs) {
  return await prisma.article.findMany(args);
}

/**
 * Update an existing article
 */
export async function updateArticleOrm(args: Prisma.ArticleUpdateArgs) {
  try {
    return await prisma.article.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Article not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many articles matching criteria
 */
export async function updateManyArticlesOrm(args: Prisma.ArticleUpdateManyArgs) {
  return await prisma.article.updateMany(args);
}

/**
 * Create or update article (upsert)
 */
export async function upsertArticleOrm(args: Prisma.ArticleUpsertArgs) {
  try {
    return await prisma.article.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete an article
 */
export async function deleteArticleOrm(args: Prisma.ArticleDeleteArgs) {
  try {
    return await prisma.article.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Article not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many articles matching criteria
 */
export async function deleteManyArticlesOrm(args?: Prisma.ArticleDeleteManyArgs) {
  return await prisma.article.deleteMany(args);
}

/**
 * Aggregate article data
 */
export async function aggregateArticlesOrm(args?: Prisma.ArticleAggregateArgs) {
  return await prisma.article.aggregate(args ?? {});
}

/**
 * Count articles matching criteria
 */
export async function countArticlesOrm(args?: Prisma.ArticleCountArgs) {
  return await prisma.article.count(args);
}

/**
 * Group articles by specified fields
 */
export async function groupByArticlesOrm(args: Prisma.ArticleGroupByArgs) {
  return await prisma.article.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find articles by status using ContentStatus enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findArticlesByStatusOrm(
  status: ContentStatus,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find draft articles
 */
export async function findDraftArticlesOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'DRAFT',
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find published articles
 */
export async function findPublishedArticlesOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PUBLISHED',
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find archived articles
 */
export async function findArchivedArticlesOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'ARCHIVED',
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find article by slug (leverages unique index)
 */
export async function findArticleBySlugOrm(slug: string) {
  return await prisma.article.findUnique({
    where: { slug },
  });
}

/**
 * Find articles by specific user
 */
export async function findArticlesByUserOrm(
  userId: string,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find articles that have a user (not anonymous)
 */
export async function findArticlesWithUserOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: {
        not: null,
      },
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find articles that don't have a user (anonymous)
 */
export async function findArticlesWithoutUserOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: null,
    },
  };
  return await prisma.article.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Article model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find articles that have media attachments
 */
export async function findArticlesWithMediaOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find article with all relations included
 */
export async function findArticleWithAllRelationsOrm(id: string) {
  return await prisma.article.findUnique({
    where: { id },
    include: {
      user: true,
      media: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) articles
 */
export async function findActiveArticlesOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find soft-deleted articles
 */
export async function findDeletedArticlesOrm(additionalArgs?: Prisma.ArticleFindManyArgs) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Soft delete an article (set deletedAt and deletedById)
 */
export async function softDeleteArticleOrm(id: string, deletedById: string) {
  try {
    return await prisma.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Article not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted article (clear deletedAt and deletedById)
 */
export async function restoreArticleOrm(id: string) {
  try {
    return await prisma.article.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Article not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find articles created after a specific date
 */
export async function findArticlesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
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
  return await prisma.article.findMany(args);
}

/**
 * Find articles updated after a specific date
 */
export async function findArticlesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
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
  return await prisma.article.findMany(args);
}

/**
 * Find recently created or updated articles within specified days
 */
export async function findRecentArticlesOrm(
  days: number = 7,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.ArticleFindManyArgs = {
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
  return await prisma.article.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Search articles by title (case-insensitive contains)
 */
export async function searchArticlesByTitleOrm(
  searchTerm: string,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      title: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.article.findMany(args);
}

/**
 * Find user articles by status (leverages userId index)
 */
export async function findUserArticlesByStatusOrm(
  userId: string,
  status: ContentStatus,
  additionalArgs?: Prisma.ArticleFindManyArgs,
) {
  const args: Prisma.ArticleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
      status: status,
    },
  };
  return await prisma.article.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Article with user relation
 */
export type ArticleWithUser = Prisma.ArticleGetPayload<{
  include: { user: true };
}>;

/**
 * Article with media relation
 */
export type ArticleWithMedia = Prisma.ArticleGetPayload<{
  include: { media: true };
}>;

/**
 * Article with all relations for complete data access
 */
export type ArticleWithAllRelations = Prisma.ArticleGetPayload<{
  include: {
    user: true;
    media: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted article type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedArticle = Prisma.ArticleGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Article search result type for optimized queries
 */
export type ArticleSearchResult = Prisma.ArticleGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    userId: true;
    _count: {
      select: {
        media: true;
      };
    };
  };
}>;
