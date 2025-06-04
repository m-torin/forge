/**
 * Server-side analytics exports
 * Provides access to all analytics functionality for server/Node.js environments
 */

import { SegmentServerProvider } from './external/segment/server';
import { PostHogServerProvider } from './external/posthog/server';
import { VercelServerProvider } from './external/vercel/server';
import { ConsoleProvider } from './external/console/universal';
import { createAnalyticsManager, AnalyticsManager } from './external/manager';
import type { AnalyticsConfig, ProviderRegistry, TrackingOptions } from './external/types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  segment: (config) => new SegmentServerProvider(config),
  posthog: (config) => new PostHogServerProvider(config),
  vercel: (config) => new VercelServerProvider(config),
  console: (config) => new ConsoleProvider(config)
};

// Global analytics instance
let analyticsInstance: AnalyticsManager | null = null;

/**
 * Initialize analytics with configuration
 */
export async function initializeAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  analyticsInstance = createAnalyticsManager(config, SERVER_PROVIDERS);
  await analyticsInstance.initialize();
  return analyticsInstance;
}

/**
 * Get current analytics instance
 */
export function getAnalytics(): AnalyticsManager | null {
  return analyticsInstance;
}

/**
 * Track an event
 */
export async function track(event: string, properties?: any, options?: TrackingOptions): Promise<void> {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  await analyticsInstance.track(event, properties, options);
}

/**
 * Identify a user
 */
export async function identify(userId: string, traits?: any, options?: TrackingOptions): Promise<void> {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  await analyticsInstance.identify(userId, traits, options);
}

/**
 * Track a page view
 */
export async function page(name?: string, properties?: any, options?: TrackingOptions): Promise<void> {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  await analyticsInstance.page(name, properties, options);
}

/**
 * Track a group
 */
export async function group(groupId: string, traits?: any, options?: TrackingOptions): Promise<void> {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  await analyticsInstance.group(groupId, traits, options);
}

/**
 * Alias a user
 */
export async function alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void> {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  await analyticsInstance.alias(userId, previousId, options);
}

/**
 * Set analytics context
 */
export function setContext(context: any): void {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return;
  }
  analyticsInstance.setContext(context);
}

/**
 * Get analytics context
 */
export function getContext(): any {
  if (!analyticsInstance) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return {};
  }
  return analyticsInstance.getContext();
}

// Export all emitter functionality
export * from './internal/emitters';

// Re-export ecommerce for convenience
export { ecommerce } from './internal/emitters';

// Export types
export type { 
  AnalyticsConfig, 
  TrackingOptions, 
  ProviderConfig,
  AnalyticsProvider,
  AnalyticsContext 
} from './external/types';

// Export configuration utilities
export { 
  getAnalyticsConfig, 
  createConfigBuilder, 
  buildAnalyticsConfig,
  validateConfig,
  PROVIDER_REQUIREMENTS 
} from './external/config';

// Export validation utilities
export { 
  validateAnalyticsConfig, 
  validateProvider,
  validateConfigOrThrow,
  validateEnvironmentVariables,
  debugConfig 
} from './external/validation';

// Export manager for advanced usage
export { AnalyticsManager, createAnalyticsManager } from './external/manager';