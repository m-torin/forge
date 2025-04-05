# Mock Registry

The Mock Registry provides a centralized system for managing mock values in
tests across the monorepo. It allows tests to override default values
temporarily and ensures consistent mock values across the test suite.

## Features

- Global registry for mock values with default values from example environment
  variables
- Service-specific helpers for different services (Stripe, etc.)
- Ability to override values temporarily for specific tests
- Automatic cleanup/reset after tests
- Type-safe access to mock values

## Usage

### Basic Usage

```typescript
import { mockRegistry } from "@repo/testing/shared";

// Get a mock value
const stripeSecretKey = mockRegistry.get("STRIPE_SECRET_KEY");

// Set a mock value
mockRegistry.set("STRIPE_SECRET_KEY", "custom_key");

// Reset all mock values to defaults
mockRegistry.reset();
```

### Service-Specific Helpers

```typescript
import { mockStripeKeys } from "@repo/testing/shared";

// Get Stripe keys
const secretKey = mockStripeKeys.getSecretKey();
const webhookSecret = mockStripeKeys.getWebhookSecret();

// Set Stripe keys
mockStripeKeys.setSecretKey("custom_key");
mockStripeKeys.setWebhookSecret("custom_webhook_secret");

// Reset Stripe keys to defaults
mockStripeKeys.reset();
```

### Overriding Values Temporarily

```typescript
import { mockStripeKeys } from "@repo/testing/shared";

// Override Stripe keys temporarily for a specific test
mockStripeKeys.override(
  {
    secretKey: "temporary_key",
    webhookSecret: "temporary_webhook_secret",
  },
  () => {
    // Code in this callback will use the overridden values
    // After the callback, values will be restored to their previous state
  },
);
```

## Integration with Keys Pattern

The Mock Registry is designed to work with the `keys.ts` pattern used across the
monorepo. Here's an example of how to integrate it:

```typescript
// In packages/your-package/keys.ts
import { mockStripeKeys } from "@repo/testing/shared";

export const keys = () => {
  const isTestEnv = process.env.NODE_ENV === "test";

  // Return mock values in test environment
  if (isTestEnv) {
    return {
      STRIPE_SECRET_KEY: mockStripeKeys.getSecretKey(),
      STRIPE_WEBHOOK_SECRET: mockStripeKeys.getWebhookSecret(),
    };
  }

  // Regular implementation for non-test environments
  return createEnv({
    // ...
  });
};
```

## Example Test

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { mockStripeKeys } from "@repo/testing/shared";
import { keys } from "../keys";

describe("Your Service", () => {
  beforeEach(() => {
    // Reset mock values before each test
    mockStripeKeys.reset();
  });

  it("should use default mock values", () => {
    const keysObj = keys();
    expect(keysObj.STRIPE_SECRET_KEY).toBe("sk_test_stripe_secret_key");
  });

  it("should allow overriding mock values for specific tests", () => {
    // Override the Stripe secret key for this test
    mockStripeKeys.override(
      {
        secretKey: "sk_test_custom_key_for_this_test",
      },
      () => {
        const keysObj = keys();
        expect(keysObj.STRIPE_SECRET_KEY).toBe(
          "sk_test_custom_key_for_this_test",
        );
      },
    );
  });
});
```

## Adding New Services

To add support for a new service:

1. Create a new file in
   `packages/testing/src/shared/mockRegistry/services/your-service.ts`
2. Implement service-specific helpers similar to the Stripe example
3. Export the helpers from
   `packages/testing/src/shared/mockRegistry/services/index.ts`
4. Update the default values in
   `packages/testing/src/shared/mockRegistry/registry.ts` if needed
