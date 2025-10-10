/**
 * Sentry Micro Frontend Plugin
 *
 * Extends the base Sentry plugin with micro frontend-specific functionality
 */

import type { LogLevel, ObservabilityContext } from '../../core/types';
import { SentryPlugin } from '../sentry/plugin';
import {
  createBackstageBeforeSend,
  createMultiplexedTransport,
  enhanceEventWithBackstageApp,
} from './multiplexed-transport';
import type { SentryScope, SentrySDK } from './sentry-types';
import { mapLogLevelToSentrySeverity } from './sentry-types';
import type { MicroFrontendMode, SentryMicroFrontendConfig } from './types';
import {
  createBackstageScope,
  detectCurrentBackstageApp,
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
  private backstageApp: string | undefined;
  private parentSentry: SentrySDK | undefined;
  private backstageScope: SentryScope | undefined;
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
    this.backstageApp = config.backstageApp || detectCurrentBackstageApp(config.backstageApps);

    // Handle parent Sentry if in child mode
    if (this.mode === 'child') {
      const parent = getParentSentry();
      if (parent) {
        this.parentSentry = parent as SentrySDK;
        this.enabled = true; // Re-enable since we'll use parent

        // Create backstageApp-specific scope
        if (this.backstageApp && this.parentSentry.Scope) {
          this.backstageScope = createBackstageScope(
            this.backstageApp,
            config.globalTags,
          ) as SentryScope;
        }
      }
    }

    // Mark as host if applicable
    if (this.mode === 'host') {
      markAsHost(this.backstageApp);
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
    } else if (
      mode === 'host' &&
      config.backstageApps &&
      config.useMultiplexedTransport !== false
    ) {
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

        // Configure parent Sentry to include backstageApp information
        if (this.backstageApp && mergedConfig.addBackstageContext !== false) {
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
    if (this.mode === 'host' && this.client && mergedConfig.backstageApps) {
      this.setupHostMode(mergedConfig);
    }
  }

  /**
   * Configure parent Sentry instance for child mode
   */
  private configureParentSentry(): void {
    if (!this.parentSentry || !this.backstageApp) {
      console.warn(
        '[SentryMicroFrontendPlugin] Cannot configure parent Sentry: missing parentSentry or backstageApp',
      );
      return;
    }

    try {
      // Create event processor
      const processor = (event: any) => {
        try {
          if (this.shouldProcessEvent(event)) {
            enhanceEventWithBackstageApp(event, this.backstageApp || '', {
              mode: this.mode,
              plugin: 'SentryMicroFrontendPlugin',
            });
          }
        } catch (error) {
          console.error('[SentryMicroFrontendPlugin] Error processing event:', error);
        }
        return event;
      };

      // Add global event processor to include backstageApp information
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
    if (!config.backstageApps || !this.client) {
      console.warn(
        '[SentryMicroFrontendPlugin] Cannot setup host mode: missing backstageApps or client',
      );
      return;
    }

    try {
      // Create multiplexed transport
      const transport = createMultiplexedTransport(
        config.backstageApps,
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
          beforeSend: createBackstageBeforeSend(this.backstageApp || 'main', config.beforeSend),
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

    // Check if event is from our backstageApp
    if (
      this.backstageApp &&
      event.tags?.backstageApp &&
      event.tags.backstageApp !== this.backstageApp
    ) {
      return false;
    }

    return true;
  }

  /**
   * Capture an exception with backstageApp context
   */
  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      if (this.mode === 'child' && this.parentSentry && this.backstageScope) {
        // Use parent Sentry with backstageApp scope
        if (typeof this.parentSentry.withScope === 'function') {
          this.parentSentry.withScope((scope: any) => {
            try {
              // Copy backstageApp scope properties
              if (this.backstageScope && typeof scope.setTag === 'function') {
                scope.setTag('backstageApp', this.backstageApp || 'unknown');
                scope.setTag('microFrontend', true);
                scope.setContext('microFrontend', {
                  backstageApp: this.backstageApp,
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
        // Use standard capture with backstageApp enhancement
        const enhancedContext = {
          ...context,
          microFrontend: {
            backstageApp: this.backstageApp,
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
   * Capture a message with backstageApp context
   */
  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      const sentryLevel = mapLogLevelToSentrySeverity(level);

      if (this.mode === 'child' && this.parentSentry && this.backstageScope) {
        // Use parent Sentry with backstageApp scope
        if (typeof this.parentSentry.withScope === 'function') {
          this.parentSentry.withScope((scope: SentryScope) => {
            try {
              // Copy backstageApp scope properties
              if (this.backstageScope && typeof scope.setTag === 'function') {
                scope.setTag('backstageApp', this.backstageApp || 'unknown');
                scope.setTag('microFrontend', true);
                if (typeof scope.setContext === 'function') {
                  scope.setContext('microFrontend', {
                    backstageApp: this.backstageApp,
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
   * Get the current Backstage app identifier
   */
  getBackstageApp(): string | undefined {
    return this.backstageApp;
  }

  /**
   * @deprecated Use getBackstageApp instead.
   */
  getZone(): string | undefined {
    return this.getBackstageApp();
  }

  /**
   * Get debug information about the plugin state
   */
  getDebugInfo(): Record<string, any> {
    return {
      mode: this.mode,
      backstageApp: this.backstageApp,
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

      // Clear backstageApp scope
      if (this.backstageScope && typeof (this.backstageScope as any).clear === 'function') {
        (this.backstageScope as any).clear();
      }
      this.backstageScope = undefined;

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
