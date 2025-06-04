/**
 * Client-side analytics exports
 * Provides access to all analytics functionality for browser/client environments
 */

import { SegmentClientProvider } from './external/segment/client';
import { PostHogClientProvider } from './external/posthog/client';
import { VercelClientProvider } from './external/vercel/client';
import { ConsoleProvider } from './external/console/universal';
import { createAnalyticsManager, AnalyticsManager } from './external/manager';
import type { AnalyticsConfig, ProviderRegistry, TrackingOptions } from './external/types';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  segment: (config) => new SegmentClientProvider(config),
  posthog: (config) => new PostHogClientProvider(config),
  vercel: (config) => new VercelClientProvider(config),
  console: (config) => new ConsoleProvider(config)
};

// Global analytics instance
let analyticsInstance: AnalyticsManager | null = null;

/**
 * Initialize analytics with configuration
 */
export async function initializeAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  analyticsInstance = createAnalyticsManager(config, CLIENT_PROVIDERS);
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
  validateConfig,
  PROVIDER_REQUIREMENTS 
} from './external/config';

// Export validation utilities
export { 
  validateAnalyticsConfig, 
  validateProvider,
  validateConfigOrThrow,
  debugConfig 
} from './external/validation';

// Export manager for advanced usage
export { AnalyticsManager, createAnalyticsManager } from './external/manager';

// Export Next.js optimized analytics
export { 
  NextJSAnalyticsManager, 
  createNextJSAnalytics,
  getAnalyticsScriptProps,
  type NextJSAnalyticsConfig 
} from './external/nextjs';