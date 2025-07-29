// Import centralized setup automatically loaded by createQStashPackageConfig
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// Mock React hooks (orchestration-specific, not in centralized mocks)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn(fn => fn),
    useEffect: vi.fn(fn => fn()),
    useMemo: vi.fn(fn => fn()),
    useRef: vi.fn(() => ({ current: null })),
    useState: vi.fn(initial => [initial, vi.fn()]),
  };
});

// Common orchestration test configuration
export const createOrchestrationTestConfig = (overrides = {}) => ({
  providers: {
    upstash: {
      qstashToken: 'test-qstash-token',
      redisUrl: 'redis://localhost:6379',
      redisToken: 'test-redis-token',
    },
    ...overrides,
  },
});

// Common orchestration manager creation patterns
export const createTestOrchestrationManager = async (config = {}) => {
  const { OrchestrationManager } = await import('../src/shared/utils/manager');
  return new OrchestrationManager(config as any);
};

export const createTestWorkflowProvider = async (type = 'upstash-workflow', config = {}) => {
  if (type === 'upstash-workflow') {
    const { UpstashWorkflowProvider } = await import('../src/providers');
    return new UpstashWorkflowProvider(config as any);
  }
  throw new Error(`Unknown provider type: ${type}`);
};

export const createTestWorkflowClient = async (config = {}) => {
  // Mock client for testing
  return {
    execute: vi.fn().mockResolvedValue({ id: 'mock-execution', status: 'running' }),
    getExecution: vi.fn().mockResolvedValue({ id: 'mock-execution', status: 'completed' }),
    cancelExecution: vi.fn().mockResolvedValue({ success: true }),
  };
};

export const createTestWorkflowServerClient = async (config = {}) => {
  // Mock server client for testing
  return {
    execute: vi.fn().mockResolvedValue({ id: 'mock-execution', status: 'running' }),
    getExecution: vi.fn().mockResolvedValue({ id: 'mock-execution', status: 'completed' }),
    cancelExecution: vi.fn().mockResolvedValue({ success: true }),
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  };
};

// Common workflow engine creation patterns
export const createTestWorkflowEngine = async (config = {}) => {
  return createTestWorkflowServerClient(config);
};

// Mock provider factories for consistent testing
export const createMockWorkflowProvider = (overrides = {}) => ({
  name: 'test-workflow-provider',
  type: 'upstash-workflow',
  version: '1.0.0',
  execute: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'running' }),
  getExecution: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'completed' }),
  listExecutions: vi.fn().mockResolvedValue([]),
  cancelExecution: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'cancelled' }),
  scheduleWorkflow: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
  unscheduleWorkflow: vi.fn().mockResolvedValue({ success: true }),
  updateExecutionStatus: vi.fn().mockResolvedValue(undefined),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

export const createMockQStashProvider = (overrides = {}) => ({
  name: 'test-qstash-provider',
  type: 'upstash-workflow',
  publishJSON: vi.fn().mockResolvedValue({ messageId: 'msg-123' }),
  schedules: {
    create: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    get: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
    list: vi.fn().mockResolvedValue([]),
  },
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

export const createMockRedisProvider = (overrides = {}) => ({
  name: 'test-redis-provider',
  type: 'redis',
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  keys: vi.fn().mockResolvedValue([]),
  exists: vi.fn().mockResolvedValue(0),
  expire: vi.fn().mockResolvedValue(1),
  ttl: vi.fn().mockResolvedValue(-1),
  ping: vi.fn().mockResolvedValue('PONG'),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

// Step factory mocks for consistent testing
export const createMockStepFactory = (overrides = {}) => ({
  createStep: vi.fn().mockReturnValue({ id: 'step-123', name: 'Test Step' }),
  createStepFromTemplate: vi.fn().mockReturnValue({ id: 'step-123', name: 'Templated Step' }),
  validateStep: vi.fn().mockReturnValue(true),
  registerStep: vi.fn().mockResolvedValue({ success: true }),
  getRegisteredSteps: vi.fn().mockReturnValue([]),
  clearRegistry: vi.fn().mockResolvedValue({ success: true }),
  ...overrides,
});

// Workflow engine mocks for consistent testing
export const createMockWorkflowEngine = (overrides = {}) => ({
  execute: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'running' }),
  getExecution: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'completed' }),
  listExecutions: vi.fn().mockResolvedValue([]),
  cancelExecution: vi.fn().mockResolvedValue({ id: 'exec-123', status: 'cancelled' }),
  scheduleWorkflow: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
  unscheduleWorkflow: vi.fn().mockResolvedValue({ success: true }),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

// Event bus mocks for consistent testing
export const createMockEventBus = (overrides = {}) => ({
  emit: vi.fn().mockResolvedValue({ success: true }),
  on: vi.fn().mockResolvedValue({ success: true }),
  off: vi.fn().mockResolvedValue({ success: true }),
  once: vi.fn().mockResolvedValue({ success: true }),
  removeAllListeners: vi.fn().mockResolvedValue({ success: true }),
  listeners: vi.fn().mockReturnValue([]),
  ...overrides,
});

// Scheduler mocks for consistent testing
export const createMockScheduler = (overrides = {}) => ({
  schedule: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
  unschedule: vi.fn().mockResolvedValue({ success: true }),
  getSchedule: vi.fn().mockResolvedValue({ scheduleId: 'schedule-123' }),
  listSchedules: vi.fn().mockResolvedValue([]),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

// Monitoring mocks for consistent testing
export const createMockMonitoring = (overrides = {}) => ({
  recordMetric: vi.fn().mockResolvedValue({ success: true }),
  getMetrics: vi.fn().mockResolvedValue([]),
  recordEvent: vi.fn().mockResolvedValue({ success: true }),
  getEvents: vi.fn().mockResolvedValue([]),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  ...overrides,
});

// Saga mocks for consistent testing
export const createMockSaga = (overrides = {}) => ({
  start: vi.fn().mockResolvedValue({ sagaId: 'saga-123', status: 'running' }),
  compensate: vi.fn().mockResolvedValue({ sagaId: 'saga-123', status: 'compensated' }),
  getStatus: vi.fn().mockResolvedValue({ sagaId: 'saga-123', status: 'completed' }),
  ...overrides,
});

// Export test factories and generators - removed wildcard exports to prevent circular dependencies
// Import these directly from their specific modules when needed:
// - './workflow-test-factory' for test factory functions
// - './test-data-generators' for test data generation
// - './test-utils' for test utilities

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
