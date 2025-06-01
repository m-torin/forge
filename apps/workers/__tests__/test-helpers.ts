import { vi } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

/**
 * Helper to create a partial mock of WorkflowContext
 * This is necessary because WorkflowContext is a class with many internal properties
 * that we don't need to mock for testing the workflow logic
 */
export const createMockContext = <T = any>(overrides: Partial<WorkflowContext<T>> = {}): any => ({
  requestPayload: {},
  workflowRunId: 'test-run-123',
  headers: new Headers(),
  env: {},
  run: vi.fn().mockImplementation(async (_name, fn) => fn()),
  sleep: vi.fn(),
  sleepUntil: vi.fn(),
  call: vi.fn(),
  waitForEvent: vi.fn(),
  notify: vi.fn(),
  qstashClient: {} as any,
  ...overrides,
});