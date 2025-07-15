/**
 * AI SDK v5 RSC - Streamable Value Implementation
 * Create values that can be streamed and updated
 */

import { createStreamableValue as aiCreateStreamableValue, readStreamableValue } from '@ai-sdk/rsc';
import { logInfo } from '@repo/observability/server/next';

// Type for streamable value - using any for now due to experimental RSC API
type StreamableValue<_T = any> = any;

/**
 * Enhanced createStreamableValue with additional features
 */
export function createStreamableValue<T = any>(initialValue?: T): any {
  logInfo('RSC: Creating streamable value', {
    operation: 'rsc_create_streamable_value',
    metadata: {
      hasInitialValue: initialValue !== undefined,
      valueType: typeof initialValue,
    },
  });

  const streamable = aiCreateStreamableValue(initialValue);

  // Wrap methods with logging
  const originalUpdate = streamable.update.bind(streamable);
  const originalAppend = streamable.append.bind(streamable);
  const originalDone = streamable.done.bind(streamable);
  const originalError = streamable.error.bind(streamable);

  streamable.update = (value: T) => {
    logInfo('RSC: Streamable value update', {
      operation: 'rsc_streamable_value_update',
      metadata: { valueType: typeof value },
    });
    return originalUpdate(value);
  };

  streamable.append = (value: T) => {
    logInfo('RSC: Streamable value append', {
      operation: 'rsc_streamable_value_append',
      metadata: { valueType: typeof value },
    });
    return originalAppend(value);
  };

  streamable.done = (value?: T) => {
    logInfo('RSC: Streamable value done', {
      operation: 'rsc_streamable_value_done',
      metadata: {
        hasFinalValue: value !== undefined,
        valueType: typeof value,
      },
    });
    return value !== undefined ? originalDone(value) : originalDone();
  };

  streamable.error = (error: any) => {
    logInfo('RSC: Streamable value error', {
      operation: 'rsc_streamable_value_error',
      metadata: {
        errorType: error?.constructor?.name || 'Unknown',
      },
    });
    return originalError(error);
  };

  return streamable;
}

/**
 * Create a streamable value with transformation
 */
export function createTransformableStreamableValue<T, U>(
  initialValue?: T,
  transform?: (value: T) => U,
): any {
  const streamable = createStreamableValue<U>(
    initialValue !== undefined && transform ? transform(initialValue) : undefined,
  );

  return {
    ...streamable,
    updateTransformed: (value: T) => {
      streamable.update(transform ? transform(value) : (value as any));
    },
    appendTransformed: (value: T) => {
      streamable.append(transform ? transform(value) : (value as any));
    },
    doneTransformed: (value?: T) => {
      streamable.done(value !== undefined && transform ? transform(value) : (value as any));
    },
  };
}

/**
 * Create a streamable value with validation
 */
export function createValidatedStreamableValue<T>(
  validator: (value: any) => T | Promise<T>,
  initialValue?: T,
): any {
  const streamable = createStreamableValue<T>(initialValue);

  return {
    ...streamable,
    updateValidated: async (value: any) => {
      try {
        const validated = await validator(value);
        streamable.update(validated);
      } catch (error) {
        streamable.error(error);
      }
    },
    appendValidated: async (value: any) => {
      try {
        const validated = await validator(value);
        streamable.append(validated);
      } catch (error) {
        streamable.error(error);
      }
    },
    doneValidated: async (value?: any) => {
      try {
        const validated = value !== undefined ? await validator(value) : undefined;
        validated !== undefined ? streamable.done(validated) : streamable.done();
      } catch (error) {
        streamable.error(error);
      }
    },
  };
}

/**
 * Streamable value patterns
 */
export const streamableValuePatterns: any = {
  /**
   * Counter pattern
   */
  createCounter: (initialValue = 0) => {
    const streamable = createStreamableValue(initialValue);
    let current = initialValue;

    return {
      value: streamable.value,
      increment: (by = 1) => {
        current += by;
        streamable.update(current);
      },
      decrement: (by = 1) => {
        current -= by;
        streamable.update(current);
      },
      reset: () => {
        current = initialValue;
        streamable.update(current);
      },
      done: () => streamable.done(current),
    };
  },

  /**
   * Accumulator pattern
   */
  createAccumulator: <T>(initialValue: T[] = []) => {
    const streamable = createStreamableValue(initialValue);
    const items: T[] = [...initialValue];

    return {
      value: streamable.value,
      add: (item: T) => {
        items.push(item);
        streamable.update([...items]);
      },
      addMany: (newItems: T[]) => {
        items.push(...newItems);
        streamable.update([...items]);
      },
      clear: () => {
        items.length = 0;
        streamable.update([]);
      },
      done: () => streamable.done(items),
    };
  },

  /**
   * State machine pattern
   */
  createStateMachine: <TState extends string>(
    initialState: TState,
    transitions: Record<TState, TState[]>,
  ) => {
    const streamable = createStreamableValue(initialState);
    let currentState = initialState;

    return {
      value: streamable.value,
      currentState: () => currentState,
      transition: (to: TState) => {
        const allowedTransitions = transitions[currentState] || [];
        if (allowedTransitions.includes(to)) {
          currentState = to;
          streamable.update(currentState);
          return true;
        }
        return false;
      },
      reset: () => {
        currentState = initialState;
        streamable.update(currentState);
      },
      done: () => streamable.done(currentState),
    };
  },

  /**
   * Progress tracker pattern
   */
  createProgressTracker: (total: number) => {
    const streamable = createStreamableValue({
      current: 0,
      total,
      percentage: 0,
      isComplete: false,
    });

    let current = 0;

    const updateProgress = () => {
      const percentage = Math.round((current / total) * 100);
      streamable.update({
        current,
        total,
        percentage,
        isComplete: current >= total,
      });
    };

    return {
      value: streamable.value,
      increment: (by = 1) => {
        current = Math.min(current + by, total);
        updateProgress();
      },
      setProgress: (value: number) => {
        current = Math.min(Math.max(0, value), total);
        updateProgress();
      },
      complete: () => {
        current = total;
        updateProgress();
        streamable.done({
          current,
          total,
          percentage: 100,
          isComplete: true,
        });
      },
    };
  },

  /**
   * Time series data pattern
   */
  createTimeSeries: <T>(windowSize = 100) => {
    const streamable = createStreamableValue<Array<{ time: number; value: T }>>([]);
    const data: Array<{ time: number; value: T }> = [];

    return {
      value: streamable.value,
      addPoint: (value: T) => {
        const point = { time: Date.now(), value };
        data.push(point);

        // Keep only the last windowSize points
        if (data.length > windowSize) {
          data.shift();
        }

        streamable.update([...data]);
      },
      getLatest: () => data[data.length - 1],
      getAverage: (getValue: (item: T) => number) => {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, point) => acc + getValue(point.value), 0);
        return sum / data.length;
      },
      clear: () => {
        data.length = 0;
        streamable.update([]);
      },
      done: () => streamable.done(data),
    };
  },
};

/**
 * Utility to read streamable values with timeout
 */
export async function readStreamableValueWithTimeout<T>(
  streamable: StreamableValue<T>,
  timeoutMs: number,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error('Timeout reading streamable value')), timeoutMs);
  });

  return Promise.race([readStreamableValue(streamable), timeoutPromise]) as Promise<T>;
}

/**
 * Combine multiple streamable values
 */
export function combineStreamableValues<T extends Record<string, any>>(values: {
  [K in keyof T]: ReturnType<typeof aiCreateStreamableValue<T[K]>>;
}): StreamableValue<T> {
  const combined = createStreamableValue<T>({} as T);
  const current: Partial<T> = {};
  let completed = 0;
  const total = Object.keys(values).length;

  Object.entries(values).forEach(async ([key, streamable]) => {
    try {
      // Handle AsyncIterable returned by readStreamableValue
      const stream = readStreamableValue(streamable as any);
      for await (const value of stream) {
        current[key as keyof T] = value as T[keyof T];
        completed++;

        if (completed === total) {
          combined.done(current as T);
        } else {
          combined.update(current as T);
        }
        break; // Take only the first value
      }
    } catch (error: any) {
      combined.error(error);
    }
  });

  return combined as ReturnType<typeof aiCreateStreamableValue<T>>;
}

// Re-export readStreamableValue for convenience
export { readStreamableValue };
