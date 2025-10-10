import { Prisma } from '../../../../generated/client/client';

/**
 * Reusable Prisma query fragments for Article model
 * All fragments use proper const assertion with satisfies for optimal type inference
 */

// ==================== ARTICLE FRAGMENTS ====================

// Article select fragments
export const articleSelect = {
  basic: {
    id: true,
    title: true,
    slug: true,
    status: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  },

  complete: {
    id: true,
    title: true,
    slug: true,
    content: true,
    status: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    deletedById: true,
  },
} as const satisfies Record<string, any>;

// Article include fragments
export const articleInclude = {
  withUser: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerifiedAuthor: true,
      },
    },
  },

  // withMedia removed - Article model does not have media relation

  withDeletedBy: {
    deletedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },

  complete: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerifiedAuthor: true,
      },
    },
    // media removed - Article model does not have media relation
    deletedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },

  comprehensive: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerifiedAuthor: true,
        banned: true,
        expertise: true,
        bio: true,
        createdAt: true,
      },
    },
    // media removed - Article model does not have media relation
    deletedBy: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
} as const satisfies Record<string, any>;

// Article where clauses
export const articleWhere = {
  active: {
    deletedAt: null,
  } as const,

  deleted: {
    deletedAt: {
      not: null,
    },
  } as const,

  published: {
    status: 'PUBLISHED',
    deletedAt: null,
  } as const,

  draft: {
    status: 'DRAFT',
    deletedAt: null,
  } as const,

  pending: {
    status: 'PENDING',
    deletedAt: null,
  } as const,

  archived: {
    status: 'ARCHIVED',
    deletedAt: null,
  } as const,

  byUser: (userId: string) =>
    ({
      userId,
      deletedAt: null,
    }) as const,

  bySlug: (slug: string) =>
    ({
      slug,
      deletedAt: null,
    }) as const,

  withUser: {
    userId: {
      not: null,
    },
    deletedAt: null,
  } as const,

  withoutUser: {
    userId: null,
    deletedAt: null,
  } as const,

  byAuthorRole: (role: string) =>
    ({
      user: {
        role,
        deletedAt: null,
      },
      deletedAt: null,
    }) as const,

  byVerifiedAuthors: {
    user: {
      isVerifiedAuthor: true,
      deletedAt: null,
    },
    deletedAt: null,
  } as const,

  byNonVerifiedAuthors: {
    user: {
      isVerifiedAuthor: false,
      deletedAt: null,
    },
    deletedAt: null,
  } as const,

  searchTitle: (searchTerm: string) =>
    ({
      title: {
        contains: searchTerm,
        mode: 'insensitive',
      },
      deletedAt: null,
    }) as const,

  // withMedia and withoutMedia removed - Article model does not have media relation

  recentlyCreated: (daysAgo: number = 7) =>
    ({
      createdAt: {
        gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
      deletedAt: null,
    }) as const,

  recentlyUpdated: (daysAgo: number = 7) =>
    ({
      updatedAt: {
        gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
      deletedAt: null,
    }) as const,

  publishedSince: (date: Date) =>
    ({
      status: 'PUBLISHED',
      updatedAt: {
        gte: date,
      },
      deletedAt: null,
    }) as const,

  createdThisWeek: {
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    deletedAt: null,
  } as const,

  createdThisMonth: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    deletedAt: null,
  } as const,

  needsModeration: {
    status: 'PENDING',
    deletedAt: null,
  } as const,

  readyToPublish: {
    status: 'DRAFT',
    content: {
      not: null,
    },
    deletedAt: null,
  } as const,
} as const;

// Article order by fragments
export const articleOrderBy = {
  newest: { createdAt: 'desc' } as const,
  oldest: { createdAt: 'asc' } as const,
  updated: { updatedAt: 'desc' } as const,
  titleAlphabetical: { title: 'asc' } as const,
  slugAlphabetical: { slug: 'asc' } as const,
  statusAlphabetical: { status: 'asc' } as const,
  publishedFirst: {
    status: 'desc',
    updatedAt: 'desc',
  } as const,
  draftFirst: {
    status: 'asc',
    updatedAt: 'desc',
  } as const,
  authorAlphabetical: {
    user: {
      name: 'asc',
    },
  } as const,
  verifiedAuthorsFirst: {
    user: {
      isVerifiedAuthor: 'desc',
      name: 'asc',
    },
  } as const,
  // mostMediaFirst removed - Article model does not have media relation
} as const;

export type ArticleWithUser = Prisma.ArticleGetPayload<{
  include: typeof articleInclude.withUser;
}>;

export type ArticleWithDeletedBy = Prisma.ArticleGetPayload<{
  include: typeof articleInclude.withDeletedBy;
}>;

export type ArticleCompleteWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleInclude.complete;
}>;

export type ArticleComprehensive = Prisma.ArticleGetPayload<{
  include: typeof articleInclude.comprehensive;
}>;

// ==================== MODERN PRISMA 6+ VALIDATORS ====================

/**
 * Prisma.validator patterns for type-safe, reusable query fragments
 * Following modern Prisma 6+ best practices
 */

// Select validators
export const articleSelectBasic = {
  select: articleSelect.basic,
} as const;

export const articleSelectComplete = {
  select: articleSelect.complete,
} as const;

// Include validators
export const articleIncludeWithUser = {
  include: articleInclude.withUser,
} as const;

export const articleIncludeWithDeletedBy = {
  include: articleInclude.withDeletedBy,
} as const;

export const articleIncludeComplete = {
  include: articleInclude.complete,
} as const;

export const articleIncludeComprehensive = {
  include: articleInclude.comprehensive,
} as const;

// Where clause validators
export const articleWhereActive = articleWhere.active;

export const articleWhereDeleted = articleWhere.deleted;

export const articleWherePublished = articleWhere.published;

export const articleWhereDraft = articleWhere.draft;

// Note: Using any due to readonly constraint
export const articleWherePending = articleWhere.pending;

export const articleWhereArchived = articleWhere.archived;

export const articleWhereWithUser = articleWhere.withUser;

export const articleWhereWithoutUser = articleWhere.withoutUser;

export const articleWhereByVerifiedAuthors = articleWhere.byVerifiedAuthors;

export const articleWhereByNonVerifiedAuthors = articleWhere.byNonVerifiedAuthors;

// articleWhereWithMedia and articleWhereWithoutMedia removed - Article model does not have media relation

export const articleWhereCreatedThisWeek = articleWhere.createdThisWeek;

export const articleWhereCreatedThisMonth = articleWhere.createdThisMonth;

// Note: Using any due to readonly constraint
export const articleWhereNeedsModeration = articleWhere.needsModeration;

// Note: Using any due to readonly constraint
export const articleWhereReadyToPublish = articleWhere.readyToPublish;

// OrderBy validators
export const articleOrderByNewest = articleOrderBy.newest;

export const articleOrderByOldest = articleOrderBy.oldest;

export const articleOrderByUpdated = articleOrderBy.updated;

export const articleOrderByTitleAlphabetical = articleOrderBy.titleAlphabetical;

export const articleOrderBySlugAlphabetical = articleOrderBy.slugAlphabetical;

export const articleOrderByStatusAlphabetical = articleOrderBy.statusAlphabetical;

export const articleOrderByPublishedFirst = articleOrderBy.publishedFirst;

export const articleOrderByDraftFirst = articleOrderBy.draftFirst;

export const articleOrderByAuthorAlphabetical = articleOrderBy.authorAlphabetical;

export const articleOrderByVerifiedAuthorsFirst = articleOrderBy.verifiedAuthorsFirst;

// articleOrderByMostMediaFirst removed - Article model does not have media relation

// Typed result types using validators
export type ArticleBasicResult = Prisma.ArticleGetPayload<typeof articleSelectBasic>;
export type ArticleCompleteResult = Prisma.ArticleGetPayload<typeof articleSelectComplete>;

export type ArticleWithUserResult = Prisma.ArticleGetPayload<typeof articleIncludeWithUser>;
export type ArticleWithDeletedByResult = Prisma.ArticleGetPayload<
  typeof articleIncludeWithDeletedBy
>;
export type ArticleCompleteWithRelationsResult = Prisma.ArticleGetPayload<
  typeof articleIncludeComplete
>;
export type ArticleComprehensiveResult = Prisma.ArticleGetPayload<
  typeof articleIncludeComprehensive
>;

// Legacy type helpers (for backward compatibility)
export type ArticleBasic = Prisma.ArticleGetPayload<{
  select: typeof articleSelect.basic;
}>;

export type ArticleComplete = Prisma.ArticleGetPayload<{
  select: typeof articleSelect.complete;
  include: typeof articleInclude.complete;
}>;
