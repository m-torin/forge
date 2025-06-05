# Migration Guide: @repo/observability → @repo/observability-new

This guide helps you migrate from the original observability package to the new multi-provider architecture.

## Key Changes

### 1. Provider-Based Architecture

**Old:**
```typescript
import { initializeSentry } from '@repo/observability/client';
import { log } from '@repo/observability';

initializeSentry();
log.info('Hello');
```

**New:**
```typescript
import { createClientObservability } from '@repo/observability-new/client';

const observability = await createClientObservability({
  providers: {
    sentry: { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN },
    logtail: { sourceToken: process.env.LOGTAIL_TOKEN }
  }
});

observability.log('info', 'Hello');
```

### 2. Configuration

**Old (env-based):**
```typescript
// keys.ts handles environment variables
// Providers are always initialized if env vars exist
```

**New (config-based):**
```typescript
const config = {
  providers: {
    // Only configure what you want to use
    sentry: { 
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1
    },
    logtail: {
      sourceToken: process.env.LOGTAIL_TOKEN
    }
  }
};
```

### 3. Error Handling

**Old:**
```typescript
import { parseError } from '@repo/observability';

const message = parseError(error); // Automatically sends to Sentry
```

**New:**
```typescript
import { parseAndCaptureError } from '@repo/observability-new/client';

const message = await parseAndCaptureError(error, observability, {
  component: 'MyComponent'
});
```

### 4. React Hooks

**Old:**
```typescript
import { useObservability } from '@repo/observability';

const { trackEvent, trackError } = useObservability();
```

**New:**
```typescript
import { ObservabilityProvider, useObservability } from '@repo/observability-new/client';

// Wrap your app
<ObservabilityProvider config={config}>
  <App />
</ObservabilityProvider>

// Use in components
const { trackEvent, trackError, manager } = useObservability();
```

### 5. Next.js Configuration

**Old:**
```typescript
// next.config.js
import { withSentry, withLogging } from '@repo/observability';

export default withLogging(withSentry(nextConfig));
```

**New:**
```typescript
// next.config.js
import { withObservability } from '@repo/observability-new/next/config';

export default withObservability(nextConfig, {
  sentry: {
    org: 'my-org',
    project: 'my-project'
  },
  logtail: true
});
```

## Step-by-Step Migration

### 1. Update Dependencies

```json
{
  "dependencies": {
    - "@repo/observability": "workspace:*"
    + "@repo/observability-new": "workspace:*"
  }
}
```

### 2. Update Initialization

Create a centralized observability setup:

```typescript
// lib/observability.ts
import { createClientObservability } from '@repo/observability-new/client';
import { createServerObservability } from '@repo/observability-new/server';

export async function getClientObservability() {
  return createClientObservability({
    providers: {
      sentry: { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN },
      logtail: { sourceToken: process.env.NEXT_PUBLIC_LOGTAIL_TOKEN }
    }
  });
}

export async function getServerObservability() {
  return createServerObservability({
    providers: {
      sentry: { dsn: process.env.SENTRY_DSN },
      logtail: { sourceToken: process.env.LOGTAIL_TOKEN },
      pino: { level: 'info' }
    }
  });
}
```

### 3. Update React Components

```typescript
// _app.tsx or layout.tsx
import { ObservabilityProvider } from '@repo/observability-new/client';
import { observabilityConfig } from '@/lib/observability-config';

export default function App({ Component, pageProps }) {
  return (
    <ObservabilityProvider config={observabilityConfig}>
      <Component {...pageProps} />
    </ObservabilityProvider>
  );
}
```

### 4. Update API Routes

```typescript
// pages/api/example.ts or app/api/example/route.ts
import { getServerObservability } from '@/lib/observability';

export async function GET(request: Request) {
  const observability = await getServerObservability();
  
  try {
    // Your logic
  } catch (error) {
    await observability.captureException(error as Error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Environment Variables Mapping

| Old Variable | New Usage |
|--------------|-----------|
| `NEXT_PUBLIC_SENTRY_DSN` | `config.providers.sentry.dsn` |
| `SENTRY_ORG` | `withSentry` options |
| `SENTRY_PROJECT` | `withSentry` options |
| `BETTERSTACK_API_KEY` | `config.providers.logtail.sourceToken` |

## Breaking Changes

1. **No automatic initialization** - You must explicitly create observability instances
2. **No global `log` object** - Use `observability.log()` instead
3. **Async initialization** - Most creation functions are now async
4. **Provider configuration required** - No implicit provider loading based on env vars

## Benefits After Migration

1. **Flexibility** - Choose which providers to use per environment
2. **Type Safety** - Full TypeScript support with provider-specific types
3. **Better Testing** - Easy to mock with console provider
4. **Performance** - Only load providers you actually use
5. **Extensibility** - Easy to add new providers without changing core code

## Gradual Migration

You can run both packages side-by-side during migration:

```typescript
// Use old package for existing code
import { log as oldLog } from '@repo/observability';

// Use new package for new code
import { createClientObservability } from '@repo/observability-new/client';

// Gradually migrate features
const newObservability = await createClientObservability(config);
```

## Need Help?

- Check the [README](./README.md) for usage examples
- Review the type definitions for available options
- The console provider is great for debugging configuration issues