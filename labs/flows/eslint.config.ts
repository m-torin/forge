import next from "@repo/eslint-config/next";

export default [
  ...next,
  {
    ignores: [
      "**/public/monaco-workers/**",
      "**/build/**",
      "**/dist/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/*.worker.js",
      "**/*.worker.ts"
    ]
  },
  {
    // Allow console statements in build scripts
    files: ["scripts/**/*.{js,mjs,ts}"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in documentation examples
    files: ["**/*.md", "**/*.mdx"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in compiled/vendor files
    files: ["**/public/**/*.js", "**/*.worker.js", "**/dist/**/*.js", "**/build/**/*.js"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in integration command files (they contain documentation examples)
    files: ["**/integrations/**/commands.ts"],
    rules: {
      "no-console": "off"
    }
  }
];