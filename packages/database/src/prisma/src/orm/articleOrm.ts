'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../../prisma-generated/client';

//==============================================================================
// ARTICLE CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createArticleOrm(args: Prisma.ArticleCreateArgs) {
  return prisma.article.create(args);
}

// READ
export async function findFirstArticleOrm(args?: Prisma.ArticleFindFirstArgs) {
  return prisma.article.findFirst(args);
}

export async function findUniqueArticleOrm(args: Prisma.ArticleFindUniqueArgs) {
  return prisma.article.findUnique(args);
}

export async function findManyArticlesOrm(args?: Prisma.ArticleFindManyArgs) {
  return prisma.article.findMany(args);
}

// UPDATE
export async function updateArticleOrm(args: Prisma.ArticleUpdateArgs) {
  return prisma.article.update(args);
}

export async function updateManyArticlesOrm(args: Prisma.ArticleUpdateManyArgs) {
  return prisma.article.updateMany(args);
}

// UPSERT
export async function upsertArticleOrm(args: Prisma.ArticleUpsertArgs) {
  return prisma.article.upsert(args);
}

// DELETE
export async function deleteArticleOrm(args: Prisma.ArticleDeleteArgs) {
  return prisma.article.delete(args);
}

export async function deleteManyArticlesOrm(args?: Prisma.ArticleDeleteManyArgs) {
  return prisma.article.deleteMany(args);
}

// AGGREGATE
export async function aggregateArticlesOrm<T extends Prisma.ArticleAggregateArgs = {}>(
  args?: T,
): Promise<Prisma.GetArticleAggregateType<T>> {
  return prisma.article.aggregate((args ?? {}) as T);
}

export async function countArticlesOrm(args?: Prisma.ArticleCountArgs) {
  return prisma.article.count(args);
}

export async function groupByArticlesOrm(args: Prisma.ArticleGroupByArgs) {
  return prisma.article.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
