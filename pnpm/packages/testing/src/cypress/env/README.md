# Cypress Environment Utilities

This module provides Cypress-specific utilities for handling environment
variables in tests. It builds on the core environment utilities but adds
Cypress-specific functionality.

## Usage

```typescript
import {
  setupCypressEnv,
  getTestEnv,
  verifyEnvironment,
  withMockEnv,
  addEnvironmentToConfig,
  testEnvVars,
  validationPatterns,
} from '@repo/testing/cypress/env';

// In your Cypress setup file (e.g., cypress/support/e2e.ts)
before(() => {
  // Setup standard test environment variables
  setupCypressEnv();
});

// In your Cypress tests
describe('My Test Suite', () => {
  it('uses environment variables', () => {
    // Get a test environment variable
    const apiKey = getTestEnv('API_KEY');

    // Verify required environment variables
    verifyEnvironment(['API_KEY', 'DATABASE_URL']);

    // Mock environment variables for a specific test
    withMockEnv({ API_KEY: 'test-key' }, () => {
      // Test code that uses API_KEY
    });
  });
});

// In your Cypress configuration file (e.g., cypress.config.ts)
import { defineConfig } from 'cypress';
import { addEnvironmentToConfig } from '@repo/testing/cypress/env';

export default defineConfig(
  addEnvironmentToConfig({
    e2e: {
      baseUrl: 'http://localhost:3000',
      // Other Cypress config
    },
  }),
);
```

## API Reference

### `setupCypressEnv(): void`

Setup Cypress environment variables for testing. This sets up standard test
values in Cypress.env().

```typescript
// In your Cypress setup file
before(() => {
  setupCypressEnv();
});
```

### `getTestEnv(key: string, defaultValue?: string): string | undefined`

Get a test environment variable from Cypress.env().

```typescript
// Get a test environment variable
const apiKey = getTestEnv('API_KEY');

// Get a test environment variable with a default value
const apiKey = getTestEnv('API_KEY', 'default-key');
```

### `verifyEnvironment(requiredVars: string[]): void`

Verify that environment variables are properly configured. This logs a warning
if any of the required variables are not set.

```typescript
// Verify required environment variables
verifyEnvironment(['API_KEY', 'DATABASE_URL']);
```

### `withMockEnv(envVars: Record<string, string>, callback: () => void): void`

Mock environment variables for a specific test. This is useful for testing error
conditions or edge cases.

```typescript
// Mock environment variables for a specific test
withMockEnv({ API_KEY: 'test-key' }, () => {
  // Test code that uses API_KEY
});
```

### `addEnvironmentToConfig(config: Cypress.ConfigOptions): Cypress.ConfigOptions`

Add environment variables to Cypress config. This should be called in the
Cypress configuration file.

```typescript
// In your Cypress configuration file
import { defineConfig } from 'cypress';
import { addEnvironmentToConfig } from '@repo/testing/cypress/env';

export default defineConfig(
  addEnvironmentToConfig({
    e2e: {
      baseUrl: 'http://localhost:3000',
      // Other Cypress config
    },
  }),
);
```

## Standard Test Values

The module re-exports the standard test values from the core environment
utilities:

```typescript
import { testEnvVars } from '@repo/testing/cypress/env';

// Authentication
testEnvVars.CLERK_SECRET_KEY; // 'sk_test_clerk_secret_key'
testEnvVars.CLERK_PUBLISHABLE_KEY; // 'pk_test_clerk_publishable_key'

// Database
testEnvVars.DATABASE_URL; // 'postgresql://postgres:postgres@localhost:5432/test'

// Email
testEnvVars.RESEND_API_KEY; // 're_test_resend_token'

// Analytics
testEnvVars.GOOGLE_ANALYTICS_ID; // 'G-TEST12345'
testEnvVars.POSTHOG_API_KEY; // 'phc_test12345'

// Payments
testEnvVars.STRIPE_SECRET_KEY; // 'sk_test_stripe_secret_key'
testEnvVars.STRIPE_WEBHOOK_SECRET; // 'whsec_test_stripe_webhook_secret'

// Feature flags
testEnvVars.FEATURE_FLAGS_API_KEY; // 'test_feature_flags_key'
```

## Validation Patterns

The module also re-exports the validation patterns from the core environment
utilities:

```typescript
import { validationPatterns } from '@repo/testing/cypress/env';

// Authentication
validationPatterns.clerk.secretKeyTest; // /^sk_test_/
validationPatterns.clerk.secretKeyProd; // /^sk_live_/

// Email
validationPatterns.resend.apiKeyTest; // /^re_test_/
validationPatterns.resend.apiKeyProd; // /^re_/

// Payments
validationPatterns.stripe.secretKeyTest; // /^sk_test_/
validationPatterns.stripe.secretKeyProd; // /^sk_live_/

// Analytics
validationPatterns.analytics.googleIdTest; // /^G-TEST/
validationPatterns.analytics.googleIdProd; // /^G-/
```

## Integration with Cypress Tasks

For more advanced environment variable handling, you can set up Cypress tasks to
interact with Node.js environment variables:

```typescript
// In your cypress.config.ts
import { defineConfig } from 'cypress';
import { addEnvironmentToConfig } from '@repo/testing/cypress/env';

export default defineConfig(
  addEnvironmentToConfig({
    e2e: {
      setupNodeEvents(on, config) {
        // Add tasks for environment variable handling
        on('task', {
          // Reset environment variables
          resetEnv: () => {
            process.env = { ...process.env };
            return null;
          },

          // Set environment variables
          setEnv: (envVars: Record<string, string>) => {
            Object.entries(envVars).forEach(([key, value]) => {
              process.env[key] = value;
            });
            return null;
          },

          // Delete environment variables
          deleteEnv: (key: string) => {
            delete process.env[key];
            return null;
          },
        });

        return config;
      },
    },
  }),
);
```
