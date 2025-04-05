import { init, replayIntegration } from "@sentry/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { initializeSentryClient } from "../client";
import { keys } from "../keys";

// Import the mocked modules
vi.mock("@sentry/nextjs", () => ({
  init: vi.fn().mockReturnValue({}),
  replayIntegration: vi.fn(),
}));

vi.mock("../keys");

describe("Sentry Client", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock keys to return test values
    (keys as any).mockReturnValue({
      NEXT_PUBLIC_SENTRY_DSN: "https://test-sentry-dsn.ingest.sentry.io/test",
    });

    // Mock replayIntegration to return a mock integration
    (replayIntegration as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      name: "replay",
      setup: vi.fn(),
    });
  });

  it.skip("initializes Sentry with the correct configuration", () => {
    initializeSentryClient();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: expect.any(String),
        integrations: expect.any(Array),
        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: 0.1,
        tracesSampleRate: 1,
      }),
    );
  });

  it.skip("configures replay integration with maskAllText and blockAllMedia", () => {
    initializeSentryClient();

    expect(replayIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        blockAllMedia: true,
        maskAllText: true,
      }),
    );
  });

  it.skip("uses the DSN from environment variables", () => {
    // Set a mock DSN
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://test@sentry.io/1234";

    initializeSentryClient();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://test@sentry.io/1234",
      }),
    );
  });

  it.skip("handles missing DSN gracefully", () => {
    // Clear DSN
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    initializeSentryClient();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: undefined,
      }),
    );
  });

  it.skip("returns the result of init", () => {
    // Mock init to return a specific value
    (init as unknown as ReturnType<typeof vi.fn>).mockReturnValue("test-value");

    const result = initializeSentryClient();

    expect(result).toBe("test-value");
  });
});
