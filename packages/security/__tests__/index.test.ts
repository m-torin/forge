import arcjet, { detectBot, request, shield } from "@arcjet/next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { secure } from "../index";
import { keys } from "../keys";

// Import the mocked modules
vi.mock("@arcjet/next");
vi.mock("../keys", () => ({
  keys: vi.fn().mockReturnValue({
    ARCJET_KEY: "ajkey_test_arcjet_key",
  }),
}));

describe("Security Module", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Re-mock keys for tests that need specific returns
    (keys as any).mockReturnValue({
      ARCJET_KEY: "ajkey_test_arcjet_key",
    });

    // Mock arcjet to return a specific instance
    (arcjet as any).mockReturnValue({
      withRule: vi.fn().mockReturnValue({
        protect: vi.fn().mockResolvedValue({
          isDenied: vi.fn().mockReturnValue(false),
          reason: {
            isBot: vi.fn().mockReturnValue(false),
            isRateLimit: vi.fn().mockReturnValue(false),
          },
        }),
      }),
    });

    // Mock shield to return a rule object
    (shield as any).mockReturnValue({ ruleType: "shield" });

    // Mock request to return a Request object
    (request as any).mockResolvedValue(new Request("https://example.com"));
  });

  it("initializes arcjet with the correct parameters", async () => {
    await secure(["googlebot" as any]);

    expect(arcjet).toHaveBeenCalledWith({
      characteristics: ["ip.src"],
      key: "ajkey_test_arcjet_key",
      rules: [
        expect.any(Object), // shield rule
      ],
    });
  });

  it("adds shield rule with LIVE mode", async () => {
    await secure(["googlebot" as any]);

    expect(shield).toHaveBeenCalledWith({
      mode: "LIVE",
    });
  });

  it("adds detectBot rule with allowed bots", async () => {
    await secure(["googlebot" as any, "search" as any]);

    expect(detectBot).toHaveBeenCalledWith({
      allow: ["googlebot", "search"],
      mode: "LIVE",
    });
  });

  it("uses the provided request if available", async () => {
    const customRequest = new Request("https://custom-example.com");

    await secure(["googlebot" as any], customRequest);

    // Should not call the request function
    expect(request).not.toHaveBeenCalled();

    // Should use the custom request
    const arcjetInstance = (arcjet as any).mock.results[0].value;
    const withRuleInstance = arcjetInstance.withRule.mock.results[0].value;

    expect(withRuleInstance.protect).toHaveBeenCalledWith(customRequest);
  });

  it("fetches a request if not provided", async () => {
    await secure(["googlebot" as any]);

    // Should call the request function
    expect(request).toHaveBeenCalled();

    // Should use the fetched request
    const arcjetInstance = (arcjet as any).mock.results[0].value;
    const withRuleInstance = arcjetInstance.withRule.mock.results[0].value;
    const fetchedRequest = await (request as any).mock.results[0].value;

    expect(withRuleInstance.protect).toHaveBeenCalledWith(fetchedRequest);
  });

  it.skip("does nothing if ARCJET_KEY is not available", async () => {
    // Create a special mock for this test
    vi.resetAllMocks();

    // Create a spy on the secure function to see if it returns early
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock keys to return undefined ARCJET_KEY
    (keys as any).mockReturnValue({
      ARCJET_KEY: undefined,
    });

    // We need to also mock request to verify it's not called
    (request as any).mockResolvedValue(new Request("https://example.com"));

    // Now call the secure function - it should return early and not throw
    await secure(["googlebot" as any]);

    // Since the secure function returns early when arcjetKey is undefined,
    // these expectations should pass when the function works correctly
    expect(arcjet).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();

    // Clean up
    spy.mockRestore();
  });

  it("throws an error if bot is detected", async () => {
    // Mock arcjet to return a denied decision for bot
    (arcjet as any).mockReturnValue({
      withRule: vi.fn().mockReturnValue({
        protect: vi.fn().mockResolvedValue({
          isDenied: vi.fn().mockReturnValue(true),
          reason: {
            isBot: vi.fn().mockReturnValue(true),
            isRateLimit: vi.fn().mockReturnValue(false),
          },
        }),
      }),
    });

    await expect(secure(["googlebot" as any])).rejects.toThrow(
      "No bots allowed",
    );
  });

  it("throws an error if rate limit is exceeded", async () => {
    // Mock arcjet to return a denied decision for rate limit
    (arcjet as any).mockReturnValue({
      withRule: vi.fn().mockReturnValue({
        protect: vi.fn().mockResolvedValue({
          isDenied: vi.fn().mockReturnValue(true),
          reason: {
            isBot: vi.fn().mockReturnValue(false),
            isRateLimit: vi.fn().mockReturnValue(true),
          },
        }),
      }),
    });

    await expect(secure(["googlebot" as any])).rejects.toThrow(
      "Rate limit exceeded",
    );
  });

  it("throws a generic error for other denial reasons", async () => {
    // Mock arcjet to return a denied decision for other reasons
    (arcjet as any).mockReturnValue({
      withRule: vi.fn().mockReturnValue({
        protect: vi.fn().mockResolvedValue({
          isDenied: vi.fn().mockReturnValue(true),
          reason: {
            isBot: vi.fn().mockReturnValue(false),
            isRateLimit: vi.fn().mockReturnValue(false),
          },
        }),
      }),
    });

    await expect(secure(["googlebot" as any])).rejects.toThrow("Access denied");
  });

  it("logs a warning when access is denied", async () => {
    // Mock console.warn
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // Mock arcjet to return a denied decision
    (arcjet as any).mockReturnValue({
      withRule: vi.fn().mockReturnValue({
        protect: vi.fn().mockResolvedValue({
          isDenied: vi.fn().mockReturnValue(true),
          reason: {
            isBot: vi.fn().mockReturnValue(false),
            isRateLimit: vi.fn().mockReturnValue(false),
          },
        }),
      }),
    });

    try {
      await secure(["googlebot" as any]);
    } catch (error) {
      // Ignore the error
    }

    // Should log a warning
    expect(consoleWarnSpy).toHaveBeenCalled();

    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });
});
