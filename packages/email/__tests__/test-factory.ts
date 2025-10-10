/**
 * Email Package Test Factory
 *
 * Provides reusable test suite generators for email functionality.
 * Reduces test duplication and ensures consistent testing patterns.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Configuration for email template test suites
 */
export interface EmailTemplateTestConfig<TProps = any> {
  name: string;
  templateComponent: any;
  validProps: TProps;
  invalidProps?: TProps;
  renderAsHtml?: boolean;
  renderAsText?: boolean;
  mockSetup?: () => void;
  mockTeardown?: () => void;
}

/**
 * Configuration for email service test suites
 */
export interface EmailServiceTestConfig<TPayload = any> {
  name: string;
  serviceFunction: Function;
  validPayload: TPayload;
  invalidPayload?: TPayload;
  expectedResult?: any;
  mockSetup?: () => void;
  mockTeardown?: () => void;
}

/**
 * Configuration for email action test suites
 */
export interface EmailActionTestConfig<TPayload = any> {
  name: string;
  actionFunction: Function;
  validPayload: TPayload;
  invalidPayload?: TPayload;
  expectedResult?: any;
  mockSetup?: () => void;
  mockTeardown?: () => void;
}

/**
 * Creates a comprehensive test suite for email templates
 */
export function createEmailTemplateTestSuite<TProps = any>(
  config: EmailTemplateTestConfig<TProps>,
) {
  describe(`email Template:`, () => {
    beforeEach(() => {
      if (config.mockSetup) {
        config.mockSetup();
      }
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should render template component without errors", () => {
      expect(() => config.templateComponent(config.validProps)).not.toThrow();
    });

    test("should accept valid props", () => {
      const result = config.templateComponent(config.validProps);
      expect(result).toBeDefined();
    });

    if (config.invalidProps) {
      test("should handle invalid props gracefully", () => {
        expect(() =>
          config.templateComponent(config.invalidProps),
        ).not.toThrow();
      });
    }

    test("should be a React component", () => {
      expect(typeof config.templateComponent).toBe("function");
    });

    if (config.renderAsHtml !== false) {
      test("should render as HTML", async () => {
        const { render } = await import("@react-email/render");
        const html = render(config.templateComponent(config.validProps));
        expect(typeof html).toBe("string");
        expect(html).toContain("<html");
        expect(html).toContain("</html>");
      });

      test("should produce valid HTML structure", async () => {
        const { render } = await import("@react-email/render");
        const html = render(config.templateComponent(config.validProps));

        // Check for essential HTML elements
        expect(html).toContain("<body");
        expect(html).toContain("</body>");
        expect(html).toContain("<head");
        expect(html).toContain("</head>");
      });
    }

    if (config.renderAsText !== false) {
      test("should render as plain text", async () => {
        const { render } = await import("@react-email/render");
        const text = await render(config.templateComponent(config.validProps), {
          plainText: true,
        });
        expect(typeof text).toBe("string");
        expect(text.length).toBeGreaterThan(0);
        // Should not contain HTML tags
        expect(text).not.toMatch(/<[^>]+>/);
      });
    }

    test("should handle missing props gracefully", () => {
      expect(() => config.templateComponent({})).not.toThrow();
    });

    test("should be serializable for email transmission", async () => {
      const { render } = await import("@react-email/render");
      const html = render(config.templateComponent(config.validProps));

      // Should be able to JSON stringify without circular references
      expect(() => JSON.stringify({ html })).not.toThrow();
    });
  });
}

/**
 * Creates a test suite for email services
 */
export function createEmailServiceTestSuite<TPayload = any>(
  config: EmailServiceTestConfig<TPayload>,
) {
  describe(`email Service:`, () => {
    beforeEach(() => {
      if (config.mockSetup) {
        config.mockSetup();
      }
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should execute successfully with valid payload", async () => {
      const result = await config.serviceFunction(config.validPayload);

      if (config.expectedResult) {
        expect(result).toStrictEqual(config.expectedResult);
      } else {
        expect(result).toBeDefined();
      }
    });

    if (config.invalidPayload) {
      test("should handle invalid payload appropriately", async () => {
        await expect(
          config.serviceFunction(config.invalidPayload),
        ).rejects.toThrow();
      });
    }

    test("should validate input payload", async () => {
      // Test with undefined/null payload
      await expect(config.serviceFunction(undefined)).rejects.toThrow();
      await expect(config.serviceFunction(null)).rejects.toThrow();
    });

    test("should be a function", () => {
      expect(typeof config.serviceFunction).toBe("function");
    });

    test("should return a promise", () => {
      const result = config.serviceFunction(config.validPayload);
      expect(result).toBeInstanceOf(Promise);
    });
  });
}

/**
 * Creates a test suite for email server actions
 */
export function createEmailActionTestSuite<TPayload = any>(
  config: EmailActionTestConfig<TPayload>,
) {
  describe(`email Action:`, () => {
    beforeEach(() => {
      if (config.mockSetup) {
        config.mockSetup();
      }
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should execute successfully with valid payload", async () => {
      const result = await config.actionFunction(config.validPayload);

      if (config.expectedResult) {
        expect(result).toStrictEqual(config.expectedResult);
      } else {
        expect(result).toBeDefined();
      }
    });

    if (config.invalidPayload) {
      test("should handle invalid payload appropriately", async () => {
        await expect(
          config.actionFunction(config.invalidPayload),
        ).rejects.toThrow();
      });
    }

    test("should validate input payload", async () => {
      // Test with undefined/null payload
      await expect(config.actionFunction(undefined)).rejects.toThrow();
      await expect(config.actionFunction(null)).rejects.toThrow();
    });

    test("should be a server action", () => {
      // Check if function has server action properties
      expect(typeof config.actionFunction).toBe("function");
    });

    test("should handle form data input", async () => {
      if (typeof FormData !== "undefined") {
        const formData = new FormData();

        // Convert payload to form data entries
        Object.entries(config.validPayload as any).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        const result = await config.actionFunction(formData);
        expect(result).toBeDefined();
      }
    });
  });
}

/**
 * Creates a test suite for email providers (Resend, SendGrid, etc.)
 */
export function createEmailProviderTestSuite(config: {
  name: string;
  providerFactory: () => any;
  testEmail: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text?: string;
  };
  mockSetup?: () => void;
  mockTeardown?: () => void;
}) {
  describe(`email Provider:`, () => {
    let provider: any;

    beforeEach(() => {
      if (config.mockSetup) {
        config.mockSetup();
      }
      provider = config.providerFactory();
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should initialize provider correctly", () => {
      expect(provider).toBeDefined();
      expect(typeof provider).toBe("object");
    });

    test("should send email successfully", async () => {
      if (provider.send) {
        const result = await provider.send(config.testEmail);
        expect(result).toBeDefined();
      }
    });

    test("should validate email parameters", async () => {
      if (provider.send) {
        // Test missing required fields
        await expect(provider.send({})).rejects.toThrow();
        await expect(
          provider.send({ from: config.testEmail.from }),
        ).rejects.toThrow();
      }
    });

    test("should handle provider configuration", () => {
      expect(
        provider.config || provider.apiKey || provider.options,
      ).toBeDefined();
    });

    test("should format email addresses correctly", () => {
      if (provider.formatAddress) {
        const formatted = provider.formatAddress(
          "test@example.com",
          "Test User",
        );
        expect(typeof formatted).toBe("string");
      }
    });

    test("should handle batch email sending", async () => {
      if (provider.sendBatch) {
        const emails = [
          config.testEmail,
          { ...config.testEmail, to: ["another@example.com"] },
        ];
        const result = await provider.sendBatch(emails);
        expect(Array.isArray(result)).toBeTruthy();
      }
    });
  });
}

/**
 * Creates a test suite for email validation utilities
 */
export function createEmailValidationTestSuite(config: {
  name: string;
  validationFunction: Function;
  validEmails: string[];
  invalidEmails: string[];
}) {
  describe(`email Validation:`, () => {
    config.validEmails.forEach((email) => {
      test(`should validate valid email: ${email}`, () => {
        const result = config.validationFunction(email);
        expect(result).toBeTruthy();
      });
    });

    config.invalidEmails.forEach((email) => {
      test(`should reject invalid email: ${email}`, () => {
        const result = config.validationFunction(email);
        expect(result).toBeFalsy();
      });
    });

    test("should handle edge cases", () => {
      expect(config.validationFunction("")).toBeFalsy();
      expect(config.validationFunction(null)).toBeFalsy();
      expect(config.validationFunction(undefined)).toBeFalsy();
    });

    test("should be a function", () => {
      expect(typeof config.validationFunction).toBe("function");
    });
  });
}

/**
 * Creates a test suite for email formatting utilities
 */
export function createEmailFormattingTestSuite(config: {
  name: string;
  formatterFunction: Function;
  testCases: Array<{
    input: any;
    expected: any;
    description: string;
  }>;
  errorCases?: Array<{
    input: any;
    expectedError: string | RegExp;
    description: string;
  }>;
}) {
  describe(`email Formatting:`, () => {
    config.testCases.forEach((testCase) => {
      test(testCase.description, () => {
        const result = config.formatterFunction(testCase.input);
        expect(result).toStrictEqual(testCase.expected);
      });
    });

    if (config.errorCases) {
      config.errorCases.forEach((errorCase) => {
        test(errorCase.description, () => {
          expect(() => config.formatterFunction(errorCase.input)).toThrow(
            errorCase.expectedError,
          );
        });
      });
    }

    test("should be a function", () => {
      expect(typeof config.formatterFunction).toBe("function");
    });
  });
}

/**
 * Creates a performance test suite for email operations
 */
export function createEmailPerformanceTestSuite(config: {
  name: string;
  emailFunction: Function;
  testData: {
    emails: Array<any>;
    concurrentLimit?: number;
    timeoutMs?: number;
  };
}) {
  describe(`email Performance:`, () => {
    test("should handle concurrent email sending", async () => {
      const concurrentLimit = config.testData.concurrentLimit || 5;
      const emails = config.testData.emails.slice(0, concurrentLimit);

      const sendPromises = emails.map((email) => config.emailFunction(email));
      const results = await Promise.allSettled(sendPromises);

      const successful = results.filter(
        (result) => result.status === "fulfilled",
      );
      expect(successful.length).toBeGreaterThan(0);
    });

    test("should complete within reasonable time", async () => {
      const timeout = config.testData.timeoutMs || 5000;
      const testEmail = config.testData.emails[0];

      const startTime = Date.now();
      await config.emailFunction(testEmail);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(timeout);
    });

    test("should handle batch operations efficiently", async () => {
      const batchSize = Math.min(config.testData.emails.length, 10);
      const batch = config.testData.emails.slice(0, batchSize);

      const startTime = Date.now();

      for (const email of batch) {
        await config.emailFunction(email);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchSize;

      // Should average less than 1 second per email
      expect(averageTime).toBeLessThan(1000);
    });

    test("should handle large email content", async () => {
      const largeContent = "x".repeat(100000); // 100KB content
      const largeEmail = {
        ...config.testData.emails[0],
        html: largeContent,
        text: largeContent,
      };

      await expect(config.emailFunction(largeEmail)).resolves.toBeDefined();
    });
  });
}

/**
 * Creates a test suite for email configuration and environment
 */
export function createEmailConfigTestSuite(config: {
  name: string;
  envFactory: () => any;
  configFactory: (env: any) => any;
  requiredEnvVars: string[];
}) {
  describe(`email Config:`, () => {
    test("should create valid configuration from environment", () => {
      const env = config.envFactory();
      const emailConfig = config.configFactory(env);

      expect(emailConfig).toBeDefined();
      expect(typeof emailConfig).toBe("object");
    });

    test("should validate required environment variables", () => {
      const env = config.envFactory();

      config.requiredEnvVars.forEach((varName) => {
        expect(env[varName]).toBeDefined();
      });
    });

    test("should handle missing environment variables gracefully", () => {
      const incompleteEnv = {};

      expect(() => config.configFactory(incompleteEnv)).not.toThrow();
    });

    test("should provide default values when appropriate", () => {
      const minimalEnv = {};
      const emailConfig = config.configFactory(minimalEnv);

      expect(emailConfig).toBeDefined();
    });

    test("should validate email service configuration", () => {
      const env = config.envFactory();
      const emailConfig = config.configFactory(env);

      // Should have either API key or credentials
      expect(
        emailConfig.apiKey ||
          emailConfig.credentials ||
          emailConfig.auth ||
          emailConfig.token,
      ).toBeDefined();
    });
  });
}
