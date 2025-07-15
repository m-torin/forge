import { vi } from 'vitest';
import { createMockPrismaClient } from '../mocks/prisma-consolidated';

// Create a mock ORM for backward compatibility
const createMockPrismaOrm = () => ({
  findUniqueBrandOrm: vi.fn(),
  findManyBrandsOrm: vi.fn(),
  createBrandOrm: vi.fn(),
  updateBrandOrm: vi.fn(),
  countBrandsOrm: vi.fn(),
  executeTransaction: vi.fn(),
});

/**
 * Sets up Prisma mocks for testing with a consistent pattern
 * @returns Object containing the mock client and ORM for use in tests
 */
export const setupPrismaTestMocks = () => {
  const mockPrismaClient = createMockPrismaClient();
  const mockPrismaOrm = createMockPrismaOrm();

  // Mock the entire @repo/database/prisma module
  vi.mock('@repo/database/prisma', () => ({
    ...mockPrismaOrm,
    executeTransaction: vi.fn((fn: any) => fn(mockPrismaClient)),
    BrandType: {
      LABEL: 'LABEL',
      RETAILER: 'RETAILER',
      MARKETPLACE: 'MARKETPLACE',
      OTHER: 'OTHER',
    },
    ContentStatus: {
      DRAFT: 'DRAFT',
      PUBLISHED: 'PUBLISHED',
      ARCHIVED: 'ARCHIVED',
    },
    // Export mocks for test access
    __mockPrismaClient: mockPrismaClient,
    __mockPrismaOrm: mockPrismaOrm,
  }));

  return { mockPrismaClient, mockPrismaOrm };
};

/**
 * Resets all Prisma mocks to a clean state
 * @param mockPrismaClient - The mock Prisma client
 * @param mockPrismaOrm - The mock Prisma ORM
 */
export const resetPrismaTestMocks = (mockPrismaClient: any, mockPrismaOrm: any) => {
  // Reset client mocks
  mockPrismaClient.brand.findUnique.mockReset();
  mockPrismaClient.brand.findMany.mockReset();
  mockPrismaClient.brand.create.mockReset();
  mockPrismaClient.brand.update.mockReset();
  mockPrismaClient.brand.count.mockReset();
  mockPrismaClient.jollyRoger.findUnique.mockReset();
  mockPrismaClient.jollyRoger.create.mockReset();
  mockPrismaClient.jollyRoger.update.mockReset();
  mockPrismaClient.jollyRoger.delete.mockReset();
  mockPrismaClient.productIdentifiers.findFirst.mockReset();
  mockPrismaClient.productIdentifiers.create.mockReset();
  mockPrismaClient.productIdentifiers.update.mockReset();
  mockPrismaClient.pdpJoin.deleteMany.mockReset();
  mockPrismaClient.pdpJoin.create.mockReset();

  // Reset ORM mocks
  mockPrismaOrm.findUniqueBrandOrm.mockReset();
  mockPrismaOrm.findManyBrandsOrm.mockReset();
  mockPrismaOrm.createBrandOrm.mockReset();
  mockPrismaOrm.updateBrandOrm.mockReset();
  mockPrismaOrm.countBrandsOrm.mockReset();
  mockPrismaOrm.executeTransaction.mockReset();
  mockPrismaOrm.executeTransaction.mockImplementation((fn: any) => fn(mockPrismaClient));
};

/**
 * Common test data factories for brands
 */
export const createTestBrandData = {
  disney: () => ({
    id: 'disney-1',
    name: 'Disney',
    slug: 'disney',
    type: 'LABEL' as const,
    status: 'PUBLISHED' as const,
    parentId: null,
    children: [],
    parent: null,
    _count: { children: 0, products: 0, collections: 0, media: 0 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  }),

  dvc: () => ({
    id: 'dvc-4',
    name: 'Disney Vacation Club 4',
    slug: 'disney-vacation-club-4',
    type: 'LABEL' as const,
    status: 'PUBLISHED' as const,
    parentId: 'disney-1',
    children: [],
    parent: { id: 'disney-1', name: 'Disney', slug: 'disney', type: 'LABEL', status: 'PUBLISHED' },
    _count: { children: 0, products: 0, collections: 0, media: 0 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  }),

  parent: () => ({
    id: 'parent-1',
    name: 'Parent Brand',
    slug: 'parent-brand',
    type: 'LABEL' as const,
    status: 'PUBLISHED' as const,
    parentId: null,
    children: [
      { id: 'child-1', name: 'Child 1', slug: 'child-1' },
      { id: 'child-2', name: 'Child 2', slug: 'child-2' },
    ],
    parent: null,
    _count: { children: 2, products: 0, collections: 0, media: 0 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  }),
};

/**
 * Common mock implementations for frequently used scenarios
 */
export const commonMockImplementations = {
  // Mock successful brand creation
  successfulBrandCreation: (mockPrismaOrm: any, brandData: any) => {
    mockPrismaOrm.createBrandOrm.mockResolvedValue(brandData);
  },

  // Mock successful brand update
  successfulBrandUpdate: (mockPrismaClient: any, mockPrismaOrm: any, brandData: any) => {
    mockPrismaClient.brand.findUnique.mockResolvedValue({ parentId: brandData.parentId });
    mockPrismaClient.brand.update.mockResolvedValue(brandData);
  },

  // Mock circular reference check (for testing error cases)
  circularReferenceCheck: (mockPrismaOrm: any, ancestorBrand: any, descendantBrand: any) => {
    mockPrismaOrm.findUniqueBrandOrm.mockImplementation((query: any) => {
      const id = query.where.id;
      if (id === ancestorBrand.id) return Promise.resolve(ancestorBrand);
      if (id === descendantBrand.id) return Promise.resolve(descendantBrand);
      return Promise.resolve(null);
    });
  },

  // Mock transaction failure
  transactionFailure: (mockPrismaClient: any, errorMessage = 'Database transaction failed') => {
    mockPrismaClient.brand.update.mockRejectedValue(new Error(errorMessage));
  },
};
