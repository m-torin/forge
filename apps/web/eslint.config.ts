import baseConfig from "@repo/eslint-config/next";

export default [
  ...baseConfig,
  {
    ignores: [
      "app/.well-known/**/*",
      // Ignore markdown files to prevent memory issues
      "**/*.md",
      "**/*.mdx",
    ],
  },
  {
    // Disable TypeScript project checking for this app to reduce memory usage
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: false, // Disable project-wide type checking
      },
    },
  },
];
