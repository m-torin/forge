# Testing Configuration

## [TEST-1] Configuration Extension

- **Required**: Yes
- **Summary**: All projects must extend testing configuration from
  `@repo/testing`.
- **Details**:
  - Projects with Vitest must use configuration from `@repo/testing`
  - Projects with Cypress must extend base configuration
  - This ensures consistent testing behavior across the monorepo

## [TEST-2] Vitest Configuration

- **Required**: Yes
- **Summary**: Use standardized Vitest configuration.
- **Details**:
  - Configuration must be in a file named `vitest.config.mjs` (must use `.mjs`
    extension for TypeScript ESM compatibility)
  - Regular packages:
    `import { generateBaseConfig } from '@repo/testing/generators'`
  - React packages:
    `import { generateReactConfig } from '@repo/testing/generators'`
  - Mantine packages:
    `import { generateReactConfig } from '@repo/testing/generators'`
  - Pass in package-specific overrides and `__dirname`
  - All generated configurations include optimized watch mode settings for
    faster feedback during development

## [TEST-3] Cypress Configuration

- **Required**: Yes
- **Summary**: Use standardized Cypress configuration.
- **Details**:
  - E2E testing: `import { createE2EConfig } from '@repo/testing/cypress'`
  - Component testing:
    `import { createComponentConfig } from '@repo/testing/cypress'`
  - Pass in project-specific overrides
  - All configurations include optimized performance settings for faster test
    execution

## [TEST-4] Test Setup

- **Required**: Yes
- **Summary**: Use standardized test setup files.
- **Details**:
  - Import base setup: `import '@repo/testing/shared'`
  - Add project-specific setup after importing base setup
  - Place in `__tests__/setup.ts`

## [TEST-5] Test Utilities

- **Required**: Yes
- **Summary**: Use testing helpers and utilities from `@repo/testing`.
- **Details**:
  - React components:
    `import { render, screen, renderHook } from '@repo/testing/vitest'`
  - Mantine components:
    `import { render as mantineRender, screen } from '@repo/testing/vitest/mantine'`
  - Server components:
    `import { createServerConfig } from '@repo/testing/vitest/server'`
  - Environment variable mocking:
    `import { mockEnvVars } from '@repo/testing/shared'`

## [TEST-6] Environment Mocking

- **Required**: Yes
- **Summary**: Use shared environment variable mocking utilities.
- **Details**:
  - Import mocking utilities:
    `import { mockEnvVars, restoreConsoleMocks } from '@repo/testing/shared'`
  - Use predefined test values:
    `import { testEnvVars, setupAllTestEnvVars } from '@repo/testing/shared'`
  - Clean up mocks after tests

## [TEST-7] Test Environment

- **Required**: Yes
- **Summary**: Configure test environments properly.
- **Details**:
  - Each application must include a `.env.test` file
  - Run tests with `NODE_ENV=test`
  - Use test credentials with appropriate prefixes
  - Vitest will fall back to `.env.example` if `.env.test` is not available
  - See `config/environment.md` for details
