import type { WorkflowContext } from '../types';

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
    stepPrefix = 'batch',
  } = options;

  const results: R[] = [];
  const batches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < batches; i++) {
    // Add delay between batches (except first)
    if (i > 0 && delayBetweenBatches > 0) {
      await context.sleep(`${stepPrefix}-delay-${i}`, delayBetweenBatches);
    }

    // Process batch in parallel
    const batch = items.slice(i * batchSize, (i + 1) * batchSize);
    const batchResults = await Promise.all(
      batch.map((item, index) =>
        context.run(`${stepPrefix}-item-${i * batchSize + index}`, () =>
          processor(item, i * batchSize + index),
        ),
      ),
    );

    results.push(...batchResults);

    // Optional batch completion callback
    if (onBatchComplete) {
      await context.run(`${stepPrefix}-complete-${i}`, () => onBatchComplete(i + 1, batchResults));
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
 * Retry pattern with exponential backoff
 * Retries an operation with configurable backoff strategy
 */
export async function retryWithBackoff<T>(
  context: WorkflowContext<any>,
  options: {
    operation: () => Promise<T>;
    maxAttempts?: number;
    initialDelay?: number; // seconds
    maxDelay?: number; // seconds
    backoffMultiplier?: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
    stepName: string;
  },
): Promise<T> {
  const {
    backoffMultiplier = 2,
    initialDelay = 1,
    maxAttempts = 3,
    maxDelay = 60,
    operation,
    shouldRetry = () => true,
    stepName,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await context.run(`${stepName}-attempt-${attempt}`, operation);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), maxDelay);

      await context.sleep(`${stepName}-backoff-${attempt}`, delay);
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
    throw new Error(`Event timeout: ${eventId}`);
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
      throw new Error(`Approval timeout for ${approvalId}`);
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
    throw new Error(`Approval rejected for ${approvalId}`);
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
    errorThreshold: number; // percentage (0-100)
    volumeThreshold: number; // minimum requests before opening
    resetTimeout: number; // seconds
    stepName: string;
    state?: {
      errors: number;
      successes: number;
      lastFailure?: number;
      isOpen: boolean;
    };
  },
): Promise<T> {
  const {
    errorThreshold,
    operation,
    resetTimeout,
    state = { errors: 0, isOpen: false, successes: 0 },
    stepName,
    volumeThreshold,
  } = options;

  // Check if circuit should be reset
  if (state.isOpen && state.lastFailure) {
    const timeSinceFailure = (Date.now() - state.lastFailure) / 1000;
    if (timeSinceFailure > resetTimeout) {
      state.isOpen = false;
      state.errors = 0;
      state.successes = 0;
    }
  }

  // If circuit is open, fail fast
  if (state.isOpen) {
    throw new Error(`Circuit breaker is open for ${stepName}`);
  }

  try {
    const result = await context.run(`${stepName}-execute`, operation);
    state.successes++;

    // Check if we should close the circuit
    const total = state.errors + state.successes;
    if (total >= volumeThreshold) {
      const errorRate = (state.errors / total) * 100;
      if (errorRate < errorThreshold) {
        state.errors = 0;
        state.successes = 0;
      }
    }

    return result;
  } catch (error) {
    state.errors++;
    state.lastFailure = Date.now();

    // Check if we should open the circuit
    const total = state.errors + state.successes;
    if (total >= volumeThreshold) {
      const errorRate = (state.errors / total) * 100;
      if (errorRate >= errorThreshold) {
        state.isOpen = true;
      }
    }

    throw error;
  }
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

  for (const [index, stage] of stages.entries()) {
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
