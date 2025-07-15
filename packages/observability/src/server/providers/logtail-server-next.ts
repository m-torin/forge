/**
 * Logtail/BetterStack provider for Next.js server-side
 * Uses @logtail/next for Next.js-optimized logging
 */

import { Logger } from '@logtail/next';

import { safeEnv } from '../../../env';
import { LogtailConfig } from '../../shared/types/logtail-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class LogtailServerNextProvider implements ObservabilityProvider {
  readonly name = 'logtail';
  private logger: Logger | null = null;
  private config: LogtailConfig = {} as LogtailConfig;
  private isDevelopment = safeEnv().NODE_ENV !== 'production';
  private isInitialized = false;

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized || !this.logger) return;

    // Log breadcrumb as a debug entry
    this.logger.debug('Breadcrumb', {
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
    if (!this.isInitialized || !this.logger) return;

    const errorData = {
      error: {
        message: (error as Error)?.message || 'Unknown error',
        name: error.name,
        stack: error.stack,
      },
      level: context?.level || 'error',
      ...this.buildContext(context),
    };

    this.logger.error('Exception captured', errorData);

    // Flush immediately for server components
    if (typeof window === 'undefined') {
      await this.logger.flush();
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    const messageData = {
      level,
      ...this.buildContext(context),
    };

    switch (level) {
      case 'error':
        this.logger.error(message, messageData);
        break;
      case 'warning':
        this.logger.warn(message, messageData);
        break;
      case 'info':
      default:
        this.logger.info(message, messageData);
        break;
    }
  }

  endSession(): void {
    if (!this.isInitialized || !this.logger) return;

    this.logger.info('Session ended', {
      timestamp: Date.now(),
    });
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as LogtailConfig;

    // In development, only use console unless explicitly configured
    if (this.isDevelopment && !this.config.sourceToken) {
      console.warn('[Logtail] No source token provided, using console fallback in development');
      this.isInitialized = true;
      return;
    }

    if (!this.config.sourceToken) {
      throw new Error('Logtail source token is required');
    }

    try {
      // Create Logger instance from @logtail/next
      this.logger = new Logger({
        source: this.config.application || 'nextjs-server',
      });

      this.isInitialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize Logtail: ${error}`);
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    const logData = {
      ...metadata,
      level,
    };

    // Map custom levels to Logger methods
    switch (level.toLowerCase()) {
      case 'debug':
      case 'trace':
        this.logger.debug(message, logData);
        break;
      case 'error':
      case 'fatal':
        this.logger.error(message, logData);
        break;
      case 'info':
        this.logger.info(message, logData);
        break;
      case 'warn':
      case 'warning':
        this.logger.warn(message, logData);
        break;
      default:
        this.logger.info(message, logData);
        break;
    }

    // Auto-flush for server components
    if (typeof window === 'undefined') {
      await this.logger.flush();
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.logger) return;

    // Log context update
    this.logger.debug('Context updated', { contextKey: key, context });
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.logger) return;

    // Log extra data
    this.logger.debug('Extra data set', { extraKey: key, value });
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized || !this.logger) return;

    // Log tag
    this.logger.debug('Tag set', { tagKey: key, value });
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized || !this.logger) return;

    // Log user context
    this.logger.debug('User context set', { user });
  }

  startSession(): void {
    if (!this.isInitialized || !this.logger) return;

    this.logger.info('Session started', {
      sessionId: this.generateId(),
      timestamp: Date.now(),
    });
  }

  startSpan(_name: string, _parentSpan?: any): any {
    // Logtail doesn't support spans, return a no-op
    return null;
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.logger) return null;

    const transactionId = this.generateId();
    const startTime = Date.now();

    // Log transaction start
    this.logger.info(`Transaction started: ${name}`, {
      transactionId,
      transactionName: name,
      ...this.buildContext(context),
    });

    return {
      finish: async () => {
        if (!this.logger) return;

        const duration = Date.now() - startTime;
        this.logger.info(`Transaction completed: ${name}`, {
          duration,
          durationUnit: 'ms',
          transactionId,
          transactionName: name,
        });

        // Flush after transaction
        await this.logger.flush();
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
