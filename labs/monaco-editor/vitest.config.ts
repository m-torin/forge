import { createReactPackageConfig } from "@repo/qa/vitest/configs";
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createReactPackageConfig({
  setupFiles: ["./vitest.setup.ts"],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
    test: {
      coverage: {
        thresholds: {
          lines: 0,
          functions: 15,
          branches: 15,
          statements: 0,
        },
      },
    },
  },
});