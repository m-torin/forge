import baseConfig from "@repo/eslint-config/next";

export default [
  ...baseConfig,
  {
    ignores: ["test-results/**", "playwright-report/**"],
  },
  {
    files: ["e2e/**/*.ts", "e2e/**/*.tsx"],
    rules: {
      "testing-library/no-container": "off",
      "testing-library/no-debugging-utils": "off",
      "testing-library/no-node-access": "off",
      "testing-library/prefer-find-by": "off",
      "testing-library/prefer-presence-queries": "off",
      "testing-library/prefer-screen-queries": "off",
    },
  },
];
