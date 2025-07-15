/**
 * Server analytics manager with static provider registry
 */

import { ConsoleProvider } from '../providers/console/server';
import { PostHogServerProvider } from '../providers/posthog/server';
import { SegmentServerProvider } from '../providers/segment/server';
import { VercelServerProvider } from '../providers/vercel/server';
import { createAnalyticsManager } from '../shared/utils/manager';

import type { AnalyticsConfig, AnalyticsManager, ProviderRegistry } from '../shared/types/types';

// Static provider registry for server environments
const SERVER_PROVIDERS: ProviderRegistry = {
  console: config => new ConsoleProvider(config),
  posthog: config => new PostHogServerProvider(config),
  segment: config => new SegmentServerProvider(config),
  vercel: config => new VercelServerProvider(config),
};

/**
 * Create and initialize a server analytics instance
 * This is the primary way to create analytics for server-side applications
 */
export async function createServerAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server analytics instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, SERVER_PROVIDERS);
}
