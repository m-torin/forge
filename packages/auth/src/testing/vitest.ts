/**
 * Vitest setup for auth package tests
 */

import { setupNextMocks } from "@repo/qa/vitest/mocks/internal/next";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { resetMocks } from "./mocks/auth";
import { restoreGlobals } from "./utilities/factories";

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  resetMocks();

  // Mock console to reduce noise in tests
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});

  // Mock fetch globally
  global.fetch = vi.fn();

  // Mock environment variables
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret");
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

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

// Mock Better Auth
vi.mock("better-auth", () => ({
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
vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn().mockReturnValue("mock-session-cookie"),
}));

// Mock database
vi.mock("@repo/db-prisma", () => ({
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
      headers: { "Content-Type": "application/json" },
      status,
    });
  },

  createMockRequest: (url: string, options: RequestInit = {}) => {
    return new Request(url, options);
  },
};
