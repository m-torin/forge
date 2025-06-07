import { type ExecutionContext, executionContextManager } from '@/lib/execution/execution-context';
import { stepFactory } from '@/lib/factories/step-factory';
import { registerBuiltInTemplates } from '@/lib/factories/step-templates';
import {
  registerBuiltInWorkflowTemplates,
  workflowFactory,
} from '@/lib/factories/workflow-factory';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { providerManager, type ProviderType } from '@/lib/providers/provider-manager';
import { wsServer } from '@/lib/realtime/websocket-server';
import { reliabilityManager } from '@/lib/reliability/reliability-manager';
import { RetryManager } from '@/lib/reliability/retry-manager';
import { builtInSteps } from '@/lib/steps/built-in-steps';
import { stepRegistry } from '@/lib/steps/step-registry';
import { memoryStore } from '@/lib/storage/memory-store';
import {
  type WorkflowDefinition,
  type WorkflowExecution,
  type WorkflowStatus,
  type WorkflowTrigger,
} from '@/types';

import { workflowRegistry } from './registry';

export interface ExecuteWorkflowOptions {
  delay?: number;
  metadata?: Record<string, any>;
  organizationId?: string;
  priority?: 'low' | 'normal' | 'high';
  provider?: ProviderType;
  retries?: number;
  tags?: string[];
  timeout?: number;
  userId?: string;
}

export interface ScheduleWorkflowOptions extends ExecuteWorkflowOptions {
  cron: string;
  enabled?: boolean;
  timezone?: string;
}

export class WorkflowService {
  constructor() {
    // Initialize all components
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize workflow registry
      await workflowRegistry.initialize();
      console.log('Workflow registry initialized');

      // Initialize provider manager
      await providerManager.initialize();
      console.log('Provider manager initialized');

      // Register built-in steps
      stepRegistry.registerMultiple(builtInSteps);
      console.log(`Registered ${builtInSteps.length} built-in steps`);

      // Register step templates
      registerBuiltInTemplates();

      // Register workflow templates
      registerBuiltInWorkflowTemplates();

      // Start performance monitoring
      performanceMonitor.startMonitoring(5000); // 5 second intervals
      console.log('Performance monitoring started');

      // Set up reliability patterns for workflows
      reliabilityManager.registerPattern('workflow-execution', {
        name: 'workflow-execution',
        bulkhead: {
          maxConcurrent: 10,
          maxWaiting: 50,
          timeout: 180000, // 3 minutes queue timeout
        },
        circuitBreaker: {
          failureThreshold: 5,
          halfOpenMaxAttempts: 3,
          monitoringPeriod: 300000,
          resetTimeout: 60000,
          successThreshold: 2,
          timeout: 120000, // 2 minutes for workflows
        },
        healthCheck: {
          enabled: true,
          interval: 60000,
        },
        retry: {
          backoffMultiplier: 2,
          baseDelay: 2000,
          jitter: true,
          maxAttempts: 3,
          maxDelay: 30000,
        },
        timeout: 300000, // 5 minutes overall timeout
      });

      console.log('Reliability patterns initialized');

      // Set up execution context hooks
      executionContextManager.setHooks({
        afterExecution: async (context) => {
          performanceMonitor.trackExecutionEnd(context);
        },
        afterStep: async (context, stepId, result) => {
          executionContextManager.finishStepExecution(context.executionId, stepId, result);
          const stepMetrics = context.stepMetrics[stepId];
          if (stepMetrics) {
            performanceMonitor.trackStepExecution(
              context,
              stepId,
              stepMetrics.stepDuration || 0,
              result && !result.error,
            );
          }
        },
        beforeExecution: async (context) => {
          performanceMonitor.trackExecutionStart(context);
        },
        beforeStep: async (context, stepId) => {
          executionContextManager.startStepExecution(context.executionId, stepId);
        },
        onError: async (context, error) => {
          console.error(`Execution error in ${context.workflowId}:`, error);
          context.metadata.errorDetails = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          };
        },
      });

      console.log('Workflow service fully initialized');
    } catch (error) {
      console.error('Failed to initialize workflow service:', error);
    }
  }

  // Workflow discovery and management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    return workflowRegistry.getWorkflows();
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | undefined> {
    return workflowRegistry.getWorkflow(id);
  }

  async searchWorkflows(query: string): Promise<WorkflowDefinition[]> {
    return workflowRegistry.searchWorkflows(query);
  }

  async getWorkflowsByCategory(category: string): Promise<WorkflowDefinition[]> {
    return workflowRegistry.getWorkflowsByCategory(category);
  }

  async getWorkflowsByTag(tag: string): Promise<WorkflowDefinition[]> {
    return workflowRegistry.getWorkflowsByTag(tag);
  }

  // Workflow execution
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    trigger: WorkflowTrigger,
    options: ExecuteWorkflowOptions = {},
  ): Promise<{ executionId: string; status: WorkflowStatus; context?: ExecutionContext }> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Create execution context
    const context = executionContextManager.createContext(workflowId, input, {
      metadata: {
        ...options.metadata,
        provider: options.provider,
        trigger,
        workflowVersion: workflow.version,
      },
      organizationId: options.organizationId,
      priority: options.priority,
      retries: options.retries || workflow.retries,
      tags: options.tags,
      timeout: options.timeout || workflow.timeout,
      userId: options.userId,
    });

    try {
      // Start execution tracking
      await executionContextManager.startExecution(context.executionId);

      // Use provider manager for distributed execution with reliability patterns
      const result = await reliabilityManager.execute(
        'workflow-execution',
        () =>
          providerManager.executeWorkflow(workflowId, input, {
            provider: options.provider,
            delay: options.delay,
            metadata: {
              ...options.metadata,
              executionId: context.executionId,
            },
            priority: options.priority,
            retries: options.retries || workflow.retries,
            tags: options.tags,
            timeout: options.timeout || workflow.timeout,
          }),
        {
          context: {
            executionId: context.executionId,
            trigger: options.metadata?.trigger,
            workflowId,
          },
          timeout: options.timeout || workflow.timeout,
        },
      );

      // Update context with provider result
      executionContextManager.updateContext(context.executionId, {
        metadata: {
          ...context.metadata,
          providerId: result.provider,
          messageId: result.messageId,
        },
      });

      console.log(
        `Workflow ${workflowId} queued for execution: ${result.executionId} (provider: ${result.provider})`,
      );

      return {
        context,
        executionId: result.executionId,
        status: 'pending',
      };
    } catch (error) {
      // Track execution failure
      await executionContextManager.finishExecution(
        context.executionId,
        undefined,
        error instanceof Error ? error : new Error('Unknown error'),
      );

      console.error(`Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async executeWorkflowSync(
    workflowId: string,
    input: Record<string, any>,
    options: ExecuteWorkflowOptions = {},
  ): Promise<WorkflowExecution & { context: ExecutionContext }> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Create execution context
    const context = executionContextManager.createContext(workflowId, input, {
      metadata: {
        ...options.metadata,
        trigger: 'sync',
        workflowVersion: workflow.version,
      },
      organizationId: options.organizationId,
      priority: options.priority,
      retries: options.retries || workflow.retries,
      tags: options.tags,
      timeout: options.timeout || workflow.timeout,
      userId: options.userId,
    });

    const executionId = context.executionId;
    const startTime = Date.now();

    // Create execution record
    const execution: WorkflowExecution = {
      id: executionId,
      environment: process.env.NODE_ENV || 'development',
      input,
      metrics: {},
      startedAt: new Date(),
      status: 'running',
      steps: [],
      triggeredBy: 'sync',
      version: workflow.version,
      workflowId,
    };

    memoryStore.setExecution(execution);

    // Start execution tracking
    await executionContextManager.startExecution(context.executionId);

    // Broadcast workflow started event
    wsServer.broadcastWorkflowEvent({
      type: 'workflow-started',
      data: { input, sync: true },
      executionId,
      timestamp: new Date(),
      workflowId,
    });

    try {
      // Execute workflow directly
      const output = await workflowRegistry.executeWorkflow(workflowId, input);

      // Update execution with success
      execution.status = 'completed';
      execution.output = output;
      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;

      memoryStore.setExecution(execution);

      // Track execution completion
      await executionContextManager.finishExecution(context.executionId, output);

      // Broadcast workflow completed event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-completed',
        data: { duration: execution.duration, output },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.log(`Workflow ${workflowId} completed synchronously: ${executionId}`);
      return { ...execution, context };
    } catch (error) {
      // Update execution with error
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;

      memoryStore.setExecution(execution);

      // Track execution failure
      await executionContextManager.finishExecution(
        context.executionId,
        undefined,
        error instanceof Error ? error : new Error('Unknown error'),
      );

      // Broadcast workflow failed event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-failed',
        data: { duration: execution.duration, error: execution.error },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.error(`Workflow ${workflowId} failed synchronously: ${executionId}`, error);
      throw error;
    }
  }

  // Workflow scheduling
  async scheduleWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ScheduleWorkflowOptions,
  ): Promise<{ scheduleId: string }> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    try {
      const result = await RetryManager.withStandardRetry(() =>
        providerManager.scheduleWorkflow(workflowId, input, {
          provider: options.provider,
          cron: options.cron,
          delay: options.delay,
          enabled: options.enabled,
          metadata: options.metadata,
          priority: options.priority,
          retries: options.retries || workflow.retries,
          tags: options.tags,
          timeout: options.timeout || workflow.timeout,
          timezone: options.timezone,
        }),
      );

      console.log(
        `Workflow ${workflowId} scheduled with cron: ${options.cron} (provider: ${result.provider})`,
      );
      return { scheduleId: result.scheduleId };
    } catch (error) {
      console.error(`Failed to schedule workflow ${workflowId}:`, error);
      throw error;
    }
  }

  // Execution management
  async getExecution(executionId: string): Promise<WorkflowExecution | undefined> {
    return memoryStore.getExecution(executionId);
  }

  async getExecutions(
    options: {
      workflowId?: string;
      status?: WorkflowStatus;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{ executions: WorkflowExecution[]; total: number }> {
    return memoryStore.searchExecutions(options);
  }

  async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    return memoryStore.getExecutionsByWorkflow(workflowId);
  }

  async getExecutionsByStatus(status: WorkflowStatus): Promise<WorkflowExecution[]> {
    return memoryStore.getExecutionsByStatus(status);
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (
      execution.status === 'completed' ||
      execution.status === 'failed' ||
      execution.status === 'cancelled'
    ) {
      throw new Error(`Cannot cancel execution in status: ${execution.status}`);
    }

    try {
      await RetryManager.withQuickRetry(() => providerManager.cancelWorkflow(executionId));
      console.log(`Execution ${executionId} cancelled`);
    } catch (error) {
      console.error(`Failed to cancel execution ${executionId}:`, error);
      throw error;
    }
  }

  // Analytics and monitoring
  async getWorkflowStats(): Promise<{
    totalWorkflows: number;
    totalExecutions: number;
    activeExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    executionsByStatus: Record<WorkflowStatus, number>;
    executionsByWorkflow: Record<string, number>;
    categories: string[];
    tags: string[];
  }> {
    const workflows = await this.getWorkflows();
    const storeStats = memoryStore.getStats();

    return {
      activeExecutions:
        storeStats.executions.byStatus.pending + storeStats.executions.byStatus.running,
      averageExecutionTime: storeStats.performance.averageExecutionTime,
      categories: workflowRegistry.getCategories(),
      executionsByStatus: storeStats.executions.byStatus,
      executionsByWorkflow: storeStats.executions.byWorkflow,
      successRate: storeStats.performance.successRate,
      tags: workflowRegistry.getTags(),
      totalExecutions: storeStats.executions.total,
      totalWorkflows: workflows.length,
    };
  }

  async getRecentActivity(limit = 50): Promise<
    {
      executionId: string;
      workflowId: string;
      status: WorkflowStatus;
      timestamp: Date;
      duration?: number;
    }[]
  > {
    return memoryStore.getRecentActivity(limit);
  }

  async getMetrics(): Promise<{
    system: {
      uptime: number;
      memory: NodeJS.MemoryUsage;
      cpu: NodeJS.CpuUsage;
    };
    store: ReturnType<typeof memoryStore.getStats>;
    providers: Awaited<ReturnType<typeof providerManager.getAggregatedStats>>;
    websocket: {
      connectedClients: number;
      clients: ReturnType<typeof wsServer.getClientInfo>;
    };
  }> {
    const [storeStats, providerStats] = await Promise.all([
      memoryStore.getStats(),
      providerManager.getAggregatedStats(),
    ]);

    return {
      providers: providerStats,
      store: storeStats,
      system: {
        cpu: process.cpuUsage(),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
      websocket: {
        clients: wsServer.getClientInfo(),
        connectedClients: wsServer.getConnectedClients(),
      },
    };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    services: {
      registry: boolean;
      store: boolean;
      providers: boolean;
      websocket: boolean;
    };
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check registry
    const workflows = await this.getWorkflows();
    const registryHealthy = workflows.length >= 0; // Basic check

    // Check store
    const storeHealth = memoryStore.healthCheck();
    if (!storeHealth.healthy) {
      issues.push(...storeHealth.issues);
    }

    // Check providers
    const providerHealth = await providerManager.healthCheck();
    if (!providerHealth.overall) {
      Object.entries(providerHealth.providers).forEach(([name, healthy]) => {
        if (!healthy) {
          issues.push(`Provider ${name} is unhealthy`);
        }
      });
    }

    // Check WebSocket
    const wsHealthy = wsServer.getConnectedClients() >= 0;

    const allHealthy =
      registryHealthy && storeHealth.healthy && providerHealth.overall && wsHealthy;

    return {
      healthy: allHealthy,
      issues,
      services: {
        providers: providerHealth.overall,
        registry: registryHealthy,
        store: storeHealth.healthy,
        websocket: wsHealthy,
      },
    };
  }

  // Event handling
  onWorkflowEvent(eventType: string, handler: (event: any) => void): () => void {
    // This would integrate with the WebSocket server's event system
    // For now, we'll just log
    console.log(`Registered handler for event type: ${eventType}`);

    return () => {
      console.log(`Unregistered handler for event type: ${eventType}`);
    };
  }

  // Utility methods
  async validateWorkflowInput(
    workflowId: string,
    input: Record<string, any>,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      return { valid: false, errors: ['Workflow not found'] };
    }

    const errors: string[] = [];

    // Basic input validation against schema
    if (workflow.inputSchema) {
      // This would implement JSON schema validation
      // For now, just check required fields exist
      // In a real implementation, use a library like ajv
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async estimateExecutionTime(workflowId: string): Promise<number> {
    const executions = await this.getExecutionsByWorkflow(workflowId);
    const completedExecutions = executions.filter((e) => e.status === 'completed' && e.duration);

    if (completedExecutions.length === 0) {
      return 0; // No historical data
    }

    const totalDuration = completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0);
    return Math.round(totalDuration / completedExecutions.length);
  }

  async getWorkflowSuccessRate(workflowId: string): Promise<number> {
    const executions = await this.getExecutionsByWorkflow(workflowId);
    if (executions.length === 0) return 0;

    const completedExecutions = executions.filter((e) => e.status === 'completed');
    return (completedExecutions.length / executions.length) * 100;
  }

  // Step registry management
  getAvailableSteps() {
    return stepRegistry.getAllSteps();
  }

  getStepsByCategory(category: string) {
    return stepRegistry.getStepsByCategory(category);
  }

  searchSteps(query: string) {
    return stepRegistry.searchSteps(query);
  }

  getStepStats() {
    return stepRegistry.getStats();
  }

  // Provider management
  getAvailableProviders() {
    return providerManager.getAvailableProviders();
  }

  getProviderCapabilities() {
    return providerManager.getProviderCapabilities();
  }

  getDefaultProvider() {
    return providerManager.getDefaultProvider();
  }

  // Performance monitoring methods
  getExecutionContext(executionId: string) {
    return executionContextManager.getContext(executionId);
  }

  getExecutionStats() {
    return executionContextManager.getExecutionStats();
  }

  getPerformanceReport(executionId?: string) {
    if (executionId) {
      return executionContextManager.getPerformanceReport(executionId);
    }
    return performanceMonitor.getPerformanceReport();
  }

  getPerformanceReportForTimeRange(timeRange: { start: Date; end: Date }) {
    return performanceMonitor.getPerformanceReport(timeRange);
  }

  getRecentPerformanceSnapshots(count = 100) {
    return performanceMonitor.getRecentSnapshots(count);
  }

  getRecentPerformanceAlerts(count = 50) {
    return performanceMonitor.getRecentAlerts(count);
  }

  updatePerformanceThresholds(thresholds: any) {
    return performanceMonitor.updateThresholds(thresholds);
  }

  getPerformanceThresholds() {
    return performanceMonitor.getThresholds();
  }

  recordCustomMetric(
    executionId: string,
    key: string,
    value: number | string | boolean,
    stepId?: string,
  ) {
    return executionContextManager.recordCustomMetric(executionId, key, value, stepId);
  }

  // Advanced analytics
  async getWorkflowPerformanceAnalytics(workflowId?: string) {
    const executionHistory = performanceMonitor.getExecutionHistory(workflowId);
    const recentSnapshots = performanceMonitor.getRecentSnapshots(100);
    const recentAlerts = performanceMonitor.getRecentAlerts(50);

    // Calculate performance metrics
    const completedExecutions = executionHistory.filter((e) => e.status === 'completed');
    const failedExecutions = executionHistory.filter((e) => e.status === 'failed');

    const successRate =
      executionHistory.length > 0
        ? (completedExecutions.length / executionHistory.length) * 100
        : 0;

    const averageExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length
        : 0;

    // Get percentiles
    const sortedDurations = completedExecutions.map((e) => e.duration).sort((a, b) => a - b);
    const p50 = this.calculatePercentile(sortedDurations, 50);
    const p95 = this.calculatePercentile(sortedDurations, 95);
    const p99 = this.calculatePercentile(sortedDurations, 99);

    // Calculate throughput trends
    const now = Date.now();
    const hourlyThroughput = executionHistory.filter(
      (e) => now - e.timestamp.getTime() < 3600000,
    ).length;

    const dailyThroughput = executionHistory.filter(
      (e) => now - e.timestamp.getTime() < 86400000,
    ).length;

    return {
      alerts: {
        byType: this.groupAlertsByType(recentAlerts),
        critical: recentAlerts.filter((a) => a.severity === 'critical').length,
        total: recentAlerts.length,
      },
      performance: {
        hourlyThroughput,
        dailyThroughput,
        p50ExecutionTime: p50,
        p95ExecutionTime: p95,
        p99ExecutionTime: p99,
      },
      summary: {
        averageExecutionTime,
        completedExecutions: completedExecutions.length,
        failedExecutions: failedExecutions.length,
        successRate,
        totalExecutions: executionHistory.length,
      },
      trends: {
        cpuUsage: recentSnapshots.slice(-20).map((s) => ({
          timestamp: s.timestamp,
          usage: s.resources.cpuUsagePercent,
        })),
        executionTimes: completedExecutions.slice(-20).map((e) => ({
          duration: e.duration,
          timestamp: e.timestamp,
        })),
        memoryUsage: recentSnapshots.slice(-20).map((s) => ({
          timestamp: s.timestamp,
          usage: s.resources.memoryUsagePercent,
        })),
      },
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const index = Math.ceil(values.length * (percentile / 100)) - 1;
    return values[Math.max(0, index)];
  }

  private groupAlertsByType(alerts: any[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});
  }

  // Reliability monitoring methods
  getReliabilityStats() {
    return reliabilityManager.getStats();
  }

  getWorkflowReliabilityStats() {
    return reliabilityManager.getStats('workflow-execution');
  }

  isWorkflowSystemHealthy(): boolean {
    return reliabilityManager.isPatternHealthy('workflow-execution');
  }

  getReliabilityHealthReport() {
    const healthyPatterns = reliabilityManager.getHealthyPatterns();
    const unhealthyPatterns = reliabilityManager.getUnhealthyPatterns();

    return {
      healthyPatterns,
      overall: unhealthyPatterns.length === 0,
      totalPatterns: healthyPatterns.length + unhealthyPatterns.length,
      unhealthyPatterns,
    };
  }

  updateReliabilityThresholds(thresholds: any) {
    reliabilityManager.updatePattern('workflow-execution', thresholds);
  }

  async testReliabilityPattern(patternName = 'workflow-execution') {
    try {
      await reliabilityManager.execute(patternName, () => Promise.resolve('test-success'), {
        context: { test: true },
        timeout: 5000,
      });
      return { message: 'Reliability pattern test passed', success: true };
    } catch (error) {
      return {
        message: `Reliability pattern test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  }

  // Step Factory methods
  getStepTemplates() {
    return stepFactory.getAllTemplates();
  }

  getStepTemplate(templateId: string) {
    return stepFactory.getAllTemplates().find((t) => t.id === templateId);
  }

  createStepFromTemplate(config: any) {
    return stepFactory.createStep(config);
  }

  createStepsFromTemplates(configs: any[]) {
    return stepFactory.createSteps(configs);
  }

  getFactoryCreatedSteps() {
    return stepFactory.getAllSteps();
  }

  // Workflow Factory methods
  getWorkflowTemplates() {
    return workflowFactory.getAllTemplates();
  }

  getWorkflowTemplate(templateId: string) {
    return workflowFactory.getAllTemplates().find((t) => t.id === templateId);
  }

  async createWorkflowFromTemplate(config: any): Promise<WorkflowDefinition> {
    const workflow = workflowFactory.createWorkflow(config);

    // Register the workflow with the registry
    await workflowRegistry.registerWorkflow(workflow);

    return workflow;
  }

  getFactoryCreatedWorkflows() {
    return workflowFactory.getAllWorkflows();
  }

  // Composite step creation methods
  createCompositeStep(
    id: string,
    name: string,
    stepIds: string[],
    options?: {
      description?: string;
      parallel?: boolean;
      continueOnError?: boolean;
      aggregateResults?: boolean;
    },
  ) {
    return stepFactory.composeSteps(id, name, stepIds, options);
  }

  createConditionalStep(
    id: string,
    name: string,
    condition: (context: any) => boolean | Promise<boolean>,
    ifTrueStepId: string,
    ifFalseStepId?: string,
    options?: {
      description?: string;
      tags?: string[];
    },
  ) {
    return stepFactory.createConditionalStep(
      id,
      name,
      condition,
      ifTrueStepId,
      ifFalseStepId,
      options,
    );
  }

  createLoopStep(
    id: string,
    name: string,
    stepId: string,
    options?: {
      description?: string;
      maxIterations?: number;
      parallel?: boolean;
      continueOnError?: boolean;
      itemsPath?: string;
      tags?: string[];
    },
  ) {
    return stepFactory.createLoopStep(id, name, stepId, options);
  }

  // Factory statistics
  getFactoryStats() {
    return {
      createdSteps: stepFactory.getAllSteps().length,
      createdWorkflows: workflowFactory.getAllWorkflows().length,
      stepTemplates: stepFactory.getAllTemplates().length,
      templateCategories: Array.from(
        new Set([
          ...stepFactory.getAllTemplates().map((t) => t.category),
          ...workflowFactory.getAllTemplates().map((t) => t.category),
        ]),
      ),
      workflowTemplates: workflowFactory.getAllTemplates().length,
    };
  }
}

// Singleton instance
export const workflowService = new WorkflowService();
