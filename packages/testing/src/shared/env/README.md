# Environment Testing Utilities

This directory contains framework-agnostic and framework-specific environment
utilities for testing.

## Directory Structure

```
env/
├── core/           # Framework-agnostic core utilities
│   ├── utils.ts    # Core utility functions
│   └── values.ts   # Validation patterns and example values
├── vitest/         # Vitest-specific utilities
│   └── index.ts    # Vitest adapter
├── cypress/        # Cypress-specific utilities
│   └── index.ts    # Cypress adapter
└── index.ts        # Main entry point with auto-detection
```

## Usage

### Auto-Detection

The main entry point automatically detects the testing framework and loads the
appropriate adapter:

```typescript
import { mockEnvVars } from '@repo/testing/shared/env';
import { env } from './env'; // Your application's environment

// This will use the Vitest implementation in a Vitest environment
// or the Cypress implementation in a Cypress environment
const restore = mockEnvVars({
  API_KEY: env.API_KEY,
  // ...other app-specific variables
});
```

### Explicit Framework Selection

You can also explicitly import from a specific framework adapter:

```typescript
// Vitest-specific implementation
import { mockEnvVars } from '@repo/testing/shared/env/vitest';

// Cypress-specific implementation
import { setupCypressEnv } from '@repo/testing/shared/env/cypress';

// Framework-agnostic core implementation
import { isTestEnvironment } from '@repo/testing/shared/env/core';
```

## Core Utilities

### Environment Detection

```typescript
import { isTestEnvironment } from '@repo/testing/shared/env';

if (isTestEnvironment()) {
  // We're in a test environment
}
```

### Environment Variable Mocking

```typescript
import { mockEnvVars } from '@repo/testing/shared/env';
import { env } from './env'; // Your application's environment

// Mock specific environment variables
const restore = mockEnvVars({
  API_KEY: env.API_KEY,
  DEBUG: 'true',
});

// Later, restore the original environment
restore();
```

### Example Environment Values

```typescript
import { exampleEnvVars } from '@repo/testing/shared/env';

// These are example values for documentation purposes only
// Do not use them directly in your tests
console.log(exampleEnvVars.CLERK_SECRET_KEY); // 'sk_test_clerk_secret_key'
```

### Test-Aware Validation

```typescript
import { createTestAwareValidator } from '@repo/testing/shared/env';
import { z } from 'zod';

// Create a validator that's more relaxed in test environments
const apiKeyValidator = createTestAwareValidator(
  z.string().min(1).optional(), // Test environment - more relaxed
  z.string().min(1).startsWith('sk-').optional(), // Production - stricter
);
```

## Vitest-Specific Utilities

```typescript
import {
  mockEnvVars,
  mockDate,
  mockFetch,
} from '@repo/testing/shared/env/vitest';
import { env } from './env'; // Your application's environment

// Mock environment variables using vi.stubEnv
const restore = mockEnvVars({
  API_KEY: env.API_KEY,
  // ...other app-specific variables
});

// Mock the current date
const restoreDate = mockDate(new Date('2023-01-01'));

// Mock fetch
const fetchMock = mockFetch({ data: 'test' });
```

## Cypress-Specific Utilities

```typescript
import { setupCypressEnv, getTestEnv } from '@repo/testing/shared/env/cypress';
import { env } from './env'; // Your application's environment

// Setup environment variables
setupCypressEnv({
  API_KEY: env.API_KEY,
  // ...other app-specific variables
});

// Get a test environment variable
const apiKey = getTestEnv('API_KEY');

// Mock environment variables for a specific test
withMockEnv({ API_KEY: 'mock-key' }, () => {
  // Test with mocked environment
});
```

## Environment Variable Patterns

Each application should maintain its own environment files, but the testing
package provides validation patterns to ensure consistency:

```typescript
import { validationPatterns } from '@repo/testing/shared/env';

// Use these patterns to validate environment variables
const isValidClerkKey =
  validationPatterns.clerk.secretKeyTest.test('sk_test_abc123');
```
