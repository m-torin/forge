import type { WorkflowContext } from '@upstash/workflow';
import { devLog } from './observability';

/**
 * Testing utilities for workflows
 * These utilities are designed to work with any testing framework
 * by accepting mock functions as parameters
 */

/**
 * Mock function type that can be provided by any testing framework
 */
export interface MockFunction<T = any> {
  (...args: any[]): T;
  mockImplementation?: (fn: (...args: any[]) => any) => any;
  mockReturnValue?: (value: T) => any;
}

/**
 * Testing framework adapter interface
 */
export interface TestingFramework {
  expect?: any; // Optional, only needed for assertion helpers
  fn: () => MockFunction;
}

/**
 * Create a mock workflow context for testing
 * @param payload - The workflow payload
 * @param options - Configuration options
 * @param mockFn - A function that creates mock functions (e.g., vi.fn, jest.fn)
 */
export function createMockContext<T = any>(
  payload?: T,
  options?: {
    workflowRunId?: string;
    url?: string;
    headers?: Record<string, string>;
  },
  mockFn: () => MockFunction = () => {
    // Default implementation for when no mock framework is provided
    const fn = (() => {}) as any;
    fn.mockImplementation = (impl: any) => {
      fn.impl = impl;
      return fn;
    };
    fn.mockReturnValue = (value: any) => {
      fn.returnValue = value;
      return fn;
    };
    return fn;
  },
): WorkflowContext<T> {
  const workflowRunId = options?.workflowRunId || `test-run-${Date.now()}`;

  return {
    url: options?.url || 'http://localhost:3000/test',
    env: {},
    headers: new Headers(options?.headers || {}),
    requestPayload: payload || ({} as T),
    workflowRunId,

    // Mock methods
    run:
      mockFn().mockImplementation?.(async (name: string, fn: () => any) => {
        devLog.info(`[MOCK] Running step: ${name}`);
        return fn();
      }) || (async () => {}),

    call:
      mockFn().mockImplementation?.(async (name: string, options: any) => {
        devLog.info(`[MOCK] Calling: ${name}`, options);
        return { body: { success: true } };
      }) || (async () => ({ body: { success: true } })),

    sleep:
      mockFn().mockImplementation?.(async (name: string, seconds: number) => {
        devLog.info(`[MOCK] Sleeping: ${name} for ${seconds}s`);
      }) || (async () => {}),

    sleepUntil:
      mockFn().mockImplementation?.(async (name: string, timestamp: number) => {
        devLog.info(`[MOCK] Sleeping until: ${name} at ${new Date(timestamp).toISOString()}`);
      }) || (async () => {}),

    waitForEvent:
      mockFn().mockImplementation?.(async (name: string, eventId: string) => {
        devLog.info(`[MOCK] Waiting for event: ${name} with ID ${eventId}`);
        return { eventData: { approved: true }, timeout: false };
      }) || (async () => ({ eventData: { approved: true }, timeout: false })),

    notify:
      mockFn().mockImplementation?.(async (options: any) => {
        devLog.info(`[MOCK] Notifying:`, options);
        return [{ status: 'success' }];
      }) || (async () => [{ status: 'success' }]),

    cancel:
      mockFn().mockImplementation?.(async (reason: string) => {
        devLog.info(`[MOCK] Cancelling: ${reason}`);
      }) || (async () => {}),
  } as unknown as WorkflowContext<T>;
}

/**
 * Test workflow execution
 * @param workflow - The workflow function to test
 * @param payload - The payload to pass to the workflow
 * @param options - Mock configuration options
 * @param mockFn - A function that creates mock functions (e.g., vi.fn, jest.fn)
 */
export async function testWorkflow<TPayload, TResult>(
  workflow: (context: WorkflowContext<TPayload>) => Promise<TResult>,
  payload: TPayload,
  options?: {
    mockSteps?: Record<string, any>;
    mockCalls?: Record<string, any>;
    mockEvents?: Record<string, any>;
  },
  mockFn?: () => MockFunction,
): Promise<{
  result: TResult;
  context: WorkflowContext<TPayload>;
  calls: {
    run: string[];
    call: string[];
    sleep: string[];
    waitForEvent: string[];
    notify: any[];
  };
}> {
  const context = createMockContext(payload, undefined, mockFn);
  const calls = {
    call: [] as string[],
    notify: [] as any[],
    run: [] as string[],
    sleep: [] as string[],
    waitForEvent: [] as string[],
  };

  // Override mocks with custom implementations
  if (options?.mockSteps && context.run.mockImplementation) {
    context.run.mockImplementation(async (name: string, fn: () => any) => {
      calls.run.push(name);
      if (options.mockSteps && name in options.mockSteps) {
        return options.mockSteps[name];
      }
      return fn();
    });
  }

  if (options?.mockCalls && context.call.mockImplementation) {
    context.call.mockImplementation(async (name: string, callOptions: any) => {
      calls.call.push(name);
      if (options.mockCalls && name in options.mockCalls) {
        return options.mockCalls[name];
      }
      return { body: { success: true } };
    });
  }

  if (options?.mockEvents && context.waitForEvent.mockImplementation) {
    context.waitForEvent.mockImplementation(async (name: string, eventId: string) => {
      calls.waitForEvent.push(eventId);
      if (options.mockEvents && eventId in options.mockEvents) {
        return { eventData: options.mockEvents[eventId], timeout: false };
      }
      return { eventData: { approved: true }, timeout: false };
    });
  }

  // Track other calls
  if (context.sleep.mockImplementation) {
    context.sleep.mockImplementation(async (name: string, seconds: number) => {
      calls.sleep.push(name);
    });
  }

  if (context.notify.mockImplementation) {
    context.notify.mockImplementation(async (notifyOptions: any) => {
      calls.notify.push(notifyOptions);
      return [{ status: 'success' }];
    });
  }

  // Execute workflow
  const result = await workflow(context);

  return { calls, context, result };
}

/**
 * Workflow test helpers
 * These require an expect function to be provided
 */
export const createWorkflowTestHelpers = (expect: any) => ({
  /**
   * Assert workflow steps were called
   */
  assertStepsCalled: (calls: string[], expected: string[]) => {
    expect(calls).toEqual(expect.arrayContaining(expected));
  },

  /**
   * Assert workflow completed successfully
   */
  assertSuccess: (result: any) => {
    expect(result).toHaveProperty('status', 'success');
  },

  /**
   * Assert workflow failed with error
   */
  assertError: (result: any, errorMessage?: string) => {
    expect(result).toHaveProperty('status', 'failed');
    if (errorMessage) {
      expect(result).toHaveProperty('error', expect.stringContaining(errorMessage));
    }
  },
});

/**
 * Utility functions that don't require testing framework
 */
export const workflowTestUtils = {
  /**
   * Create a mock approval event
   */
  mockApproval: (approved = true, approver = 'test-approver') => ({
    approved,
    approver,
    timestamp: new Date().toISOString(),
  }),

  /**
   * Create a mock API response
   */
  mockApiResponse: (data: any, status = 200) => ({
    body: data,
    headers: new Headers({ 'content-type': 'application/json' }),
    status,
  }),
};

/**
 * Example test usage with Vitest:
 *
 * import { vi, expect, describe, it } from 'vitest';
 * import { testWorkflow, createWorkflowTestHelpers, workflowTestUtils } from '@repo/orchestration';
 *
 * const workflowTest = createWorkflowTestHelpers(expect);
 *
 * describe('MyWorkflow', () => {
 *   it('should process order successfully', async () => {
 *     const { result, calls } = await testWorkflow(
 *       myWorkflow,
 *       { orderId: 'test-123', amount: 100 },
 *       {
 *         mockSteps: {
 *           'validate-order': { valid: true },
 *           'process-payment': { success: true, transactionId: 'tx-123' },
 *         },
 *       },
 *       vi.fn // Pass the mock function creator
 *     );
 *
 *     workflowTest.assertSuccess(result);
 *     workflowTest.assertStepsCalled(calls.run, ['validate-order', 'process-payment']);
 *     expect(result.data.transactionId).toBe('tx-123');
 *   });
 * });
 */
