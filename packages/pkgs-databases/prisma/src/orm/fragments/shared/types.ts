/**
 * TypeScript types for fragment composition
 *
 * These types provide type safety for fragment composition utilities
 * and ensure proper typing across all fragment operations.
 */

// ==================== BASIC FRAGMENT TYPES ====================

/**
 * Base type for all select fragments
 */
export type FragmentSelect = Record<string, boolean | Record<string, any>>;

/**
 * Base type for all include fragments
 */
export type FragmentInclude = Record<
  string,
  | boolean
  | {
      select?: Record<string, any>;
      include?: Record<string, any>;
      take?: number;
      skip?: number;
      orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
      where?: Record<string, any>;
    }
>;

/**
 * Composable select type for merging operations
 */
export type ComposableSelect = FragmentSelect;

/**
 * Composable include type for merging operations
 */
export type ComposableInclude = FragmentInclude;

// ==================== NESTED RELATIONSHIP TYPES ====================

/**
 * User select configuration for nested relationships
 */
export type NestedUserSelect = {
  select: ComposableSelect;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
};

/**
 * Media select configuration for nested relationships
 */

/**
 * Content select configuration for nested relationships
 */
export type NestedContentSelect = {
  select: ComposableSelect;
  include?: ComposableInclude;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
};

// ==================== UTILITY TYPES ====================

/**
 * Configuration for building complex entity relationships
 */
export interface RelationshipConfig {
  // User relationship config
  includeUser?: boolean;
  userLevel?: 'basic' | 'withImage' | 'withRole' | 'complete';

  // Hierarchical relationship config
  includeParent?: boolean;
  includeGrandparent?: boolean;
  includeChildren?: boolean;
  childrenLimit?: number;
  includeGrandchildren?: boolean;

  // Organization relationship config
  includeOrganization?: boolean;
  organizationLevel?: 'basic' | 'withLogo' | 'complete';

  // Content relationship config
  includeContent?: boolean;
  contentLevel?: 'basic' | 'withStatus' | 'withPublish';
  contentLimit?: number;
  contentIncludeUser?: boolean;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  searchTerm: string;
  searchFields?: string[];
  caseSensitive?: boolean;
  useFullTextSearch?: boolean;
}

// ==================== QUERY BUILDER TYPES ====================

/**
 * Complete query configuration type
 */
export interface QueryConfig {
  select?: ComposableSelect;
  include?: ComposableInclude;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  take?: number;
  skip?: number;
  distinct?: string[];
}

/**
 * Query builder result type
 */
export type QueryBuilder<T = any> = {
  select: (select: ComposableSelect) => QueryBuilder<T>;
  include: (include: ComposableInclude) => QueryBuilder<T>;
  where: (where: Record<string, any>) => QueryBuilder<T>;
  orderBy: (orderBy: Record<string, 'asc' | 'desc'>) => QueryBuilder<T>;
  take: (limit: number) => QueryBuilder<T>;
  skip: (offset: number) => QueryBuilder<T>;
  build: () => QueryConfig;
};

// ==================== FRAGMENT VALIDATION TYPES ====================

/**
 * Fragment complexity metrics
 */
export interface FragmentComplexity {
  depthScore: number;
  relationshipCount: number;
  totalFields: number;
  estimatedQueryCost: number;
  hasCircularRefs: boolean;
}

/**
 * Fragment validation result
 */
export interface FragmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complexity: FragmentComplexity;
  suggestions: string[];
}

// ==================== MODEL-SPECIFIC FRAGMENT TYPES ====================

/**
 * User fragment levels
 */
export type UserFragmentLevel =
  | 'basic'
  | 'withImage'
  | 'withVerification'
  | 'withRole'
  | 'complete';

/**
 * Content fragment levels
 */
export type ContentFragmentLevel = 'basic' | 'withStatus' | 'withPublish' | 'complete';

/**
 * Organization fragment levels
 */
export type OrganizationFragmentLevel = 'basic' | 'withLogo' | 'complete';

// ==================== ADVANCED COMPOSITION TYPES ====================

/**
 * Dynamic fragment builder type
 */
export type DynamicFragmentBuilder<TModel = any> = {
  withUser: (level?: UserFragmentLevel) => DynamicFragmentBuilder<TModel>;
  withContent: (level?: ContentFragmentLevel, limit?: number) => DynamicFragmentBuilder<TModel>;
  withParent: (includeGrandparent?: boolean) => DynamicFragmentBuilder<TModel>;
  withChildren: (limit?: number, includeGrandchildren?: boolean) => DynamicFragmentBuilder<TModel>;
  build: () => ComposableInclude;
};

/**
 * Fragment merge utility type
 */
export type FragmentMerger = {
  merge: <T extends ComposableSelect[]>(...fragments: T) => ComposableSelect;
  mergeIncludes: <T extends ComposableInclude[]>(...fragments: T) => ComposableInclude;
  validate: (fragment: ComposableSelect | ComposableInclude) => FragmentValidation;
};

// ==================== PRISMA INTEGRATION TYPES ====================

/**
 * Type-safe Prisma select validator
 */
export type PrismaSelectValidator<TModel> = (args: { select: ComposableSelect }) => TModel;

/**
 * Type-safe Prisma include validator
 */
export type PrismaIncludeValidator<TModel> = (args: { include: ComposableInclude }) => TModel;

/**
 * Complete Prisma args validator
 */
export type PrismaArgsValidator<TModel> = (args: QueryConfig) => TModel;

// ==================== LEGACY COMPATIBILITY TYPES ====================

/**
 * Legacy fragment format (for migration)
 */
export type LegacyFragment = {
  select?: Record<string, boolean>;
  include?: Record<string, any>;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
};

/**
 * Migration helper type
 */
export type FragmentMigration = {
  from: LegacyFragment;
  to: ComposableInclude | ComposableSelect;
  breaking: boolean;
  migrationGuide: string[];
};

// ==================== PERFORMANCE TYPES ====================

/**
 * Query performance metrics
 */
export interface QueryPerformance {
  estimatedExecutionTime: number;
  memoryUsage: number;
  networkBandwidth: number;
  cacheability: 'high' | 'medium' | 'low' | 'none';
  recommendations: string[];
}

/**
 * Fragment optimization suggestions
 */
export interface FragmentOptimization {
  canOptimize: boolean;
  suggestions: {
    type: 'reduce_depth' | 'limit_relations' | 'add_indexes' | 'use_select' | 'batch_queries';
    description: string;
    impact: 'high' | 'medium' | 'low';
    implementation: string;
  }[];
  optimizedFragment?: ComposableInclude | ComposableSelect;
}

// ==================== EXPORT TYPES ====================

/**
 * Main export type for fragment utilities
 */
export interface FragmentUtils {
  composition: typeof import('./composition-utils');
  types: typeof import('./types');
}

/**
 * Re-export common utility types
 */
export type { Prisma } from '../../../../generated/client/client';
