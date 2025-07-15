/**
 * Client-side feature flags exports
 * Generic client utilities for browser/client environments
 *
 * @example
 * ```typescript
 * import { createPostHogAdapter } from '@repo/feature-flags/client';
 *
 * const adapter = createPostHogAdapter({
 *   postHogKey: 'your-key'
 * });
 * ```
 */

// Client adapter exports (browser-compatible parts)
export { createPostHogClientAdapter, postHogClientAdapter } from './adapters/posthog-client';

// Types
export type { PostHogClientAdapter, PostHogClientAdapterOptions } from './adapters/posthog-client';

// Note: Edge Config is server-only, not available in client
