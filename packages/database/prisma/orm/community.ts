"use server";

import { database } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// ARTICLE CRUD OPERATIONS
//==============================================================================

export async function createArticle(data: Prisma.ArticleCreateInput) {
  return database.article.create({ data });
}

export async function findManyArticles(args?: Prisma.ArticleFindManyArgs) {
  return database.article.findMany(args);
}

export async function findUniqueArticle(args: Prisma.ArticleFindUniqueArgs) {
  return database.article.findUnique(args);
}

export async function findFirstArticle(args?: Prisma.ArticleFindFirstArgs) {
  return database.article.findFirst(args);
}

export async function updateArticle(args: Prisma.ArticleUpdateArgs) {
  return database.article.update(args);
}

export async function updateManyArticles(args: Prisma.ArticleUpdateManyArgs) {
  return database.article.updateMany(args);
}

export async function upsertArticle(args: Prisma.ArticleUpsertArgs) {
  return database.article.upsert(args);
}

export async function deleteArticle(args: Prisma.ArticleDeleteArgs) {
  return database.article.delete(args);
}

export async function deleteManyArticles(args?: Prisma.ArticleDeleteManyArgs) {
  return database.article.deleteMany(args);
}

export async function countArticles(args?: Prisma.ArticleCountArgs) {
  return database.article.count(args);
}

export async function aggregateArticles(args?: Prisma.ArticleAggregateArgs) {
  return database.article.aggregate(args);
}

export async function groupByArticles(args: Prisma.ArticleGroupByArgs) {
  return database.article.groupBy(args);
}