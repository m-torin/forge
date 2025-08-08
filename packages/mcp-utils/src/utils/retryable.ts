/**
 * Enhanced Retry Logic with p-retry
 * Provides robust retry mechanisms with proper error classification
 */

import pRetry, { AbortError } from 'p-retry';

const RETRIABLE = new Set(['EAGAIN', 'EBUSY', 'EMFILE', 'ETIMEDOUT', 'ECONNRESET']);
const NON_RETRIABLE = new Set(['EACCES', 'ENOENT', 'EPERM']);

function isRetriable(err: any) {
  const code = err?.code;
  if (!code) return false;
  if (NON_RETRIABLE.has(code)) return false;
  return RETRIABLE.has(code);
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 5) {
  return pRetry(fn, {
    retries,
    minTimeout: 100,
    maxTimeout: 2000,
    factor: 2,
    randomize: true,
    onFailedAttempt: err => {
      if (!isRetriable(err)) throw new AbortError(err.message);
    },
  });
}
