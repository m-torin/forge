import { EventEmitter } from 'events';

import { type ExecutionContext } from '@/lib/execution/execution-context';

export interface PerformanceThresholds {
  errorRateThreshold: number; // percentage
  maxCpuUsage: number; // percentage
  maxExecutionTime: number; // milliseconds
  maxMemoryUsage: number; // bytes
  maxStepTime: number; // milliseconds
}

export interface PerformanceAlert {
  executionId: string;
  message: string;
  metadata?: Record<string, any>;
  severity: 'warning' | 'critical';
  threshold: number;
  timestamp: Date;
  type: 'duration' | 'memory' | 'cpu' | 'error_rate' | 'step_timeout';
  value: number;
  workflowId: string;
}

export interface PerformanceSnapshot {
  resources: {
    memoryUsagePercent: number;
    cpuUsagePercent: number;
    diskUsage?: number;
  };
  system: {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    uptime: number;
    loadAverage?: number[];
  };
  timestamp: Date;
  workflows: {
    totalExecutions: number;
    activeExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    throughput: number; // executions per minute
  };
}

export class PerformanceMonitor extends EventEmitter {
  private thresholds: PerformanceThresholds;
  private snapshots: PerformanceSnapshot[] = [];
  private maxSnapshots = 1000;
  private alertHistory: PerformanceAlert[] = [];
  private maxAlerts = 500;

  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  // Performance tracking
  private executionHistory: {
    executionId: string;
    workflowId: string;
    duration: number;
    status: 'completed' | 'failed';
    timestamp: Date;
  }[] = [];

  private baselineCpu?: NodeJS.CpuUsage;
  private lastSnapshotTime = Date.now();

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    super();

    this.thresholds = {
      errorRateThreshold: 10, // 10%
      maxCpuUsage: 80, // 80%
      maxExecutionTime: 300000, // 5 minutes
      maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
      maxStepTime: 60000, // 1 minute
      ...thresholds,
    };

    this.baselineCpu = process.cpuUsage();
  }

  // Monitoring lifecycle
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.captureSnapshot();
    }, intervalMs);

    console.log(`Performance monitoring started (interval: ${intervalMs}ms)`);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  // Execution tracking
  trackExecutionStart(context: ExecutionContext): void {
    // Mark performance measurement start
    if (typeof performance !== 'undefined') {
      performance.mark(`workflow-${context.executionId}-start`);
    }

    // Check if execution is already slow to start
    const queueWaitTime = Date.now() - context.startTime;
    if (queueWaitTime > 10000) {
      // 10 seconds
      this.createAlert({
        type: 'duration',
        executionId: context.executionId,
        message: `Long queue wait time: ${queueWaitTime}ms`,
        severity: 'warning',
        threshold: 10000,
        value: queueWaitTime,
        workflowId: context.workflowId,
      });
    }
  }

  trackExecutionEnd(context: ExecutionContext): void {
    const duration = Date.now() - context.startTime;

    // Mark performance measurement end
    if (typeof performance !== 'undefined') {
      performance.mark(`workflow-${context.executionId}-end`);
      performance.measure(
        `workflow-${context.executionId}`,
        `workflow-${context.executionId}-start`,
        `workflow-${context.executionId}-end`,
      );
    }

    // Add to execution history
    this.executionHistory.push({
      duration,
      executionId: context.executionId,
      status: context.status === 'completed' ? 'completed' : 'failed',
      timestamp: new Date(),
      workflowId: context.workflowId,
    });

    // Trim history if too large
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-500);
    }

    // Check performance thresholds
    this.checkExecutionThresholds(context, duration);

    // Emit performance event
    this.emit('executionCompleted', {
      duration,
      executionId: context.executionId,
      metrics: context.metrics,
      status: context.status,
      workflowId: context.workflowId,
    });
  }

  trackStepExecution(
    context: ExecutionContext,
    stepId: string,
    duration: number,
    success: boolean,
  ): void {
    // Check step duration threshold
    if (duration > this.thresholds.maxStepTime) {
      this.createAlert({
        type: 'step_timeout',
        executionId: context.executionId,
        message: `Step ${stepId} exceeded time limit: ${duration}ms`,
        metadata: { stepId },
        severity: duration > this.thresholds.maxStepTime * 2 ? 'critical' : 'warning',
        threshold: this.thresholds.maxStepTime,
        value: duration,
        workflowId: context.workflowId,
      });
    }

    // Check memory usage if available
    const stepMetrics = context.stepMetrics[stepId];
    if (stepMetrics?.memoryUsage) {
      const memoryUsed = stepMetrics.memoryUsage.heapUsed;
      if (memoryUsed > this.thresholds.maxMemoryUsage) {
        this.createAlert({
          type: 'memory',
          executionId: context.executionId,
          message: `High memory usage in step ${stepId}: ${Math.round(memoryUsed / 1024 / 1024)}MB`,
          metadata: { stepId },
          severity: 'warning',
          threshold: this.thresholds.maxMemoryUsage,
          value: memoryUsed,
          workflowId: context.workflowId,
        });
      }
    }
  }

  // Threshold checking
  private checkExecutionThresholds(context: ExecutionContext, duration: number): void {
    // Duration threshold
    if (duration > this.thresholds.maxExecutionTime) {
      this.createAlert({
        type: 'duration',
        executionId: context.executionId,
        message: `Execution exceeded time limit: ${duration}ms`,
        severity: duration > this.thresholds.maxExecutionTime * 2 ? 'critical' : 'warning',
        threshold: this.thresholds.maxExecutionTime,
        value: duration,
        workflowId: context.workflowId,
      });
    }

    // Memory threshold
    if (context.metrics.memoryUsage) {
      const memoryUsed = context.metrics.memoryUsage.heapUsed;
      if (memoryUsed > this.thresholds.maxMemoryUsage) {
        this.createAlert({
          type: 'memory',
          executionId: context.executionId,
          message: `High memory usage: ${Math.round(memoryUsed / 1024 / 1024)}MB`,
          severity: 'warning',
          threshold: this.thresholds.maxMemoryUsage,
          value: memoryUsed,
          workflowId: context.workflowId,
        });
      }
    }

    // Error rate threshold (check recent executions)
    this.checkErrorRate(context.workflowId);
  }

  private checkErrorRate(workflowId: string): void {
    const recentExecutions = this.executionHistory
      .filter((e) => e.workflowId === workflowId)
      .slice(-20); // Last 20 executions

    if (recentExecutions.length >= 5) {
      const failedCount = recentExecutions.filter((e) => e.status === 'failed').length;
      const errorRate = (failedCount / recentExecutions.length) * 100;

      if (errorRate > this.thresholds.errorRateThreshold) {
        this.createAlert({
          type: 'error_rate',
          executionId: '',
          message: `High error rate for workflow ${workflowId}: ${errorRate.toFixed(1)}%`,
          severity: errorRate > this.thresholds.errorRateThreshold * 2 ? 'critical' : 'warning',
          threshold: this.thresholds.errorRateThreshold,
          value: errorRate,
          workflowId,
        });
      }
    }
  }

  // Snapshot capture
  private captureSnapshot(): void {
    const now = Date.now();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage(this.baselineCpu);

    // Calculate CPU percentage
    const cpuPercent = this.calculateCpuPercent(cpu, now - this.lastSnapshotTime);

    // Calculate workflow metrics
    const recentExecutions = this.executionHistory.filter(
      (e) => now - e.timestamp.getTime() < 60000, // Last minute
    );

    const completedExecutions = this.executionHistory.filter((e) => e.status === 'completed');
    const failedExecutions = this.executionHistory.filter((e) => e.status === 'failed');

    const averageExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length
        : 0;

    const snapshot: PerformanceSnapshot = {
      resources: {
        cpuUsagePercent: cpuPercent,
        memoryUsagePercent: (memory.heapUsed / memory.heapTotal) * 100,
      },
      system: {
        cpu,
        loadAverage: process.platform !== 'win32' ? [0, 0, 0] : undefined,
        memory,
        uptime: process.uptime(),
      },
      timestamp: new Date(),
      workflows: {
        activeExecutions: 0, // Would need access to execution context manager
        averageExecutionTime,
        completedExecutions: completedExecutions.length,
        failedExecutions: failedExecutions.length,
        throughput: recentExecutions.length, // executions per minute
        totalExecutions: this.executionHistory.length,
      },
    };

    this.snapshots.push(snapshot);

    // Trim snapshots if too many
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots / 2);
    }

    // Check system-level thresholds
    if (snapshot.resources.memoryUsagePercent > 90) {
      this.createAlert({
        type: 'memory',
        executionId: '',
        message: `Critical system memory usage: ${snapshot.resources.memoryUsagePercent.toFixed(1)}%`,
        severity: 'critical',
        threshold: 90,
        value: snapshot.resources.memoryUsagePercent,
        workflowId: '',
      });
    }

    if (snapshot.resources.cpuUsagePercent > this.thresholds.maxCpuUsage) {
      this.createAlert({
        type: 'cpu',
        executionId: '',
        message: `High CPU usage: ${snapshot.resources.cpuUsagePercent.toFixed(1)}%`,
        severity: 'warning',
        threshold: this.thresholds.maxCpuUsage,
        value: snapshot.resources.cpuUsagePercent,
        workflowId: '',
      });
    }

    this.lastSnapshotTime = now;
    this.baselineCpu = process.cpuUsage();

    // Emit snapshot event
    this.emit('snapshot', snapshot);
  }

  private calculateCpuPercent(cpuUsage: NodeJS.CpuUsage, timeDelta: number): number {
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    const timeDeltaMicros = timeDelta * 1000; // Convert to microseconds

    if (timeDeltaMicros === 0) return 0;

    return Math.min(100, (totalCpuTime / timeDeltaMicros) * 100);
  }

  // Alert management
  private createAlert(alert: Omit<PerformanceAlert, 'timestamp'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      timestamp: new Date(),
    };

    this.alertHistory.push(fullAlert);

    // Trim alert history
    if (this.alertHistory.length > this.maxAlerts) {
      this.alertHistory = this.alertHistory.slice(-this.maxAlerts / 2);
    }

    // Emit alert event
    this.emit('alert', fullAlert);

    // Log critical alerts
    if (fullAlert.severity === 'critical') {
      console.error(`[CRITICAL ALERT] ${fullAlert.message}`, {
        type: fullAlert.type,
        executionId: fullAlert.executionId,
        threshold: fullAlert.threshold,
        value: fullAlert.value,
        workflowId: fullAlert.workflowId,
      });
    }
  }

  // Analytics and reporting
  getPerformanceReport(timeRange?: { start: Date; end: Date }): {
    summary: {
      totalExecutions: number;
      averageExecutionTime: number;
      successRate: number;
      throughput: number;
      alertCount: number;
    };
    trends: {
      executionTimes: number[];
      memoryUsage: number[];
      cpuUsage: number[];
      timestamps: Date[];
    };
    alerts: PerformanceAlert[];
    topIssues: {
      workflowId: string;
      issueType: string;
      count: number;
      averageValue: number;
    }[];
  } {
    const filteredExecutions = timeRange
      ? this.executionHistory.filter(
          (e) => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end,
        )
      : this.executionHistory;

    const filteredSnapshots = timeRange
      ? this.snapshots.filter((s) => s.timestamp >= timeRange.start && s.timestamp <= timeRange.end)
      : this.snapshots;

    const filteredAlerts = timeRange
      ? this.alertHistory.filter(
          (a) => a.timestamp >= timeRange.start && a.timestamp <= timeRange.end,
        )
      : this.alertHistory;

    const completedExecutions = filteredExecutions.filter((e) => e.status === 'completed');
    const successRate =
      filteredExecutions.length > 0
        ? (completedExecutions.length / filteredExecutions.length) * 100
        : 0;

    const averageExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length
        : 0;

    // Calculate throughput (executions per hour)
    const timeSpan = timeRange ? timeRange.end.getTime() - timeRange.start.getTime() : 3600000; // 1 hour default
    const throughput = (filteredExecutions.length / timeSpan) * 3600000;

    // Group issues by workflow and type
    const issueGroups = new Map<string, { count: number; totalValue: number }>();
    filteredAlerts.forEach((alert) => {
      const key = `${alert.workflowId}-${alert.type}`;
      const group = issueGroups.get(key) || { count: 0, totalValue: 0 };
      group.count++;
      group.totalValue += alert.value;
      issueGroups.set(key, group);
    });

    const topIssues = Array.from(issueGroups.entries())
      .map(([key, group]) => {
        const [workflowId, issueType] = key.split('-');
        return {
          averageValue: group.totalValue / group.count,
          count: group.count,
          issueType,
          workflowId,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      alerts: filteredAlerts,
      summary: {
        alertCount: filteredAlerts.length,
        averageExecutionTime,
        successRate,
        throughput,
        totalExecutions: filteredExecutions.length,
      },
      topIssues,
      trends: {
        cpuUsage: filteredSnapshots.map((s) => s.resources.cpuUsagePercent),
        executionTimes: completedExecutions.map((e) => e.duration),
        memoryUsage: filteredSnapshots.map((s) => s.resources.memoryUsagePercent),
        timestamps: filteredSnapshots.map((s) => s.timestamp),
      },
    };
  }

  // Configuration
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('Performance thresholds updated:', this.thresholds);
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  // Data access
  getRecentSnapshots(count = 100): PerformanceSnapshot[] {
    return this.snapshots.slice(-count);
  }

  getRecentAlerts(count = 50): PerformanceAlert[] {
    return this.alertHistory.slice(-count);
  }

  getExecutionHistory(workflowId?: string, limit = 100) {
    let filtered = this.executionHistory;
    if (workflowId) {
      filtered = filtered.filter((e) => e.workflowId === workflowId);
    }
    return filtered.slice(-limit);
  }

  // Cleanup
  cleanup(): void {
    this.stopMonitoring();
    this.snapshots = [];
    this.alertHistory = [];
    this.executionHistory = [];
    this.removeAllListeners();
  }
}

// Default instance
export const performanceMonitor = new PerformanceMonitor();
