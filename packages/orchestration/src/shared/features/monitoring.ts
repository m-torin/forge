/**
 * Monitoring & Observability
 * Workflow metrics, execution history tracking, and performance monitoring
 */

import type { WorkflowProvider } from '../types/index';

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
      return alerts.filter((alert) => alert.workflowId === workflowId);
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
      workflowIds || Array.from(new Set(this.executionHistory.map((e) => e.workflowId)));

    const workflowMetrics = targetWorkflows
      .map((id) => this.getWorkflowMetrics(id))
      .filter(Boolean) as WorkflowMetrics[];

    const totalExecutions = workflowMetrics.reduce((sum, m) => sum + m.totalExecutions, 0);
    const activeExecutions = workflowMetrics.reduce((sum, m) => sum + m.runningExecutions, 0);
    const avgSuccessRate =
      workflowMetrics.reduce((sum, m) => sum + m.successRate, 0) / workflowMetrics.length || 0;
    const avgExecutionTime =
      workflowMetrics.reduce((sum, m) => sum + m.avgExecutionDuration, 0) /
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
      history = history.filter((e) => e.workflowId === workflowId);
    }

    // Filter by status
    if (options?.status) {
      history = history.filter((e) => e.status === options.status);
    }

    // Filter by time range
    if (options?.timeRange) {
      history = history.filter(
        (e) => e.startedAt >= options.timeRange!.start && e.startedAt <= options.timeRange!.end,
      );
    }

    // Sort by start time (newest first)
    history.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

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
    const execution = this.executionHistory.find((e) => e.executionId === executionId);
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
    const execution = this.executionHistory.find((e) => e.executionId === executionId);
    if (!execution) {
      return;
    }

    let step = execution.steps.find((s) => s.stepId === stepId);
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

  // Private methods

  private calculateMetrics(
    workflowId: string,
    timeRange?: { end: Date; start: Date },
  ): WorkflowMetrics {
    let executions = this.executionHistory.filter((e) => e.workflowId === workflowId);

    if (timeRange) {
      executions = executions.filter(
        (e) => e.startedAt >= timeRange.start && e.startedAt <= timeRange.end,
      );
    }

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter((e) => e.status === 'completed').length;
    const failedExecutions = executions.filter((e) => e.status === 'failed').length;
    const runningExecutions = executions.filter((e) => e.status === 'running').length;

    const completedExecutions = executions.filter((e) => e.duration !== undefined);
    const durations = completedExecutions.map((e) => e.duration!);

    const avgExecutionDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    const minExecutionDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxExecutionDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const steps = executions.flatMap((e) => e.steps);
    const avgStepsPerExecution = totalExecutions > 0 ? steps.length / totalExecutions : 0;

    const errors = executions.filter((e) => e.error).map((e) => e.error!.message);
    const errorCounts = errors.reduce(
      (acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ count, error }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentExecutions = executions.filter((e) => e.startedAt >= oneHourAgo);
    const executionFrequency = recentExecutions.length;

    const lastExecution = executions.sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
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
      (e) =>
        e.workflowId === workflowId &&
        e.startedAt >= timeWindow.start &&
        e.startedAt <= timeWindow.end,
    );

    const durations = executions
      .filter((e) => e.duration !== undefined)
      .map((e) => e.duration!)
      .sort((a, b) => a - b);

    const errors = executions.filter((e) => e.status === 'failed');
    const errorsByType = errors.reduce(
      (acc, e) => {
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
          durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
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

  private calculatePerformanceTrends(workflowIds: string[]): {
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

  private sendAlertNotifications(alert: WorkflowAlert, rule: AlertRule): void {
    // Implementation would send notifications through configured channels
    console.log(`Alert triggered: ${alert.message}`);
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
    rule.lastTriggered = new Date();

    // Send alert notifications (would integrate with notification service)
    this.sendAlertNotifications(alert, rule);
  }

  private updateMetrics(workflowId: string): void {
    const metrics = this.calculateMetrics(workflowId);
    this.metrics.set(workflowId, metrics);
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
    const durations = executions.filter((e) => e.duration !== undefined).map((e) => e.duration!);

    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
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

    const sorted = [...values].sort((a, b) => a - b);
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
    const successful = executions.filter((e) => e.status === 'completed').length;
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
