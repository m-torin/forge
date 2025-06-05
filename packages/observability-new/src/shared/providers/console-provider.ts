/**
 * Console provider for development observability
 */

import type { ConsoleConfig } from '../types/console-types';
import type {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../types/types';

export class ConsoleProvider implements ObservabilityProvider {
  readonly name = 'console';
  private config: ConsoleConfig = {};
  private enabled = true;
  private prefix = '[OBS]';
  private user: any = null;
  private tags: Record<string, any> = {};
  private extras: Record<string, any> = {};
  private contexts: Record<string, any> = {};
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 100;

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as ConsoleConfig;
    this.enabled = this.config.enabled !== false;
    this.prefix = this.config.prefix || '[OBS]';

    if (this.enabled) {
      console.log(`${this.prefix} Console provider initialized`, {
        colors: this.config.colors,
        levels: this.config.levels,
        timestamp: this.config.timestamp,
      });
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.enabled) return;

    const errorInfo = {
      name: error.name,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      context: this.mergeContext(context),
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    console.error(`${this.prefix} Exception captured:`, errorInfo);
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.enabled) return;

    const messageInfo = {
      context: this.mergeContext(context),
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
    console[consoleMethod](`${this.prefix} Message:`, messageInfo);
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.enabled) return;

    if (this.config.levels && !this.config.levels.includes(level as any)) {
      return;
    }

    const _logEntry = {
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    };

    const consoleLevel = this.mapLogLevel(level);
    console[consoleLevel](`${this.prefix} ${level.toUpperCase()}:`, message, metadata || '');
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.enabled) return null;

    const transaction = {
      id: this.generateId(),
      name,
      context: this.mergeContext(context),
      startTime: Date.now(),
    };

    console.log(`${this.prefix} Transaction started:`, {
      id: transaction.id,
      name: transaction.name,
      context: transaction.context,
    });

    return {
      finish: () => {
        const duration = Date.now() - transaction.startTime;
        console.log(`${this.prefix} Transaction finished:`, {
          id: transaction.id,
          name: transaction.name,
          duration: `${duration}ms`,
        });
      },
    };
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.enabled) return null;

    const span = {
      id: this.generateId(),
      name,
      parentId: parentSpan?.id,
      startTime: Date.now(),
    };

    console.log(`${this.prefix} Span started:`, {
      id: span.id,
      name: span.name,
      parentId: span.parentId,
    });

    return {
      finish: () => {
        const duration = Date.now() - span.startTime;
        console.log(`${this.prefix} Span finished:`, {
          id: span.id,
          name: span.name,
          duration: `${duration}ms`,
        });
      },
    };
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.enabled) return;

    this.user = user;
    console.log(`${this.prefix} User set:`, user);
  }

  setTag(key: string, value: string | number | boolean): void {
    if (!this.enabled) return;

    this.tags[key] = value;
    console.log(`${this.prefix} Tag set:`, { key, value });
  }

  setExtra(key: string, value: any): void {
    if (!this.enabled) return;

    this.extras[key] = value;
    console.log(`${this.prefix} Extra set:`, { key, value });
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.enabled) return;

    this.contexts[key] = context;
    console.log(`${this.prefix} Context set:`, { context, key });
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled) return;

    this.breadcrumbs.push(breadcrumb);

    // Limit breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    console.log(`${this.prefix} Breadcrumb:`, breadcrumb);
  }

  startSession(): void {
    if (!this.enabled) return;

    console.log(`${this.prefix} Session started`, {
      timestamp: new Date().toISOString(),
      user: this.user,
    });
  }

  endSession(): void {
    if (!this.enabled) return;

    console.log(`${this.prefix} Session ended`, {
      timestamp: new Date().toISOString(),
      user: this.user,
    });
  }

  // Helper methods
  private mergeContext(context?: ObservabilityContext): ObservabilityContext {
    return {
      ...context,
      contexts: this.contexts,
      extra: { ...this.extras, ...context?.extra },
      tags: { ...this.tags, ...context?.tags },
      user: this.user,
    };
  }

  private mapLogLevel(level: string): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case 'trace':
      case 'debug':
        return 'log';
      case 'info':
        return 'info';
      case 'warn':
      case 'warning':
        return 'warn';
      case 'error':
      case 'fatal':
        return 'error';
      default:
        return 'log';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
