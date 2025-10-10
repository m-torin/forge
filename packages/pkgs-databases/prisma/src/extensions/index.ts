/**
 * Prisma Client Extensions
 *
 * Modern Prisma 6+ extensions for DRY operations across all models
 * Provides standardized operations with full type safety
 */

import { PrismaClient } from '../../generated/client/client';
import type { PaginatedResult } from '../orm/types';
import { sharedOperationsExtension } from './shared-operations';

/**
 * Create extended Prisma client with all extensions
 *
 * Provides standardized DRY operations that work across all models:
 *
 * Client Extensions:
 * - $paginate: Standardized pagination
 * - $searchByName: Search by name with case-insensitive matching
 * - $existsById: Check existence by ID
 * - $existsBySlug: Check existence by slug
 */
export function createExtendedPrismaClient() {
  const baseClient = new PrismaClient();

  try {
    // Apply extensions in proper order
    return baseClient.$extends(sharedOperationsExtension);
  } catch (error) {
    console.warn(
      '[Extensions] Failed to apply extensions, returning base client:',
      error instanceof Error ? error.message : String(error),
    );
    return baseClient;
  }
}

// Export factory function instead of instance
export const extendedPrisma = createExtendedPrismaClient();

/**
 * Type of the extended Prisma client with all extension methods
 * Use this type for dependency injection or function parameters
 *
 * Following Prisma's official TypeScript performance optimization:
 * Using typeof operator provides 99.9% reduction in type instantiations,
 * 62% reduction in memory usage, and 78% reduction in compilation time
 */
export type ExtendedPrismaClient = typeof extendedPrisma;

/**
 * Type-safe extended client that includes all extension methods
 * This is what consumers should expect when using createNodeClient()
 */
export type ExtendedClient = ExtendedPrismaClient;

/**
 * Extension method signatures for type checking
 */
export interface ExtensionMethods {
  $paginate: <T = any>(modelName: string, options?: any) => Promise<PaginatedResult<T>>;
  $searchByName: <T = any>(
    modelName: string,
    searchTerm: string,
    options?: any,
  ) => Promise<PaginatedResult<T>>;
  $existsById: (modelName: string, id: string) => Promise<boolean>;
  $existsBySlug: (modelName: string, slug: string) => Promise<boolean>;
}

/**
 * Main database export - use this in your applications
 */
export const db = extendedPrisma;

// Re-export types for convenience
export type { PrismaClient } from '../../generated/client/client';
export type { PaginatedResult, PaginationOptions } from '../orm/types';
