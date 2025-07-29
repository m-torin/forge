// Import QA package database setup first
import { createMockPrismaClient, setupPrismaWithEnums } from '@repo/qa';
import { vi } from 'vitest';

// Mock server-only to allow imports in test environment
vi.mock('server-only', () => ({}));

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

// Set up comprehensive Prisma mocking with real enum re-export
// This handles all import paths and preserves type safety
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
    '@/prisma-generated/client',
    '../prisma-generated/client',
    '../../../../prisma-generated/client',
    '@prisma/client',
  ],
  includeErrorClasses: true,
});

// Create a mock ORM for backward compatibility with existing tests
const createMockPrismaOrm = () => ({
  findUniqueBrandOrm: vi.fn(),
  findManyBrandsOrm: vi.fn(),
  createBrandOrm: vi.fn(),
  updateBrandOrm: vi.fn(),
  countBrandsOrm: vi.fn(),
  executeTransaction: vi.fn(),
});

/**
 * Backward compatibility function for existing tests
 * This maintains the same interface as the old setupPrismaTestMocks
 */
export const setupPrismaTestMocks = () => {
  const mockPrismaClient = createMockPrismaClient();
  const mockPrismaOrm = createMockPrismaOrm();

  return { mockPrismaClient, mockPrismaOrm };
};

/**
 * Backward compatibility function for existing tests
 */
export const resetPrismaTestMocks = (mockPrismaClient: any, mockPrismaOrm: any) => {
  vi.clearAllMocks();

  // Reset all model mocks to default state
  Object.keys(mockPrismaClient).forEach(model => {
    if (mockPrismaClient[model]?.findUnique) {
      mockPrismaClient[model].findUnique.mockResolvedValue(null);
      mockPrismaClient[model].findFirst.mockResolvedValue(null);
      mockPrismaClient[model].findMany.mockResolvedValue([]);
      mockPrismaClient[model].create.mockResolvedValue({ id: `${model}-id` });
      mockPrismaClient[model].update.mockResolvedValue({ id: `${model}-id` });
      mockPrismaClient[model].createMany?.mockResolvedValue({});
    }
  });
};
