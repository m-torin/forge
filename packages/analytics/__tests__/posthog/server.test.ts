import { PostHog } from "posthog-node";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock posthog-node
vi.mock("posthog-node", () => {
  return {
    PostHog: vi.fn().mockImplementation((key, options) => {
      return {
        identify: vi.fn(),
        capture: vi.fn(),
        key,
        options,
      };
    }),
  };
});

// Mock keys
vi.mock("../../keys", () => ({
  keys: vi.fn().mockReturnValue({
    NEXT_PUBLIC_POSTHOG_HOST: "https://test.posthog.com",
    NEXT_PUBLIC_POSTHOG_KEY: "phc_test123",
  }),
}));

// Mock server-only
vi.mock("server-only", () => ({}));

describe("PostHog Server Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes PostHog with correct configuration", async () => {
    // Import the module to trigger initialization
    const { analytics } = await import("../../posthog/server");

    // Check that PostHog constructor was called with correct arguments
    expect(PostHog).toHaveBeenCalledTimes(1);
    expect(PostHog).toHaveBeenCalledWith("phc_test123", {
      flushAt: 1,
      flushInterval: 0,
      host: "https://test.posthog.com",
    });
  });

  it("exports the analytics instance", async () => {
    const { analytics } = await import("../../posthog/server");

    // Check that analytics is defined
    expect(analytics).toBeDefined();

    // Check that it has the expected methods
    expect(analytics.capture).toBeDefined();
    expect(analytics.identify).toBeDefined();
  });
});
