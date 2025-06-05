/**
 * Optional Enhancers for Workflow Steps
 *
 * Provides optional enhancer functions that can be composed with simple steps
 * to add advanced functionality like retry, circuit breaking, monitoring, etc.
 */

import type { SimpleWorkflowStep, StepExecutionResult } from './step-factory/step-types';
import { initializePerformanceData, updatePerformanceData } from './step-factory/step-performance';

/**
 * Add monitoring capabilities to a workflow step
 */
export function withStepMonitoring<TInput = any, TOutput = any>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    enableDetailedLogging?: boolean;
    trackCustomMetrics?: boolean;
    enableProgressReporting?: boolean;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    execute: async (input: TInput) => {
      const startTime = Date.now();
      const performance = initializePerformanceData(true);

      if (options.enableDetailedLogging) {
        console.log(`[MONITOR] Starting step execution at ${new Date().toISOString()}`);
      }

      const result = await step.execute(input);

      // Update performance with monitoring data
      updatePerformanceData(performance, true);
      result.performance = performance;

      if (options.enableDetailedLogging) {
        console.log(`[MONITOR] Step completed in ${performance.duration}ms`);
      }

      return result;
    },
    validate: step.validate,
  };
}

/**
 * Add retry capabilities to a workflow step
 */
export function withStepRetry<TInput = any, TOutput = any>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'fixed' | 'exponential' | 'linear';
    jitter?: boolean;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  const { maxAttempts = 3, delay = 1000, backoff = 'exponential', jitter = false } = options;

  return {
    execute: async (input: TInput) => {
      let lastError: any;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await step.execute(input);

        if (result.success) {
          return result;
        }

        lastError = result.error;

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Calculate delay
        let waitTime = delay;
        if (backoff === 'exponential') {
          waitTime = delay * Math.pow(2, attempt - 1);
        } else if (backoff === 'linear') {
          waitTime = delay * attempt;
        }

        if (jitter) {
          waitTime += Math.random() * 1000;
        }

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      return {
        success: false,
        error: lastError,
        performance: { startTime: Date.now(), duration: 0 },
        shouldRetry: false,
      };
    },
    validate: step.validate,
  };
}

/**
 * Add circuit breaker protection to a workflow step
 */
export function withStepCircuitBreaker<TInput = any, TOutput = any>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    failureThreshold?: number;
    resetTimeout?: number;
    monitoringPeriod?: number;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  const { failureThreshold = 5, resetTimeout = 60000 } = options;

  let failures = 0;
  let lastFailureTime = 0;
  let state: 'closed' | 'open' | 'half-open' = 'closed';

  return {
    execute: async (input: TInput) => {
      const now = Date.now();

      // Check if circuit should reset
      if (state === 'open' && now - lastFailureTime > resetTimeout) {
        state = 'half-open';
        failures = 0;
      }

      // Circuit is open - fail fast
      if (state === 'open') {
        return {
          success: false,
          error: {
            code: 'CIRCUIT_BREAKER_OPEN',
            message: 'Circuit breaker is open',
            retryable: false,
            stepId: 'circuit-breaker',
            timestamp: new Date(),
          },
          performance: { startTime: now, duration: 0 },
        };
      }

      const result = await step.execute(input);

      if (result.success) {
        // Success - reset circuit
        failures = 0;
        state = 'closed';
      } else {
        // Failure - increment counter
        failures++;
        lastFailureTime = now;

        if (failures >= failureThreshold) {
          state = 'open';
        }
      }

      return result;
    },
    validate: step.validate,
  };
}

/**
 * Add timeout protection to a workflow step
 */
export function withStepTimeout<TInput = any, TOutput = any>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  timeoutMs: number,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    execute: async (input: TInput) => {
      const timeoutPromise = new Promise<StepExecutionResult<TOutput>>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Step execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      try {
        return await Promise.race([step.execute(input), timeoutPromise]);
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'STEP_TIMEOUT_ERROR',
            message: error instanceof Error ? error.message : 'Timeout error',
            retryable: true,
            stepId: 'timeout',
            timestamp: new Date(),
          },
          performance: { startTime: Date.now(), duration: timeoutMs },
        };
      }
    },
    validate: step.validate,
  };
}

/**
 * Compose multiple enhancers together
 */
export function compose<TInput = any, TOutput = any>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  ...enhancers: Array<
    (step: SimpleWorkflowStep<TInput, TOutput>) => SimpleWorkflowStep<TInput, TOutput>
  >
): SimpleWorkflowStep<TInput, TOutput> {
  return enhancers.reduce((currentStep, enhancer) => enhancer(currentStep), step);
}
