"use server";

import { prisma } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// ARTICLE CRUD OPERATIONS
//==============================================================================

export async function createArticle(args: Prisma.ArticleCreateArgs) {
  return prisma.article.create(args);
}

export async function findManyArticles(args?: Prisma.ArticleFindManyArgs) {
  return prisma.article.findMany(args);
}

export async function findUniqueArticle(args: Prisma.ArticleFindUniqueArgs) {
  return prisma.article.findUnique(args);
}

export async function findFirstArticle(args?: Prisma.ArticleFindFirstArgs) {
  return prisma.article.findFirst(args);
}

export async function updateArticle(args: Prisma.ArticleUpdateArgs) {
  return prisma.article.update(args);
}

export async function updateManyArticles(args: Prisma.ArticleUpdateManyArgs) {
  return prisma.article.updateMany(args);
}

export async function upsertArticle(args: Prisma.ArticleUpsertArgs) {
  return prisma.article.upsert(args);
}

export async function deleteArticle(args: Prisma.ArticleDeleteArgs) {
  return prisma.article.delete(args);
}

export async function deleteManyArticles(args?: Prisma.ArticleDeleteManyArgs) {
  return prisma.article.deleteMany(args);
}

export async function countArticles(args?: Prisma.ArticleCountArgs) {
  return prisma.article.count(args);
}

export async function aggregateArticles(args = {}) {
  return prisma.article.aggregate(args);
}

export async function groupByArticles(args: Prisma.ArticleGroupByArgs) {
  return prisma.article.groupBy(args);
}