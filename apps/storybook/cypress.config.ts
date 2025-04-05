import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "stories/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  e2e: {
    baseUrl: "http://localhost:6006",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
  video: false,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
