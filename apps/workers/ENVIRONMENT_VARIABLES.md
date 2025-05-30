# Complete Environment Variables List for Forge Monorepo

This document contains a comprehensive list of all environment variables used across the forge
monorepo, organized by package/app.

## Core/Next.js Configuration

- `NEXT_PUBLIC_APP_URL` - The public URL of your app (required)
- `NEXT_PUBLIC_WEB_URL` - The public URL of your website (required)
- `NEXT_PUBLIC_API_URL` - The public URL of your API (optional)
- `NEXT_PUBLIC_DOCS_URL` - The public URL of your documentation (optional)
- `ANALYZE` - Enable bundle analysis (optional)
- `NEXT_RUNTIME` - Next.js runtime (nodejs/edge) (optional)
- `NODE_ENV` - Node environment (development/production)

## Authentication (@repo/auth)

- `BETTER_AUTH_SECRET` - Secret key for Better Auth (required)
- `DATABASE_URL` - PostgreSQL database connection URL (required)
- `NEXT_PUBLIC_APP_URL` - Used by auth for redirect URLs (required)

## Database (@repo/database)

- `DATABASE_URL` - PostgreSQL database connection URL (optional if using Firestore)
- `DATABASE_PROVIDER` - Database provider: 'prisma' or 'firestore' (default: 'prisma')
- `FIREBASE_PROJECT_ID` - Firebase project ID (optional, required if using Firestore)
- `FIREBASE_CLIENT_EMAIL` - Firebase client email (optional, required if using Firestore)
- `FIREBASE_PRIVATE_KEY` - Firebase private key (optional, required if using Firestore)

## Email (@repo/email)

- `RESEND_TOKEN` - Resend API token (required in production)
- `RESEND_FROM` - Default from email address (required in production)

## Analytics (@repo/analytics)

- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key (required in production)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog API host URL (required in production)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID (optional)

## Observability (@repo/observability)

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking (required in production)
- `SENTRY_ORG` - Sentry organization slug (required in production)
- `SENTRY_PROJECT` - Sentry project slug (required in production)
- `BETTERSTACK_API_KEY` - Better Stack API key (required in production)
- `BETTERSTACK_URL` - Better Stack URL (required in production)

## Payments (@repo/payments)

- `STRIPE_SECRET_KEY` - Stripe secret key (required in production)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (required in production)

## Storage (@repo/storage)

- `STORAGE_PROVIDER` - Storage provider: 'vercel-blob' or 'cloudflare-r2' (required in production)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob read/write token (optional)
- `R2_ACCOUNT_ID` - Cloudflare R2 account ID (optional)
- `R2_BUCKET` - Cloudflare R2 bucket name (optional)
- `R2_ACCESS_KEY_ID` - Cloudflare R2 access key ID (optional)
- `R2_SECRET_ACCESS_KEY` - Cloudflare R2 secret access key (optional)

## Feature Flags (@repo/feature-flags)

- `FLAGS_SECRET` - Feature flags secret key (required in production)

## Rate Limiting (@repo/rate-limit)

- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (required in production)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (required in production)

## Security (@repo/security)

- `ARCJET_KEY` - Arcjet security key (optional)

## Notifications (@repo/notifications)

- `KNOCK_SECRET_API_KEY` - Knock.app secret API key (optional)
- `NEXT_PUBLIC_KNOCK_API_KEY` - Knock.app public API key (optional)
- `NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID` - Knock.app feed channel ID (optional)

## Webhooks (@repo/webhooks)

- `SVIX_TOKEN` - Svix webhook service token (required in production)

## Collaboration (@repo/collaboration)

- `LIVEBLOCKS_SECRET` - Liveblocks secret key (optional)

## AI (@repo/ai)

- `OPENAI_API_KEY` - OpenAI API key (required in production if using AI features)

## Workers App Specific

### QStash/Upstash (Required for workers)

- `QSTASH_TOKEN` - QStash API token (required)
- `QSTASH_URL` - QStash URL (optional, default: https://qstash.upstash.io)
- `QSTASH_CURRENT_SIGNING_KEY` - Current QStash signing key (optional)
- `QSTASH_NEXT_SIGNING_KEY` - Next QStash signing key (optional)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (required)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (required)
- `UPSTASH_WORKFLOW_URL` - Upstash workflow URL (optional)

### Orchestration - AI Integration

- `ANTHROPIC_API_KEY` - Anthropic API key (optional)
- `ANTHROPIC_MODEL` - Anthropic model to use (optional, default: claude-3-sonnet-20240229)
- `ANTHROPIC_MAX_TOKENS` - Max tokens for Anthropic (optional, default: 1000)
- `ANTHROPIC_TEMPERATURE` - Temperature for Anthropic (optional, default: 0.1)
- `ANTHROPIC_BASE_URL` - Anthropic base URL (optional, default: https://api.anthropic.com)

### Orchestration - Dead Letter Queues

- `AI_DLQ_ENDPOINT` - AI workflow DLQ endpoint (optional)
- `SAAS_DLQ_ENDPOINT` - SaaS workflow DLQ endpoint (optional)
- `EVENT_DLQ_ENDPOINT` - Event workflow DLQ endpoint (optional)
- `PIPELINE_FAILURE_WEBHOOK_URL` - Pipeline failure webhook URL (optional)
- `ORDER_FAILURE_WEBHOOK_URL` - Order failure webhook URL (optional)

### Orchestration - SaaS Operations

- `SAAS_API_BASE` - SaaS API base URL (optional)
- `SAAS_API_TOKEN` - SaaS API token (optional)
- `BILLING_API_BASE` - Billing API base URL (optional)
- `BILLING_API_TOKEN` - Billing API token (optional)
- `FEATURE_FLAGS_API` - Feature flags API URL (optional)
- `FEATURE_FLAGS_TOKEN` - Feature flags API token (optional)

### Orchestration - External Services

- `EMAIL_SERVICE_URL` - Email service URL (optional)
- `EMAIL_SERVICE_TOKEN` - Email service token (optional)
- `ANALYTICS_API` - Analytics API URL (optional)
- `SEARCH_API` - Search API URL (optional)
- `CDN_API` - CDN API URL (optional)
- `SCRAPING_API_URL` - Scraping API URL (optional)
- `SCRAPING_API_KEY` - Scraping API key (optional)

### Orchestration - Development

- `SKIP_WORKFLOW_DEDUPLICATION` - Skip workflow deduplication (optional)
- `SKIP_AUTO_APPROVAL` - Skip auto approval (optional)
- `WORKFLOW_DEV_MODE` - Enable workflow dev mode (optional)

### Orchestration - Redis (for production)

- `REDIS_URL` - Redis URL for production (optional)
- `REDIS_TOKEN` - Redis token for production (optional)

### Orchestration - Payments

- `STRIPE_KEY` - Stripe publishable key (optional)
- `STRIPE_SECRET_KEY` - Stripe secret key (optional)

## Email App Specific (React Email)

- `EMAILS_DIR_RELATIVE_PATH` - Relative path to emails directory (internal)
- `USER_PROJECT_LOCATION` - User project location (internal)
- `EMAILS_DIR_ABSOLUTE_PATH` - Absolute path to emails directory (internal)
- `NEXT_PUBLIC_IS_BUILDING` - Is building flag (internal)
- `NEXT_PUBLIC_IS_PREVIEW_DEVELOPMENT` - Is preview development flag (internal)

## Vercel Platform Variables (Auto-injected)

- `VERCEL` - Is running on Vercel
- `VERCEL_ENV` - Vercel environment (production/preview/development)
- `VERCEL_URL` - Deployment URL
- `VERCEL_REGION` - Deployment region
- `VERCEL_GIT_PROVIDER` - Git provider
- `VERCEL_GIT_REPO_SLUG` - Git repository slug
- `VERCEL_GIT_REPO_OWNER` - Git repository owner
- `VERCEL_GIT_REPO_ID` - Git repository ID
- `VERCEL_GIT_COMMIT_REF` - Git commit ref
- `VERCEL_GIT_COMMIT_SHA` - Git commit SHA
- `VERCEL_GIT_COMMIT_MESSAGE` - Git commit message
- `VERCEL_GIT_COMMIT_AUTHOR_LOGIN` - Git commit author
- `VERCEL_GIT_COMMIT_AUTHOR_NAME` - Git commit author name

## Notes

1. **Required vs Optional**: Variables marked as "required" are essential for the feature to work.
   Variables marked as "required in production" can be omitted in development but must be set for
   production deployments.

2. **Package-specific**: Some environment variables are only needed if you're using specific
   packages. For example, you only need `OPENAI_API_KEY` if you're using the AI package features.

3. **Default Values**: Some variables have defaults in development mode (see orchestration package).

4. **Security**: Never commit actual values of these environment variables to your repository. Use
   `.env.local` for local development and configure them in your deployment platform for production.

5. **Validation**: All environment variables are validated using `@t3-oss/env-nextjs` with Zod
   schemas, ensuring type safety and proper error messages if variables are missing.
