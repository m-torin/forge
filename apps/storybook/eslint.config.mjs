import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import storybookPlugin from "eslint-plugin-storybook";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import cypressPlugin from "eslint-plugin-cypress";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import vitestPlugin from "eslint-plugin-vitest";

const compat = new FlatCompat();

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:storybook/recommended"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...compat.extends("plugin:cypress/recommended"),
  ...compat.extends("plugin:testing-library/react"),
  vitestPlugin.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      storybook: storybookPlugin,
      "jsx-a11y": jsxA11yPlugin,
      cypress: cypressPlugin,
      "testing-library": testingLibraryPlugin,
      vitest: vitestPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "storybook/hierarchy-separator": "error",
      "storybook/default-exports": "error",
    },
  },
  {
    files: ["**/*.test.tsx"],
    rules: {
      "testing-library/await-async-queries": "error",
      "testing-library/no-await-sync-queries": "error",
      "testing-library/no-container": "error",
      "testing-library/no-debugging-utils": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
    },
  },
];
