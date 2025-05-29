import type { WorkflowContext } from '@upstash/workflow';

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

let globalFlowControlState: FlowControlState = {
  activeRequests: new Map(),
  requestTimestamps: new Map(),
};

/**
 * Check if a request is allowed based on flow control settings
 */
export async function checkFlowControl(
  config: FlowControlConfig,
): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
  const { key, parallelism, ratePerSecond } = config;
  const now = Date.now();

  // Check parallelism limit
  if (parallelism !== undefined) {
    const activeCount = globalFlowControlState.activeRequests.get(key) || 0;
    if (activeCount >= parallelism) {
      return {
        allowed: false,
        reason: 'parallelism_limit_exceeded',
        waitTime: 1000, // Wait 1 second before retry
      };
    }
  }

  // Check rate limit
  if (ratePerSecond !== undefined) {
    const timestamps = globalFlowControlState.requestTimestamps.get(key) || [];
    const windowStart = now - 1000; // 1 second window

    // Remove old timestamps
    const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

    if (recentTimestamps.length >= ratePerSecond) {
      const oldestTimestamp = Math.min(...recentTimestamps);
      const waitTime = Math.max(0, 1000 - (now - oldestTimestamp));

      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        waitTime,
      };
    }

    // Update timestamps
    recentTimestamps.push(now);
    globalFlowControlState.requestTimestamps.set(key, recentTimestamps);
  }

  // Increment active requests for parallelism tracking
  if (parallelism !== undefined) {
    const currentActive = globalFlowControlState.activeRequests.get(key) || 0;
    globalFlowControlState.activeRequests.set(key, currentActive + 1);
  }

  return { allowed: true };
}

/**
 * Release a flow control slot (call when request completes)
 */
export function releaseFlowControlSlot(key: string): void {
  const currentActive = globalFlowControlState.activeRequests.get(key) || 0;
  if (currentActive > 0) {
    globalFlowControlState.activeRequests.set(key, currentActive - 1);
  }
}

/**
 * Wait for flow control slot to become available
 */
export async function waitForFlowControlSlot(config: FlowControlConfig): Promise<void> {
  let attempt = 0;
  const maxAttempts = 60; // Maximum 60 attempts (60 seconds)

  while (attempt < maxAttempts) {
    const result = await checkFlowControl(config);

    if (result.allowed) {
      return;
    }

    // Wait before retrying
    const waitTime = result.waitTime || 1000;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    attempt++;
  }

  throw new Error(
    `Flow control timeout: Could not acquire slot for key "${config.key}" after ${maxAttempts} attempts`,
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
 * Get current flow control stats for debugging
 */
export function getFlowControlStats(key: string): {
  activeRequests: number;
  recentRequestCount: number;
} {
  const activeRequests = globalFlowControlState.activeRequests.get(key) || 0;
  const timestamps = globalFlowControlState.requestTimestamps.get(key) || [];
  const now = Date.now();
  const recentRequestCount = timestamps.filter((ts) => ts > now - 1000).length;

  return {
    activeRequests,
    recentRequestCount,
  };
}

/**
 * Clear flow control state (development only)
 */
export function clearFlowControlState(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Flow control state clearing is only available in development');
  }

  globalFlowControlState = {
    activeRequests: new Map(),
    requestTimestamps: new Map(),
  };

  console.log('[FLOW-CONTROL] Cleared all state');
}
