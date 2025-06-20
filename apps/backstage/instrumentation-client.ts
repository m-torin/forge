/**
 * Client-side instrumentation for Next.js 15.3+
 * This file is automatically loaded by Next.js in the browser
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

import * as Sentry from '@sentry/nextjs';
import { initializeClient } from '@repo/observability/client/next';

// Initialize client-side observability with Sentry
initializeClient({
  providers: {
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Enable browser features
      browserTracingEnabled: true,
      feedbackEnabled: true,
      loggingEnabled: process.env.NODE_ENV === 'development',

      // Session replay settings
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      replaysOnErrorSampleRate: 1.0,

      // Privacy settings
      sendDefaultPii: false,
      replayMaskAllText: true,
      replayBlockAllMedia: true,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Experimental features
      _experiments: {
        enableLogs: process.env.NODE_ENV === 'development',
      },
    },
  },
});

// Export required by Sentry for router transition tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
