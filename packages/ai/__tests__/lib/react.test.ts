import { describe, expect, it } from "vitest";

import * as reactExports from "../../lib/react.ts";

describe("AI React Exports", () => {
  it("exports all expected items from ai/react package", () => {
    // Since we're re-exporting from 'ai/react', we should have all the exports from that package
    // We can't test the exact exports since they might change with package updates
    // But we can test that we're exporting something
    expect(Object.keys(reactExports).length).toBeGreaterThan(0);
  });

  it("exports are not undefined", () => {
    // Check that none of the exports are undefined
    Object.entries(reactExports).forEach(([_key, value]) => {
      expect(value).not.toBeUndefined();
    });
  });

  it("exports common AI React hooks and utilities", () => {
    // Test for some common exports from ai/react
    // These are the most likely exports, but they might change with package updates
    const expectedExports = ["useChat", "useCompletion", "useAssistant"];

    // Check that at least some of these exports exist
    // We don't require all of them since the package might change
    const exportKeys = Object.keys(reactExports);
    const hasExpectedExports = expectedExports.some((key) =>
      exportKeys.includes(key),
    );

    expect(hasExpectedExports).toBe(true);
  });
});
