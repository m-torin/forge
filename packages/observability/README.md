# @repo/observability-new

Multi-provider observability package for error tracking, logging, monitoring, and distributed
tracing.

## Overview

This package provides a unified interface for integrating multiple observability providers:

- **Sentry** - Error tracking and performance monitoring with session replay
- **Logtail (BetterStack)** - Production logging service
- **Pino/Winston** - Structured logging (skeleton - to be implemented)
- **OpenTelemetry** - Distributed tracing (skeleton - to be implemented)
- **Console** - Development logging with full feature parity

## Architecture

The package follows a provider registry pattern similar to the analytics package:

```
/src
  /client          - Client-side providers and exports
  /server          - Server-side providers and exports
  /shared          - Shared types and utilities
  /next            - Next.js specific integrations
  /hooks           - React hooks for observability
```

## Features

- 🔌 **Plug-and-play providers** - Configure only what you need
- 🎯 **Type-safe** - Full TypeScript support with provider-specific types
- 🚀 **Performance focused** - Providers loaded dynamically only when configured
- 🧪 **Testing friendly** - Console provider for development and testing
- ⚛️ **React integration** - Hooks and context providers for React apps
- 🔗 **Next.js optimized** - Built-in Next.js wrappers and utilities
- 🛡️ **Error boundaries** - Automatic error capturing in React components
- 📊 **Performance monitoring** - Transaction and span tracking

## Usage

### Client-side

```typescript
import { createClientObservability } from '@repo/observability-new/client';

const observability = await createClientObservability({
  providers: {
    sentry: { dsn: 'your-sentry-dsn' },
    console: { enabled: true },
  },
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
    opentelemetry: { serviceName: 'api' },
  },
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

## Migration Status

### ✅ Completed

1. **Core Architecture**

   - Multi-provider system with registry pattern
   - Dynamic provider loading
   - Type-safe configuration

2. **Providers**

   - Sentry (client & server) - Full implementation with replay integration
   - Logtail - Production logging with development fallback
   - Console - Complete implementation for development

3. **Utilities**

   - Error parsing and handling (`parseError`, `parseAndCaptureError`)
   - Error boundary handlers
   - Safe function wrappers

4. **React Integration**

   - `useObservability` hook
   - `useWorkflowObservability` hook
   - `usePerformanceTimer` hook
   - `ObservabilityProvider` component
   - Context-based architecture

5. **Next.js Integration**
   - Configuration wrappers (`withSentry`, `withLogtail`, `withObservability`)
   - Client and server managers
   - Build-time optimizations

### 🚧 TODO

1. **Providers**

   - Pino - Implement full logging capabilities
   - Winston - Implement full logging capabilities
   - OpenTelemetry - Implement tracing capabilities

2. **Components**

   - Status component - Server-only component for system status
   - Error boundary component - Enhanced React error boundary

3. **Features**
   - Workflow-specific tracking utilities
   - Analytics hooks (if keeping in observability)
   - Middleware for automatic request tracking
   - Web Vitals integration

## Breaking Changes from Original Package

See [MIGRATION.md](./MIGRATION.md) for a complete migration guide.
