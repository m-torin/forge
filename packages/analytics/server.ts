import 'server-only';

// Re-export server analytics
export { analytics, analytics as serverAnalytics } from './posthog/server';

// Re-export server-safe flag function
export { flag, flags } from './flags-server';

// Re-export flag constants
export { FLAGS } from './types/flags';

// Re-export flag helpers
export {
  getAIFlags,
  getAnalyticsFlags,
  getAuthFlags,
  getPaymentFlags,
  getUIFlags,
} from './flag-helpers-server';

// Re-export Analytics class for server use
export { Analytics } from './emitters/analytics';

// Re-export types
export type * from './types/flags';