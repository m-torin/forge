import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

describe("Environment Keys", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("handles NEXT_PUBLIC_POSTHOG_KEY", () => {
    // Set the environment variable
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key_custom";

    // Call the keys function
    const result = keys();

    // Check that the environment variable is returned
    expect(result.NEXT_PUBLIC_POSTHOG_KEY).toBe("phc_test_key_custom");
  });

  it("handles missing NEXT_PUBLIC_POSTHOG_KEY", () => {
    // Delete the environment variable
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    // Call the keys function
    const result = keys();

    // Check default value from our mock
    expect(result.NEXT_PUBLIC_POSTHOG_KEY).toBe("phc_test_key");
  });

  it("handles NEXT_PUBLIC_POSTHOG_HOST", () => {
    // Set the environment variable
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://custom.posthog.com";

    // Call the keys function
    const result = keys();

    // Check that the environment variable is returned
    expect(result.NEXT_PUBLIC_POSTHOG_HOST).toBe("https://custom.posthog.com");
  });

  it("handles missing NEXT_PUBLIC_POSTHOG_HOST", () => {
    // Delete the environment variable
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;

    // Call the keys function
    const result = keys();

    // Check default value from our mock
    expect(result.NEXT_PUBLIC_POSTHOG_HOST).toBe("https://test.posthog.com");
  });

  it("handles NEXT_PUBLIC_GA_MEASUREMENT_ID", () => {
    // Set the environment variable
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-CUSTOM123";

    // Call the keys function
    const result = keys();

    // Check that the environment variable is returned
    expect(result.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("G-CUSTOM123");
  });

  it("handles missing NEXT_PUBLIC_GA_MEASUREMENT_ID", () => {
    // Delete the environment variable
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    // Call the keys function
    const result = keys();

    // Check default value from our mock
    expect(result.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("G-TEST123");
  });
});
