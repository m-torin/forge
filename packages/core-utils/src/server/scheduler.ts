/**
 * Node.js 22+ Scheduler utilities with fallbacks for older versions
 */

import { scheduler } from 'node:timers/promises';

/**
 * Yield to the event loop using Node.js 22+ scheduler.yield() when available,
 * with fallback to setImmediate for older Node.js versions.
 * This provides better backpressure handling and more responsive event loop management.
 */
export async function yieldToEventLoop(): Promise<void> {
  try {
    await scheduler.yield();
  } catch {
    // Fallback to setImmediate for older Node.js versions
    await new Promise<void>(resolve => {
      setImmediate(() => resolve());
    });
  }
}

/**
 * Wait for the next tick of the event loop.
 * Alias for yieldToEventLoop() for compatibility.
 */
export const nextTick = yieldToEventLoop;

/**
 * Check if scheduler.yield() is available (Node.js 22+)
 */
export function isSchedulerYieldAvailable(): boolean {
  try {
    return typeof scheduler?.yield === 'function';
  } catch {
    return false;
  }
}
