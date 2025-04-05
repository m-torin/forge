/**
 * E2E Testing Setup
 *
 * This file is processed and loaded automatically before your E2E test files.
 * It sets up the environment for E2E testing with Cypress.
 */

// Import environment utilities
import { setupCypressEnv } from "../env/index.ts";

// Import commands will be added here once implemented
// import '../core/commands/index.ts';

// Disable uncaught exception handling
// @ts-ignore - Cypress.on is defined at runtime
Cypress.on("uncaught:exception", (err: Error, runnable: Mocha.Runnable) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful for third-party library errors that don't affect the test
  console.log("Uncaught exception:", err.message);
  return false;
});

// Log all console errors
// @ts-ignore - Cypress.on is defined at runtime
Cypress.on("window:before:load", (win: Window) => {
  // @ts-ignore - win.console is defined at runtime
  cy.spy(win.console, "error").as("consoleError");
});

// Check for console errors after each test
afterEach(() => {
  cy.get("@consoleError").then((consoleError: any) => {
    if (consoleError.callCount > 0) {
      cy.log(`Console errors: ${consoleError.callCount}`);
      console.log("Console errors:", consoleError.args);
    }
  });
});

// Set up test environment
before(() => {
  // Set up standardized test environment variables
  setupCypressEnv();

  // Log test environment info
  cy.log(
    // @ts-ignore - Cypress.config is defined at runtime
    `Viewport: ${Cypress.config("viewportWidth")}x${Cypress.config("viewportHeight")}`,
  );
});
