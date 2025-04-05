/// <reference path="./global.d.ts" />

/**
 * Cypress Custom Commands
 *
 * This module provides custom commands for Cypress tests in the Next-Forge monorepo.
 */

// Import all Cypress commands
import "./auth.ts";
// Import Testing Library commands
import "@testing-library/cypress/add-commands";
// This import will be uncommented once the package is added to the project
// import 'cypress-axe';

// Add custom commands for accessing design system components
// @ts-ignore - Cypress.Commands is defined at runtime
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Add command for checking accessibility
// This will be uncommented once cypress-axe is added to the project
/*
Cypress.Commands.add(
  'checkA11y',
  (context: string | null = null, options: any | null = null) => {
    if (context) {
      cy.injectAxe();
      cy.checkA11y(context, options);
    } else {
      cy.injectAxe();
      cy.checkA11y(options);
    }
  },
);
*/

// Add command for waiting for network requests to complete
// @ts-ignore - Cypress.Commands is defined at runtime
Cypress.Commands.add("waitForNetworkIdle", (timeout: number = 5000) => {
  let activeRequests = 0;

  const onRequestStarted = (): void => {
    activeRequests += 1;
  };

  const onRequestEnded = (): void => {
    activeRequests -= 1;
  };

  cy.intercept({ url: "*" }, (req) => {
    onRequestStarted();
    req.on("response", () => {
      onRequestEnded();
    });
  });

  return cy
    .wait(100) // Small initial wait
    .then(() => {
      // @ts-ignore - Cypress.Promise is defined at runtime
      return new Cypress.Promise((resolve) => {
        const checkRequests = (): void => {
          if (activeRequests === 0) {
            resolve();
          } else {
            setTimeout(checkRequests, 100);
          }
        };

        setTimeout(() => {
          resolve(); // Resolve anyway after timeout
        }, timeout);

        checkRequests();
      });
    });
});

// Define viewport sizes
interface ViewportSizes {
  [key: string]: { width: number; height: number };
}

// Add command for testing responsive layouts
// @ts-ignore - Cypress.Commands is defined at runtime
Cypress.Commands.add(
  "setViewport",
  (
    size:
      | "mobile"
      | "tablet"
      | "desktop"
      | "widescreen"
      | { width: number; height: number },
  ) => {
    const sizes: ViewportSizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 800 },
      widescreen: { width: 1920, height: 1080 },
    };

    const viewport = typeof size === "string" ? sizes[size] : size;
    cy.viewport(viewport.width, viewport.height);
  },
);

// Export all commands
export default {
  // List of all commands for documentation
  commands: [
    // Custom auth commands
    "login",
    "logout",
    "bypassLogin",

    // Custom selector commands
    "getByTestId",

    // Testing Library commands
    "findByText",
    "findAllByText",
    "findByRole",
    "findAllByRole",
    "findByLabelText",
    "findAllByLabelText",
    "findByPlaceholderText",
    "findAllByPlaceholderText",
    "findByDisplayValue",
    "findAllByDisplayValue",
    "findByAltText",
    "findAllByAltText",
    "findByTitle",
    "findAllByTitle",
    "findByTestId",
    "findAllByTestId",

    // Utility commands
    // 'checkA11y', // Commented out until cypress-axe is added
    "waitForNetworkIdle",
    "setViewport",
    "mountWithProviders",
  ],
};
