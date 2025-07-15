/**
 * Logtail/BetterStack provider for server-side production logging
 * Server-specific implementation using @logtail/js for non-Next.js environments
 */

import { safeEnv } from '../../../env';
import { LogtailConfig } from '../../shared/types/logtail-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class LogtailServerProvider implements ObservabilityProvider {
  readonly name = 'logtail';
  private client: any;
  private config: LogtailConfig = {} as LogtailConfig;
  private isDevelopment = safeEnv().NODE_ENV !== 'production';
  private isInitialized = false;

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized) return;

    // Log breadcrumb as a debug entry
    this.log('debug', 'Breadcrumb', {
      breadcrumb: {
        category: breadcrumb.category,
        data: breadcrumb.data,
        level: breadcrumb.level,
        message: breadcrumb.message,
        timestamp: breadcrumb.timestamp || Date.now(),
        type: breadcrumb.type,
      },
    });
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized) return;

    const errorData = {
      error: {
        message: (error as Error)?.message || 'Unknown error',
        name: error.name,
        stack: error.stack,
      },
      level: context?.level || 'error',
      ...this.buildContext(context),
    };

    if (this.client) {
      await this.client.error('Exception captured', errorData);
    } else if (this.isDevelopment) {
      throw new Error(`Exception captured: ${JSON.stringify(errorData)}`);
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized) return;

    const messageData = {
      level,
      ...this.buildContext(context),
    };

    if (this.client) {
      switch (level) {
        case 'error':
          await this.client.error(message, messageData);
          break;
        case 'warning':
          await this.client.warn(message, messageData);
          break;
        case 'info':
        default:
          await this.client.info(message, messageData);
          break;
      }
    } else if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
      console[consoleMethod](message, messageData);
    }
  }

  endSession(): void {
    if (!this.isInitialized) return;

    this.log('info', 'Session ended', {
      timestamp: Date.now(),
    });
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as LogtailConfig;

    // In development, only use console unless explicitly configured
    if (this.isDevelopment && !this.config.sendLogsToConsoleInDev) {
      this.isInitialized = true;
      return;
    }

    if (!this.config.sourceToken) {
      throw new Error('Logtail source token is required');
    }

    try {
      // Dynamically import Logtail to avoid bundling if not used
      const { Logtail } = await import('@logtail/node');

      this.client = new Logtail(this.config.sourceToken, {
        batchInterval: this.config.batchInterval || 1000,
        batchSize: this.config.batchSize || 100,
        endpoint: this.config.endpoint,
        retryCount: this.config.retryCount || 3,
      });

      // Set context that will be included with every log
      if (this.config.application) {
        this.client.use((log: any) => ({
          ...log,
          application: this.config.application,
          environment: this.config.environment || 'production',
          release: this.config.release,
        }));
      }

      this.isInitialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize Logtail: ${error}`);
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isInitialized) return;

    const logData = {
      ...metadata,
      level,
    };

    if (this.client) {
      // Map custom levels to Logtail methods
      switch (level.toLowerCase()) {
        case 'debug':
        case 'trace':
          await this.client.debug(message, logData);
          break;
        case 'error':
        case 'fatal':
          await this.client.error(message, logData);
          break;
        case 'info':
          await this.client.info(message, logData);
          break;
        case 'warn':
        case 'warning':
          await this.client.warn(message, logData);
          break;
        default:
          await this.client.log(message, logData);
          break;
      }
    } else if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}]`, message, logData);
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.client) return;

    // Add context to all future logs
    this.client.use((log: any) => ({
      ...log,
      context: {
        ...log.context,
        [key]: context,
      },
    }));
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.client) return;

    // Add extra data to all future logs
    this.client.use((log: any) => ({
      ...log,
      extra: {
        ...log.extra,
        [key]: value,
      },
    }));
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized || !this.client) return;

    // Add tag to all future logs
    this.client.use((log: any) => ({
      ...log,
      tags: {
        ...log.tags,
        [key]: value,
      },
    }));
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized || !this.client) return;

    const { email, id, username, ...rest } = user;
    // Add user context to all future logs
    this.client.use((log: any) => ({
      ...log,
      user: {
        email,
        id,
        username,
        ...rest,
      },
    }));
  }

  startSession(): void {
    if (!this.isInitialized) return;

    this.log('info', 'Session started', {
      sessionId: this.generateId(),
      timestamp: Date.now(),
    });
  }

  startSpan(_name: string, _parentSpan?: any): any {
    // Logtail doesn't support spans, return a no-op
    return null;
  }

  // Logtail doesn't support transactions/spans directly
  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized) return null;

    const transactionId = this.generateId();
    const startTime = Date.now();

    // Log transaction start
    this.log('info', `Transaction started: ${name}`, {
      transactionId,
      transactionName: name,
      ...this.buildContext(context),
    });

    return {
      finish: () => {
        const duration = Date.now() - startTime;
        this.log('info', `Transaction completed: ${name}`, {
          duration,
          durationUnit: 'ms',
          transactionId,
          transactionName: name,
        });
      },
    };
  }

  // Helper methods
  private buildContext(context?: ObservabilityContext): Record<string, any> {
    if (!context) return {};

    return {
      environment: context.environment,
      extra: context.extra,
      organizationId: context.organizationId,
      platform: context.platform,
      release: context.release,
      requestId: context.requestId,
      serverName: context.serverName,
      sessionId: context.sessionId,
      spanId: context.spanId,
      tags: context.tags,
      traceId: context.traceId,
      transaction: context.transaction,
      userId: context.userId,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
