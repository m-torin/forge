/**
 * Concurrency Control Utilities
 * Provides standardized concurrency management for I/O operations
 */

import os from 'node:os';
import pLimit from 'p-limit';
import PQueue from 'p-queue';

const cpu = Math.max(1, os.cpus()?.length ?? 4);
const BASE = Math.max(8, cpu * 4);

export const ioQueue: PQueue = new PQueue({
  concurrency: BASE,
  intervalCap: BASE * 2,
  interval: 1000,
  carryoverConcurrencyCount: true,
  autoStart: true,
});

// Optional: adaptive tuning by memory pressure (0-100)
export function tuneConcurrency(pressure: number) {
  const target = pressure >= 85 ? Math.max(4, cpu) : pressure >= 70 ? cpu * 2 : BASE;
  ioQueue.concurrency = target;
}

// Lightweight per-call limiter when a queue is overkill
export function createLimiter(limit = cpu * 2) {
  return pLimit(limit);
}
