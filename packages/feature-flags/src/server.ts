/**
 * Server-side feature flags exports
 * Generic server utilities for Node.js/server environments
 *
 * @example
 * ```typescript
 * import {
 *   createPostHogServerAdapter,
 *   createEdgeConfigAdapter,
 *   getPostHogProviderData
 * } from '@repo/feature-flags/server';
 *
 * // Use adapters in any Node.js environment
 * const postHog = createPostHogServerAdapter({ postHogKey: 'xxx' });
 * const edgeConfig = createEdgeConfigAdapter({ connectionString: 'yyy' });
 * ```
 */

// PostHog adapter exports (server-only)
export {
  createPostHogServerAdapter,
  getProviderData as getPostHogProviderData,
  postHogServerAdapter,
} from './adapters/posthog-server';

// Edge Config adapter exports
export {
  createEdgeConfigAdapter,
  edgeConfigAdapter,
  getEdgeConfigProviderData,
} from './adapters/edge-config';

// Types
export type { PostHogServerAdapter, PostHogServerAdapterOptions } from './adapters/posthog-server';

export type { EdgeConfigAdapterOptions } from './adapters/edge-config';
