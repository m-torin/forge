/**
 * Next.js instrumentation for Web app
 * Initializes Sentry for both edge and server runtimes
 */

export async function register() {
  // Initialize Sentry for both edge and server runtimes
  const Sentry = await import("@sentry/nextjs");

  Sentry.init({
    dsn: "https://7dd841435baf049c0ef0841feaf57a14@o1116743.ingest.us.sentry.io/4509465421086720",
    tracesSampleRate: 1,
    debug: false,
  });
}

export async function onRequestError(error: Error) {
  // Sentry will automatically capture unhandled errors
  // Additional error handling can be added here if needed
  console.error("Unhandled error:", error);
}
