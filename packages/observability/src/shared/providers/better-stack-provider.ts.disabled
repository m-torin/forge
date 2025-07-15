/**
 * Better Stack provider for comprehensive logging, error tracking, and performance monitoring
 * Extends the basic Logtail provider with Better Stack-specific features
 */

import type { BetterStackConfig, BetterStackMetrics, BetterStackTrace, BetterStackSpan, BetterStackEvent } from '../types/better-stack-types';
import type {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../types/types';

export class BetterStackProvider implements ObservabilityProvider {
  readonly name = 'better-stack';
  private client: any;
  private isInitialized = false;
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private config: BetterStackConfig = {} as BetterStackConfig;
  private metrics: BetterStackMetrics = {
    logsCount: 0,
    errorsCount: 0,
    warningsCount: 0,
    lastLogTime: 0,
    bufferSize: 0,
    failureCount: 0,
  };
  private traces = new Map<string, BetterStackTrace>();
  private activeSpans = new Map<string, BetterStackSpan>();
  private middleware: Array<(log: any) => any> = [];

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as BetterStackConfig;

    if (!this.config.sourceToken) {
      throw new Error('Better Stack source token is required');
    }

    // In development, optionally skip client initialization but still validate config
    if (this.isDevelopment && !this.config.sendLogsToConsoleInDev) {
      this.isInitialized = true;
      return;
    }

    try {
      // Dynamically import Logtail (Better Stack's logging client)
      const { Logtail } = await import('@logtail/node');

      this.client = new Logtail(this.config.sourceToken, {
        batchInterval: this.config.batchInterval || 1000,
        batchSize: this.config.batchSize || 100,
        endpoint: this.config.endpoint,
        retryCount: this.config.retryCount || 3,
      });

      // Set up global context middleware
      this.setupGlobalContext();

      // Set up error capturing if enabled
      if (this.config.captureErrors !== false) {
        this.setupErrorCapturing();
      }

      // Set up console capturing if enabled
      if (this.config.captureConsole) {
        this.setupConsoleCapturing();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Better Stack:', error);
      throw error;
    }
  }

  private setupGlobalContext(): void {
    if (!this.client) return;

    // Add application metadata
    this.client.use((log: any) => ({
      ...log,
      application: this.config.application,
      environment: this.config.environment || process.env.NODE_ENV || 'production',
      release: this.config.release || process.env.VERCEL_GIT_COMMIT_SHA,
      version: this.config.version,
      hostname: process.env.HOSTNAME || 'unknown',
      pid: process.pid,
      ...this.config.defaultContext,
    }));

    // Add global tags if provided
    if (this.config.globalTags) {
      this.client.use((log: any) => ({
        ...log,
        tags: {
          ...log.tags,
          ...this.config.globalTags,
        },
      }));
    }
  }

  private setupErrorCapturing(): void {
    if (typeof process === 'undefined') return;

    // Capture unhandled exceptions
    process.on('uncaughtException', (error) => {
      this.captureException(error, { level: 'fatal', source: 'uncaughtException' });
    });

    // Capture unhandled promise rejections
    if (this.config.captureRejections !== false) {
      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.captureException(error, { level: 'error', source: 'unhandledRejection' });
      });
    }
  }

  private setupConsoleCapturing(): void {
    if (typeof console === 'undefined') return;

    const originalMethods = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    // Override console methods to capture logs
    console.log = (...args) => {
      originalMethods.log(...args);
      this.log('info', args.join(' '), { source: 'console.log' });
    };

    console.error = (...args) => {
      originalMethods.error(...args);
      this.log('error', args.join(' '), { source: 'console.error' });
    };

    console.warn = (...args) => {
      originalMethods.warn(...args);
      this.log('warn', args.join(' '), { source: 'console.warn' });
    };

    console.info = (...args) => {
      originalMethods.info(...args);
      this.log('info', args.join(' '), { source: 'console.info' });
    };

    console.debug = (...args) => {
      originalMethods.debug(...args);
      this.log('debug', args.join(' '), { source: 'console.debug' });
    };
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized) return;

    this.metrics.errorsCount++;
    this.metrics.lastLogTime = Date.now();

    const errorEvent: BetterStackEvent = {
      timestamp: Date.now(),
      level: context?.level || 'error',
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      ...this.buildContext(context),
    };

    // Apply sampling if configured
    if (this.shouldSample()) {
      if (this.client) {
        await this.client.error('Exception captured', errorEvent);
      } else if (this.isDevelopment) {
        console.error('Exception captured:', errorEvent);
      }
    }
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized) return;

    this.metrics.logsCount++;
    if (level === 'warning') this.metrics.warningsCount++;
    this.metrics.lastLogTime = Date.now();

    const messageEvent: BetterStackEvent = {
      timestamp: Date.now(),
      level,
      message,
      ...this.buildContext(context),
    };

    // Apply sampling if configured
    if (this.shouldSample()) {
      if (this.client) {
        switch (level) {
          case 'error':
            await this.client.error(message, messageEvent);
            break;
          case 'warning':
            await this.client.warn(message, messageEvent);
            break;
          case 'info':
          default:
            await this.client.info(message, messageEvent);
            break;
        }
      } else if (this.isDevelopment) {
        const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
        console[consoleMethod](message, messageEvent);
      }
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isInitialized) return;

    this.metrics.logsCount++;
    this.metrics.lastLogTime = Date.now();

    const logEvent: BetterStackEvent = {
      timestamp: Date.now(),
      level,
      message,
      ...metadata,
    };

    // Apply ignore patterns
    if (this.shouldIgnore(message)) {
      return;
    }

    // Apply sampling if configured
    if (this.shouldSample()) {
      if (this.client) {
        // Map custom levels to Better Stack methods
        switch (level.toLowerCase()) {
          case 'trace':
          case 'debug':
            await this.client.debug(message, logEvent);
            break;
          case 'info':
            await this.client.info(message, logEvent);
            break;
          case 'warn':
          case 'warning':
            await this.client.warn(message, logEvent);
            break;
          case 'error':
          case 'fatal':
            await this.client.error(message, logEvent);
            break;
          default:
            await this.client.log(message, logEvent);
            break;
        }
      } else if (this.isDevelopment) {
        console.log(`[${level.toUpperCase()}]`, message, logEvent);
      }
    }
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized) return null;

    const traceId = this.generateId();
    const startTime = Date.now();

    const trace: BetterStackTrace = {
      id: traceId,
      name,
      startTime,
      status: 'pending',
      spans: [],
      metadata: context,
    };

    this.traces.set(traceId, trace);

    // Log transaction start
    this.log('info', `Transaction started: ${name}`, {
      traceId,
      transactionName: name,
      ...this.buildContext(context),
    });

    return {
      id: traceId,
      name,
      startTime,
      finish: (status: 'success' | 'error' = 'success') => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        trace.endTime = endTime;
        trace.duration = duration;
        trace.status = status;

        // Log transaction completion
        this.log('info', `Transaction completed: ${name}`, {
          traceId,
          transactionName: name,
          duration,
          durationUnit: 'ms',
          status,
          performance: {
            duration,
          },
        });

        this.traces.delete(traceId);
      },
      setTag: (key: string, value: string | number | boolean) => {
        if (trace.metadata) {
          trace.metadata.tags = { ...trace.metadata.tags, [key]: value };
        }
      },
      setData: (key: string, value: any) => {
        if (trace.metadata) {
          trace.metadata.extra = { ...trace.metadata.extra, [key]: value };
        }
      },
    };
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.isInitialized) return null;

    const spanId = this.generateId();
    const startTime = Date.now();
    const parentId = parentSpan?.id;

    const span: BetterStackSpan = {
      id: spanId,
      name,
      parentId,
      startTime,
    };

    this.activeSpans.set(spanId, span);

    return {
      id: spanId,
      name,
      startTime,
      parentId,
      finish: () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        span.endTime = endTime;
        span.duration = duration;

        // Log span completion
        this.log('debug', `Span completed: ${name}`, {
          spanId,
          spanName: name,
          parentId,
          duration,
          durationUnit: 'ms',
        });

        this.activeSpans.delete(spanId);
      },
      setTag: (key: string, value: string | number | boolean) => {
        span.tags = { ...span.tags, [key]: value };
      },
      log: (data: any) => {
        if (!span.logs) span.logs = [];
        span.logs.push({ timestamp: Date.now(), ...data });
      },
    };
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isInitialized || !this.client) return;

    const { id, username, email, ...rest } = user;
    // Add user context to all future logs
    this.client.use((log: any) => ({
      ...log,
      user: {
        id,
        username,
        email,
        ...rest,
      },
    }));
  }

  setTag(key: string, value: string | number | boolean): void {
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

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized) return;

    // Log breadcrumb as a debug entry with Better Stack structure
    this.log('debug', breadcrumb.message || 'Breadcrumb', {
      breadcrumb: {
        type: breadcrumb.type,
        category: breadcrumb.category,
        data: breadcrumb.data,
        level: breadcrumb.level,
        message: breadcrumb.message,
        timestamp: breadcrumb.timestamp || Date.now(),
      },
    });
  }

  startSession(): void {
    if (!this.isInitialized) return;

    const sessionId = this.generateId();
    this.log('info', 'Session started', {
      sessionId,
      timestamp: Date.now(),
      sessionEvent: 'start',
    });
  }

  endSession(): void {
    if (!this.isInitialized) return;

    this.log('info', 'Session ended', {
      timestamp: Date.now(),
      sessionEvent: 'end',
      metrics: this.getMetrics(),
    });
  }

  // Better Stack specific methods
  
  /**
   * Get current metrics
   */
  getMetrics(): BetterStackMetrics {
    return { ...this.metrics };
  }

  /**
   * Flush any pending logs
   */
  async flush(): Promise<void> {
    if (this.client && typeof this.client.flush === 'function') {
      await this.client.flush();
    }
  }

  /**
   * Add middleware function
   */
  use(middleware: (log: any) => any): void {
    this.middleware.push(middleware);
    if (this.client) {
      this.client.use(middleware);
    }
  }

  // Helper methods
  private buildContext(context?: ObservabilityContext): Record<string, any> {
    if (!context) return {};

    const builtContext: Record<string, any> = {};

    // Standard fields
    if (context.environment) builtContext.environment = context.environment;
    if (context.organizationId) builtContext.organizationId = context.organizationId;
    if (context.userId) builtContext.userId = context.userId;
    if (context.requestId) builtContext.requestId = context.requestId;
    if (context.sessionId) builtContext.sessionId = context.sessionId;
    if (context.traceId) builtContext.traceId = context.traceId;
    if (context.spanId) builtContext.spanId = context.spanId;
    if (context.platform) builtContext.platform = context.platform;
    if (context.serverName) builtContext.serverName = context.serverName;
    if (context.release) builtContext.release = context.release;
    if (context.transaction) builtContext.transaction = context.transaction;

    // Tags and extra data
    if (context.tags) builtContext.tags = context.tags;
    if (context.extra) builtContext.extra = context.extra;

    return builtContext;
  }

  private shouldSample(): boolean {
    if (this.config.sampleRate === undefined || this.config.sampleRate === null) return true;
    return Math.random() < this.config.sampleRate;
  }

  private shouldIgnore(message: string): boolean {
    if (!this.config.ignorePatterns) return false;
    
    return this.config.ignorePatterns.some(pattern => {
      try {
        return new RegExp(pattern).test(message);
      } catch {
        return false;
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}