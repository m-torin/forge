# Doppler Integration Guide

This guide explains how Doppler is integrated into the Forge monorepo for centralized secret
management.

## Overview

Doppler replaces local `.env.local` files with a centralized secret management system. All
environment variables are stored in Doppler and injected at runtime, while maintaining our existing
type-safe validation with `@t3-oss/env-nextjs` and Zod.

## Initial Setup

### 1. Install Doppler CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls https://cli.doppler.com/install.sh | sh

# Windows (via Scoop)
scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git
scoop install doppler
```

### 2. Authenticate with Doppler

```bash
# Login to Doppler (opens browser)
doppler login

# Or use a service token (for CI/CD)
export DOPPLER_TOKEN="your-service-token"
```

### 3. Clone and Setup Repository

```bash
git clone <repository-url>
cd forge
pnpm install

# Setup Doppler for the monorepo
pnpm doppler:setup
```

## Project Structure

The monorepo uses a hierarchical Doppler configuration defined in `doppler.yaml`:

- Each app has its own Doppler project (e.g., `forge-app`, `forge-web`)
- Packages with runtime secrets have their own projects (e.g., `forge-database`, `forge-auth`)
- Common secrets can be shared across projects using Doppler's secret referencing

## Development Workflow

### Running Applications

```bash
# Start all apps with Doppler
pnpm dev

# Start specific app with Doppler
pnpm dev --filter=web

# Run without Doppler (requires .env.local files)
pnpm dev:offline
```

### Running Tests

```bash
# Run all tests with Doppler
pnpm test

# Run specific package tests
pnpm test --filter=@repo/auth

# Run tests without Doppler
pnpm test:offline
```

### Database Operations

```bash
# Run migrations with Doppler
pnpm migrate

# Generate Prisma client
pnpm --filter @repo/database generate

# Open Prisma Studio
pnpm studio
```

## Environment Variable Validation

Our existing validation system remains unchanged. Each app's `env.ts` file still validates all
environment variables:

```typescript
// apps/web/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';

export const env = createEnv({
  extends: [auth(), database()],
  // ... app-specific validation
});
```

The only change is that Doppler provides these variables at runtime instead of reading from
`.env.local`.

## Offline Development

For situations where Doppler access is unavailable, use the `:offline` script variants:

```bash
pnpm dev:offline      # Uses .env.local files
pnpm build:offline    # Build without Doppler
pnpm test:offline     # Test without Doppler
```

You'll need to create `.env.local` files manually for offline development.

## CI/CD Integration

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10.6.3

      - uses: dopplerhq/cli-action@v3

      - name: Install dependencies
        run: pnpm install

      - name: Build
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_SERVICE_TOKEN }}
        run: pnpm build
```

### Vercel Deployment

1. Remove all environment variables from Vercel dashboard
2. Add single `DOPPLER_TOKEN` environment variable
3. Doppler will inject all secrets during build

## Secret Organization

### Naming Conventions

- Use UPPER_SNAKE_CASE for all secrets
- Prefix client-side variables with `NEXT_PUBLIC_`
- Group related secrets with common prefixes (e.g., `STRIPE_`, `DATABASE_`)

### Project Hierarchy

```
forge-common (shared secrets)
├── DATABASE_URL
├── BETTER_AUTH_SECRET
└── NEXT_PUBLIC_APP_URL

forge-app (inherits from forge-common)
├── STRIPE_SECRET_KEY
├── STRIPE_WEBHOOK_SECRET
└── LIVEBLOCKS_SECRET

forge-web (inherits from forge-common)
├── RESEND_TOKEN
└── GA_MEASUREMENT_ID
```

## Troubleshooting

### Common Issues

1. **"Project not found" error**

   - Run `pnpm doppler:setup` to configure project mappings
   - Ensure you're authenticated: `doppler whoami`

2. **Missing environment variables**

   - Check Doppler dashboard for the specific project/config
   - Verify the variable exists in the correct environment (dev/staging/prod)

3. **Type validation failures**
   - Environment variables in Doppler must match the Zod schema in `keys.ts`
   - Check for typos or missing required variables

### Debugging

```bash
# View current Doppler configuration
doppler configure

# List all secrets for current project
doppler secrets

# Download secrets to .env format (for debugging)
doppler secrets download --no-file --format env
```

## Security Best Practices

1. **Service Tokens**: Use scoped service tokens for CI/CD with minimal permissions
2. **Access Control**: Limit developer access to production secrets
3. **Rotation**: Regularly rotate sensitive credentials
4. **Audit Logs**: Monitor secret access through Doppler's audit logs

## Migration from .env.local

To migrate existing `.env.local` files to Doppler:

1. Upload secrets to Doppler dashboard or use CLI:

   ```bash
   doppler secrets upload .env.local
   ```

2. Verify all secrets are present:

   ```bash
   doppler secrets
   ```

3. Test the application:

   ```bash
   pnpm dev
   ```

4. Once verified, remove `.env.local` files (keep `.env.example` for documentation)

## Further Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Doppler CLI Reference](https://docs.doppler.com/docs/cli)
- [Monorepo Best Practices](https://docs.doppler.com/docs/monorepo)
