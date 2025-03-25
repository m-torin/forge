# Environment Testing Utilities

This module provides a comprehensive set of utilities for handling environment
variables in test environments. These utilities are framework-agnostic and can
be used with any testing setup, including Vitest and Cypress.

## Core Utilities

The core utilities are framework-agnostic and can be used with any testing
setup:

```typescript
import {
  isTestEnvironment,
  createTestAwareValidator,
  mockEnvVars,
  testEnvVars,
  validationPatterns,
} from '@repo/testing/env';

// Check if we're in a test environment
if (isTestEnvironment()) {
  // Do something specific to test environments
}

// Create environment-aware validators
const apiKeyValidator = createTestAwareValidator(
  z.string().min(1), // Test environment - more relaxed
  z.string().min(1).startsWith('sk_live_'), // Production - stricter
);

// Mock environment variables for tests
const restore = mockEnvVars({
  API_KEY: 'test-key',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
});

// Use standard test values
console.log(testEnvVars.CLERK_SECRET_KEY); // 'sk_test_clerk_secret_key'

// Restore original environment
restore();
```

## Framework-Specific Adapters

### Vitest Adapter

The Vitest adapter provides Vitest-specific utilities:

```typescript
import {
  mockEnvVars,
  setupAllTestEnvVars,
  setupConsoleMocks,
  mockDate,
  mockFetch,
} from '@repo/testing/vitest/env';

// Mock environment variables using vi.stubEnv
const restore = mockEnvVars({
  API_KEY: 'test-key',
});

// Setup all standard test environment variables
const restoreAll = setupAllTestEnvVars();

// Mock console methods
const restoreConsole = setupConsoleMocks();

// Mock the current date
const restoreDate = mockDate(new Date('2025-01-01'));

// Mock fetch
const fetchMock = mockFetch({ data: 'test' });

// Restore everything
restore();
restoreAll();
restoreConsole();
restoreDate();
```

### Cypress Adapter

The Cypress adapter provides Cypress-specific utilities:

```typescript
import {
  setupCypressEnv,
  getTestEnv,
  verifyEnvironment,
  withMockEnv,
  addEnvironmentToConfig,
} from '@repo/testing/cypress/env';

// Setup standard test environment variables
setupCypressEnv();

// Get a test environment variable
const apiKey = getTestEnv('API_KEY');

// Verify required environment variables
verifyEnvironment(['API_KEY', 'DATABASE_URL']);

// Mock environment variables for a specific test
withMockEnv({ API_KEY: 'test-key' }, () => {
  // Test code that uses API_KEY
});

// Add environment variables to Cypress config
module.exports = addEnvironmentToConfig({
  // Your Cypress config
});
```

## Templates

The module also provides templates for testing environment variable validation:

```typescript
// For Vitest
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { templates } from '@repo/testing/env';

// Create a test suite for environment variables
templates.createEnvTests('vitest');

// For Cypress
import { templates } from '@repo/testing/env';

describe('Environment Variables', () => {
  templates.createEnvTests('cypress');
});
```

## Standard Test Values

The module provides standard test values for common environment variables:

```typescript
import { testEnvVars } from '@repo/testing/env';

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

The module also provides validation patterns for common environment variables:

```typescript
import { validationPatterns } from '@repo/testing/env';

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
