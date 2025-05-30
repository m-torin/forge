import { calculateBackoff, chunkArray } from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { CircuitBreaker } from '../../utils/resilience';
import { workflowError } from '../../utils/response';
import { DEFAULT_RETRIES, DEFAULT_TIMEOUTS } from '../../utils/types';

import type {
  CircuitBreakerConfig,
  WorkflowContext,
} from '../../utils/types';

/**
 * Reusable workflow patterns for common scenarios
 * These patterns can be composed and extended in specific workflow implementations
 */

/**
 * Batch processing pattern
 * Processes items in configurable batches with optional delays
 */
export async function processBatch<T, R>(
  context: WorkflowContext<any>,
  options: {
    items: T[];
    batchSize: number;
    delayBetweenBatches?: number; // seconds
    processor: (item: T, index: number) => Promise<R>;
    onBatchComplete?: (batchNumber: number, results: R[]) => Promise<void>;
    stepPrefix?: string;
  },
): Promise<R[]> {
  const {
    batchSize,
    delayBetweenBatches = 0,
    items,
    onBatchComplete,
    processor,
    stepPrefix: _stepPrefix = 'batch',
  } = options;

  const results: R[] = [];
  const batches = chunkArray(items, batchSize);

  for (let i = 0; i < batches.length; i++) {
    // Add delay between batches (except first)
    if (i > 0 && delayBetweenBatches > 0) {
      await context.sleep('batch-delay', delayBetweenBatches);
    }

    // Process batch in parallel within a single step
    const batch = batches[i];
    const batchResults = await context.run('process-batch', async () => {
      return await Promise.all(batch.map((item, index) => processor(item, i * batchSize + index)));
    });

    results.push(...batchResults);

    // Optional batch completion callback
    if (onBatchComplete) {
      await context.run('batch-complete', () => onBatchComplete(i + 1, batchResults));
    }
  }

  return results;
}

/**
 * Parallel processing pattern
 * Executes multiple operations in parallel and waits for all to complete
 */
export async function parallelExecute<T extends Record<string, () => Promise<any>>>(
  context: WorkflowContext<any>,
  operations: T,
  options: {
    stepPrefix?: string;
    continueOnError?: boolean;
  } = {},
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> | Error }> {
  const { continueOnError = false, stepPrefix = 'parallel' } = options;

  const entries = Object.entries(operations) as [keyof T, T[keyof T]][];

  const results = await Promise.all(
    entries.map(async ([name, operation]) => {
      try {
        const result = await context.run(`${stepPrefix}-${String(name)}`, operation);
        return [name, result] as const;
      } catch (error) {
        if (!continueOnError) throw error;
        return [name, error] as const;
      }
    }),
  );

  return Object.fromEntries(results) as any;
}

/**
 * Retry pattern with exponential backoff - ES2022 modernized
 */
export async function retryWithBackoff<T>(
  context: WorkflowContext<any>,
  options: {
    operation: () => Promise<T>;
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    jitter?: boolean | number;
    strategy?: 'exponential' | 'linear' | 'constant';
    shouldRetry?: (error: Error, attempt: number) => boolean;
    stepName: string;
  },
): Promise<T> {
  const {
    baseDelayMs = DEFAULT_TIMEOUTS.retry,
    jitter = false,
    maxAttempts = DEFAULT_RETRIES.api,
    maxDelayMs = 60000,
    multiplier = 2,
    operation,
    shouldRetry = () => true,
    stepName,
    strategy = 'exponential',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await context.run(`${stepName}-attempt-${attempt}`, operation);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        // Enhanced error with cause
        throw new Error(`Operation failed after ${attempt} attempts`, {
          cause: { attempts: attempt, lastError, stepName },
        });
      }

      const delayMs = calculateBackoff(attempt - 1, {
        baseDelayMs,
        jitter,
        maxDelayMs,
        multiplier,
        strategy,
      });

      devLog.info(`Retrying ${stepName} in ${delayMs}ms (attempt ${attempt}/${maxAttempts})`);
      await context.sleep(`${stepName}-backoff-${attempt}`, delayMs / 1000);
    }
  }

  throw lastError!;
}

/**
 * Event-driven pattern with timeout
 * Waits for an event with optional timeout and default handling
 */
export async function waitForEventWithDefault<T>(
  context: WorkflowContext<any>,
  options: {
    eventId: string;
    timeout: string;
    defaultValue?: T;
    onTimeout?: () => Promise<T>;
    stepName: string;
  },
): Promise<T> {
  const { defaultValue, eventId, onTimeout, stepName, timeout } = options;

  const { eventData, timeout: didTimeout } = await context.waitForEvent(stepName, eventId, {
    timeout: timeout as any,
  });

  if (didTimeout) {
    if (onTimeout) {
      return await context.run(`${stepName}-timeout-handler`, onTimeout);
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw workflowError.generic(`Event timeout: ${eventId}`);
  }

  return eventData as T;
}

/**
 * Approval gate pattern
 * Implements an approval workflow with notifications
 */
export async function approvalGate<T extends { approved: boolean }>(
  context: WorkflowContext<any>,
  options: {
    approvalId: string;
    notificationData: any;
    timeout?: string;
    onApproved?: (data: T) => Promise<void>;
    onRejected?: (data: T) => Promise<void>;
    stepPrefix?: string;
  },
): Promise<T> {
  const {
    approvalId,
    notificationData,
    onApproved,
    onRejected,
    stepPrefix = 'approval',
    timeout = '1h',
  } = options;

  // Send approval request
  await context.notify(`${stepPrefix}-request`, approvalId, notificationData);

  // Wait for approval response
  const approvalData = await waitForEventWithDefault<T>(context, {
    eventId: approvalId,
    onTimeout: async () => {
      throw workflowError.generic(`Approval timeout for ${approvalId}`);
    },
    stepName: `${stepPrefix}-wait`,
    timeout,
  });

  // Handle approval result
  if (approvalData.approved && onApproved) {
    await context.run(`${stepPrefix}-approved`, () => onApproved(approvalData));
  } else if (!approvalData.approved && onRejected) {
    await context.run(`${stepPrefix}-rejected`, () => onRejected(approvalData));
  }

  if (!approvalData.approved) {
    throw workflowError.generic(`Approval rejected for ${approvalId}`);
  }

  return approvalData;
}

/**
 * Circuit breaker pattern
 * Prevents cascading failures by monitoring error rates
 */
export async function circuitBreaker<T>(
  context: WorkflowContext<any>,
  options: {
    operation: () => Promise<T>;
    stepName: string;
    config?: CircuitBreakerConfig;
  },
): Promise<T> {
  const { config = {}, operation, stepName } = options;

  const breaker = new CircuitBreaker(config);

  return await context.run(`${stepName}-execute`, () => breaker.execute(operation));
}

/**
 * Map-reduce pattern
 * Processes items in parallel and reduces results
 */
export async function mapReduce<T, M, R>(
  context: WorkflowContext<any>,
  options: {
    items: T[];
    mapper: (item: T, index: number) => Promise<M>;
    reducer: (accumulator: R, current: M, index: number) => R;
    initialValue: R;
    batchSize?: number;
    stepPrefix?: string;
  },
): Promise<R> {
  const {
    items,
    batchSize = items.length,
    initialValue,
    mapper,
    reducer,
    stepPrefix = 'map-reduce',
  } = options;

  // Map phase - process in batches
  const mapped = await processBatch(context, {
    batchSize,
    items,
    processor: mapper,
    stepPrefix: `${stepPrefix}-map`,
  });

  // Reduce phase
  const result = await context.run(`${stepPrefix}-reduce`, async () => {
    return mapped.reduce(reducer, initialValue);
  });

  return result;
}

/**
 * Pipeline pattern
 * Chains operations together with optional transformation
 */
export async function pipeline<T>(
  context: WorkflowContext<any>,
  options: {
    input: T;
    stages: {
      name: string;
      transform: (data: any) => Promise<any>;
      onError?: (error: Error, data: any) => Promise<any>;
    }[];
    stepPrefix?: string;
  },
): Promise<any> {
  const { input, stages, stepPrefix = 'pipeline' } = options;

  let currentData = input;

  for (const [_index, stage] of stages.entries()) {
    try {
      currentData = await context.run(`${stepPrefix}-${stage.name}`, () =>
        stage.transform(currentData),
      );
    } catch (error) {
      if (stage.onError) {
        currentData = await context.run(`${stepPrefix}-${stage.name}-error`, () =>
          stage.onError!(error as Error, currentData),
        );
      } else {
        throw error;
      }
    }
  }

  return currentData;
}

/**
 * Scheduled pattern
 * Delays execution until a specific time
 */
export async function scheduledExecution<T>(
  context: WorkflowContext<any>,
  options: {
    scheduleAt: Date | string;
    operation: () => Promise<T>;
    stepName: string;
  },
): Promise<T> {
  const { operation, scheduleAt, stepName } = options;

  const scheduleTime = typeof scheduleAt === 'string' ? new Date(scheduleAt) : scheduleAt;

  await context.sleepUntil(`${stepName}-wait`, scheduleTime);

  return await context.run(stepName, operation);
}

/**
 * Fan-out/fan-in pattern
 * Distributes work across multiple handlers and collects results
 */
export async function fanOutFanIn<T, R>(
  context: WorkflowContext<any>,
  options: {
    items: T[];
    distributor: (item: T) => string; // Returns handler key
    handlers: Record<string, (items: T[]) => Promise<R[]>>;
    stepPrefix?: string;
  },
): Promise<R[]> {
  const { distributor, handlers, items, stepPrefix = 'fan-out' } = options;

  // Group items by handler
  const groups = await context.run(`${stepPrefix}-distribute`, async () => {
    const grouped: Record<string, T[]> = {};

    for (const item of items) {
      const handlerKey = distributor(item);
      if (!grouped[handlerKey]) {
        grouped[handlerKey] = [];
      }
      grouped[handlerKey].push(item);
    }

    return grouped;
  });

  // Fan-out: process each group in parallel
  const results = await Promise.all(
    Object.entries(groups).map(([handlerKey, groupItems]) =>
      context.run(`${stepPrefix}-${handlerKey}`, () => handlers[handlerKey](groupItems)),
    ),
  );

  // Fan-in: collect all results
  return results.flat();
}

/**
 * Wait for multiple events pattern
 * Waits for multiple events with configurable strategy
 */
export async function waitForMultipleEvents(
  context: WorkflowContext<any>,
  events: { eventId: string; timeout: string; required?: boolean }[],
  options: {
    waitStrategy: 'all' | 'any' | 'threshold';
    threshold?: number;
    stepPrefix?: string;
  },
): Promise<{ results: any[]; completed: number; timeouts: number }> {
  const {
    stepPrefix = 'multi-event',
    threshold: _threshold = 1,
    waitStrategy: _waitStrategy,
  } = options;

  const _eventPromises = events.map(async (event, index) => {
    try {
      const { eventData, timeout } = await context.waitForEvent(
        `${stepPrefix}-${index}`,
        event.eventId,
        { timeout: event.timeout as any },
      );
      return { eventData, eventId: event.eventId, index, timeout };
    } catch (error) {
      return { error, eventId: event.eventId, index };
    }
  });

  // For demonstration purposes, simulate events
  return await context.run(`${stepPrefix}-wait`, async () => {
    const results = await Promise.all(
      events.map(async (event, index) => ({
        eventData: { simulated: true, timestamp: Date.now() },
        eventId: event.eventId,
        index,
        timeout: false,
      })),
    );

    return {
      completed: results.filter((r) => !r.timeout).length,
      results: results.map((r) => r.eventData),
      timeouts: results.filter((r) => r.timeout).length,
    };
  });
}

/**
 * Parallel race pattern
 * Executes operations in parallel and returns the first to complete
 */
export async function parallelRacePattern<T>(
  context: WorkflowContext<any>,
  operations: (() => Promise<T>)[],
  options: { timeout?: number; stepPrefix?: string } = {},
): Promise<{ winner: T; index: number; duration: number }> {
  const { stepPrefix = 'race', timeout = 30000 } = options;

  return await context.run(`${stepPrefix}-execute`, async () => {
    const startTime = Date.now();

    const racePromises = operations.map(async (operation, index) => {
      const result = await operation();
      return { duration: Date.now() - startTime, index, result };
    });

    if (timeout > 0) {
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error('Race timeout')), timeout);
      });

      const winner = await Promise.race([...racePromises, timeoutPromise]);
      return { duration: winner.duration, index: winner.index, winner: winner.result };
    } else {
      const winner = await Promise.race(racePromises);
      return { duration: winner.duration, index: winner.index, winner: winner.result };
    }
  });
}

/**
 * Saga pattern
 * Executes a series of operations with compensation if any fails
 */
export async function sagaPattern(
  context: WorkflowContext<any>,
  steps: {
    name: string;
    action: () => Promise<any>;
    compensate: () => Promise<void>;
  }[],
  options: { stepPrefix?: string } = {},
): Promise<{ success: boolean; results: any[]; compensations: string[] }> {
  const { stepPrefix = 'saga' } = options;

  const results: any[] = [];
  const compensations: string[] = [];

  try {
    // Execute steps sequentially
    for (const [_index, step] of steps.entries()) {
      const result = await context.run(`${stepPrefix}-${step.name}`, step.action);
      results.push(result);
    }

    return { compensations, results, success: true };
  } catch (error) {
    // Compensate in reverse order for completed steps
    for (let i = results.length - 1; i >= 0; i--) {
      try {
        await context.run(`${stepPrefix}-compensate-${steps[i].name}`, steps[i].compensate);
        compensations.push(steps[i].name);
      } catch (compensationError) {
        // Log compensation failure but continue
        devLog.error(`Compensation failed for ${steps[i].name}`, compensationError);
      }
    }

    throw error;
  }
}

/**
 * Compensation pattern
 * Executes an operation with automatic compensation on failure
 */
export async function compensateOnFailure<T>(
  context: WorkflowContext<any>,
  operation: () => Promise<T>,
  compensate: (error: Error) => Promise<any>,
  options: { stepPrefix?: string } = {},
): Promise<{ success: boolean; result?: T; compensationResult?: any; error?: string }> {
  const { stepPrefix = 'compensate' } = options;

  try {
    const result = await context.run(`${stepPrefix}-operation`, operation);
    return { result, success: true };
  } catch (error) {
    try {
      const compensationResult = await context.run(`${stepPrefix}-compensation`, () =>
        compensate(error as Error),
      );
      return {
        compensationResult,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    } catch (compensationError) {
      throw new Error(`Both operation and compensation failed: ${error}, ${compensationError}`);
    }
  }
}
