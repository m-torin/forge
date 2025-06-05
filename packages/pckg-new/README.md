# @repo/observability-new

Multi-provider observability package for error tracking, logging, monitoring, and distributed
tracing.

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

## TODO

This is a skeleton implementation. The actual provider implementations need to be migrated from the
existing observability package.

## Prompts

Based on the comprehensive audit and remediation we just completed, here's a good prompt template
for checking other repositories:

Prompt for Repository Audit & Remediation

Please audit [repository/package path] looking for:

1. **Production-breaking issues**:

   - Placeholder/stub functions that return fake data
   - Functions that throw "not implemented" errors
   - Dangerous mock implementations in production code

2. **Code quality issues**:

   - Duplicate code across multiple files
   - Over-engineered implementations (1000+ line files, complex class hierarchies)
   - Dead/unused code and exports
   - Inconsistent error handling patterns

3. **Architectural problems**:
   - Interface inconsistencies
   - Circular dependencies
   - Violations of single responsibility principle
   - Missing or incomplete TypeScript types

Please provide:

1. A summary of critical issues that make the code unusable
2. Count of TypeScript errors (run pnpm typecheck)
3. Specific examples of each issue found
4. Priority ranking: Critical (blocks production) vs Nice-to-have

After the audit, if critical issues are found, use your task tool to implement the complete
remediation. Track progress in a todo.md file. Focus on:

- Removing dangerous code first
- Simplifying without removing utility
- Maintaining backward compatibility where possible
- Following the 80/20 rule (simple API for common cases, advanced features as opt-in)

Ignore test files unless they contain issues that affect production code.

Shorter Version:

Audit [package-name] for code duplication, broken features, over-engineering, and architectural
issues. Look especially for:

- Placeholder functions returning fake data
- 1000+ line files that should be modularized
- Duplicate error handling
- Dead code

Run pnpm typecheck and fix any non-test errors. If you find critical issues, implement complete
remediation using your task tool and track progress in todo.md.
