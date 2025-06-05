/**
 * Monitoring & Observability
 * Workflow metrics, execution history tracking, and performance monitoring
 */

import type { WorkflowProvider } from '../types/index.js';

export interface WorkflowMetrics {
  /** Workflow identifier */
  workflowId: string;
  /** Total number of executions */
  totalExecutions: number;
  /** Number of successful executions */
  successfulExecutions: number;
  /** Number of failed executions */
  failedExecutions: number;
  /** Number of currently running executions */
  runningExecutions: number;
  /** Average execution duration in milliseconds */
  avgExecutionDuration: number;
  /** Minimum execution duration in milliseconds */
  minExecutionDuration: number;
  /** Maximum execution duration in milliseconds */
  maxExecutionDuration: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Average steps per execution */
  avgStepsPerExecution: number;
  /** Most common error types */
  commonErrors: Array<{ error: string; count: number }>;
  /** Execution frequency (executions per hour) */
  executionFrequency: number;
  /** Last execution timestamp */
  lastExecution?: Date;
  /** Metrics collection period */
  collectionPeriod: {
    start: Date;
    end: Date;
  };
}

export interface ExecutionHistory {
  /** Execution ID */
  executionId: string;
  /** Workflow ID */
  workflowId: string;
  /** Execution status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** Start timestamp */
  startedAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
  /** Total duration in milliseconds */
  duration?: number;
  /** Input data */
  input?: unknown;
  /** Output data */
  output?: unknown;
  /** Error information */
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  /** Step execution details */
  steps: Array<{
    stepId: string;
    stepName: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    input?: unknown;
    output?: unknown;
    error?: string;
    retryCount?: number;
  }>;
  /** Execution metadata */
  metadata: {
    triggeredBy?: 'manual' | 'schedule' | 'webhook' | 'api';
    triggerSource?: string;
    priority?: number;
    tags?: string[];
    parentExecutionId?: string;
  };
  /** Resource usage */
  resourceUsage?: {
    cpuTime: number;
    memoryPeak: number;
    networkRequests: number;
  };
}

export interface PerformanceMetrics {
  /** Workflow ID */
  workflowId: string;
  /** Time window for metrics */
  timeWindow: {
    start: Date;
    end: Date;
  };
  /** Throughput metrics */
  throughput: {
    executionsPerMinute: number;
    executionsPerHour: number;
    executionsPerDay: number;
    peakThroughput: number;
    peakThroughputTime: Date;
  };
  /** Latency metrics */
  latency: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
    minimum: number;
    maximum: number;
  };
  /** Error metrics */
  errors: {
    errorRate: number;
    errorsByType: Record<string, number>;
    timeToFailure: number;
    recoveryTime: number;
  };
  /** Resource utilization */
  resources: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgNetworkUsage: number;
    peakCpuUsage: number;
    peakMemoryUsage: number;
  };
  /** Queue metrics */
  queue: {
    avgQueueTime: number;
    maxQueueTime: number;
    currentQueueSize: number;
    maxQueueSize: number;
  };
}

export interface AlertRule {
  /** Unique alert rule ID */
  id: string;
  /** Rule name */
  name: string;
  /** Target workflow ID (or * for all) */
  workflowId: string;
  /** Alert condition */
  condition: {
    metric: keyof WorkflowMetrics | 'custom';
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    threshold: number;
    timeWindow: number; // in minutes
  };
  /** Alert severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Alert channels */
  channels: Array<{
    type: 'email' | 'slack' | 'webhook' | 'sms';
    target: string;
    config?: Record<string, unknown>;
  }>;
  /** Rule status */
  enabled: boolean;
  /** Cooldown period in minutes */
  cooldown: number;
  /** Last triggered timestamp */
  lastTriggered?: Date;
  /** Creation timestamp */
  createdAt: Date;
}

export interface WorkflowAlert {
  /** Alert ID */
  id: string;
  /** Alert rule that triggered this alert */
  ruleId: string;
  /** Workflow ID */
  workflowId: string;
  /** Alert message */
  message: string;
  /** Alert severity */
  severity: AlertRule['severity'];
  /** Alert status */
  status: 'active' | 'acknowledged' | 'resolved';
  /** Trigger timestamp */
  triggeredAt: Date;
  /** Acknowledgment details */
  acknowledgedBy?: {
    user: string;
    timestamp: Date;
    note?: string;
  };
  /** Resolution details */
  resolvedAt?: Date;
  /** Alert context data */
  context: {
    metricValue: number;
    threshold: number;
    timeWindow: string;
    affectedExecutions?: string[];
  };
}

export class WorkflowMonitor {
  private provider: WorkflowProvider;
  private metrics = new Map<string, WorkflowMetrics>();
  private executionHistory: ExecutionHistory[] = [];
  private alertRules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, WorkflowAlert>();
  private performanceData = new Map<string, PerformanceMetrics>();

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Record workflow execution start
   */
  recordExecutionStart(executionId: string, workflowId: string, metadata: ExecutionHistory['metadata']): void {
    const execution: ExecutionHistory = {
      executionId,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      steps: [],
      metadata,
    };

    this.executionHistory.push(execution);
    this.updateMetrics(workflowId);
  }

  /**
   * Record workflow execution completion
   */
  recordExecutionCompletion(
    executionId: string,
    status: ExecutionHistory['status'],
    output?: unknown,
    error?: ExecutionHistory['error'],
    resourceUsage?: ExecutionHistory['resourceUsage']
  ): void {
    const execution = this.executionHistory.find(e => e.executionId === executionId);
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
    retryCount?: number
  ): void {
    const execution = this.executionHistory.find(e => e.executionId === executionId);
    if (!execution) {
      return;
    }

    let step = execution.steps.find(s => s.stepId === stepId);
    if (!step) {
      step = {
        stepId,
        stepName,
        status: 'pending',
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
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowId: string, timeRange?: { start: Date; end: Date }): WorkflowMetrics | undefined {
    const cached = this.metrics.get(workflowId);
    if (cached && !timeRange) {
      return cached;
    }

    return this.calculateMetrics(workflowId, timeRange);
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
      timeRange?: { start: Date; end: Date };
    }
  ): ExecutionHistory[] {
    let history = this.executionHistory;

    // Filter by workflow ID
    if (workflowId) {
      history = history.filter(e => e.workflowId === workflowId);
    }

    // Filter by status
    if (options?.status) {
      history = history.filter(e => e.status === options.status);
    }

    // Filter by time range
    if (options?.timeRange) {
      history = history.filter(e => 
        e.startedAt >= options.timeRange!.start && 
        e.startedAt <= options.timeRange!.end
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
  getPerformanceMetrics(workflowId: string, timeWindow: { start: Date; end: Date }): PerformanceMetrics {
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
   * Create alert rule
   */
  createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): string {
    const id = this.generateAlertRuleId();
    const alertRule: AlertRule = {
      ...rule,
      id,
      createdAt: new Date(),
    };

    this.alertRules.set(id, alertRule);
    return id;
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<Omit<AlertRule, 'id' | 'createdAt'>>): void {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule ${ruleId} not found`);
    }

    Object.assign(rule, updates);
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
      return alerts.filter(alert => alert.workflowId === workflowId);
    }

    return alerts;
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
      user,
      timestamp: new Date(),
      note,
    };
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
   * Generate monitoring dashboard data
   */
  getDashboardData(workflowIds?: string[]): {
    overview: {
      totalWorkflows: number;
      totalExecutions: number;
      activeExecutions: number;
      successRate: number;
      avgExecutionTime: number;
    };
    workflowMetrics: WorkflowMetrics[];
    recentExecutions: ExecutionHistory[];
    activeAlerts: WorkflowAlert[];
    performanceTrends: Array<{
      timestamp: Date;
      throughput: number;
      latency: number;
      errorRate: number;
    }>;
  } {
    const targetWorkflows = workflowIds || Array.from(new Set(this.executionHistory.map(e => e.workflowId)));
    
    const workflowMetrics = targetWorkflows
      .map(id => this.getWorkflowMetrics(id))
      .filter(Boolean) as WorkflowMetrics[];

    const totalExecutions = workflowMetrics.reduce((sum, m) => sum + m.totalExecutions, 0);
    const activeExecutions = workflowMetrics.reduce((sum, m) => sum + m.runningExecutions, 0);
    const avgSuccessRate = workflowMetrics.reduce((sum, m) => sum + m.successRate, 0) / workflowMetrics.length || 0;
    const avgExecutionTime = workflowMetrics.reduce((sum, m) => sum + m.avgExecutionDuration, 0) / workflowMetrics.length || 0;

    return {
      overview: {
        totalWorkflows: targetWorkflows.length,
        totalExecutions,
        activeExecutions,
        successRate: avgSuccessRate,
        avgExecutionTime,
      },
      workflowMetrics,
      recentExecutions: this.getExecutionHistory(undefined, { limit: 10 }),
      activeAlerts: this.getActiveAlerts(),
      performanceTrends: this.calculatePerformanceTrends(targetWorkflows),
    };
  }

  // Private methods

  private updateMetrics(workflowId: string): void {
    const metrics = this.calculateMetrics(workflowId);
    this.metrics.set(workflowId, metrics);
  }

  private calculateMetrics(workflowId: string, timeRange?: { start: Date; end: Date }): WorkflowMetrics {
    let executions = this.executionHistory.filter(e => e.workflowId === workflowId);

    if (timeRange) {
      executions = executions.filter(e => 
        e.startedAt >= timeRange.start && 
        e.startedAt <= timeRange.end
      );
    }

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    const runningExecutions = executions.filter(e => e.status === 'running').length;

    const completedExecutions = executions.filter(e => e.duration !== undefined);
    const durations = completedExecutions.map(e => e.duration!);
    
    const avgExecutionDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;
    const minExecutionDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxExecutionDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const steps = executions.flatMap(e => e.steps);
    const avgStepsPerExecution = totalExecutions > 0 ? steps.length / totalExecutions : 0;

    const errors = executions
      .filter(e => e.error)
      .map(e => e.error!.message);
    const errorCounts = errors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentExecutions = executions.filter(e => e.startedAt >= oneHourAgo);
    const executionFrequency = recentExecutions.length;

    const lastExecution = executions
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]?.startedAt;

    return {
      workflowId,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      runningExecutions,
      avgExecutionDuration,
      minExecutionDuration,
      maxExecutionDuration,
      successRate,
      avgStepsPerExecution,
      commonErrors,
      executionFrequency,
      lastExecution,
      collectionPeriod: timeRange || {
        start: executions[executions.length - 1]?.startedAt || now,
        end: now,
      },
    };
  }

  private calculatePerformanceMetrics(workflowId: string, timeWindow: { start: Date; end: Date }): PerformanceMetrics {
    const executions = this.executionHistory.filter(e => 
      e.workflowId === workflowId &&
      e.startedAt >= timeWindow.start && 
      e.startedAt <= timeWindow.end
    );

    const durations = executions
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!)
      .sort((a, b) => a - b);

    const errors = executions.filter(e => e.status === 'failed');
    const errorsByType = errors.reduce((acc, e) => {
      const errorType = e.error?.code || e.error?.message || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeWindowMs = timeWindow.end.getTime() - timeWindow.start.getTime();
    const timeWindowMinutes = timeWindowMs / (1000 * 60);
    const timeWindowHours = timeWindowMs / (1000 * 60 * 60);
    const timeWindowDays = timeWindowMs / (1000 * 60 * 60 * 24);

    return {
      workflowId,
      timeWindow,
      throughput: {
        executionsPerMinute: executions.length / timeWindowMinutes,
        executionsPerHour: executions.length / timeWindowHours,
        executionsPerDay: executions.length / timeWindowDays,
        peakThroughput: 0, // Would need more detailed time-series data
        peakThroughputTime: new Date(),
      },
      latency: {
        p50: durations[Math.floor(durations.length * 0.5)] || 0,
        p95: durations[Math.floor(durations.length * 0.95)] || 0,
        p99: durations[Math.floor(durations.length * 0.99)] || 0,
        average: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
        minimum: durations[0] || 0,
        maximum: durations[durations.length - 1] || 0,
      },
      errors: {
        errorRate: executions.length > 0 ? errors.length / executions.length : 0,
        errorsByType,
        timeToFailure: 0, // Would need more detailed analysis
        recoveryTime: 0, // Would need more detailed analysis
      },
      resources: {
        avgCpuUsage: 0, // Would need resource monitoring integration
        avgMemoryUsage: 0,
        avgNetworkUsage: 0,
        peakCpuUsage: 0,
        peakMemoryUsage: 0,
      },
      queue: {
        avgQueueTime: 0, // Would need queue timing data
        maxQueueTime: 0,
        currentQueueSize: 0,
        maxQueueSize: 0,
      },
    };
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
      case '>': return metricValue > rule.condition.threshold;
      case '<': return metricValue < rule.condition.threshold;
      case '=': return metricValue === rule.condition.threshold;
      case '!=': return metricValue !== rule.condition.threshold;
      case '>=': return metricValue >= rule.condition.threshold;
      case '<=': return metricValue <= rule.condition.threshold;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, workflowId: string, metrics: WorkflowMetrics): void {
    const alertId = this.generateAlertId();
    const metricValue = metrics[rule.condition.metric as keyof WorkflowMetrics] as number;

    const alert: WorkflowAlert = {
      id: alertId,
      ruleId: rule.id,
      workflowId,
      message: `${rule.name}: ${rule.condition.metric} (${metricValue}) ${rule.condition.operator} ${rule.condition.threshold}`,
      severity: rule.severity,
      status: 'active',
      triggeredAt: new Date(),
      context: {
        metricValue,
        threshold: rule.condition.threshold,
        timeWindow: `${rule.condition.timeWindow} minutes`,
      },
    };

    this.activeAlerts.set(alertId, alert);
    rule.lastTriggered = new Date();

    // Send alert notifications (would integrate with notification service)
    this.sendAlertNotifications(alert, rule);
  }

  private sendAlertNotifications(alert: WorkflowAlert, rule: AlertRule): void {
    // Implementation would send notifications through configured channels
    console.log(`Alert triggered: ${alert.message}`);
  }

  private calculatePerformanceTrends(workflowIds: string[]): Array<{
    timestamp: Date;
    throughput: number;
    latency: number;
    errorRate: number;
  }> {
    // Implementation would calculate performance trends over time
    // This is a placeholder
    return [];
  }

  private generateAlertRuleId(): string {
    return `alert_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
   * Calculate execution success rate
   */
  calculateSuccessRate(executions: ExecutionHistory[]): number {
    if (executions.length === 0) return 1;
    const successful = executions.filter(e => e.status === 'completed').length;
    return successful / executions.length;
  },

  /**
   * Calculate average execution duration
   */
  calculateAverageDuration(executions: ExecutionHistory[]): number {
    const durations = executions
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!);
    
    return durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;
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

  /**
   * Generate health status based on metrics
   */
  calculateHealthStatus(metrics: WorkflowMetrics): 'healthy' | 'warning' | 'critical' {
    if (metrics.successRate < 0.5) return 'critical';
    if (metrics.successRate < 0.8) return 'warning';
    if (metrics.runningExecutions > metrics.totalExecutions * 0.1) return 'warning';
    return 'healthy';
  },
};