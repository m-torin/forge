import {
  CircuitBreaker,
  CircuitBreakerOptions,
  CircuitState,
} from '@/shared/utils/circuit-breaker';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('circuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  const defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 3,
    resetTimeout: 1000,
    failureWindow: 5000,
    successThreshold: 2,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    circuitBreaker = new CircuitBreaker('test-provider', defaultOptions);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    test('should initialize with closed state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    test('should accept custom options', () => {
      const customOptions: CircuitBreakerOptions = {
        failureThreshold: 5,
        resetTimeout: 2000,
        failureWindow: 10000,
        successThreshold: 3,
      };
      const cb = new CircuitBreaker('custom-provider', customOptions);
      expect(cb.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('execute - CLOSED state', () => {
    test('should execute function successfully when circuit is closed', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledOnce();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    test('should track failures without opening circuit if under threshold', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));

      // First failure
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);

      // Second failure
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    test('should open circuit after failure threshold is reached', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));
      const onOpen = vi.fn();
      const cb = new CircuitBreaker('test-provider', { ...defaultOptions, onOpen });

      // Reach failure threshold (3 failures)
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(mockFn)).rejects.toThrow('test error');
      }

      expect(cb.getState()).toBe(CircuitState.OPEN);
      expect(onOpen).toHaveBeenCalledWith('test-provider');
    });
  });

  describe('execute - OPEN state', () => {
    async function forceCircuitOpen() {
      // Force circuit to open state
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockFn).catch(() => {});
      }
    }

    beforeEach(async () => {
      await forceCircuitOpen();
    });

    test('should reject immediately without calling function when circuit is open', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is OPEN');
      expect(mockFn).not.toHaveBeenCalled();
    });

    test('should transition to half-open after reset timeout', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      // Advance time past reset timeout
      vi.advanceTimersByTime(1100);

      const result = await circuitBreaker.execute(mockFn);
      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });
  });

  describe('execute - HALF_OPEN state', () => {
    async function forceCircuitHalfOpen() {
      // Force circuit to open state then transition to half-open
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockFn).catch(() => {});
      }
      vi.advanceTimersByTime(1100);

      // Execute one function to transition to half-open
      const successFn = vi.fn().mockResolvedValue('success');
      await circuitBreaker.execute(successFn);
    }

    beforeEach(async () => {
      await forceCircuitHalfOpen();
    });

    test('should close circuit after enough successful calls', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const onClose = vi.fn();
      const cb = new CircuitBreaker('test-provider', { ...defaultOptions, onClose });

      // Force to half-open state first
      const errorFn = vi.fn().mockRejectedValue(new Error('test error'));
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(errorFn)).rejects.toThrow('test error');
      }
      vi.advanceTimersByTime(1100);

      // Transition to half-open with one success
      await cb.execute(mockFn);
      expect(cb.getState()).toBe(CircuitState.HALF_OPEN);

      // Another success should close the circuit (threshold is 2)
      await cb.execute(mockFn);
      expect(cb.getState()).toBe(CircuitState.CLOSED);
      expect(onClose).toHaveBeenCalledWith('test-provider');
    });

    test('should reopen circuit on failure in half-open state', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('test error'));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow('test error');
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('getState', () => {
    test('should return current circuit state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('getStats', () => {
    test('should return circuit breaker statistics', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));

      // Generate some failures
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');

      const stats = circuitBreaker.getStats();
      expect(stats).toMatchObject({
        state: CircuitState.CLOSED,
        failures: 2,
      });
      expect(stats.lastFailureTime).toBeGreaterThan(0);
      expect(stats.nextRetryTime).toBe(0);
    });
  });

  describe('reset', () => {
    test('should reset circuit breaker to closed state', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));

      // Force circuit to open
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');
      }
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Reset circuit
      circuitBreaker.reset();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.lastFailureTime).toBe(0);
      expect(stats.nextRetryTime).toBe(0);
    });
  });

  describe('failure window', () => {
    test('should not count old failures outside the failure window', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('test error'));

      // Create first failure
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');

      // Advance time past failure window
      vi.advanceTimersByTime(6000);

      // Create two more failures - should not open circuit since first failure is outside window
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('test error');

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('callbacks', () => {
    test('should call onHalfOpen callback when transitioning to half-open', async () => {
      const onHalfOpen = vi.fn();
      const cb = new CircuitBreaker('test-provider', { ...defaultOptions, onHalfOpen });

      // Force circuit to open
      const errorFn = vi.fn().mockRejectedValue(new Error('test error'));
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(errorFn)).rejects.toThrow('test error');
      }

      // Advance time and execute to trigger half-open
      vi.advanceTimersByTime(1100);
      const successFn = vi.fn().mockResolvedValue('success');
      await cb.execute(successFn);

      expect(onHalfOpen).toHaveBeenCalledWith('test-provider');
    });
  });
});
