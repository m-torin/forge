/**
 * AsyncLocalStorage Context Manager for Node.js 22+
 * Provides request context tracking without explicit parameter passing
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  sessionId?: string;
  userId?: string;
  toolName?: string;
  startTime: number;
  metadata: Record<string, any>;
  performanceMarks: Array<{
    name: string;
    timestamp: number;
    duration?: number;
  }>;
  correlationId?: string;
  traceId?: string;
  parentSpanId?: string;
}

export interface ContextSnapshot {
  context: RequestContext;
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
}

/**
 * Global AsyncLocalStorage instance for request context
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Context Manager for tracking request context across async operations
 */
export class ContextManager {
  private static instance: ContextManager | null = null;
  private contextHistory: Map<string, ContextSnapshot[]> = new Map();
  private maxHistorySize: number = 100;
  private contextCount: number = 0;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * Run a function within a new request context
   */
  async runWithContext<T>(
    contextData: Partial<RequestContext>,
    fn: () => Promise<T> | T,
  ): Promise<T> {
    const context: RequestContext = {
      requestId: this.generateRequestId(),
      startTime: Date.now(),
      metadata: {},
      performanceMarks: [],
      ...contextData,
    };

    // Store context snapshot
    this.storeContextSnapshot(context);

    return asyncLocalStorage.run(context, async () => {
      try {
        this.addPerformanceMark('context_start');
        const result = await fn();
        this.addPerformanceMark('context_end');
        return result;
      } catch (error) {
        this.addPerformanceMark('context_error');
        this.addMetadata('error', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      } finally {
        this.finalizeContext();
      }
    });
  }

  /**
   * Get the current request context
   */
  getCurrentContext(): RequestContext | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Add metadata to the current context
   */
  addMetadata(key: string, value: any): void {
    const context = this.getCurrentContext();
    if (context) {
      context.metadata[key] = value;
    }
  }

  /**
   * Add a performance mark to the current context
   */
  addPerformanceMark(name: string): void {
    const context = this.getCurrentContext();
    if (context) {
      const timestamp = performance.now();
      const previousMark = context.performanceMarks[context.performanceMarks.length - 1];

      const mark = {
        name,
        timestamp,
        duration: previousMark ? timestamp - previousMark.timestamp : undefined,
      };

      context.performanceMarks.push(mark);
    }
  }

  /**
   * Set correlation ID for distributed tracing
   */
  setCorrelationId(correlationId: string): void {
    const context = this.getCurrentContext();
    if (context) {
      context.correlationId = correlationId;
    }
  }

  /**
   * Set trace and span IDs for tracing
   */
  setTracing(traceId: string, parentSpanId?: string): void {
    const context = this.getCurrentContext();
    if (context) {
      context.traceId = traceId;
      context.parentSpanId = parentSpanId;
    }
  }

  /**
   * Get context history for a specific session
   */
  getContextHistory(sessionId: string): ContextSnapshot[] {
    return this.contextHistory.get(sessionId) || [];
  }

  /**
   * Get all context snapshots
   */
  getAllContextHistory(): Map<string, ContextSnapshot[]> {
    return new Map(this.contextHistory);
  }

  /**
   * Clear context history
   */
  clearContextHistory(sessionId?: string): void {
    if (sessionId) {
      this.contextHistory.delete(sessionId);
    } else {
      this.contextHistory.clear();
    }
  }

  /**
   * Get context statistics
   */
  getContextStats(): {
    totalContexts: number;
    activeSessions: number;
    avgContextDuration: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    const allSnapshots = Array.from(this.contextHistory.values()).flat();
    const avgDuration =
      allSnapshots.length > 0
        ? allSnapshots.reduce((sum, snap) => {
            const marks = snap.context.performanceMarks;
            const startMark = marks.find(m => m.name === 'context_start');
            const endMark = marks.find(m => m.name === 'context_end');
            const duration = endMark && startMark ? endMark.timestamp - startMark.timestamp : 0;
            return sum + duration;
          }, 0) / allSnapshots.length
        : 0;

    return {
      totalContexts: this.contextCount,
      activeSessions: this.contextHistory.size,
      avgContextDuration: avgDuration,
      memoryUsage: process.memoryUsage(),
    };
  }

  private storeContextSnapshot(context: RequestContext): void {
    this.contextCount++;

    const snapshot: ContextSnapshot = {
      context: { ...context },
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
    };

    if (context.sessionId) {
      let history = this.contextHistory.get(context.sessionId);
      if (!history) {
        history = [];
        this.contextHistory.set(context.sessionId, history);
      }

      history.push(snapshot);

      // Limit history size
      if (history.length > this.maxHistorySize) {
        history.shift(); // Remove oldest entry
      }
    }
  }

  private finalizeContext(): void {
    const context = this.getCurrentContext();
    if (context && context.sessionId) {
      // Update the stored snapshot with final state
      const history = this.contextHistory.get(context.sessionId);
      if (history && history.length > 0) {
        const lastSnapshot = history[history.length - 1];
        if (lastSnapshot.context.requestId === context.requestId) {
          lastSnapshot.context = { ...context };
          lastSnapshot.memoryUsage = process.memoryUsage();
        }
      }
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }
}

/**
 * Global context manager instance
 */
export const globalContextManager = ContextManager.getInstance();

/**
 * Convenience functions for context management
 */

export function runWithContext<T>(
  contextData: Partial<RequestContext>,
  fn: () => Promise<T> | T,
): Promise<T> {
  return globalContextManager.runWithContext(contextData, fn);
}

export function getCurrentContext(): RequestContext | undefined {
  return globalContextManager.getCurrentContext();
}

export function addContextMetadata(key: string, value: any): void {
  globalContextManager.addMetadata(key, value);
}

export function addPerformanceMark(name: string): void {
  globalContextManager.addPerformanceMark(name);
}

export function setCorrelationId(correlationId: string): void {
  globalContextManager.setCorrelationId(correlationId);
}

export function setTracing(traceId: string, parentSpanId?: string): void {
  globalContextManager.setTracing(traceId, parentSpanId);
}

/**
 * Decorator for automatically wrapping functions with context
 */
export function withContext(contextData: Partial<RequestContext> = {}) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      return runWithContext(
        {
          toolName: `${target.constructor.name}.${propertyKey}`,
          ...contextData,
        },
        () => originalMethod.apply(this, args),
      );
    } as T;

    return descriptor;
  };
}

/**
 * Middleware for wrapping async operations with context
 */
export async function withAsyncContext<T>(
  operation: () => Promise<T>,
  contextData: Partial<RequestContext> = {},
): Promise<T> {
  return runWithContext(contextData, operation);
}

/**
 * Context-aware logging helper
 */
export function createContextLogger(baseName: string) {
  return {
    info: (message: string, ...args: any[]) => {
      const context = getCurrentContext();
      const prefix = context
        ? `[${baseName}:${context.requestId}${context.sessionId ? ':' + context.sessionId : ''}]`
        : `[${baseName}]`;
      console.log(prefix, message, ...args);
    },

    error: (message: string, error?: Error, ...args: any[]) => {
      const context = getCurrentContext();
      const prefix = context
        ? `[${baseName}:${context.requestId}${context.sessionId ? ':' + context.sessionId : ''}]`
        : `[${baseName}]`;
      console.error(prefix, message, error, ...args);

      if (context && error) {
        addContextMetadata('lastError', {
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
        });
      }
    },

    warn: (message: string, ...args: any[]) => {
      const context = getCurrentContext();
      const prefix = context
        ? `[${baseName}:${context.requestId}${context.sessionId ? ':' + context.sessionId : ''}]`
        : `[${baseName}]`;
      console.warn(prefix, message, ...args);
    },

    debug: (message: string, ...args: any[]) => {
      const context = getCurrentContext();
      if (context?.metadata.debug) {
        const prefix = `[${baseName}:${context.requestId}${context.sessionId ? ':' + context.sessionId : ''}]`;
        console.debug(prefix, message, ...args);
      }
    },
  };
}

/**
 * Context propagation for worker threads
 */
export function getContextForWorker(): Record<string, any> {
  const context = getCurrentContext();
  if (!context) return {};

  return {
    requestId: context.requestId,
    sessionId: context.sessionId,
    userId: context.userId,
    correlationId: context.correlationId,
    traceId: context.traceId,
    parentSpanId: context.parentSpanId,
    metadata: { ...context.metadata },
  };
}

/**
 * Restore context in worker thread
 */
export function restoreContextFromWorker(
  contextData: Record<string, any>,
): Partial<RequestContext> {
  return {
    requestId:
      contextData.requestId || `worker_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`,
    sessionId: contextData.sessionId,
    userId: contextData.userId,
    correlationId: contextData.correlationId,
    traceId: contextData.traceId,
    parentSpanId: contextData.parentSpanId,
    metadata: { ...contextData.metadata, fromWorker: true },
  };
}

/**
 * Stream context propagation
 */
export async function* withContextStream<T>(
  generator: AsyncGenerator<T, void, unknown>,
  contextData: Partial<RequestContext> = {},
): AsyncGenerator<T, void, unknown> {
  yield* asyncLocalStorage.run(
    {
      requestId:
        globalContextManager.getCurrentContext()?.requestId ||
        `stream_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`,
      startTime: Date.now(),
      metadata: {},
      performanceMarks: [],
      ...contextData,
    },
    async function* () {
      try {
        addPerformanceMark('stream_start');
        for await (const item of generator) {
          yield item;
        }
        addPerformanceMark('stream_end');
      } catch (error) {
        addPerformanceMark('stream_error');
        addContextMetadata('streamError', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
  );
}
