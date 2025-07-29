/* eslint-disable vitest/prefer-spy-on */
import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * Common Prisma methods that all models share
 */
export const PRISMA_MODEL_METHODS = [
  'findUnique',
  'findFirst',
  'findMany',
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

/**
 * Common Prisma transaction methods
 */
export const PRISMA_TRANSACTION_METHODS = [
  '$transaction',
  '$connect',
  '$disconnect',
  '$use',
  '$extends',
  '$executeRaw',
  '$executeRawUnsafe',
  '$queryRaw',
  '$queryRawUnsafe',
] as const;

/**
 * Standard Prisma models used across the monorepo
 */
export const STANDARD_PRISMA_MODELS = [
  // Core models
  'brand',
  'jollyRoger',
  'productIdentifiers',
  'pdpJoin',
  'collection',
  'media',
  'product',
  'cast',
  'fandom',
  'location',
  'series',
  'story',
  'taxonomy',
  'category',

  // Commerce models
  'inventory',
  'cart',
  'order',
  'checkout',
  'payment',
  'priceList',
  'promotion',

  // User models
  'user',
  'account',
  'session',
  'verificationToken',
  'organization',
  'membership',

  // Content models
  'post',
  'comment',
  'reaction',
  'notification',
] as const;

type PrismaModelMethod = (typeof PRISMA_MODEL_METHODS)[number];
type _PrismaModel = (typeof STANDARD_PRISMA_MODELS)[number];

/**
 * Create a mock for a single Prisma model with all standard methods
 */
export function createPrismaModelMock(_modelName?: string): Record<PrismaModelMethod, Mock> {
  const model = {} as Record<PrismaModelMethod, Mock>;

  PRISMA_MODEL_METHODS.forEach(method => {
    // Create mock functions directly - vi.spyOn requires the property to exist first
    model[method] = vi.fn().mockResolvedValue(null);
  });

  return model;
}

/**
 * Create a full Prisma client mock with configurable options
 */
export interface CreateMockPrismaClientOptions {
  /**
   * Models to include in the mock (defaults to STANDARD_PRISMA_MODELS)
   */
  models?: readonly string[];

  /**
   * Additional custom models to add
   */
  customModels?: readonly string[];

  /**
   * Whether to include transaction methods (default: true)
   */
  includeTransactions?: boolean;

  /**
   * Default return values for specific methods
   */
  defaults?: {
    findUnique?: any;
    findFirst?: any;
    findMany?: any[];
    count?: number;
  };
}

/**
 * Create a flexible Prisma client mock
 */
export function createMockPrismaClient(options: CreateMockPrismaClientOptions = {}) {
  const {
    models = STANDARD_PRISMA_MODELS,
    customModels = [],
    includeTransactions = true,
    defaults = {},
  } = options;

  const client: Record<string, any> = {};

  // Add all requested models
  [...models, ...customModels].forEach(modelName => {
    client[modelName] = createPrismaModelMock(modelName);

    // Apply default return values if specified
    if (defaults.findUnique !== undefined) {
      client[modelName].findUnique.mockResolvedValue(defaults.findUnique);
    }
    if (defaults.findFirst !== undefined) {
      client[modelName].findFirst.mockResolvedValue(defaults.findFirst);
    }
    if (defaults.findMany !== undefined) {
      client[modelName].findMany.mockResolvedValue(defaults.findMany);
    }
    if (defaults.count !== undefined) {
      client[modelName].count.mockResolvedValue(defaults.count);
    }
  });

  // Add transaction methods if requested
  if (includeTransactions) {
    PRISMA_TRANSACTION_METHODS.forEach(method => {
      client[method] = vi.fn().mockResolvedValue(undefined);
    });

    // Special handling for $transaction
    client['$transaction'] = vi.fn(async (fn: any) => {
      if (typeof fn === 'function') {
        return await fn(client);
      }
      return Promise.all(fn as any[]);
    });
  }

  return client;
}

/**
 * Create test data generators
 */
export const createTestData = {
  brand: (overrides = {}) => ({
    id: 'brand-1',
    name: 'Test Brand',
    slug: 'test-brand',
    description: 'Test brand description',
    logo: 'https://example.com/logo.png',
    website: 'https://example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    price: 99.99,
    stock: 100,
    brandId: 'brand-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: new Date(),
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  order: (overrides = {}) => ({
    id: 'order-1',
    userId: 'user-1',
    status: 'pending',
    total: 199.98,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

/**
 * Create a brand hierarchy for testing
 */
export function createMockBrandHierarchy() {
  const parentBrand = createTestData.brand({
    id: 'parent-brand',
    name: 'Parent Brand',
    slug: 'parent-brand',
  });

  const childBrands = [
    createTestData.brand({
      id: 'child-brand-1',
      name: 'Child Brand 1',
      slug: 'child-brand-1',
      parentId: 'parent-brand',
    }),
    createTestData.brand({
      id: 'child-brand-2',
      name: 'Child Brand 2',
      slug: 'child-brand-2',
      parentId: 'parent-brand',
    }),
  ];

  return { parentBrand, childBrands };
}

/**
 * Helper to setup common Prisma mock scenarios
 */
export const prismaScenarios = {
  /**
   * Setup a scenario where all finds return null (not found)
   */
  notFound: (client: ReturnType<typeof createMockPrismaClient>) => {
    Object.keys(client).forEach(key => {
      if (client[key]?.findUnique) {
        client[key].findUnique.mockResolvedValue(null);
        client[key].findFirst.mockResolvedValue(null);
        client[key].findMany.mockResolvedValue([]);
      }
    });
  },

  /**
   * Setup a scenario with sample data
   */
  withSampleData: (client: ReturnType<typeof createMockPrismaClient>) => {
    // Brand
    if (client.brand) {
      const brand = createTestData.brand();
      client.brand.findUnique.mockResolvedValue(brand);
      client.brand.findFirst.mockResolvedValue(brand);
      client.brand.findMany.mockResolvedValue([brand]);
      client.brand.create.mockResolvedValue(brand);
    }

    // User
    if (client.user) {
      const user = createTestData.user();
      client.user.findUnique.mockResolvedValue(user);
      client.user.findFirst.mockResolvedValue(user);
      client.user.findMany.mockResolvedValue([user]);
      client.user.create.mockResolvedValue(user);
    }
  },

  /**
   * Setup error scenarios
   */
  withErrors: (
    client: ReturnType<typeof createMockPrismaClient>,
    error = new Error('Database error'),
  ) => {
    Object.keys(client).forEach(key => {
      if (client[key]?.findUnique) {
        Object.keys(client[key]).forEach(method => {
          if (typeof client[key][method] === 'function') {
            client[key][method].mockRejectedValue(error);
          }
        });
      }
    });
  },
};

/**
 * Default export for easy migration from existing files
 */
export const mockPrismaClient = createMockPrismaClient();

// Export legacy name for backward compatibility
export { createMockPrismaClient as createSimplePrismaClient };

// Export test data creation functions
export const createMockBrandData = createTestData.brand;
export const createTestBrand = createTestData.brand;
