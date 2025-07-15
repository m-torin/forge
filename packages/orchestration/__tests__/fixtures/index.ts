/**
 * Test fixtures and utilities for orchestration package tests
 */

import {
  RateLimitConfig,
  UpstashQStashConfig,
  UpstashWorkflowConfig,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
} from '../../src/shared/types';

/**
 * Create a valid QStash provider config
 */
export function createQStashConfig(
  overrides: Partial<UpstashQStashConfig> = {},
): UpstashQStashConfig {
  return {
    name: 'test-qstash',
    type: 'upstash-qstash',
    config: {
      baseUrl: 'http://localhost:8080',
      token: 'test-qstash-token',
      ...overrides.config,
    },
    enabled: true,
    ...overrides,
  };
}

/**
 * Create a valid rate limit provider config
 */
export function createRateLimitConfig(overrides: Partial<RateLimitConfig> = {}): RateLimitConfig {
  return {
    name: 'test-rate-limit',
    type: 'rate-limit',
    config: {
      redisToken: 'test-redis-token',
      redisUrl: 'redis://localhost:6379',
      ...overrides.config,
    },
    enabled: true,
    ...overrides,
  };
}

/**
 * Create a workflow execution for testing
 */
export function createTestExecution(overrides: Partial<WorkflowExecution> = {}): WorkflowExecution {
  return {
    id: 'exec_123',
    startedAt: new Date(),
    status: 'running',
    steps: [],
    workflowId: 'test-workflow',
    ...overrides,
  };
}

/**
 * Create a valid workflow step for testing
 */
export function createTestStep(overrides: Partial<WorkflowStep> = {}): WorkflowStep {
  return {
    id: 'step_1',
    name: 'Test Step',
    action: 'test-action',
    ...overrides,
  };
}

/**
 * Create a valid workflow definition for testing
 */
export function createTestWorkflow(
  overrides: Partial<WorkflowDefinition> = {},
): WorkflowDefinition {
  return {
    id: 'test-workflow',
    name: 'Test Workflow',
    steps: [createTestStep()],
    version: '1.0.0',
    ...overrides,
  };
}

/**
 * Create a valid Upstash workflow provider config
 */
export function createUpstashWorkflowConfig(
  overrides: Partial<UpstashWorkflowConfig> = {},
): UpstashWorkflowConfig {
  return {
    name: 'test-upstash-workflow',
    type: 'upstash-workflow',
    config: {
      baseUrl: 'http://localhost:8080',
      qstashToken: 'test-qstash-token',
      redisToken: 'test-redis-token',
      redisUrl: 'redis://localhost:6379',
      ...overrides.config,
    },
    enabled: true,
    ...overrides,
  };
}

/**
 * Create mock responses for common operations
 */
export const mockResponses = {
  execution: {
    failure: {
      id: 'exec_123',
      error: { message: 'Test error' },
      status: 'failed',
    },
    success: {
      id: 'exec_123',
      result: { success: true },
      status: 'completed',
    },
  },
  health: {
    healthy: {
      message: 'Provider is healthy',
      status: 'healthy' as const,
    },
    unhealthy: {
      error: 'Connection failed',
      message: 'Provider is unhealthy',
      status: 'unhealthy' as const,
    },
  },
  qstash: {
    publishSuccess: {
      messageId: 'msg_123',
    },
    scheduleSuccess: {
      scheduleId: 'schedule_123',
    },
  },
};

/**
 * Create a test timeout with proper cleanup
 */
export function createTestTimeout(ms = 5000): {
  cancel: () => void;
  promise: Promise<never>;
} {
  let timeoutId: NodeJS.Timeout;
  const promise = new Promise<never>((_resolve, reject: any) => {
    timeoutId = setTimeout(() => reject(new Error(`Test timeout after ${ms}ms`)), ms);
  });

  return {
    cancel: () => clearTimeout(timeoutId),
    promise,
  };
}

/**
 * Wait for async operations in tests
 */
export async function waitFor(ms: number): Promise<void> {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}
