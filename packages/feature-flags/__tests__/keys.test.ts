import { describe, expect, it, vi, beforeEach, afterAll } from "vitest";
import { keys } from "../keys";

describe("Feature Flags Keys", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns the correct values when environment variables are set", () => {
    process.env.FLAGS_SECRET = "test-flags-secret";

    const result = keys();

    expect(result.FLAGS_SECRET).toBe("test-flags-secret");
  });

  it("returns undefined when FLAGS_SECRET is not set", () => {
    delete process.env.FLAGS_SECRET;

    const result = keys();

    expect(result.FLAGS_SECRET).toBeUndefined();
  });

  it("validates that FLAGS_SECRET is not empty when provided", () => {
    // Valid secret should work
    process.env.FLAGS_SECRET = "test-flags-secret";
    expect(() => keys()).not.toThrow();

    // Empty secret should throw
    process.env.FLAGS_SECRET = "";
    expect(() => keys()).toThrow();
  });

  it("allows FLAGS_SECRET to be optional", () => {
    // Undefined secret should not throw
    delete process.env.FLAGS_SECRET;
    expect(() => keys()).not.toThrow();
  });
});
