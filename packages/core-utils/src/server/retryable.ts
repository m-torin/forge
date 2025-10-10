/**
 * Enhanced Retry Logic using @repo/core-utils
 * Provides robust retry mechanisms with proper error classification
 */

import { withRetryTimeout } from '../shared/timeout.js';

const RETRIABLE = new Set(['EAGAIN', 'EBUSY', 'EMFILE', 'ETIMEDOUT', 'ECONNRESET']);
const NON_RETRIABLE = new Set(['EACCES', 'ENOENT', 'EPERM']);

function isRetriable(err: any) {
  const code = err?.code;
  if (!code) return false;
  if (NON_RETRIABLE.has(code)) return false;
  return RETRIABLE.has(code);
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 5) {
  return withRetryTimeout(fn, {
    maxAttempts: retries,
    initialDelay: 100,
    maxDelay: 2000,
    backoffFactor: 2,
    timeout: 30000, // 30 second timeout per attempt
  });
}
