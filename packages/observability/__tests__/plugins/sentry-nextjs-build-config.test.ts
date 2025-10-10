/**
 * Tests for Next.js Sentry build configuration utilities
 */

import { withSentryConfig } from "@sentry/nextjs";
import { beforeEach, describe, expect, vi } from "vitest";
import { withObservabilitySentry } from "../../src/plugins/sentry-nextjs/build-config";

// Mock @sentry/nextjs first
vi.mock("@sentry/nextjs", () => ({
  withSentryConfig: vi.fn(),
}));

const mockWithSentryConfig = vi.mocked(withSentryConfig);

// Mock environment variables
const mockEnv = {
  SENTRY_ORG: "test-org",
  SENTRY_PROJECT: "test-project",
  SENTRY_AUTH_TOKEN: "test-token",
  SENTRY_URL: "https://sentry.example.com",
  CI: "true",
};

vi.mock("../../src/plugins/sentry-nextjs/env", () => ({
  safeEnv: () => mockEnv,
}));

describe.todo("withObservabilitySentry", () => {
  const mockNextConfig = {
    experimental: {
      serverComponentsExternalPackages: ["some-package"],
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWithSentryConfig.mockImplementation((config: any, options?: any) => ({
      ...(config || {}),
      _sentryOptions: options,
    }));
  });

  describe("basic Configuration", () => {
    test("should wrap Next.js config with Sentry configuration", () => {
      const result = withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          org: "test-org",
          project: "test-project",
          authToken: "test-token",
          sentryUrl: "https://sentry.example.com",
        }),
      );
      expect(result).toHaveProperty("_sentryOptions");
    });

    test("should use default configuration when no options provided", () => {
      withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          silent: false, // CI is true in mock, so should be false
          debug: false,
          disableLogger: true,
          telemetry: true,
        }),
      );
    });

    test("should handle missing environment variables gracefully", () => {
      vi.mocked(
        require("../../src/plugins/sentry-nextjs/env").safeEnv,
      ).mockReturnValue({
        CI: undefined,
      });

      withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          org: undefined,
          project: undefined,
          authToken: undefined,
          sentryUrl: undefined,
          silent: true, // Should default to true when CI is not set
        }),
      );
    });
  });

  describe("custom Options", () => {
    test("should merge custom options with defaults", () => {
      const customOptions = {
        org: "custom-org",
        silent: false,
        debug: true,
        sourcemaps: {
          disable: false,
          assets: ["**/*.js", "**/*.js.map"],
        },
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          org: "custom-org", // Should override env
          project: "test-project", // Should keep env value
          silent: false, // Should override default
          debug: true, // Should override default
          sourcemaps: customOptions.sourcemaps,
        }),
      );
    });

    test("should handle release configuration", () => {
      const customOptions = {
        release: {
          name: "v1.0.0",
          create: true,
          finalize: true,
          dist: "build-123",
        },
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          release: customOptions.release,
        }),
      );
    });

    test("should handle tunneling configuration", () => {
      const customOptions = {
        tunnelRoute: "/monitoring",
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          tunnelRoute: "/monitoring",
        }),
      );
    });

    test("should handle automatic Vercel monitors", () => {
      const customOptions = {
        automaticVercelMonitors: true,
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          automaticVercelMonitors: true,
        }),
      );
    });
  });

  describe("source Maps Configuration", () => {
    test("should configure default source maps settings", () => {
      withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          sourcemaps: expect.objectContaining({
            disable: false,
            deleteSourcemapsAfterUpload: true,
          }),
        }),
      );
    });

    test("should allow custom source maps configuration", () => {
      const customOptions = {
        sourcemaps: {
          disable: false,
          assets: ["**/*.js"],
          ignore: ["**/node_modules/**"],
          deleteSourcemapsAfterUpload: false,
        },
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          sourcemaps: customOptions.sourcemaps,
        }),
      );
    });

    test("should disable source maps when requested", () => {
      const customOptions = {
        sourcemaps: {
          disable: true,
        },
      };

      withObservabilitySentry(mockNextConfig, customOptions);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          sourcemaps: {
            disable: true,
          },
        }),
      );
    });
  });

  describe("error Handling", () => {
    test("should provide custom error handler", () => {
      withObservabilitySentry(mockNextConfig);

      const call = mockWithSentryConfig.mock.calls[0];
      const options = call[1];

      expect(options).toHaveProperty("errorHandler");
      expect(typeof options?.errorHandler).toBe("function");
    });

    test("should handle build errors gracefully", () => {
      withObservabilitySentry(mockNextConfig);

      const call = mockWithSentryConfig.mock.calls[0];
      const options = call[1];
      const errorHandler = options?.errorHandler;

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockError = new Error("Build failed");

      // Should not throw
      expect(() => errorHandler?.(mockError)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "🚨 Sentry build step failed:",
        mockError.message,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("environment Detection", () => {
    test("should detect CI environment correctly", () => {
      vi.mocked(
        require("../../src/plugins/sentry-nextjs/env").safeEnv,
      ).mockReturnValue({
        ...mockEnv,
        CI: "true",
      });

      withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          silent: false, // Should be verbose in CI
        }),
      );
    });

    test("should handle non-CI environments", () => {
      vi.mocked(
        require("../../src/plugins/sentry-nextjs/env").safeEnv,
      ).mockReturnValue({
        ...mockEnv,
        CI: undefined,
      });

      withObservabilitySentry(mockNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        mockNextConfig,
        expect.objectContaining({
          silent: true, // Should be silent in local development
        }),
      );
    });
  });

  describe("integration with Next.js Config", () => {
    test("should preserve existing Next.js configuration", () => {
      const complexNextConfig = {
        experimental: {
          instrumentationHook: true,
          serverActions: { allowedOrigins: ["localhost"] },
        },
        env: {
          CUSTOM_KEY: "value",
        },
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [{ key: "X-Custom-Header", value: "test" }],
            },
          ];
        },
      };

      const result = withObservabilitySentry(complexNextConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        complexNextConfig,
        expect.any(Object),
      );

      // Verify the original config structure is preserved
      expect(result).toStrictEqual(expect.objectContaining(complexNextConfig));
    });

    test("should work with empty Next.js config", () => {
      const emptyConfig = {};

      withObservabilitySentry(emptyConfig);

      expect(mockWithSentryConfig).toHaveBeenCalledWith(
        emptyConfig,
        expect.any(Object),
      );
    });
  });
});
