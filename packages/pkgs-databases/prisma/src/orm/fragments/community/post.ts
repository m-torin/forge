import { Prisma } from '../../../../generated/client/client';

/**
 * Reusable Prisma query fragments for Post model
 * All fragments use proper const assertion with satisfies for optimal type inference
 */

// ==================== POST FRAGMENTS ====================

// Post select fragments
export const postSelect = {
  basic: {
    id: true,
    title: true,
    content: true,
    published: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
  },

  complete: {
    id: true,
    title: true,
    content: true,
    published: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
  },
} as const satisfies Record<string, any>;

// Post include fragments
export const postInclude = {
  withAuthor: {
    author: {
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

  complete: {
    author: {
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

  comprehensive: {
    author: {
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
  },
} as const satisfies Record<string, any>;

// Post where clauses
export const postWhere = {
  all: {} as const,

  published: {
    published: true,
  } as const,

  draft: {
    published: false,
  } as const,

  byAuthor: (authorId: string) =>
    ({
      authorId,
    }) as const,

  withContent: {
    content: {
      not: null,
    },
  } as const,

  withoutContent: {
    content: null,
  } as const,

  searchTitle: (searchTerm: string) =>
    ({
      title: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }) as const,

  searchContent: (searchTerm: string) =>
    ({
      content: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }) as const,

  searchTitleOrContent: (searchTerm: string) =>
    ({
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    }) as const,

  byVerifiedAuthors: {
    author: {
      isVerifiedAuthor: true,
      deletedAt: null,
    },
  } as const,

  byNonVerifiedAuthors: {
    author: {
      isVerifiedAuthor: false,
      deletedAt: null,
    },
  } as const,

  byAuthorRole: (role: string) =>
    ({
      author: {
        role,
        deletedAt: null,
      },
    }) as const,

  byActiveAuthors: {
    author: {
      deletedAt: null,
      banned: false,
    },
  } as const,

  recentlyCreated: (daysAgo: number = 7) =>
    ({
      createdAt: {
        gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    }) as const,

  recentlyUpdated: (daysAgo: number = 7) =>
    ({
      updatedAt: {
        gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    }) as const,

  publishedSince: (date: Date) =>
    ({
      published: true,
      updatedAt: {
        gte: date,
      },
    }) as const,

  createdThisWeek: {
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  } as const,

  createdThisMonth: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  } as const,

  publishedThisWeek: {
    published: true,
    updatedAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  } as const,

  publishedThisMonth: {
    published: true,
    updatedAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  } as const,

  draftsWithContent: {
    published: false,
    content: {
      not: null,
    },
  } as const,

  emptyDrafts: {
    published: false,
    content: null,
  } as const,
} as const;

// Post order by fragments
export const postOrderBy = {
  newest: { createdAt: 'desc' } as const,
  oldest: { createdAt: 'asc' } as const,
  updated: { updatedAt: 'desc' } as const,
  titleAlphabetical: { title: 'asc' } as const,
  publishedFirst: {
    published: 'desc',
    updatedAt: 'desc',
  } as const,
  draftFirst: {
    published: 'asc',
    updatedAt: 'desc',
  } as const,
  authorAlphabetical: {
    author: {
      name: 'asc',
    },
  } as const,
  verifiedAuthorsFirst: {
    author: {
      isVerifiedAuthor: 'desc',
      name: 'asc',
    },
  } as const,
  authorNewest: {
    author: {
      createdAt: 'desc',
    },
  } as const,
} as const;

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: typeof postInclude.withAuthor;
}>;

export type PostCompleteWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude.complete;
}>;

export type PostComprehensive = Prisma.PostGetPayload<{
  include: typeof postInclude.comprehensive;
}>;

// ==================== MODERN PRISMA 6+ VALIDATORS ====================

/**
 * Prisma.validator patterns for type-safe, reusable query fragments
 * Following modern Prisma 6+ best practices
 */

// Select validators
export const postSelectBasic = {
  select: postSelect.basic,
} as const;

export const postSelectComplete = {
  select: postSelect.complete,
} as const;

// Include validators
export const postIncludeWithAuthor = {
  include: postInclude.withAuthor,
} as const;

export const postIncludeComplete = {
  include: postInclude.complete,
} as const;

export const postIncludeComprehensive = {
  include: postInclude.comprehensive,
} as const;

// Where clause validators
export const postWhereAll = postWhere.all;

export const postWherePublished = postWhere.published;

export const postWhereDraft = postWhere.draft;

export const postWhereWithContent = postWhere.withContent;

export const postWhereWithoutContent = postWhere.withoutContent;

export const postWhereByVerifiedAuthors = postWhere.byVerifiedAuthors;

export const postWhereByNonVerifiedAuthors = postWhere.byNonVerifiedAuthors;

export const postWhereByActiveAuthors = postWhere.byActiveAuthors;

export const postWhereCreatedThisWeek = postWhere.createdThisWeek;

export const postWhereCreatedThisMonth = postWhere.createdThisMonth;

export const postWherePublishedThisWeek = postWhere.publishedThisWeek;

export const postWherePublishedThisMonth = postWhere.publishedThisMonth;

export const postWhereDraftsWithContent = postWhere.draftsWithContent;

export const postWhereEmptyDrafts = postWhere.emptyDrafts;

// OrderBy validators
export const postOrderByNewest = postOrderBy.newest;

export const postOrderByOldest = postOrderBy.oldest;

export const postOrderByUpdated = postOrderBy.updated;

export const postOrderByTitleAlphabetical = postOrderBy.titleAlphabetical;

export const postOrderByPublishedFirst = postOrderBy.publishedFirst;

export const postOrderByDraftFirst = postOrderBy.draftFirst;

export const postOrderByAuthorAlphabetical = postOrderBy.authorAlphabetical;

export const postOrderByVerifiedAuthorsFirst = postOrderBy.verifiedAuthorsFirst;

export const postOrderByAuthorNewest = postOrderBy.authorNewest;

// Typed result types using validators
export type PostBasicResult = Prisma.PostGetPayload<typeof postSelectBasic>;
export type PostCompleteResult = Prisma.PostGetPayload<typeof postSelectComplete>;

export type PostWithAuthorResult = Prisma.PostGetPayload<typeof postIncludeWithAuthor>;
export type PostCompleteWithRelationsResult = Prisma.PostGetPayload<typeof postIncludeComplete>;
export type PostComprehensiveResult = Prisma.PostGetPayload<typeof postIncludeComprehensive>;

// Legacy type helpers (for backward compatibility)
export type PostBasic = Prisma.PostGetPayload<{
  select: typeof postSelect.basic;
}>;

export type PostComplete = Prisma.PostGetPayload<{
  select: typeof postSelect.complete;
  include: typeof postInclude.complete;
}>;
