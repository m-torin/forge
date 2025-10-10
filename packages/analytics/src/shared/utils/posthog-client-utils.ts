/**
 * Client-safe PostHog utilities for Next.js
 * These utilities can be safely imported in client-side code
 */

import { BootstrapData } from '../types/posthog-types';

/**
 * PostHog provider configuration helper for Next.js
 * This is safe to use in client-side code
 */
function createPostHogConfig(
  apiKey: string,
  options?: {
    autocapture?: boolean;
    bootstrap?: BootstrapData;
    capture_pageview?: boolean;
    debug?: boolean;
    host?: string;
    session_recording?: boolean;
  },
) {
  return {
    apiKey,
    options: {
      api_host: options?.host ?? 'https://app.posthog.com',
      autocapture: options?.autocapture ?? true,
      bootstrap: options?.bootstrap,
      capture_pageview: options?.capture_pageview ?? false, // We handle manually
      disable_session_recording: !(options?.session_recording ?? true),
      loaded: options?.debug
        ? (posthog: any) => {
            // Only enable debug in development
            if (options.debug) {
              posthog.debug();
            }
          }
        : undefined,
      ...options,
    },
  };
}

/**
 * Re-export client-safe utilities from posthog-bootstrap
 */
export { createPostHogConfig };
