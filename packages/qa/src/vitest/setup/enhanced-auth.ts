/**
 * Enhanced auth setup for QA package
 * Incorporates additional patterns from packages/auth/src/testing/vitest.ts
 * Provides comprehensive auth environment setup for all packages
 */

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { setupNextMocks } from '../mocks/internal/next';

/**
 * Enhanced auth setup with all Better Auth mocks and database setup
 * Use this in packages that need comprehensive auth testing
 */
export function setupEnhancedAuth() {
  // Setup global test environment
  beforeEach(() => {
    // Reset all mocks before each test
    resetAuthMocks();

    // Mock console to reduce noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock fetch globally
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response());

    // Mock environment variables
    vi.stubEnv('BETTER_AUTH_SECRET', 'test-secret');
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

    // Setup centralized Next.js mocks
    setupNextMocks();
  });

  afterEach(() => {
    // Cleanup React Testing Library
    cleanup();

    // Restore all mocks
    vi.restoreAllMocks();

    // Clear all environment variables
    vi.unstubAllEnvs();

    // Restore global functions
    restoreGlobals();
  });
}

/**
 * Reset all auth-related mocks
 */
export function resetAuthMocks() {
  vi.clearAllMocks();

  // Reset any module-level state
  if (typeof global !== 'undefined') {
    delete global.testUtils;
  }
}

/**
 * Restore global functions that may have been modified during tests
 */
export function restoreGlobals() {
  // Restore fetch if it was replaced
  if (global.fetch && typeof (global.fetch as any).mockRestore === 'function') {
    (global.fetch as any).mockRestore();
  }

  // Restore any other globals that tests might have modified
  if (typeof window !== 'undefined') {
    // Restore window globals in browser environment
    delete window.testUtils;
  }
}

/**
 * Setup Better Auth mocks using vi.mock
 * Call this at the module level in your test files
 */
export function setupBetterAuthMocks() {
  // Mock Better Auth core
  vi.mock('better-auth', () => ({
    BetterAuth: vi.fn().mockImplementation(() => ({
      api: {
        createApiKey: vi.fn(),
        createOrganization: vi.fn(),
        forgotPassword: vi.fn(),
        getSession: vi.fn(),
        listApiKeys: vi.fn(),
        listOrganizations: vi.fn(),
        resetPassword: vi.fn(),
        revokeApiKey: vi.fn(),
        setActiveOrganization: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        verifyApiKey: vi.fn(),
        verifyEmail: vi.fn(),
      },
    })),
  }));

  // Mock Better Auth cookies
  vi.mock('better-auth/cookies', () => ({
    getSessionCookie: vi.fn().mockReturnValue('mock-session-cookie'),
  }));
}

/**
 * Setup database mocks for auth testing
 * Call this at the module level in your test files
 */
export function setupAuthDatabaseMocks() {
  // Mock database with all auth-related models
  vi.mock('@repo/database', () => ({
    database: {
      apiKey: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      invitation: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      member: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      organization: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      team: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      teamMember: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  }));
}

// Global test utilities type declaration
declare global {
  var testUtils: any;
}

/**
 * Setup global test utilities that were in the auth package
 */
export function setupAuthTestUtilities() {
  global.testUtils = {
    createMockResponse: (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status,
      });
    },

    createMockRequest: (url: string, options: RequestInit = {}) => {
      return new Request(url, options);
    },
  };
}

/**
 * Complete auth test setup - combines all auth setup functions
 * Use this as a single import for full auth testing capabilities
 */
export function setupCompleteAuthEnvironment() {
  setupBetterAuthMocks();
  setupAuthDatabaseMocks();
  setupEnhancedAuth();
  setupAuthTestUtilities();
}

/**
 * Utility to create common auth test scenarios
 */
export const authSetupHelpers = {
  /**
   * Create a test environment with authenticated user
   */
  authenticatedUser: () => {
    const { createMockSession } = require('../mocks/internal/auth-factories');
    const mockSession = createMockSession();

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockSession), { status: 200 }),
    );

    return mockSession;
  },

  /**
   * Create a test environment with unauthenticated user
   */
  unauthenticatedUser: () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));
  },

  /**
   * Create a test environment with specific organization
   */
  withOrganization: (orgData?: any) => {
    const { createMockOrganization } = require('../mocks/internal/auth-factories');
    const mockOrg = createMockOrganization(orgData);

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockOrg), { status: 200 }),
    );

    return mockOrg;
  },

  /**
   * Mock auth middleware for request testing
   */
  mockAuthMiddleware: (req: any) => {
    req.headers = req.headers || new Headers();
    req.headers.set('x-user-id', 'user-123');
    req.headers.set('x-organization-id', 'org-123');
    return req;
  },
};
