/**
 * ORM Fragments - Main Export File
 *
 * This file re-exports all fragments from the organized category structure
 * to maintain backward compatibility with existing imports.
 *
 * Organized structure:
 * - shared/: DRY utilities and common patterns (NEW - Phase 1)
 * - auth/: User, Organization, Session, Member fragments
 * - community/: Article, Post fragments
 */

// ==================== SHARED FRAGMENT UTILITIES (Phase 1) ====================
// Export DRY utilities for fragment composition
export * from './shared';

// Authentication model fragments (Phase 5.3.1)
export * from './auth';

// Community content fragments (Phase 5.3.4)
export * from './community';

// Example/Test fragments (preserved for reference)
import { Prisma } from '../../../generated/client/client';

// User fragments (example/test model)
export const userSelect = {
  basic: {
    id: true,
    email: true,
    name: true,
  },

  minimal: {
    id: true,
    email: true,
    name: true,
  },

  complete: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: { posts: true },
    },
  },

  withPostCount: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: { posts: true },
    },
  },
} as const satisfies Record<string, Prisma.UserSelect>;

export const userInclude = {
  withPosts: {
    posts: true,
  },

  withPublishedPosts: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    },
  },

  withRecentPosts: {
    posts: {
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },
} as const satisfies Record<string, Prisma.UserInclude>;

// Post fragments (example/test model)
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

  minimal: {
    id: true,
    title: true,
    published: true,
    authorId: true,
    createdAt: true,
  },

  withAuthor: {
    id: true,
    title: true,
    content: true,
    published: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
} as const satisfies Record<string, Prisma.PostSelect>;

export const postInclude = {
  withAuthor: {
    author: true,
  },

  withAuthorMinimal: {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
} as const satisfies Record<string, Prisma.PostInclude>;

// Common where clauses for examples
export const userWhere = {
  active: {} satisfies Prisma.UserWhereInput,

  withEmail: (email: string) =>
    ({
      email,
    }) satisfies Prisma.UserWhereInput,

  withPosts: {
    posts: {
      some: {},
    },
  } satisfies Prisma.UserWhereInput,

  withPublishedPosts: {
    posts: {
      some: {
        published: true,
      },
    },
  } satisfies Prisma.UserWhereInput,
} as const;

export const postWhere = {
  published: { published: true } satisfies Prisma.PostWhereInput,
  draft: { published: false } satisfies Prisma.PostWhereInput,

  byAuthor: (authorId: string) =>
    ({
      authorId,
    }) satisfies Prisma.PostWhereInput,

  withContent: {
    content: {
      not: null,
    },
  } satisfies Prisma.PostWhereInput,
} as const;

// Order by fragments for examples
export const userOrderBy = {
  newest: { createdAt: 'desc' } satisfies Prisma.UserOrderByWithRelationInput,
  oldest: { createdAt: 'asc' } satisfies Prisma.UserOrderByWithRelationInput,
  alphabetical: { name: 'asc' } satisfies Prisma.UserOrderByWithRelationInput,
  mostPosts: {
    posts: {
      _count: 'desc',
    },
  } satisfies Prisma.UserOrderByWithRelationInput,
} as const;

export const postOrderBy = {
  newest: { createdAt: 'desc' } satisfies Prisma.PostOrderByWithRelationInput,
  oldest: { createdAt: 'asc' } satisfies Prisma.PostOrderByWithRelationInput,
  alphabetical: { title: 'asc' } satisfies Prisma.PostOrderByWithRelationInput,
  updated: { updatedAt: 'desc' } satisfies Prisma.PostOrderByWithRelationInput,
} as const;

// Type helpers for fragment results
export type UserBasic = Prisma.UserGetPayload<{
  select: typeof userSelect.basic;
}>;

export type UserMinimal = Prisma.UserGetPayload<{
  select: typeof userSelect.basic;
}>;

export type UserComplete = Prisma.UserGetPayload<{
  select: typeof userSelect.complete;
}>;

export type UserWithPosts = Prisma.UserGetPayload<{
  include: typeof userInclude.withPosts;
}>;

export type UserWithPostCount = Prisma.UserGetPayload<{
  select: typeof userSelect.complete;
}>;

export type PostBasic = Prisma.PostGetPayload<{
  select: typeof postSelect.basic;
}>;

export type PostMinimal = Prisma.PostGetPayload<{
  select: typeof postSelect.minimal;
}>;

export type PostWithAuthor = Prisma.PostGetPayload<{
  select: typeof postSelect.withAuthor;
}>;

export type PostWithAuthorInclude = Prisma.PostGetPayload<{
  include: typeof postInclude.withAuthor;
}>;

// User validation utilities
export const userValidation = {
  validateEmail: (email: string) => {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    return email.trim().toLowerCase();
  },

  validateName: (name: string) => {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (name.length > 255) {
      throw new Error('Name must be less than 255 characters');
    }
    return name.trim();
  },

  createInput: (data: { email: string; name?: string }) => {
    const result: any = {
      email: userValidation.validateEmail(data.email),
    };
    if (data.name !== undefined) {
      result.name = userValidation.validateName(data.name);
    }
    return result;
  },

  updateInput: (data: { email?: string; name?: string }) => {
    const updateData: any = {};
    if (data.email !== undefined) {
      updateData.email = userValidation.validateEmail(data.email);
    }
    if (data.name !== undefined) {
      updateData.name = userValidation.validateName(data.name);
    }
    return updateData;
  },
} as const;

// Post validation utilities
export const postValidation = {
  validateTitle: (title: string) => {
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (title.length > 255) {
      throw new Error('Title must be less than 255 characters');
    }
    return title.trim();
  },

  validateContent: (content: string | null | undefined) => {
    if (content && content.length > 10000) {
      throw new Error('Content must be less than 10000 characters');
    }
    return content?.trim() || null;
  },

  validatePublished: (published: boolean | undefined) => {
    return published ?? false;
  },

  createInput: (data: {
    title: string;
    content?: string;
    published?: boolean;
    authorId: string;
  }) => {
    return {
      title: postValidation.validateTitle(data.title),
      content: postValidation.validateContent(data.content),
      published: postValidation.validatePublished(data.published),
      authorId: data.authorId,
    };
  },

  updateInput: (data: { title?: string; content?: string; published?: boolean }) => {
    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = postValidation.validateTitle(data.title);
    }
    if (data.content !== undefined) {
      updateData.content = postValidation.validateContent(data.content);
    }
    if (data.published !== undefined) {
      updateData.published = postValidation.validatePublished(data.published);
    }
    return updateData;
  },
} as const;

// Fragment validation utilities (legacy compatibility)
export interface FragmentValidationResult {
  totalFragments: number;
  validFragments: number;
  invalidFragments: number;
  issues: string[];
  suggestions: string[];
}

/**
 * Validate all fragments against schema (legacy function)
 */
export function validateAllFragments(): Array<{
  model: string;
  fragment: string;
  validation: {
    isValid: boolean;
    extraFields: string[];
    suggestions: string[];
  };
}> {
  // This is a placeholder for the original validation logic
  // The original validation helpers lived in schema-registry.ts (now removed)
  return [];
}

/**
 * Get validation report (legacy function)
 */
export function getValidationReport(): FragmentValidationResult {
  return {
    totalFragments: 0,
    validFragments: 0,
    invalidFragments: 0,
    issues: [],
    suggestions: [],
  };
}

// Fragment builders for dynamic queries
export const fragmentBuilders = {
  userSelectBuilder: <T extends keyof typeof userSelect>(fragmentName: T) =>
    userSelect[fragmentName],
  postSelectBuilder: <T extends keyof typeof postSelect>(fragmentName: T) =>
    postSelect[fragmentName],
  userIncludeBuilder: <T extends keyof typeof userInclude>(fragmentName: T) =>
    userInclude[fragmentName],
  postIncludeBuilder: <T extends keyof typeof postInclude>(fragmentName: T) =>
    postInclude[fragmentName],
} as const;

// Input transformation utilities (legacy compatibility)
export const userInputUtils = {
  createUser: (data: { email: string; name: string }) => {
    const createData: any = { ...data };
    if (data.email?.trim) {
      createData.email = data.email.trim().toLowerCase();
    }
    if (data.name?.trim) {
      createData.name = data.name.trim();
    }
    return createData;
  },

  updateUser: (data: { email?: string; name?: string }) => {
    const updateData: any = {};
    if (data.email !== undefined) {
      updateData.email = data.email?.trim()?.toLowerCase() || undefined;
    }
    if (data.name !== undefined) {
      updateData.name = data.name?.trim() || undefined;
    }
    return updateData;
  },
} as const;

export const postInputUtils = {
  createPost: (data: { title: string; content?: string; published?: boolean }) => {
    const createData: any = { ...data };
    if (data.title?.trim) {
      createData.title = data.title.trim();
    }
    if (data.content?.trim) {
      createData.content = data.content.trim();
    }
    if (data.published === undefined) {
      createData.published = false;
    }
    return createData;
  },

  updatePost: (data: { title?: string; content?: string; published?: boolean }) => {
    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title?.trim() || undefined;
    }
    if (data.content !== undefined) {
      updateData.content = data.content?.trim() || undefined;
    }
    if (data.published !== undefined) {
      updateData.published = data.published;
    }
    return updateData;
  },
} as const;
