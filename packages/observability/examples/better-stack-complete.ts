/**
 * Complete Better Stack Integration Example
 *
 * Comprehensive demonstration of all Better Stack logging and observability features
 * in the @repo/observability package. This example shows production-ready patterns
 * for structured logging, error tracking, and performance monitoring.
 *
 * Features Demonstrated:
 * - Complete Better Stack configuration
 * - Environment-specific settings
 * - Error boundaries and exception handling
 * - Next.js API route integration
 * - Performance monitoring with transactions and spans
 * - Breadcrumbs for debugging context
 * - Session tracking
 * - Custom metrics and context enrichment
 *
 * Prerequisites:
 * - Better Stack account and source token
 * - @repo/observability package configured
 * - Environment variables set up
 *
 * Environment: Next.js Server-Side
 *
 * @see https://betterstack.com/docs
 */

import { createServerObservability } from '../src/server';
import { BetterStackConfig } from '../src/shared/types/better-stack-types';

// Example configuration for Better Stack
const betterStackConfig: BetterStackConfig = {
  // Application metadata
  application: 'my-nextjs-app',

  // Logging configuration
  batchInterval: 1000, // Send logs every 1 second
  batchSize: 100, // Send up to 100 logs per batch
  // Advanced features
  bufferOffline: true, // Buffer logs when offline
  captureConsole: false, // Don't capture console.log calls

  // Features
  captureErrors: true, // Capture uncaught exceptions
  captureRejections: true, // Capture unhandled promise rejections
  // Context enrichment
  defaultContext: {
    datacenter: 'us-east-1',
    service: 'api',
  },

  enableMetrics: true, // Track internal metrics
  enableTracing: false, // Disable tracing for now
  environment: process.env.NODE_ENV || 'production',
  globalTags: {
    component: 'observability',
    team: 'backend',
  },

  // Filtering
  ignorePatterns: ['health-check', 'heartbeat-.*', 'favicon.ico'],
  maxBufferSize: 1000, // Maximum offline buffer size

  release: process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
  retryCount: 3, // Retry failed requests 3 times
  sampleRate: 1.0, // Log 100% of events (use 0.1 for 10% sampling)
  sendLogsToConsoleInDev: true, // Also log to console in development

  // Required: Your Better Stack source token
  sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN || 'demo-token',
  version: '1.0.0',
};

// Error boundary for React components
export function createErrorBoundaryHandler() {
  return async (error: Error, errorInfo: any) => {
    const observability = await initializeObservability();

    await observability.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      level: 'error',
      tags: {
        source: 'react-error-boundary',
      },
    });
  };
}

// Next.js API route integration
export function createNextJSObservability() {
  return createServerObservability({
    providers: {
      'better-stack': {
        application: 'nextjs-api',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
        integrateWithNextjs: true,
        integrateWithVercel: true,
        release: process.env.VERCEL_GIT_COMMIT_SHA,
        sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN || 'demo-token',
        ...getEnvironmentConfig(),
      },
    },
  });
}

// Better Stack specific features
async function demonstrateBetterStackFeatures() {
  const observability = await initializeObservability();

  // Get internal metrics
  if ('getMetrics' in observability) {
    const metrics = (observability as any).getMetrics();
    console.log('Better Stack metrics: ', metrics);
  }

  // Custom middleware
  if ('use' in observability) {
    (observability as any).use((log: any) => ({
      ...log,
      customField: 'injected-by-middleware',
      timestamp: new Date().toISOString(),
    }));
  }

  // Flush pending logs
  if ('flush' in observability) {
    await (observability as any).flush();
  }
}

// Usage examples
async function demonstrateUsage() {
  const observability = await initializeObservability();

  // Set user context
  observability.setUser({
    email: 'user@example.com',
    id: 'user-123',
    role: 'admin',
    username: 'testuser',
  });

  // Set global tags
  observability.setTag('version', '1.0.0');
  observability.setTag('region', 'us-east-1');

  // Set extra context
  observability.setExtra('buildNumber', 12345);
  observability.setContext('deployment', {
    strategy: 'blue-green',
    timestamp: new Date().toISOString(),
  });

  // Structured logging
  await observability.log('info', 'Application started', {
    memory: process.memoryUsage(),
    pid: process.pid,
    port: 3000,
  });

  // Error tracking
  try {
    throw new Error('Something went wrong');
  } catch (error: any) {
    await observability.captureException(error as Error, {
      extra: {
        input: { email: 'user@example.com' },
        operation: 'user-creation',
      },
      level: 'error',
      requestId: 'req-123',
      userId: 'user-123',
    });
  }

  // Message tracking
  await observability.captureMessage('User performed important action', 'info', {
    action: 'profile-update',
    tags: { critical: true },
    userId: 'user-123',
  });

  // Performance monitoring
  const transaction = observability.startTransaction('api-request', {
    endpoint: '/api/users',
    method: 'POST',
    requestId: 'req-456',
  });

  // Simulate some work
  const span = observability.startSpan('database-query', transaction);
  span.setTag('table', 'users');
  span.setTag('operation', 'SELECT');

  // Simulate database work
  await new Promise((resolve: any) => setTimeout(resolve, 100));

  span.finish();

  // Add breadcrumbs for debugging
  observability.addBreadcrumb({
    category: 'api',
    data: {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      url: '/api/users',
    },
    level: 'info',
    message: 'API request received',
    type: 'http',
  });

  // Finish transaction
  transaction.setTag('status', 'success');
  transaction.setData('responseSize', 1234);
  transaction.finish('success');

  // Session tracking
  observability.startSession();

  // Simulate user activity
  await new Promise((resolve: any) => setTimeout(resolve, 1000));

  observability.endSession();

  console.log('Better Stack observability demo completed!');
}

// Environment-specific configuration
function getEnvironmentConfig(): Partial<BetterStackConfig> {
  const env = process.env.NODE_ENV as string;

  switch (env) {
    case 'development':
      return {
        bufferOffline: false,
        captureConsole: true,
        sampleRate: 1.0,
        sendLogsToConsoleInDev: true,
      };

    case 'production':
      return {
        bufferOffline: true,
        captureConsole: false,
        ignorePatterns: ['health-check', 'heartbeat-.*', 'metrics-.*'],
        sampleRate: 0.1, // 10% sampling
      };

    case 'staging':
      return {
        bufferOffline: true,
        captureConsole: false,
        sampleRate: 0.5, // 50% sampling
      };

    default:
      return {};
  }
}

async function initializeObservability() {
  // Create observability instance with multiple providers
  const observability = await createServerObservability({
    debug: process.env.NODE_ENV === 'development',
    // Global error handler
    onError: (error, context: any) => {
      console.error('Observability error: ', error, context);
    },

    // Info handler
    onInfo: (message: any) => {
      console.log('Observability info: ', message);
    },

    providers: {
      // Better Stack for production logging
      'better-stack': betterStackConfig,

      // Console for development
      console: {
        enabled: process.env.NODE_ENV === 'development',
        level: 'debug',
      },

      // Sentry for error tracking
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      },
    },
  });

  return observability;
}

// Export the main initialization function
export { demonstrateBetterStackFeatures, demonstrateUsage, initializeObservability };

// Example usage in a Next.js app
if (require.main === module) {
  demonstrateUsage()
    .then(() => demonstrateBetterStackFeatures())
    .catch(console.error);
}
