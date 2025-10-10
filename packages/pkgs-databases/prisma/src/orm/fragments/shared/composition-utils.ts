/**
 * Fragment composition utilities for building complex queries
 *
 * These utilities provide type-safe composition of common patterns,
 * allowing dynamic fragment building while maintaining type safety.
 */

import type {
  ComposableInclude,
  ComposableSelect,
  NestedUserSelect,
  RelationshipConfig,
} from './types';

// ==================== BASIC COMPOSITION UTILITIES ====================

/**
 * Merge multiple select fragments into one
 *
 * @example
 * const select = mergeSelects(
 *   commonSelects.modelBasic,
 *   commonSelects.auditTimestamps,
 *   { customField: true }
 * );
 */
export function mergeSelects<T extends ComposableSelect[]>(...selects: T): ComposableSelect {
  return Object.assign({}, ...selects);
}

/**
 * Merge multiple include fragments into one
 *
 * @example
 * const include = mergeIncludes(
 *   brandInclude.withParent,
 *   brandInclude.withMedia,
 *   { customRelation: { select: commonSelects.modelBasic } }
 * );
 */
export function mergeIncludes<T extends ComposableInclude[]>(...includes: T): ComposableInclude {
  return Object.assign({}, ...includes);
}

/**
 * Create a complete query args object with select and include
 *
 * @example
 * const queryArgs = createQueryArgs({
 *   select: mergeSelects(commonSelects.modelBasic, { customField: true }),
 *   include: { user: { select: commonSelects.userBasic } }
 * });
 */
export function createQueryArgs(config: {
  select?: ComposableSelect;
  include?: ComposableInclude;
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
}) {
  return config;
}

// ==================== USER RELATIONSHIP BUILDERS ====================

/**
 * Build user relationship with specified detail level
 *
 * @param level - Detail level: 'basic' | 'withImage' | 'withRole' | 'complete'
 * @returns User select configuration for includes
 */
export function buildUserRelation(
  level: 'basic' | 'withImage' | 'withRole' | 'complete' = 'basic',
): NestedUserSelect {
  switch (level) {
    case 'basic':
      return { select: { id: true, name: true, email: true } };
    case 'withImage':
      return { select: { id: true, name: true, email: true, image: true } };
    case 'withRole':
      return { select: { id: true, name: true, email: true, role: true } };
    case 'complete':
      return {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      };
    default:
      return { select: { id: true, name: true, email: true } };
  }
}

/**
 * Build user relationship with custom additional fields
 *
 * @param baseLevel - Base detail level
 * @param additionalFields - Additional user fields to include
 */
export function buildUserRelationWithFields(
  baseLevel: 'basic' | 'withImage' | 'withRole' | 'complete' = 'basic',
  additionalFields: Record<string, boolean> = {},
): NestedUserSelect {
  const baseSelect = buildUserRelation(baseLevel).select;
  return {
    select: mergeSelects(baseSelect, additionalFields),
  };
}

// ==================== HIERARCHICAL RELATIONSHIP BUILDERS ====================

/**
 * Build parent relationship for hierarchical models
 */
export function buildParentRelation(includeGrandparent: boolean = false): ComposableInclude {
  const parentSelect = {
    parent: {
      select: { id: true, name: true, slug: true },
    },
  };

  if (includeGrandparent) {
    return {
      parent: {
        select: { id: true, name: true, slug: true },
        include: {
          parent: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    };
  }

  return parentSelect;
}

/**
 * Build children relationship for hierarchical models
 */
export function buildChildrenRelation(
  limit?: number,
  includeGrandchildren: boolean = false,
): ComposableInclude {
  const childrenConfig: any = {
    select: { id: true, name: true, slug: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  };

  if (limit) {
    childrenConfig.take = limit;
  }

  if (includeGrandchildren) {
    childrenConfig.include = {
      children: {
        select: { id: true, name: true, slug: true },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
    };
  }

  return {
    children: childrenConfig,
  };
}

// ==================== CONTENT RELATIONSHIP BUILDERS ====================

/**
 * Build content relationship (articles, posts, etc.)
 */
export function buildContentRelation(
  level: 'basic' | 'withStatus' | 'withPublish' = 'basic',
  limit?: number,
  includeUser: boolean = false,
): ComposableInclude {
  let select: ComposableSelect;

  switch (level) {
    case 'basic':
      select = { id: true, title: true, slug: true };
      break;
    case 'withStatus':
      select = { id: true, title: true, slug: true, status: true };
      break;
    case 'withPublish':
      select = { id: true, title: true, slug: true, status: true, publishedAt: true };
      break;
    default:
      select = { id: true, title: true, slug: true };
  }

  const config: any = {
    select: mergeSelects(select, { createdAt: true, updatedAt: true }),
    orderBy: { createdAt: 'desc' },
  };

  if (limit) {
    config.take = limit;
  }

  if (includeUser) {
    config.include = {
      user: buildUserRelation('basic'),
    };
  }

  return config;
}

// ==================== DYNAMIC FRAGMENT BUILDERS ====================

/**
 * Build a complete entity fragment with commonly needed relations
 *
 * @param config Configuration object for relationships
 */
export function buildEntityWithCommonRelations(config: RelationshipConfig = {}) {
  const include: ComposableInclude = {};

  // Add user relationship if requested
  if (config.includeUser) {
    Object.assign(include, {
      user: buildUserRelation(config.userLevel || 'basic'),
    });
  }

  // Add parent relationship if requested
  if (config.includeParent) {
    Object.assign(include, buildParentRelation(config.includeGrandparent));
  }

  // Add children relationship if requested
  if (config.includeChildren) {
    Object.assign(
      include,
      buildChildrenRelation(config.childrenLimit, config.includeGrandchildren),
    );
  }

  return include;
}

/**
 * Build a paginated query configuration
 */
export function buildPaginatedQuery(
  page: number = 1,
  limit: number = 20,
  orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
) {
  const skip = (page - 1) * limit;

  return {
    take: limit,
    skip,
    orderBy,
  };
}

/**
 * Build a search query configuration
 */
export function buildSearchQuery(
  searchTerm: string,
  searchFields: string[] = ['name', 'slug'],
  caseSensitive: boolean = false,
) {
  const mode = caseSensitive ? 'default' : 'insensitive';

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode,
      },
    })),
  };
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate that required relationships are included
 */
export function validateFragmentRequirements(
  fragment: ComposableInclude,
  requiredRelations: string[],
): boolean {
  return requiredRelations.every(relation => relation in fragment);
}

/**
 * Get fragment complexity score (for performance monitoring)
 */
export function getFragmentComplexity(fragment: ComposableInclude): number {
  let complexity = 0;

  function countNested(obj: any, depth = 0): number {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += depth + 1 + countNested(obj[key], depth + 1);
      } else {
        count += 1;
      }
    }
    return count;
  }

  return countNested(fragment);
}

// ==================== LEGACY COMPATIBILITY HELPERS ====================

/**
 * Convert new fragment format to legacy format
 * For gradual migration of existing code
 */
export function toLegacyFragment(fragment: ComposableSelect | ComposableInclude) {
  return fragment;
}

/**
 * Convert legacy fragment format to new format
 */
export function fromLegacyFragment(fragment: any) {
  return fragment as ComposableSelect | ComposableInclude;
}
