'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';

//==============================================================================
// REVIEW CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createReviewOrm(args: Prisma.ReviewCreateArgs) {
  return prisma.review.create(args);
}

// READ
export async function findFirstReviewOrm(args?: Prisma.ReviewFindFirstArgs) {
  return prisma.review.findFirst(args);
}

export async function findUniqueReviewOrm(args: Prisma.ReviewFindUniqueArgs) {
  return prisma.review.findUnique(args);
}

export async function findManyReviewsOrm(args?: Prisma.ReviewFindManyArgs) {
  return prisma.review.findMany(args);
}

// UPDATE
export async function updateReviewOrm(args: Prisma.ReviewUpdateArgs) {
  return prisma.review.update(args);
}

export async function updateManyReviewsOrm(args: Prisma.ReviewUpdateManyArgs) {
  return prisma.review.updateMany(args);
}

// UPSERT
export async function upsertReviewOrm(args: Prisma.ReviewUpsertArgs) {
  return prisma.review.upsert(args);
}

// DELETE
export async function deleteReviewOrm(args: Prisma.ReviewDeleteArgs) {
  return prisma.review.delete(args);
}

export async function deleteManyReviewsOrm(args?: Prisma.ReviewDeleteManyArgs) {
  return prisma.review.deleteMany(args);
}

// AGGREGATE
export async function aggregateReviewsOrm(args?: Prisma.ReviewAggregateArgs) {
  return prisma.review.aggregate(args ?? {});
}

export async function countReviewsOrm(args?: Prisma.ReviewCountArgs) {
  return prisma.review.count(args);
}

export async function groupByReviewsOrm(args: Prisma.ReviewGroupByArgs) {
  return prisma.review.groupBy(args);
}

//==============================================================================
// FAVORITEJOIN CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createFavoriteJoinOrm(args: Prisma.FavoriteJoinCreateArgs) {
  return prisma.favoriteJoin.create(args);
}

// READ
export async function findFirstFavoriteJoinOrm(args?: Prisma.FavoriteJoinFindFirstArgs) {
  return prisma.favoriteJoin.findFirst(args);
}

export async function findUniqueFavoriteJoinOrm(args: Prisma.FavoriteJoinFindUniqueArgs) {
  return prisma.favoriteJoin.findUnique(args);
}

export async function findManyFavoriteJoinsOrm(args?: Prisma.FavoriteJoinFindManyArgs) {
  return prisma.favoriteJoin.findMany(args);
}

// UPDATE
export async function updateFavoriteJoinOrm(args: Prisma.FavoriteJoinUpdateArgs) {
  return prisma.favoriteJoin.update(args);
}

export async function updateManyFavoriteJoinsOrm(args: Prisma.FavoriteJoinUpdateManyArgs) {
  return prisma.favoriteJoin.updateMany(args);
}

// UPSERT
export async function upsertFavoriteJoinOrm(args: Prisma.FavoriteJoinUpsertArgs) {
  return prisma.favoriteJoin.upsert(args);
}

// DELETE
export async function deleteFavoriteJoinOrm(args: Prisma.FavoriteJoinDeleteArgs) {
  return prisma.favoriteJoin.delete(args);
}

export async function deleteManyFavoriteJoinsOrm(args?: Prisma.FavoriteJoinDeleteManyArgs) {
  return prisma.favoriteJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateFavoriteJoinsOrm(args?: Prisma.FavoriteJoinAggregateArgs) {
  return prisma.favoriteJoin.aggregate(args ?? {});
}

export async function countFavoriteJoinsOrm(args?: Prisma.FavoriteJoinCountArgs) {
  return prisma.favoriteJoin.count(args);
}

export async function groupByFavoriteJoinsOrm(args: Prisma.FavoriteJoinGroupByArgs) {
  return prisma.favoriteJoin.groupBy(args);
}

//==============================================================================
// REVIEWVOTEJOIN CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createReviewVoteJoinOrm(args: Prisma.ReviewVoteJoinCreateArgs) {
  return prisma.reviewVoteJoin.create(args);
}

// READ
export async function findFirstReviewVoteJoinOrm(args?: Prisma.ReviewVoteJoinFindFirstArgs) {
  return prisma.reviewVoteJoin.findFirst(args);
}

export async function findUniqueReviewVoteJoinOrm(args: Prisma.ReviewVoteJoinFindUniqueArgs) {
  return prisma.reviewVoteJoin.findUnique(args);
}

export async function findManyReviewVoteJoinsOrm(args?: Prisma.ReviewVoteJoinFindManyArgs) {
  return prisma.reviewVoteJoin.findMany(args);
}

// UPDATE
export async function updateReviewVoteJoinOrm(args: Prisma.ReviewVoteJoinUpdateArgs) {
  return prisma.reviewVoteJoin.update(args);
}

export async function updateManyReviewVoteJoinsOrm(args: Prisma.ReviewVoteJoinUpdateManyArgs) {
  return prisma.reviewVoteJoin.updateMany(args);
}

// UPSERT
export async function upsertReviewVoteJoinOrm(args: Prisma.ReviewVoteJoinUpsertArgs) {
  return prisma.reviewVoteJoin.upsert(args);
}

// DELETE
export async function deleteReviewVoteJoinOrm(args: Prisma.ReviewVoteJoinDeleteArgs) {
  return prisma.reviewVoteJoin.delete(args);
}

export async function deleteManyReviewVoteJoinsOrm(args?: Prisma.ReviewVoteJoinDeleteManyArgs) {
  return prisma.reviewVoteJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateReviewVoteJoinsOrm(args?: Prisma.ReviewVoteJoinAggregateArgs) {
  return prisma.reviewVoteJoin.aggregate(args ?? {});
}

export async function countReviewVoteJoinsOrm(args?: Prisma.ReviewVoteJoinCountArgs) {
  return prisma.reviewVoteJoin.count(args);
}

export async function groupByReviewVoteJoinsOrm(args: Prisma.ReviewVoteJoinGroupByArgs) {
  return prisma.reviewVoteJoin.groupBy(args);
}
