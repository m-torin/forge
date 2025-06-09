'use server';

import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database/prisma';

import type { ContentStatus, ReviewType, VoteType } from '@repo/database/prisma';

export interface ReviewData {
  content: string;
  productId?: string;
  rating: number;
  source?: string;
  sourceId?: string;
  status: ContentStatus;
  title?: string;
  type: ReviewType;
  userId: string;
  verified: boolean;
}

export interface ReviewFilters {
  dateFrom?: Date;
  dateTo?: Date;
  productId?: string;
  rating?: number[];
  search?: string;
  status?: ContentStatus[];
  type?: ReviewType[];
  userId?: string;
  verified?: boolean;
}

export interface BulkUpdateData {
  reviewIds: string[];
  updates: Partial<{
    status: ContentStatus;
    verified: boolean;
  }>;
}

export interface ReviewAnalytics {
  averageRating: number;
  pendingModerationCount: number;
  ratingDistribution: { rating: number; count: number }[];
  recentTrends: {
    totalThisMonth: number;
    totalLastMonth: number;
    averageRatingThisMonth: number;
    averageRatingLastMonth: number;
  };
  spamSuspiciousCount: number;
  statusDistribution: { status: ContentStatus; count: number }[];
  topProductsByReviews: {
    productId: string;
    productName: string;
    reviewCount: number;
    averageRating: number;
  }[];
  totalReviews: number;
}

export interface MerchantResponse {
  content: string;
  createdAt: Date;
  id: string;
  reviewId: string;
  user: {
    name: string | null;
    email: string;
  };
  userId: string;
}

export async function getReviews(filters?: ReviewFilters, page = 1, limit = 50) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const where: any = { deletedAt: null };

  if (filters) {
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    if (filters.rating && filters.rating.length > 0) {
      where.rating = { in: filters.rating };
    }
    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }
    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type };
    }
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        _count: { select: { votes: true } },
        media: { select: { id: true, url: true, altText: true } },
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true, email: true } },
        votes: {
          select: {
            userId: true,
            voteType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      where,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    },
    reviews,
  };
}

export async function createReview(data: ReviewData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.create({
    data,
    include: {
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// Get single review with full details
export async function getReviewById(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.findUnique({
    include: {
      _count: { select: { votes: true } },
      deletedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      media: {
        select: {
          id: true,
          type: true,
          url: true,
          altText: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          media: {
            select: { url: true, altText: true },
            take: 1,
          },
          sku: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          email: true,
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    where: { id },
  });
}

export async function updateReview(id: string, data: ReviewData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.update({
    data,
    include: {
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    where: { id },
  });
}

export async function deleteReview(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.review.update({
    data: { deletedAt: new Date(), deletedById: session.user.id },
    where: { id },
  });
}

// Review moderation actions
export async function approveReview(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.update({
    data: {
      status: 'PUBLISHED',
      updatedAt: new Date(),
      verified: true,
    },
    where: { id },
  });
}

export async function rejectReview(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.update({
    data: {
      status: 'ARCHIVED',
      updatedAt: new Date(),
    },
    where: { id },
  });
}

export async function flagAsSpam(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.update({
    data: {
      status: 'ARCHIVED',
      updatedAt: new Date(),
      verified: false,
    },
    where: { id },
  });
}

// Bulk operations
export async function bulkUpdateReviews(data: BulkUpdateData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const updateData: any = {
    ...data.updates,
    updatedAt: new Date(),
  };

  return await prisma.review.updateMany({
    data: updateData,
    where: {
      id: { in: data.reviewIds },
      deletedAt: null,
    },
  });
}

export async function bulkDeleteReviews(reviewIds: string[]) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await prisma.review.updateMany({
    data: {
      deletedAt: new Date(),
      deletedById: session.user.id,
    },
    where: {
      id: { in: reviewIds },
      deletedAt: null,
    },
  });
}

// Analytics
export async function getReviewAnalytics(): Promise<ReviewAnalytics> {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalReviews,
    averageRating,
    ratingDistribution,
    statusDistribution,
    thisMonthStats,
    lastMonthStats,
    topProducts,
    pendingCount,
    suspiciousCountResult,
  ] = await Promise.all([
    // Total reviews
    prisma.review.count({ where: { deletedAt: null } }),

    // Average rating
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { deletedAt: null, status: 'PUBLISHED' },
    }),

    // Rating distribution
    prisma.review.groupBy({
      _count: { rating: true },
      by: ['rating'],
      orderBy: { rating: 'asc' },
      where: { deletedAt: null, status: 'PUBLISHED' },
    }),

    // Status distribution
    prisma.review.groupBy({
      _count: { status: true },
      by: ['status'],
      where: { deletedAt: null },
    }),

    // This month stats
    prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      where: {
        createdAt: { gte: thisMonth },
        deletedAt: null,
      },
    }),

    // Last month stats
    prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
        deletedAt: null,
      },
    }),

    // Top products by reviews
    prisma.review.groupBy({
      _avg: { rating: true },
      _count: { id: true },
      by: ['productId'],
      orderBy: { _count: { id: 'desc' } },
      take: 10,
      where: {
        deletedAt: null,
        productId: { not: null },
        status: 'PUBLISHED',
      },
    }),

    // Pending moderation count
    prisma.review.count({
      where: {
        deletedAt: null,
        status: 'DRAFT',
      },
    }),

    // Suspicious/spam count (we'll do a raw query for this complex condition)
    prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Review"
      WHERE "deletedAt" IS NULL
        AND "status" = 'PUBLISHED'
        AND "totalVotes" > 5
        AND "helpfulCount" < ("totalVotes"::float / 3)
    `.then((result: any) => parseInt(result[0]?.count || '0')),
  ]);

  // Get product names for top products
  const productIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    where: { id: { in: productIds } },
  });

  const topProductsByReviews = topProducts.map((tp) => {
    const product = products.find((p) => p.id === tp.productId);
    return {
      averageRating: Number(tp._avg.rating?.toFixed(1)) || 0,
      productId: tp.productId!,
      productName: product?.name || 'Unknown Product',
      reviewCount: tp._count.id,
    };
  });

  return {
    averageRating: Number(averageRating._avg.rating?.toFixed(1)) || 0,
    pendingModerationCount: pendingCount,
    ratingDistribution: ratingDistribution.map((rd) => ({
      count: rd._count.rating,
      rating: rd.rating,
    })),
    recentTrends: {
      averageRatingLastMonth: Number(lastMonthStats._avg.rating?.toFixed(1)) || 0,
      averageRatingThisMonth: Number(thisMonthStats._avg.rating?.toFixed(1)) || 0,
      totalLastMonth: lastMonthStats._count.id,
      totalThisMonth: thisMonthStats._count.id,
    },
    spamSuspiciousCount: typeof suspiciousCountResult === 'number' ? suspiciousCountResult : 0,
    statusDistribution: statusDistribution.map((sd) => ({
      count: sd._count.status,
      status: sd.status,
    })),
    topProductsByReviews,
    totalReviews,
  };
}

// Review voting
export async function voteOnReview(reviewId: string, voteType: VoteType) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const userId = session.user.id;

  // Check if user already voted
  const existingVote = await prisma.reviewVoteJoin.findUnique({
    where: {
      userId_reviewId: {
        reviewId,
        userId,
      },
    },
  });

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // Remove vote if same type
      await prisma.reviewVoteJoin.delete({
        where: { id: existingVote.id },
      });
    } else {
      // Update vote type
      await prisma.reviewVoteJoin.update({
        data: { voteType },
        where: { id: existingVote.id },
      });
    }
  } else {
    // Create new vote
    await prisma.reviewVoteJoin.create({
      data: {
        reviewId,
        userId,
        voteType,
      },
    });
  }

  // Update review helpfulness counts
  const votes = await prisma.reviewVoteJoin.findMany({
    where: { reviewId },
  });

  const helpfulCount = votes.filter((v) => v.voteType === 'HELPFUL').length;
  const totalVotes = votes.length;

  await prisma.review.update({
    data: {
      helpfulCount,
      totalVotes,
    },
    where: { id: reviewId },
  });

  return { helpfulCount, totalVotes };
}

// Spam detection helper
export async function detectSuspiciousReviews() {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Get reviews for analysis
  const allReviews = await prisma.review.findMany({
    include: {
      product: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500, // Limit for performance
    where: {
      deletedAt: null,
      status: 'PUBLISHED',
    },
  });

  // Filter for suspicious patterns using JavaScript
  const suspiciousReviews = allReviews.filter((review) => {
    // Check for very short content (likely spam)
    if (review.content.length < 10) return true;

    // Check for low helpfulness ratio
    if (review.totalVotes > 5) {
      const helpfulnessRatio = review.helpfulCount / review.totalVotes;
      if (helpfulnessRatio < 0.25) return true; // Less than 25% helpful
    }

    // Check for repetitive patterns
    const words = review.content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 3 && uniqueWords.size / words.length < 0.4) {
      return true; // High repetition ratio (60%+ repeated words)
    }

    // Check for common spam phrases
    const spamPhrases = ['great product', 'love it', 'highly recommend', 'best ever'];
    const contentLower = review.content.toLowerCase();
    const matchedPhrases = spamPhrases.filter((phrase) => contentLower.includes(phrase));
    if (matchedPhrases.length > 1 && review.content.length < 50) {
      return true; // Multiple generic phrases in short review
    }

    return false;
  });

  return suspiciousReviews.slice(0, 50); // Limit results
}
