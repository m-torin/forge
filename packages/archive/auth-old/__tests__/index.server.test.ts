import { describe, expect, it, vi } from 'vitest';

// Import the server index file after mocks are set up
import * as authServerExports from '../index.server';

// Mock server-only module before any imports
vi.mock('server-only', () => ({}));

// Mock the keys module to avoid environment variable issues
vi.mock('../keys', () => ({
  keys: vi.fn(() => ({
    BETTER_AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  })),
}));

// Mock all modules that index.server.ts imports
vi.mock('../server', () => ({
  auth: { api: { getSession: vi.fn() } },
  currentUser: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('../helpers', () => ({
  getCurrentOrganization: vi.fn(),
}));

vi.mock('../organization-helpers', () => ({
  // Add any exports from organization-helpers here
}));

vi.mock('../middleware', () => ({
  authMiddleware: vi.fn(),
}));

vi.mock('../middleware.node', () => ({
  nodeAuthMiddleware: vi.fn(),
}));

vi.mock('../middleware-api', () => ({
  apiAuthMiddleware: vi.fn(),
  createAuthMiddleware: vi.fn(),
}));

vi.mock('../api-key-helpers', () => ({
  validateApiKey: vi.fn(),
  hasPermission: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock('../actions', () => ({
  // Add any exports from actions here
}));

// Mock Better Auth type exports
vi.mock('better-auth', () => ({
  // Type exports don't need actual implementations in tests
}));

describe('Auth Package Server Index Exports', () => {
  it('exports server functions', () => {
    expect(authServerExports).toHaveProperty('auth');
    expect(authServerExports).toHaveProperty('currentUser');
    expect(authServerExports).toHaveProperty('getSession');
  });

  it('exports middleware functions', () => {
    expect(authServerExports).toHaveProperty('authMiddleware');
    expect(authServerExports).toHaveProperty('nodeAuthMiddleware');
    expect(authServerExports).toHaveProperty('apiAuthMiddleware');
    expect(authServerExports).toHaveProperty('createAuthMiddleware');
  });

  it('exports helper functions', () => {
    expect(authServerExports).toHaveProperty('getCurrentOrganization');
  });

  it('exports API key helper functions', () => {
    expect(authServerExports).toHaveProperty('hasPermission');
    expect(authServerExports).toHaveProperty('requireAuth');
    expect(authServerExports).toHaveProperty('validateApiKey');
  });

  it('exports keys function', () => {
    expect(authServerExports).toHaveProperty('keys');
  });

  it('exports permissions and roles', () => {
    expect(authServerExports).toHaveProperty('ac');
    expect(authServerExports).toHaveProperty('roles');
  });
});
