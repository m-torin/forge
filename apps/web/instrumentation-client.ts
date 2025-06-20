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
      loggingEnabled: false, // Disabled for public-facing app

      // Session replay settings
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0, // Lower rate for public site
      replaysOnErrorSampleRate: 1.0,

      // Privacy settings - stricter for public site
      sendDefaultPii: false,
      replayMaskAllText: true,
      replayBlockAllMedia: true,

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // Lower rate for public site

      // Experimental features
      _experiments: {
        enableLogs: false, // Disabled for public-facing app
      },
    },
  },
});

// Export required by Sentry for router transition tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
