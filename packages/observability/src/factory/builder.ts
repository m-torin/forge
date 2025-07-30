/**
 * ObservabilityBuilder - Fluent API for building observability instances
 */

import { ObservabilityManager } from '../core/manager';
import type {
  ObservabilityPlugin,
  ObservabilityServerPlugin,
  PluginLifecycle,
} from '../core/plugin';

/**
 * Builder for creating configured ObservabilityManager instances
 */
export class ObservabilityBuilder {
  private plugins: (ObservabilityPlugin | ObservabilityServerPlugin)[] = [];
  private lifecycle: PluginLifecycle = {};
  private autoInitialize = true;

  /**
   * Add a plugin to the observability stack
   * @param plugin - Observability plugin to add
   * @returns Builder instance for chaining
   */
  withPlugin(plugin: ObservabilityPlugin | ObservabilityServerPlugin): this {
    if (plugin) {
      this.plugins.push(plugin);
    }
    return this;
  }

  /**
   * Add multiple plugins at once
   * @param plugins - Array of observability plugins to add
   * @returns Builder instance for chaining
   */
  withPlugins(plugins: (ObservabilityPlugin | ObservabilityServerPlugin)[]): this {
    if (plugins && Array.isArray(plugins)) {
      const validPlugins = plugins.filter(plugin => plugin != null);
      this.plugins.push(...validPlugins);
    }
    return this;
  }

  /**
   * Set lifecycle callbacks for plugin management
   * @param lifecycle - Lifecycle callback configuration
   * @returns Builder instance for chaining
   */
  withLifecycle(lifecycle: PluginLifecycle): this {
    this.lifecycle = { ...this.lifecycle, ...lifecycle };
    return this;
  }

  /**
   * Configure whether to auto-initialize plugins (default: true)
   */
  withAutoInitialize(autoInitialize: boolean): this {
    this.autoInitialize = autoInitialize;
    return this;
  }

  /**
   * Build the ObservabilityManager instance
   * @returns Configured ObservabilityManager instance
   */
  build(): ObservabilityManager {
    const manager = new ObservabilityManager(this.lifecycle);

    // Add all plugins
    this.plugins.forEach(plugin => manager.addPlugin(plugin));

    // Auto-initialize if enabled and not in edge runtime
    if (
      this.autoInitialize &&
      typeof process !== 'undefined' &&
      process.env.NEXT_RUNTIME !== 'edge'
    ) {
      // Initialize asynchronously
      manager.initialize().catch(error => {
        // Note: Using console.error here as observability system is not yet initialized
        console.error('Failed to initialize observability:', error);
      });
    }

    return manager;
  }

  /**
   * Build and initialize the ObservabilityManager instance
   * @returns Promise resolving to initialized ObservabilityManager
   */
  async buildWithAutoInit(): Promise<ObservabilityManager> {
    const manager = new ObservabilityManager(this.lifecycle);

    // Add all plugins
    this.plugins.forEach(plugin => manager.addPlugin(plugin));

    // Initialize all plugins
    await manager.initialize();

    return manager;
  }

  /**
   * Create a new builder instance
   * @returns New ObservabilityBuilder instance
   */
  static create(): ObservabilityBuilder {
    return new ObservabilityBuilder();
  }
}
