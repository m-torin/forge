/**
 * Shared testing utilities
 *
 * These utilities are framework-agnostic and can be used with any testing setup.
 */

// Export environment utilities
export * from '../env/index.ts';

// Export mock utilities
export * from './mocks.ts';

// Re-export Vitest functions for convenience
export {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export * from './env.ts';
