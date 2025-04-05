import { generateReactConfig } from "@repo/testing/generators";
import { defineConfig, mergeConfig } from "vitest/config";

// Generate the base React configuration
const baseConfig = generateReactConfig({
  // If you need specific overrides for this package, add them here
  // For example:
  // test: {
  //   environment: 'jsdom',
  // },
  __dirname,
});

// Define package-specific overrides or additions
const packageConfig = defineConfig({
  // Add any specific configurations for this package
  // For example, if you need to exclude specific files beyond the base config:
  // test: {
  //   exclude: [
  //     ...(baseConfig.test?.exclude || []), // Keep base excludes
  //     "**/specific-file-to-exclude.test.tsx",
  //   ],
  // },
  // Ensure aliases match your tsconfig.json if needed
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});

// Merge the base config with package-specific config
export default mergeConfig(baseConfig, packageConfig);
