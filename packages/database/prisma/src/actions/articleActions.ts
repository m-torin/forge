'use server';

import {
  createArticleOrm,
  findFirstArticleOrm,
  findUniqueArticleOrm,
  findManyArticlesOrm,
  updateArticleOrm,
  updateManyArticlesOrm,
  upsertArticleOrm,
  deleteArticleOrm,
  deleteManyArticlesOrm,
  aggregateArticlesOrm,
  countArticlesOrm,
  groupByArticlesOrm,
} from '../orm/articleOrm';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// ARTICLE SERVER ACTIONS
//==============================================================================

export async function createArticleAction(args: Prisma.ArticleCreateArgs) {
  'use server';
  return createArticleOrm(args);
}

export async function findFirstArticleAction(args?: Prisma.ArticleFindFirstArgs) {
  'use server';
  return findFirstArticleOrm(args);
}

export async function findUniqueArticleAction(args: Prisma.ArticleFindUniqueArgs) {
  'use server';
  return findUniqueArticleOrm(args);
}

export async function findManyArticlesAction(args?: Prisma.ArticleFindManyArgs) {
  'use server';
  return findManyArticlesOrm(args);
}

export async function updateArticleAction(args: Prisma.ArticleUpdateArgs) {
  'use server';
  return updateArticleOrm(args);
}

export async function updateManyArticlesAction(args: Prisma.ArticleUpdateManyArgs) {
  'use server';
  return updateManyArticlesOrm(args);
}

export async function upsertArticleAction(args: Prisma.ArticleUpsertArgs) {
  'use server';
  return upsertArticleOrm(args);
}

export async function deleteArticleAction(args: Prisma.ArticleDeleteArgs) {
  'use server';
  return deleteArticleOrm(args);
}

export async function deleteManyArticlesAction(args?: Prisma.ArticleDeleteManyArgs) {
  'use server';
  return deleteManyArticlesOrm(args);
}

export async function aggregateArticlesAction(args?: Prisma.ArticleAggregateArgs) {
  'use server';
  return aggregateArticlesOrm(args);
}

export async function countArticlesAction(args?: Prisma.ArticleCountArgs) {
  'use server';
  return countArticlesOrm(args);
}

export async function groupByArticlesAction(args: Prisma.ArticleGroupByArgs) {
  'use server';
  return groupByArticlesOrm(args);
}

//==============================================================================
// BACKWARD COMPATIBILITY ALIASES
//==============================================================================

export const getArticlesAction = findManyArticlesAction;
export const getArticleBySlugAction = (slug: string) => findFirstArticleAction({ where: { slug } });
