import { createNextAppConfig } from "@repo/qa/vitest/configs";
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createNextAppConfig({
  setupFiles: ["./vitest.setup.ts"],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
  },
});