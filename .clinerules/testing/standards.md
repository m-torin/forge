# Testing Standards

## [TSTD-1] Test Generation

- **Required**: Yes
- **Summary**: Use standardized test generation tools.
- **Details**:
  - Generate tests with `pnpm -F @repo/testing generate-tests <package-path>`
  - Generate tests for all packages: `pnpm -F @repo/testing generate-tests:all`
  - This creates test files, setup files, and configuration
  - Generated tests will use the optimized direct import paths automatically
  - Generated configurations include optimized watch mode settings

## [TSTD-2] Generated Files

- **Required**: Yes
- **Summary**: Generated test files follow a standardized structure.
- **Details**:
  - `__tests__/setup.ts`: Test setup file
  - `__tests__/components/*.test.tsx`: Component tests
  - `__tests__/hooks/*.test.tsx`: Hook tests
  - `vitest.config.mjs`: Vitest configuration (if it doesn't exist)

## [TSTD-3] Test Templates

- **Required**: Yes
- **Summary**: Use standardized templates for different types of tests.
- **Details**:
  - Component tests: Test rendering and basic functionality using `render` from
    '@repo/testing/vitest'
  - Hook tests: Test initial state and state changes using `renderHook` from
    '@repo/testing/vitest'
  - Utility tests: Test correct output for various inputs
  - Environment tests: Test presence and absence of variables

## [TSTD-4] Naming Conventions

- **Required**: Yes
- **Summary**: Follow consistent naming conventions for test files.
- **Details**:
  - Test files follow the same naming convention as source files, with
    `.test.ts/tsx` appended
  - For kebab-case files, use camelCase in imports
  - Test directories mirror source directories

## [TSTD-5] Test Coverage

- **Required**: Yes
- **Summary**: Maintain adequate test coverage.
- **Details**:
  - All exported functions, components, and hooks should have at least one test
  - Environment variable handling should be tested for both presence and absence
  - Component tests should verify rendering and basic functionality
  - Hook tests should verify initial state and state changes

## [TSTD-6] Environment Values

- **Required**: Yes
- **Summary**: Use standardized test environment values.
- **Details**:
  - Clerk: `sk_test_clerk_secret_key`
  - Stripe: `sk_test_stripe_secret_key`
  - Resend: `re_test_resend_token`
  - Analytics: `G-TEST12345`
  - PostHog: `phc_test12345`
  - Database: `postgresql://postgres:postgres@localhost:5432/test`

## [TSTD-7] Test Environment

- **Required**: Yes
- **Summary**: Configure test environment properly.
- **Details**:
  - Create `.env.test` file with valid test values
  - Run tests with `NODE_ENV=test`
  - Use mock implementations for external services
  - Reset test data between test runs

## [TSTD-8] API Mocking

- **Required**: Yes
- **Summary**: Use MSW for API mocking.
- **Details**:
  - Define handlers for each API endpoint
  - Set up MSW in setup.ts
  - Use consistent mocking patterns
  - Clean up mocks after tests

## [TSTD-9] Hook Testing

- **Required**: Yes
- **Summary**: Use standardized hook testing patterns.
- **Details**:
  - Import `renderHook` directly from the vitest module:
    `import { renderHook } from '@repo/testing/vitest'`
  - Test initial state: Verify the hook's initial return values
  - Test state changes: Use `act` to trigger state changes
  - Test cleanup: Verify hooks properly clean up resources
