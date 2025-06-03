import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import {
  cleanupMockFirestoreEnvironment,
  resetMockFirestoreStorage,
  setupMockFirestoreEnvironment,
} from '../mocks/firestore';
import {
  cleanupMockRedisEnvironment,
  resetMockRedisStorage,
  setupMockRedisEnvironment,
} from '../mocks/upstash-redis';
import {
  cleanupMockVectorEnvironment,
  resetMockVectorStorage,
  setupMockVectorEnvironment,
} from '../mocks/upstash-vector';

// Global database test setup
beforeAll(async () => {
  // Setup all database mock environments
  setupMockFirestoreEnvironment();
  setupMockVectorEnvironment();
  setupMockRedisEnvironment();

  // Mock console methods to reduce noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock Date.now for consistent timestamps in tests
  const mockNow = new Date('2024-01-01T00:00:00.000Z').getTime();
  vi.spyOn(Date, 'now').mockReturnValue(mockNow);
});

// Reset storage before each test
beforeEach(async () => {
  resetMockFirestoreStorage();
  resetMockVectorStorage();
  resetMockRedisStorage();
});

// Clean up after each test
afterEach(async () => {
  // Clear any test data
  resetMockFirestoreStorage();
  resetMockVectorStorage();
  resetMockRedisStorage();

  // Clear all mocks
  vi.clearAllMocks();
});

// Global cleanup
afterAll(async () => {
  cleanupMockFirestoreEnvironment();
  cleanupMockVectorEnvironment();
  cleanupMockRedisEnvironment();

  // Restore all mocks
  vi.restoreAllMocks();
});

// Export setup utilities for manual use
export {
  cleanupMockFirestoreEnvironment,
  cleanupMockRedisEnvironment,
  cleanupMockVectorEnvironment,
  resetMockFirestoreStorage,
  resetMockRedisStorage,
  resetMockVectorStorage,
  setupMockFirestoreEnvironment,
  setupMockRedisEnvironment,
  setupMockVectorEnvironment,
};
