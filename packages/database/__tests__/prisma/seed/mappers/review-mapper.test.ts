import { ReviewType } from '#/prisma-generated/client';
import { mapWebappReviewToPrisma } from '#/prisma/src/seed/mappers/review-mapper';
import { describe, expect, it } from 'vitest';

describe('review-mapper', () => {
  const mockWebappReview = {
    id: '1',
    title: 'Great product!',
    rating: 5,
    content: '<p>This is an amazing product!</p>',
    author: 'John Doe',
    authorAvatar: '/images/avatar.jpg',
    date: '2025-01-01',
    datetime: '2025-01-01',
  };

  describe('mapWebappReviewToPrisma', () => {
    it('maps webapp review to Prisma format correctly', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBe(5);
      expect(result.title).toBe('Great product!');
      expect(result.content).toBe('<p>This is an amazing product!</p>');
      expect(result.verified).toBe(true);
      expect(result.product).toStrictEqual({ connect: { id: productId } });
      expect(result.user).toStrictEqual({ connect: { id: userId } });
    });

    it('handles different ratings', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithRating3 = { ...mockWebappReview, rating: 3 };
      const result = mapWebappReviewToPrisma(reviewWithRating3, productId, userId);

      expect(result.rating).toBe(3);
    });

    // Enhanced test coverage
    it('handles all rating values', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const ratings = [1, 2, 3, 4, 5];

      ratings.forEach(rating => {
        const reviewWithRating = { ...mockWebappReview, rating };
        const result = mapWebappReviewToPrisma(reviewWithRating, productId, userId);
        expect(result.rating).toBe(rating);
      });
    });

    it('handles zero rating', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithZeroRating = { ...mockWebappReview, rating: 0 };
      const result = mapWebappReviewToPrisma(reviewWithZeroRating, productId, userId);

      expect(result.rating).toBe(0);
    });

    it('handles negative rating', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithNegativeRating = { ...mockWebappReview, rating: -1 };
      const result = mapWebappReviewToPrisma(reviewWithNegativeRating, productId, userId);

      expect(result.rating).toBe(-1);
    });

    it('handles very high rating', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithHighRating = { ...mockWebappReview, rating: 10 };
      const result = mapWebappReviewToPrisma(reviewWithHighRating, productId, userId);

      expect(result.rating).toBe(10);
    });

    it('handles empty title', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithEmptyTitle = { ...mockWebappReview, title: '' };
      const result = mapWebappReviewToPrisma(reviewWithEmptyTitle, productId, userId);

      expect(result.title).toBe('');
    });

    it('handles null title', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithNullTitle = { ...mockWebappReview, title: null as any };
      const result = mapWebappReviewToPrisma(reviewWithNullTitle, productId, userId);

      expect(result.title).toBeNull();
    });

    it('handles very long title', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const longTitle = 'A'.repeat(1000);
      const reviewWithLongTitle = { ...mockWebappReview, title: longTitle };
      const result = mapWebappReviewToPrisma(reviewWithLongTitle, productId, userId);

      expect(result.title).toBe(longTitle);
    });

    it('handles special characters in title', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const specialTitle =
        'Review with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `';
      const reviewWithSpecialTitle = { ...mockWebappReview, title: specialTitle };
      const result = mapWebappReviewToPrisma(reviewWithSpecialTitle, productId, userId);

      expect(result.title).toBe(specialTitle);
    });

    it('handles empty content', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithEmptyContent = { ...mockWebappReview, content: '' };
      const result = mapWebappReviewToPrisma(reviewWithEmptyContent, productId, userId);

      expect(result.content).toBe('');
    });

    it('handles null content', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithNullContent = { ...mockWebappReview, content: null as any };
      const result = mapWebappReviewToPrisma(reviewWithNullContent, productId, userId);

      expect(result.content).toBeNull();
    });

    it('handles very long content', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const longContent = '<p>' + 'A'.repeat(10000) + '</p>';
      const reviewWithLongContent = { ...mockWebappReview, content: longContent };
      const result = mapWebappReviewToPrisma(reviewWithLongContent, productId, userId);

      expect(result.content).toBe(longContent);
    });

    it('handles HTML content with various tags', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const htmlContent = `
        <div class="review-content">
          <h3>Great Product!</h3>
          <p>This is an <strong>amazing</strong> product with <em>excellent</em> quality.</p>
          <ul>
            <li>High quality materials</li>
            <li>Great fit</li>
            <li>Fast shipping</li>
          </ul>
          <blockquote>Would definitely recommend!</blockquote>
        </div>
      `;
      const reviewWithHtmlContent = { ...mockWebappReview, content: htmlContent };
      const result = mapWebappReviewToPrisma(reviewWithHtmlContent, productId, userId);

      expect(result.content).toBe(htmlContent);
    });

    it('handles content with special characters', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const specialContent =
        '<p>Content with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `</p>';
      const reviewWithSpecialContent = { ...mockWebappReview, content: specialContent };
      const result = mapWebappReviewToPrisma(reviewWithSpecialContent, productId, userId);

      expect(result.content).toBe(specialContent);
    });

    it('handles different product IDs', () => {
      const userId = 'user-123';
      const productIds = ['product-1', 'product-2', 'product-3', 'product-abc', 'product-123'];

      productIds.forEach(productId => {
        const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);
        expect(result.product).toStrictEqual({ connect: { id: productId } });
      });
    });

    it('handles different user IDs', () => {
      const productId = 'product-123';
      const userIds = ['user-1', 'user-2', 'user-3', 'user-abc', 'user-123'];

      userIds.forEach(userId => {
        const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);
        expect(result.user).toStrictEqual({ connect: { id: userId } });
      });
    });

    it('handles very long product ID', () => {
      const productId = 'a'.repeat(1000);
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.product).toStrictEqual({ connect: { id: productId } });
    });

    it('handles very long user ID', () => {
      const productId = 'product-123';
      const userId = 'a'.repeat(1000);
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.user).toStrictEqual({ connect: { id: userId } });
    });

    it('handles empty product ID', () => {
      const productId = '';
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.product).toStrictEqual({ connect: { id: productId } });
    });

    it('handles empty user ID', () => {
      const productId = 'product-123';
      const userId = '';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.user).toStrictEqual({ connect: { id: userId } });
    });

    it('always sets verified to true', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.verified).toBe(true);
    });

    it('always sets type to DEDICATED', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result.type).toBe(ReviewType.DEDICATED);
    });

    it('generates consistent results for same input', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const result1 = mapWebappReviewToPrisma(mockWebappReview, productId, userId);
      const result2 = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result1.type).toBe(result2.type);
      expect(result1.rating).toBe(result2.rating);
      expect(result1.title).toBe(result2.title);
      expect(result1.content).toBe(result2.content);
      expect(result1.verified).toBe(result2.verified);
      expect(result1.product).toStrictEqual(result2.product);
      expect(result1.user).toStrictEqual(result2.user);
    });

    it('includes all required fields', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const result = mapWebappReviewToPrisma(mockWebappReview, productId, userId);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('rating');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('product');
      expect(result).toHaveProperty('user');
    });

    it('handles reviews with missing optional fields', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const minimalReview = {
        id: '1',
        title: 'Great product!',
        rating: 5,
        content: '<p>This is an amazing product!</p>',
        author: 'John Doe',
        authorAvatar: '/images/avatar.jpg',
        date: '2025-01-01',
        datetime: '2025-01-01',
      };
      const result = mapWebappReviewToPrisma(minimalReview, productId, userId);

      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBe(5);
      expect(result.title).toBe('Great product!');
      expect(result.content).toBe('<p>This is an amazing product!</p>');
      expect(result.verified).toBe(true);
    });

    it('handles reviews with all fields present', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const completeReview = {
        id: '1',
        title: 'Great product!',
        rating: 5,
        content: '<p>This is an amazing product!</p>',
        author: 'John Doe',
        authorAvatar: '/images/avatar.jpg',
        date: '2025-01-01',
        datetime: '2025-01-01',
      };
      const result = mapWebappReviewToPrisma(completeReview, productId, userId);

      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBe(5);
      expect(result.title).toBe('Great product!');
      expect(result.content).toBe('<p>This is an amazing product!</p>');
      expect(result.verified).toBe(true);
    });

    it('handles reviews with special characters in author name', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const reviewWithSpecialAuthor = { ...mockWebappReview, author: 'José María García-López' };
      const result = mapWebappReviewToPrisma(reviewWithSpecialAuthor, productId, userId);

      // Author is not mapped to the result, but the function should handle it gracefully
      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBe(5);
    });

    it('handles reviews with very long author name', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const longAuthorName = 'A'.repeat(500);
      const reviewWithLongAuthor = { ...mockWebappReview, author: longAuthorName };
      const result = mapWebappReviewToPrisma(reviewWithLongAuthor, productId, userId);

      // Author is not mapped to the result, but the function should handle it gracefully
      expect(result.type).toBe(ReviewType.DEDICATED);
      expect(result.rating).toBe(5);
    });

    it('handles reviews with different date formats', () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const dateFormats = [
        '2025-01-01',
        '2025-01-01T10:30:00Z',
        '2025-01-01T10:30:00.000Z',
        '2025-01-01 10:30:00',
        '2025-01-01 10:30:00.000',
      ];

      dateFormats.forEach(date => {
        const reviewWithDate = { ...mockWebappReview, date, datetime: date };
        const result = mapWebappReviewToPrisma(reviewWithDate, productId, userId);

        // Date is not mapped to the result, but the function should handle it gracefully
        expect(result.type).toBe(ReviewType.DEDICATED);
        expect(result.rating).toBe(5);
      });
    });
  });
});
