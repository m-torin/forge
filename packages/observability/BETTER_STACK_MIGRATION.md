# Better Stack Migration Guide

This guide helps you migrate from the basic Logtail provider to the enhanced Better Stack provider, or set up Better Stack for the first time.

## Overview

The Better Stack provider extends the original Logtail provider with:

- Enhanced error tracking and performance monitoring
- Rich metadata and context management
- Advanced features like sampling, filtering, and offline buffering
- Better integration with Next.js and Vercel
- Custom middleware support
- Internal metrics and monitoring

## Migration from Logtail

### Configuration Changes

**Before (Logtail):**
```typescript
{
  logtail: {
    sourceToken: 'your-token',
    application: 'my-app',
    environment: 'production',
    sendLogsToConsoleInDev: true
  }
}
```

**After (Better Stack):**
```typescript
{
  'better-stack': {
    sourceToken: 'your-token',
    application: 'my-app',
    environment: 'production',
    sendLogsToConsoleInDev: true,
    
    // New features
    captureErrors: true,
    captureRejections: true,
    sampleRate: 0.1,
    ignorePatterns: ['health-check'],
    globalTags: { service: 'api' },
    bufferOffline: true
  }
}
```

### Import Changes

**Before:**
```typescript
import type { LogtailConfig } from '@repo/observability/server';
```

**After:**
```typescript
import type { BetterStackConfig } from '@repo/observability/server';
// LogtailConfig still available for backward compatibility
```

### Provider Key

You can use either provider key:
- `'better-stack'` (recommended)
- `'logtail'` (backward compatibility alias)

Both point to the same enhanced Better Stack provider.

## New Features Setup

### Error Capturing

Automatically capture uncaught exceptions and unhandled promise rejections:

```typescript
{
  'better-stack': {
    sourceToken: 'your-token',
    captureErrors: true,        // Capture uncaught exceptions
    captureRejections: true,    // Capture unhandled promise rejections
    captureConsole: false,      // Optionally capture console.log calls
  }
}
```

### Sampling and Filtering

Control log volume and noise:

```typescript
{
  'better-stack': {
    sourceToken: 'your-token',
    sampleRate: 0.1,           // Only log 10% of events
    ignorePatterns: [          // Ignore logs matching these patterns
      'health-check',
      'heartbeat-.*',
      'favicon.ico'
    ]
  }
}
```

### Global Context

Add consistent metadata to all logs:

```typescript
{
  'better-stack': {
    sourceToken: 'your-token',
    defaultContext: {
      service: 'api',
      datacenter: 'us-east-1',
      version: '1.0.0'
    },
    globalTags: {
      team: 'backend',
      component: 'observability'
    }
  }
}
```

### Performance Monitoring

Enable transaction and span tracking:

```typescript
{
  'better-stack': {
    sourceToken: 'your-token',
    enableTracing: true,
    enableMetrics: true,
    performanceThreshold: 1000  // Log slow operations > 1s
  }
}
```

## Environment-Specific Configuration

### Development

```typescript
{
  'better-stack': {
    sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN || '',
    sendLogsToConsoleInDev: true,
    sampleRate: 1.0,           // Log everything in dev
    captureConsole: true,      // Capture console.log for debugging
    bufferOffline: false,      // Don't buffer in dev
  }
}
```

### Staging

```typescript
{
  'better-stack': {
    sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,
    environment: 'staging',
    sampleRate: 0.5,           // 50% sampling
    captureErrors: true,
    bufferOffline: true,
    ignorePatterns: ['health-check']
  }
}
```

### Production

```typescript
{
  'better-stack': {
    sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,
    environment: 'production',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    sampleRate: 0.1,           // 10% sampling
    captureErrors: true,
    captureRejections: true,
    bufferOffline: true,
    maxBufferSize: 1000,
    ignorePatterns: [
      'health-check',
      'heartbeat-.*',
      'metrics-.*'
    ],
    globalTags: {
      environment: 'production',
      region: process.env.VERCEL_REGION
    }
  }
}
```

## Advanced Usage

### Custom Middleware

Add custom processing to all logs:

```typescript
const observability = await createServerObservability({
  providers: {
    'better-stack': {
      sourceToken: 'your-token',
      // ... other config
    }
  }
});

// Add custom middleware (Better Stack specific)
if ('use' in observability) {
  observability.use((log) => ({
    ...log,
    requestId: getCurrentRequestId(),
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId()
  }));
}
```

### Metrics Monitoring

Monitor internal metrics:

```typescript
// Get current metrics (Better Stack specific)
if ('getMetrics' in observability) {
  const metrics = observability.getMetrics();
  console.log('Logs sent:', metrics.logsCount);
  console.log('Errors captured:', metrics.errorsCount);
  console.log('Buffer size:', metrics.bufferSize);
}
```

### Manual Flushing

Force flush pending logs:

```typescript
// Flush pending logs (Better Stack specific)
if ('flush' in observability) {
  await observability.flush();
}
```

## Next.js Integration

### API Routes

```typescript
// pages/api/example.ts or app/api/example/route.ts
import { createServerObservability } from '@repo/observability/server';

const observability = await createServerObservability({
  providers: {
    'better-stack': {
      sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,
      application: 'nextjs-api',
      environment: process.env.VERCEL_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      integrateWithNextjs: true,
      integrateWithVercel: true
    }
  }
});

export async function POST(request: Request) {
  const transaction = observability.startTransaction('api-request', {
    method: 'POST',
    endpoint: '/api/example'
  });

  try {
    // Your API logic here
    const result = await processRequest(request);
    
    transaction.setTag('status', 'success');
    return Response.json(result);
  } catch (error) {
    await observability.captureException(error as Error, {
      requestId: request.headers.get('x-request-id'),
      endpoint: '/api/example'
    });
    
    transaction.setTag('status', 'error');
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    transaction.finish();
  }
}
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import { useEffect } from 'react';
import { createClientObservability } from '@repo/observability/client';

export function GlobalErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    // Note: Better Stack is server-only, use Sentry for client-side errors
    createClientObservability({
      providers: {
        sentry: { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN }
      }
    }).then(obs => {
      obs.captureException(error, {
        level: 'error',
        tags: { source: 'error-boundary' }
      });
    });
  }, [error]);

  return <div>Something went wrong!</div>;
}
```

## Best Practices

### 1. Environment-based Configuration

Use different configurations for different environments:

```typescript
function getBetterStackConfig(): BetterStackConfig {
  const base = {
    sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,
    application: 'my-app',
    environment: process.env.NODE_ENV
  };

  switch (process.env.NODE_ENV) {
    case 'development':
      return { ...base, sampleRate: 1.0, captureConsole: true };
    case 'production':
      return { ...base, sampleRate: 0.1, ignorePatterns: ['health'] };
    default:
      return base;
  }
}
```

### 2. Structured Logging

Use consistent log structure:

```typescript
await observability.log('info', 'User action performed', {
  userId: user.id,
  action: 'profile_update',
  metadata: {
    fields_changed: ['email', 'name'],
    previous_values: { email: oldEmail }
  },
  performance: {
    duration: Date.now() - startTime
  }
});
```

### 3. Error Context

Provide rich context for errors:

```typescript
try {
  await riskyOperation();
} catch (error) {
  await observability.captureException(error as Error, {
    level: 'error',
    userId: user.id,
    operation: 'risky_operation',
    extra: {
      input_parameters: parameters,
      system_state: getSystemState(),
      correlation_id: correlationId
    },
    tags: {
      critical: true,
      retry_count: retryCount
    }
  });
  throw error;
}
```

### 4. Performance Monitoring

Track important operations:

```typescript
const transaction = observability.startTransaction('database_migration', {
  migration_name: 'add_user_preferences',
  database: 'primary'
});

const querySpan = observability.startSpan('execute_query', transaction);
querySpan.setTag('table', 'users');
querySpan.setTag('operation', 'ALTER');

try {
  await executeQuery();
  querySpan.setTag('status', 'success');
} catch (error) {
  querySpan.setTag('status', 'error');
  throw error;
} finally {
  querySpan.finish();
  transaction.finish();
}
```

## Troubleshooting

### Common Issues

1. **Logs not appearing in Better Stack**
   - Check source token is correct
   - Verify network connectivity
   - Check sampling rate (set to 1.0 for testing)

2. **Too many logs**
   - Implement sampling (`sampleRate: 0.1`)
   - Add ignore patterns for noisy endpoints
   - Use appropriate log levels

3. **Performance impact**
   - Enable offline buffering
   - Increase batch size
   - Use async logging patterns

### Debug Mode

Enable debug mode to see what's happening:

```typescript
{
  debug: true,
  providers: {
    'better-stack': {
      sourceToken: 'your-token',
      // ... other config
    }
  },
  onInfo: (message) => console.log('Observability:', message),
  onError: (error, context) => console.error('Observability error:', error, context)
}
```

## Migration Checklist

- [ ] Update configuration from `logtail` to `better-stack`
- [ ] Add new configuration options (sampling, filtering, etc.)
- [ ] Update import statements if using types
- [ ] Test error capturing functionality
- [ ] Verify log filtering and sampling
- [ ] Set up environment-specific configurations
- [ ] Add performance monitoring to critical paths
- [ ] Update error boundary integration
- [ ] Test offline buffering (if enabled)
- [ ] Monitor internal metrics
- [ ] Document custom middleware (if used)

## Support

For Better Stack specific issues:
- Check the [Better Stack documentation](https://betterstack.com/docs)
- Review the [Logtail Node.js guide](https://betterstack.com/docs/logs/node-js)

For integration issues:
- Check the observability package tests
- Review the complete example in `examples/better-stack-complete.ts`
- Check TypeScript types for available options