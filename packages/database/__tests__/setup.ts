// Import QA package database setup first
import { createMockPrismaClient, setupPrismaWithEnums } from '@repo/qa';
import { vi } from 'vitest';

// Mock server-only to allow imports in test environment
vi.mock('server-only', () => ({}));

// Import generated Prisma enums to avoid manual duplication
import { ContentStatus, PaymentStatus, VoteType } from '../prisma-generated/client';

// Set up comprehensive Prisma mocking with real enum re-export
// This handles all import paths and preserves type safety
export const mockClient = setupPrismaWithEnums({
  enums: {
    ContentStatus,
    PaymentStatus,
    VoteType,
  },
  importPaths: [
    '#/prisma-generated/client',
    '../prisma-generated/client',
    '../../../../prisma-generated/client',
    '@prisma/client',
  ],
  includeErrorClasses: true,
});

// Create a mock ORM for backward compatibility with existing tests
const createMockPrismaOrm = () => ({
  findUniqueUserOrm: vi.fn(),
  findManyUsersOrm: vi.fn(),
  createUserOrm: vi.fn(),
  updateUserOrm: vi.fn(),
  countUsersOrm: vi.fn(),
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
