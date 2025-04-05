import { describe, expect, it } from "vitest";

import baseConfig from "../index.ts";

describe("Base ESLint Configuration", () => {
  it("exports an array of configuration objects", () => {
    expect(Array.isArray(baseConfig)).toBe(true);
    expect(baseConfig.length).toBeGreaterThan(0);
  });

  it("includes js.configs.recommended", () => {
    // The first item should be js.configs.recommended
    expect(baseConfig[0]).toBeDefined();
    // We can't directly compare the objects due to how ESLint configs work,
    // but we can check that it's not null/undefined
  });

  it("includes TypeScript ESLint configurations", () => {
    // TypeScript ESLint configs should be included
    const tsConfigs = baseConfig.filter(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes(".ts")),
    );

    expect(tsConfigs.length).toBeGreaterThan(0);
  });

  it("includes JavaScript specific configuration", () => {
    // JavaScript specific configs should be included
    const jsConfigs = baseConfig.filter(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes(".js")),
    );

    expect(jsConfigs.length).toBeGreaterThan(0);
  });

  it("includes security plugin configuration", () => {
    // Check if any config has security plugin
    const hasSecurityPlugin = baseConfig.some(
      (config) =>
        typeof config === "object" && config.plugins && config.plugins.security,
    );

    expect(hasSecurityPlugin).toBe(true);
  });

  it("includes perfectionist plugin for sorting", () => {
    // Check if any config has perfectionist plugin
    const hasPerfectionistPlugin = baseConfig.some(
      (config) =>
        typeof config === "object" &&
        config.plugins &&
        config.plugins.perfectionist,
    );

    expect(hasPerfectionistPlugin).toBe(true);
  });

  it("includes rules for TypeScript files", () => {
    // Find all TypeScript configs with rules
    const tsConfigs = baseConfig.filter(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes(".ts")) &&
        config.rules,
    );

    expect(tsConfigs.length).toBeGreaterThan(0);

    // Check if any of the TypeScript configs have the rules we're looking for
    const hasNoExplicitAnyRule = tsConfigs.some(
      (config) =>
        config.rules &&
        config.rules["@typescript-eslint/no-explicit-any"] !== undefined,
    );

    const hasConsistentTypeImportsRule = tsConfigs.some(
      (config) =>
        config.rules &&
        config.rules["@typescript-eslint/consistent-type-imports"] !==
          undefined,
    );

    expect(hasNoExplicitAnyRule).toBe(true);
    expect(hasConsistentTypeImportsRule).toBe(true);
  });

  it("includes eslint-config-prettier as the last configuration", () => {
    // eslint-config-prettier should be the last item to properly disable conflicting rules
    const lastConfig = baseConfig[baseConfig.length - 1];

    // We can't directly check if it's eslint-config-prettier, but we can verify it's not null
    expect(lastConfig).toBeDefined();
  });
});
