# Doppler Setup for Web App

This document explains how to use Doppler with the web app for secret management.

## Prerequisites

1. Install Doppler CLI: https://docs.doppler.com/docs/install-cli
2. Authenticate with Doppler: `doppler login`
3. Ensure you have access to the `next-apps` project

## Development Setup

### Option 1: Using Doppler (Recommended for team development)

```bash
# Pull all secrets to .env.local
pnpm doppler:pull

# Run development server with Doppler
pnpm dev
```

### Option 2: Local Development (without Doppler)

```bash
# Copy .env.example to .env.local and fill in your values
cp .env.example .env.local

# Run development server without Doppler
pnpm dev:local
```

## Available Scripts

- `pnpm dev` - Run development server with Doppler
- `pnpm dev:local` - Run development server without Doppler (uses .env.local)
- `pnpm build` - Build with Doppler
- `pnpm build:local` - Build without Doppler
- `pnpm start` - Start production server with Doppler
- `pnpm start:local` - Start production server without Doppler

## Doppler Helper Scripts

- `pnpm doppler:pull` - Download secrets to .env.local
- `pnpm doppler:secrets` - View secrets in Doppler
- `pnpm doppler:open` - Open Doppler project in browser
- `pnpm doppler:secrets:upload` - Upload .env.local to Doppler (use with caution)

## Troubleshooting

### "doppler: command not found"

Install Doppler CLI:
```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh
```

### "Could not find project"

The web app uses the `next-apps` project with `webapp` config. Ensure you have access:
```bash
doppler projects
```

### "No .env.local file found"

Either pull from Doppler:
```bash
pnpm doppler:pull
```

Or create from example:
```bash
cp .env.example .env.local
```

## Environment Variables

The web app requires these environment variables (see .env.example for full list):

- `NEXT_PUBLIC_APP_URL` - Application URL
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- Various API keys for services (Stripe, Analytics, etc.)

## CI/CD

In CI/CD environments, Doppler is configured automatically. The build commands use Doppler by default:
- `pnpm build` - Uses Doppler
- `pnpm build:local` - For local builds without Doppler