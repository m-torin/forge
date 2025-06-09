"use server";

import { prisma } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// REVIEW CRUD OPERATIONS
//==============================================================================

export async function createReview(args: Prisma.ReviewCreateArgs) {
  return prisma.review.create(args);
}

export async function findManyReviews(args?: Prisma.ReviewFindManyArgs) {
  return prisma.review.findMany(args);
}

export async function findUniqueReview(args: Prisma.ReviewFindUniqueArgs) {
  return prisma.review.findUnique(args);
}

export async function findFirstReview(args?: Prisma.ReviewFindFirstArgs) {
  return prisma.review.findFirst(args);
}

export async function updateReview(args: Prisma.ReviewUpdateArgs) {
  return prisma.review.update(args);
}

export async function updateManyReviews(args: Prisma.ReviewUpdateManyArgs) {
  return prisma.review.updateMany(args);
}

export async function upsertReview(args: Prisma.ReviewUpsertArgs) {
  return prisma.review.upsert(args);
}

export async function deleteReview(args: Prisma.ReviewDeleteArgs) {
  return prisma.review.delete(args);
}

export async function deleteManyReviews(args?: Prisma.ReviewDeleteManyArgs) {
  return prisma.review.deleteMany(args);
}

export async function countReviews(args?: Prisma.ReviewCountArgs) {
  return prisma.review.count(args);
}

export async function aggregateReviews(args = {}) {
  return prisma.review.aggregate(args);
}

export async function groupByReviews(args: Prisma.ReviewGroupByArgs) {
  return prisma.review.groupBy(args);
}

//==============================================================================
// FAVORITE JOIN CRUD OPERATIONS
//==============================================================================

export async function createFavoriteJoin(args: Prisma.FavoriteJoinCreateArgs) {
  return prisma.favoriteJoin.create(args);
}

export async function findManyFavoriteJoins(args?: Prisma.FavoriteJoinFindManyArgs) {
  return prisma.favoriteJoin.findMany(args);
}

export async function findUniqueFavoriteJoin(args: Prisma.FavoriteJoinFindUniqueArgs) {
  return prisma.favoriteJoin.findUnique(args);
}

export async function findFirstFavoriteJoin(args?: Prisma.FavoriteJoinFindFirstArgs) {
  return prisma.favoriteJoin.findFirst(args);
}

export async function updateFavoriteJoin(args: Prisma.FavoriteJoinUpdateArgs) {
  return prisma.favoriteJoin.update(args);
}

export async function updateManyFavoriteJoins(args: Prisma.FavoriteJoinUpdateManyArgs) {
  return prisma.favoriteJoin.updateMany(args);
}

export async function upsertFavoriteJoin(args: Prisma.FavoriteJoinUpsertArgs) {
  return prisma.favoriteJoin.upsert(args);
}

export async function deleteFavoriteJoin(args: Prisma.FavoriteJoinDeleteArgs) {
  return prisma.favoriteJoin.delete(args);
}

export async function deleteManyFavoriteJoins(args?: Prisma.FavoriteJoinDeleteManyArgs) {
  return prisma.favoriteJoin.deleteMany(args);
}

export async function countFavoriteJoins(args?: Prisma.FavoriteJoinCountArgs) {
  return prisma.favoriteJoin.count(args);
}

//==============================================================================
// REVIEW VOTE JOIN CRUD OPERATIONS
//==============================================================================

export async function createReviewVoteJoin(args: Prisma.ReviewVoteJoinCreateArgs) {
  return prisma.reviewVoteJoin.create(args);
}

export async function findManyReviewVoteJoins(args?: Prisma.ReviewVoteJoinFindManyArgs) {
  return prisma.reviewVoteJoin.findMany(args);
}

export async function findUniqueReviewVoteJoin(args: Prisma.ReviewVoteJoinFindUniqueArgs) {
  return prisma.reviewVoteJoin.findUnique(args);
}

export async function findFirstReviewVoteJoin(args?: Prisma.ReviewVoteJoinFindFirstArgs) {
  return prisma.reviewVoteJoin.findFirst(args);
}

export async function updateReviewVoteJoin(args: Prisma.ReviewVoteJoinUpdateArgs) {
  return prisma.reviewVoteJoin.update(args);
}

export async function updateManyReviewVoteJoins(args: Prisma.ReviewVoteJoinUpdateManyArgs) {
  return prisma.reviewVoteJoin.updateMany(args);
}

export async function upsertReviewVoteJoin(args: Prisma.ReviewVoteJoinUpsertArgs) {
  return prisma.reviewVoteJoin.upsert(args);
}

export async function deleteReviewVoteJoin(args: Prisma.ReviewVoteJoinDeleteArgs) {
  return prisma.reviewVoteJoin.delete(args);
}

export async function deleteManyReviewVoteJoins(args?: Prisma.ReviewVoteJoinDeleteManyArgs) {
  return prisma.reviewVoteJoin.deleteMany(args);
}

export async function countReviewVoteJoins(args?: Prisma.ReviewVoteJoinCountArgs) {
  return prisma.reviewVoteJoin.count(args);
}