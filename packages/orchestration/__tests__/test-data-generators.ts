/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across orchestration test suites.
 * Reduces duplication and ensures realistic workflow scenarios.
 *
 * Based on the analytics test-data-generators.ts pattern but specialized for orchestration.
 */

import { vi } from 'vitest';
import {
  RateLimitConfig,
  UpstashQStashConfig,
  UpstashWorkflowConfig,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
} from '../src/shared/types';

// Common test data patterns
export const testPatterns = {
  // Workflow identifiers
  workflowIds: [
    'simple-workflow',
    'complex-workflow-123',
    'workflow-with-dashes',
    'workflow_with_underscores',
    'workflow.with.dots',
    'workflow:with:colons',
    'workflow/with/slashes',
    'workflow (with spaces)',
    'workflow-émojis-🚀',
    'workflow-üñíçøðé',
    '',
    'a'.repeat(100), // Long workflow ID
    'workflow-with-special-chars-!@#$%^&*()',
  ],

  // Execution identifiers
  executionIds: [
    'exec-123',
    'exec_456',
    'exec.789',
    'exec-with-uuid-1234-5678-9012',
    'exec-émojis-🎯',
    '',
    'a'.repeat(50), // Long execution ID
  ],

  // Step names
  stepNames: [
    'Initial Step',
    'Process Data',
    'Send Notification',
    'Validate Input',
    'Transform Data',
    'Step with Special Chars !@#$%',
    'Step with Émojis 🚀',
    'Step with Üñíçøðé',
    'Step/with/slashes',
    'Step (with parentheses)',
    'Step-with-dashes',
    'Step_with_underscores',
    'Step.with.dots',
    '',
    'a'.repeat(200), // Long step name
  ],

  // Action types
  actionTypes: [
    'http-request',
    'database-query',
    'send-email',
    'validate-data',
    'transform-data',
    'call-webhook',
    'delay',
    'conditional',
    'loop',
    'parallel',
    'custom-action',
    'action-with-special-chars-!@#$%',
    'action_with_underscores',
    'action.with.dots',
    '',
  ],

  // Workflow statuses
  workflowStatuses: [
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'paused',
    'retrying',
  ],

  // Step statuses
  stepStatuses: ['pending', 'running', 'completed', 'failed', 'skipped', 'cancelled', 'retrying'],

  // Cron expressions
  cronExpressions: [
    '0 9 * * *', // Daily at 9 AM
    '0 */6 * * *', // Every 6 hours
    '0 0 * * 0', // Weekly on Sunday
    '0 0 1 * *', // Monthly on 1st
    '*/15 * * * *', // Every 15 minutes
    '0 0 * * 1-5', // Weekdays only
    '0 12 * * *', // Daily at noon
    '0 0 */2 * *', // Every other day
    '0 9-17 * * 1-5', // Business hours
  ],

  // Timezone identifiers
  timezones: [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'America/Chicago',
    'Europe/Berlin',
  ],

  // Provider types
  providerTypes: ['upstash-workflow', 'upstash-qstash', 'redis', 'local', 'memory'],

  // URLs for webhooks and endpoints
  urls: [
    'https://api.example.com/webhook',
    'https://webhook.site/unique-id',
    'https://httpbin.org/post',
    'https://jsonplaceholder.typicode.com/posts',
    'https://api.github.com/repos/user/repo/issues',
    'https://discord.com/api/webhooks/123/token',
    'https://hooks.slack.com/services/T/B/token',
    'https://api.stripe.com/v1/charges',
    'https://api.sendgrid.com/v3/mail/send',
    'http://localhost:3000/api/webhook',
  ],

  // HTTP methods
  httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],

  // Content types
  contentTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
    'text/xml',
    'application/xml',
  ],

  // Error messages
  errorMessages: [
    'Network timeout',
    'Connection refused',
    'Invalid JSON response',
    'Unauthorized access',
    'Rate limit exceeded',
    'Workflow validation failed',
    'Step execution failed',
    'Provider unavailable',
    'Configuration error',
    'Resource not found',
    'Permission denied',
    'Invalid input format',
    'Database connection failed',
    'Queue is full',
    'Execution timeout',
  ],
};

// Workflow test data generators
export const workflowGenerators = {
  // Basic workflow with single step
  simple: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'simple-workflow',
      name: 'Simple Workflow',
      description: 'A simple workflow for testing',
      version: '1.0.0',
      steps: [stepGenerators.basic()],
      ...overrides,
    }) as any,

  // Complex workflow with multiple steps
  complex: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'complex-workflow',
      name: 'Complex Workflow',
      description: 'A complex workflow with multiple steps',
      version: '1.0.0',
      steps: [
        stepGenerators.basic({ name: 'Initialize', action: 'init' }),
        stepGenerators.withInput({ name: 'Process', action: 'process' }),
        stepGenerators.withOutput({ name: 'Transform', action: 'transform' }),
        stepGenerators.conditional({ name: 'Validate', action: 'validate' }),
        stepGenerators.basic({ name: 'Finalize', action: 'finalize' }),
      ],
      ...overrides,
    }) as any,

  // Workflow with parallel steps
  parallel: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'parallel-workflow',
      name: 'Parallel Workflow',
      description: 'A workflow with parallel execution',
      version: '1.0.0',
      steps: [
        stepGenerators.basic({ name: 'Start', action: 'start' }),
        stepGenerators.basic({
          name: 'Parallel Group',
          action: 'parallel',
        }),
        stepGenerators.basic({ name: 'End', action: 'end' }),
      ],
      ...overrides,
    }) as any,

  // Workflow with error handling
  withErrorHandling: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'error-handling-workflow',
      name: 'Error Handling Workflow',
      description: 'A workflow with error handling',
      version: '1.0.0',
      steps: [
        stepGenerators.basic({ name: 'Try Step', action: 'try' }),
        stepGenerators.basic({
          name: 'Error Handler',
          action: 'error-handler',
        }),
        stepGenerators.basic({ name: 'Cleanup', action: 'cleanup' }),
      ],
      ...overrides,
    }) as any,

  // Scheduled workflow
  scheduled: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'scheduled-workflow',
      name: 'Scheduled Workflow',
      description: 'A workflow with scheduling configuration',
      version: '1.0.0',
      steps: [stepGenerators.basic()],
      schedule: {
        cron: '0 9 * * 1', // Every Monday at 9 AM
        timezone: 'UTC',
      },
      ...overrides,
    }) as any,

  // Large workflow for performance testing
  large: (stepCount = 50, overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'large-workflow',
      name: 'Large Workflow',
      description: `A large workflow with ${stepCount} steps`,
      version: '1.0.0',
      steps: Array.from({ length: stepCount }, (_, i) =>
        stepGenerators.basic({
          name: `Step ${i + 1}`,
          action: `action-${i + 1}`,
          id: `step-${i + 1}`,
        }),
      ),
      ...overrides,
    }) as any,

  // Workflow with special characters and edge cases
  edgeCase: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'edge-case-workflow-!@#$%',
      name: 'Edge Case Workflow with Émojis 🚀',
      description: 'A workflow with special characters and üñíçøðé',
      version: '1.0.0-beta.1',
      steps: [
        stepGenerators.basic({
          name: "Step with \"quotes\" and 'apostrophes'",
          action: 'special-chars',
          id: 'step-with-special-chars-!@#$%',
        }),
        stepGenerators.withInput({
          name: 'Unicode Step 🌟',
          action: 'unicode-action',
          input: { emoji: '🎯', unicode: 'üñíçøðé' },
        }),
      ],
      ...overrides,
    }) as any,

  // Empty workflow
  empty: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: 'empty-workflow',
      name: 'Empty Workflow',
      description: 'An empty workflow with no steps',
      version: '1.0.0',
      steps: [],
      ...overrides,
    }) as any,

  // Workflow with invalid structure (for error testing)
  invalid: (overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition =>
    ({
      id: '', // Invalid: empty ID
      name: '', // Invalid: empty name
      version: 'invalid-version', // Invalid: non-semver
      steps: null as any, // Invalid: null steps
      ...overrides,
    }) as any,
};

// Step test data generators
export const stepGenerators = {
  // Basic step
  basic: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'basic-step',
      name: 'Basic Step',
      action: 'basic-action',
      status: 'pending',
      ...overrides,
    }) as any,

  // Step with input
  withInput: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'input-step',
      name: 'Step with Input',
      action: 'input-action',
      status: 'pending',
      input: {
        message: 'Hello World',
        count: 42,
        enabled: true,
        data: { key: 'value', nested: { array: [1, 2, 3] } },
      },
      ...overrides,
    }) as any,

  // Step with output
  withOutput: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'output-step',
      name: 'Step with Output',
      action: 'output-action',
      status: 'completed',
      output: {
        result: 'success',
        data: { processed: true, timestamp: new Date().toISOString() },
        metrics: { duration: 1500, memory: 128 },
      },
      ...overrides,
    }) as any,

  // Conditional step
  conditional: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'conditional-step',
      name: 'Conditional Step',
      action: 'conditional-action',
      status: 'pending',
      condition: {
        type: 'expression',
        expression: 'input.value > 10',
      },
      ...overrides,
    }) as any,

  // Parallel step
  parallel: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'parallel-step',
      name: 'Parallel Step',
      action: 'parallel-action',
      status: 'pending',
      parallel: [
        stepGenerators.basic({ name: 'Parallel Task 1', action: 'task-1' }),
        stepGenerators.basic({ name: 'Parallel Task 2', action: 'task-2' }),
      ],
      ...overrides,
    }) as any,

  // HTTP request step
  httpRequest: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'http-request-step',
      name: 'HTTP Request Step',
      action: 'http-request',
      status: 'pending',
      config: {
        url: 'https://api.example.com/endpoint',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Hello API' },
        timeout: 30000,
      },
      ...overrides,
    }) as any,

  // Database query step
  databaseQuery: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'database-query-step',
      name: 'Database Query Step',
      action: 'database-query',
      status: 'pending',
      config: {
        query: 'SELECT * FROM users WHERE active = true',
        parameters: { limit: 100 },
        timeout: 10000,
      },
      ...overrides,
    }) as any,

  // Error handler step
  errorHandler: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'error-handler-step',
      name: 'Error Handler Step',
      action: 'error-handler',
      status: 'pending',
      onError: 'retry',
      maxRetries: 3,
      retryDelay: 1000,
      ...overrides,
    }) as any,

  // Delay step
  delay: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'delay-step',
      name: 'Delay Step',
      action: 'delay',
      status: 'pending',
      config: {
        duration: 5000, // 5 seconds
        unit: 'milliseconds',
      },
      ...overrides,
    }) as any,

  // Step with large input (for performance testing)
  largeInput: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: 'large-input-step',
      name: 'Large Input Step',
      action: 'large-input-action',
      status: 'pending',
      input: {
        largeArray: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          data: `item-${i}`,
          metadata: { timestamp: new Date().toISOString() },
        })),
        largeString: 'a'.repeat(10000),
        nestedObject: Array.from({ length: 100 }, (_, i) => ({
          level1: {
            level2: {
              level3: { value: `nested-${i}` },
            },
          },
        })),
      },
      ...overrides,
    }) as any,

  // Invalid step (for error testing)
  invalid: (overrides: Partial<WorkflowStep> = {}): WorkflowStep =>
    ({
      id: '', // Invalid: empty ID
      name: '', // Invalid: empty name
      action: '', // Invalid: empty action
      status: 'invalid-status' as any, // Invalid: unknown status
      ...overrides,
    }) as any,
};

// Execution test data generators
export const executionGenerators = {
  // Running execution
  running: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-running',
      workflowId: 'test-workflow',
      status: 'running',
      startedAt: new Date(),
      steps: [
        { ...stepGenerators.basic(), status: 'completed' },
        { ...stepGenerators.basic({ name: 'Current Step' }), status: 'running' },
        { ...stepGenerators.basic({ name: 'Pending Step' }), status: 'pending' },
      ],
      ...overrides,
    }) as any,

  // Completed execution
  completed: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-completed',
      workflowId: 'test-workflow',
      status: 'completed',
      startedAt: new Date(Date.now() - 60000), // 1 minute ago
      completedAt: new Date(),
      steps: [
        { ...stepGenerators.basic(), status: 'completed' },
        { ...stepGenerators.basic({ name: 'Final Step' }), status: 'completed' },
      ],
      output: {
        result: 'success',
        data: { processed: true },
        metrics: { duration: 60000, stepsCompleted: 2 },
      },
      ...overrides,
    }) as any,

  // Failed execution
  failed: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-failed',
      workflowId: 'test-workflow',
      status: 'failed',
      startedAt: new Date(Date.now() - 30000), // 30 seconds ago
      failedAt: new Date(),
      steps: [
        { ...stepGenerators.basic(), status: 'completed' },
        { ...stepGenerators.basic({ name: 'Failed Step' }), status: 'failed' },
      ],
      error: {
        message: 'Step execution failed',
        code: 'STEP_EXECUTION_ERROR',
        details: { stepId: 'failed-step', reason: 'Network timeout' },
      },
      ...overrides,
    }) as any,

  // Cancelled execution
  cancelled: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-cancelled',
      workflowId: 'test-workflow',
      status: 'cancelled',
      startedAt: new Date(Date.now() - 20000), // 20 seconds ago
      cancelledAt: new Date(),
      steps: [
        { ...stepGenerators.basic(), status: 'completed' },
        { ...stepGenerators.basic({ name: 'Cancelled Step' }), status: 'cancelled' },
      ],
      ...overrides,
    }) as any,

  // Pending execution
  pending: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-pending',
      workflowId: 'test-workflow',
      status: 'pending',
      createdAt: new Date(),
      steps: [
        { ...stepGenerators.basic(), status: 'pending' },
        { ...stepGenerators.basic({ name: 'Next Step' }), status: 'pending' },
      ],
      ...overrides,
    }) as any,

  // Execution with large data (for performance testing)
  largeData: (overrides: Partial<WorkflowExecution> = {}): WorkflowExecution =>
    ({
      id: 'exec-large-data',
      workflowId: 'large-workflow',
      status: 'running',
      startedAt: new Date(),
      steps: Array.from({ length: 50 }, (_, i) => ({
        ...stepGenerators.basic({ name: `Step ${i + 1}` }),
        status: i < 25 ? 'completed' : 'pending',
      })),
      output: {
        largeArray: Array.from({ length: 5000 }, (_, i) => ({ id: i, data: `result-${i}` })),
        metrics: { totalSteps: 50, completedSteps: 25 },
      },
      ...overrides,
    }) as any,
};

// Provider configuration generators
export const providerConfigGenerators = {
  // Upstash Workflow configuration
  upstashWorkflow: (overrides: Partial<UpstashWorkflowConfig> = {}): UpstashWorkflowConfig =>
    ({
      name: 'test-upstash-workflow',
      type: 'upstash-workflow',
      config: {
        baseUrl: 'https://test-workflow.upstash.io',
        qstashToken: 'test-qstash-token',
        redisToken: 'test-redis-token',
        redisUrl: 'https://test-redis.upstash.io',
      },
      enabled: true,
      ...overrides,
    }) as any,

  // QStash configuration
  qstash: (overrides: Partial<UpstashQStashConfig> = {}): UpstashQStashConfig =>
    ({
      name: 'test-qstash',
      type: 'upstash-qstash',
      config: {
        baseUrl: 'https://qstash.upstash.io',
        token: 'test-qstash-token',
      },
      enabled: true,
      ...overrides,
    }) as any,

  // Rate limit configuration
  rateLimit: (overrides: Partial<RateLimitConfig> = {}): RateLimitConfig =>
    ({
      name: 'test-rate-limit',
      type: 'rate-limit',
      config: {
        redisToken: 'test-redis-token',
        redisUrl: 'https://test-redis.upstash.io',
        maxRequests: 100,
        windowMs: 60000, // 1 minute
      },
      enabled: true,
      ...overrides,
    }) as any,
};

// Schedule configuration generators
export const scheduleGenerators = {
  // Daily schedule
  daily: (overrides = {}) =>
    ({
      id: 'daily-schedule',
      name: 'Daily Schedule',
      cron: '0 9 * * *', // 9 AM every day
      timezone: 'UTC',
      workflowId: 'test-workflow',
      enabled: true,
      ...overrides,
    }) as any,

  // Hourly schedule
  hourly: (overrides = {}) =>
    ({
      id: 'hourly-schedule',
      name: 'Hourly Schedule',
      cron: '0 * * * *', // Every hour
      timezone: 'UTC',
      workflowId: 'test-workflow',
      enabled: true,
      ...overrides,
    }) as any,

  // Weekly schedule
  weekly: (overrides = {}) =>
    ({
      id: 'weekly-schedule',
      name: 'Weekly Schedule',
      cron: '0 9 * * 1', // 9 AM every Monday
      timezone: 'America/New_York',
      workflowId: 'test-workflow',
      enabled: true,
      ...overrides,
    }) as any,

  // Custom schedule
  custom: (cron: string, overrides = {}) =>
    ({
      id: 'custom-schedule',
      name: 'Custom Schedule',
      cron,
      timezone: 'UTC',
      workflowId: 'test-workflow',
      enabled: true,
      ...overrides,
    }) as any,
};

// Batch generators for performance testing
export const batchGenerators = {
  // Generate multiple workflows
  workflows: (count: number, generator = workflowGenerators.simple) =>
    Array.from({ length: count }, (_, i) => generator({ id: `workflow-${i}` })),

  // Generate multiple executions
  executions: (count: number, generator = executionGenerators.running) =>
    Array.from({ length: count }, (_, i) => generator({ id: `exec-${i}` })),

  // Generate multiple steps
  steps: (count: number, generator = stepGenerators.basic) =>
    Array.from({ length: count }, (_, i) => generator({ id: `step-${i}`, name: `Step ${i}` })),

  // Generate multiple schedules
  schedules: (count: number, generator = scheduleGenerators.daily) =>
    Array.from({ length: count }, (_, i) => generator({ id: `schedule-${i}` })),
};

// Utility functions for test data
export const testDataUtils = {
  // Pick random item from array
  randomItem: <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)],

  // Generate random string
  randomString: (length = 10): string =>
    Math.random()
      .toString(36)
      .substring(2, length + 2),

  // Generate random number
  randomNumber: (min = 0, max = 100): number => Math.floor(Math.random() * (max - min + 1)) + min,

  // Generate random boolean
  randomBoolean: (): boolean => Math.random() > 0.5,

  // Generate random date
  randomDate: (daysAgo = 30): Date =>
    new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000),

  // Generate random workflow ID
  randomWorkflowId: (): string => `workflow-${testDataUtils.randomString(8)}`,

  // Generate random execution ID
  randomExecutionId: (): string => `exec-${testDataUtils.randomString(8)}`,

  // Generate random step ID
  randomStepId: (): string => `step-${testDataUtils.randomString(8)}`,

  // Create workflow with random data
  randomWorkflow: (): WorkflowDefinition => ({
    id: testDataUtils.randomWorkflowId(),
    name: `Random Workflow ${testDataUtils.randomString(5)}`,
    version: `${testDataUtils.randomNumber(1, 9)}.${testDataUtils.randomNumber(0, 9)}.${testDataUtils.randomNumber(0, 9)}`,
    steps: Array.from({ length: testDataUtils.randomNumber(1, 5) }, () =>
      stepGenerators.basic({
        id: testDataUtils.randomStepId(),
        name: `Random Step ${testDataUtils.randomString(5)}`,
        action: testDataUtils.randomItem(testPatterns.actionTypes),
      }),
    ),
  }),

  // Create mock monitoring service
  createMockMonitoringService: () => ({
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getMetrics: vi.fn().mockResolvedValue({}),
    logEvent: vi.fn(),
  }),

  // Create mock event bus
  createMockEventBus: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }),

  // Create mock scheduling service
  createMockSchedulingService: () => ({
    scheduleWorkflow: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
    unscheduleWorkflow: vi.fn().mockResolvedValue({ success: true }),
    listSchedules: vi.fn().mockResolvedValue([]),
  }),

  // Create multi-provider config
  createMultiProviderConfig: () => ({
    providers: [
      {
        type: 'upstash-workflow' as const,
        name: 'primary',
        config: providerConfigGenerators.upstashWorkflow(),
      },
      {
        type: 'upstash-workflow' as const,
        name: 'secondary',
        config: providerConfigGenerators.upstashWorkflow(),
      },
    ],
  }),

  // Create execution with random data
  randomExecution: (): WorkflowExecution => ({
    id: testDataUtils.randomExecutionId(),
    workflowId: testDataUtils.randomWorkflowId(),
    status: testDataUtils.randomItem(testPatterns.workflowStatuses) as any,
    startedAt: testDataUtils.randomDate(),
    steps: Array.from({ length: testDataUtils.randomNumber(1, 3) }, () => ({
      stepId: testDataUtils.randomStepId(),
      status: testDataUtils.randomItem(testPatterns.stepStatuses) as any,
      startedAt: testDataUtils.randomDate(),
    })),
  }),
};

// Export everything for easy access
export {
  createQStashConfig,
  createRateLimitConfig,
  // Enhanced versions of existing fixtures
  createTestExecution,
  createTestStep,
  createTestTimeout,
  createTestWorkflow,
  createUpstashWorkflowConfig,
  mockResponses,
  waitFor,
} from './fixtures';

// Export centralized test patterns
export const testData = {
  patterns: testPatterns,
  workflows: workflowGenerators,
  steps: stepGenerators,
  executions: executionGenerators,
  providers: providerConfigGenerators,
  schedules: scheduleGenerators,
  batches: batchGenerators,
  utils: testDataUtils,
};

// Individual generators are already exported with 'export const' above
