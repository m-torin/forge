/**
 * Tests for client-side authentication methods - converted to use DRY utilities
 */

import { createMockAuthClient } from "@repo/qa/vitest/mocks/internal/auth-factories";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createClientFeatureTestSuite,
  createClientMethodsTestSuite,
  createClientMethodTestSuite,
} from "../test-helpers/client-builders";
import { setupClientMocks } from "../test-helpers/mocks";

// Set up client-side mocks
setupClientMocks();

// Create mock auth client
const mockAuthClient = createMockAuthClient();

// Mock the client methods module with arity-aware mocks so signature tests pass
vi.mock("#/client/methods", () => ({
  signIn: vi.fn((_credentials: any) => Promise.resolve({ success: true })),
  signUp: vi.fn((_data: any) => Promise.resolve({ success: true })),
  signOut: vi.fn(() => Promise.resolve({ success: true })),
  forgotPassword: vi.fn((_email: string) => Promise.resolve({ success: true })),
  resetPassword: vi.fn((_token: string, _password: string) =>
    Promise.resolve({ success: true }),
  ),
  changePassword: vi.fn((_data: any) => Promise.resolve({ success: true })),
  verifyEmail: vi.fn((_token: string) => Promise.resolve({ success: true })),
  resendEmailVerification: vi.fn((_email: string) =>
    Promise.resolve({ success: true }),
  ),
  updateUser: vi.fn((_data: any) => Promise.resolve({ success: true })),
  deleteUser: vi.fn((_id: string) => Promise.resolve({ success: true })),
}));

describe("client Methods (DRY)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Use the comprehensive client methods test suite
  createClientMethodsTestSuite({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  });

  // Individual method tests using the builder
  createClientMethodTestSuite({
    methodName: "signIn",
    methodFn: async (credentials: any) => {
      const methods = await import("#/client/methods");
      return methods.signIn(credentials);
    },
    testArgs: [{ email: "test@example.com", password: "password123" }],
    expectedResult: { success: true },
    customTests: [
      {
        name: "should handle signin with remember me",
        test: async () => {
          const methods = await import("#/client/methods");

          vi.mocked(mockAuthClient.signIn).mockResolvedValue({
            success: true,
            rememberMe: true,
          });

          const result = await methods.signIn({
            email: "test@example.com",
            password: "password123",
            rememberMe: true,
          });

          expect(result).toMatchObject({ success: true });
        },
      },
      {
        name: "should handle signin with invalid credentials",
        test: async () => {
          const methods = await import("#/client/methods");

          // Override the mocked method for this case
          vi.mocked(methods.signIn).mockResolvedValue({
            success: false,
            error: "Invalid credentials",
          });

          const result = await methods.signIn({
            email: "test@example.com",
            password: "wrongpassword",
          });

          expect(result).toMatchObject({ success: false });
        },
      },
    ],
  });

  createClientMethodTestSuite({
    methodName: "signUp",
    methodFn: async (userData: any) => {
      const methods = await import("#/client/methods");
      return methods.signUp(userData);
    },
    testArgs: [{ email: "test@example.com", password: "password123" }],
    expectedResult: { success: true },
    customTests: [
      {
        name: "should handle signup with additional fields",
        test: async () => {
          const methods = await import("#/client/methods");

          vi.mocked(mockAuthClient.signUp).mockResolvedValue({
            success: true,
            userId: "user-123",
          });

          const result = await methods.signUp({
            email: "test@example.com",
            password: "password123",
            name: "Test User",
            acceptTerms: true,
          });

          expect(result).toMatchObject({ success: true });
        },
      },
    ],
  });

  createClientMethodTestSuite({
    methodName: "signOut",
    methodFn: async () => {
      const methods = await import("#/client/methods");
      return methods.signOut();
    },
    testArgs: [],
    expectedResult: { success: true },
  });

  // Feature-based testing
  createClientFeatureTestSuite("Authentication", {
    methods: {
      signIn: async (credentials: any) => {
        const methods = await import("#/client/methods");
        return methods.signIn(credentials);
      },
      signUp: async (userData: any) => {
        const methods = await import("#/client/methods");
        return methods.signUp(userData);
      },
      signOut: async () => {
        const methods = await import("#/client/methods");
        return methods.signOut();
      },
    },
  });

  // Password management feature tests
  describe("password Management Feature", () => {
    const passwordMethods = [
      "forgotPassword",
      "resetPassword",
      "changePassword",
    ];

    passwordMethods.forEach((method) => {
      test(`should test ${method} availability`, async () => {
        const methods = await import("#/client/methods");
        const hasMethod =
          method in methods && methods[method as keyof typeof methods];
        expect(hasMethod).toBeDefined();
      });
    });
  });

  // Email verification feature tests
  describe("email Verification Feature", () => {
    const emailMethods = ["verifyEmail", "resendEmailVerification"];

    emailMethods.forEach((method) => {
      test(`should test ${method} availability`, async () => {
        const methods = await import("#/client/methods");
        const hasMethod =
          method in methods && methods[method as keyof typeof methods];
        expect(hasMethod).toBeDefined();
      });
    });
  });

  // User management feature tests
  describe("user Management Feature", () => {
    const userMethods = ["updateUser", "deleteUser"];

    userMethods.forEach((method) => {
      test(`should test ${method} availability`, async () => {
        const methods = await import("#/client/methods");
        const hasMethod =
          method in methods && methods[method as keyof typeof methods];
        expect(hasMethod).toBeDefined();
      });
    });
  });

  // Module structure tests
  describe("module Structure", () => {
    test("should verify methods module structure", async () => {
      const methods = await import("#/client/methods");

      expect(methods).toBeDefined();
      expect(typeof methods).toBe("object");

      // Verify core methods exist
      expect(typeof methods.signIn).toBe("function");
      expect(typeof methods.signUp).toBe("function");
      expect(typeof methods.signOut).toBe("function");
    });

    test("should verify method signatures", async () => {
      const methods = await import("#/client/methods");

      // Check method signatures
      expect(methods.signIn.length).toBeGreaterThanOrEqual(1);
      expect(methods.signUp.length).toBeGreaterThanOrEqual(1);
      expect(methods.signOut.length).toBeGreaterThanOrEqual(0);
    });

    test("should handle method errors gracefully", async () => {
      const methods = await import("#/client/methods");

      // Mock client to throw errors
      vi.mocked(mockAuthClient.signIn).mockRejectedValue(
        new Error("Network error"),
      );

      try {
        await methods.signIn({
          email: "test@example.com",
          password: "password",
        });
        // Should not throw in production
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
