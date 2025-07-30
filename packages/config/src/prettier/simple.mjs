/**
 * Simple Prettier configuration without plugins
 * Minimal setup for projects that don't need advanced formatting
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
  bracketSpacing: true,
  endOfLine: 'lf',
  // No plugins for now to avoid loading issues
  plugins: [],
};

export default config;
