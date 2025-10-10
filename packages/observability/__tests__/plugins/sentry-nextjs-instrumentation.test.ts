/**
 * Tests for Next.js Sentry instrumentation utilities
 */

import { describe, expect } from "vitest";
import type { InstrumentationConfig } from "../../src/plugins/sentry-nextjs/instrumentation";
import {
  createClientInstrumentation,
  createEdgeInstrumentation,
  createInstrumentation,
  createServerInstrumentation,
} from "../../src/plugins/sentry-nextjs/instrumentation";

describe.todo("next.js Sentry Instrumentation Utilities", () => {
  describe.todo("createInstrumentation", () => {
    test("should generate basic instrumentation content", () => {
      const result = createInstrumentation();

      expect(result).toContain("export async function register()");
      expect(result).toContain("export async function onRequestError(");
      expect(result).toContain("@repo/observability/server/next");
      expect(result).toContain("@repo/observability/server/edge");
      expect(result).toContain("process.env.NODE_ENV === 'production'");
    });

    test("should handle production-only configuration", () => {
      const config: InstrumentationConfig = {
        productionOnly: true,
        includePreview: false,
      };

      const result = createInstrumentation(config);

      expect(result).toContain("process.env.NODE_ENV === 'production'");
      expect(result).not.toContain("process.env.VERCEL_ENV === 'preview'");
    });

    test("should include preview environments when configured", () => {
      const config: InstrumentationConfig = {
        productionOnly: true,
        includePreview: true,
      };

      const result = createInstrumentation(config);

      expect(result).toContain(
        "process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview'",
      );
    });

    test("should include custom initialization code", () => {
      const customCode = 'console.log("Custom init");';
      const config: InstrumentationConfig = {
        customInitCode: customCode,
      };

      const result = createInstrumentation(config);

      expect(result).toContain("// Custom initialization code");
      expect(result).toContain(customCode);
    });

    test("should include custom error handler", () => {
      const customHandler = 'console.error("Custom error handler");';
      const config: InstrumentationConfig = {
        customErrorHandler: customHandler,
      };

      const result = createInstrumentation(config);

      expect(result).toContain("// Custom error handler");
      expect(result).toContain(customHandler);
    });

    test("should include verbose logging when enabled", () => {
      const config: InstrumentationConfig = {
        verbose: true,
      };

      const result = createInstrumentation(config);

      expect(result).toContain(
        "console.log('[Observability] Initializing for Node.js runtime')",
      );
      expect(result).toContain(
        "console.log('[Observability] Initializing for Edge runtime')",
      );
      expect(result).toContain(
        "console.log('[Observability] Skipping initialization in development')",
      );
      expect(result).toContain(
        "console.error('[Observability] Error in development:', error)",
      );
    });

    test("should handle non-production environments", () => {
      const config: InstrumentationConfig = {
        productionOnly: false,
      };

      const result = createInstrumentation(config);

      expect(result).toContain("if (true)");
    });
  });

  describe.todo("createClientInstrumentation", () => {
    test("should generate client-side instrumentation", () => {
      const result = createClientInstrumentation();

      expect(result).toContain("import * as Sentry from '@sentry/nextjs'");
      expect(result).toContain(
        "import { env } from '@repo/observability/plugins/sentry-nextjs/env'",
      );
      expect(result).toContain("Sentry.init({");
      expect(result).toContain("dsn: env.NEXT_PUBLIC_SENTRY_DSN");
      expect(result).toContain("Sentry.browserTracingIntegration()");
      expect(result).toContain("Sentry.replayIntegration()");
      expect(result).toContain("Sentry.feedbackIntegration(");
      expect(result).toContain(
        "export const onRouterTransitionStart = Sentry.captureRouterTransitionStart",
      );
    });

    test("should use environment variables for configuration", () => {
      const result = createClientInstrumentation();

      expect(result).toContain(
        "tracesSampleRate: env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 1.0",
      );
      expect(result).toContain(
        "replaysSessionSampleRate: env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || 0.1",
      );
      expect(result).toContain(
        "replaysOnErrorSampleRate: env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1.0",
      );
      expect(result).toContain(
        "enableLogs: env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS ?? true",
      );
    });

    test("should include custom initialization code", () => {
      const customCode = "debug: true,";
      const config: InstrumentationConfig = {
        customInitCode: customCode,
      };

      const result = createClientInstrumentation(config);

      expect(result).toContain("// Custom configuration");
      expect(result).toContain(customCode);
    });

    test("should include verbose logging when enabled", () => {
      const config: InstrumentationConfig = {
        verbose: true,
      };

      const result = createClientInstrumentation(config);

      expect(result).toContain(
        "console.log('[Observability] Client-side Sentry initialized')",
      );
    });
  });

  describe.todo("createServerInstrumentation", () => {
    test("should generate server-side instrumentation", () => {
      const result = createServerInstrumentation();

      expect(result).toContain("import * as Sentry from '@sentry/nextjs'");
      expect(result).toContain(
        "import { env } from '@repo/observability/plugins/sentry-nextjs/env'",
      );
      expect(result).toContain("Sentry.init({");
      expect(result).toContain(
        "dsn: env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN",
      );
      expect(result).toContain(
        "sendDefaultPii: env.SENTRY_SEND_DEFAULT_PII ?? true",
      );
    });

    test("should use environment variables for server configuration", () => {
      const result = createServerInstrumentation();

      expect(result).toContain(
        "environment: env.SENTRY_ENVIRONMENT || process.env.NODE_ENV",
      );
      expect(result).toContain("release: env.SENTRY_RELEASE");
      expect(result).toContain(
        "tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE || 1.0",
      );
      expect(result).toContain(
        "profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE || 0",
      );
      expect(result).toContain("enableLogs: env.SENTRY_ENABLE_LOGS ?? true");
    });

    test("should include custom initialization code", () => {
      const customCode = "beforeSend: (event) => event,";
      const config: InstrumentationConfig = {
        customInitCode: customCode,
      };

      const result = createServerInstrumentation(config);

      expect(result).toContain("// Custom configuration");
      expect(result).toContain(customCode);
    });

    test("should include verbose logging when enabled", () => {
      const config: InstrumentationConfig = {
        verbose: true,
      };

      const result = createServerInstrumentation(config);

      expect(result).toContain(
        "console.log('[Observability] Server-side Sentry initialized')",
      );
    });
  });

  describe.todo("createEdgeInstrumentation", () => {
    test("should generate edge runtime instrumentation", () => {
      const result = createEdgeInstrumentation();

      expect(result).toContain("import * as Sentry from '@sentry/nextjs'");
      expect(result).toContain(
        "import { env } from '@repo/observability/plugins/sentry-nextjs/env'",
      );
      expect(result).toContain("Sentry.init({");
      expect(result).toContain(
        "dsn: env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN",
      );
      expect(result).toContain("// Edge-specific configuration");
      expect(result).toContain(
        "// Note: Some features may be limited in edge runtime",
      );
    });

    test("should use environment variables for edge configuration", () => {
      const result = createEdgeInstrumentation();

      expect(result).toContain(
        "environment: env.SENTRY_ENVIRONMENT || env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV",
      );
      expect(result).toContain("release: env.SENTRY_RELEASE");
      expect(result).toContain(
        "tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE || 1.0",
      );
    });

    test("should include custom initialization code", () => {
      const customCode = "maxBreadcrumbs: 50,";
      const config: InstrumentationConfig = {
        customInitCode: customCode,
      };

      const result = createEdgeInstrumentation(config);

      expect(result).toContain("// Custom configuration");
      expect(result).toContain(customCode);
    });

    test("should include verbose logging when enabled", () => {
      const config: InstrumentationConfig = {
        verbose: true,
      };

      const result = createEdgeInstrumentation(config);

      expect(result).toContain(
        "console.log('[Observability] Edge runtime Sentry initialized')",
      );
    });
  });

  describe.todo("template Generation", () => {
    test("should generate valid JavaScript syntax", () => {
      const configs = [
        { name: "main", content: createInstrumentation() },
        { name: "client", content: createClientInstrumentation() },
        { name: "server", content: createServerInstrumentation() },
        { name: "edge", content: createEdgeInstrumentation() },
      ];

      configs.forEach(({ name, content }) => {
        // Check for basic JavaScript validity markers
        expect(content).toContain("import");
        expect(content).not.toContain("undefined"); // Should not have undefined variables

        // Check for proper syntax based on type
        if (name === "main") {
          // Main instrumentation has export async function register and onRequestError
          expect(content).toContain("export async function register");
          expect(content).toContain("export async function onRequestError");
        } else if (name === "client") {
          // Client instrumentation has Sentry.init and export
          expect(content).toContain("import * as Sentry from '@sentry/nextjs'");
          expect(content).toContain("Sentry.init");
          expect(content).toContain("export const onRouterTransitionStart");
        } else {
          // Server and edge types have imports and Sentry.init calls but no exports
          expect(content).toContain("import * as Sentry from '@sentry/nextjs'");
          expect(content).toContain("Sentry.init");
        }

        // Check for proper object syntax in Sentry.init calls
        if (content.includes("Sentry.init")) {
          expect(content).toMatch(/Sentry\.init\s*\(\s*\{/);
        }
      });
    });

    test("should properly handle template interpolation", () => {
      const config: InstrumentationConfig = {
        customInitCode: "debug: true",
        verbose: true,
      };

      const result = createClientInstrumentation(config);

      // Should not contain template literal syntax in output
      expect(result).not.toContain("${");
      expect(result).not.toContain("`");

      // Should contain the interpolated values
      expect(result).toContain("debug: true");
      expect(result).toContain(
        "console.log('[Observability] Client-side Sentry initialized')",
      );
    });
  });
});
