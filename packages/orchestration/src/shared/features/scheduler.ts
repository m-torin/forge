/**
 * Enhanced Scheduling Capabilities
 * Advanced cron scheduling with timezone handling and schedule management
 */

import { createServerObservability } from '@repo/observability/server/next';
import { WorkflowDefinition, WorkflowProvider } from '../types/workflow';

export interface EnhancedScheduleConfig {
  /** Whether to catch up on missed executions */
  catchUp?: boolean;
  /** Cron expression */
  cron: string;
  /** End time for schedule (ISO string) */
  endTime?: string;
  /** Maximum number of executions (undefined for unlimited) */
  maxExecutions?: number;
  /** Schedule metadata */
  metadata?: Record<string, unknown>;
  /** Start time for schedule (ISO string) */
  startTime?: string;
  /** Timezone for schedule execution (IANA timezone) */
  timezone?: string;
}

export interface ScheduleExecution {
  /** Execution completion time */
  completedAt?: Date;
  /** Error details if failed */
  error?: string;
  /** Actual execution start time */
  executedAt: Date;
  /** Unique execution identifier */
  id: string;
  /** Execution result or error */
  result?: unknown;
  /** Scheduled execution time */
  scheduledAt: Date;
  /** Schedule ID */
  scheduleId: string;
  /** Execution status */
  status: 'completed' | 'failed' | 'pending' | 'running';
  /** Workflow execution ID */
  workflowExecutionId: string;
}

export interface ScheduleHealthCheck {
  /** Issues found during health check */
  issues: string[];
  /** Last check timestamp */
  lastCheck: Date;
  /** Performance metrics */
  metrics: {
    avgExecutionTime: number;
    lastExecutionGap: number;
    successRate: number;
  };
  /** Schedule ID */
  scheduleId: string;
  /** Health status */
  status: 'critical' | 'healthy' | 'warning';
}

export interface ScheduleStatus {
  /** Schedule configuration */
  config: EnhancedScheduleConfig;
  /** Creation timestamp */
  createdAt: Date;
  /** Whether schedule is enabled */
  enabled?: boolean;
  /** Error message if status is 'error' */
  error?: string;
  /** Number of executions completed */
  executionCount: number;
  /** Unique schedule identifier */
  id: string;
  /** Last execution time */
  lastExecution?: Date;
  /** Next execution time */
  nextExecution?: Date;
  /** Current status */
  status: 'active' | 'completed' | 'error' | 'paused';
  /** Last update timestamp */
  updatedAt: Date;
  /** Associated workflow ID */
  workflowId: string;
}

export class AdvancedScheduler {
  private provider: WorkflowProvider;
  private schedules = new Map<string, ScheduleStatus>();
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Handle catch-up executions for missed schedules
   */
  async catchUpMissedExecutions(scheduleId: string): Promise<string[]> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule?.config.catchUp) {
      return [];
    }

    const missedExecutions = this.calculateMissedExecutions(schedule);
    const executionIds: string[] = [];

    for (const executionTime of missedExecutions) {
      try {
        const executionId = await this.executeScheduledWorkflow(schedule, executionTime);
        executionIds.push(executionId);
      } catch (error) {
        const logger = await createServerObservability();
        await logger.log('error', `Failed to catch up execution for schedule ${scheduleId}`, {
          error,
        });
      }
    }

    return executionIds;
  }

  /**
   * Create a new schedule for a workflow
   */
  async createSchedule(
    workflowId: string,
    config: EnhancedScheduleConfig | import('../types/scheduler').ScheduleConfig,
    scheduleId?: string,
  ): Promise<string> {
    const id = scheduleId || this.generateScheduleId();

    // Convert ScheduleConfig to EnhancedScheduleConfig if needed
    const enhancedConfig: EnhancedScheduleConfig =
      'workflowId' in config
        ? {
            cron: config.cron || '0 * * * *',
            metadata: config.metadata,
            timezone: config.timezone,
          }
        : config;

    // Validate cron expression
    this.validateCronExpression(enhancedConfig.cron);

    // Validate timezone if provided
    if (enhancedConfig.timezone) {
      this.validateTimezone(enhancedConfig.timezone);
    }

    const schedule: ScheduleStatus = {
      config: enhancedConfig,
      createdAt: new Date(),
      executionCount: 0,
      id,
      nextExecution: this.calculateNextExecution(enhancedConfig),
      status: 'active',
      updatedAt: new Date(),
      workflowId,
    };

    this.schedules.set(id, schedule);
    await this.scheduleNext(id);

    return id;
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    this.clearTimer(scheduleId);
    this.schedules.delete(scheduleId);
  }

  /**
   * Get execution history for a schedule
   */
  getExecutionHistory(scheduleId: string): ScheduleExecution[] {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return [];
    }

    // Return mock execution history for testing
    return [];
  }

  /**
   * Get next execution time for a schedule
   */
  getNextExecution(scheduleId: string): Date | null {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return null;
    }

    return schedule.nextExecution || null;
  }

  /**
   * Get schedule status
   */
  getSchedule(scheduleId: string): ScheduleStatus | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * List all schedules
   */
  listSchedules(filter?: {
    status?: ScheduleStatus['status'];
    workflowId?: string;
  }): ScheduleStatus[] {
    const schedules = Array.from(this.schedules.values());

    if (!filter) {
      return schedules;
    }

    return schedules.filter((schedule: any) => {
      if (filter.workflowId && schedule.workflowId !== filter.workflowId) {
        return false;
      }
      if (filter.status && schedule.status !== filter.status) {
        return false;
      }
      return true;
    });
  }

  /**
   * Pause a schedule
   */
  async pauseSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    schedule.status = 'paused';
    schedule.updatedAt = new Date();
    this.clearTimer(scheduleId);
  }

  /**
   * Perform health check on schedules
   */
  async performHealthCheck(scheduleIds?: string[]): Promise<ScheduleHealthCheck[]> {
    const schedulesToCheck = scheduleIds
      ? (scheduleIds.map((id: any) => this.schedules.get(id)).filter(Boolean) as ScheduleStatus[])
      : Array.from(this.schedules.values());

    const healthChecks: ScheduleHealthCheck[] = [];

    for (const schedule of schedulesToCheck) {
      const issues: string[] = [];

      // Check if schedule is overdue
      if (schedule.nextExecution && schedule.nextExecution < new Date()) {
        const overdue = Date.now() - schedule.nextExecution.getTime();
        if (overdue > 300000) {
          // 5 minutes
          issues.push(`Schedule is overdue by ${Math.round(overdue / 1000)}s`);
        }
      }

      // Check execution frequency
      if (schedule.lastExecution) {
        const gap = Date.now() - schedule.lastExecution.getTime();
        const expectedGap = this.getExpectedExecutionGap(schedule.config.cron);
        if (gap > expectedGap * 2) {
          issues.push('Execution frequency is lower than expected');
        }
      }

      // Determine health status
      let status: ScheduleHealthCheck['status'] = 'healthy';
      if (issues.length > 0) {
        status = issues.some((issue: any) => issue.includes('overdue')) ? 'critical' : 'warning';
      }

      healthChecks.push({
        issues,
        lastCheck: new Date(),
        metrics: {
          avgExecutionTime: 0, // Would be calculated from execution history
          lastExecutionGap: schedule.lastExecution
            ? Date.now() - schedule.lastExecution.getTime()
            : 0,
          successRate: 1, // Would be calculated from execution history
        },
        scheduleId: schedule.id,
        status,
      });
    }

    return healthChecks;
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    if (schedule.status !== 'paused') {
      throw new Error(`Schedule ${scheduleId} is not paused`);
    }

    schedule.status = 'active';
    schedule.nextExecution = this.calculateNextExecution(schedule.config);
    schedule.updatedAt = new Date();

    await this.scheduleNext(scheduleId);
  }

  /**
   * Trigger a schedule manually
   */
  async triggerSchedule(
    scheduleId: string,
  ): Promise<{ executionId: string; scheduleId: string; triggeredManually: boolean }> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    // Execute the workflow with schedule input
    const execution = await this.provider.execute({
      id: schedule.workflowId,
      name: schedule.workflowId,
      steps: [],
      version: '1.0.0',
    });

    return {
      executionId: execution.id,
      scheduleId,
      triggeredManually: true,
    };
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(scheduleId: string, config: Partial<EnhancedScheduleConfig>): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    // Validate new cron expression if provided
    if (config.cron) {
      this.validateCronExpression(config.cron);
    }

    // Validate timezone if provided
    if (config.timezone) {
      this.validateTimezone(config.timezone);
    }

    // Update schedule configuration
    schedule.config = { ...schedule.config, ...config };
    schedule.updatedAt = new Date();

    // Recalculate next execution
    schedule.nextExecution = this.calculateNextExecution(schedule.config);

    // Reschedule
    this.clearTimer(scheduleId);
    if (schedule.status === 'active') {
      await this.scheduleNext(scheduleId);
    }
  }

  // Private methods

  private calculateMissedExecutions(_schedule: ScheduleStatus): Date[] {
    // Implementation would calculate all missed executions since last execution
    // This is a placeholder
    return [];
  }

  private calculateNextExecution(
    config: EnhancedScheduleConfig,
    fromTime?: Date,
  ): Date | undefined {
    const baseTime = fromTime || new Date();

    // This is a simplified implementation
    // In a real implementation, you'd use a proper cron parser like 'node-cron'
    return new Date(baseTime.getTime() + 60000); // Next minute for now
  }

  private clearTimer(scheduleId: string): void {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }
  }

  private async executeSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return;
    }

    try {
      const executionTime = schedule.nextExecution || new Date();
      await this.executeScheduledWorkflow(schedule, executionTime);

      // Update schedule
      schedule.lastExecution = executionTime;
      schedule.executionCount++;
      schedule.updatedAt = new Date();

      // Check if max executions reached
      if (
        schedule.config.maxExecutions &&
        schedule.executionCount >= schedule.config.maxExecutions
      ) {
        schedule.status = 'completed';
        return;
      }

      // Calculate next execution
      schedule.nextExecution = this.calculateNextExecution(schedule.config, executionTime);

      // Schedule next execution
      await this.scheduleNext(scheduleId);
    } catch (error) {
      schedule.status = 'error';
      schedule.error =
        error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error);
      schedule.updatedAt = new Date();
    }
  }

  private async executeScheduledWorkflow(
    schedule: ScheduleStatus,
    scheduledTime: Date,
  ): Promise<string> {
    // Execute workflow through provider
    const result = await (this.provider.executeWorkflow
      ? this.provider.executeWorkflow(schedule.workflowId, {
          scheduledExecution: true,
          scheduledTime: scheduledTime.toISOString(),
          scheduleId: schedule.id,
        })
      : this.provider.execute(await this.getWorkflowDefinition(schedule.workflowId), {
          scheduledExecution: true,
          scheduledTime: scheduledTime.toISOString(),
          scheduleId: schedule.id,
        }));

    return typeof result === 'string' ? result : result.id;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getExpectedExecutionGap(_cron: string): number {
    // Parse cron expression to determine expected gap between executions
    // This is a simplified implementation
    return 60000; // 1 minute
  }

  private async getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    if (this.provider.getWorkflow) {
      const definition = await this.provider.getWorkflow(workflowId);
      if (!definition) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      return definition;
    }
    throw new Error('Provider does not support getWorkflow method');
  }

  private async scheduleNext(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule || schedule.status !== 'active') {
      return;
    }

    const nextExecution = schedule.nextExecution;
    if (!nextExecution) {
      return;
    }

    const delay = nextExecution.getTime() - Date.now();

    if (delay <= 0) {
      // Execute immediately if overdue
      await this.executeSchedule(scheduleId);
    } else {
      // Schedule for future execution
      const timer = setTimeout(() => {
        this.executeSchedule(scheduleId);
      }, delay);

      this.timers.set(scheduleId, timer);
    }
  }

  private validateCronExpression(cron: string): void {
    // Basic validation - in production, use a proper cron validator
    if (!cron || typeof cron !== 'string') {
      throw new Error('Invalid cron expression');
    }
  }

  private validateTimezone(timezone: string): void {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
  }

  /**
   * Clean up all timers and resources
   */
  cleanup(): void {
    // Clear all active timers
    for (const [_scheduleId, timer] of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.schedules.clear();
  }
}

/**
 * Create a new advanced scheduler instance
 */
export function createAdvancedScheduler(provider: WorkflowProvider): AdvancedScheduler {
  return new AdvancedScheduler(provider);
}

/**
 * Utility functions for working with schedules
 */
export const ScheduleUtils = {
  /**
   * Check if a time matches a cron expression
   */
  cronMatches(_cron: string, _time: Date, _timezone?: string): boolean {
    // Implementation would use proper cron parser
    return true; // Placeholder
  },

  /**
   * Parse a cron expression to human-readable format
   */
  cronToHuman(cron: string): string {
    // Simplified implementation - use a proper cron parser in production
    return `Schedule: ${cron}`;
  },

  /**
   * Get next N execution times for a cron expression
   */
  getNextExecutions(_cron: string, count: number, _timezone?: string): Date[] {
    // Implementation would use proper cron parser
    const executions: Date[] = [];
    let current = new Date();

    for (let i = 0; i < count; i++) {
      current = new Date(current.getTime() + 60000 * (i + 1));
      executions.push(current);
    }

    return executions;
  },

  /**
   * Validate a cron expression
   */
  validateCron(cron: string): boolean {
    try {
      // Basic validation - should use proper cron parser in production
      const parts = cron.split(' ');
      return parts.length === 5 || parts.length === 6;
    } catch {
      return false;
    }
  },
};
