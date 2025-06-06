# Workers App

Background job processing and workflow management application built with Next.js and Upstash QStash.

## Features

- 🔄 Workflow orchestration with Upstash QStash
- 📊 Real-time workflow monitoring via Server-Sent Events (SSE)
- 🎯 Multiple workflow templates (Basic, Kitchen Sink, Image Processing, etc.)
- 🔐 Authenticated access with Better Auth
- 📈 Workflow analytics and status tracking

## Development

### Prerequisites

- Node.js 22+
- pnpm 10.6.3+
- PostgreSQL database
- Optional: Doppler CLI for secret management

### Local Development Setup

1. **Copy environment variables**:

   ```bash
   cp .env.local.example .env.local
   ```

2. **Update `.env.local`** with your values:

   - Database URL (required)
   - Auth secrets (required)
   - Other services as needed

3. **Run without Doppler** (recommended for local testing):

   ```bash
   pnpm dev:local
   ```

   This starts both Next.js (port 3400) and QStash CLI (port 8080) locally.

4. **Run with Doppler** (for production-like environment):
   ```bash
   pnpm doppler:pull  # Download secrets to .env.local
   pnpm dev          # Run with Doppler
   ```

### Available Scripts

```bash
# Development
pnpm dev:local    # Local development without Doppler
pnpm dev          # Development with Doppler

# Building
pnpm build:local  # Build without Doppler
pnpm build        # Build with Doppler

# Testing
pnpm test         # Run tests
pnpm test:e2e     # Run end-to-end tests

# Other
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript type checking
```

## Workflow Development

### Creating a New Workflow

1. Create a new directory in `app/workflows/[workflow-name]/`
2. Add `definition.ts` with your workflow logic
3. The workflow will automatically be available at `/api/workflows/[workflow-name]`

Example workflow structure:

```typescript
const workflowDefinition = {
  metadata: {
    id: 'my-workflow',
    title: 'My Workflow',
    description: 'Description of what it does',
    // ... other metadata
  },
  defaultPayload: {
    // Default input values
  },
  workflow: async (context) => {
    // Step 1
    const result1 = await context.run('step-1', async () => {
      // Step logic
      return { data: 'result' };
    });

    // Step 2
    const result2 = await context.run('step-2', async () => {
      // Use previous step data
      return { processed: result1.data };
    });

    return { success: true, results: [result1, result2] };
  },
};
```

### Testing Workflows Locally

1. Start the development server:

   ```bash
   pnpm dev:local
   ```

2. Navigate to http://localhost:3400

3. Click "Verify Setup" to ensure QStash is configured correctly

4. Trigger workflows from the dashboard or via API:
   ```bash
   curl -X POST http://localhost:3400/api/workflows/basic \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

## Troubleshooting

### Workflows stuck in STEP_RETRY

- Ensure QStash CLI is running (check for port 8080)
- Verify environment variables match QStash CLI output
- Check console logs for detailed error messages
- Try the "Verify Setup" button on the dashboard

### Environment Variable Issues

- Use `pnpm dev:local` to bypass Doppler complexity
- Check `/api/debug-env` endpoint to verify loaded variables
- Ensure `.env.local` has all required variables

### Database Connection

- Verify `DATABASE_URL` is correct
- For local PostgreSQL: `postgresql://user:password@localhost:5432/workers_dev`
- Run migrations: `pnpm --filter @repo/database migrate`

## Architecture

- **Framework**: Next.js 15.4.0 with App Router
- **Workflows**: Upstash QStash + Workflow SDK
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth with organization support
- **UI**: Mantine UI v8
- **Real-time**: Server-Sent Events for workflow monitoring
