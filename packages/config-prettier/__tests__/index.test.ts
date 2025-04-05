import { describe, expect, it } from "vitest";
import prettierConfig from "../index.ts";

describe("Prettier Configuration", () => {
  it("exports a valid Prettier configuration object", () => {
    expect(prettierConfig).toBeDefined();
    expect(typeof prettierConfig).toBe("object");
  });

  it("includes plugins", () => {
    expect(prettierConfig.plugins).toBeDefined();
    expect(Array.isArray(prettierConfig.plugins)).toBe(true);
    expect(prettierConfig.plugins.length).toBeGreaterThan(0);
  });

  it("includes global defaults", () => {
    expect(prettierConfig.bracketSpacing).toBe(true);
    expect(prettierConfig.printWidth).toBe(80);
    expect(prettierConfig.semi).toBe(true);
    expect(prettierConfig.singleQuote).toBe(true);
    expect(prettierConfig.tabWidth).toBe(2);
  });

  it("includes overrides for different file types", () => {
    expect(prettierConfig.overrides).toBeDefined();
    expect(Array.isArray(prettierConfig.overrides)).toBe(true);
    expect(prettierConfig.overrides.length).toBeGreaterThan(0);
  });

  it("includes TypeScript/JavaScript configuration", () => {
    const tsJsConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".ts")),
    );

    expect(tsJsConfig).toBeDefined();
    expect(tsJsConfig.options.arrowParens).toBe("always");
    expect(tsJsConfig.options.bracketSameLine).toBe(false);
    expect(tsJsConfig.options.singleQuote).toBe(true);
    expect(tsJsConfig.options.trailingComma).toBe("all");
  });

  it("includes package.json configuration with wider print width", () => {
    const packageJsonConfig = prettierConfig.overrides.find(
      (override) => override.files === "package*.json",
    );

    expect(packageJsonConfig).toBeDefined();
    expect(packageJsonConfig.options.printWidth).toBe(1000);
  });

  it("includes YAML configuration", () => {
    const yamlConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".yml")),
    );

    expect(yamlConfig).toBeDefined();
    expect(yamlConfig.options.singleQuote).toBe(false);
    expect(yamlConfig.options.trailingComma).toBe("none");
  });

  it("includes PHP configuration", () => {
    const phpConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".php")),
    );

    expect(phpConfig).toBeDefined();
    expect(phpConfig.options.braceStyle).toBe("1tbs");
    expect(phpConfig.options.phpVersion).toBe("8.2");
    expect(phpConfig.options.singleQuote).toBe(true);
  });

  it("includes Markdown configuration", () => {
    const markdownConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".md")),
    );

    expect(markdownConfig).toBeDefined();
    expect(markdownConfig.options.embeddedLanguageFormatting).toBe("auto");
    expect(markdownConfig.options.proseWrap).toBe("always");
  });

  it("includes GraphQL configuration", () => {
    const graphqlConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".graphql")),
    );

    expect(graphqlConfig).toBeDefined();
    expect(graphqlConfig.options.bracketSpacing).toBe(false);
  });

  it("includes CSS/SCSS configuration", () => {
    const cssConfig = prettierConfig.overrides.find(
      (override) =>
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".css")),
    );

    expect(cssConfig).toBeDefined();
    expect(cssConfig.options.singleQuote).toBe(false);
  });
});
