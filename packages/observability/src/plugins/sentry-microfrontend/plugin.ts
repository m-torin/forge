/**
 * Sentry Micro Frontend Plugin
 *
 * Extends the base Sentry plugin with micro frontend-specific functionality
 */

import type { LogLevel, ObservabilityContext } from '../../core/types';
import { SentryPlugin } from '../sentry/plugin';
import {
  createMultiplexedTransport,
  createZoneBeforeSend,
  enhanceEventWithZone,
} from './multiplexed-transport';
import type { SentryScope, SentrySDK } from './sentry-types';
import { mapLogLevelToSentrySeverity } from './sentry-types';
import type { MicroFrontendMode, SentryMicroFrontendConfig } from './types';
import {
  createZoneScope,
  detectCurrentZone,
  ensureSingleInit,
  getParentSentry,
  hasParentSentry,
  markAsHost,
} from './utils';

/**
 * Sentry plugin optimized for micro frontend architectures
 */
export class SentryMicroFrontendPlugin extends SentryPlugin {
  private mode: MicroFrontendMode;
  private zone: string | undefined;
  private parentSentry: SentrySDK | undefined;
  private zoneScope: SentryScope | undefined;
  private microFrontendConfig: SentryMicroFrontendConfig;
  private eventProcessorCleanup?: () => void;

  constructor(config: SentryMicroFrontendConfig = {}) {
    // Determine operation mode
    const mode = SentryMicroFrontendPlugin.determineMode(config);

    // Prepare base config based on mode
    const baseConfig = SentryMicroFrontendPlugin.prepareConfig(config, mode);

    // Initialize parent class
    super(baseConfig);

    this.mode = mode;
    this.microFrontendConfig = config;
    this.zone = config.zone || detectCurrentZone(config.zones);

    // Handle parent Sentry if in child mode
    if (this.mode === 'child') {
      const parent = getParentSentry();
      if (parent) {
        this.parentSentry = parent as SentrySDK;
        this.enabled = true; // Re-enable since we'll use parent

        // Create zone-specific scope
        if (this.zone && this.parentSentry.Scope) {
          this.zoneScope = createZoneScope(this.zone, config.globalTags) as SentryScope;
        }
      }
    }

    // Mark as host if applicable
    if (this.mode === 'host') {
      markAsHost(this.zone);
    }
  }

  /**
   * Determine the operation mode based on configuration and environment
   */
  private static determineMode(config: SentryMicroFrontendConfig): MicroFrontendMode {
    // Explicit host mode
    if (config.isHost) {
      return 'host';
    }

    // Check for parent Sentry
    if (config.detectParent !== false && hasParentSentry()) {
      return 'child';
    }

    // Default to standalone
    return 'standalone';
  }

  /**
   * Prepare configuration based on mode
   */
  private static prepareConfig(
    config: SentryMicroFrontendConfig,
    mode: MicroFrontendMode,
  ): SentryMicroFrontendConfig {
    const preparedConfig = { ...config };

    if (mode === 'child') {
      // Disable initialization in child mode
      preparedConfig.enabled = false;
    } else if (mode === 'host' && config.zones && config.useMultiplexedTransport !== false) {
      // Host mode with multiplexed transport is handled in initialize()
      // Don't set transport here as it needs Sentry to be loaded first
    }

    return preparedConfig;
  }

  /**
   * Initialize the plugin
   */
  async initialize(config?: SentryMicroFrontendConfig): Promise<void> {
    const mergedConfig = { ...this.microFrontendConfig, ...config };

    if (this.mode === 'child') {
      // In child mode, we don't initialize Sentry but set up our client reference
      if (this.parentSentry) {
        this.client = this.parentSentry;
        this.initialized = true;

        // Configure parent Sentry to include zone information
        if (this.zone && mergedConfig.addZoneContext !== false) {
          this.configureParentSentry();
        }
      }
      return;
    }

    // For host and standalone modes
    if (mergedConfig.preventDuplicateInit !== false) {
      try {
        ensureSingleInit();
      } catch (error) {
        console.error('Sentry initialization prevented:', error);
        this.enabled = false;
        return;
      }
    }

    // Initialize parent class
    await super.initialize(mergedConfig);

    // Additional setup for host mode
    if (this.mode === 'host' && this.client && mergedConfig.zones) {
      this.setupHostMode(mergedConfig);
    }
  }

  /**
   * Configure parent Sentry instance for child mode
   */
  private configureParentSentry(): void {
    if (!this.parentSentry || !this.zone) {
      console.warn(
        '[SentryMicroFrontendPlugin] Cannot configure parent Sentry: missing parentSentry or zone',
      );
      return;
    }

    try {
      // Create event processor
      const processor = (event: any) => {
        try {
          if (this.shouldProcessEvent(event)) {
            enhanceEventWithZone(event, this.zone || '', {
              mode: this.mode,
              plugin: 'SentryMicroFrontendPlugin',
            });
          }
        } catch (error) {
          console.error('[SentryMicroFrontendPlugin] Error processing event:', error);
        }
        return event;
      };

      // Add global event processor to include zone information
      if (typeof this.parentSentry.addEventProcessor === 'function') {
        this.parentSentry.addEventProcessor(processor);

        // Store cleanup function
        this.eventProcessorCleanup = () => {
          // Note: Sentry SDK doesn't provide a way to remove event processors
          // We'll mark events as processed to avoid double processing
        };
      } else {
        console.warn(
          '[SentryMicroFrontendPlugin] Parent Sentry does not support addEventProcessor',
        );
      }
    } catch (error) {
      console.error('[SentryMicroFrontendPlugin] Failed to configure parent Sentry:', error);
    }
  }

  /**
   * Set up host mode with multiplexed transport
   */
  private setupHostMode(config: SentryMicroFrontendConfig): void {
    if (!config.zones || !this.client) {
      console.warn('[SentryMicroFrontendPlugin] Cannot setup host mode: missing zones or client');
      return;
    }

    try {
      // Create multiplexed transport
      const transport = createMultiplexedTransport(
        config.zones,
        config.fallbackDsn || config.dsn,
        this.client,
      );

      if (transport && typeof (this.client as any).init === 'function') {
        // Re-initialize with multiplexed transport
        const currentOptions =
          typeof (this.client as any).getOptions === 'function'
            ? (this.client as any).getOptions()
            : {};

        (this.client as any).init({
          ...currentOptions,
          transport,
          beforeSend: createZoneBeforeSend(this.zone || 'main', config.beforeSend),
        });
      } else {
        console.warn(
          '[SentryMicroFrontendPlugin] Client does not support init method or transport creation failed',
        );
      }
    } catch (error) {
      console.error('[SentryMicroFrontendPlugin] Failed to setup host mode:', error);
    }
  }

  /**
   * Check if we should process this event
   */
  private shouldProcessEvent(event: any): boolean {
    // Don't double-process events
    if (event.tags?.microFrontendProcessed) {
      return false;
    }

    // Check if event is from our zone
    if (this.zone && event.tags?.zone && event.tags.zone !== this.zone) {
      return false;
    }

    return true;
  }

  /**
   * Capture an exception with zone context
   */
  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      if (this.mode === 'child' && this.parentSentry && this.zoneScope) {
        // Use parent Sentry with zone scope
        if (typeof this.parentSentry.withScope === 'function') {
          this.parentSentry.withScope((scope: any) => {
            try {
              // Copy zone scope properties
              if (this.zoneScope && typeof scope.setTag === 'function') {
                scope.setTag('zone', this.zone || 'unknown');
                scope.setTag('microFrontend', true);
                scope.setContext('microFrontend', {
                  zone: this.zone,
                  mode: this.mode,
                });
              }

              // Add additional context
              if (context && typeof scope.setContext === 'function') {
                scope.setContext('additional', context);
              }

              if (this.parentSentry && typeof this.parentSentry.captureException === 'function') {
                this.parentSentry.captureException(error);
              }
            } catch (scopeError) {
              console.error('[SentryMicroFrontendPlugin] Error in scope callback:', scopeError);
            }
          });
        } else {
          console.warn('[SentryMicroFrontendPlugin] Parent Sentry does not support withScope');
        }
      } else {
        // Use standard capture with zone enhancement
        const enhancedContext = {
          ...context,
          microFrontend: {
            zone: this.zone,
            mode: this.mode,
          },
        };
        super.captureException(error, enhancedContext);
      }
    } catch (captureError) {
      console.error('[SentryMicroFrontendPlugin] Failed to capture exception:', captureError);
    }
  }

  /**
   * Capture a message with zone context
   */
  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      const sentryLevel = mapLogLevelToSentrySeverity(level);

      if (this.mode === 'child' && this.parentSentry && this.zoneScope) {
        // Use parent Sentry with zone scope
        if (typeof this.parentSentry.withScope === 'function') {
          this.parentSentry.withScope((scope: SentryScope) => {
            try {
              // Copy zone scope properties
              if (this.zoneScope && typeof scope.setTag === 'function') {
                scope.setTag('zone', this.zone || 'unknown');
                scope.setTag('microFrontend', true);
                if (typeof scope.setContext === 'function') {
                  scope.setContext('microFrontend', {
                    zone: this.zone,
                    mode: this.mode,
                  });
                }
              }

              // Add additional context
              if (context && typeof scope.setContext === 'function') {
                scope.setContext('additional', context);
              }

              if (this.parentSentry && typeof this.parentSentry.captureMessage === 'function') {
                this.parentSentry.captureMessage(message, sentryLevel);
              }
            } catch (scopeError) {
              console.error('[SentryMicroFrontendPlugin] Error in scope callback:', scopeError);
            }
          });
        } else {
          console.warn('[SentryMicroFrontendPlugin] Parent Sentry does not support withScope');
        }
      } else {
        // Use standard capture
        super.captureMessage(message, level, context);
      }
    } catch (captureError) {
      console.error('[SentryMicroFrontendPlugin] Failed to capture message:', captureError);
    }
  }

  /**
   * Get the current operation mode
   */
  getMode(): MicroFrontendMode {
    return this.mode;
  }

  /**
   * Get the current zone
   */
  getZone(): string | undefined {
    return this.zone;
  }

  /**
   * Get debug information about the plugin state
   */
  getDebugInfo(): Record<string, any> {
    return {
      mode: this.mode,
      zone: this.zone,
      enabled: this.enabled,
      initialized: this.initialized,
      hasParentSentry: this.mode === 'child' && !!this.parentSentry,
      clientType: this.client ? this.client.constructor.name : 'none',
    };
  }

  /**
   * Clean up the plugin and release resources
   */
  async cleanup(): Promise<void> {
    try {
      // Clean up event processor if it exists
      if (this.eventProcessorCleanup) {
        this.eventProcessorCleanup();
        this.eventProcessorCleanup = undefined;
      }

      // Clear zone scope
      if (this.zoneScope && typeof (this.zoneScope as any).clear === 'function') {
        (this.zoneScope as any).clear();
      }
      this.zoneScope = undefined;

      // Clear parent Sentry reference
      this.parentSentry = undefined;

      // Call parent cleanup
      await super.cleanup();

      // Mark as not initialized
      this.initialized = false;
      this.enabled = false;

      console.debug('[SentryMicroFrontendPlugin] Cleanup completed');
    } catch (error) {
      console.error('[SentryMicroFrontendPlugin] Error during cleanup:', error);
    }
  }

  /**
   * Destroy the plugin (alias for cleanup)
   */
  async destroy(): Promise<void> {
    await this.cleanup();
  }
}

/**
 * Factory function to create a Sentry Micro Frontend plugin
 */
export const createSentryMicroFrontendPlugin = (
  config?: SentryMicroFrontendConfig,
): SentryMicroFrontendPlugin => {
  return new SentryMicroFrontendPlugin(config);
};
