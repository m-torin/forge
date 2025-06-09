"use server";

import { database } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// REVIEW CRUD OPERATIONS
//==============================================================================

export async function createReview(data: Prisma.ReviewCreateInput) {
  return database.review.create({ data });
}

export async function findManyReviews(args?: Prisma.ReviewFindManyArgs) {
  return database.review.findMany(args);
}

export async function findUniqueReview(args: Prisma.ReviewFindUniqueArgs) {
  return database.review.findUnique(args);
}

export async function findFirstReview(args?: Prisma.ReviewFindFirstArgs) {
  return database.review.findFirst(args);
}

export async function updateReview(args: Prisma.ReviewUpdateArgs) {
  return database.review.update(args);
}

export async function updateManyReviews(args: Prisma.ReviewUpdateManyArgs) {
  return database.review.updateMany(args);
}

export async function upsertReview(args: Prisma.ReviewUpsertArgs) {
  return database.review.upsert(args);
}

export async function deleteReview(args: Prisma.ReviewDeleteArgs) {
  return database.review.delete(args);
}

export async function deleteManyReviews(args?: Prisma.ReviewDeleteManyArgs) {
  return database.review.deleteMany(args);
}

export async function countReviews(args?: Prisma.ReviewCountArgs) {
  return database.review.count(args);
}

export async function aggregateReviews(args?: Prisma.ReviewAggregateArgs) {
  return database.review.aggregate(args);
}

export async function groupByReviews(args: Prisma.ReviewGroupByArgs) {
  return database.review.groupBy(args);
}

//==============================================================================
// FAVORITE JOIN CRUD OPERATIONS
//==============================================================================

export async function createFavoriteJoin(data: Prisma.FavoriteJoinCreateInput) {
  return database.favoriteJoin.create({ data });
}

export async function findManyFavoriteJoins(args?: Prisma.FavoriteJoinFindManyArgs) {
  return database.favoriteJoin.findMany(args);
}

export async function findUniqueFavoriteJoin(args: Prisma.FavoriteJoinFindUniqueArgs) {
  return database.favoriteJoin.findUnique(args);
}

export async function findFirstFavoriteJoin(args?: Prisma.FavoriteJoinFindFirstArgs) {
  return database.favoriteJoin.findFirst(args);
}

export async function updateFavoriteJoin(args: Prisma.FavoriteJoinUpdateArgs) {
  return database.favoriteJoin.update(args);
}

export async function updateManyFavoriteJoins(args: Prisma.FavoriteJoinUpdateManyArgs) {
  return database.favoriteJoin.updateMany(args);
}

export async function upsertFavoriteJoin(args: Prisma.FavoriteJoinUpsertArgs) {
  return database.favoriteJoin.upsert(args);
}

export async function deleteFavoriteJoin(args: Prisma.FavoriteJoinDeleteArgs) {
  return database.favoriteJoin.delete(args);
}

export async function deleteManyFavoriteJoins(args?: Prisma.FavoriteJoinDeleteManyArgs) {
  return database.favoriteJoin.deleteMany(args);
}

export async function countFavoriteJoins(args?: Prisma.FavoriteJoinCountArgs) {
  return database.favoriteJoin.count(args);
}

//==============================================================================
// REVIEW VOTE JOIN CRUD OPERATIONS
//==============================================================================

export async function createReviewVoteJoin(data: Prisma.ReviewVoteJoinCreateInput) {
  return database.reviewVoteJoin.create({ data });
}

export async function findManyReviewVoteJoins(args?: Prisma.ReviewVoteJoinFindManyArgs) {
  return database.reviewVoteJoin.findMany(args);
}

export async function findUniqueReviewVoteJoin(args: Prisma.ReviewVoteJoinFindUniqueArgs) {
  return database.reviewVoteJoin.findUnique(args);
}

export async function findFirstReviewVoteJoin(args?: Prisma.ReviewVoteJoinFindFirstArgs) {
  return database.reviewVoteJoin.findFirst(args);
}

export async function updateReviewVoteJoin(args: Prisma.ReviewVoteJoinUpdateArgs) {
  return database.reviewVoteJoin.update(args);
}

export async function updateManyReviewVoteJoins(args: Prisma.ReviewVoteJoinUpdateManyArgs) {
  return database.reviewVoteJoin.updateMany(args);
}

export async function upsertReviewVoteJoin(args: Prisma.ReviewVoteJoinUpsertArgs) {
  return database.reviewVoteJoin.upsert(args);
}

export async function deleteReviewVoteJoin(args: Prisma.ReviewVoteJoinDeleteArgs) {
  return database.reviewVoteJoin.delete(args);
}

export async function deleteManyReviewVoteJoins(args?: Prisma.ReviewVoteJoinDeleteManyArgs) {
  return database.reviewVoteJoin.deleteMany(args);
}

export async function countReviewVoteJoins(args?: Prisma.ReviewVoteJoinCountArgs) {
  return database.reviewVoteJoin.count(args);
}