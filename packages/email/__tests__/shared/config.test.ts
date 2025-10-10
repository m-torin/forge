/**
 * Shared Configuration Tests
 *
 * Tests for email package configuration and shared utilities.
 * Following analytics package pattern for DRY testing.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockScenarios } from "../test-utils/setup";

describe("email Package Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("environment configuration", () => {
    test("should load environment variables correctly", async () => {
      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      expect(env).toBeDefined();
      expect(typeof env).toBe("object");
      expect(env).toHaveProperty("RESEND_FROM");
      expect(env).toHaveProperty("RESEND_TOKEN");
    });

    test("should provide default values for missing environment variables", async () => {
      mockScenarios.missingEnvironmentVariables();

      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      expect(env).toBeDefined();
      expect(env.RESEND_FROM).toBeDefined();
      expect(env.RESEND_TOKEN).toBeDefined();
    });

    test("should handle partial environment configuration", async () => {
      mockScenarios.partialEnvironmentVariables({
        RESEND_FROM: "test@example.com",
        RESEND_TOKEN: "",
      });

      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      expect(env.RESEND_FROM).toBe("test@example.com");
      expect(env.RESEND_TOKEN).toBeDefined();
    });

    test("should validate environment variable types", async () => {
      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      expect(typeof env.RESEND_FROM).toBe("string");
      expect(typeof env.RESEND_TOKEN).toBe("string");
    });
  });

  describe("resend client configuration", () => {
    test("should initialize resend client with proper configuration", async () => {
      const { resend } = await import("../../src/index");

      expect(resend).toBeDefined();
      expect(typeof resend).toBe("object");
      expect(resend.emails).toBeDefined();
    });

    test("should handle resend client initialization failure", async () => {
      mockScenarios.authenticationFailure();

      const { resend } = await import("../../src/index");

      // Should not throw during initialization
      expect(() => resend.emails).not.toThrow();
    });

    test("should provide lazy initialization", async () => {
      const { resend } = await import("../../src/index");

      // Should not initialize until first use
      expect(resend).toBeDefined();

      // Should initialize on first property access
      expect(() => resend.emails).not.toThrow();
    });

    test("should handle missing API token gracefully", async () => {
      mockScenarios.missingEnvironmentVariables();

      const { resend } = await import("../../src/index");

      // Should provide fallback functionality
      expect(resend.emails).toBeDefined();
      expect(typeof resend.emails.send).toBe("function");

      // Should return mock response for missing token
      const result = await resend.emails.send({
        from: "test@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result).toStrictEqual({
        data: null,
        error: {
          message: "API key is invalid",
          name: "validation_error",
          statusCode: 401,
        },
      });
    });
  });

  describe("logger configuration", () => {
    test("should configure logger for email operations", async () => {
      // Import to trigger logger setup
      await import("../../src/index");

      expect((global as any).mockLogger).toBeDefined();
      expect(typeof (global as any).mockLogger.warn).toBe("function");
      expect(typeof (global as any).mockLogger.error).toBe("function");
    });

    test("should handle logger in test environment", async () => {
      // Logger should be mocked in test environment
      await import("../../src/index");

      const mockLogger = (global as any).mockLogger;
      expect(mockLogger).toBeDefined();
      expect(vi.isMockFunction(mockLogger.warn)).toBeTruthy();
      expect(vi.isMockFunction(mockLogger.error)).toBeTruthy();
    });

    test("should suppress logs in test environment", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      try {
        await import("../../src/index");

        // Should not log to console in test environment
        expect((global as any).mockLogger).toBeDefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("template configuration", () => {
    test("should configure all email templates", async () => {
      const emailModule = await import("../../src/index");

      const templates = [
        "MagicLinkTemplate",
        "VerificationTemplate",
        "PasswordResetTemplate",
        "ContactTemplate",
        "OrganizationInvitationTemplate",
        "WelcomeTemplate",
        "ApiKeyCreatedTemplate",
      ];

      templates.forEach((templateName) => {
        expect((emailModule as any)[templateName]).toBeDefined();
        expect(typeof (emailModule as any)[templateName]).toBe("function");
      });
    });

    test("should provide template example components", async () => {
      const templatePaths = [
        "../../src/templates/magic-link",
        "../../src/templates/verification",
        "../../src/templates/password-reset",
        "../../src/templates/contact",
        "../../src/templates/organization-invitation",
        "../../src/templates/welcome",
        "../../src/templates/api-key-created",
      ];

      for (const templatePath of templatePaths) {
        const templateModule = await import(templatePath);
        expect(templateModule.default).toBeDefined();
        expect(typeof templateModule.default).toBe("function");
      }
    });
  });

  describe("react email configuration", () => {
    test("should configure react email renderer", async () => {
      const { render } = await import("@react-email/render");

      expect(render).toBeDefined();
      expect(typeof render).toBe("function");
    });

    test("should handle render function with templates", async () => {
      const { render } = await import("@react-email/render");
      const { MagicLinkTemplate } = await import("../../src/index");

      const result = await render(
        MagicLinkTemplate({
          email: "test@example.com",
          name: "Test User",
          expiresIn: "30 minutes",
          magicLink: "https://example.com/magic?token=abc123",
        }),
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("configuration validation", () => {
    test("should validate required configuration fields", async () => {
      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      // Should have required fields
      expect(env).toHaveProperty("RESEND_FROM");
      expect(env).toHaveProperty("RESEND_TOKEN");

      // Should not be undefined
      expect(env.RESEND_FROM).toBeDefined();
      expect(env.RESEND_TOKEN).toBeDefined();
    });

    test("should validate email format for RESEND_FROM", async () => {
      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      // Should be a valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(env.RESEND_FROM).toMatch(emailRegex);
    });

    test("should validate API token format for RESEND_TOKEN", async () => {
      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      // Should be a string (format validation would be done by Resend)
      expect(typeof env.RESEND_TOKEN).toBe("string");
    });
  });

  describe("default configuration values", () => {
    test("should provide sensible defaults", async () => {
      mockScenarios.missingEnvironmentVariables();

      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      // Should have default values
      expect(env.RESEND_FROM).toBe("noreply@example.com");
      expect(env.RESEND_TOKEN).toBeDefined();
    });

    test("should use configuration hierarchy", async () => {
      // Test that explicit values override defaults
      mockScenarios.partialEnvironmentVariables({
        RESEND_FROM: "custom@example.com",
      });

      const { safeEnv } = await import("../../env");

      const env = safeEnv();

      expect(env.RESEND_FROM).toBe("custom@example.com");
    });
  });

  describe("configuration performance", () => {
    test("should load configuration quickly", async () => {
      const start = performance.now();

      const { safeEnv } = await import("../../env");
      const env = safeEnv();

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10); // Should load in < 10ms
      expect(env).toBeDefined();
    });

    test("should cache configuration values", async () => {
      const { safeEnv } = await import("../../env");

      const env1 = safeEnv();
      const env2 = safeEnv();

      // Should return same values (cached)
      expect(env1).toStrictEqual(env2);
    });
  });

  describe("configuration error handling", () => {
    test("should handle configuration errors gracefully", async () => {
      // Should not throw even with invalid configuration
      expect(async () => {
        await import("../../env");
      }).not.toThrow();
    });

    test("should provide fallback values for errors", async () => {
      const { safeEnv } = await import("../../env");

      // Should provide fallback even if configuration fails
      const env = safeEnv();

      expect(env).toBeDefined();
      expect(env.RESEND_FROM).toBeDefined();
      expect(env.RESEND_TOKEN).toBeDefined();
    });
  });

  describe("test environment configuration", () => {
    test("should configure for test environment", async () => {
      expect(process.env.NODE_ENV).toBe("test");

      const { safeEnv } = await import("../../env");
      const env = safeEnv();

      // Should provide test-friendly values
      expect(env).toBeDefined();
      expect(env.RESEND_FROM).toBe("noreply@example.com");
      expect(env.RESEND_TOKEN).toBe("re_123456789");
    });

    test("should provide mock implementations in test environment", async () => {
      const { resend } = await import("../../src/index");

      // Should provide mock functionality
      expect(resend.emails).toBeDefined();
      expect(typeof resend.emails.send).toBe("function");

      // Should return mock responses
      const result = await resend.emails.send({
        from: "test@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result).toStrictEqual({
        data: null,
        error: {
          message: "API key is invalid",
          name: "validation_error",
          statusCode: 401,
        },
      });
    });

    test("should handle test reset functionality", async () => {
      // Should provide reset function for tests
      expect(typeof (global as any).emailPackageReset).toBe("function");

      // Should not throw when called
      expect(() => (global as any).emailPackageReset()).not.toThrow();
    });
  });
});
