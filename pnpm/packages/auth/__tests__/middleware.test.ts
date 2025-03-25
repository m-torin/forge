import { describe, expect, it, vi } from 'vitest';

// Mock the Clerk middleware
vi.mock('@clerk/nextjs/server', () => {
  return {
    clerkMiddleware: Object.assign(vi.fn(), {
      beforeAuth: vi.fn(),
      afterAuth: vi.fn(),
      publicRoutes: vi.fn(),
    }),
  };
});

// Import after mocking
import { authMiddleware } from '../middleware';

describe('Auth Middleware', () => {
  it('exports the authMiddleware function', () => {
    expect(authMiddleware).toBeDefined();
    expect(typeof authMiddleware).toBe('function');
  });

  it('authMiddleware is the Clerk middleware', () => {
    // Since we're re-exporting from @clerk/nextjs/server, we can't directly test the implementation
    // But we can test that it's a function with the expected properties

    // The authMiddleware should have a 'beforeAuth' property
    expect(authMiddleware).toHaveProperty('beforeAuth');

    // The authMiddleware should have an 'afterAuth' property
    expect(authMiddleware).toHaveProperty('afterAuth');

    // The authMiddleware should have a 'publicRoutes' property
    expect(authMiddleware).toHaveProperty('publicRoutes');
  });
});
