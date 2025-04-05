import { vi } from "vitest";

// Simple mock for the keys module
vi.mock("../keys", () => ({
  keys: vi.fn().mockImplementation(() => ({
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
    NEXT_PUBLIC_POSTHOG_HOST: "https://test.posthog.com",
    NEXT_PUBLIC_POSTHOG_KEY: "phc_test_key",
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: "vercel-test-id",
  })),
}));
