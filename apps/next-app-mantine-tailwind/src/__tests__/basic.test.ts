import { describe, expect, it } from "vitest";

describe.skip("Basic test", () => {
  it("should pass a simple test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle promises", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
