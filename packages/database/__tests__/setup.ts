import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';

// Mock the adapters before importing them
vi.mock('@upstash/vector', () => ({
  Index: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}));

vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  credential: {
    cert: vi.fn(),
  },
  firestore: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
}));

// Setup environment variables
beforeAll(() => {
  // Database mocking environment
  process.env.NODE_ENV = 'test';
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