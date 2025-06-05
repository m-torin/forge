/**
 * Vitest setup for auth package tests
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetMocks } from '../mocks/auth';
import { restoreGlobals } from '../utilities/factories';

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  resetMocks();
  
  // Mock console to reduce noise in tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  
  // Mock fetch globally
  global.fetch = vi.fn();
  
  // Mock environment variables
  vi.stubEnv('BETTER_AUTH_SECRET', 'test-secret');
  vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  
  // Mock Next.js headers function
  vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers({
      'user-agent': 'test-agent',
      'x-forwarded-for': '127.0.0.1',
    })),
  }));
  
  // Mock Next.js navigation
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));
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

// Mock Better Auth
vi.mock('better-auth', () => ({
  BetterAuth: vi.fn().mockImplementation(() => ({
    api: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      verifyEmail: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      createOrganization: vi.fn(),
      listOrganizations: vi.fn(),
      setActiveOrganization: vi.fn(),
      createApiKey: vi.fn(),
      verifyApiKey: vi.fn(),
      revokeApiKey: vi.fn(),
      listApiKeys: vi.fn(),
    },
  })),
}));

// Mock Better Auth cookies
vi.mock('better-auth/cookies', () => ({
  getSessionCookie: vi.fn().mockReturnValue('mock-session-cookie'),
}));

// Mock database
vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    member: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    teamMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    apiKey: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    invitation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Global test utilities
declare global {
  var testUtils: {
    createMockResponse: (data: any, status?: number) => Response;
    createMockRequest: (url: string, options?: RequestInit) => Request;
  };
}

global.testUtils = {
  createMockResponse: (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  
  createMockRequest: (url: string, options: RequestInit = {}) => {
    return new Request(url, options);
  },
};