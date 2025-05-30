import { devLog } from '../../utils/observability';
import { DEFAULT_TIMEOUTS } from '../../utils/types';

import type { WorkflowContext } from '@upstash/workflow';

// ===== Constants =====
const DEFAULT_WAIT_TIME = DEFAULT_TIMEOUTS.retry;
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_FLOW_CONTROL_ATTEMPTS = 60;

/**
 * Flow control configuration for QStash workflows
 */
export interface FlowControlConfig {
  /** Unique key for this flow control group */
  key: string;
  /** Maximum concurrent executions */
  parallelism?: number;
  /** Maximum requests per second */
  ratePerSecond?: number;
}

/**
 * Flow control options for individual steps
 */
export interface StepFlowControlOptions {
  /** Flow control key to use */
  flowControlKey?: string;
  /** Parallelism limit for this step */
  parallelism?: number;
  /** Rate limit for this step */
  ratePerSecond?: number;
}

/**
 * Global flow control state (in production, use Redis)
 */
interface FlowControlState {
  activeRequests: Map<string, number>;
  requestTimestamps: Map<string, number[]>;
}

const globalFlowControlState: FlowControlState = {
  activeRequests: new Map(),
  requestTimestamps: new Map(),
};

/**
 * Check parallelism limit - ES2022 modernized
 */
function checkParallelismLimit(
  key: string,
  parallelism: number,
): { allowed: boolean; reason?: string; waitTime?: number } {
  const activeCount = globalFlowControlState.activeRequests.get(key) ?? 0;

  if (activeCount >= parallelism) {
    return {
      allowed: false,
      reason: 'parallelism_limit_exceeded',
      waitTime: DEFAULT_WAIT_TIME,
    };
  }

  // Increment active requests using logical assignment
  globalFlowControlState.activeRequests.set(key, activeCount + 1);
  return { allowed: true };
}

/**
 * Check rate limit - ES2022 modernized
 */
function checkRateLimit(
  key: string,
  ratePerSecond: number,
  now: number,
): { allowed: boolean; reason?: string; waitTime?: number } {
  const timestamps = globalFlowControlState.requestTimestamps.get(key) ?? [];
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Remove old timestamps and add current
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (recentTimestamps.length >= ratePerSecond) {
    // Use .at(-1) for last element
    const oldestTimestamp = Math.min(...recentTimestamps);
    const waitTime = Math.max(0, RATE_LIMIT_WINDOW - (now - oldestTimestamp));

    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      waitTime,
    };
  }

  // Update timestamps
  recentTimestamps.push(now);
  globalFlowControlState.requestTimestamps.set(key, recentTimestamps);

  return { allowed: true };
}

/**
 * Check if a request is allowed based on flow control settings - ES2022 modernized
 */
export async function checkFlowControl(
  config: FlowControlConfig,
): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
  const { key, parallelism, ratePerSecond } = config;
  const now = Date.now();

  // Check parallelism limit first
  if (parallelism !== undefined) {
    const parallelismResult = checkParallelismLimit(key, parallelism);
    if (!parallelismResult.allowed) {
      return parallelismResult;
    }
  }

  // Check rate limit
  if (ratePerSecond !== undefined) {
    const rateLimitResult = checkRateLimit(key, ratePerSecond, now);
    if (!rateLimitResult.allowed) {
      // Release the parallelism slot we just acquired
      if (parallelism !== undefined) {
        releaseFlowControlSlot(key);
      }
      return rateLimitResult;
    }
  }

  return { allowed: true };
}

/**
 * Release a flow control slot (call when request completes) - ES2022 modernized
 */
export function releaseFlowControlSlot(key: string): void {
  const currentActive = globalFlowControlState.activeRequests.get(key) ?? 0;
  if (currentActive > 0) {
    globalFlowControlState.activeRequests.set(key, currentActive - 1);
  }
}

/**
 * Wait for flow control slot to become available - ES2022 modernized
 */
export async function waitForFlowControlSlot(config: FlowControlConfig): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_FLOW_CONTROL_ATTEMPTS) {
    const result = await checkFlowControl(config);

    if (result.allowed) {
      return;
    }

    // Wait before retrying using nullish coalescing
    const waitTime = result.waitTime ?? DEFAULT_WAIT_TIME;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    attempt++;
  }

  // Enhanced error with cause
  throw new Error(
    `Flow control timeout: Could not acquire slot for key "${config.key}" after ${MAX_FLOW_CONTROL_ATTEMPTS} attempts`,
    { cause: { attempts: attempt, config, key: config.key } },
  );
}

/**
 * Wrapper for context.run with flow control
 */
export async function runWithFlowControl<T>(
  context: WorkflowContext<any>,
  stepName: string,
  stepFunction: () => Promise<T>,
  flowControlConfig?: FlowControlConfig,
): Promise<T> {
  if (!flowControlConfig) {
    return context.run(stepName, stepFunction);
  }

  // Wait for flow control slot
  await waitForFlowControlSlot(flowControlConfig);

  try {
    return await context.run(stepName, async () => {
      try {
        return await stepFunction();
      } finally {
        // Always release the slot when done
        releaseFlowControlSlot(flowControlConfig.key);
      }
    });
  } catch (error) {
    // Release slot on error too
    releaseFlowControlSlot(flowControlConfig.key);
    throw error;
  }
}

/**
 * Wrapper for context.call with flow control
 */
export async function callWithFlowControl(
  context: WorkflowContext<any>,
  stepName: string,
  options: any,
  flowControlConfig?: FlowControlConfig,
): Promise<any> {
  if (!flowControlConfig) {
    return context.call(stepName, options);
  }

  // Add flow control to the call options
  const enhancedOptions = {
    ...options,
    flowControl: {
      key: flowControlConfig.key,
      parallelism: flowControlConfig.parallelism,
      ratePerSecond: flowControlConfig.ratePerSecond,
    },
  };

  return context.call(stepName, enhancedOptions);
}

/**
 * Create a flow control configuration
 */
export function createFlowControl(config: {
  key: string;
  ratePerSecond?: number;
  parallelism?: number;
}): FlowControlConfig {
  return {
    key: config.key,
    parallelism: config.parallelism,
    ratePerSecond: config.ratePerSecond,
  };
}

/**
 * Get current flow control stats for debugging - ES2022 modernized
 */
export function getFlowControlStats(key: string): {
  activeRequests: number;
  recentRequestCount: number;
} {
  const activeRequests = globalFlowControlState.activeRequests.get(key) ?? 0;
  const timestamps = globalFlowControlState.requestTimestamps.get(key) ?? [];
  const now = Date.now();
  const recentRequestCount = timestamps.filter((ts) => ts > now - RATE_LIMIT_WINDOW).length;

  return {
    activeRequests,
    recentRequestCount,
  };
}

/**
 * Clear flow control state (development only) - ES2022 modernized
 */
export function clearFlowControlState(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Flow control state clearing is only available in development');
  }

  // Use Map.clear() for better performance
  globalFlowControlState.activeRequests.clear();
  globalFlowControlState.requestTimestamps.clear();

  devLog.info('[FLOW-CONTROL] Cleared all state');
}

/**
 * Create flow control state with ES2022 features
 */
export function createFlowControlState(): FlowControlState {
  return {
    activeRequests: new Map(),
    requestTimestamps: new Map(),
  };
}

/**
 * Batch release multiple flow control slots - ES2022 modernized
 */
export function batchReleaseFlowControlSlots(keys: string[]): void {
  for (const key of keys) {
    releaseFlowControlSlot(key);
  }
}
