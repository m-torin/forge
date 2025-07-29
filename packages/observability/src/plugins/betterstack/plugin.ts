/**
 * Better Stack (Logtail) plugin implementation
 * Updated to use official @logtail packages
 */

import type { ObservabilityServerPlugin } from '../../core/plugin';
import type {
  Breadcrumb,
  LogLevel,
  ObservabilityContext,
  ObservabilityUser,
} from '../../core/types';
import { safeEnv } from './env';

/**
 * Minimal Logtail interface for common methods across all @logtail packages
 */
interface LogtailClient {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  flush(): Promise<void>;
}

/**
 * Better Stack plugin configuration
 */
export interface BetterStackPluginConfig {
  /**
   * The @logtail package to use (e.g., '@logtail/js', '@logtail/next')
   * If not provided, the plugin will auto-detect based on environment
   */
  logtailPackage?: string;

  // Core configuration options
  sourceToken?: string;
  endpoint?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'off';
  enabled?: boolean;

  // Advanced options
  batchInterval?: number;
  batchSize?: number;
  retryCount?: number;
  retryBackoff?: boolean;
  middleware?: any[];
}

/**
 * Better Stack plugin implementation using official @logtail packages
 */
export class BetterStackPlugin<T extends LogtailClient = LogtailClient>
  implements ObservabilityServerPlugin<T>
{
  name = 'betterstack';
  enabled: boolean;
  protected client: T | undefined;
  protected initialized = false;
  protected logtailPackage: string;
  protected currentUser: ObservabilityUser | null = null;
  protected breadcrumbs: Breadcrumb[] = [];
  protected config: BetterStackPluginConfig;

  constructor(config: BetterStackPluginConfig = {}) {
    this.config = config;
    const env = safeEnv();
    // Auto-enable if token is provided
    const hasToken =
      config.sourceToken ||
      env.BETTER_STACK_SOURCE_TOKEN ||
      env.BETTERSTACK_SOURCE_TOKEN ||
      env.LOGTAIL_SOURCE_TOKEN ||
      env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
      env.NEXT_PUBLIC_BETTERSTACK_TOKEN ||
      env.NEXT_PUBLIC_LOGTAIL_TOKEN;
    this.enabled = config.enabled ?? Boolean(hasToken);

    // Determine Logtail package to use
    this.logtailPackage = config.logtailPackage || this.detectLogtailPackage();
  }

  private detectLogtailPackage(): string {
    // Next.js environments use Next.js package
    if (process.env.NEXT_RUNTIME) {
      return '@logtail/next';
    }
    // All other environments use the unified js package (bundles both node and browser)
    return '@logtail/js';
  }

  getClient(): T | undefined {
    return this.client;
  }

  protected getSafeEnv() {
    return safeEnv();
  }

  async initialize(config?: BetterStackPluginConfig): Promise<void> {
    if (this.initialized || !this.enabled) return;

    const env = safeEnv();
    const mergedConfig = { ...this.config, ...config };

    // Get source token with priority: config > new env vars > legacy env vars
    const sourceToken =
      mergedConfig.sourceToken ||
      env.BETTER_STACK_SOURCE_TOKEN ||
      env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
      env.LOGTAIL_SOURCE_TOKEN ||
      env.BETTERSTACK_SOURCE_TOKEN ||
      env.NEXT_PUBLIC_LOGTAIL_TOKEN ||
      env.NEXT_PUBLIC_BETTERSTACK_TOKEN;

    if (!sourceToken) {
      console.warn('Better Stack plugin: No source token provided, skipping initialization');
      this.enabled = false;
      return;
    }

    try {
      // Dynamic import of the specified Logtail package
      const LogtailModule = await import(/* webpackIgnore: true */ this.logtailPackage);

      // Handle different export patterns
      const LogtailClass = LogtailModule.default || LogtailModule.Logtail || LogtailModule;

      if (!LogtailClass) {
        console.error(
          `Better Stack plugin: Could not find Logtail class in ${this.logtailPackage}`,
        );
        this.enabled = false;
        return;
      }

      // Build configuration object
      const logtailConfig: any = {
        sourceToken,
      };

      // Add optional configuration
      if (
        mergedConfig.endpoint ||
        env.BETTER_STACK_INGESTING_URL ||
        env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL
      ) {
        logtailConfig.endpoint =
          mergedConfig.endpoint ||
          env.BETTER_STACK_INGESTING_URL ||
          env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL;
      }

      // Initialize the client
      this.client = new LogtailClass(logtailConfig) as T;

      this.initialized = true;
    } catch (error) {
      console.error(`Failed to import Logtail package '${this.logtailPackage}':`, error);
      this.enabled = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.client && this.initialized) {
      await this.client.flush();
      this.initialized = false;
    }
  }

  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled || !this.client) return;

    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Build structured data
    const data = {
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      context: context?.extra,
      tags: context?.tags,
      user: context?.user || this.currentUser,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
    };

    this.client.error(errorObj.message, data);
  }

  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    if (!this.enabled || !this.client) return;

    // Build structured data
    const data = {
      level,
      context: context?.extra,
      tags: context?.tags,
      user: context?.user || this.currentUser,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
    };

    // Map log levels to Logtail methods
    switch (level) {
      case 'debug':
        this.client.debug(message, data);
        break;
      case 'warning':
        this.client.warn(message, data);
        break;
      case 'error':
        this.client.error(message, data);
        break;
      case 'info':
      default:
        this.client.info(message, data);
        break;
    }
  }

  setUser(user: ObservabilityUser | null): void {
    if (!this.enabled) return;
    this.currentUser = user;
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled) return;

    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now() / 1000,
    });

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100);
    }
  }

  withScope(callback: (scope: any) => void): void {
    if (!this.enabled) return;

    // Simple scope implementation
    const scope = {
      setContext: (_key: string, _context: unknown) => {
        // Could store this for next log entry
      },
      setUser: (user: ObservabilityUser | null) => {
        this.setUser(user);
      },
    };
    callback(scope);
  }

  async flush(_timeout?: number): Promise<boolean> {
    if (!this.enabled || !this.client) return true;

    try {
      await this.client.flush();
      return true;
    } catch (error) {
      console.error('Better Stack flush error:', error);
      return false;
    }
  }
}

/**
 * Factory function to create a Better Stack plugin
 */
export const createBetterStackPlugin = <T extends LogtailClient = LogtailClient>(
  config?: BetterStackPluginConfig,
): BetterStackPlugin<T> => {
  return new BetterStackPlugin<T>(config);
};
