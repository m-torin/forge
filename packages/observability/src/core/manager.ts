/**
 * ObservabilityManager - Core orchestrator for multiple observability providers
 */

import type { ObservabilityPlugin, ObservabilityServerPlugin, PluginLifecycle } from './plugin';
import type {
  Breadcrumb,
  LogLevel,
  ObservabilityContext,
  ObservabilityServer,
  ObservabilityUser,
} from './types';

/**
 * Manager that orchestrates multiple observability plugins
 * Broadcasts all method calls to enabled plugins
 */
export class ObservabilityManager implements ObservabilityServer {
  private plugins = new Map<string, ObservabilityPlugin | ObservabilityServerPlugin>();
  private initialized = false;
  private lifecycle: PluginLifecycle = {};

  constructor(lifecycle?: PluginLifecycle) {
    if (lifecycle) {
      this.lifecycle = lifecycle;
    }
  }

  /**
   * Add a plugin to the manager
   */
  addPlugin(plugin: ObservabilityPlugin | ObservabilityServerPlugin): this {
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  /**
   * Get a specific plugin by name
   */
  getPlugin<T extends ObservabilityPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T;
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): ObservabilityPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * List all registered plugins (alias for getPlugins)
   */
  listPlugins(): ObservabilityPlugin[] {
    return this.getPlugins();
  }

  /**
   * Initialize all plugins
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const initPromises = Array.from(this.plugins.values())
      .filter(plugin => plugin.enabled && plugin.initialize)
      .map(async plugin => {
        try {
          if (plugin.initialize) {
            await plugin.initialize();
          }
          this.lifecycle.onInitialized?.(plugin);
        } catch (error) {
          console.error(`Failed to initialize plugin ${plugin.name}:`, error);
          this.lifecycle.onError?.(error as Error, plugin);
        }
      });

    await Promise.allSettled(initPromises);
    this.initialized = true;
  }

  /**
   * Shutdown all plugins
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.plugins.values())
      .filter(plugin => plugin.shutdown)
      .map(async plugin => {
        try {
          if (plugin.shutdown) {
            await plugin.shutdown();
          }
          this.lifecycle.onShutdown?.(plugin);
        } catch (error) {
          console.error(`Failed to shutdown plugin ${plugin.name}:`, error);
          this.lifecycle.onError?.(error as Error, plugin);
        }
      });

    await Promise.allSettled(shutdownPromises);
    this.initialized = false;
  }

  /**
   * Broadcast exception to all enabled plugins
   */
  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    this.broadcast(plugin => plugin.captureException(error, context));
  }

  /**
   * Broadcast message to all enabled plugins
   */
  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    this.broadcast(plugin => plugin.captureMessage(message, level, context));
  }

  /**
   * Set user on all enabled plugins
   */
  setUser(user: ObservabilityUser | null): void {
    this.broadcast(plugin => plugin.setUser(user));
  }

  /**
   * Add breadcrumb to all enabled plugins
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.broadcast(plugin => plugin.addBreadcrumb(breadcrumb));
  }

  /**
   * Execute callback within scope for all enabled plugins
   */
  withScope(callback: (scope: any) => void): void {
    this.broadcast(plugin => plugin.withScope(callback));
  }

  /**
   * Flush all plugins that support it
   */
  async flush(timeout?: number): Promise<boolean> {
    const flushPromises = Array.from(this.plugins.values())
      .filter((plugin): plugin is ObservabilityServerPlugin => {
        return plugin.enabled && 'flush' in plugin && typeof plugin.flush === 'function';
      })
      .map(plugin => plugin.flush(timeout));

    if (flushPromises.length === 0) {
      return true;
    }

    const results = await Promise.allSettled(flushPromises);
    return results.every(result => result.status === 'fulfilled' && result.value === true);
  }

  /**
   * Helper to broadcast a method call to all enabled plugins
   */
  private broadcast(fn: (plugin: ObservabilityPlugin) => void): void {
    this.plugins.forEach(plugin => {
      if (plugin.enabled) {
        try {
          fn(plugin);
        } catch (error) {
          console.error(`Plugin ${plugin.name} error:`, error);
          this.lifecycle.onError?.(error as Error, plugin);
        }
      }
    });
  }

  /**
   * Check if manager has any enabled plugins
   */
  hasEnabledPlugins(): boolean {
    return Array.from(this.plugins.values()).some(plugin => plugin.enabled);
  }

  /**
   * Get names of all enabled plugins
   */
  getEnabledPluginNames(): string[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.enabled)
      .map(plugin => plugin.name);
  }

  /**
   * Log a debug message
   */
  logDebug(message: string, context?: ObservabilityContext): void {
    this.captureMessage(message, 'debug', context);
  }

  /**
   * Log an info message
   */
  logInfo(message: string, context?: ObservabilityContext): void {
    this.captureMessage(message, 'info', context);
  }

  /**
   * Log a warning message
   */
  logWarn(message: string, context?: ObservabilityContext): void {
    this.captureMessage(message, 'warning', context);
  }

  /**
   * Log an error message
   */
  logError(message: string | Error, context?: ObservabilityContext): void {
    if (message instanceof Error) {
      this.captureException(message, context);
    } else {
      this.captureMessage(message, 'error', context);
    }
  }

  /**
   * Generic log method that routes to appropriate level-specific method
   */
  log(level: LogLevel, message: string, context?: ObservabilityContext): void {
    switch (level) {
      case 'debug':
        this.logDebug(message, context);
        break;
      case 'info':
        this.logInfo(message, context);
        break;
      case 'warning':
        this.logWarn(message, context);
        break;
      case 'error':
        this.logError(message, context);
        break;
      default:
        this.logInfo(message, context);
    }
  }
}
