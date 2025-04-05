# Migration Guide: @repo/testing

This document provides guidance for migrating from the old namespace-based API
to the new direct export API in `@repo/testing`.

## Breaking Changes

1. **Namespace exports have been removed** in favor of direct exports.
2. **Import paths have been simplified** to reduce nesting and improve
   discoverability.
3. **Default exports have been removed** to encourage named imports.

## Migration Steps

### 1. Automated Migration

We provide a migration script that automatically updates import paths in your
codebase:

```bash
# Run from the monorepo root
pnpm -F @repo/testing migrate-imports

# Or using the binary directly
npx migrate-testing-imports
```

### 2. Manual Migration

If you prefer to migrate manually or need to handle edge cases, follow these
patterns:

#### Vitest

**Before:**

```typescript
// Namespace approach
import { react } from "@repo/testing/vitest";
const { render, screen } = react;

// Deep imports
import { render } from "@repo/testing/vitest/frameworks/react";
```

**After:**

```typescript
// Direct exports
import { render, screen, renderHook } from "@repo/testing/vitest";
import { render as mantineRender } from "@repo/testing/vitest/mantine";
import { createServerConfig } from "@repo/testing/vitest/server";
```

#### Cypress

**Before:**

```typescript
// Namespace approach
import { core } from "@repo/testing/cypress";
const { createE2EConfig } = core;

// Deep imports
import { createE2EConfig } from "@repo/testing/cypress/core";
```

**After:**

```typescript
// Direct exports
import {
  createE2EConfig,
  createComponentConfig,
  baseConfig,
} from "@repo/testing/cypress";
```

#### Shared Utilities

**Before:**

```typescript
// Deep imports
import { mockEnvVars } from "@repo/testing/shared/env";
import { formatTestId } from "@repo/testing/shared/utils";
```

**After:**

```typescript
// Direct exports
import { mockEnvVars, formatTestId } from "@repo/testing/shared";
```

## New Features

Along with the API simplification, we've added several new features:

1. **Testing Library Integration for Cypress**: The package now includes
   `@testing-library/cypress` for more resilient and user-centric testing.
2. **Direct Hook Testing Support**: The `renderHook` function is now directly
   exported from the Vitest module.
3. **Improved Watch Mode**: Vitest configuration generators now include
   optimized watch mode settings.
4. **ESM Interoperability**: Better support for mixed module types in the
   monorepo.
5. **Cypress Performance Optimizations**: Improved test execution speed and
   reliability.

### Testing Library for Cypress

The package now includes `@testing-library/cypress` which provides a set of
custom commands that allow you to query DOM elements in a way that's similar to
how users interact with your application:

```typescript
// These commands are automatically available in your Cypress tests
cy.findByText("Submit").click();
cy.findByRole("button", { name: /submit/i }).click();
cy.findByLabelText("Email").type("user@example.com");
```

This approach encourages writing more resilient tests that are less likely to
break when implementation details change. It also provides consistency with your
Vitest tests, which already use Testing Library.

See the
[Cypress Testing Library documentation](./docs/cypress-testing-library.md) for
more details.

## Need Help?

If you encounter any issues during migration, please:

1. Check the [README.md](./README.md) for updated documentation
2. Run the test suite after migration to verify everything works
3. File an issue if you encounter problems that can't be resolved
