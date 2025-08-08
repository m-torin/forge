/**
 * Console plugin for observability
 * Simple logging implementation for development
 */

import type {
  ObservabilityPlugin,
  ObservabilityServerPlugin,
  PluginFactory,
} from '../../core/plugin';
import type {
  Breadcrumb,
  LogLevel,
  ObservabilityContext,
  ObservabilityUser,
} from '../../core/types';

/**
 * Console plugin configuration
 */
export interface ConsolePluginConfig {
  prefix?: string;
  logLevel?: LogLevel;
  enabled?: boolean;
  colors?: boolean;
}

/**
 * Console plugin implementation for browser environments
 */
export class ConsolePlugin implements ObservabilityPlugin<Console> {
  name = 'console';
  enabled: boolean;
  protected prefix: string;
  private logLevel: LogLevel;
  private colors: boolean;

  constructor(config: ConsolePluginConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.prefix = config.prefix || '[Console]';
    this.logLevel = config.logLevel || 'debug';
    this.colors = config.colors ?? true;
  }

  async initialize(): Promise<void> {
    // Console doesn't need initialization
  }

  async shutdown(): Promise<void> {
    // Console doesn't need shutdown
  }

  getClient(): Console | undefined {
    return undefined; // Console has no client
  }

  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      const contextData = this.formatContext(context);
      console.error(this.prefix, 'Error:', error, JSON.stringify(contextData));
    } catch (_err) {
      // Gracefully handle console errors
    }
  }

  captureMessage(message: string, level: LogLevel = 'info', context?: ObservabilityContext): void {
    if (!this.enabled) return;

    try {
      const contextData = this.formatContext(context);
      const logMethod = this.getLogMethod(level);
      const levelLabel = this.getLevelLabel(level);

      (console[logMethod] as (...args: any[]) => void)(
        this.prefix,
        `${levelLabel}:`,
        message,
        JSON.stringify(contextData),
      );
    } catch (_err) {
      // Gracefully handle console errors
    }
  }

  setUser(user: ObservabilityUser | null): void {
    if (!this.enabled) return;

    try {
      if (user === null) {
        console.info(this.prefix, 'User cleared');
      } else {
        console.info(this.prefix, 'User set:', JSON.stringify(user));
      }
    } catch (_err) {
      // Gracefully handle console errors
    }
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled) return;

    try {
      const enrichedBreadcrumb = {
        ...breadcrumb,
        timestamp: breadcrumb.timestamp || Date.now() / 1000,
      };
      console.log(this.prefix, 'Breadcrumb:', JSON.stringify(enrichedBreadcrumb));
    } catch (_err) {
      // Gracefully handle console errors
    }
  }

  withScope(callback: (scope: any) => void): void {
    if (!this.enabled) return;

    try {
      const scope = {
        setContext: (key: string, context: unknown) => {
          console.log(this.prefix, 'Context set:', key, JSON.stringify(context));
        },
        setUser: (user: ObservabilityUser | null) => {
          this.setUser(user);
        },
      };
      callback(scope);
    } catch (_err) {
      // Gracefully handle scope errors
    }
  }

  async flush(_timeout?: number): Promise<boolean> {
    // Console doesn't need flushing
    if (this.enabled) {
      console.log(this.prefix, 'Flushed');
    }
    return true;
  }

  private formatContext(context?: ObservabilityContext): any {
    if (!context) return {};

    // Handle new format with explicit extra/tags structure
    if (context.extra !== undefined || context.tags !== undefined) {
      return {
        context: context.extra,
        tags: context.tags,
      };
    }

    // Handle AI package format with operation/metadata structure
    if ('operation' in context || 'metadata' in context) {
      return {
        context: context.metadata || {},
        tags: { operation: context.operation },
      };
    }

    // Handle any other context format - use as-is for context
    return {
      context: context,
      tags: {},
    };
  }

  private getLogMethod(level: LogLevel): keyof Console {
    switch (level) {
      case 'debug':
        return 'debug';
      case 'info':
        return 'info';
      case 'warning':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  private getLevelLabel(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'Debug';
      case 'info':
        return 'Info';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Info';
    }
  }
}

/**
 * Console plugin implementation for server environments
 */
export class ConsoleServerPlugin
  extends ConsolePlugin
  implements ObservabilityServerPlugin<Console>
{
  async flush(_timeout?: number): Promise<boolean> {
    // Console doesn't need flushing
    if (this.enabled) {
      console.log(this.prefix, 'Flushed');
    }
    return true;
  }
}

/**
 * Factory function to create a console plugin for browser environments
 */
export const createConsolePlugin: PluginFactory<ConsolePluginConfig, ConsolePlugin> = config => {
  return new ConsolePlugin(config);
};

/**
 * Factory function to create a console plugin for server environments
 */
export const createConsoleServerPlugin: PluginFactory<
  ConsolePluginConfig,
  ConsoleServerPlugin
> = config => {
  return new ConsoleServerPlugin(config);
};

// Re-export types
export type { ObservabilityPlugin, ObservabilityServerPlugin } from '../../core/plugin';
