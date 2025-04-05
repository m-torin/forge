/**
 * Vitest Configuration Generators
 *
 * This file exports configuration generators for Vitest.
 */

// Base configuration generator
export function generateBaseConfig(options = {}) {
  return {
    test: {
      environment: "jsdom",
      include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
      exclude: ["node_modules", "dist", ".turbo"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
      },
      ...options,
    },
  };
}

// React configuration generator
export function generateReactConfig(options = {}) {
  return {
    ...generateBaseConfig({
      environment: "jsdom",
      setupFiles: ["./setup-tests.ts"],
      ...options,
    }),
  };
}

// Mantine configuration generator
export function generateMantineConfig(options = {}) {
  return generateReactConfig({
    setupFiles: ["./setup-tests.ts"],
    ...options,
  });
}

// Server configuration generator
export function generateServerConfig(options = {}) {
  return generateBaseConfig({
    environment: "node",
    ...options,
  });
}

// Node configuration generator
export function generateNodeConfig(options = {}) {
  return generateBaseConfig({
    environment: "node",
    ...options,
  });
}

// Alias for generateBaseConfig for backward compatibility
export const getConfig = generateBaseConfig;
