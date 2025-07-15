/**
 * Core plugin interface for observability providers
 */

import type { ObservabilityClient, ObservabilityServer } from './types';

/**
 * Base plugin interface that all observability providers must implement
 */
export interface ObservabilityPlugin<TClient = any> extends ObservabilityClient {
  /**
   * Unique name for this plugin
   */
  name: string;

  /**
   * Whether this plugin is currently enabled
   */
  enabled: boolean;

  /**
   * Get the native client instance (e.g., Sentry SDK)
   * This allows direct access to provider-specific features
   */
  getClient(): TClient | undefined;

  /**
   * Initialize the plugin with optional configuration
   */
  initialize?(config?: any): Promise<void>;

  /**
   * Cleanup resources when shutting down
   */
  shutdown?(): Promise<void>;
}

/**
 * Server-side plugin interface with additional flush capability
 */
export interface ObservabilityServerPlugin<TClient = any>
  extends ObservabilityPlugin<TClient>,
    ObservabilityServer {
  // Inherits flush() from ObservabilityServer
}

/**
 * Factory function type for creating plugins
 */
export type PluginFactory<TConfig = any, TPlugin = ObservabilityPlugin> = (
  config?: TConfig,
) => TPlugin;

/**
 * Plugin lifecycle events
 */
export interface PluginLifecycle {
  onError?: (error: Error, plugin: ObservabilityPlugin) => void;
  onInitialized?: (plugin: ObservabilityPlugin) => void;
  onShutdown?: (plugin: ObservabilityPlugin) => void;
}
