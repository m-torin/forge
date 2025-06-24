import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    'https://8987c7901505aaed86c7bde168a52d36@o1116743.ingest.us.sentry.io/4509469743972352',
  sendDefaultPii: true,
  tracesSampleRate: 1.0, // Adjust in production
  _experiments: { enableLogs: true },
  debug: process.env.NODE_ENV === 'development',
  // Optionally add backend integrations here, e.g.:
  // integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

// Make Sentry available globally for the observability package
// @ts-ignore
globalThis.Sentry = Sentry;

export const onRequestError = Sentry.captureRequestError;
