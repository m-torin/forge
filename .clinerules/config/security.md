# Security Practices

## [SEC-1] Secret Management

- **Required**: Yes
- **Summary**: Never commit secrets to the repository.
- **Details**:
  - NEVER commit real secrets or credentials to the repository
  - Use `.gitignore` to exclude all `.env.local` and other environment-specific
    files
  - If a secret is accidentally committed, consider it compromised and rotate it
    immediately
  - Use different secret values for each environment

## [SEC-2] CI/CD Security

- **Required**: Yes
- **Summary**: Secure environment variables in CI/CD systems.
- **Details**:
  - Store environment variables securely in CI/CD systems
  - Use environment variable encryption for CI/CD pipelines
  - Never print environment variables in CI/CD logs
  - Use secret management services (e.g., GitHub Secrets, Vercel Environment
    Variables)

## [SEC-3] Access Control

- **Required**: Yes
- **Summary**: Follow principle of least privilege for secrets.
- **Details**:
  - Only provide access to secrets on a need-to-know basis
  - Use role-based access control for secret management
  - Regularly audit who has access to which secrets
  - Revoke access immediately when no longer needed

## [SEC-4] Secure Implementation

- **Required**: Yes
- **Summary**: Validate environment variables and access them securely.
- **Details**:
  - Validate all environment variables at application startup
  - Fail fast if required variables are missing or invalid
  - Log appropriate error messages without exposing sensitive values
  - See `config/environment.md` for validation patterns

## [SEC-5] Secure Access

- **Required**: Yes
- **Summary**: Access environment variables through validated objects.
- **Details**:
  - Always access environment variables through the validated env object
  - Never use `process.env` directly in application code
  - Never log environment variables or secrets
  - Import from env.ts: `import { env } from './env'`

## [SEC-6] Sensitive Data Handling

- **Required**: Yes
- **Summary**: Handle sensitive data according to best practices.
- **Details**:
  - Database: Use connection pooling, consider IAM authentication
  - API Keys: Use scoped API keys with minimal permissions
  - Authentication: Keep provider secrets secure, rotate regularly
  - Tokens: Store securely, implement expiration

## [SEC-7] Test Values

- **Required**: Yes
- **Summary**: Use standardized format for test credentials.
- **Details**:
  - Clerk: `sk_test_clerk_` prefix
  - Stripe: `sk_test_` prefix
  - Resend: `re_test_` prefix
  - PostHog: `phc_test` prefix
  - See `testing/standards.md` for complete format reference

## [SEC-8] Incident Response

- **Required**: Yes
- **Summary**: Have a plan for security incidents.
- **Details**:
  - If a secret is exposed, rotate it immediately
  - Document the incident and remediation steps
  - Review security practices regularly
  - Use tools like git-secrets to prevent committing secrets
