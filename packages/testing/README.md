# @repo/testing

Testing utilities for the Next-Forge monorepo.

## ⚠️ BREAKING CHANGES

This package has undergone significant changes to simplify its API:

1. **Limited Export Paths**: Only these six import paths are now available:

   - `@repo/testing/vitest` (React testing utilities)
   - `@repo/testing/vitest/server` (Server testing utilities)
   - `@repo/testing/vitest/mantine` (Mantine testing utilities)
   - `@repo/testing/cypress` (Cypress testing utilities)
   - `@repo/testing/shared` (Shared utilities and constants)
   - `@repo/testing/generators` (Vitest configuration generators)

2. **Direct Import Approach**: Testing utilities are now directly available from
   their respective modules:

   ```typescript
   // ❌ Old approach
   import { render } from "@repo/testing/vitest/frameworks/react";
   // or
   import { react } from "@repo/testing/vitest";
   const { render } = react;

   // ✅ New approach for React (default)
   import { render } from "@repo/testing/vitest";

   // ✅ New approach for Mantine
   import { render as mantineRender } from "@repo/testing/vitest/mantine";

   // ✅ New approach for Server
   import { createServerConfig } from "@repo/testing/vitest/server";
   ```

3. **Root Package Import Removed**: The root package import is no longer
   available:

   ```typescript
   // ❌ No longer available
   import { vitest } from "@repo/testing";

   // ✅ Use direct imports instead
   import * as vitest from "@repo/testing/vitest";
   ```

4. **Simplified Import Patterns**: All utilities are now available from one of
   the six main paths:

   ```typescript
   // ❌ Old approach - deep imports
   import { mockEnvVars } from "@repo/testing/shared/env";
   import { render } from "@repo/testing/vitest/frameworks/react";

   // ✅ New approach - direct imports
   import { mockEnvVars } from "@repo/testing/shared";
   import { render } from "@repo/testing/vitest";
   import { render as mantineRender } from "@repo/testing/vitest/mantine";
   import { createServerConfig } from "@repo/testing/vitest/server";
   import { generateReactConfig } from "@repo/testing/generators";
   ```

## Overview

This package provides a comprehensive set of testing utilities for both Vitest
and Cypress. It includes:

- Framework-specific utilities for Vitest and Cypress
- Shared utilities and constants that can be used by both frameworks
- Environment utilities for handling environment variables in tests
- Presets for configuring Vitest and Cypress

## Directory Structure

```
packages/testing/
├── src/
│   ├── cypress/        # Cypress-specific utilities
│   │   ├── component/  # Component testing utilities
│   │   ├── core/       # Core utilities
│   │   ├── e2e/        # E2E testing utilities
│   │   ├── env/        # Environment utilities (deprecated)
│   │   └── scripts/    # Scripts for setting up Cypress
│   ├── env/            # Environment utilities (deprecated)
│   ├── generators/     # Code generators
│   ├── shared/         # Shared utilities and constants
│   │   ├── constants/  # Shared constants
│   │   ├── env/        # Environment utilities
│   │   │   ├── core/   # Framework-agnostic utilities
│   │   │   ├── vitest/ # Vitest-specific utilities
│   │   │   └── cypress/ # Cypress-specific utilities
│   │   ├── presets/    # Shared presets
│   │   └── utils/      # Shared utilities
│   └── vitest/         # Vitest-specific utilities
│       ├── env/        # Environment utilities (deprecated)
│       ├── frameworks/ # Framework-specific utilities
│       ├── mocks/      # Mock implementations
│       ├── renderers/  # Component rendering utilities
│       ├── scripts/    # Scripts for generating tests
│       ├── shared/     # Shared utilities
│       └── templates/  # Test templates
└── scripts/            # Setup scripts
```

## Usage

### Vitest

```typescript
// Import React testing utilities directly
import {
  render,
  screen,
  fireEvent,
  renderHook,
  createReactConfig,
} from "@repo/testing/vitest";

// Import Mantine-specific utilities directly
import { render as mantineRender } from "@repo/testing/vitest/mantine";

// Import server-specific utilities directly
import { createServerConfig } from "@repo/testing/vitest/server";

// Import Vitest functions
import { describe, it, expect } from "@repo/testing/vitest";

// Create a Vitest configuration
export default createReactConfig({
  // Custom configuration
});

// Test a React hook
const { result } = renderHook(() => useMyCustomHook());
expect(result.current.value).toBe("expected value");
```

### Cypress

```typescript
// Import Cypress configuration directly
import {
  createE2EConfig,
  createComponentConfig,
  baseConfig,
} from "@repo/testing/cypress";

// Import Testing Library commands (automatically available in tests)
// These commands are added by @testing-library/cypress
cy.findByText("Submit").click();
cy.findByRole("button", { name: /submit/i }).click();
cy.findByLabelText("Email").type("user@example.com");

// Create a Cypress configuration with performance optimizations
export default createE2EConfig({
  // Custom configuration
});

// Or for component testing
export default createComponentConfig({
  // Custom configuration
});
```

### Shared Utilities

```typescript
// Import utilities
import { formatTestId, dataTestIdSelector } from "@repo/testing/shared";

// Import constants
import { testUser, testDates } from "@repo/testing/shared";

// Import environment utilities
import {
  mockEnvVars,
  exampleEnvVars,
  validationPatterns,
} from "@repo/testing/shared";

// Import presets
import { createBaseConfig } from "@repo/testing/shared";
```

### Environment Utilities

```typescript
// Import environment utilities
import {
  mockEnvVars,
  exampleEnvVars,
  validationPatterns,
} from "@repo/testing/shared";
import { env } from "./env"; // Your application's environment

// Mock environment variables from your application's environment
const restore = mockEnvVars({
  API_KEY: env.API_KEY,
  // ...other app-specific variables
});

// Restore original environment
restore();

// Use validation patterns for environment variables
const isValidClerkKey =
  validationPatterns.clerk.secretKeyTest.test("sk_test_abc123");
```

### Vitest Configuration Generators

```typescript
// Import generators directly
import {
  generateBaseConfig,
  generateReactConfig,
  generateNodeConfig,
  getConfig,
} from "@repo/testing/generators";

// Create a Vitest configuration for a React package
export default generateReactConfig({
  // Custom configuration options
});

// Or use the getConfig helper to choose the right config based on type
export default getConfig("react", {
  // Custom configuration options
});
```

> **Important**: Each application should maintain its own environment files in
> accordance with [ENV-1]. The testing package provides validation patterns and
> example values, but not the values themselves.

## New Features

### 1. Testing Library Integration for Cypress

The package now includes `@testing-library/cypress` for more resilient and
user-centric testing:

```typescript
// These commands are automatically available in your Cypress tests
cy.findByText("Submit").click();
cy.findByRole("button", { name: /submit/i }).click();
cy.findByLabelText("Email").type("user@example.com");
```

Benefits:

- **Consistency**: Uses the same query patterns as your Vitest tests
- **Resilience**: Tests are less likely to break with implementation changes
- **Accessibility**: Encourages accessible markup by using role-based queries
- **Readability**: Tests are more descriptive and easier to understand

See the
[Cypress Testing Library documentation](packages/testing/docs/cypress-testing-library.md)
for more details.

### 2. Direct Hook Testing Support

The `renderHook` function is now directly exported from the Vitest module for
easier hook testing:

```typescript
import { renderHook } from "@repo/testing/vitest";

test("my custom hook", () => {
  const { result } = renderHook(() => useMyCustomHook());
  expect(result.current.value).toBe("expected value");
});
```

### 3. Improved Watch Mode

The Vitest configuration generators now include optimized watch mode settings:

```typescript
// These settings are automatically applied when using the generators
watch: {
  // Optimize ignored patterns for faster watching
  ignored: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
  // Optimize polling settings based on filesystem type
  usePolling: false,
  // Ensure fast feedback loop
  killOnStale: true
}
```

### 4. ESM Interoperability

The configuration now includes improved ESM/CommonJS interoperability:

```typescript
// These settings are automatically applied when using the generators
resolve: {
  // ... other settings
  // Improve ESM interoperability
  conditions: ['import', 'module', 'node', 'default'],
}
```

This ensures smooth operation between different module types in the monorepo.

### 5. Cypress Performance Optimizations

The Cypress configurations now include performance optimizations:

```typescript
// These settings are automatically applied when using the configurations
baseConfig: {
  // ... other settings
  // Performance optimizations
  numTestsKeptInMemory: 10, // Limit memory usage
  retries: { runMode: 1, openMode: 0 }, // Retry failed tests once in CI
  experimentalMemoryManagement: true, // Enable experimental memory management
  watchForFileChanges: true, // Auto-reload on file changes
}
```

These optimizations improve test execution speed and reliability in both
development and CI environments.

## Scripts

- `pnpm generate-tests <package-path>`: Generate tests for a package
- `pnpm generate-tests:all`: Generate tests for all packages
- `pnpm setup-cypress <package-path>`: Set up Cypress for a package
- `pnpm setup-vitest <package-path>`: Set up Vitest for a package
