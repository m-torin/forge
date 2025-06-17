import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';

// Mock the adapters before importing them
vi.mock('@upstash/vector', (_: any) => ({
  Index: vi.fn(),
}));

vi.mock('@upstash/redis', (_: any) => ({
  Redis: vi.fn(),
}));

vi.mock('firebase-admin', (_: any) => ({
  initializeApp: vi.fn(),
  credential: {
    cert: vi.fn(),
  },
  firestore: vi.fn(),
}));

vi.mock('@prisma/extension-accelerate', (_: any) => ({
  withAccelerate: vi.fn(() => ({
    name: 'accelerate',
    extendClient: vi.fn((client: any) => client),
  })),
}));

const createMockPrismaClient = () => ({
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $extends: vi.fn(function (_: any) {
    // Return a new client with the same structure
    return createMockPrismaClient();
  }),
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
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
});

vi.mock('@prisma/client', (_: any) => ({
  PrismaClient: vi.fn(() => createMockPrismaClient()),
}));

// Also mock the generated client
vi.mock('../pris../../prisma-generated/client', (_: any) => ({
  PrismaClient: vi.fn(() => createMockPrismaClient()),
}));

// Setup environment variables
beforeAll(() => {
  // Database mocking environment
  vi.stubEnv('NODE_ENV', 'test');
  process.env.DATABASE_PROVIDER = 'prisma';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.FIREBASE_PROJECT_ID = 'mock-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'mock@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'mock-private-key';
  process.env.UPSTASH_VECTOR_REST_URL = 'https://mock-vector.upstash.io';
  process.env.UPSTASH_VECTOR_REST_TOKEN = 'mock-vector-token';
  process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-redis-token';

  // Mock console methods to reduce noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
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
