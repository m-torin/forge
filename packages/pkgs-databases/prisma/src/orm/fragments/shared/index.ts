/**
 * Shared fragment utilities
 *
 * This module provides DRY utilities for Prisma fragment composition,
 * eliminating the massive duplication across 42+ fragment files.
 *
 * @example Basic usage:
 * ```typescript
 * import { commonSelects, mergeSelects, buildUserRelation } from '@repo/db-prisma/fragments/shared';
 *
 * // Create custom fragment using shared patterns
 * const productSelectWithUser = {
 *   select: mergeSelects(
 *     commonSelects.modelBasic,
 *     commonSelects.auditTimestamps,
 *     { price: true, description: true }
 *   ),
 *   include: {
 *     user: buildUserRelation('withImage'),
 *     media: buildMediaRelation('basic', 5)
 *   }
 * };
 * ```
 */

// ==================== CORE EXPORTS ====================

// Composition utilities
export * from './composition-utils';

// TypeScript types
export * from './types';

// Import for internal use
import {
  buildChildrenRelation as buildChildrenRelationInternal,
  buildParentRelation as buildParentRelationInternal,
  buildUserRelation as buildUserRelationInternal,
  mergeSelects as mergeSelectsInternal,
} from './composition-utils';

// ==================== CONVENIENCE RE-EXPORTS ====================

// Most commonly used composition utilities
export {
  buildChildrenRelation,
  buildContentRelation,
  buildEntityWithCommonRelations,
  buildPaginatedQuery,
  buildParentRelation,
  buildSearchQuery,
  buildUserRelation,
  buildUserRelationWithFields,
  createQueryArgs,
  mergeIncludes,
  mergeSelects,
} from './composition-utils';

// ==================== FACTORY FUNCTIONS ====================

/**
 * Create a standardized model fragment with common patterns
 */
export function createStandardModelFragment(
  config: {
    includeTimestamps?: boolean;
    includeStatus?: boolean;
    includeType?: boolean;
    includeSoftDelete?: boolean;
    additionalFields?: Record<string, boolean>;
  } = {},
) {
  const {
    includeTimestamps = true,
    includeStatus = false,
    includeType = false,
    includeSoftDelete = false,
    additionalFields = {},
  } = config;

  // Base model select
  const baseSelect: Record<string, boolean> = {
    id: true,
    name: true,
    slug: true,
    ...(includeStatus && { status: true }),
    ...(includeType && { type: true }),
  };

  // Timestamp select
  const timestampSelect: Record<string, boolean> = includeTimestamps
    ? {
        createdAt: true,
        updatedAt: true,
        ...(includeSoftDelete && { deletedAt: true }),
      }
    : {};

  return mergeSelectsInternal(baseSelect, timestampSelect, additionalFields);
}

/**
 * Create a standardized relationship configuration
 */
export function createStandardRelationships(
  config: {
    includeUser?: boolean | 'basic' | 'withImage' | 'withRole' | 'complete';
    mediaLimit?: number;
    includeParent?: boolean;
    includeChildren?: boolean;
    childrenLimit?: number;
  } = {},
) {
  const relationships: any = {};

  // Add user relationship
  if (config.includeUser) {
    const level = typeof config.includeUser === 'string' ? config.includeUser : 'basic';
    relationships.user = buildUserRelationInternal(level);
  }

  // Add parent relationship
  if (config.includeParent) {
    Object.assign(relationships, buildParentRelationInternal());
  }

  // Add children relationship
  if (config.includeChildren) {
    Object.assign(relationships, buildChildrenRelationInternal(config.childrenLimit));
  }

  return relationships;
}

// ==================== MIGRATION HELPERS ====================

/**
 * Helper to migrate existing fragments to use shared patterns
 * Returns suggestions for how to refactor existing code
 */
export function analyzeFragmentForMigration(fragment: Record<string, any>): {
  canUsePredefinedPattern: boolean;
  suggestedPattern: string | null;
  migrationSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
} {
  const analysis = {
    canUsePredefinedPattern: false,
    suggestedPattern: null as string | null,
    migrationSteps: [] as string[],
    estimatedEffort: 'low' as 'low' | 'medium' | 'high',
  };

  // Check for common patterns
  const hasIdNameSlug = fragment.id && fragment.name && fragment.slug;
  const hasTimestamps = fragment.createdAt && fragment.updatedAt;
  const hasStatus = fragment.status;
  const hasType = fragment.type;

  if (hasIdNameSlug) {
    analysis.canUsePredefinedPattern = true;

    if (hasStatus && hasType) {
      analysis.suggestedPattern =
        'createStandardModelFragment({ includeStatus: true, includeType: true })';
    } else if (hasStatus) {
      analysis.suggestedPattern = 'createStandardModelFragment({ includeStatus: true })';
    } else if (hasType) {
      analysis.suggestedPattern = 'createStandardModelFragment({ includeType: true })';
    } else {
      analysis.suggestedPattern = 'createStandardModelFragment()';
    }

    analysis.migrationSteps.push(
      `Replace { id: true, name: true, slug: true${hasStatus ? ', status: true' : ''}${hasType ? ', type: true' : ''} } with ${analysis.suggestedPattern}`,
    );
  }

  if (hasTimestamps) {
    analysis.migrationSteps.push(
      'Timestamps are included by default in createStandardModelFragment',
    );
  }

  // Check for user patterns
  if (fragment.user && typeof fragment.user === 'object') {
    const userSelect = fragment.user.select;
    if (userSelect?.id && userSelect?.name && userSelect?.email) {
      analysis.migrationSteps.push('Replace user select with buildUserRelation("basic")');
    }
  }

  analysis.estimatedEffort =
    analysis.migrationSteps.length > 3
      ? 'high'
      : analysis.migrationSteps.length > 1
        ? 'medium'
        : 'low';

  return analysis;
}

// ==================== DOCUMENTATION HELPERS ====================

/**
 * Get usage examples for common patterns
 */
export function getUsageExamples(): Record<string, string> {
  return {
    basicModel: `
// Before:
const select = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true
};

// After:
const select = createStandardModelFragment();`,

    userRelation: `
// Before:
const include = {
  user: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};

// After:
const include = {
  user: buildUserRelation('basic')
};`,

    complexComposition: `
// Complex example with multiple patterns:
const productQueryArgs = createQueryArgs({
  select: createStandardModelFragment({
    includeStatus: true,
    includeTimestamps: true,
    additionalFields: { price: true, description: true }
  }),
  include: createStandardRelationships({
    includeUser: 'basic',
    mediaLimit: 3
  })
});`,
  };
}

// ==================== VERSION INFO ====================

/**
 * Version and metadata for the shared fragment system
 */
export const SHARED_FRAGMENTS_VERSION = '1.0.0';
export const SHARED_FRAGMENTS_DESCRIPTION = 'DRY utilities for Prisma fragment composition';
export const MIGRATION_BENEFITS = [
  'Reduced code duplication from 588+ to reusable patterns',
  'Type-safe fragment composition',
  'Standardized relationship building',
  'Performance optimization through consistent patterns',
  'Easier maintenance and updates',
  'Better testing through shared utilities',
];
