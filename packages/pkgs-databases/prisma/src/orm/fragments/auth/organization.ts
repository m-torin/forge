import { Prisma } from '../../../../generated/client/client';

/**
 * Reusable Prisma query fragments for Organization model
 * All fragments use proper const assertion with satisfies for optimal type inference
 */

// ==================== ORGANIZATION FRAGMENTS ====================

// Organization select fragments
export const organizationSelect = {
  basic: {
    id: true,
    name: true,
    slug: true,
    logo: true,
    createdAt: true,
    updatedAt: true,
  },

  complete: {
    id: true,
    name: true,
    slug: true,
    logo: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
  },
} as const satisfies Record<string, any>;

// Organization include fragments
export const organizationInclude = {
  withMembers: {
    members: {
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    },
  },

  withInvitations: {
    invitations: {
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },

  withSessions: {
    sessions: {
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        ipAddress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },

  complete: {
    members: {
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    },
    invitations: {
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      where: {
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    },
  },

  comprehensive: {
    members: {
      select: {
        id: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isVerifiedAuthor: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] as any,
    },
    invitations: {
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    },
    sessions: {
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        ipAddress: true,
        createdAt: true,
      },
      where: {
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    },
  },
} as const satisfies Record<string, any>;

// Organization where clauses
export const organizationWhere = {
  all: {} as const,

  withSlug: {
    slug: {
      not: null,
    },
  } as const,

  withoutSlug: {
    slug: null,
  } as const,

  bySlug: (slug: string) =>
    ({
      slug,
    }) as const,

  byName: (name: string) =>
    ({
      name: {
        contains: name,
        mode: 'insensitive',
      },
    }) as const,

  withMembers: {
    members: {
      some: {},
    },
  } as const,

  withoutMembers: {
    members: {
      none: {},
    },
  } as const,

  withActiveMembers: {
    members: {
      some: {
        user: {
          deletedAt: null,
          banned: false,
        },
      },
    },
  } as const,

  withMemberRole: (role: string) =>
    ({
      members: {
        some: {
          role,
        },
      },
    }) as const,

  withUser: (userId: string) =>
    ({
      members: {
        some: {
          userId,
        },
      },
    }) as const,

  withActiveInvitations: {
    invitations: {
      some: {
        expiresAt: {
          gte: new Date(),
        },
        status: 'PENDING',
      },
    },
  } as const,

  recentlyActive: (daysAgo: number = 30) =>
    ({
      OR: [
        {
          members: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        {
          sessions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      ],
    }) as const,

  createdSince: (date: Date) =>
    ({
      createdAt: {
        gte: date,
      },
    }) as const,
} as const;

// Organization order by fragments
export const organizationOrderBy = {
  newest: { createdAt: 'desc' } as const,
  oldest: { createdAt: 'asc' } as const,
  updated: { updatedAt: 'desc' } as const,
  alphabetical: { name: 'asc' } as const,
  slugAlphabetical: { slug: 'asc' } as const,
  memberCount: {
    members: {
      _count: 'desc',
    },
  } as const,
  mostActive: {
    sessions: {
      _count: 'desc',
    },
  } as const,
} as const;

// Note: Using any due to readonly constraint issues with orderBy arrays
export type OrganizationWithMembers = Prisma.OrganizationGetPayload<{
  include: any;
}>;

export type OrganizationWithInvitations = Prisma.OrganizationGetPayload<{
  include: any;
}>;

export type OrganizationWithSessions = Prisma.OrganizationGetPayload<{
  include: any;
}>;

export type OrganizationCompleteWithRelations = Prisma.OrganizationGetPayload<{
  include: any;
}>;

export type OrganizationComprehensive = Prisma.OrganizationGetPayload<{
  include: any;
}>;

// ==================== MODERN PRISMA 6+ VALIDATORS ====================

/**
 * Prisma.validator patterns for type-safe, reusable query fragments
 * Following modern Prisma 6+ best practices
 */

// Select validators
export const organizationSelectBasic = {
  select: organizationSelect.basic,
} as const;

export const organizationSelectComplete = {
  select: organizationSelect.complete,
} as const;

// Include validators
export const organizationIncludeWithMembers = {
  include: organizationInclude.withMembers as any,
} as const;

export const organizationIncludeWithInvitations = {
  include: organizationInclude.withInvitations as any,
} as const;

export const organizationIncludeWithSessions = {
  include: organizationInclude.withSessions as any,
} as const;

export const organizationIncludeComplete = {
  include: organizationInclude.complete as any,
} as const;

export const organizationIncludeComprehensive = {
  include: organizationInclude.comprehensive as any,
} as const;

// Where clause validators
export const organizationWhereAll = organizationWhere.all;

export const organizationWhereWithSlug = organizationWhere.withSlug;

export const organizationWhereWithoutSlug = organizationWhere.withoutSlug;

export const organizationWhereWithMembers = organizationWhere.withMembers;

export const organizationWhereWithoutMembers = organizationWhere.withoutMembers;

export const organizationWhereWithActiveMembers = organizationWhere.withActiveMembers;

export const organizationWhereWithActiveInvitations = organizationWhere.withActiveInvitations;

// OrderBy validators
export const organizationOrderByNewest = organizationOrderBy.newest;

export const organizationOrderByOldest = organizationOrderBy.oldest;

export const organizationOrderByUpdated = organizationOrderBy.updated;

export const organizationOrderByAlphabetical = organizationOrderBy.alphabetical;

export const organizationOrderBySlugAlphabetical = organizationOrderBy.slugAlphabetical;

export const organizationOrderByMemberCount = organizationOrderBy.memberCount;

export const organizationOrderByMostActive = organizationOrderBy.mostActive;

// Typed result types using validators
export type OrganizationBasicResult = Prisma.OrganizationGetPayload<typeof organizationSelectBasic>;
export type OrganizationCompleteResult = Prisma.OrganizationGetPayload<
  typeof organizationSelectComplete
>;

export type OrganizationWithMembersResult = Prisma.OrganizationGetPayload<
  typeof organizationIncludeWithMembers
>;
export type OrganizationWithInvitationsResult = Prisma.OrganizationGetPayload<
  typeof organizationIncludeWithInvitations
>;
export type OrganizationWithSessionsResult = Prisma.OrganizationGetPayload<
  typeof organizationIncludeWithSessions
>;
export type OrganizationCompleteWithRelationsResult = Prisma.OrganizationGetPayload<
  typeof organizationIncludeComplete
>;
export type OrganizationComprehensiveResult = Prisma.OrganizationGetPayload<
  typeof organizationIncludeComprehensive
>;

// Legacy type helpers (for backward compatibility)
export type OrganizationBasic = Prisma.OrganizationGetPayload<{
  select: typeof organizationSelect.basic;
}>;

export type OrganizationComplete = Prisma.OrganizationGetPayload<{
  select: typeof organizationSelect.complete;
  include: typeof organizationInclude.complete;
}>;
