/**
 * Vercel Analytics Server - Standardized Adapter
 * Tree-shaking optimized with composable features
 */

// Export the standardized server adapter
export type { VercelConfig } from './adapter';
export { VercelServerAdapter } from './server-adapter';

// Export composable utilities for tree-shaking
export { withBatching } from '@repo/3p-core/composable/with-batching';
export { withPrivacy } from '@repo/3p-core/composable/with-privacy';
export { withRetry } from '@repo/3p-core/composable/with-retry';

// Convenience function factory
export function createVercelServerAdapter(config: import('./adapter').VercelConfig) {
  return new (require('./server-adapter').VercelServerAdapter)(config);
}

// Direct API compatibility (optional - for migration)
export async function track(
  name: string,
  data?: Record<string, any>,
  options?: { flags?: string[] },
): Promise<void> {
  try {
    const { track } = await import('@vercel/analytics/server');

    if (options) {
      track(name, data || {}, options);
    } else if (data) {
      track(name, data);
    } else {
      track(name);
    }
  } catch (error) {
    console.warn('Failed to track server event:', error);
  }
}

export async function trackWithFlags(
  name: string,
  data: Record<string, any> = {},
  flags: string[],
): Promise<void> {
  return track(name, data, { flags });
}
