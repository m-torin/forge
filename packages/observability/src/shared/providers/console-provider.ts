/**
 * Console provider for development observability
 */

import { ConsoleConfig } from '../types/console-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../types/types';

export class ConsoleProvider implements ObservabilityProvider {
  readonly name = 'console';
  private breadcrumbs: Breadcrumb[] = [];
  private config: ConsoleConfig = {};
  private contexts: Record<string, any> = {};
  private enabled = true;
  private extras: Record<string, any> = {};
  private maxBreadcrumbs = 100;
  private prefix = '[OBS]';
  private tags: Record<string, any> = {};
  private user: any = null;

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled) return;

    this.breadcrumbs.push(breadcrumb);

    // Limit breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    console.log(`${this.prefix} Breadcrumb:`, breadcrumb);
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.enabled) return;

    const errorInfo = {
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      context: this.mergeContext(context),
      message: (error as Error)?.message || 'Unknown error',
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    console.error(`${this.prefix} Exception captured:`, errorInfo);
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
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

  endSession(): void {
    if (!this.enabled) return;

    console.log(`${this.prefix} Session ended`, {
      timestamp: new Date().toISOString(),
      user: this.user,
    });
  }

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

  setContext(key: string, context: Record<string, any>): void {
    if (!this.enabled) return;

    this.contexts[key] = context;
    console.log(`${this.prefix} Context set:`, { context, key });
  }

  setExtra(key: string, value: any): void {
    if (!this.enabled) return;

    this.extras[key] = value;
    console.log(`${this.prefix} Extra set:`, { key, value });
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.enabled) return;

    this.tags[key] = value;
    console.log(`${this.prefix} Tag set:`, { key, value });
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.enabled) return;

    this.user = user;
    console.log(`${this.prefix} User set:`, user);
  }

  startSession(): void {
    if (!this.enabled) return;

    console.log(`${this.prefix} Session started`, {
      timestamp: new Date().toISOString(),
      user: this.user,
    });
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
          duration: `${duration}ms`,
          id: span.id,
          name: span.name,
        });
      },
    };
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.enabled) return null;

    const transaction = {
      context: this.mergeContext(context),
      id: this.generateId(),
      name,
      startTime: Date.now(),
    };

    console.log(`${this.prefix} Transaction started:`, {
      context: transaction.context,
      id: transaction.id,
      name: transaction.name,
    });

    return {
      finish: () => {
        const duration = Date.now() - transaction.startTime;
        console.log(`${this.prefix} Transaction finished:`, {
          duration: `${duration}ms`,
          id: transaction.id,
          name: transaction.name,
        });
      },
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private mapLogLevel(level: string): 'error' | 'info' | 'log' | 'warn' {
    switch (level) {
      case 'debug':
      case 'trace':
        return 'log';
      case 'error':
      case 'fatal':
        return 'error';
      case 'info':
        return 'info';
      case 'warn':
      case 'warning':
        return 'warn';
      default:
        return 'log';
    }
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
}
