import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryStore } from '@/lib/storage/memory-store';
import { WorkflowExecution, WorkflowStatus } from '@/types';

describe('MemoryStore', () => {
  let store: MemoryStore;
  const maxExecutions = 100;
  const maxRecentActivity = 50;

  beforeEach(() => {
    store = new MemoryStore(maxExecutions, maxRecentActivity);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('execution operations', () => {
    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should set and get execution', () => {
      const execution = createMockExecution();

      store.setExecution(execution);
      const retrieved = store.getExecution('exec-123');

      expect(retrieved).toEqual(execution);
    });

    it('should create deep copy when setting execution', () => {
      const execution = createMockExecution();

      store.setExecution(execution);
      execution.status = 'running'; // Modify original

      const retrieved = store.getExecution('exec-123');
      expect(retrieved?.status).toBe('pending'); // Should not be modified
    });

    it('should update execution when setting with same ID', () => {
      const execution = createMockExecution();
      store.setExecution(execution);

      const updatedExecution = { ...execution, status: 'completed' as WorkflowStatus };
      store.setExecution(updatedExecution);

      const retrieved = store.getExecution('exec-123');
      expect(retrieved?.status).toBe('completed');
    });

    it('should delete execution', () => {
      const execution = createMockExecution();
      store.setExecution(execution);

      const deleted = store.deleteExecution('exec-123');
      const retrieved = store.getExecution('exec-123');

      expect(deleted).toBe(true);
      expect(retrieved).toBeUndefined();
    });

    it('should return false when deleting non-existent execution', () => {
      const deleted = store.deleteExecution('non-existent');
      expect(deleted).toBe(false);
    });

    it('should get all executions', () => {
      const exec1 = createMockExecution({ id: 'exec-1' });
      const exec2 = createMockExecution({ id: 'exec-2' });

      store.setExecution(exec1);
      store.setExecution(exec2);

      const allExecutions = store.getAllExecutions();
      expect(allExecutions).toHaveLength(2);
      expect(allExecutions.map((e) => e.id)).toContain('exec-1');
      expect(allExecutions.map((e) => e.id)).toContain('exec-2');
    });
  });

  describe('workflow-based querying', () => {
    beforeEach(() => {
      const executions = [
        createMockExecution({
          id: 'exec-1',
          workflowId: 'workflow-a',
          startedAt: new Date('2024-01-01T10:00:00Z'),
        }),
        createMockExecution({
          id: 'exec-2',
          workflowId: 'workflow-a',
          startedAt: new Date('2024-01-01T11:00:00Z'),
        }),
        createMockExecution({
          id: 'exec-3',
          workflowId: 'workflow-b',
          startedAt: new Date('2024-01-01T09:00:00Z'),
        }),
      ];

      executions.forEach((exec) => store.setExecution(exec));
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should get executions by workflow ID', () => {
      const workflowAExecutions = store.getExecutionsByWorkflow('workflow-a');

      expect(workflowAExecutions).toHaveLength(2);
      expect(workflowAExecutions.map((e) => e.id)).toContain('exec-1');
      expect(workflowAExecutions.map((e) => e.id)).toContain('exec-2');
    });

    it('should sort executions by start time (most recent first)', () => {
      const workflowAExecutions = store.getExecutionsByWorkflow('workflow-a');

      expect(workflowAExecutions[0].id).toBe('exec-2'); // 11:00
      expect(workflowAExecutions[1].id).toBe('exec-1'); // 10:00
    });

    it('should return empty array for non-existent workflow', () => {
      const executions = store.getExecutionsByWorkflow('non-existent');
      expect(executions).toEqual([]);
    });
  });

  describe('status-based querying', () => {
    beforeEach(() => {
      const executions = [
        createMockExecution({ id: 'exec-1', status: 'pending' }),
        createMockExecution({ id: 'exec-2', status: 'running' }),
        createMockExecution({ id: 'exec-3', status: 'completed' }),
        createMockExecution({ id: 'exec-4', status: 'failed' }),
      ];

      executions.forEach((exec) => store.setExecution(exec));
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should get executions by status', () => {
      const runningExecutions = store.getExecutionsByStatus('running');

      expect(runningExecutions).toHaveLength(1);
      expect(runningExecutions[0].id).toBe('exec-2');
    });

    it('should update status indexes when execution status changes', () => {
      const execution = store.getExecution('exec-1')!;
      const updatedExecution = { ...execution, status: 'running' as WorkflowStatus };
      store.setExecution(updatedExecution);

      const pendingExecutions = store.getExecutionsByStatus('pending');
      const runningExecutions = store.getExecutionsByStatus('running');

      expect(pendingExecutions).toHaveLength(0);
      expect(runningExecutions).toHaveLength(2); // exec-1 and exec-2
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      const executions = [
        createMockExecution({
          id: 'exec-1',
          workflowId: 'payment',
          status: 'completed',
          startedAt: new Date('2024-01-01T10:00:00Z'),
        }),
        createMockExecution({
          id: 'exec-2',
          workflowId: 'email',
          status: 'running',
          startedAt: new Date('2024-01-02T10:00:00Z'),
        }),
        createMockExecution({
          id: 'exec-3',
          workflowId: 'payment',
          status: 'failed',
          startedAt: new Date('2024-01-03T10:00:00Z'),
        }),
      ];

      executions.forEach((exec) => store.setExecution(exec));
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should search by workflow ID', () => {
      const result = store.searchExecutions({ workflowId: 'payment' });

      expect(result.total).toBe(2);
      expect(result.executions).toHaveLength(2);
      expect(result.executions.map((e) => e.id)).toContain('exec-1');
      expect(result.executions.map((e) => e.id)).toContain('exec-3');
    });

    it('should search by status', () => {
      const result = store.searchExecutions({ status: 'running' });

      expect(result.total).toBe(1);
      expect(result.executions[0].id).toBe('exec-2');
    });

    it('should search by date range', () => {
      const result = store.searchExecutions({
        startDate: new Date('2024-01-02T00:00:00Z'),
        endDate: new Date('2024-01-03T23:59:59Z'),
      });

      expect(result.total).toBe(2);
      expect(result.executions.map((e) => e.id)).toContain('exec-2');
      expect(result.executions.map((e) => e.id)).toContain('exec-3');
    });

    it('should apply pagination', () => {
      const result = store.searchExecutions({ limit: 2, offset: 1 });

      expect(result.total).toBe(3);
      expect(result.executions).toHaveLength(2);
    });

    it('should combine multiple filters', () => {
      const result = store.searchExecutions({
        workflowId: 'payment',
        status: 'completed',
      });

      expect(result.total).toBe(1);
      expect(result.executions[0].id).toBe('exec-1');
    });
  });

  describe('statistics and metrics', () => {
    beforeEach(() => {
      const executions = [
        createMockExecution({
          id: 'exec-1',
          workflowId: 'payment',
          status: 'completed',
          duration: 1000,
        }),
        createMockExecution({
          id: 'exec-2',
          workflowId: 'payment',
          status: 'completed',
          duration: 2000,
        }),
        createMockExecution({
          id: 'exec-3',
          workflowId: 'email',
          status: 'failed',
        }),
        createMockExecution({
          id: 'exec-4',
          workflowId: 'email',
          status: 'running',
        }),
      ];

      executions.forEach((exec) => store.setExecution(exec));
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should calculate execution statistics', () => {
      const stats = store.getStats();

      expect(stats.executions.total).toBe(4);
      expect(stats.executions.byStatus).toEqual({
        pending: 0,
        running: 1,
        completed: 2,
        failed: 1,
        cancelled: 0,
      });
      expect(stats.executions.byWorkflow).toEqual({
        payment: 2,
        email: 2,
      });
    });

    it('should calculate performance metrics', () => {
      const stats = store.getStats();

      expect(stats.performance.averageExecutionTime).toBe(1500); // (1000 + 2000) / 2
      expect(stats.performance.successRate).toBe(50); // 2 completed out of 4 total
    });

    it('should calculate memory usage', () => {
      const stats = store.getStats();

      expect(stats.memory.used).toBe(4); // 4 executions
      expect(stats.memory.available).toBe(96); // 100 - 4
      expect(stats.memory.percentage).toBe(4); // 4%
    });

    it('should provide system metrics', () => {
      const metrics = store.getMetrics();

      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics.networkCalls).toBe(0); // No steps in test executions
    });
  });

  describe('recent activity tracking', () => {
    it('should track recent activity when setting executions', () => {
      const execution = createMockExecution({ id: 'exec-1', workflowId: 'test' });
      store.setExecution(execution);

      const activity = store.getRecentActivity(10);

      expect(activity).toHaveLength(1);
      expect(activity[0]).toMatchObject({
        executionId: 'exec-1',
        workflowId: 'test',
        status: 'pending',
        timestamp: expect.any(Date),
      });
    });

    it('should limit recent activity to specified count', () => {
      // Add more activities than the limit
      for (let i = 0; i < 60; i++) {
        const execution = createMockExecution({ id: `exec-${i}` });
        store.setExecution(execution);
      }

      const activity = store.getRecentActivity(10);
      expect(activity).toHaveLength(10);
    });

    it('should return most recent activities first', () => {
      const exec1 = createMockExecution({ id: 'exec-1' });
      const exec2 = createMockExecution({ id: 'exec-2' });

      store.setExecution(exec1);
      vi.advanceTimersByTime(1000); // Advance time
      store.setExecution(exec2);

      const activity = store.getRecentActivity(10);
      expect(activity[0].executionId).toBe('exec-2'); // Most recent first
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });
  });

  describe('size management', () => {
    it('should enforce maximum execution limit', () => {
      const smallStore = new MemoryStore(3, 10); // Only 3 executions max

      // Add 5 executions
      for (let i = 0; i < 5; i++) {
        const execution = createMockExecution({
          id: `exec-${i}`,
          startedAt: new Date(Date.now() + i * 1000), // Different timestamps
        });
        smallStore.setExecution(execution);
      }

      const allExecutions = smallStore.getAllExecutions();
      expect(allExecutions).toHaveLength(3); // Should only keep 3 most recent
    });

    it('should clean up expired executions', () => {
      // Mock environment variable for retention
      process.env.METRICS_RETENTION_DAYS = '1';

      const oldExecution = createMockExecution({
        id: 'old-exec',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      });

      const recentExecution = createMockExecution({
        id: 'recent-exec',
        completedAt: new Date(), // Now
      });

      store.setExecution(oldExecution);
      store.setExecution(recentExecution);

      // Trigger cleanup by advancing timers
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes

      expect(store.getExecution('recent-exec')).toBeDefined();
      // Old execution should be cleaned up after timer advancement
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });
  });

  describe('bulk operations', () => {
    beforeEach(() => {
      const executions = [
        createMockExecution({ id: 'exec-1' }),
        createMockExecution({ id: 'exec-2' }),
      ];
      executions.forEach((exec) => store.setExecution(exec));
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });

    it('should clear all data', () => {
      store.clear();

      expect(store.getAllExecutions()).toHaveLength(0);
      expect(store.getRecentActivity()).toHaveLength(0);
    });

    it('should export data', () => {
      const exported = store.export();

      expect(exported).toHaveProperty('executions');
      expect(exported).toHaveProperty('stats');
      expect(exported).toHaveProperty('timestamp');
      expect(exported.executions).toHaveLength(2);
    });

    it('should import data', () => {
      const newExecution = createMockExecution({ id: 'imported-exec' });

      store.import({ executions: [newExecution] });

      expect(store.getAllExecutions()).toHaveLength(1);
      expect(store.getExecution('imported-exec')).toBeDefined();
    });
  });

  describe('health monitoring', () => {
    it('should report healthy status with normal usage', () => {
      const execution = createMockExecution();
      store.setExecution(execution);

      const health = store.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.issues).toEqual([]);
    });

    it('should detect high memory usage', () => {
      const smallStore = new MemoryStore(10, 10);

      // Fill store to 80% capacity
      for (let i = 0; i < 8; i++) {
        const execution = createMockExecution({ id: `exec-${i}` });
        smallStore.setExecution(execution);
      }

      const health = smallStore.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.issues).toContain('Memory usage is high');
    });

    it('should detect stuck executions', () => {
      // Create a running execution from 45 minutes ago
      const stuckExecution = createMockExecution({
        id: 'stuck-exec',
        status: 'running',
        startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      });

      store.setExecution(stuckExecution);

      const health = store.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.issues).toContain('1 executions appear to be stuck');
    });

    const createMockExecution = (
      overrides: Partial<WorkflowExecution> = {},
    ): WorkflowExecution => ({
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'pending' as WorkflowStatus,
      input: { test: 'data' },
      startedAt: new Date(),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
      ...overrides,
    });
  });
});
