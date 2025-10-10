import { describe, expect, it, vi } from 'vitest';
import {
  createTimeout,
  createTimeoutSignal,
  debounceWithTimeout,
  delay,
  withRetryTimeout,
  withTimeout,
} from '../../src/shared/timeout';

describe('shared/timeout', () => {
  describe('createTimeoutSignal', () => {
    it('creates an AbortSignal that aborts after timeout', async () => {
      const signal = createTimeoutSignal(100);
      expect(signal).toBeDefined();
      expect(signal?.aborted).toBe(false);

      // Wait for timeout
      await delay(150);
      expect(signal?.aborted).toBe(true);
    });

    it('handles environments without AbortSignal gracefully', () => {
      const originalAbortSignal = globalThis.AbortSignal;
      (globalThis as any).AbortSignal = undefined;

      const signal = createTimeoutSignal(100);
      expect(signal).toBeUndefined();

      globalThis.AbortSignal = originalAbortSignal;
    });
  });

  describe('createTimeout', () => {
    it('creates a promise that rejects after timeout', async () => {
      const timeoutPromise = createTimeout(50);

      await expect(timeoutPromise).rejects.toThrow('operation timed out after 50ms');
    });

    it('calls onTimeout callback when timeout occurs', async () => {
      const onTimeout = vi.fn();
      const timeoutPromise = createTimeout(50, { name: 'test', onTimeout });

      await expect(timeoutPromise).rejects.toThrow('test timed out after 50ms');
      expect(onTimeout).toHaveBeenCalledWith(50);
    });

    it('includes timeout metadata in error', async () => {
      try {
        await createTimeout(50, { name: 'custom' });
      } catch (error: any) {
        expect(error.code).toBe('TIMEOUT');
        expect(error.timeout).toBe(50);
        expect(error.message).toContain('custom timed out');
      }
    });
  });

  describe('withTimeout', () => {
    it('resolves when promise resolves before timeout', async () => {
      const fastPromise = delay(50).then(() => 'success');
      const result = await withTimeout(fastPromise, 100);
      expect(result).toBe('success');
    });

    it('rejects when promise takes longer than timeout', async () => {
      const slowPromise = delay(150).then(() => 'success');

      await expect(withTimeout(slowPromise, 50)).rejects.toThrow('promise timed out after 50ms');
    });

    it('rejects immediately when abort signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const promise = delay(100);
      await expect(withTimeout(promise, 200, { abortSignal: controller.signal })).rejects.toThrow(
        'promise was already aborted',
      );
    });

    it('handles abort signal during execution', async () => {
      const controller = new AbortController();
      const slowPromise = delay(200);

      const timeoutPromise = withTimeout(slowPromise, 300, {
        abortSignal: controller.signal,
        name: 'abortable',
      });

      // Abort after 50ms
      setTimeout(() => controller.abort(), 50);

      await expect(timeoutPromise).rejects.toThrow('abortable was aborted');
    });

    it('calls onTimeout callback', async () => {
      const onTimeout = vi.fn();
      const slowPromise = delay(150);

      await expect(withTimeout(slowPromise, 50, { onTimeout })).rejects.toThrow();
      expect(onTimeout).toHaveBeenCalledWith(50);
    });
  });

  describe('delay', () => {
    it('resolves after specified time', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Some tolerance for timing
    });

    it('rejects when aborted', async () => {
      const controller = new AbortController();
      const delayPromise = delay(200, controller.signal);

      setTimeout(() => controller.abort(), 50);

      await expect(delayPromise).rejects.toThrow('Delay was aborted');
    });

    it('rejects immediately if signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(delay(100, controller.signal)).rejects.toThrow('Delay was aborted');
    });
  });

  describe('withRetryTimeout', () => {
    it('succeeds on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetryTimeout(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const result = await withRetryTimeout(fn, { maxAttempts: 3, initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('fails after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(withRetryTimeout(fn, { maxAttempts: 2, initialDelay: 10 })).rejects.toThrow(
        'persistent failure',
      );
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('respects timeout per attempt', async () => {
      const fn = vi.fn().mockImplementation(() => delay(200));

      await expect(withRetryTimeout(fn, { timeout: 50, maxAttempts: 1 })).rejects.toThrow(
        'timed out',
      );
    });

    it('stops retrying when aborted', async () => {
      const controller = new AbortController();
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      const retryPromise = withRetryTimeout(fn, {
        maxAttempts: 5,
        initialDelay: 100,
        abortSignal: controller.signal,
      });

      setTimeout(() => controller.abort(), 50);

      await expect(retryPromise).rejects.toThrow('was aborted');
    });
  });

  describe('debounceWithTimeout', () => {
    it('debounces function calls', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const debounced = debounceWithTimeout(fn, 50);

      // Call multiple times quickly
      debounced('arg1');
      debounced('arg2');
      const result = await debounced('arg3');

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg3');
    });

    it('can be cancelled', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const debounced = debounceWithTimeout(fn, 100);

      const promise = debounced('arg');
      debounced.cancel();

      await expect(promise).rejects.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    it('applies timeout to the debounced function', async () => {
      const fn = vi.fn().mockImplementation(() => delay(200));
      const debounced = debounceWithTimeout(fn, 50, { timeout: 100 });

      await expect(debounced('arg')).rejects.toThrow('timed out');
    });

    it('handles abort signal', async () => {
      const controller = new AbortController();
      const fn = vi.fn().mockResolvedValue('result');
      const debounced = debounceWithTimeout(fn, 100, { abortSignal: controller.signal });

      const promise = debounced('arg');
      controller.abort();

      await expect(promise).rejects.toThrow('was aborted');
    });
  });
});
