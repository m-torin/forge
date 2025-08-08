import { createNextAppConfig } from "@repo/qa/vitest/configs";
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createNextAppConfig({
  setupFiles: ["./vitest.setup.ts"],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/__tests__/e2e/**', // Exclude e2e tests from vitest
      ],
    },
  },
});