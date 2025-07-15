/**
 * Client analytics manager with static provider registry
 */

import { ConsoleProvider } from '../providers/console/client';
import { PostHogClientProvider } from '../providers/posthog/client';
import { SegmentClientProvider } from '../providers/segment/client';
import { VercelClientProvider } from '../providers/vercel/client';
import { createAnalyticsManager } from '../shared/utils/manager';

import type { AnalyticsConfig, AnalyticsManager, ProviderRegistry } from '../shared/types/types';

// Static provider registry for client environments
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: config => new ConsoleProvider(config),
  posthog: config => new PostHogClientProvider(config),
  segment: config => new SegmentClientProvider(config),
  vercel: config => new VercelClientProvider(config),
};

/**
 * Create and initialize a client analytics instance
 * This is the primary way to create analytics for client-side applications
 * @param config - Analytics configuration including providers and settings
 * @returns Promise resolving to initialized analytics manager
 */
export async function createClientAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client analytics instance without initializing
 * Useful when you need to control initialization timing
 * @param config - Analytics configuration including providers and settings
 * @returns Uninitialized analytics manager instance
 */
export function createClientAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, CLIENT_PROVIDERS);
}
