/**
 * Enhanced setup file for database package tests
 *
 * This demonstrates the new DRY approach using:
 * - Enhanced QA package utilities
 * - Smart enum re-export pattern
 * - Centralized mock management
 * - Reduced boilerplate
 */

// Import QA package database setup first
import { setupPrismaWithEnums } from '@repo/qa/src/vitest/mocks/internal/prisma-with-enums';
import '@repo/qa/vitest/setup/database';

// Import generated Prisma enums to avoid manual duplication
import {
  BrandType,
  ContentStatus,
  MediaType,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ProductType,
  RegistryType,
  RegistryUserRole,
  TransactionStatus,
  TransactionType,
  VoteType,
} from '../prisma-generated/client';

/**
 * Setup comprehensive Prisma mocks with real enum re-export
 *
 * This replaces the manual mock setup with an automated approach
 * that preserves type safety while providing complete mocking coverage.
 */
export const mockClient = setupPrismaWithEnums({
  enums: {
    BrandType,
    ContentStatus,
    MediaType,
    OrderStatus,
    PaymentStatus,
    ProductType,
    ProductStatus,
    RegistryType,
    RegistryUserRole,
    TransactionStatus,
    TransactionType,
    VoteType,
  },
  importPaths: [
    // Standard paths for comprehensive coverage
    '../prisma-generated/client',
    '../../../../prisma-generated/client',
    '@/prisma-generated/client',
    '@prisma/client',
  ],
  includeErrorClasses: true,
  mockOptions: {
    // Use all standard models plus any custom ones
    includeTransactions: true,
    defaults: {
      findUnique: null,
      findFirst: null,
      findMany: [],
      count: 0,
    },
  },
});

/**
 * Enhanced test utilities available globally
 *
 * These provide common patterns and reduce boilerplate in test files.
 */
export { mockClient as enhancedMockClient };

// Export the enum types for use in tests
export {
  BrandType,
  ContentStatus,
  MediaType,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ProductType,
  RegistryType,
  RegistryUserRole,
  TransactionStatus,
  TransactionType,
  VoteType,
};

/**
 * Re-export enhanced utilities for convenience
 */
export {
  createDatabaseTestSuite,
  databaseAssertions,
  describeSeedFunction,
  environmentUtils,
  mockScenarios,
  seedExpectations,
  setupEnhancedPrismaTest,
  testCasePatterns,
  testDataGenerators,
} from '@repo/qa/src/vitest';
