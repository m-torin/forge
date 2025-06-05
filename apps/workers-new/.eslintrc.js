module.exports = {
  extends: ["next/core-web-vitals"],
  overrides: [
    {
      files: ["app/**/*.ts"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
        "@next/next/no-duplicate-head": "off"
      }
    }
  ]
}