# Environment Configuration

## [ENV-1] File Organization

- **Required**: Yes
- **Summary**: Each application must maintain its own environment files.
- **Details**:
  - Each Next.js application MUST have its own .env files in its package
    directory
  - Root-level .env files MUST NOT contain app-specific secrets
  - Required files: `.env.local`, `.env.development`, `.env.test`,
    `.env.production`
  - All applications MUST include a `.env.test` file for CI/CD and testing

## [ENV-2] Variable Naming

- **Required**: Yes
- **Summary**: Follow consistent naming conventions for environment variables.
- **Details**:
  - Client-side variables: Prefix with `NEXT_PUBLIC_`
  - Service-specific prefixes: Group by service (e.g., `CLERK_`, `DATABASE_`)
  - Authentication: `CLERK_`, `AUTH_`
  - Database: `DATABASE_`, `POSTGRES_`
  - Email: `RESEND_`, `EMAIL_`
  - Analytics: `ANALYTICS_`, `GA_`, `POSTHOG_`
  - Payments: `STRIPE_`, `PAYMENT_`
  - Storage: `STORAGE_`, `S3_`, `CLOUDINARY_`

## [ENV-3] Documentation

- **Required**: Yes
- **Summary**: Document environment variables properly.
- **Details**:
  - Include `.env.example` file that lists all required variables
  - All variables must match the expected configuration format and naming
  - Provide clear documentation for each variable
  - Group variables by service or functionality
  - Indicate which variables are required vs. optional
  - Do not include real secrets in example files
  - Example files should use valid placeholders that mirror the expected format

## [ENV-4] Access Pattern

- **Required**: Yes
- **Summary**: Use environment validation with zod.
- **Details**:
  - Create `keys.ts` file in each package/app root that needs environment
    variables
  - Use `createEnv` from `@t3-oss/env-nextjs` to validate variables
  - Export a `keys()` function that returns the validated environment object
  - Import validated environment object instead of accessing `process.env`
    directly

## [ENV-5] Validation Pattern

- **Required**: Yes
- **Summary**: Validate all environment variables using zod.
- **Details**:
  - Support both production and test environments
  - Use `createEnv` from `@t3-oss/env-nextjs`
  - For test-aware validation, import `createTestAwareValidator` from
    `@repo/testing/env`
  - Use zod validation rules appropriate to the variable type
  - Include clear validation error messages
  - Follow service-specific validation rules in [ENV-6]

## [ENV-6] Service-Specific Validation

- **Required**: Yes
- **Summary**: Apply specific validation rules for different services.
- **Details**:
  - Clerk Auth: Production `sk_live_`, Test `sk_test_`
  - Stripe: Production `sk_live_`, Test `sk_test_`
  - Resend: Production `re_`, Test `re_test_`
  - Analytics: Production `G-`, Test `G-TEST`
  - PostHog: Production `phc_`, Test `phc_test`
  - Other services: See `config/security.md`

## [ENV-7] Test Environment

- **Required**: Yes
- **Summary**: Configure test environments properly.
- **Details**:
  - Create `.env.test` file with valid test values
  - Use test prefixes for API keys
  - Run tests with `NODE_ENV=test`
  - Use mock implementations for external services
  - See `testing/standards.md` for more details
