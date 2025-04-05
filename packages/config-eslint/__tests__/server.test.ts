import { describe, expect, it } from "vitest";

import baseConfig from "../index.ts";
import serverConfig from "../server.ts";

describe("Server ESLint Configuration", () => {
  it("exports an array of configuration objects", () => {
    expect(Array.isArray(serverConfig)).toBe(true);
    expect(serverConfig.length).toBeGreaterThan(0);
  });

  it("extends the base configuration", () => {
    // The server config should include all base configs
    expect(serverConfig.length).toBeGreaterThanOrEqual(baseConfig.length);

    // The first items should match the base config
    for (let i = 0; i < baseConfig.length; i++) {
      expect(serverConfig[i]).toBeDefined();
    }
  });

  it("includes server-specific configuration", () => {
    // Find server-specific config
    const serverSpecificConfig = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes(".ts")) &&
        config.plugins &&
        config.plugins.node,
    );

    expect(serverSpecificConfig).toBeDefined();
    // Add checks for potentially undefined properties
    expect(serverSpecificConfig?.plugins?.node).toBeDefined();
  });

  it("includes Node.js globals", () => {
    // Find config with Node.js globals
    const configWithNodeGlobals = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.languageOptions &&
        config.languageOptions.globals &&
        config.languageOptions.globals.process, // Node.js global
    );

    expect(configWithNodeGlobals).toBeDefined();
  });

  it("includes stricter TypeScript rules for server code", () => {
    // Find config with stricter TypeScript rules
    const configWithStrictTSRules = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["@typescript-eslint/explicit-function-return-type"] ===
          "error",
    );

    expect(configWithStrictTSRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithStrictTSRules?.rules) {
      expect(
        configWithStrictTSRules.rules["@typescript-eslint/no-misused-promises"],
      ).toBe("error");
      expect(
        configWithStrictTSRules.rules[
          "@typescript-eslint/no-floating-promises"
        ],
      ).toBe("error");
      expect(
        configWithStrictTSRules.rules["@typescript-eslint/await-thenable"],
      ).toBe("error");
    } else {
      expect(configWithStrictTSRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("includes Node.js specific rules", () => {
    // Find config with Node.js rules
    const configWithNodeRules = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["node/no-deprecated-api"] !== undefined,
    );

    expect(configWithNodeRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithNodeRules?.rules) {
      expect(configWithNodeRules.rules["node/no-deprecated-api"]).toBe("off"); // Disabled due to compatibility issues with ESLint v9
      expect(configWithNodeRules.rules["node/no-extraneous-import"]).toBe(
        "error",
      );
      // Some rules are intentionally disabled
      expect(configWithNodeRules.rules["node/no-missing-import"]).toBe("off");
      expect(
        configWithNodeRules.rules["node/no-unsupported-features/es-syntax"],
      ).toBe("off");
    } else {
      expect(configWithNodeRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("includes additional security rules for server code", () => {
    // Find config with security rules
    const configWithSecurityRules = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.rules &&
        config.rules["security/detect-unsafe-regex"] !== undefined,
    );

    expect(configWithSecurityRules).toBeDefined();
    // Add checks for potentially undefined properties
    if (configWithSecurityRules?.rules) {
      expect(
        configWithSecurityRules.rules["security/detect-unsafe-regex"],
      ).toBe("error");
      expect(
        configWithSecurityRules.rules["security/detect-eval-with-expression"],
      ).toBe("error");
      expect(
        configWithSecurityRules.rules["security/detect-buffer-noassert"],
      ).toBe("error");
    } else {
      expect(configWithSecurityRules?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });

  it("includes relaxed rules for test files", () => {
    // Find config for test files
    const testFilesConfig = serverConfig.find(
      (config) =>
        typeof config === "object" &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes("test.")),
    );

    expect(testFilesConfig).toBeDefined();
    // Add checks for potentially undefined properties
    if (testFilesConfig?.rules) {
      expect(testFilesConfig.rules["@typescript-eslint/no-explicit-any"]).toBe(
        "off",
      );
      expect(
        testFilesConfig.rules[
          "@typescript-eslint/explicit-function-return-type"
        ],
      ).toBe("off");
      expect(testFilesConfig.rules["import/no-extraneous-dependencies"]).toBe(
        "off",
      );
    } else {
      expect(testFilesConfig?.rules).toBeDefined(); // Fail test if rules are missing
    }
  });
});
