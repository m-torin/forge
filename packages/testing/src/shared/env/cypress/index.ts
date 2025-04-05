/**
 * Cypress-specific Environment Utilities
 *
 * This module provides Cypress-specific utilities for handling environment variables in tests.
 * It builds on the core environment utilities but adds Cypress-specific functionality.
 */
/// <reference path="./cypress.d.ts" />
import {
  isTestEnvironment,
  createTestAwareValidator,
  testEnvVars,
  exampleEnvVars,
  validationPatterns,
} from "../core/index.ts";

// Re-export core utilities
export {
  isTestEnvironment,
  createTestAwareValidator,
  testEnvVars,
  exampleEnvVars,
  validationPatterns,
};

/**
 * Setup Cypress environment variables for testing
 * This sets up environment variables in Cypress.env()
 *
 * @param envVars - Environment variables to set (should come from the application's own environment)
 *
 * @example
 * ```ts
 * // Import from your application's environment
 * import { env } from './env';
 *
 * // Set up test environment variables
 * setupCypressEnv({
 *   API_KEY: env.API_KEY,
 *   // ...other app-specific variables
 * });
 * ```
 */
export function setupCypressEnv(envVars?: Record<string, string>): void {
  // Set test mode
  Cypress.env("testMode", true);
  Cypress.env("testEnvironment", "test");

  if (!envVars) {
    console.warn(
      "No environment variables provided to setupCypressEnv. " +
        "You should provide your application's environment variables. " +
        "See exampleEnvVars for format examples.",
    );
    return;
  }

  // Set provided environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    Cypress.env(key, value);
  });

  // Log environment setup
  cy.log("Test environment variables configured");
}

/**
 * Get a test environment variable from Cypress.env()
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Environment variable value
 */
export function getTestEnv(
  key: string,
  defaultValue?: string,
): string | undefined {
  return Cypress.env(key) || defaultValue;
}

/**
 * Verify that environment variables are properly configured
 * @param requiredVars - Array of required environment variable keys
 */
export function verifyEnvironment(requiredVars: string[]): void {
  requiredVars.forEach((key) => {
    const value = Cypress.env(key);
    if (!value) {
      cy.log(`Warning: Required environment variable ${key} is not set`);
    }
  });
}

/**
 * Mock environment variables for a specific test
 * This is useful for testing error conditions or edge cases
 * @param envVars - Key-value pairs of environment variables
 */
export function withMockEnv(
  envVars: Record<string, string>,
  callback: () => void,
): void {
  // Store original values
  const originalValues: Record<string, any> = {};

  // Set mock values
  Object.entries(envVars).forEach(([key, value]) => {
    originalValues[key] = Cypress.env(key);
    Cypress.env(key, value);
  });

  // Run the callback
  try {
    callback();
  } finally {
    // Restore original values
    Object.entries(originalValues).forEach(([key, value]) => {
      Cypress.env(key, value);
    });
  }
}

/**
 * Add environment variables to Cypress config
 * This should be called in the Cypress configuration file
 *
 * @param config - Cypress configuration object
 * @param envVars - Environment variables to add to the config (should come from the application's own environment)
 * @returns Updated Cypress configuration
 *
 * @example
 * ```ts
 * // Import from your application's environment
 * import { env } from './env';
 *
 * // Add environment variables to Cypress config
 * export default addEnvironmentToConfig(baseConfig, {
 *   API_KEY: env.API_KEY,
 *   // ...other app-specific variables
 * });
 * ```
 */
export function addEnvironmentToConfig(
  config: any,
  envVars?: Record<string, string>,
): any {
  // Set test mode in env
  config.env = {
    ...config.env,
    testMode: true,
    testEnvironment: process.env.NODE_ENV || "test",
  };

  // Add provided environment variables
  if (envVars) {
    config.env = {
      ...config.env,
      ...envVars,
    };
  } else {
    console.warn(
      "No environment variables provided to addEnvironmentToConfig. " +
        "You should provide your application's environment variables. " +
        "See exampleEnvVars for format examples.",
    );
  }

  return config;
}
