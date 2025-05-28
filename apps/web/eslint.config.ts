import baseConfig from "@repo/eslint-config/next";

export default [
  ...baseConfig,
  {
    ignores: ["app/.well-known/**/*"],
  },
];
