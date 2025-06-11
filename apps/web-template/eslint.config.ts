import js from "@eslint/js";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  js.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "no-console": "warn",
    },
  },
];

export default config;