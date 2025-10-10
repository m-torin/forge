import reactPackage from "@repo/eslint-config/react-package";

export default [
  {
    ignores: ["**/sas.ts"]
  },
  ...reactPackage,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "import/extensions": ["error", "never", { 
        "api": "always",
        "css": "always"
      }]
    }
  }
];