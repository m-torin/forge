// Enhanced database test setup with comprehensive mocking
import { createMockPrismaClient, setupPrismaWithEnums } from '@repo/qa';
import { vi } from 'vitest';

// Mock server-only to allow imports in test environment
vi.mock('server-only', () => ({}));

// Import generated Prisma enums to avoid manual duplication
import { ContentStatus, PaymentStatus, VoteType } from '../prisma-generated/client';

// Enhanced test configuration
export interface EnhancedTestConfig {
  includeTransactions: boolean;
  includeAuditLogs: boolean;
  includeSoftDeletes: boolean;
  mockExternalServices: boolean;
}

// Default configuration
export const defaultTestConfig: EnhancedTestConfig = {
  includeTransactions: true,
  includeAuditLogs: true,
  includeSoftDeletes: true,
  mockExternalServices: true,
};

// Set up comprehensive Prisma mocking with real enum re-export
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

// Enhanced mock ORM with auth models
const createEnhancedMockPrismaOrm = (config: EnhancedTestConfig = defaultTestConfig) => ({
  // User operations
  findUniqueUserOrm: vi.fn(),
  findManyUsersOrm: vi.fn(),
  createUserOrm: vi.fn(),
  updateUserOrm: vi.fn(),
  countUsersOrm: vi.fn(),

  // Session operations
  findUniqueSessionOrm: vi.fn(),
  createSessionOrm: vi.fn(),
  updateSessionOrm: vi.fn(),

  // Organization operations
  findUniqueOrganizationOrm: vi.fn(),
  createOrganizationOrm: vi.fn(),
  updateOrganizationOrm: vi.fn(),

  // Member operations
  findManyMembersOrm: vi.fn(),
  createMemberOrm: vi.fn(),
  updateMemberOrm: vi.fn(),

  // API Key operations
  findUniqueApiKeyOrm: vi.fn(),
  createApiKeyOrm: vi.fn(),
  updateApiKeyOrm: vi.fn(),

  // Transaction utilities
  executeTransaction: vi.fn(),

  // Conditional mocks based on config
  ...(config.includeAuditLogs && {
    createAuditLogOrm: vi.fn(),
  }),
});

/**
 * Enhanced setup function for comprehensive testing
 */
export const setupEnhancedPrismaTestMocks = (config: EnhancedTestConfig = defaultTestConfig) => {
  const mockPrismaClient = createMockPrismaClient();
  const mockPrismaOrm = createEnhancedMockPrismaOrm(config);

  return { mockPrismaClient, mockPrismaOrm, config };
};

/**
 * Enhanced reset function for comprehensive testing
 */
export const resetEnhancedPrismaTestMocks = (
  mockPrismaClient: any,
  mockPrismaOrm: any,
  config: EnhancedTestConfig = defaultTestConfig,
) => {
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

  // Reset ORM mocks
  Object.keys(mockPrismaOrm).forEach(key => {
    if (typeof mockPrismaOrm[key] === 'function' && mockPrismaOrm[key].mockClear) {
      mockPrismaOrm[key].mockClear();
    }
  });
};
