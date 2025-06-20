/**
 * Analytics Logger for Client Environments
 *
 * This file provides logging functionality for analytics operations in client/browser
 * environments without any server dependencies like observability.
 *
 * Uses native console methods for compatibility with all environments.
 */

export interface AnalyticsLogContext {
  provider?: string;
  operation?: string;
  event?: string;
  userId?: string;
  duration?: number;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class AnalyticsLogger {
  private static instance?: AnalyticsLogger;
  private readonly isDevelopment: boolean;
  private readonly prefix = '[Analytics]';

  private constructor() {
    // Check if we're in development mode
    this.isDevelopment =
      typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false;
  }

  static getInstance(): AnalyticsLogger {
    AnalyticsLogger.instance ??= new AnalyticsLogger();
    return AnalyticsLogger.instance;
  }

  async logError(error: Error, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    // Always log errors
    console.error(`${this.prefix} Error:`, error.message, {
      error: error.stack,
      ...this.formatContext(context),
    });
  }

  async logWarning(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    // Always log warnings
    console.warn(`${this.prefix} Warning:`, message, this.formatContext(context));
  }

  async logInfo(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    // Only log info in development
    if (this.isDevelopment) {
      console.info(`${this.prefix} Info:`, message, this.formatContext(context));
    }
  }

  async logDebug(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    // Only log debug in development
    if (this.isDevelopment) {
      console.debug(`${this.prefix} Debug:`, message, this.formatContext(context));
    }
  }

  async logPerformance(context: AnalyticsLogContext): Promise<void> {
    if (!context.duration || !this.isDevelopment) {
      return;
    }

    const message = `${this.prefix} Performance:`;
    const data = {
      ...this.formatContext(context),
      duration: `${context.duration}ms`,
      slow: context.duration > 1000,
    };

    if (context.duration > 1000) {
      console.warn(message, 'Slow operation detected', data);
    } else {
      console.debug(message, data);
    }
  }

  private formatContext(context: Partial<AnalyticsLogContext>): Record<string, any> {
    return {
      ...(context.provider && { provider: context.provider }),
      ...(context.operation && { operation: context.operation }),
      ...(context.event && { event: context.event }),
      ...(context.userId && { userId: context.userId }),
      ...(context.duration && { duration: `${context.duration}ms` }),
      ...(context.properties && { properties: context.properties }),
      ...(context.metadata && { metadata: context.metadata }),
      timestamp: context.timestamp ?? new Date().toISOString(),
    };
  }
}

export const analyticsLogger = AnalyticsLogger.getInstance();
