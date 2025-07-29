import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// Database environment is set via vitest config env option

// App-specific extension for @prisma/extension-accelerate
vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn(() => ({
    name: 'accelerate',
    extendClient: vi.fn((client: any) => client),
  })),
}));

// Also mock the generated client path (specific to this package)
vi.mock('../pris../../prisma-generated/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $extends: vi.fn(() => ({})),
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    organization: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    member: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  })),
}));

// Setup environment variables
beforeAll(() => {
  // Additional database-specific environment variables
  process.env.DATABASE_PROVIDER = 'prisma';
  process.env.FIREBASE_PROJECT_ID = 'mock-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'mock@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'mock-private-key';

  // Mock console methods to reduce noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Reset mocks after each test
  vi.resetAllMocks();
});

afterAll(() => {
  // Restore all mocks
  vi.restoreAllMocks();

  // Clean up environment
  delete process.env.DATABASE_PROVIDER;
  delete process.env.DATABASE_URL;
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
  delete process.env.UPSTASH_VECTOR_REST_URL;
  delete process.env.UPSTASH_VECTOR_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});
