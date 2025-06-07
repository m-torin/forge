export interface ExecutionContext {
  executionId: string;
  input: Record<string, any>;
  metadata: Record<string, any>;
  organizationId?: string;
  output?: Record<string, any>;
  userId?: string;
  workflowId: string;

  // Step execution data
  currentStep?: string;
  stepMetrics: Record<string, ExecutionMetrics>;
  stepResults: Record<string, any>;

  metrics: ExecutionMetrics;
  // Performance tracking
  startTime: number;
  stepStartTime?: number;

  priority?: 'low' | 'normal' | 'high';
  retries?: number;
  tags?: string[];
  // Configuration
  timeout?: number;

  abortSignal?: AbortSignal;
  error?: string;
  // Execution state
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface ExecutionMetrics {
  // Timing metrics
  duration?: number;
  queueWaitTime?: number;
  stepDuration?: number;

  cpuUsage?: NodeJS.CpuUsage;
  // Resource metrics
  memoryUsage?: NodeJS.MemoryUsage;

  // Custom metrics
  customMetrics: Record<string, number | string | boolean>;

  errorRate?: number;
  latency?: number;
  // Performance indicators
  throughput?: number;
}

export interface ExecutionHooks {
  afterExecution?: (context: ExecutionContext) => Promise<void>;
  afterStep?: (context: ExecutionContext, stepId: string, result: any) => Promise<void>;
  beforeExecution?: (context: ExecutionContext) => Promise<void>;
  beforeStep?: (context: ExecutionContext, stepId: string) => Promise<void>;
  onError?: (context: ExecutionContext, error: Error) => Promise<void>;
  onMetricsUpdate?: (context: ExecutionContext, metrics: ExecutionMetrics) => Promise<void>;
}

export class ExecutionContextManager {
  private contexts = new Map<string, ExecutionContext>();
  private hooks: ExecutionHooks = {};
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.initializePerformanceObserver();
  }

  // Context lifecycle management
  createContext(
    workflowId: string,
    input: Record<string, any>,
    options: {
      userId?: string;
      organizationId?: string;
      timeout?: number;
      retries?: number;
      priority?: 'low' | 'normal' | 'high';
      tags?: string[];
      metadata?: Record<string, any>;
    } = {},
  ): ExecutionContext {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const context: ExecutionContext = {
      executionId,
      input,
      metadata: options.metadata || {},
      metrics: {
        customMetrics: {},
      },
      organizationId: options.organizationId,
      priority: options.priority,
      retries: options.retries,
      startTime,
      status: 'pending',
      stepMetrics: {},
      stepResults: {},
      tags: options.tags,
      timeout: options.timeout,
      userId: options.userId,
      workflowId,
    };

    this.contexts.set(executionId, context);
    return context;
  }

  getContext(executionId: string): ExecutionContext | undefined {
    return this.contexts.get(executionId);
  }

  updateContext(executionId: string, updates: Partial<ExecutionContext>): void {
    const context = this.contexts.get(executionId);
    if (context) {
      Object.assign(context, updates);
    }
  }

  removeContext(executionId: string): void {
    this.contexts.delete(executionId);
  }

  // Performance tracking
  startStepExecution(executionId: string, stepId: string): void {
    const context = this.contexts.get(executionId);
    if (context) {
      context.currentStep = stepId;
      context.stepStartTime = Date.now();

      // Record baseline metrics
      this.recordMetrics(context, stepId);
    }
  }

  finishStepExecution(executionId: string, stepId: string, result: any): void {
    const context = this.contexts.get(executionId);
    if (context && context.stepStartTime) {
      const stepDuration = Date.now() - context.stepStartTime;

      // Store step result and metrics
      context.stepResults[stepId] = result;
      context.stepMetrics[stepId] = {
        customMetrics: {},
        duration: stepDuration,
        stepDuration,
      };

      // Record final metrics
      this.recordMetrics(context, stepId);

      // Update overall metrics
      this.updateExecutionMetrics(context);

      context.stepStartTime = undefined;
      context.currentStep = undefined;
    }
  }

  private recordMetrics(context: ExecutionContext, stepId: string): void {
    const metrics: ExecutionMetrics = {
      cpuUsage: process.cpuUsage(),
      customMetrics: {},
      memoryUsage: process.memoryUsage(),
    };

    // Add to step metrics if step is specified
    if (stepId && context.stepMetrics[stepId]) {
      Object.assign(context.stepMetrics[stepId], metrics);
    }

    // Update context metrics
    Object.assign(context.metrics, metrics);
  }

  private updateExecutionMetrics(context: ExecutionContext): void {
    if (context.status === 'completed' || context.status === 'failed') {
      context.metrics.duration = Date.now() - context.startTime;

      // Calculate throughput (steps per second)
      const stepCount = Object.keys(context.stepResults).length;
      if (context.metrics.duration && context.metrics.duration > 0) {
        context.metrics.throughput = stepCount / (context.metrics.duration / 1000);
      }

      // Calculate average step latency
      const stepDurations = Object.values(context.stepMetrics)
        .map((m) => m.stepDuration || 0)
        .filter((d) => d > 0);

      if (stepDurations.length > 0) {
        context.metrics.latency =
          stepDurations.reduce((sum, d) => sum + d, 0) / stepDurations.length;
      }
    }
  }

  // Custom metrics
  recordCustomMetric(
    executionId: string,
    key: string,
    value: number | string | boolean,
    stepId?: string,
  ): void {
    const context = this.contexts.get(executionId);
    if (context) {
      if (stepId && context.stepMetrics[stepId]) {
        context.stepMetrics[stepId].customMetrics[key] = value;
      }
      context.metrics.customMetrics[key] = value;
    }
  }

  // Hook management
  setHooks(hooks: Partial<ExecutionHooks>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  async executeHook(
    hookName: keyof ExecutionHooks,
    context: ExecutionContext,
    ...args: any[]
  ): Promise<void> {
    const hook = this.hooks[hookName] as any;
    if (hook && typeof hook === 'function') {
      try {
        await hook(context, ...args);
      } catch (error) {
        console.error(`Hook ${hookName} failed:`, error);
      }
    }
  }

  // Performance monitoring
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined') {
      // Node.js environment - use process monitoring
      return;
    }

    // Browser environment - use PerformanceObserver
    if ('PerformanceObserver' in globalThis) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.startsWith('workflow-')) {
            this.handlePerformanceEntry(entry);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    // Extract execution ID from performance mark name
    const executionId = entry.name.replace('workflow-', '').split('-')[0];
    const context = this.contexts.get(executionId);

    if (context) {
      context.metrics.customMetrics[entry.name] = entry.duration;
    }
  }

  // Execution lifecycle with hooks
  async startExecution(executionId: string): Promise<void> {
    const context = this.contexts.get(executionId);
    if (context) {
      context.status = 'running';
      this.recordMetrics(context, '');
      await this.executeHook('beforeExecution', context);
    }
  }

  async finishExecution(executionId: string, output?: any, error?: Error): Promise<void> {
    const context = this.contexts.get(executionId);
    if (context) {
      if (error) {
        context.status = 'failed';
        context.error = error.message;
        await this.executeHook('onError', context, error);
      } else {
        context.status = 'completed';
        context.output = output;
      }

      this.updateExecutionMetrics(context);
      await this.executeHook('afterExecution', context);
      await this.executeHook('onMetricsUpdate', context, context.metrics);
    }
  }

  // Analytics and reporting
  getExecutionStats(): {
    totalExecutions: number;
    activeExecutions: number;
    averageDuration: number;
    averageStepCount: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  } {
    const allContexts = Array.from(this.contexts.values());
    const completedContexts = allContexts.filter((c) => c.status === 'completed');

    const averageDuration =
      completedContexts.length > 0
        ? completedContexts.reduce((sum, c) => sum + (c.metrics.duration || 0), 0) /
          completedContexts.length
        : 0;

    const averageStepCount =
      allContexts.length > 0
        ? allContexts.reduce((sum, c) => sum + Object.keys(c.stepResults).length, 0) /
          allContexts.length
        : 0;

    return {
      activeExecutions: allContexts.filter((c) => c.status === 'running').length,
      averageDuration,
      averageStepCount,
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      totalExecutions: allContexts.length,
    };
  }

  getPerformanceReport(executionId: string): {
    execution: ExecutionContext;
    stepMetrics: Record<string, ExecutionMetrics>;
    performance: {
      totalDuration: number;
      stepCount: number;
      averageStepDuration: number;
      memoryPeak: number;
      cpuTime: number;
    };
  } | null {
    const context = this.contexts.get(executionId);
    if (!context) return null;

    const stepDurations = Object.values(context.stepMetrics)
      .map((m) => m.stepDuration || 0)
      .filter((d) => d > 0);

    const memoryPeak = Math.max(
      ...Object.values(context.stepMetrics).map((m) => m.memoryUsage?.heapUsed || 0),
    );

    return {
      execution: context,
      performance: {
        averageStepDuration:
          stepDurations.length > 0
            ? stepDurations.reduce((sum, d) => sum + d, 0) / stepDurations.length
            : 0,
        cpuTime: context.metrics.cpuUsage?.user || 0,
        memoryPeak,
        stepCount: Object.keys(context.stepResults).length,
        totalDuration: context.metrics.duration || 0,
      },
      stepMetrics: context.stepMetrics,
    };
  }

  // Cleanup
  cleanup(): void {
    this.contexts.clear();
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Singleton instance
export const executionContextManager = new ExecutionContextManager();
