# Vitest Environment Utilities

This module provides Vitest-specific utilities for handling environment
variables in tests. It builds on the core environment utilities but adds
Vitest-specific functionality.

## Usage

```typescript
import {
  mockEnvVars,
  setupAllTestEnvVars,
  setupConsoleMocks,
  mockDate,
  mockFetch,
  testEnvVars,
  validationPatterns,
} from "@repo/testing/vitest/env";

describe("My Test Suite", () => {
  // Setup before tests
  beforeEach(() => {
    // Mock environment variables using vi.stubEnv
    mockEnvVars({
      API_KEY: "test-key",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test",
    });

    // Or use standard test values
    setupAllTestEnvVars();

    // Mock console methods
    setupConsoleMocks();

    // Mock the current date
    mockDate(new Date("2025-01-01"));

    // Mock fetch
    mockFetch({ data: "test" });
  });

  // Your tests here
  it("uses environment variables", () => {
    // Test code that uses environment variables
  });
});
```

## API Reference

### `mockEnvVars(envVars: Record<string, string>): () => void`

Mock environment variables for Vitest tests. This implementation uses
`vi.stubEnv` and `vi.unstubEnv` for better integration with Vitest.

```typescript
const restore = mockEnvVars({
  API_KEY: "test-key",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test",
});

// Restore original environment
restore();
```

### `setupAllTestEnvVars(): () => void`

Setup all standard test environment variables at once using Vitest's stubEnv.

```typescript
const restore = setupAllTestEnvVars();

// Restore original environment
restore();
```

### `setupConsoleMocks(): () => void`

Setup console mocks for testing. This replaces console methods with Vitest mock
functions.

```typescript
const restore = setupConsoleMocks();

// Test code that uses console methods
console.log("test"); // This is now a mock function

// Verify console was called
expect(console.log).toHaveBeenCalledWith("test");

// Restore original console methods
restore();
```

### `restoreConsoleMocks(): void`

Restore console mocks. This is a convenience function that calls
`vi.restoreAllMocks()`.

```typescript
setupConsoleMocks();

// Test code that uses console methods

// Restore console mocks
restoreConsoleMocks();
```

### `mockDate(date: Date): () => void`

Mock the current date for testing. This replaces the global Date constructor
with a mock that returns the specified date.

```typescript
const restore = mockDate(new Date("2025-01-01"));

// Test code that uses Date
const now = new Date(); // This will be 2025-01-01
const timestamp = Date.now(); // This will be the timestamp for 2025-01-01

// Restore original Date
restore();
```

### `mockFetch(mockResponse: any = {}): ReturnType<typeof vi.fn>`

Mock fetch for testing. This replaces the global fetch function with a mock that
returns the specified response.

```typescript
const fetchMock = mockFetch({
  data: "test",
  status: 200,
});

// Test code that uses fetch
const response = await fetch("https://example.com");
const data = await response.json(); // { data: 'test' }

// Verify fetch was called
expect(fetchMock).toHaveBeenCalledWith("https://example.com");
```

## Standard Test Values

The module re-exports the standard test values from the core environment
utilities:

```typescript
import { testEnvVars } from "@repo/testing/vitest/env";

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
import { validationPatterns } from "@repo/testing/vitest/env";

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
