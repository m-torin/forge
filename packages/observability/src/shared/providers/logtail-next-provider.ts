/**
 * Better Stack provider for Next.js applications
 * Enhanced implementation leveraging @logtail/next optimizations
 * Maintains unified observability interface while using Better Stack's native features
 */

import { Logger } from '@logtail/next';

import { isDevelopment } from '../../../env';
import { LogtailConfig } from '../types/logtail-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../types/types';

export class LogtailNextProvider implements ObservabilityProvider {
  readonly name = 'logtail';
  private config: LogtailConfig = {} as LogtailConfig;
  private isDevelopment = isDevelopment();
  private isInitialized = false;
  private logger: Logger | null = null;
  private sentryProvider: any = null; // Cross-provider coordination

  async addBreadcrumb(breadcrumb: Breadcrumb): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    // Log breadcrumb as debug event
    this.logger.debug('Breadcrumb', {
      category: breadcrumb.category,
      data: breadcrumb.data,
      level: breadcrumb.level,
      message: breadcrumb.message,
      timestamp: breadcrumb.timestamp,
    });
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized) {
      if (this.isDevelopment) {
        throw new Error(
          `[Better Stack Fallback] Exception: ${(error as Error)?.message || 'Unknown error'} - Context: ${JSON.stringify(context)}`,
        );
      }
      return;
    }

    if (!this.logger) return;

    // Create enhanced context with cross-provider coordination
    const logContext = {
      error: {
        message: (error as Error)?.message || 'Unknown error',
        name: error.name,
        stack: error.stack,
      },
      ...context,
    };

    // Add Sentry correlation if available
    if (this.sentryProvider) {
      const sentryEventId = (this.sentryProvider as any).lastEventId;
      if (sentryEventId) {
        (logContext as any).sentryEventId = sentryEventId;
      }
    }

    this.logger.error('Exception captured', logContext);

    // Auto-flush for server components (as per Better Stack docs)
    if (typeof window === 'undefined') {
      await this.logger.flush();
    }
  }

  async captureMessage(
    message: string,
    level: 'debug' | 'error' | 'info' | 'warning' = 'info',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    const logContext = {
      ...context,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case 'debug':
        this.logger.debug(message, logContext);
        break;
      case 'error':
        this.logger.error(message, logContext);
        break;
      case 'info':
        this.logger.info(message, logContext);
        break;
      case 'warning':
        this.logger.warn(message, logContext);
        break;
    }
  }

  async flush(): Promise<void> {
    if (!this.isInitialized) return;

    if (!this.logger) {
      if (this.isDevelopment) {
        console.log('[Better Stack Fallback] Flush called (no-op in fallback mode)');
      }
      return;
    }

    try {
      await this.logger.flush();
    } catch (error: any) {
      throw new Error(`[Better Stack] Failed to flush logs: ${error}`);
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    // Set user context
    this.logger.info('User identified', {
      traits,
      userId,
    });
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as LogtailConfig;

    // In development, still initialize but with console fallback
    if (this.isDevelopment && !this.config.sourceToken) {
      console.warn(
        '[Better Stack] No source token provided, using console fallback in development',
      );
      this.isInitialized = true;
      return;
    }

    if (!this.config.sourceToken) {
      throw new Error('Better Stack source token is required for production');
    }

    try {
      // Use Better Stack's optimized Next.js logger
      this.logger = new Logger({
        source: this.config.application || 'nextjs-app',
        // Better Stack specific optimizations
        ...this.config.options,
      });

      this.isInitialized = true;

      if (this.isDevelopment) {
        console.log('[Better Stack] Initialized successfully');
      }
    } catch (error: any) {
      console.error('[Better Stack] Failed to initialize:', error);
      // In development, fallback to console instead of throwing
      if (this.isDevelopment) {
        console.warn('[Better Stack] Falling back to console logging');
        this.isInitialized = true;
        return;
      }
      throw error;
    }
  }

  async log(
    level: 'debug' | 'error' | 'info' | 'warning',
    message: string,
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized) {
      if (this.isDevelopment) {
        console[level === 'warning' ? 'warn' : level](
          `[Better Stack Fallback] ${message}`,
          context,
        );
      }
      return;
    }

    if (!this.logger) return;

    const logContext = {
      ...context,
      timestamp: new Date().toISOString(),
    };

    // Use Better Stack's optimized logging methods
    const logMethod = level === 'warning' ? 'warn' : level;
    this.logger[logMethod](message, logContext);

    // Auto-flush for server components (as per Better Stack docs)
    if (typeof window === 'undefined') {
      await this.logger.flush();
    }
  }

  async setContext(key: string, context: Record<string, any>): Promise<void> {
    if (!this.isInitialized || !this.logger) return;

    // Log context update
    this.logger.debug('Context updated', { context, contextKey: key });
  }

  // Cross-provider coordination
  setSentryProvider(sentryProvider: any): void {
    this.sentryProvider = sentryProvider;
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.logger) return null;

    // Log transaction start
    this.logger.info('Transaction started', { transaction: name, ...context });

    // Return a mock transaction that logs when finished
    return {
      finish: () => {
        this.logger?.info('Transaction finished', { transaction: name, ...context });
      },
    };
  }

  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.isInitialized || !this.logger) return;

    this.logger.info('Performance metric', {
      duration,
      operation,
      ...metadata,
    });
  }
}
