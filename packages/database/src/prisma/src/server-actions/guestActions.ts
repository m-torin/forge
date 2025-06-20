'use server';

import {
  aggregateReviewsOrm,
  countReviewsOrm,
  createFavoriteJoinOrm,
  createReviewOrm,
  createReviewVoteJoinOrm,
  deleteFavoriteJoinOrm,
  deleteReviewOrm,
  deleteReviewVoteJoinOrm,
  findManyFavoriteJoinsOrm,
  findManyReviewsOrm,
  findManyReviewVoteJoinsOrm,
  findUniqueReviewOrm,
  updateReviewOrm,
} from '../orm/guestActionsOrm';

//==============================================================================
// FAVORITE ACTIONS
//==============================================================================

export async function addGuestFavoriteAction(userId: string, productId: string) {
  'use server';

  return createFavoriteJoinOrm({
    data: {
      productId,
      userId,
    },
  });
}

export async function removeGuestFavoriteAction(userId: string, productId: string) {
  'use server';

  const favorites = await findManyFavoriteJoinsOrm({
    where: {
      productId,
      userId,
    },
  });

  if (favorites.length > 0) {
    await deleteFavoriteJoinOrm({
      where: { id: favorites[0].id },
    });
  }
}

export async function getGuestFavoritesAction(userId: string) {
  'use server';

  const favorites = await findManyFavoriteJoinsOrm({
    include: {
      product: {
        include: {
          media: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      },
    },
    where: { userId },
  });

  return favorites.filter((f: any) => f.product).map((f: any) => f.product);
}

export async function toggleGuestFavoriteAction(userId: string, productId: string) {
  'use server';

  const existingFavorite = await findManyFavoriteJoinsOrm({
    where: {
      productId,
      userId,
    },
  });

  if (existingFavorite.length > 0) {
    // Remove existing favorite
    await deleteFavoriteJoinOrm({
      where: { id: existingFavorite[0].id },
    });
    return { action: 'removed', favorite: false };
  } else {
    // Add new favorite
    const favorite = await createFavoriteJoinOrm({
      data: {
        productId,
        userId,
      },
    });
    return { action: 'added', favorite: true, data: favorite };
  }
}

//==============================================================================
// REVIEW ACTIONS
//==============================================================================

export async function createReviewAction(data: any) {
  'use server';

  return createReviewOrm({
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
      user: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateReviewAction(id: string, data: any) {
  'use server';

  return updateReviewOrm({
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
      user: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
    },
    where: { id },
  });
}

export async function deleteReviewAction(id: string) {
  'use server';

  return deleteReviewOrm({
    where: { id },
  });
}

export async function getReviewAction(id: string) {
  'use server';

  return findUniqueReviewOrm({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
      user: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
      votes: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
    where: { id },
  });
}

export async function getReviewsAction(
  options: {
    limit?: number;
    page?: number;
    productId?: string;
    rating?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    userId?: string;
  } = {},
) {
  'use server';

  const {
    limit = 20,
    page = 1,
    productId,
    rating,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    userId,
  } = options;

  const where: any = {};

  if (productId) {
    where.productId = productId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (rating) {
    where.rating = rating;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [reviews, total] = await Promise.all([
    findManyReviewsOrm({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      where,
    }),
    countReviewsOrm({ where }),
  ]);

  return {
    data: reviews,
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getReviewAnalyticsAction(
  options: {
    dateFrom?: Date;
    dateTo?: Date;
    productId?: string;
    userId?: string;
  } = {},
) {
  'use server';

  const { dateFrom, dateTo, productId, userId } = options;

  const where: any = {};

  if (productId) {
    where.productId = productId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [totalReviews, averageRating] = await Promise.all([
    countReviewsOrm({ where }),
    aggregateReviewsOrm({
      _avg: { rating: true },
      where,
    }),
  ]);

  return {
    averageRating: averageRating._avg?.rating ?? 0,
    totalReviews,
  };
}

//==============================================================================
// REVIEW VOTE ACTIONS
//==============================================================================

export async function createReviewVoteAction(data: any) {
  'use server';

  return createReviewVoteJoinOrm({
    data,
  });
}

export async function deleteReviewVoteAction(id: string) {
  'use server';

  return deleteReviewVoteJoinOrm({
    where: { id },
  });
}

export async function getReviewVotesAction(reviewId: string) {
  'use server';

  const votes = await findManyReviewVoteJoinsOrm({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: { reviewId },
  });

  return votes;
}
