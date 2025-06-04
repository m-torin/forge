import { Analytics, serverAnalytics } from '@repo/analytics-legacy/server'

// Export the server analytics instance directly
export { serverAnalytics }

// You can also create a custom Analytics instance for server-side use if needed
export function createServerAnalytics() {
  return new Analytics({
    providers: {
      // Configure providers as needed for server-side
      posthog: process.env.POSTHOG_API_KEY ? {
        apiKey: process.env.POSTHOG_API_KEY,
        config: {
          apiHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
        },
      } : undefined,
      segment: process.env.SEGMENT_WRITE_KEY ? {
        writeKey: process.env.SEGMENT_WRITE_KEY,
        config: {
          flushAt: 20,
          flushInterval: 10000,
        },
      } : undefined,
    },
    debug: process.env.NODE_ENV === 'development',
    disabled: process.env.NODE_ENV === 'test',
  })
}