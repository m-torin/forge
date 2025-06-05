# @repo/observability-new

Multi-provider observability package for error tracking, logging, monitoring, and distributed tracing.

## Overview

This package provides a unified interface for integrating multiple observability providers:

- **Sentry** - Error tracking and performance monitoring
- **Pino/Winston** - Structured logging
- **OpenTelemetry** - Distributed tracing
- **Console** - Development logging

## Architecture

The package follows the same provider registry pattern as the analytics package:

```
/src
  /client          - Client-side providers and exports
  /server          - Server-side providers and exports  
  /shared          - Shared types and utilities
  /next            - Next.js specific integrations
```

## Usage

### Client-side

```typescript
import { createClientObservability } from '@repo/observability-new/client';

const observability = await createClientObservability({
  providers: {
    sentry: { dsn: 'your-sentry-dsn' },
    console: { enabled: true }
  }
});

// Use observability
observability.captureException(new Error('Something went wrong'));
observability.log('info', 'User action', { userId: '123' });
```

### Server-side

```typescript
import { createServerObservability } from '@repo/observability-new/server';

const observability = await createServerObservability({
  providers: {
    sentry: { dsn: process.env.SENTRY_DSN },
    pino: { level: 'info' },
    opentelemetry: { serviceName: 'api' }
  }
});

// Use observability
observability.captureException(new Error('Server error'));
const transaction = observability.startTransaction('api_request');
// ... do work
transaction.finish();
```

### Next.js Integration

```typescript
// Client-side
import { createNextJSClientObservability } from '@repo/observability-new/client/next';

// Server-side
import { createNextJSServerObservability } from '@repo/observability-new/server/next';
```

## Provider Configuration

### Sentry

```typescript
{
  sentry: {
    dsn: 'https://...@sentry.io/...',
    environment: 'production',
    tracesSampleRate: 0.1
  }
}
```

### Pino/Winston

```typescript
{
  pino: {
    level: 'info',
    format: 'json'
  }
}
```

### OpenTelemetry

```typescript
{
  opentelemetry: {
    serviceName: 'my-service',
    endpoint: 'http://localhost:4318'
  }
}
```

## TODO

This is a skeleton implementation. The actual provider implementations need to be migrated from the existing observability package.