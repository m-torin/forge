import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.SENTRY_DSN ||
    'https://8987c7901505aaed86c7bde168a52d36@o1116743.ingest.us.sentry.io/4509469743972352',
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
    }),
    Sentry.consoleLoggingIntegration({ levels: ['log', 'error', 'warn'] }),
  ],
  tracesSampleRate: 1.0, // Adjust in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  _experiments: { enableLogs: true },
  debug: process.env.NODE_ENV === 'development',
});

// Make Sentry available globally for the observability package
// @ts-ignore
globalThis.Sentry = Sentry;
// @ts-ignore
if (typeof window !== 'undefined') window.Sentry = Sentry;

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
