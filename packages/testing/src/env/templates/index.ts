/**
 * Environment Testing Templates
 *
 * This module provides templates for testing environment variable validation
 * in different testing frameworks.
 */

// Export the framework-agnostic template
export { default as createEnvTests } from './keys.test.ts';

// Export the Vitest-specific template
export { default as createVitestEnvTests } from './vitest/keys.test.ts';

// Export the Cypress-specific template
export { default as createCypressEnvTests } from './cypress/keys.test.ts';

// Export a convenience function to create tests for the appropriate framework
export function createFrameworkTests(framework: 'vitest' | 'cypress') {
  if (framework === 'vitest') {
    return createVitestEnvTests();
  } else if (framework === 'cypress') {
    return createCypressEnvTests();
  } else {
    throw new Error(`Unsupported framework: ${framework}`);
  }
}

// Export default object with all templates
export default {
  createEnvTests,
  createVitestEnvTests,
  createCypressEnvTests,
  createFrameworkTests,
};
