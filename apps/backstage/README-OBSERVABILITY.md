# Observability & Sentry Integration

This document explains how observability and Sentry error tracking are integrated into the Backstage app.

## Overview

The backstage app uses the `@repo/observability` package to provide comprehensive monitoring, error tracking, and performance insights through Sentry integration.

## Features

- **Error Tracking**: Automatic capture of exceptions and errors
- **Performance Monitoring**: Transaction and span tracking for API calls
- **Session Replay**: Record user sessions for debugging (production only)
- **Error Boundaries**: React error boundaries to catch and report UI errors
- **Source Maps**: Automatic source map uploading for better error debugging

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Client-side Sentry DSN (public)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id

# Server-side Sentry configuration
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### Next.js Configuration

The `next.config.ts` is configured with Sentry:

```typescript
import { withObservability } from '@repo/observability/server/next';

export default withObservability(nextConfig, {
  sentry: {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    silent: !process.env.CI,
    tunnelRoute: '/monitoring',
    automaticVercelMonitors: true,
  },
});
```

## Usage

### Client-Side Error Tracking

Use the `useObservability` hook in components:

```typescript
import { useObservability } from '@repo/observability/client/next';

function MyComponent() {
  const observability = useObservability();

  const handleError = (error: Error) => {
    observability?.captureException(error, {
      tags: { component: 'MyComponent' },
      extra: { timestamp: Date.now() }
    });
  };
}
```

### Server-Side Error Tracking

In API routes and server components:

```typescript
import { createServerObservability } from '@repo/observability/server/next';

export async function GET(request: Request) {
  const observability = await createServerObservability();
  const transaction = observability.startTransaction('api_request');

  try {
    // Your API logic
    transaction?.setStatus('ok');
  } catch (error) {
    transaction?.setStatus('internal_error');
    observability.captureException(error as Error);
    throw error;
  } finally {
    transaction?.finish();
  }
}
```

### Performance Monitoring

Track specific operations:

```typescript
import { usePerformanceTracking } from '@/app/components/performance-monitor';

function MyComponent() {
  const { trackOperation } = usePerformanceTracking('user_action');

  const handleClick = async () => {
    await trackOperation(
      async () => {
        // Your operation
      },
      {
        description: 'User clicked button',
        tags: { action: 'button_click' }
      }
    );
  };
}
```

### Error Boundaries

The app uses error boundaries to catch React errors:

```typescript
import { ErrorBoundary } from '@/app/components/error-boundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

## Components

### ObservabilityProvider

Configured in the root layout (`app/layout.tsx`) to provide observability context throughout the app.

### PerformanceMonitor

Automatically tracks page navigations and renders. Added to the authenticated layout.

### ErrorBoundary

Catches React errors and reports them to Sentry. Provides user-friendly error UI.

## API Integration

All API routes can use observability for tracking:

1. Import `createServerObservability`
2. Create a transaction for the request
3. Set appropriate status and data
4. Capture exceptions in catch blocks
5. Always finish the transaction in finally block

## Best Practices

1. **Tag Errors Appropriately**: Use meaningful tags to categorize errors
2. **Add Context**: Include relevant data in error reports
3. **Track Key Operations**: Monitor important user actions and API calls
4. **Use Transactions**: Group related operations into transactions
5. **Set User Context**: Associate errors with user sessions when applicable

## Development vs Production

- **Development**: Minimal sampling, debug mode enabled
- **Production**: 10% session replay, 10% transaction sampling
- **Source Maps**: Only uploaded in production builds

## Monitoring Dashboard

View your application's health in the Sentry dashboard:
1. Error rates and trends
2. Performance metrics
3. User session replays
4. Release tracking
5. Custom alerts and notifications

## Troubleshooting

If Sentry is not working:
1. Check environment variables are set correctly
2. Verify DSN format is correct
3. Ensure `instrumentation.ts` exists in the root
4. Check browser console for Sentry initialization errors
5. Verify network requests to Sentry are not blocked