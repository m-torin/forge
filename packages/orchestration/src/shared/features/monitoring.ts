/**
 * Monitoring & Observability
 * Workflow metrics, execution history tracking, and performance monitoring
 */

import { createServerObservability } from '@repo/observability/server/next';
import { WorkflowProvider } from '../types/index';

export interface AlertRule {
  /** Alert channels */
  channels: {
    config?: Record<string, unknown>;
    target: string;
    type: 'email' | 'slack' | 'sms' | 'webhook';
  }[];
  /** Alert condition */
  condition: {
    metric: 'custom' | keyof WorkflowMetrics;
    operator: '!=' | '<' | '<=' | '=' | '>' | '>=';
    threshold: number;
    timeWindow: number; // in minutes
  };
  /** Cooldown period in minutes */
  cooldown: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Rule status */
  enabled: boolean;
  /** Unique alert rule ID */
  id: string;
  /** Last triggered timestamp */
  lastTriggered?: Date;
  /** Rule name */
  name: string;
  /** Alert severity */
  severity: 'critical' | 'high' | 'low' | 'medium';
  /** Target workflow ID (or * for all) */
  workflowId: string;
}

export interface ExecutionHistory {
  /** Completion timestamp */
  completedAt?: Date;
  /** Total duration in milliseconds */
  duration?: number;
  /** Error information */
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
  /** Execution ID */
  executionId: string;
  /** Input data */
  input?: unknown;
  /** Execution metadata */
  metadata: {
    parentExecutionId?: string;
    priority?: number;
    tags?: string[];
    triggeredBy?: 'api' | 'manual' | 'schedule' | 'webhook';
    triggerSource?: string;
  };
  /** Output data */
  output?: unknown;
  /** Resource usage */
  resourceUsage?: {
    cpuTime: number;
    memoryPeak: number;
    networkRequests: number;
  };
  /** Start timestamp */
  startedAt: Date;
  /** Execution status */
  status: 'cancelled' | 'completed' | 'failed' | 'pending' | 'running';
  /** Step execution details */
  steps: {
    completedAt?: Date;
    duration?: number;
    error?: string;
    input?: unknown;
    output?: unknown;
    retryCount?: number;
    startedAt?: Date;
    status: 'completed' | 'failed' | 'pending' | 'running' | 'skipped';
    stepId: string;
    stepName: string;
  }[];
  /** Workflow ID */
  workflowId: string;
}

export interface PerformanceMetrics {
  /** Error metrics */
  errors: {
    errorRate: number;
    errorsByType: Record<string, number>;
    recoveryTime: number;
    timeToFailure: number;
  };
  /** Latency metrics */
  latency: {
    average: number;
    maximum: number;
    minimum: number;
    p50: number;
    p95: number;
    p99: number;
  };
  /** Queue metrics */
  queue: {
    avgQueueTime: number;
    currentQueueSize: number;
    maxQueueSize: number;
    maxQueueTime: number;
  };
  /** Resource utilization */
  resources: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgNetworkUsage: number;
    peakCpuUsage: number;
    peakMemoryUsage: number;
  };
  /** Throughput metrics */
  throughput: {
    executionsPerDay: number;
    executionsPerHour: number;
    executionsPerMinute: number;
    peakThroughput: number;
    peakThroughputTime: Date;
  };
  /** Time window for metrics */
  timeWindow: {
    end: Date;
    start: Date;
  };
  /** Workflow ID */
  workflowId: string;
}

export interface WorkflowAlert {
  /** Acknowledgment details */
  acknowledgedBy?: {
    note?: string;
    timestamp: Date;
    user: string;
  };
  /** Alert context data */
  context: {
    affectedExecutions?: string[];
    metricValue: number;
    threshold: number;
    timeWindow: string;
  };
  /** Alert ID */
  id: string;
  /** Alert message */
  message: string;
  /** Resolution details */
  resolvedAt?: Date;
  /** Alert rule that triggered this alert */
  ruleId: string;
  /** Alert severity */
  severity: AlertRule['severity'];
  /** Alert status */
  status: 'acknowledged' | 'active' | 'resolved';
  /** Trigger timestamp */
  triggeredAt: Date;
  /** Workflow ID */
  workflowId: string;
}

export interface WorkflowMetrics {
  /** Average execution duration in milliseconds */
  avgExecutionDuration: number;
  /** Average steps per execution */
  avgStepsPerExecution: number;
  /** Metrics collection period */
  collectionPeriod: {
    end: Date;
    start: Date;
  };
  /** Most common error types */
  commonErrors: { count: number; error: string }[];
  /** Execution frequency (executions per hour) */
  executionFrequency: number;
  /** Number of failed executions */
  failedExecutions: number;
  /** Last execution timestamp */
  lastExecution?: Date;
  /** Maximum execution duration in milliseconds */
  maxExecutionDuration: number;
  /** Minimum execution duration in milliseconds */
  minExecutionDuration: number;
  /** Number of currently running executions */
  runningExecutions: number;
  /** Number of successful executions */
  successfulExecutions: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Total number of executions */
  totalExecutions: number;
  /** Workflow identifier */
  workflowId: string;
}

export class WorkflowMonitor {
  private activeAlerts = new Map<string, WorkflowAlert>();
  private alertRules = new Map<string, AlertRule>();
  private executionHistory: ExecutionHistory[] = [];
  private metrics = new Map<string, WorkflowMetrics>();
  private performanceData = new Map<string, PerformanceMetrics>();
  private provider: WorkflowProvider;

  // Limits to prevent unbounded growth
  private readonly MAX_EXECUTION_HISTORY = 10000;
  private readonly MAX_ACTIVE_ALERTS = 1000;
  private readonly MAX_PERFORMANCE_DATA = 500;

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, user: string, note?: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = {
      note,
      timestamp: new Date(),
      user,
    };
  }

  /**
   * Create alert rule
   */
  createAlertRule(rule: Omit<AlertRule, 'createdAt' | 'id'>): string {
    const id = this.generateAlertRuleId();
    const alertRule: AlertRule = {
      ...rule,
      createdAt: new Date(),
      id,
    };

    this.alertRules.set(id, alertRule);
    return id;
  }

  /**
   * Delete alert rule
   */
  deleteAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(workflowId?: string): WorkflowAlert[] {
    const alerts = Array.from(this.activeAlerts.values());

    if (workflowId) {
      return alerts.filter((alert: any) => alert.workflowId === workflowId);
    }

    return alerts;
  }

  /**
   * Generate monitoring dashboard data
   */
  getDashboardData(workflowIds?: string[]): {
    activeAlerts: WorkflowAlert[];
    overview: {
      activeExecutions: number;
      avgExecutionTime: number;
      successRate: number;
      totalExecutions: number;
      totalWorkflows: number;
    };
    performanceTrends: {
      errorRate: number;
      latency: number;
      throughput: number;
      timestamp: Date;
    }[];
    recentExecutions: ExecutionHistory[];
    workflowMetrics: WorkflowMetrics[];
  } {
    const targetWorkflows =
      workflowIds || Array.from(new Set(this.executionHistory.map((e: any) => e.workflowId)));

    const workflowMetrics = targetWorkflows
      .map((id: any) => this.getWorkflowMetrics(id))
      .filter(Boolean) as WorkflowMetrics[];

    const totalExecutions = workflowMetrics.reduce((sum, m: any) => sum + m.totalExecutions, 0);
    const activeExecutions = workflowMetrics.reduce((sum, m: any) => sum + m.runningExecutions, 0);
    const avgSuccessRate =
      workflowMetrics.reduce((sum, m: any) => sum + m.successRate, 0) / workflowMetrics.length || 0;
    const avgExecutionTime =
      workflowMetrics.reduce((sum, m: any) => sum + m.avgExecutionDuration, 0) /
        workflowMetrics.length || 0;

    return {
      activeAlerts: this.getActiveAlerts(),
      overview: {
        activeExecutions,
        avgExecutionTime,
        successRate: avgSuccessRate,
        totalExecutions,
        totalWorkflows: targetWorkflows.length,
      },
      performanceTrends: this.calculatePerformanceTrends(targetWorkflows),
      recentExecutions: this.getExecutionHistory(undefined, { limit: 10 }),
      workflowMetrics,
    };
  }

  /**
   * Get execution history
   */
  getExecutionHistory(
    workflowId?: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: ExecutionHistory['status'];
      timeRange?: { end: Date; start: Date };
    },
  ): ExecutionHistory[] {
    let history = this.executionHistory;

    // Filter by workflow ID
    if (workflowId) {
      history = history.filter((e: any) => e.workflowId === workflowId);
    }

    // Filter by status
    if (options?.status) {
      history = history.filter((e: any) => e.status === options.status);
    }

    // Filter by time range
    if (options?.timeRange) {
      const { start, end } = options.timeRange;
      history = history.filter((e: any) => e.startedAt >= start && e.startedAt <= end);
    }

    // Sort by start time (newest first)
    history.sort((a, b: any) => b.startedAt.getTime() - a.startedAt.getTime());

    // Apply pagination
    if (options?.offset || options?.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      history = history.slice(start, end);
    }

    return history;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(
    workflowId: string,
    timeWindow: { end: Date; start: Date },
  ): PerformanceMetrics {
    const key = `${workflowId}_${timeWindow.start.getTime()}_${timeWindow.end.getTime()}`;
    const cached = this.performanceData.get(key);
    if (cached) {
      return cached;
    }

    const metrics = this.calculatePerformanceMetrics(workflowId, timeWindow);
    this.performanceData.set(key, metrics);
    return metrics;
  }

  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(
    workflowId: string,
    timeRange?: { end: Date; start: Date },
  ): undefined | WorkflowMetrics {
    const cached = this.metrics.get(workflowId);
    if (cached && !timeRange) {
      return cached;
    }

    return this.calculateMetrics(workflowId, timeRange);
  }

  /**
   * Record workflow execution completion
   */
  recordExecutionCompletion(
    executionId: string,
    status: ExecutionHistory['status'],
    output?: unknown,
    error?: ExecutionHistory['error'],
    resourceUsage?: ExecutionHistory['resourceUsage'],
  ): void {
    const execution = this.executionHistory.find((e: any) => e.executionId === executionId);
    if (!execution) {
      return;
    }

    execution.status = status;
    execution.completedAt = new Date();
    execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    execution.output = output;
    execution.error = error;
    execution.resourceUsage = resourceUsage;

    this.updateMetrics(execution.workflowId);
    this.checkAlertRules(execution.workflowId);
  }

  /**
   * Record workflow execution start
   */
  recordExecutionStart(
    executionId: string,
    workflowId: string,
    metadata: ExecutionHistory['metadata'],
  ): void {
    const execution: ExecutionHistory = {
      executionId,
      metadata,
      startedAt: new Date(),
      status: 'running',
      steps: [],
      workflowId,
    };

    this.executionHistory.push(execution);

    // Prevent unbounded growth
    if (this.executionHistory.length > this.MAX_EXECUTION_HISTORY) {
      this.executionHistory = this.executionHistory.slice(-this.MAX_EXECUTION_HISTORY);
    }

    this.updateMetrics(workflowId);
  }

  /**
   * Record step execution
   */
  recordStepExecution(
    executionId: string,
    stepId: string,
    stepName: string,
    status: ExecutionHistory['steps'][0]['status'],
    input?: unknown,
    output?: unknown,
    error?: string,
    retryCount?: number,
  ): void {
    const execution = this.executionHistory.find((e: any) => e.executionId === executionId);
    if (!execution) {
      return;
    }

    let step = execution.steps.find((s: any) => s.stepId === stepId);
    if (!step) {
      step = {
        status: 'pending',
        stepId,
        stepName,
      };
      execution.steps.push(step);
    }

    step.status = status;
    if (status === 'running' && !step.startedAt) {
      step.startedAt = new Date();
    }
    if ((status === 'completed' || status === 'failed') && step.startedAt) {
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
    }
    step.input = input;
    step.output = output;
    step.error = error;
    step.retryCount = retryCount;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<Omit<AlertRule, 'createdAt' | 'id'>>): void {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule ${ruleId} not found`);
    }

    Object.assign(rule, updates);
  }

  /**
   * Track execution start/completion
   */
  async trackExecution(
    executionId: string,
    data: {
      workflowType?: string;
      workflowId?: string;
      status: 'started' | 'completed' | 'failed';
      result?: unknown;
      error?: { message: string; stack?: string };
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    if (data.status === 'started') {
      this.recordExecutionStart(executionId, data.workflowId || 'unknown', {
        tags: data.workflowType ? [data.workflowType] : [],
        ...data.metadata,
      });
    } else {
      this.recordExecutionCompletion(
        executionId,
        data.status,
        data.result,
        data.error,
        data.metadata?.resourceUsage,
      );
    }
  }

  /**
   * Track step execution
   */
  async trackStep(
    executionId: string,
    data: {
      stepName: string;
      status: 'completed' | 'failed' | 'running' | 'pending';
      duration?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    this.recordStepExecution(
      executionId,
      `step_${Date.now()}`, // Generate step ID
      data.stepName,
      data.status,
      data.metadata?.input,
      data.metadata?.output,
      data.status === 'failed' ? data.metadata?.error : undefined,
      data.metadata?.retryCount,
    );
  }

  /**
   * Log message for execution
   */
  async log(
    executionId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Find the execution and add log to its steps
    const execution = this.executionHistory.find((e: any) => e.executionId === executionId);
    if (execution) {
      const logStep = {
        stepId: `log_${Date.now()}`,
        stepName: `log_${level}`,
        status: 'completed' as const,
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 0,
        input: { level, message, metadata },
        output: { logged: true },
      };
      execution.steps.push(logStep);
    }
  }

  // Private methods

  private calculateMetrics(
    workflowId: string,
    timeRange?: { end: Date; start: Date },
  ): WorkflowMetrics {
    let executions = this.executionHistory.filter((e: any) => e.workflowId === workflowId);

    if (timeRange) {
      executions = executions.filter(
        (e: any) => e.startedAt >= timeRange.start && e.startedAt <= timeRange.end,
      );
    }

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter((e: any) => e.status === 'completed').length;
    const failedExecutions = executions.filter((e: any) => e.status === 'failed').length;
    const runningExecutions = executions.filter((e: any) => e.status === 'running').length;

    const completedExecutions = executions.filter((e: any) => e.duration !== undefined);
    const durations = completedExecutions.map((e: any) => e.duration).filter(d => d !== undefined);

    const avgExecutionDuration =
      durations.length > 0 ? durations.reduce((sum, d: any) => sum + d, 0) / durations.length : 0;
    const minExecutionDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxExecutionDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const steps = executions.flatMap((e: any) => e.steps);
    const avgStepsPerExecution = totalExecutions > 0 ? steps.length / totalExecutions : 0;

    const errors = executions
      .filter((e: any) => e.error)
      .map((e: any) => e.error?.message)
      .filter(Boolean);
    const errorCounts = errors.reduce(
      (acc, error: any) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]: any) => ({ count, error }))
      .sort((a, b: any) => b.count - a.count)
      .slice(0, 5);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentExecutions = executions.filter((e: any) => e.startedAt >= oneHourAgo);
    const executionFrequency = recentExecutions.length;

    const lastExecution = executions.sort(
      (a, b: any) => b.startedAt.getTime() - a.startedAt.getTime(),
    )[0]?.startedAt;

    return {
      avgExecutionDuration,
      avgStepsPerExecution,
      collectionPeriod: timeRange || {
        end: now,
        start: executions[executions.length - 1]?.startedAt || now,
      },
      commonErrors,
      executionFrequency,
      failedExecutions,
      lastExecution,
      maxExecutionDuration,
      minExecutionDuration,
      runningExecutions,
      successfulExecutions,
      successRate,
      totalExecutions,
      workflowId,
    };
  }

  private calculatePerformanceMetrics(
    workflowId: string,
    timeWindow: { end: Date; start: Date },
  ): PerformanceMetrics {
    const executions = this.executionHistory.filter(
      (e: any) =>
        e.workflowId === workflowId &&
        e.startedAt >= timeWindow.start &&
        e.startedAt <= timeWindow.end,
    );

    const durations = executions
      .filter((e: any) => e.duration !== undefined)
      .map((e: any) => e.duration)
      .filter(d => d !== undefined)
      .sort((a, b: any) => a - b);

    const errors = executions.filter((e: any) => e.status === 'failed');
    const errorsByType = errors.reduce(
      (acc, e: any) => {
        const errorType = e.error?.code || e.error?.message || 'Unknown';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const timeWindowMs = timeWindow.end.getTime() - timeWindow.start.getTime();
    const timeWindowMinutes = timeWindowMs / (1000 * 60);
    const timeWindowHours = timeWindowMs / (1000 * 60 * 60);
    const timeWindowDays = timeWindowMs / (1000 * 60 * 60 * 24);

    return {
      errors: {
        errorRate: executions.length > 0 ? errors.length / executions.length : 0,
        errorsByType,
        recoveryTime: 0, // Would need more detailed analysis
        timeToFailure: 0, // Would need more detailed analysis
      },
      latency: {
        average:
          durations.length > 0
            ? durations.reduce((sum, d: any) => sum + d, 0) / durations.length
            : 0,
        maximum: durations[durations.length - 1] || 0,
        minimum: durations[0] || 0,
        p50: durations[Math.floor(durations.length * 0.5)] || 0,
        p95: durations[Math.floor(durations.length * 0.95)] || 0,
        p99: durations[Math.floor(durations.length * 0.99)] || 0,
      },
      queue: {
        avgQueueTime: 0, // Would need queue timing data
        currentQueueSize: 0,
        maxQueueSize: 0,
        maxQueueTime: 0,
      },
      resources: {
        avgCpuUsage: 0, // Would need resource monitoring integration
        avgMemoryUsage: 0,
        avgNetworkUsage: 0,
        peakCpuUsage: 0,
        peakMemoryUsage: 0,
      },
      throughput: {
        executionsPerDay: executions.length / timeWindowDays,
        executionsPerHour: executions.length / timeWindowHours,
        executionsPerMinute: executions.length / timeWindowMinutes,
        peakThroughput: 0, // Would need more detailed time-series data
        peakThroughputTime: new Date(),
      },
      timeWindow,
      workflowId,
    };
  }

  private calculatePerformanceTrends(_workflowIds: string[]): {
    errorRate: number;
    latency: number;
    throughput: number;
    timestamp: Date;
  }[] {
    // Implementation would calculate performance trends over time
    // This is a placeholder
    return [];
  }

  private checkAlertRules(workflowId: string): void {
    const metrics = this.getWorkflowMetrics(workflowId);
    if (!metrics) {
      return;
    }

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled || (rule.workflowId !== '*' && rule.workflowId !== workflowId)) {
        continue;
      }

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      const shouldTrigger = this.evaluateAlertCondition(rule, metrics);
      if (shouldTrigger) {
        this.triggerAlert(rule, workflowId, metrics);
      }
    }
  }

  private evaluateAlertCondition(rule: AlertRule, metrics: WorkflowMetrics): boolean {
    const metricValue = metrics[rule.condition.metric as keyof WorkflowMetrics] as number;

    switch (rule.condition.operator) {
      case '!=':
        return metricValue !== rule.condition.threshold;
      case '<':
        return metricValue < rule.condition.threshold;
      case '<=':
        return metricValue <= rule.condition.threshold;
      case '=':
        return metricValue === rule.condition.threshold;
      case '>':
        return metricValue > rule.condition.threshold;
      case '>=':
        return metricValue >= rule.condition.threshold;
      default:
        return false;
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertRuleId(): string {
    return `alert_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendAlertNotifications(alert: WorkflowAlert, _rule: AlertRule): Promise<void> {
    // Implementation would send notifications through configured channels
    const logger = await createServerObservability();
    await logger.log('info', `Alert triggered: ${alert.message}`);
  }

  private triggerAlert(rule: AlertRule, workflowId: string, metrics: WorkflowMetrics): void {
    const alertId = this.generateAlertId();
    const metricValue = metrics[rule.condition.metric as keyof WorkflowMetrics] as number;

    const alert: WorkflowAlert = {
      context: {
        metricValue,
        threshold: rule.condition.threshold,
        timeWindow: `${rule.condition.timeWindow} minutes`,
      },
      id: alertId,
      message: `${rule.name}: ${rule.condition.metric} (${metricValue}) ${rule.condition.operator} ${rule.condition.threshold}`,
      ruleId: rule.id,
      severity: rule.severity,
      status: 'active',
      triggeredAt: new Date(),
      workflowId,
    };

    this.activeAlerts.set(alertId, alert);

    // Prevent unbounded growth of alerts
    if (this.activeAlerts.size > this.MAX_ACTIVE_ALERTS) {
      // Remove oldest alerts first
      const alertEntries = Array.from(this.activeAlerts.entries());
      alertEntries.sort((a, b: any) => a[1].triggeredAt.getTime() - b[1].triggeredAt.getTime());

      const alertsToRemove = alertEntries.slice(0, alertEntries.length - this.MAX_ACTIVE_ALERTS);
      for (const [alertId] of alertsToRemove) {
        this.activeAlerts.delete(alertId);
      }
    }

    rule.lastTriggered = new Date();

    // Send alert notifications (would integrate with notification service)
    (async () => {
      try {
        await this.sendAlertNotifications(alert, rule);
      } catch {
        // Ignore notification errors to prevent breaking the monitoring flow
      }
    })();
  }

  private updateMetrics(workflowId: string): void {
    const metrics = this.calculateMetrics(workflowId);
    this.metrics.set(workflowId, metrics);
  }

  /**
   * Clean up resources and prevent memory leaks
   */
  cleanup(): void {
    this.activeAlerts.clear();
    this.alertRules.clear();
    this.executionHistory = [];
    this.metrics.clear();
    this.performanceData.clear();
  }

  /**
   * Trim old data to prevent unbounded growth
   */
  trimOldData(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);

    // Trim old execution history
    this.executionHistory = this.executionHistory.filter(
      (execution: any) => execution.startedAt >= cutoff,
    );

    // Trim old alerts
    for (const [alertId, alert] of this.activeAlerts) {
      if (alert.triggeredAt < cutoff && alert.status === 'resolved') {
        this.activeAlerts.delete(alertId);
      }
    }

    // Trim old performance data
    if (this.performanceData.size > this.MAX_PERFORMANCE_DATA) {
      const entries = Array.from(this.performanceData.entries());
      const toKeep = entries.slice(-this.MAX_PERFORMANCE_DATA);
      this.performanceData.clear();
      for (const [key, value] of toKeep) {
        this.performanceData.set(key, value);
      }
    }
  }
}

/**
 * Create a new workflow monitor instance
 */
export function createWorkflowMonitor(provider: WorkflowProvider): WorkflowMonitor {
  return new WorkflowMonitor(provider);
}

/**
 * Utility functions for monitoring
 */
export const MonitoringUtils = {
  /**
   * Calculate average execution duration
   */
  calculateAverageDuration(executions: ExecutionHistory[]): number {
    const durations = executions
      .filter((e: any) => e.duration !== undefined)
      .map((e: any) => e.duration)
      .filter(d => d !== undefined);

    return durations.length > 0
      ? durations.reduce((sum, d: any) => sum + d, 0) / durations.length
      : 0;
  },

  /**
   * Generate health status based on metrics
   */
  calculateHealthStatus(metrics: WorkflowMetrics): 'critical' | 'healthy' | 'warning' {
    if (metrics.successRate < 0.5) return 'critical';
    if (metrics.successRate < 0.8) return 'warning';
    if (metrics.runningExecutions > metrics.totalExecutions * 0.1) return 'warning';
    return 'healthy';
  },

  /**
   * Get execution percentiles
   */
  calculatePercentiles(values: number[]): { p50: number; p95: number; p99: number } {
    if (values.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b: any) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
      p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
      p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
    };
  },

  /**
   * Calculate execution success rate
   */
  calculateSuccessRate(executions: ExecutionHistory[]): number {
    if (executions.length === 0) return 1;
    const successful = executions.filter((e: any) => e.status === 'completed').length;
    return successful / executions.length;
  },

  /**
   * Format duration for display
   */
  formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`;
    }
  },
};

/**
 * Create a monitor instance
 */
export function createMonitor(provider: WorkflowProvider) {
  return new WorkflowMonitor(provider);
}

/**
 * Create a metrics collector service
 */
export function createMetricsCollector(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    collect: (workflowId: string) => monitor.getWorkflowMetrics(workflowId),
    getHistory: (workflowId?: string) => monitor.getExecutionHistory(workflowId),
    getPerformance: (workflowId: string, timeWindow: { start: Date; end: Date }) =>
      monitor.getPerformanceMetrics(workflowId, timeWindow),

    recordExecution: (executionId: string, workflowId: string, metadata: any) =>
      monitor.recordExecutionStart(executionId, workflowId, metadata),

    recordCompletion: (executionId: string, status: any, output?: any, error?: any) =>
      monitor.recordExecutionCompletion(executionId, status, output, error),

    cleanup: () => monitor.cleanup(),
  };
}

/**
 * Create an alerts management service
 */
export function createAlertsManager(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    createRule: (rule: Omit<AlertRule, 'createdAt' | 'id'>) => monitor.createAlertRule(rule),
    updateRule: (ruleId: string, updates: Partial<AlertRule>) =>
      monitor.updateAlertRule(ruleId, updates),
    deleteRule: (ruleId: string) => monitor.deleteAlertRule(ruleId),
    getActiveAlerts: (workflowId?: string) => monitor.getActiveAlerts(workflowId),
    acknowledgeAlert: (alertId: string, user: string, note?: string) =>
      monitor.acknowledgeAlert(alertId, user, note),
    resolveAlert: (alertId: string) => monitor.resolveAlert(alertId),
  };
}

/**
 * Create a performance monitoring service
 */
export function createPerformanceMonitor(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    trackExecution: (executionId: string, data: any) => monitor.trackExecution(executionId, data),
    trackStep: (executionId: string, data: any) => monitor.trackStep(executionId, data),
    log: (executionId: string, level: any, message: string, metadata?: any) =>
      monitor.log(executionId, level, message, metadata),
    getMetrics: (workflowId: string, timeWindow: { start: Date; end: Date }) =>
      monitor.getPerformanceMetrics(workflowId, timeWindow),
    getDashboard: (workflowIds?: string[]) => monitor.getDashboardData(workflowIds),
  };
}

/**
 * Create a real-time monitoring service
 */
export function createRealtimeMonitor(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    getStatus: (workflowId: string) => {
      const metrics = monitor.getWorkflowMetrics(workflowId);
      return metrics ? MonitoringUtils.calculateHealthStatus(metrics) : 'unknown';
    },

    getLiveMetrics: (workflowId: string) => monitor.getWorkflowMetrics(workflowId),

    getActiveExecutions: (workflowId?: string) =>
      monitor.getExecutionHistory(workflowId, { limit: 100 }).filter(e => e.status === 'running'),

    streamUpdates: async function* (workflowId: string) {
      // Simple implementation - would be enhanced with real streaming
      while (true) {
        yield {
          timestamp: new Date(),
          workflowId,
          metrics: monitor.getWorkflowMetrics(workflowId),
          activeExecutions: monitor
            .getExecutionHistory(workflowId, { limit: 10 })
            .filter(e => e.status === 'running').length,
        };

        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second intervals
      }
    },
  };
}

/**
 * Create an error tracking service
 */
export function createErrorTracker(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    getErrors: (workflowId: string, timeRange?: { start: Date; end: Date }) => {
      const history = monitor.getExecutionHistory(workflowId, {
        status: 'failed',
        timeRange,
      });

      return history.map(h => ({
        executionId: h.executionId,
        error: h.error,
        timestamp: h.startedAt,
        duration: h.duration,
        steps: h.steps.filter(s => s.status === 'failed'),
      }));
    },

    getErrorTrends: (workflowId: string) => {
      const metrics = monitor.getWorkflowMetrics(workflowId);
      return metrics
        ? {
            errorRate: metrics.failedExecutions / metrics.totalExecutions,
            commonErrors: metrics.commonErrors,
            totalErrors: metrics.failedExecutions,
          }
        : null;
    },

    reportError: (executionId: string, error: any) => {
      monitor.recordExecutionCompletion(executionId, 'failed', undefined, error);
    },
  };
}

/**
 * Create a health checking service
 */
export function createHealthChecker(provider: WorkflowProvider) {
  const monitor = new WorkflowMonitor(provider);

  return {
    checkHealth: (workflowId: string) => {
      const metrics = monitor.getWorkflowMetrics(workflowId);
      if (!metrics) return { status: 'unknown', metrics: null };

      return {
        status: MonitoringUtils.calculateHealthStatus(metrics),
        metrics,
        lastExecution: metrics.lastExecution,
        runningExecutions: metrics.runningExecutions,
        successRate: metrics.successRate,
      };
    },

    getSystemHealth: () => {
      const dashboard = monitor.getDashboardData();
      return {
        overview: dashboard.overview,
        activeAlerts: dashboard.activeAlerts.length,
        totalWorkflows: dashboard.overview.totalWorkflows,
        systemSuccessRate: dashboard.overview.successRate,
      };
    },
  };
}

// Export class constructors for compatibility with existing tests
export const ExecutionHistory = class {
  constructor(data: Partial<ExecutionHistory>) {
    Object.assign(this, data);
  }
};

export const WorkflowAlert = class {
  constructor(data: Partial<WorkflowAlert>) {
    Object.assign(this, data);
  }
};

export const WorkflowMetrics = class {
  constructor(data: Partial<WorkflowMetrics>) {
    Object.assign(this, data);
  }
};
