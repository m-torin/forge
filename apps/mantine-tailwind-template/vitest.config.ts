import { createNextAppConfig } from "@repo/qa/vitest/configs";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default createNextAppConfig({
  setupFiles: ["./__tests__/setup.ts"],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
    test: {
      exclude: ["**/e2e/**", "**/node_modules/**"],
      coverage: {
        thresholds: {
          lines: 5,
          functions: 5,
          branches: 5,
          statements: 5,
        },
      },
    },
  },
});
