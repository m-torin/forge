import { type ExecutionMetrics, type WorkflowExecution, type WorkflowStatus } from '@/types';

interface MemoryStoreStats {
  executions: {
    total: number;
    byStatus: Record<WorkflowStatus, number>;
    byWorkflow: Record<string, number>;
  };
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  performance: {
    averageExecutionTime: number;
    successRate: number;
    throughput: number;
  };
}

export class MemoryStore {
  private executions = new Map<string, WorkflowExecution>();
  private executionsByWorkflow = new Map<string, Set<string>>();
  private executionsByStatus = new Map<WorkflowStatus, Set<string>>();
  private recentActivity: {
    executionId: string;
    workflowId: string;
    status: WorkflowStatus;
    timestamp: Date;
    duration?: number;
  }[] = [];

  private maxExecutions: number;
  private maxRecentActivity: number;

  constructor(maxExecutions = 10000, maxRecentActivity = 1000) {
    this.maxExecutions = maxExecutions;
    this.maxRecentActivity = maxRecentActivity;

    // Initialize status maps
    const statuses: WorkflowStatus[] = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    statuses.forEach((status) => {
      this.executionsByStatus.set(status, new Set());
    });

    // Cleanup old executions periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  // Core execution operations
  setExecution(execution: WorkflowExecution): void {
    const prevExecution = this.executions.get(execution.id);

    // Update main store
    this.executions.set(execution.id, { ...execution });

    // Update workflow index
    if (!this.executionsByWorkflow.has(execution.workflowId)) {
      this.executionsByWorkflow.set(execution.workflowId, new Set());
    }
    this.executionsByWorkflow.get(execution.workflowId)!.add(execution.id);

    // Update status indexes
    if (prevExecution && prevExecution.status !== execution.status) {
      // Remove from old status
      this.executionsByStatus.get(prevExecution.status)?.delete(execution.id);
    }
    this.executionsByStatus.get(execution.status)?.add(execution.id);

    // Update recent activity
    this.addToRecentActivity({
      duration: execution.duration,
      executionId: execution.id,
      status: execution.status,
      timestamp: new Date(),
      workflowId: execution.workflowId,
    });

    // Enforce size limits
    this.enforceSize();
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  deleteExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    // Remove from main store
    this.executions.delete(executionId);

    // Remove from workflow index
    this.executionsByWorkflow.get(execution.workflowId)?.delete(executionId);

    // Remove from status index
    this.executionsByStatus.get(execution.status)?.delete(executionId);

    return true;
  }

  // Query operations
  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    const executionIds = this.executionsByWorkflow.get(workflowId);
    if (!executionIds) return [];

    return Array.from(executionIds)
      .map((id) => this.executions.get(id))
      .filter((execution): execution is WorkflowExecution => execution !== undefined)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()); // Most recent first
  }

  getExecutionsByStatus(status: WorkflowStatus): WorkflowExecution[] {
    const executionIds = this.executionsByStatus.get(status);
    if (!executionIds) return [];

    return Array.from(executionIds)
      .map((id) => this.executions.get(id))
      .filter((execution): execution is WorkflowExecution => execution !== undefined)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  searchExecutions(query: {
    workflowId?: string;
    status?: WorkflowStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): {
    executions: WorkflowExecution[];
    total: number;
  } {
    let results = this.getAllExecutions();

    // Apply filters
    if (query.workflowId) {
      results = results.filter((e) => e.workflowId === query.workflowId);
    }

    if (query.status) {
      results = results.filter((e) => e.status === query.status);
    }

    if (query.startDate) {
      results = results.filter((e) => e.startedAt >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter((e) => e.startedAt <= query.endDate!);
    }

    // Sort by start time (most recent first)
    results.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    const total = results.length;

    // Apply pagination
    if (query.limit || query.offset) {
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      results = results.slice(offset, offset + limit);
    }

    return { executions: results, total };
  }

  // Analytics and metrics
  getStats(): MemoryStoreStats {
    const executions = this.getAllExecutions();
    const now = Date.now();

    // Execution stats
    const byStatus: Record<WorkflowStatus, number> = {
      cancelled: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      running: 0,
    };

    const byWorkflow: Record<string, number> = {};

    let totalDuration = 0;
    let completedCount = 0;

    executions.forEach((execution) => {
      byStatus[execution.status]++;
      byWorkflow[execution.workflowId] = (byWorkflow[execution.workflowId] || 0) + 1;

      if (execution.duration && execution.status === 'completed') {
        totalDuration += execution.duration;
        completedCount++;
      }
    });

    // Memory stats (simplified)
    const used = this.executions.size;
    const available = this.maxExecutions - used;
    const percentage = (used / this.maxExecutions) * 100;

    // Performance stats
    const averageExecutionTime = completedCount > 0 ? totalDuration / completedCount : 0;
    const successRate = executions.length > 0 ? (byStatus.completed / executions.length) * 100 : 0;

    // Throughput (executions per minute in last hour)
    const hourAgo = now - 60 * 60 * 1000;
    const recentExecutions = executions.filter((e) => e.startedAt.getTime() > hourAgo);
    const throughput = recentExecutions.length / 60; // per minute

    return {
      executions: {
        byStatus,
        byWorkflow,
        total: executions.length,
      },
      memory: {
        available,
        percentage,
        used,
      },
      performance: {
        averageExecutionTime,
        successRate,
        throughput,
      },
    };
  }

  getMetrics(): ExecutionMetrics {
    const executions = this.getAllExecutions();
    const activeExecutions = executions.filter(
      (e) => e.status === 'pending' || e.status === 'running',
    ).length;

    return {
      cacheHits: 0, // Would be implemented with actual cache
      cacheMisses: 0,
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      databaseQueries: this.countDatabaseQueries(executions),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
      networkCalls: this.countNetworkCalls(executions),
    };
  }

  getRecentActivity(limit = 50): {
    executionId: string;
    workflowId: string;
    status: WorkflowStatus;
    timestamp: Date;
    duration?: number;
  }[] {
    return this.recentActivity.slice(-limit).reverse(); // Most recent first
  }

  // Utility methods
  private addToRecentActivity(activity: {
    executionId: string;
    workflowId: string;
    status: WorkflowStatus;
    timestamp: Date;
    duration?: number;
  }): void {
    this.recentActivity.push(activity);

    // Keep only recent activity within limit
    if (this.recentActivity.length > this.maxRecentActivity) {
      this.recentActivity = this.recentActivity.slice(-this.maxRecentActivity);
    }
  }

  private enforceSize(): void {
    if (this.executions.size <= this.maxExecutions) return;

    // Get oldest executions to remove
    const executions = Array.from(this.executions.values());
    executions.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

    const toRemove = executions.slice(0, executions.length - this.maxExecutions);

    toRemove.forEach((execution) => {
      this.deleteExecution(execution.id);
    });

    console.log(`Cleaned up ${toRemove.length} old executions`);
  }

  private cleanup(): void {
    const now = Date.now();
    const retentionPeriod =
      parseInt(process.env.METRICS_RETENTION_DAYS || '7') * 24 * 60 * 60 * 1000;
    const cutoff = now - retentionPeriod;

    const executions = Array.from(this.executions.values());
    const toRemove = executions.filter(
      (execution) => execution.completedAt && execution.completedAt.getTime() < cutoff,
    );

    toRemove.forEach((execution) => {
      this.deleteExecution(execution.id);
    });

    if (toRemove.length > 0) {
      console.log(`Cleaned up ${toRemove.length} expired executions`);
    }

    // Clean up recent activity older than retention period
    this.recentActivity = this.recentActivity.filter(
      (activity) => activity.timestamp.getTime() > cutoff,
    );
  }

  private countNetworkCalls(executions: WorkflowExecution[]): number {
    // This would be implemented based on actual step tracking
    return executions.reduce((total, execution) => {
      return total + (execution.steps?.length || 0);
    }, 0);
  }

  private countDatabaseQueries(executions: WorkflowExecution[]): number {
    // This would be implemented based on actual database monitoring
    return 0;
  }

  // Bulk operations
  clear(): void {
    this.executions.clear();
    this.executionsByWorkflow.clear();
    this.executionsByStatus.forEach((set) => set.clear());
    this.recentActivity = [];
  }

  export(): {
    executions: WorkflowExecution[];
    stats: MemoryStoreStats;
    timestamp: Date;
  } {
    return {
      executions: this.getAllExecutions(),
      stats: this.getStats(),
      timestamp: new Date(),
    };
  }

  import(data: { executions: WorkflowExecution[] }): void {
    this.clear();
    data.executions.forEach((execution) => {
      this.setExecution(execution);
    });
  }

  // Health and monitoring
  healthCheck(): {
    healthy: boolean;
    stats: MemoryStoreStats;
    issues: string[];
  } {
    const stats = this.getStats();
    const issues: string[] = [];

    // Check memory usage
    if (stats.memory.percentage > 90) {
      issues.push('Memory usage is critically high');
    } else if (stats.memory.percentage > 75) {
      issues.push('Memory usage is high');
    }

    // Check for stuck executions
    const now = Date.now();
    const stuckThreshold = 30 * 60 * 1000; // 30 minutes
    const runningExecutions = this.getExecutionsByStatus('running');
    const stuckExecutions = runningExecutions.filter(
      (e) => now - e.startedAt.getTime() > stuckThreshold,
    );

    if (stuckExecutions.length > 0) {
      issues.push(`${stuckExecutions.length} executions appear to be stuck`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats,
    };
  }
}

// Singleton instance
export const memoryStore = new MemoryStore();
