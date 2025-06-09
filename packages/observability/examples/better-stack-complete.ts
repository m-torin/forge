/**
 * Complete Better Stack integration example
 * Demonstrates all features of the Better Stack provider
 */

import { createServerObservability } from '../src/server';
import type { BetterStackConfig } from '../src/shared/types/better-stack-types';

// Example configuration for Better Stack
const betterStackConfig: BetterStackConfig = {
  // Required: Your Better Stack source token
  sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,

  // Application metadata
  application: 'my-nextjs-app',
  environment: process.env.NODE_ENV || 'production',
  release: process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
  version: '1.0.0',

  // Logging configuration
  batchInterval: 1000, // Send logs every 1 second
  batchSize: 100, // Send up to 100 logs per batch
  retryCount: 3, // Retry failed requests 3 times

  // Features
  captureErrors: true, // Capture uncaught exceptions
  captureRejections: true, // Capture unhandled promise rejections
  captureConsole: false, // Don't capture console.log calls
  sendLogsToConsoleInDev: true, // Also log to console in development

  // Context enrichment
  defaultContext: {
    service: 'api',
    datacenter: 'us-east-1',
  },
  globalTags: {
    team: 'backend',
    component: 'observability',
  },

  // Advanced features
  bufferOffline: true, // Buffer logs when offline
  maxBufferSize: 1000, // Maximum offline buffer size
  enableMetrics: true, // Track internal metrics
  enableTracing: false, // Disable tracing for now

  // Filtering
  ignorePatterns: [
    'health-check',
    'heartbeat-.*',
    'favicon.ico',
  ],
  sampleRate: 1.0, // Log 100% of events (use 0.1 for 10% sampling)
};

async function initializeObservability() {
  // Create observability instance with multiple providers
  const observability = await createServerObservability({
    debug: process.env.NODE_ENV === 'development',
    providers: {
      // Better Stack for production logging
      'better-stack': betterStackConfig,
      
      // Sentry for error tracking
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      },
      
      // Console for development
      console: {
        enabled: process.env.NODE_ENV === 'development',
        level: 'debug',
      },
    },
    
    // Global error handler
    onError: (error, context) => {
      console.error('Observability error:', error, context);
    },
    
    // Info handler
    onInfo: (message) => {
      console.log('Observability info:', message);
    },
  });

  return observability;
}

// Usage examples
async function demonstrateUsage() {
  const observability = await initializeObservability();

  // Set user context
  observability.setUser({
    id: 'user-123',
    email: 'user@example.com',
    username: 'testuser',
    role: 'admin',
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
    port: 3000,
    pid: process.pid,
    memory: process.memoryUsage(),
  });

  // Error tracking
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    await observability.captureException(error as Error, {
      level: 'error',
      requestId: 'req-123',
      userId: 'user-123',
      extra: {
        operation: 'user-creation',
        input: { email: 'user@example.com' },
      },
    });
  }

  // Message tracking
  await observability.captureMessage(
    'User performed important action',
    'info',
    {
      userId: 'user-123',
      action: 'profile-update',
      tags: { critical: true },
    }
  );

  // Performance monitoring
  const transaction = observability.startTransaction('api-request', {
    requestId: 'req-456',
    method: 'POST',
    endpoint: '/api/users',
  });

  // Simulate some work
  const span = observability.startSpan('database-query', transaction);
  span.setTag('table', 'users');
  span.setTag('operation', 'SELECT');
  
  // Simulate database work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  span.finish();

  // Add breadcrumbs for debugging
  observability.addBreadcrumb({
    type: 'http',
    category: 'api',
    message: 'API request received',
    level: 'info',
    data: {
      method: 'POST',
      url: '/api/users',
      headers: { 'content-type': 'application/json' },
    },
  });

  // Finish transaction
  transaction.setTag('status', 'success');
  transaction.setData('responseSize', 1234);
  transaction.finish('success');

  // Session tracking
  observability.startSession();
  
  // Simulate user activity
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  observability.endSession();

  console.log('Better Stack observability demo completed!');
}

// Better Stack specific features
async function demonstrateBetterStackFeatures() {
  const observability = await initializeObservability();
  
  // Get internal metrics
  if ('getMetrics' in observability) {
    const metrics = (observability as any).getMetrics();
    console.log('Better Stack metrics:', metrics);
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

// Environment-specific configuration
function getEnvironmentConfig(): Partial<BetterStackConfig> {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'development':
      return {
        sendLogsToConsoleInDev: true,
        sampleRate: 1.0,
        captureConsole: true,
        bufferOffline: false,
      };

    case 'staging':
      return {
        sampleRate: 0.5, // 50% sampling
        captureConsole: false,
        bufferOffline: true,
      };

    case 'production':
      return {
        sampleRate: 0.1, // 10% sampling
        captureConsole: false,
        bufferOffline: true,
        ignorePatterns: [
          'health-check',
          'heartbeat-.*',
          'metrics-.*',
        ],
      };

    default:
      return {};
  }
}

// Next.js API route integration
export function createNextJSObservability() {
  return createServerObservability({
    providers: {
      'better-stack': {
        sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN!,
        application: 'nextjs-api',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
        release: process.env.VERCEL_GIT_COMMIT_SHA,
        integrateWithNextjs: true,
        integrateWithVercel: true,
        ...getEnvironmentConfig(),
      },
    },
  });
}

// Error boundary for React components
export function createErrorBoundaryHandler() {
  return async (error: Error, errorInfo: any) => {
    const observability = await initializeObservability();
    
    await observability.captureException(error, {
      level: 'error',
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      tags: {
        source: 'react-error-boundary',
      },
    });
  };
}

// Export the main initialization function
export { initializeObservability, demonstrateUsage, demonstrateBetterStackFeatures };

// Example usage in a Next.js app
if (require.main === module) {
  demonstrateUsage()
    .then(() => demonstrateBetterStackFeatures())
    .catch(console.error);
}