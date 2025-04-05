import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";
import React from "react";

// Mock environment variables
process.env.FLAGS_SECRET = "test-flags-secret";

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }: any) => {
    const env: Record<string, any> = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));

// Mock @repo/analytics
vi.mock("@repo/analytics/posthog/server", () => ({
  analytics: {
    isFeatureEnabled: vi.fn().mockImplementation((key, userId) => {
      // Mock feature flag behavior for testing
      if (
        key === "showBetaFeature" &&
        userId === "test-user-with-beta-access"
      ) {
        return true;
      }
      return false;
    }),
  },
}));

// Mock @repo/auth
vi.mock("@repo/auth/server", () => ({
  auth: vi.fn().mockImplementation(() => {
    return {
      userId: "test-user-id",
    };
  }),
}));

// Mock flags/next
vi.mock("flags/next", () => ({
  flag: vi.fn().mockImplementation((config) => {
    return {
      key: config.key,
      defaultValue: config.defaultValue,
      decide: config.decide,
      origin: "test",
      description: `Test flag for ${config.key}`,
      options: {},
    };
  }),
}));

// Mock flags
vi.mock("flags", () => ({
  verifyAccess: vi.fn().mockImplementation((authHeader) => {
    return authHeader === "Bearer test-flags-secret";
  }),
}));

// Mock @vercel/toolbar
vi.mock("@vercel/toolbar/next", () => ({
  VercelToolbar: () =>
    React.createElement("div", { "data-testid": "vercel-toolbar" }),
}));

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn().mockImplementation((data, options) => {
      return {
        data,
        options,
      };
    }),
  },
}));
