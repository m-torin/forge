/**
 * Component Testing Setup
 *
 * This file is processed and loaded automatically before your component test files.
 * It sets up the environment for component testing with Cypress.
 */

// Import environment utilities
import { setupCypressEnv } from '../env/index.ts';

// Import commands will be added here once implemented
// import '../core/commands/index.ts';
import { mount } from 'cypress/react18';
import React from 'react';

// Add the mount command for React components
Cypress.Commands.add('mount', mount);

// Disable uncaught exception handling
Cypress.on('uncaught:exception', (err: Error, runnable: Mocha.Runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.log('Uncaught exception in component test:', err.message);
  return false;
});

// Set up global styles for component testing
Cypress.on('mount', (component: React.ReactNode) => {
  // You can add global styles or providers here
  // This is useful for theme providers, store providers, etc.
  return component;
});

// Interface for mount options
interface MountWithProvidersOptions {
  theme?: string;
  locale?: string;
  [key: string]: any;
}

// Add custom mount command with common providers
Cypress.Commands.add(
  'mountWithProviders',
  (component: React.ReactNode, options: MountWithProvidersOptions = {}) => {
    const { theme = 'light', locale = 'en', ...mountOptions } = options;

    // This is a placeholder for your actual providers
    // You'll need to customize this based on your application's needs
    const wrapped = (
      <div data-cy-root data-theme={theme} data-locale={locale}>
        {component}
      </div>
    );

    return cy.mount(wrapped, mountOptions);
  },
);

// Set up test environment
before(() => {
  // Set up standardized test environment variables
  setupCypressEnv();

  // Mark as component test
  Cypress.env('componentTest', true);

  // Log test environment info
  cy.log(
    `Running component tests in ${Cypress.env('testEnvironment')} environment`,
  );
});
