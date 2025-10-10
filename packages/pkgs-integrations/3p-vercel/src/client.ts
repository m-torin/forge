/**
 * Vercel Analytics Client - Standardized Adapter
 * Tree-shaking optimized with composable features
 */

// Export the standardized adapter
export { VercelAdapter } from './adapter';
export type { VercelConfig, VercelWebVitalsMetric } from './adapter';

// Export composable utilities for tree-shaking
export { withBatching } from '@repo/3p-core/composable/with-batching';
export { withPrivacy } from '@repo/3p-core/composable/with-privacy';
export { withRetry } from '@repo/3p-core/composable/with-retry';

// Convenience function factory
export async function createVercelAdapter(config: import('./adapter').VercelConfig) {
  const { VercelAdapter } = await import('./adapter');
  return new VercelAdapter(config);
}

// Direct API compatibility (optional - for migration)
export async function track(name: string, data?: Record<string, any>): Promise<void> {
  try {
    const { track } = await import('@vercel/analytics');
    if (data) {
      track(name, data);
    } else {
      track(name);
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
}

// Injection function for non-React applications (CRA, vanilla JS)
export async function inject(options?: {
  debug?: boolean;
  mode?: 'auto' | 'production' | 'development';
  beforeSend?: (event: { url: string; name?: string; data?: Record<string, any> }) => any;
  endpoint?: string;
  scriptSrc?: string;
}): Promise<void> {
  try {
    const { inject } = await import('@vercel/analytics');
    inject(options);
  } catch (error) {
    console.warn('Failed to inject Vercel Analytics:', error);
  }
}
