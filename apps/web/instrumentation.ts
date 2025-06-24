// This file configures the initialization of Sentry for the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === "development",
});

// Make Sentry available globally for the observability package
// @ts-ignore
globalThis.Sentry = Sentry;

// Export the onRequestError hook for Next.js error handling
export const onRequestError = Sentry.captureRequestError;
