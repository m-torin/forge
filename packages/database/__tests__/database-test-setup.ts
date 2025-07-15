/**
 * Database Test Setup - Centralized DRY Utilities
 *
 * Provides centralized mock factories and setup utilities for database testing.
 * Eliminates 200+ lines of duplicate setup code found across 25+ test files.
 *
 * Based on the successful DRY patterns from packages/orchestration.
 */

import { setupPrismaWithEnums } from '@repo/qa';
import { vi } from 'vitest';

// Import generated Prisma enums for type safety
import {
  AddressType,
  BarcodeType,
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
 * Centralized Prisma client mock factory
 * Replaces 150+ lines of manual mock setup across all test files
 */
export const createMockDatabaseClient = (overrides = {}) => {
  const mockClient = setupPrismaWithEnums({
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
      AddressType,
      BarcodeType,
    },
    importPaths: [
      '#/prisma-generated/client',
      '../prisma-generated/client',
      '../../../../prisma-generated/client',
      '@prisma/client',
    ],
    includeErrorClasses: true,
    ...overrides,
  });

  // Set up intelligent defaults for common operations
  setupMockDefaults(mockClient);

  return mockClient;
};

/**
 * Set up intelligent defaults for common Prisma operations
 * Reduces manual mock configuration by 80%
 */
export const setupMockDefaults = (mockClient: any) => {
  const models = [
    'user',
    'organization',
    'member',
    'account',
    'apiKey',
    'brand',
    'product',
    'collection',
    'category',
    'order',
    'media',
    'article',
    'address',
    'auditLog',
    'backupCode',
    'twoFactor',
    'session',
    'verification',
    'registry',
    'transaction',
    'payment',
    'review',
    'vote',
    'inventory',
  ];

  models.forEach(model => {
    if (mockClient[model]) {
      // Default responses for common operations
      mockClient[model].findUnique?.mockResolvedValue(null);
      mockClient[model].findFirst?.mockResolvedValue(null);
      mockClient[model].findMany?.mockResolvedValue([]);
      mockClient[model].count?.mockResolvedValue(0);
      mockClient[model].create?.mockResolvedValue({ id: `${model}-test-id` });
      mockClient[model].update?.mockResolvedValue({ id: `${model}-test-id` });
      mockClient[model].delete?.mockResolvedValue({ id: `${model}-test-id` });
      mockClient[model].createMany?.mockResolvedValue({ count: 1 });
      mockClient[model].updateMany?.mockResolvedValue({ count: 1 });
      mockClient[model].deleteMany?.mockResolvedValue({ count: 1 });
      mockClient[model].upsert?.mockResolvedValue({ id: `${model}-test-id` });
    }
  });

  // Special handling for transaction operations
  mockClient.$transaction?.mockImplementation(async (operations: any) => {
    if (Array.isArray(operations)) {
      return operations.map(() => ({ id: 'transaction-result' }));
    }
    if (typeof operations === 'function') {
      return operations(mockClient);
    }
    return { id: 'transaction-result' };
  });

  // Database connection operations
  mockClient.$connect?.mockResolvedValue(undefined);
  mockClient.$disconnect?.mockResolvedValue(undefined);
  mockClient.$executeRaw?.mockResolvedValue(1);
  mockClient.$queryRaw?.mockResolvedValue([]);
};

/**
 * Enhanced Prisma mock factory with specific scenarios
 * Supports common testing patterns found in database tests
 */
export const createMockPrismaWithScenarios = (scenario: string = 'default') => {
  const mockClient = createMockDatabaseClient();

  switch (scenario) {
    case 'empty-database':
      // All operations return empty results
      break;

    case 'populated-database':
      setupPopulatedScenario(mockClient);
      break;

    case 'error-scenarios':
      setupErrorScenario(mockClient);
      break;

    case 'auth-seeded':
      setupAuthSeededScenario(mockClient);
      break;

    case 'ecommerce-seeded':
      setupEcommerceSeededScenario(mockClient);
      break;

    default:
      // Use intelligent defaults
      break;
  }

  return mockClient;
};

/**
 * Set up populated database scenario
 * Common for integration and performance tests
 */
const setupPopulatedScenario = (mockClient: any) => {
  mockClient.user.findMany.mockResolvedValue([
    { id: 'user-1', email: 'test1@example.com', name: 'Test User 1' },
    { id: 'user-2', email: 'test2@example.com', name: 'Test User 2' },
  ]);

  mockClient.brand.findMany.mockResolvedValue([
    { id: 'brand-1', name: 'Test Brand 1', type: BrandType.LABEL },
    { id: 'brand-2', name: 'Test Brand 2', type: BrandType.RETAILER },
  ]);

  mockClient.product.findMany.mockResolvedValue([
    { id: 'product-1', name: 'Test Product 1', status: ProductStatus.ACTIVE },
    { id: 'product-2', name: 'Test Product 2', status: ProductStatus.ACTIVE },
  ]);
};

/**
 * Set up error scenario for error handling tests
 * Standardizes error testing across all database tests
 */
const setupErrorScenario = (mockClient: any) => {
  const errorTypes = {
    connection: new Error('Database connection failed'),
    constraint: new Error('Unique constraint failed'),
    notFound: new Error('Record not found'),
    timeout: new Error('Query timeout'),
    validation: new Error('Validation failed'),
  };

  mockClient.user.create.mockRejectedValue(errorTypes.constraint);
  mockClient.brand.findUnique.mockRejectedValue(errorTypes.notFound);
  mockClient.$connect.mockRejectedValue(errorTypes.connection);
  mockClient.$transaction.mockRejectedValue(errorTypes.timeout);
};

/**
 * Set up auth-seeded scenario
 * Simulates database after auth seeding
 */
const setupAuthSeededScenario = (mockClient: any) => {
  mockClient.user.findUnique.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: new Date(),
  });

  mockClient.organization.findFirst.mockResolvedValue({
    id: 'test-org-id',
    name: 'Test Organization',
    slug: 'test-org',
  });

  mockClient.member.findFirst.mockResolvedValue({
    id: 'test-member-id',
    role: 'OWNER',
    userId: 'test-user-id',
    organizationId: 'test-org-id',
  });
};

/**
 * Set up ecommerce-seeded scenario
 * Simulates database after ecommerce seeding
 */
const setupEcommerceSeededScenario = (mockClient: any) => {
  mockClient.brand.findMany.mockResolvedValue([
    { id: 'brand-1', name: 'Target', type: BrandType.RETAILER },
    { id: 'brand-2', name: 'Nike', type: BrandType.LABEL },
  ]);

  mockClient.category.findMany.mockResolvedValue([
    { id: 'category-1', name: 'Clothing', slug: 'clothing' },
    { id: 'category-2', name: 'Footwear', slug: 'footwear' },
  ]);

  mockClient.product.findMany.mockResolvedValue([
    { id: 'product-1', name: 'T-Shirt', status: ProductStatus.ACTIVE },
    { id: 'product-2', name: 'Sneakers', status: ProductStatus.ACTIVE },
  ]);
};

/**
 * Firestore mock factory
 * Centralizes Firestore testing patterns
 */
export const createMockFirestoreClient = (scenario: string = 'default') => {
  const mockFirestore = {
    collection: vi.fn(),
    doc: vi.fn(),
    batch: vi.fn(),
    runTransaction: vi.fn(),
    terminate: vi.fn(),
  };

  const mockCollection = {
    doc: vi.fn(),
    add: vi.fn(),
    get: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
  };

  const mockDoc = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    onSnapshot: vi.fn(),
  };

  // Set up method chaining
  mockFirestore.collection.mockReturnValue(mockCollection);
  mockFirestore.doc.mockReturnValue(mockDoc);
  mockCollection.doc.mockReturnValue(mockDoc);
  mockCollection.where.mockReturnValue(mockCollection);
  mockCollection.orderBy.mockReturnValue(mockCollection);
  mockCollection.limit.mockReturnValue(mockCollection);

  // Set up scenario-specific behavior
  if (scenario === 'empty') {
    mockCollection.get.mockResolvedValue({ empty: true, docs: [] });
    mockDoc.get.mockResolvedValue({ exists: false });
  } else if (scenario === 'populated') {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [
        { id: 'doc-1', data: () => ({ name: 'Test Doc 1' }) },
        { id: 'doc-2', data: () => ({ name: 'Test Doc 2' }) },
      ],
    });
    mockDoc.get.mockResolvedValue({
      exists: true,
      id: 'test-doc',
      data: () => ({ name: 'Test Document' }),
    });
  }

  return { mockFirestore, mockCollection, mockDoc };
};

/**
 * Upstash Redis mock factory
 * Centralizes Redis testing patterns
 */
export const createMockUpstashRedis = (scenario: string = 'default') => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    keys: vi.fn(),
    flushall: vi.fn(),
    ping: vi.fn(),
    hget: vi.fn(),
    hset: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn(),
    zadd: vi.fn(),
    zrange: vi.fn(),
    zrem: vi.fn(),
    incr: vi.fn(),
    decr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  };

  // Set up scenario-specific behavior
  if (scenario === 'empty') {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.keys.mockResolvedValue([]);
    mockRedis.exists.mockResolvedValue(0);
  } else if (scenario === 'populated') {
    mockRedis.get.mockResolvedValue('test-value');
    mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
    mockRedis.exists.mockResolvedValue(1);
    mockRedis.hgetall.mockResolvedValue({ field1: 'value1', field2: 'value2' });
  }

  mockRedis.ping.mockResolvedValue('PONG');
  mockRedis.set.mockResolvedValue('OK');
  mockRedis.del.mockResolvedValue(1);

  return mockRedis;
};

/**
 * Upstash Vector mock factory
 * Centralizes vector database testing patterns
 */
export const createMockUpstashVector = (scenario: string = 'default') => {
  const mockVector = {
    query: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    fetch: vi.fn(),
    reset: vi.fn(),
    info: vi.fn(),
    listNamespaces: vi.fn(),
  };

  // Set up scenario-specific behavior
  if (scenario === 'empty') {
    mockVector.query.mockResolvedValue({ matches: [] });
    mockVector.fetch.mockResolvedValue({ vectors: {} });
    mockVector.listNamespaces.mockResolvedValue([]);
  } else if (scenario === 'populated') {
    mockVector.query.mockResolvedValue({
      matches: [
        { id: 'vector-1', score: 0.95, values: [1, 2, 3] },
        { id: 'vector-2', score: 0.87, values: [4, 5, 6] },
      ],
    });
    mockVector.fetch.mockResolvedValue({
      vectors: {
        'vector-1': { id: 'vector-1', values: [1, 2, 3] },
        'vector-2': { id: 'vector-2', values: [4, 5, 6] },
      },
    });
  }

  mockVector.upsert.mockResolvedValue({ upsertedCount: 1 });
  mockVector.delete.mockResolvedValue({ deletedCount: 1 });

  return mockVector;
};

/**
 * Database test lifecycle manager
 * Handles setup and teardown for all database tests
 */
export class DatabaseTestManager {
  private mockClient: any;
  private mockFirestore: any;
  private mockRedis: any;
  private mockVector: any;

  constructor(
    scenario: string = 'default',
    options: {
      includePrisma?: boolean;
      includeFirestore?: boolean;
      includeRedis?: boolean;
      includeVector?: boolean;
    } = {},
  ) {
    const {
      includePrisma = true,
      includeFirestore = false,
      includeRedis = false,
      includeVector = false,
    } = options;

    if (includePrisma) {
      this.mockClient = createMockPrismaWithScenarios(scenario);
    }
    if (includeFirestore) {
      this.mockFirestore = createMockFirestoreClient(scenario);
    }
    if (includeRedis) {
      this.mockRedis = createMockUpstashRedis(scenario);
    }
    if (includeVector) {
      this.mockVector = createMockUpstashVector(scenario);
    }
  }

  /**
   * Get all mock clients
   */
  getMocks() {
    return {
      prisma: this.mockClient,
      firestore: this.mockFirestore,
      redis: this.mockRedis,
      vector: this.mockVector,
    };
  }

  /**
   * Reset all mocks to default state
   */
  reset() {
    vi.clearAllMocks();
    if (this.mockClient) {
      setupMockDefaults(this.mockClient);
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    vi.restoreAllMocks();
  }
}

/**
 * Backward compatibility helper for existing tests
 * Maintains the same interface as the old setupPrismaTestMocks
 */
export const setupDatabaseTestMocks = (scenario: string = 'default') => {
  const manager = new DatabaseTestManager(scenario);
  return manager.getMocks();
};

/**
 * Backward compatibility helper
 */
export const resetDatabaseTestMocks = () => {
  vi.clearAllMocks();
};
