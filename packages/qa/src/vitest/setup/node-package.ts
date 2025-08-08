/**
 * Comprehensive setup for Node.js packages
 * Import this in your vitest config via the createNodePackageConfig builder
 */

// Import base setup
import { vi } from 'vitest';
import './common';

// Import AI mocks for packages that need them
import '../mocks/providers/ai';

// Import centralized provider mocks
import './providers';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock common Node.js modules that might be used
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
  };
});

// Mock crypto for consistent test results
vi.mock('node:crypto', async () => {
  const actual = await vi.importActual<typeof import('node:crypto')>('node:crypto');
  return {
    ...actual,
    randomUUID: vi.fn(() => 'test-uuid-12345'),
    randomBytes: vi.fn((size: number) => Buffer.alloc(size, 'test')),
  };
});

// Mock timers if needed
// Note: Use vi.useFakeTimers() in specific tests that need it

// Common test utilities for Node packages
export const mockEnv = (overrides: Record<string, string>) => {
  const original = { ...process.env };
  Object.assign(process.env, overrides);
  return () => {
    process.env = original;
  };
};

// Helper to create mock HTTP responses
export const createMockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Helper to create mock fetch
export const createMockFetch = (responses: Record<string, any>) => {
  return vi.fn((url: string) => {
    const response = responses[url];
    if (!response) {
      return Promise.reject(new Error(`No mock response for ${url}`));
    }
    return Promise.resolve(createMockResponse(response));
  });
};

// Export commonly used testing utilities
export * from '../utils/test-helpers';
