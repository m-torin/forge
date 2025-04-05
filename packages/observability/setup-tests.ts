import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";

// Mock environment variables
process.env.BETTERSTACK_API_KEY = "test-betterstack-api-key";
process.env.BETTERSTACK_URL = "https://test-betterstack-url.com";
process.env.SENTRY_ORG = "test-sentry-org";
process.env.SENTRY_PROJECT = "test-sentry-project";
process.env.NEXT_PUBLIC_SENTRY_DSN =
  "https://test-sentry-dsn.ingest.sentry.io/test";
process.env.NODE_ENV = "test";
process.env.NEXT_RUNTIME = "nodejs";

// Mock @sentry/nextjs
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({}),
  withSentryConfig: vi.fn().mockImplementation((config) => config),
}));

// Mock @logtail/next
vi.mock("@logtail/next", () => ({
  log: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  withLogtail: vi.fn().mockImplementation((config) => config),
}));

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(
      ({
        client,
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        client: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        Object.keys(client).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    ),
}));

// Mock fetch for BetterStack API
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes("betterstack.com")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "test-monitor-1",
              type: "monitor",
              attributes: {
                url: "https://test-site-1.com",
                status: "up",
              },
            },
            {
              id: "test-monitor-2",
              type: "monitor",
              attributes: {
                url: "https://test-site-2.com",
                status: "up",
              },
            },
          ],
          pagination: {
            first: "https://api.betterstack.com/v2/monitors?page=1",
            last: "https://api.betterstack.com/v2/monitors?page=1",
          },
        }),
      ok: true,
    });
  }
  return Promise.reject(new Error("Not found"));
});

// Mock console
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();
console.log = vi.fn();
