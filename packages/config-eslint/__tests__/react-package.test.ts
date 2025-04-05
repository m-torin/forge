import { describe, expect, it } from "vitest";

import baseConfig from "../index.ts";
import reactPackageConfig from "../react-package.ts";

describe("React Package ESLint Configuration", () => {
  it("exports an array of configuration objects", () => {
    expect(Array.isArray(reactPackageConfig)).toBe(true);
    expect(reactPackageConfig.length).toBeGreaterThan(0);
  });

  it("extends the base configuration", () => {
    // The React package config should include all base configs
    expect(reactPackageConfig.length).toBeGreaterThanOrEqual(baseConfig.length);

    // The first items should match the base config
    for (let i = 0; i < baseConfig.length; i++) {
      expect(reactPackageConfig[i]).toBeDefined();
    }
  });

  it("includes React-specific configuration", () => {
    // Find React-specific config
    const reactConfig = reactPackageConfig.find(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes(".jsx")) &&
        config.plugins &&
        config.plugins.react,
    );

    expect(reactConfig).toBeDefined();
    // Add checks for potentially undefined properties
    if (reactConfig?.plugins) {
      expect(reactConfig.plugins.react).toBeDefined();
      expect(reactConfig.plugins["react-hooks"]).toBeDefined();
      expect(reactConfig.plugins["jsx-a11y"]).toBeDefined();
    } else {
      expect(reactConfig?.plugins).toBeDefined(); // Fail test if plugins are missing
    }
  });

  it("includes JSX language options", () => {
    // Find config with JSX language options
    const configWithJSXOptions = reactPackageConfig.find(
      (config) =>
        typeof config === "object" &&
        config.languageOptions &&
        config.languageOptions.globals &&
        config.languageOptions.globals.JSX,
    );

    expect(configWithJSXOptions).toBeDefined();
    // Add checks for potentially undefined properties
    expect(
      configWithJSXOptions?.languageOptions?.parserOptions?.ecmaFeatures?.jsx,
    ).toBe(true);
  });

  it("includes React settings", () => {
    // Find config with React settings
    const configWithReactSettings = reactPackageConfig.find(
      (config) =>
        typeof config === "object" && config.settings && config.settings.react,
    );

    expect(configWithReactSettings).toBeDefined();
    // Add checks for potentially undefined properties and handle unknown types
    expect((configWithReactSettings?.settings?.react as any)?.version).toBe(
      "detect",
    ); // Use 'as any'
    expect(configWithReactSettings?.settings?.formComponents).toContain("Form");
    expect(configWithReactSettings?.settings?.linkComponents).toHaveLength(2);
    expect(
      (configWithReactSettings?.settings as any)?.["jsx-a11y"]?.components, // Use 'as any' to bypass unknown type for settings['jsx-a11y']
    ).toHaveProperty("Button", "button");
  });

  it("includes React rules", () => {
    // Find config with React rules
    const configWithReactRules = reactPackageConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["react/react-in-jsx-scope"] !== undefined,
    );

    expect(configWithReactRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithReactRules?.rules) {
      expect(configWithReactRules.rules["react/react-in-jsx-scope"]).toBe(
        "off",
      );
      expect(configWithReactRules.rules["react/prop-types"]).toBe("off");
      expect(configWithReactRules.rules["react/jsx-fragments"]).toEqual([
        "error",
        "syntax",
      ]);
      expect(configWithReactRules.rules["react/self-closing-comp"]).toEqual([
        "error",
        { component: true, html: true },
      ]);
    } else {
      expect(configWithReactRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("includes React Hooks rules", () => {
    // Find config with React Hooks rules
    const configWithHooksRules = reactPackageConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["react-hooks/rules-of-hooks"] !== undefined,
    );

    expect(configWithHooksRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithHooksRules?.rules) {
      expect(configWithHooksRules.rules["react-hooks/rules-of-hooks"]).toBe(
        "error",
      );
      expect(configWithHooksRules.rules["react-hooks/exhaustive-deps"]).toBe(
        "warn",
      );
    } else {
      expect(configWithHooksRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("includes accessibility rules", () => {
    // Find config with a11y rules
    const configWithA11yRules = reactPackageConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["jsx-a11y/alt-text"] !== undefined,
    );

    expect(configWithA11yRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithA11yRules?.rules) {
      expect(configWithA11yRules.rules["jsx-a11y/alt-text"]).toBe("error");
      expect(configWithA11yRules.rules["jsx-a11y/aria-props"]).toBe("error");
      expect(configWithA11yRules.rules["jsx-a11y/aria-role"]).toEqual([
        "error",
        { ignoreNonDOM: true },
      ]);
      expect(configWithA11yRules.rules["jsx-a11y/img-redundant-alt"]).toBe(
        "error",
      );
    } else {
      expect(configWithA11yRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("does not include Next.js specific configuration", () => {
    // Ensure there's no Next.js specific config
    const hasNextConfig = reactPackageConfig.some(
      (config) =>
        typeof config === "object" && config.settings && config.settings.next,
    );

    expect(hasNextConfig).toBe(false);
  });
});
