import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createAdvancedScheduler } from '../../src/shared/features/scheduler';
import { UpstashWorkflowProvider } from '../../src/providers/upstash-workflow/provider';
import { setupUpstashMocks, resetUpstashMocks } from '../utils/upstash-mocks';
import type { ScheduleConfig, ScheduledExecution } from '../../src/shared/types/index';

// Create alias for backward compatibility with tests
const createSchedulingService = createAdvancedScheduler;

describe('Scheduling Service', () => {
  let mocks: ReturnType<typeof setupUpstashMocks>;
  let provider: UpstashWorkflowProvider;
  let schedulingService: ReturnType<typeof createSchedulingService>;

  beforeEach(() => {
    mocks = setupUpstashMocks();

    provider = new UpstashWorkflowProvider({
      baseUrl: 'http://localhost:3001',
      qstash: {
        token: 'test-qstash-token',
      },
      redis: {
        url: 'https://test-redis.upstash.io',
        token: 'test-redis-token',
      },
    });

    schedulingService = createSchedulingService(provider);
  });

  afterEach(() => {
    resetUpstashMocks(mocks);
  });

  describe('Schedule Creation', () => {
    test.skip('should create simple cron schedule', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'daily-report',
        input: { reportType: 'sales' },
        cron: '0 9 * * *', // Daily at 9 AM
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      expect(scheduleId).toBeDefined();
      expect(mocks.qstash.schedules.create).toHaveBeenCalledWith({
        cron: '0 9 * * *',
        destination: expect.stringContaining('/api/workflows/daily-report/execute'),
        body: expect.stringContaining('"workflowId":"daily-report"'),
        headers: expect.objectContaining({
          'X-Schedule-ID': scheduleId,
          'X-Workflow-ID': 'daily-report',
        }),
      });
    });

    test.skip('should create schedule with timezone', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'weekly-summary',
        input: { summaryType: 'weekly' },
        cron: '0 9 * * 1', // Monday at 9 AM
        timezone: 'America/New_York',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      expect(scheduleId).toBeDefined();
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:schedule:${scheduleId}`,
        expect.stringContaining('"timezone":"America/New_York"'),
      );
    });

    test.skip('should create one-time scheduled execution', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

      const scheduleConfig: ScheduleConfig = {
        workflowId: 'delayed-notification',
        input: { message: 'Reminder: Meeting in 10 minutes' },
        runAt: futureDate,
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      expect(scheduleId).toBeDefined();
      // For one-time schedules, should use QStash delay instead of cron
      expect(mocks.qstash.publishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/workflows/delayed-notification/execute'),
          delay: expect.any(Number),
        }),
      );
    });

    test.skip('should create schedule with start and end dates', async () => {
      const startDate = new Date(Date.now() + 86400000); // 1 day from now
      const endDate = new Date(Date.now() + 7 * 86400000); // 7 days from now

      const scheduleConfig: ScheduleConfig = {
        workflowId: 'campaign-emails',
        input: { campaignId: 'summer2024' },
        cron: '0 12 * * *', // Daily at noon
        timezone: 'UTC',
        startDate,
        endDate,
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      expect(scheduleId).toBeDefined();
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:schedule:${scheduleId}`,
        expect.stringContaining(`"startDate":"${startDate.toISOString()}"`),
      );
    });
  });

  describe('Schedule Management', () => {
    test.skip('should update existing schedule', async () => {
      const originalConfig: ScheduleConfig = {
        workflowId: 'backup-job',
        input: { type: 'full' },
        cron: '0 2 * * *', // 2 AM daily
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(originalConfig);

      const updatedConfig = {
        cron: '0 3 * * *', // Changed to 3 AM
        input: { type: 'incremental' }, // Changed backup type
      };

      await schedulingService.updateSchedule(scheduleId, updatedConfig);

      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:schedule:${scheduleId}`,
        expect.stringContaining('"cron":"0 3 * * *"'),
      );
    });

    test.skip('should pause and resume schedule', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'data-sync',
        input: { syncType: 'delta' },
        cron: '*/15 * * * *', // Every 15 minutes
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      // Pause schedule
      await schedulingService.pauseSchedule(scheduleId);

      const pausedSchedule = await schedulingService.getSchedule(scheduleId);
      expect(pausedSchedule?.enabled).toBe(false);

      // Resume schedule
      await schedulingService.resumeSchedule(scheduleId);

      const resumedSchedule = await schedulingService.getSchedule(scheduleId);
      expect(resumedSchedule?.enabled).toBe(true);
    });

    test.skip('should delete schedule', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'temp-job',
        input: { data: 'test' },
        cron: '0 * * * *', // Hourly
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      const deleted = await schedulingService.deleteSchedule(scheduleId);

      expect(deleted).toBe(true);
      expect(mocks.redis.del).toHaveBeenCalledWith(`workflow:schedule:${scheduleId}`);
    });

    test.skip('should list all schedules', async () => {
      // Create multiple schedules
      const schedule1 = await schedulingService.createSchedule({
        workflowId: 'job-1',
        cron: '0 9 * * *',
        timezone: 'UTC',
      });

      const schedule2 = await schedulingService.createSchedule({
        workflowId: 'job-2',
        cron: '0 18 * * *',
        timezone: 'UTC',
      });

      // Mock Redis to return schedule keys
      mocks.redis.keys.mockResolvedValue([
        `workflow:schedule:${schedule1}`,
        `workflow:schedule:${schedule2}`,
      ]);

      mocks.redis.get
        .mockResolvedValueOnce(
          JSON.stringify({
            scheduleId: schedule1,
            workflowId: 'job-1',
            cron: '0 9 * * *',
            enabled: true,
          }),
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            scheduleId: schedule2,
            workflowId: 'job-2',
            cron: '0 18 * * *',
            enabled: true,
          }),
        );

      const schedules = await schedulingService.listSchedules();

      expect(schedules).toHaveLength(2);
      expect(schedules.map((s) => s.workflowId)).toContain('job-1');
      expect(schedules.map((s) => s.workflowId)).toContain('job-2');
    });
  });

  describe('Schedule Execution', () => {
    test.skip('should trigger schedule manually', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'manual-trigger-test',
        input: { triggered: 'manually' },
        cron: '0 9 * * *',
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      const execution = await schedulingService.triggerSchedule(scheduleId);

      expect(execution).toBeDefined();
      expect(execution.scheduleId).toBe(scheduleId);
      expect(execution.triggeredManually).toBe(true);
      expect(mocks.qstash.publishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/workflows/manual-trigger-test/execute'),
          body: expect.stringContaining('"triggered":"manually"'),
        }),
      );
    });

    test.skip('should get next execution time', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'next-run-test',
        input: { test: true },
        cron: '0 12 * * 1', // Every Monday at noon
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      const nextRun = await schedulingService.getNextExecution(scheduleId);

      expect(nextRun).toBeInstanceOf(Date);
      expect(nextRun!.getTime()).toBeGreaterThan(Date.now());
    });

    test.skip('should handle timezone-specific scheduling', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'timezone-test',
        input: { timezone: 'America/Los_Angeles' },
        cron: '0 9 * * *', // 9 AM in specified timezone
        timezone: 'America/Los_Angeles',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      // Mock timezone conversion
      const nextRun = await schedulingService.getNextExecution(scheduleId);

      expect(nextRun).toBeInstanceOf(Date);
      // The actual timezone conversion would be handled by the cron library
    });
  });

  describe('Schedule History', () => {
    test.skip('should track execution history', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'history-test',
        input: { track: 'execution' },
        cron: '*/5 * * * *', // Every 5 minutes
        timezone: 'UTC',
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      // Simulate multiple executions
      await schedulingService.triggerSchedule(scheduleId);
      await schedulingService.triggerSchedule(scheduleId);

      // Mock execution history in Redis
      const mockHistory: ScheduledExecution[] = [
        {
          scheduleId,
          executionId: 'exec_1',
          startedAt: new Date(Date.now() - 600000), // 10 minutes ago
          completedAt: new Date(Date.now() - 590000),
          status: 'completed',
          triggeredManually: true,
        },
        {
          scheduleId,
          executionId: 'exec_2',
          startedAt: new Date(Date.now() - 300000), // 5 minutes ago
          completedAt: new Date(Date.now() - 290000),
          status: 'completed',
          triggeredManually: true,
        },
      ];

      mocks.redis.get.mockResolvedValue(JSON.stringify(mockHistory));

      const history = await schedulingService.getExecutionHistory(scheduleId);

      expect(history).toHaveLength(2);
      expect(history[0].status).toBe('completed');
      expect(history[1].status).toBe('completed');
    });

    test.skip('should get execution statistics', async () => {
      const scheduleId = 'stats_test_123';

      // Mock execution history with various statuses
      const mockHistory: ScheduledExecution[] = [
        {
          scheduleId,
          executionId: 'exec_1',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          scheduleId,
          executionId: 'exec_2',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          scheduleId,
          executionId: 'exec_3',
          status: 'failed',
          startedAt: new Date(),
          error: 'Processing failed',
        },
        {
          scheduleId,
          executionId: 'exec_4',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ];

      mocks.redis.get.mockResolvedValue(JSON.stringify(mockHistory));

      const stats = await schedulingService.getExecutionStatistics(scheduleId);

      expect(stats).toEqual({
        totalExecutions: 4,
        successfulExecutions: 3,
        failedExecutions: 1,
        successRate: 0.75,
        lastExecution: expect.any(Date),
        averageExecutionTime: expect.any(Number),
      });
    });
  });

  describe('Complex Scheduling Scenarios', () => {
    test.skip('should handle overlapping schedule conflicts', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'long-running-job',
        input: { duration: 'long' },
        cron: '*/10 * * * *', // Every 10 minutes
        timezone: 'UTC',
        metadata: {
          maxExecutionTime: 600000, // 10 minutes
          preventOverlap: true,
        },
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      // Simulate overlapping execution detection
      const canTrigger = await schedulingService.canTriggerSchedule(scheduleId);

      expect(typeof canTrigger).toBe('boolean');
    });

    test.skip('should support conditional scheduling', async () => {
      const scheduleConfig: ScheduleConfig = {
        workflowId: 'conditional-backup',
        input: { type: 'conditional' },
        cron: '0 3 * * *', // Daily at 3 AM
        timezone: 'UTC',
        metadata: {
          conditions: [
            { type: 'day_of_week', values: ['monday', 'wednesday', 'friday'] },
            { type: 'minimum_interval', value: 86400000 }, // 24 hours
          ],
        },
      };

      const scheduleId = await schedulingService.createSchedule(scheduleConfig);

      // The conditions would be evaluated at runtime
      expect(scheduleId).toBeDefined();
    });

    test.skip('should handle schedule dependencies', async () => {
      // Create parent schedule
      const parentSchedule = await schedulingService.createSchedule({
        workflowId: 'data-extraction',
        cron: '0 1 * * *', // 1 AM daily
        timezone: 'UTC',
      });

      // Create dependent schedule
      const dependentSchedule = await schedulingService.createSchedule({
        workflowId: 'data-processing',
        cron: '0 2 * * *', // 2 AM daily (after extraction)
        timezone: 'UTC',
        metadata: {
          dependencies: [parentSchedule],
          waitForDependencies: true,
        },
      });

      expect(dependentSchedule).toBeDefined();
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:schedule:${dependentSchedule}`,
        expect.stringContaining(`"dependencies":["${parentSchedule}"]`),
      );
    });

    test.skip('should support schedule groups', async () => {
      const groupId = 'reporting-group';

      const schedules = await Promise.all([
        schedulingService.createSchedule({
          workflowId: 'daily-sales-report',
          cron: '0 9 * * *',
          timezone: 'UTC',
          metadata: { group: groupId },
        }),
        schedulingService.createSchedule({
          workflowId: 'daily-inventory-report',
          cron: '0 10 * * *',
          timezone: 'UTC',
          metadata: { group: groupId },
        }),
        schedulingService.createSchedule({
          workflowId: 'daily-analytics-report',
          cron: '0 11 * * *',
          timezone: 'UTC',
          metadata: { group: groupId },
        }),
      ]);

      // Should be able to manage schedules as a group
      expect(schedules).toHaveLength(3);
      schedules.forEach((scheduleId) => {
        expect(scheduleId).toBeDefined();
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    test.skip('should handle QStash errors gracefully', async () => {
      mocks.qstash.schedules.create.mockRejectedValue(new Error('QStash service unavailable'));

      const scheduleConfig: ScheduleConfig = {
        workflowId: 'error-test',
        cron: '0 * * * *',
        timezone: 'UTC',
      };

      await expect(schedulingService.createSchedule(scheduleConfig)).rejects.toThrow(
        'QStash service unavailable',
      );
    });

    test.skip('should handle invalid cron expressions', async () => {
      const invalidScheduleConfig: ScheduleConfig = {
        workflowId: 'invalid-cron',
        cron: 'invalid-cron-expression',
        timezone: 'UTC',
      };

      await expect(schedulingService.createSchedule(invalidScheduleConfig)).rejects.toThrow();
    });

    test.skip('should handle schedule not found', async () => {
      mocks.redis.get.mockResolvedValue(null);

      const schedule = await schedulingService.getSchedule('non-existent-schedule');
      expect(schedule).toBeNull();
    });

    test.skip('should handle timezone errors', async () => {
      const invalidTimezoneConfig: ScheduleConfig = {
        workflowId: 'invalid-timezone',
        cron: '0 9 * * *',
        timezone: 'Invalid/Timezone',
      };

      // Should either throw an error or default to UTC
      await expect(schedulingService.createSchedule(invalidTimezoneConfig)).rejects.toThrow();
    });
  });
});
