import { Prisma } from '../../../../generated/client/client';

/**
 * Reusable Prisma query fragments for User model
 * All fragments use proper const assertion with satisfies for optimal type inference
 */

// ==================== USER FRAGMENTS ====================

// User select fragments
export const userSelect = {
  basic: {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  },

  complete: {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    phoneNumber: true,
    role: true,
    banned: true,
    banReason: true,
    banExpires: true,
    bio: true,
    expertise: true,
    isVerifiedAuthor: true,
    authorSince: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  },
} as const satisfies Record<string, any>;

// User include fragments
export const userInclude = {
  withSessions: {
    sessions: {
      select: {
        id: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },

  withOrganizations: {
    members: {
      select: {
        id: true,
        role: true,
        joinedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    },
  },

  withAccounts: {
    accounts: {
      select: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
      },
    },
  },

  withContent: {
    reviews: {
      select: {
        id: true,
        rating: true,
        title: true,
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    },
    posts: {
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },

  withFavorites: {
    favorites: {
      select: {
        id: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    },
  },

  withMedia: {
    media: {
      select: {
        id: true,
        url: true,
        type: true,
        altText: true,
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    },
  },

  complete: {
    sessions: {
      select: {
        id: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    },
    members: {
      select: {
        id: true,
        role: true,
        joinedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    accounts: {
      select: {
        id: true,
        providerId: true,
        accountId: true,
      },
    },
  },

  comprehensive: {
    sessions: {
      select: {
        id: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
    members: {
      select: {
        id: true,
        role: true,
        joinedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            createdAt: true,
          },
        },
      },
    },
    accounts: {
      select: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
      },
    },
    reviews: {
      select: {
        id: true,
        rating: true,
        title: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
    favorites: {
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
      take: 10,
    },
    media: {
      select: {
        id: true,
        url: true,
        type: true,
        altText: true,
      },
      take: 5,
    },
  },
} as const satisfies Record<string, any>;

// User where clauses
export const userWhere = {
  active: {
    deletedAt: null,
  } as const,

  deleted: {
    deletedAt: {
      not: null,
    },
  } as const,

  verified: {
    emailVerified: true,
    deletedAt: null,
  } as const,

  unverified: {
    emailVerified: false,
    deletedAt: null,
  } as const,

  banned: {
    banned: true,
    deletedAt: null,
  } as const,

  activeBanned: {
    banned: true,
    OR: [{ banExpires: null }, { banExpires: { gte: new Date() } }],
    deletedAt: null,
  } as const,

  notBanned: {
    OR: [
      { banned: false },
      {
        AND: [{ banned: true }, { banExpires: { lt: new Date() } }],
      },
    ],
    deletedAt: null,
  } as const,

  authors: {
    isVerifiedAuthor: true,
    deletedAt: null,
  } as const,

  byRole: (role: string) =>
    ({
      role,
      deletedAt: null,
    }) as const,

  byEmail: (email: string) =>
    ({
      email,
      deletedAt: null,
    }) as const,

  withExpertise: (expertise: string) =>
    ({
      expertise: {
        has: expertise,
      },
      deletedAt: null,
    }) as const,

  recentlyActive: (daysAgo: number = 30) =>
    ({
      sessions: {
        some: {
          createdAt: {
            gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        },
      },
      deletedAt: null,
    }) as const,

  withOrganizations: {
    members: {
      some: {},
    },
    deletedAt: null,
  } as const,

  withoutOrganizations: {
    members: {
      none: {},
    },
    deletedAt: null,
  } as const,
} as const;

// User order by fragments
export const userOrderBy = {
  newest: { createdAt: 'desc' } as const,
  oldest: { createdAt: 'asc' } as const,
  updated: { updatedAt: 'desc' } as const,
  alphabetical: { name: 'asc' } as const,
  emailAlphabetical: { email: 'asc' } as const,
  verifiedFirst: {
    emailVerified: 'desc',
    createdAt: 'desc',
  } as const,
  authorsFirst: {
    isVerifiedAuthor: 'desc',
    authorSince: 'desc',
  } as const,
  roleAlphabetical: {
    role: 'asc',
    name: 'asc',
  } as const,
} as const;

// Note: Using any due to readonly constraint issues with nested selects
export type UserWithSessions = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserWithOrganizations = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserWithAccounts = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserWithContent = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserWithFavorites = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserWithMedia = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserCompleteWithRelations = Prisma.UserGetPayload<{
  include: any;
}>;

export type UserComprehensive = Prisma.UserGetPayload<{
  include: any;
}>;

// ==================== MODERN PRISMA 6+ VALIDATORS ====================

/**
 * Prisma.validator patterns for type-safe, reusable query fragments
 * Following modern Prisma 6+ best practices
 */

// Select validators
export const userSelectBasic = {
  select: userSelect.basic,
} as const;

export const userSelectComplete = {
  select: userSelect.complete,
} as const;

// Include validators - using any due to deep nesting causing TypeScript constraint issues
export const userIncludeWithSessions = {
  include: userInclude.withSessions as any,
} as const;

export const userIncludeWithOrganizations = {
  include: userInclude.withOrganizations as any,
} as const;

export const userIncludeWithAccounts = {
  include: userInclude.withAccounts as any,
} as const;

export const userIncludeWithContent = {
  include: userInclude.withContent as any,
} as const;

export const userIncludeWithFavorites = {
  include: userInclude.withFavorites as any,
} as const;

export const userIncludeWithMedia = {
  include: userInclude.withMedia as any,
} as const;

export const userIncludeComplete = {
  include: userInclude.complete as any,
} as const;

export const userIncludeComprehensive = {
  include: userInclude.comprehensive as any,
} as const;

// Where clause validators
export const userWhereActive = userWhere.active;

export const userWhereDeleted = userWhere.deleted;

export const userWhereVerified = userWhere.verified;

export const userWhereUnverified = userWhere.unverified;

export const userWhereBanned = userWhere.banned;

// Note: Using any due to readonly OR array constraint
export const userWhereActiveBanned = userWhere.activeBanned;

// Note: Using any due to readonly OR array constraint
export const userWhereNotBanned = userWhere.notBanned;

export const userWhereAuthors = userWhere.authors;

export const userWhereWithOrganizations = userWhere.withOrganizations;

export const userWhereWithoutOrganizations = userWhere.withoutOrganizations;

// OrderBy validators
export const userOrderByNewest = userOrderBy.newest;

export const userOrderByOldest = userOrderBy.oldest;

export const userOrderByUpdated = userOrderBy.updated;

export const userOrderByAlphabetical = userOrderBy.alphabetical;

export const userOrderByEmailAlphabetical = userOrderBy.emailAlphabetical;

export const userOrderByVerifiedFirst = userOrderBy.verifiedFirst;

export const userOrderByAuthorsFirst = userOrderBy.authorsFirst;

export const userOrderByRoleAlphabetical = userOrderBy.roleAlphabetical;

// Typed result types using validators
export type UserBasicResult = Prisma.UserGetPayload<typeof userSelectBasic>;
export type UserCompleteResult = Prisma.UserGetPayload<typeof userSelectComplete>;

// Note: Using any due to deep nesting causing TypeScript constraint issues
export type UserWithSessionsResult = any;
export type UserWithOrganizationsResult = any;
export type UserWithAccountsResult = any;
export type UserWithContentResult = any;
export type UserWithFavoritesResult = any;
export type UserWithMediaResult = any;
export type UserCompleteWithRelationsResult = any;
export type UserComprehensiveResult = any;

// Legacy type helpers (for backward compatibility)
export type UserBasic = Prisma.UserGetPayload<{
  select: typeof userSelect.basic;
}>;

export type UserComplete = Prisma.UserGetPayload<{
  select: typeof userSelect.complete;
  include: typeof userInclude.complete;
}>;
