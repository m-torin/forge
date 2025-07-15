import { ReviewType, VoteType } from '#/prisma-generated/client';
import { generateReview, generateReviewVotes } from '#/prisma/src/seed/generators/generate-reviews';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('generate-reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateReview', () => {
    it('generates review with correct structure', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const productName = 'Test Product';
      const productAttributes = { material: 'Cotton' };

      const result = generateReview(productId, userId, productName, productAttributes);

      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBeGreaterThanOrEqual(1);
      expect(result.rating).toBeLessThanOrEqual(5);
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.verified).toBeDefined();
      expect(result.product).toStrictEqual({ connect: { id: productId } });
      expect(result.user).toStrictEqual({ connect: { id: userId } });
    });

    it('generates different reviews', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const productName = 'Test Product';
      const productAttributes = { material: 'Cotton' };

      const review1 = generateReview(productId, userId, productName, productAttributes);
      const review2 = generateReview(productId, userId, productName, productAttributes);

      expect(review1.title).not.toBe(review2.title);
      expect(review1.content).not.toBe(review2.content);
    });
  });

  describe('generateReviewVotes', () => {
    it('generates votes for review', () => {
      const reviewId = 'review-123';
      const userIds = ['user-1', 'user-2', 'user-3'];
      const rating = 5;

      const result = generateReviewVotes(reviewId, userIds, rating);

      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(result.length).toBeLessThanOrEqual(userIds.length);

      result.forEach((vote: any) => {
        expect(vote.reviewId).toBe(reviewId);
        expect(userIds).toContain(vote.userId);
        expect([VoteType.HELPFUL, VoteType.NOT_HELPFUL]).toContain(vote.voteType);
      });
    });

    it('generates more votes for higher rated reviews', () => {
      const reviewId = 'review-123';
      const userIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];

      const highRatingVotes = generateReviewVotes(reviewId, userIds, 5);
      const lowRatingVotes = generateReviewVotes(reviewId, userIds, 2);

      // Higher rated reviews should generally get more votes
      expect(highRatingVotes.length).toBeGreaterThanOrEqual(lowRatingVotes.length);
    });
  });
});
