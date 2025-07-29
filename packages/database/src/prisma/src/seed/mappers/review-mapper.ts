import { type Prisma, ReviewType } from '../../../../../prisma-generated/client';

interface WebappReview {
  id: string;
  title: string;
  rating: number;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  datetime: string;
}

export function mapWebappReviewToPrisma(
  review: WebappReview,
  productId: string,
  userId: string,
): Prisma.ReviewCreateInput {
  return {
    type: ReviewType.DEDICATED,
    rating: review.rating,
    title: review.title,
    content: review.content, // HTML content
    verified: true, // Demo reviews are "verified"
    product: {
      connect: { id: productId },
    },
    user: {
      connect: { id: userId },
    },
  };
}
