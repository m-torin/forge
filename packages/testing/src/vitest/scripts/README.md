# Test Generation Scripts

This directory contains scripts for generating test files for packages in the
Next-Forge monorepo.

## Usage

### Generate Tests for a Specific Package

```bash
# From the monorepo root
pnpm --filter @repo/testing generate-tests packages/my-package

# Or from the testing package
pnpm generate-tests ../my-package
```

### Generate Tests for All Packages

```bash
# From the monorepo root
pnpm --filter @repo/testing generate-tests:all

# Or from the testing package
pnpm generate-tests:all
```

## What These Scripts Do

These scripts:

1. Create a `__tests__` directory if it doesn't exist
2. Create a setup file that imports the testing utilities
3. Generate test files for components, hooks, and utilities
4. Create test files for environment variables if a `keys.ts` file exists
5. Create a `vitest.config.ts` file with the appropriate configuration

## Generated Files

The scripts generate the following files based on the package content:

| Source File/Directory | Generated Test File/Directory |
| --------------------- | ----------------------------- |
| `index.ts/tsx`        | `__tests__/index.test.ts/tsx` |
| `keys.ts`             | `__tests__/keys.test.ts`      |
| `components/`         | `__tests__/components/`       |
| `hooks/`              | `__tests__/hooks/`            |
| `utils/`              | `__tests__/utils/`            |

Additionally, the script creates:

- `__tests__/setup.ts` - Test setup file
- `vitest.config.ts` - Vitest configuration file (if it doesn't exist)

## Configuration

The generated `vitest.config.ts` file will use the appropriate configuration
based on the package content:

- For React packages (with `.tsx` files or a `components` directory):

  ```typescript
  import { createReactConfig } from "@repo/testing/vitest/react";
  import path from "path";

  export default createReactConfig(
    {
      // Package-specific overrides here
    },
    __dirname,
  );
  ```

- For non-React packages:

  ```typescript
  import { createBaseConfig } from "@repo/testing/vitest/core";
  import path from "path";

  export default createBaseConfig(
    {
      // Package-specific overrides here
    },
    __dirname,
  );
  ```

## Templates

The scripts use templates for different types of files:

- Component tests
- Hook tests
- Utility tests
- Environment variable tests
- Index tests

These templates are based on the testing utilities in the `@repo/testing`
package.
