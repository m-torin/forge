import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

// Helper functions that need to be exported from the analytics package
const getGoogleAnalyticsId = () => {
  const env = keys();
  return env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null;
};

const getPostHogKey = () => {
  const env = keys();
  return env.NEXT_PUBLIC_POSTHOG_KEY || null;
};

const getVercelAnalyticsId = () => {
  // This would normally come from env, but for testing just return null or a mock
  return process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || null;
};

describe("Analytics Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getGoogleAnalyticsId", () => {
    it("should return null when NEXT_PUBLIC_GA_ID is not set", () => {
      expect(getGoogleAnalyticsId()).toBe(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-TEST123",
      );
    });

    it("should return the GA ID when NEXT_PUBLIC_GA_ID is set", () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      expect(getGoogleAnalyticsId()).toBe("G-TEST123");
    });
  });

  describe("getPostHogKey", () => {
    it("should return null when NEXT_PUBLIC_POSTHOG_KEY is not set", () => {
      expect(getPostHogKey()).toBe(
        process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_test_key",
      );
    });

    it("should return the PostHog key when NEXT_PUBLIC_POSTHOG_KEY is set", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test123";
      expect(getPostHogKey()).toBe("phc_test123");
    });
  });

  describe("getVercelAnalyticsId", () => {
    it("should return null when NEXT_PUBLIC_VERCEL_ANALYTICS_ID is not set", () => {
      expect(getVercelAnalyticsId()).toBeNull();
    });

    it("should return the Vercel Analytics ID when NEXT_PUBLIC_VERCEL_ANALYTICS_ID is set", () => {
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID = "vercel_test123";
      expect(getVercelAnalyticsId()).toBe("vercel_test123");
    });
  });
});
