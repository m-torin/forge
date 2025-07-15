// Centralized orchestration package mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock @repo/orchestration/server-next
vi.mock('@repo/orchestration/server-next', () => ({
  createWorkflowEngine: vi.fn().mockResolvedValue({ engine: {} }),
  executeWorkflow: vi.fn().mockResolvedValue({ result: {} }),
  createWorkflowHandler: vi.fn().mockReturnValue({ handler: {} }),
  validateServerRequest: vi.fn().mockReturnValue({ valid: true }),
  parseWorkflowInput: vi.fn().mockReturnValue({ parsed: {} }),
  createServerOrchestrationManager: vi.fn().mockReturnValue({ manager: {} }),
  createErrorHandler: vi.fn().mockReturnValue({ handler: {} }),
  handleValidationError: vi.fn().mockReturnValue({ handled: true }),
  createServerConfig: vi.fn().mockReturnValue({ config: {} }),
  validateServerConfig: vi.fn().mockReturnValue({ valid: true }),
  WorkflowExecutionList: vi.fn().mockReturnValue({ list: [] }),
  WorkflowMetricsDisplay: vi.fn().mockReturnValue({ metrics: {} }),
  WorkflowScheduleManager: vi.fn().mockReturnValue({ manager: {} }),
  createRateLimitMiddleware: vi.fn().mockReturnValue({ middleware: {} }),
  createAuthMiddleware: vi.fn().mockReturnValue({ middleware: {} }),
  createStreamingHandler: vi.fn().mockReturnValue({ handler: {} }),
  createWebSocketHandler: vi.fn().mockReturnValue({ handler: {} }),
  createBackgroundJobProcessor: vi.fn().mockReturnValue({ processor: {} }),
  createCacheManager: vi.fn().mockReturnValue({ cache: {} }),
  createWorkflowMiddleware: vi.fn().mockReturnValue({ middleware: {} }),
  namedImport: vi.fn().mockReturnValue({ import: {} }),
  // Add API handlers that return promises
  api: Promise.resolve({
    acknowledgeAlert: vi.fn().mockResolvedValue({ response: {} }),
    cancelExecution: vi.fn().mockResolvedValue({ response: {} }),
    createWorkflow: vi.fn().mockResolvedValue({ response: {} }),
    deleteWorkflow: vi.fn().mockResolvedValue({ response: {} }),
    executeWorkflow: vi.fn().mockResolvedValue({ response: {} }),
    getExecution: vi.fn().mockResolvedValue({ response: {} }),
    getExecutionHistory: vi.fn().mockResolvedValue({ response: {} }),
    getExecutionLogs: vi.fn().mockResolvedValue({ response: {} }),
    getExecutionMetrics: vi.fn().mockResolvedValue({ response: {} }),
    getExecutionStatus: vi.fn().mockResolvedValue({ response: {} }),
    getWorkflow: vi.fn().mockResolvedValue({ response: {} }),
    getWorkflowList: vi.fn().mockResolvedValue({ response: {} }),
    getWorkflowMetrics: vi.fn().mockResolvedValue({ response: {} }),
    pauseExecution: vi.fn().mockResolvedValue({ response: {} }),
    resumeExecution: vi.fn().mockResolvedValue({ response: {} }),
    retryExecution: vi.fn().mockResolvedValue({ response: {} }),
    updateSchedule: vi.fn().mockResolvedValue({ response: {} }),
    updateWorkflow: vi.fn().mockResolvedValue({ response: {} }),
  }),
}));

// Mock @repo/orchestration/shared/features/scheduler
vi.mock('@repo/orchestration/shared/features/scheduler', () => ({
  createScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  createCronScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  createIntervalScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  createDistributedScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  createPriorityScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  createConditionalScheduler: vi.fn().mockReturnValue({ scheduler: {} }),
  EnhancedScheduleConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  ScheduleStatus: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    STOPPED: 'stopped',
  },
  validateSchedule: vi.fn().mockReturnValue({ valid: true }),
  validateCronExpression: vi.fn().mockReturnValue({ valid: true }),
  getScheduleStatus: vi.fn().mockReturnValue({ status: 'active' }),
  updateSchedule: vi.fn().mockResolvedValue({ updated: true }),
  deleteSchedule: vi.fn().mockResolvedValue({ deleted: true }),
  ScheduleManager: vi.fn().mockReturnValue({ manager: {} }),
  createSchedulePersistence: vi.fn().mockReturnValue({ persistence: {} }),
  createExecutionTracker: vi.fn().mockReturnValue({ tracker: {} }),
  createScheduleErrorHandler: vi.fn().mockReturnValue({ handler: {} }),
}));

// Mock @repo/orchestration/shared/features/monitoring
vi.mock('@repo/orchestration/shared/features/monitoring', () => ({
  createMonitor: vi.fn().mockReturnValue({ monitor: {} }),
  trackExecution: vi.fn().mockResolvedValue({ tracked: true }),
  getMetrics: vi.fn().mockResolvedValue({ metrics: {} }),
  createAlert: vi.fn().mockResolvedValue({ alert: {} }),
  getExecutionHistory: vi.fn().mockResolvedValue({ history: [] }),
  createMetricsCollector: vi.fn().mockReturnValue({ collector: {} }),
  createAlertsManager: vi.fn().mockReturnValue({ manager: {} }),
  createPerformanceMonitor: vi.fn().mockReturnValue({ monitor: {} }),
  createRealtimeMonitor: vi.fn().mockReturnValue({ monitor: {} }),
  createErrorTracker: vi.fn().mockReturnValue({ tracker: {} }),
  createHealthChecker: vi.fn().mockReturnValue({ checker: {} }),
  WorkflowMetrics: vi.fn().mockReturnValue({ metrics: {} }),
  ExecutionHistory: vi.fn().mockReturnValue({ history: [] }),
  WorkflowAlert: vi.fn().mockReturnValue({ alert: {} }),
}));

// Mock @repo/orchestration/shared/types/workflow runtime-accessible exports
vi.mock('@repo/orchestration/shared/types/workflow', () => ({
  WorkflowExecutionStatus: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },
  WorkflowStepStatus: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped',
  },
}));

// Mock @repo/orchestration/shared/types/provider
vi.mock('@repo/orchestration/shared/types/provider', () => ({
  ProviderType: {
    QSTASH: 'qstash',
    TEMPORAL: 'temporal',
    CUSTOM: 'custom',
  },
}));

// Mock @repo/orchestration/shared/types/scheduler
vi.mock('@repo/orchestration/shared/types/scheduler', () => ({
  ScheduleType: {
    CRON: 'cron',
    INTERVAL: 'interval',
    ONE_TIME: 'one_time',
  },
  TriggerType: {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    EVENT: 'event',
  },
}));

// Mock @repo/orchestration/shared/types/errors
vi.mock('@repo/orchestration/shared/types/errors', () => ({
  WorkflowErrorCode: {
    EXECUTION_FAILED: 'execution_failed',
    VALIDATION_ERROR: 'validation_error',
    TIMEOUT: 'timeout',
  },
}));

// Mock @repo/orchestration/shared/types/common
vi.mock('@repo/orchestration/shared/types/common', () => ({
  ExecutionStatus: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
}));

// Mock @repo/orchestration/shared/types/patterns
vi.mock('@repo/orchestration/shared/types/patterns', () => ({
  PatternType: {
    RETRY: 'retry',
    CIRCUIT_BREAKER: 'circuit_breaker',
    TIMEOUT: 'timeout',
  },
}));

// Mock @repo/orchestration/shared/patterns/circuit-breaker
vi.mock('@repo/orchestration/shared/patterns/circuit-breaker', () => ({
  CircuitBreaker: vi.fn().mockReturnValue({ breaker: {} }),
  createCircuitBreaker: vi.fn().mockReturnValue({ breaker: {} }),
  CircuitBreakerState: {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half_open',
  },
  CircuitBreakerConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
}));

// Mock @repo/orchestration/shared/patterns/retry
vi.mock('@repo/orchestration/shared/patterns/retry', () => ({
  createRetryPattern: vi.fn().mockReturnValue({ pattern: {} }),
  RetryConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  executeWithRetry: vi.fn().mockResolvedValue({ result: {} }),
}));

// Mock @repo/orchestration/shared/patterns/timeout
vi.mock('@repo/orchestration/shared/patterns/timeout', () => ({
  createTimeoutPattern: vi.fn().mockReturnValue({ pattern: {} }),
  TimeoutConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  executeWithTimeout: vi.fn().mockResolvedValue({ result: {} }),
}));

// Mock @repo/orchestration/shared/utils/validation
vi.mock('@repo/orchestration/shared/utils/validation', () => ({
  validateWorkflowDefinition: vi.fn().mockReturnValue({ valid: true }),
  validateStepDefinition: vi.fn().mockReturnValue({ valid: true }),
  validateExecutionInput: vi.fn().mockReturnValue({ valid: true }),
}));

// Mock @repo/orchestration/shared/utils/workflow-utilities
vi.mock('@repo/orchestration/shared/utils/workflow-utilities', () => ({
  createWorkflowDefinition: vi.fn().mockReturnValue({ definition: {} }),
  mergeWorkflowSteps: vi.fn().mockReturnValue({ merged: [] }),
  validateWorkflowGraph: vi.fn().mockReturnValue({ valid: true }),
}));

// Mock @repo/orchestration/shared/utils/manager-basic
vi.mock('@repo/orchestration/shared/utils/manager-basic', () => ({
  createBasicManager: vi.fn().mockReturnValue({ manager: {} }),
  initializeManager: vi.fn().mockResolvedValue({ initialized: true }),
  getManagerStatus: vi.fn().mockReturnValue({ status: 'active' }),
}));

// Mock @repo/orchestration/shared/utils/rate-limit
vi.mock('@repo/orchestration/shared/utils/rate-limit', () => ({
  createRateLimiter: vi.fn().mockReturnValue({ limiter: {} }),
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  resetRateLimit: vi.fn().mockResolvedValue({ reset: true }),
}));

// Mock @repo/orchestration/shared/utils/input-validation
vi.mock('@repo/orchestration/shared/utils/input-validation', () => ({
  validateInput: vi.fn().mockReturnValue({ valid: true }),
  sanitizeInput: vi.fn().mockReturnValue({ sanitized: {} }),
  parseInput: vi.fn().mockReturnValue({ parsed: {} }),
}));

// Mock @repo/orchestration/shared/utils/errors
vi.mock('@repo/orchestration/shared/utils/errors', () => ({
  createWorkflowError: vi.fn().mockReturnValue({ error: {} }),
  handleError: vi.fn().mockReturnValue({ handled: true }),
  isRetryableError: vi.fn().mockReturnValue(false),
}));

// Mock @repo/orchestration/shared/utils/data-masking
vi.mock('@repo/orchestration/shared/utils/data-masking', () => ({
  maskSensitiveData: vi.fn().mockReturnValue({ masked: {} }),
  unmaskData: vi.fn().mockReturnValue({ unmasked: {} }),
  validateMasking: vi.fn().mockReturnValue({ valid: true }),
}));

// Mock @repo/orchestration/shared/utils/timeout
vi.mock('@repo/orchestration/shared/utils/timeout', () => ({
  createTimeout: vi.fn().mockReturnValue({ timeout: {} }),
  clearTimeout: vi.fn().mockReturnValue({ cleared: true }),
  withTimeout: vi.fn().mockResolvedValue({ result: {} }),
}));

// Mock @repo/orchestration/factories/step-factory
vi.mock('@repo/orchestration/factories/step-factory', () => ({
  createStepFactory: vi.fn().mockReturnValue({ factory: {} }),
  createStep: vi.fn().mockReturnValue({ step: {} }),
  validateStep: vi.fn().mockReturnValue({ valid: true }),
  registerStepType: vi.fn().mockReturnValue({ registered: true }),
  createPerformanceMonitor: vi.fn().mockReturnValue({ monitor: {} }),
  measureStepExecution: vi.fn().mockReturnValue({ measurement: {} }),
  validateStepDefinition: vi.fn().mockReturnValue({ valid: true }),
  createStepValidator: vi.fn().mockReturnValue({ validator: {} }),
}));

// Mock @repo/orchestration/factories/workflow-factory
vi.mock('@repo/orchestration/factories/workflow-factory', () => ({
  createWorkflowFactory: vi.fn().mockReturnValue({ factory: {} }),
  createWorkflow: vi.fn().mockReturnValue({ workflow: {} }),
  validateWorkflow: vi.fn().mockReturnValue({ valid: true }),
}));

// Mock @repo/orchestration/client-next
vi.mock('@repo/orchestration/client-next', () => ({
  useWorkflow: vi.fn().mockReturnValue({
    execute: vi.fn(),
    status: 'idle',
    result: null,
    error: null,
  }),
  useWorkflowExecution: vi.fn().mockReturnValue({
    execution: null,
    loading: false,
    error: null,
  }),
  WorkflowProvider: vi.fn().mockReturnValue({ children: null }),
  createWorkflowClient: vi.fn().mockReturnValue({ client: {} }),
}));

// Export helper functions for test setup
export const mockWorkflowExecution = (overrides = {}) => ({
  id: 'test-execution-id',
  workflowId: 'test-workflow-id',
  status: 'pending',
  startedAt: new Date(),
  input: {},
  output: null,
  steps: [],
  ...overrides,
});

export const mockWorkflowDefinition = (overrides = {}) => ({
  id: 'test-workflow-id',
  name: 'Test Workflow',
  version: '1.0.0',
  steps: [],
  ...overrides,
});

export const mockWorkflowStep = (overrides = {}) => ({
  id: 'test-step-id',
  name: 'Test Step',
  action: 'test-action',
  input: {},
  ...overrides,
});

export const resetOrchestrationMocks = () => {
  vi.clearAllMocks();
};
