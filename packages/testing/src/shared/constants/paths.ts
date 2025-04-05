/**
 * Shared path constants for tests
 */

export const paths = {
  root: "/",
  api: "/api",
  auth: "/auth",
  home: "/home",
  dashboard: "/dashboard",
  settings: "/settings",
  profile: "/profile",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
};

export const filePatterns = {
  typescript: "**/*.ts",
  typescriptReact: "**/*.tsx",
  javascript: "**/*.js",
  javascriptReact: "**/*.jsx",
  css: "**/*.css",
  scss: "**/*.scss",
  json: "**/*.json",
  html: "**/*.html",
  markdown: "**/*.md",
  all: "**/*.*",
};

export const timeouts = {
  short: 1000,
  medium: 5000,
  long: 10000,
  network: 7000,
  animation: 500,
  transition: 300,
};

export const environments = {
  development: "development",
  test: "test",
  production: "production",
  staging: "staging",
};
