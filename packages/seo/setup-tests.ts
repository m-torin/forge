import { vi } from 'vitest';
import '@repo/testing/src/vitest/core/setup';

// Mock lodash.merge
vi.mock('lodash.merge', () => {
  return {
    default: vi.fn().mockImplementation((target, ...sources) => {
      return Object.assign({}, target, ...sources);
    }),
  };
});

// Mock Next.js Metadata type
vi.mock('next', () => {
  return {
    // We don't need to mock any functionality, just the type
  };
});

// Mock schema-dts
vi.mock('schema-dts', () => {
  return {
    // We don't need to mock any functionality, just the types
  };
});
