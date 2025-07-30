/**
 * Comprehensive test coverage for circuit-breaker.ts
 * Tests circuit breaker functionality, management, and configurations
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('opossum', () => {
  const mockCircuitBreaker = vi.fn().mockImplementation((fn, options) => {
    const breaker = {
      fire: vi.fn().mockImplementation(async (...args) => {
        if (mockCircuitBreaker._shouldFail) {
          throw new Error('Circuit breaker is open');
        }
        return fn(...args);
      }),
      on: vi.fn(),
      close: vi.fn(),
      opened: false,
      closed: true,
      stats: {
        fires: 0,
        successes: 0,
        failures: 0,
        timeouts: 0,
        fallbacks: 0,
        rejects: 0,
      },
      options,
      removeAllListeners: vi.fn(),
      destroy: vi.fn(),
    };
    
    // Store reference for testing
    mockCircuitBreaker._instances = mockCircuitBreaker._instances || [];
    mockCircuitBreaker._instances.push(breaker);
    
    return breaker;
  });
  
  mockCircuitBreaker._shouldFail = false;
  mockCircuitBreaker._instances = [];
  
  return {
    default: mockCircuitBreaker,
  };
});

vi.mock('@repo/observability/server/next', () => ({
  createServerObservability: vi.fn().mockResolvedValue({
    log: vi.fn(),
  }),
}));

// Import after mocking
import {
  CircuitBreaker,
  CircuitBreakerConfigs,
  CircuitBreakerManager,
  circuitBreakerManager,
  createCircuitBreakerFn,
  getCircuitBreakerStats,
  resetCircuitBreaker,
  withCircuitBreaker,
} from '../../src/shared/patterns/circuit-breaker';

describe('Circuit Breaker', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new CircuitBreakerManager();
    
    // Reset mock state
    const OpossumCircuitBreaker = vi.mocked(
      require('opossum').default
    );
    OpossumCircuitBreaker._shouldFail = false;
    OpossumCircuitBreaker._instances = [];
  });

  describe('CircuitBreakerManager', () => {
    describe('getCircuitBreaker', () => {
      it('should create a new circuit breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);

        expect(breaker).toBeDefined();
        expect(typeof breaker.fire).toBe('function');
      });

      it('should return existing circuit breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker1 = manager.getCircuitBreaker('test-breaker', fn);
        const breaker2 = manager.getCircuitBreaker('test-breaker', fn);

        expect(breaker1).toBe(breaker2);
      });

      it('should create circuit breaker with custom options', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const options = {
          failureThreshold: 10,
          resetTimeout: 60000,
          timeout: 5000,
        };

        const breaker = manager.getCircuitBreaker('test-breaker', fn, options);

        expect(breaker).toBeDefined();
        expect(breaker.options.resetTimeout).toBe(60000);
      });

      it('should set up event handlers', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const onOpen = vi.fn();
        const onClose = vi.fn();
        const onHalfOpen = vi.fn();

        const breaker = manager.getCircuitBreaker('test-breaker', fn, {
          onOpen,
          onClose,
          onHalfOpen,
        });

        expect(breaker.on).toHaveBeenCalledWith('open', onOpen);
        expect(breaker.on).toHaveBeenCalledWith('close', onClose);
        expect(breaker.on).toHaveBeenCalledWith('halfOpen', onHalfOpen);
      });

      it('should set up default logging handlers', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);

        expect(breaker.on).toHaveBeenCalledWith('open', expect.any(Function));
        expect(breaker.on).toHaveBeenCalledWith('halfOpen', expect.any(Function));
        expect(breaker.on).toHaveBeenCalledWith('close', expect.any(Function));
      });
    });

    describe('getStats', () => {
      it('should return stats for existing breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        manager.getCircuitBreaker('test-breaker', fn);

        const stats = manager.getStats('test-breaker');

        expect(stats).toBeDefined();
        expect(stats.name).toBe('test-breaker');
        expect(stats.state).toBe('closed');
        expect(stats.stats).toBeDefined();
      });

      it('should return null for non-existent breaker', () => {
        const stats = manager.getStats('non-existent');

        expect(stats).toBeNull();
      });

      it('should determine correct state', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);
        
        // Mock different states
        breaker.closed = true;
        breaker.opened = false;
        expect(manager.getStats('test-breaker').state).toBe('closed');

        breaker.closed = false;
        breaker.opened = true;
        expect(manager.getStats('test-breaker').state).toBe('open');

        breaker.closed = false;
        breaker.opened = false;
        expect(manager.getStats('test-breaker').state).toBe('half-open');
      });
    });

    describe('getAllStats', () => {
      it('should return stats for all breakers', () => {
        const fn = vi.fn().mockResolvedValue('test');
        manager.getCircuitBreaker('breaker-1', fn);
        manager.getCircuitBreaker('breaker-2', fn);

        const allStats = manager.getAllStats();

        expect(allStats).toHaveLength(2);
        expect(allStats.map(s => s.name)).toEqual(['breaker-1', 'breaker-2']);
      });

      it('should return empty array when no breakers exist', () => {
        const allStats = manager.getAllStats();

        expect(allStats).toEqual([]);
      });
    });

    describe('remove', () => {
      it('should remove existing breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);

        const removed = manager.remove('test-breaker');

        expect(removed).toBe(true);
        expect(breaker.removeAllListeners).toHaveBeenCalled();
        expect(breaker.destroy).toHaveBeenCalled();
        expect(manager.getStats('test-breaker')).toBeNull();
      });

      it('should return false for non-existent breaker', () => {
        const removed = manager.remove('non-existent');

        expect(removed).toBe(false);
      });

      it('should handle breakers without destroy method', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);
        breaker.destroy = undefined;

        const removed = manager.remove('test-breaker');

        expect(removed).toBe(true);
        expect(breaker.removeAllListeners).toHaveBeenCalled();
      });
    });

    describe('reset', () => {
      it('should reset existing breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker = manager.getCircuitBreaker('test-breaker', fn);

        const reset = manager.reset('test-breaker');

        expect(reset).toBe(true);
        expect(breaker.close).toHaveBeenCalled();
      });

      it('should return false for non-existent breaker', () => {
        const reset = manager.reset('non-existent');

        expect(reset).toBe(false);
      });
    });

    describe('resetAll', () => {
      it('should reset all breakers', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker1 = manager.getCircuitBreaker('breaker-1', fn);
        const breaker2 = manager.getCircuitBreaker('breaker-2', fn);

        manager.resetAll();

        expect(breaker1.close).toHaveBeenCalled();
        expect(breaker2.close).toHaveBeenCalled();
      });

      it('should handle empty breakers map', () => {
        expect(() => manager.resetAll()).not.toThrow();
      });
    });

    describe('clear', () => {
      it('should clear all breakers', () => {
        const fn = vi.fn().mockResolvedValue('test');
        const breaker1 = manager.getCircuitBreaker('breaker-1', fn);
        const breaker2 = manager.getCircuitBreaker('breaker-2', fn);

        manager.clear();

        expect(breaker1.removeAllListeners).toHaveBeenCalled();
        expect(breaker1.destroy).toHaveBeenCalled();
        expect(breaker2.removeAllListeners).toHaveBeenCalled();
        expect(breaker2.destroy).toHaveBeenCalled();
        expect(manager.size()).toBe(0);
      });
    });

    describe('size', () => {
      it('should return correct size', () => {
        const fn = vi.fn().mockResolvedValue('test');

        expect(manager.size()).toBe(0);

        manager.getCircuitBreaker('breaker-1', fn);
        expect(manager.size()).toBe(1);

        manager.getCircuitBreaker('breaker-2', fn);
        expect(manager.size()).toBe(2);

        manager.remove('breaker-1');
        expect(manager.size()).toBe(1);
      });
    });

    describe('withCircuitBreaker', () => {
      it('should execute function successfully', async () => {
        const fn = vi.fn().mockResolvedValue('success');

        const result = await manager.withCircuitBreaker('test-breaker', fn, []);

        expect(result.success).toBe(true);
        expect(result.data).toBe('success');
        expect(result.pattern).toBe('circuit-breaker');
        expect(result.attempts).toBe(1);
        expect(result.metadata.circuitBreakerName).toBe('test-breaker');
      });

      it('should handle circuit breaker open error', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Circuit breaker is open'));
        
        const result = await manager.withCircuitBreaker('test-breaker', fn, []);

        expect(result.success).toBe(false);
        expect(result.error.message).toContain('Circuit breaker \'test-breaker\' is open');
        expect(result.metadata.circuitBreakerTripped).toBe(true);
      });

      it('should handle general errors', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('General error'));

        const result = await manager.withCircuitBreaker('test-breaker', fn, []);

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('General error');
        expect(result.metadata.circuitBreakerTripped).toBeUndefined();
      });

      it('should pass arguments to function', async () => {
        const fn = vi.fn().mockResolvedValue('success');

        await manager.withCircuitBreaker('test-breaker', fn, ['arg1', 'arg2']);

        const OpossumCircuitBreaker = vi.mocked(
          require('opossum').default
        );
        const lastInstance = OpossumCircuitBreaker._instances[OpossumCircuitBreaker._instances.length - 1];
        
        expect(lastInstance.fire).toHaveBeenCalledWith('arg1', 'arg2');
      });

      it('should include execution timing', async () => {
        const fn = vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'success';
        });

        const result = await manager.withCircuitBreaker('test-breaker', fn, []);

        expect(result.success).toBe(true);
        expect(result.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('CircuitBreaker Decorator', () => {
    it('should create decorator function', () => {
      const decorator = CircuitBreaker('test-breaker');

      expect(typeof decorator).toBe('function');
    });

    it('should decorate method with circuit breaker', async () => {
      class TestClass {
        @CircuitBreaker('test-method')
        async testMethod(value: string) {
          return `result-${value}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod('test');

      expect(result).toBe('result-test');
    });

    it('should use class and method name when name not provided', async () => {
      class TestClass {
        @CircuitBreaker('')
        async testMethod() {
          return 'success';
        }
      }

      const instance = new TestClass();
      await instance.testMethod();

      // The breaker should be created with default naming
      expect(circuitBreakerManager.size()).toBe(1);
    });

    it('should throw error when circuit breaker fails', async () => {
      class TestClass {
        @CircuitBreaker('failing-method')
        async testMethod() {
          throw new Error('Method failed');
        }
      }

      const instance = new TestClass();
      await expect(instance.testMethod()).rejects.toThrow('Method failed');
    });
  });

  describe('Utility Functions', () => {
    describe('getCircuitBreakerStats', () => {
      it('should get stats for specific breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        circuitBreakerManager.getCircuitBreaker('test-breaker', fn);

        const stats = getCircuitBreakerStats('test-breaker');

        expect(stats).toBeDefined();
        expect(stats.name).toBe('test-breaker');
      });

      it('should get all stats when no name provided', () => {
        const fn = vi.fn().mockResolvedValue('test');
        circuitBreakerManager.getCircuitBreaker('breaker-1', fn);
        circuitBreakerManager.getCircuitBreaker('breaker-2', fn);

        const allStats = getCircuitBreakerStats();

        expect(Array.isArray(allStats)).toBe(true);
        expect(allStats.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('resetCircuitBreaker', () => {
      it('should reset specific breaker', () => {
        const fn = vi.fn().mockResolvedValue('test');
        circuitBreakerManager.getCircuitBreaker('test-breaker', fn);

        const result = resetCircuitBreaker('test-breaker');

        expect(result).toBe(true);
      });

      it('should reset all breakers when no name provided', () => {
        const fn = vi.fn().mockResolvedValue('test');
        circuitBreakerManager.getCircuitBreaker('breaker-1', fn);
        circuitBreakerManager.getCircuitBreaker('breaker-2', fn);

        expect(() => resetCircuitBreaker()).not.toThrow();
      });
    });

    describe('withCircuitBreaker', () => {
      it('should execute function with circuit breaker protection', async () => {
        const fn = vi.fn().mockResolvedValue('success');

        const result = await withCircuitBreaker('test-breaker', fn, []);

        expect(result.success).toBe(true);
        expect(result.data).toBe('success');
      });

      it('should handle function arguments', async () => {
        const fn = vi.fn().mockImplementation(async (a, b) => `${a}-${b}`);

        const result = await withCircuitBreaker('test-breaker', fn, ['arg1', 'arg2']);

        expect(result.success).toBe(true);
        expect(result.data).toBe('arg1-arg2');
      });

      it('should handle custom options', async () => {
        const fn = vi.fn().mockResolvedValue('success');
        const options = {
          failureThreshold: 10,
          resetTimeout: 60000,
        };

        const result = await withCircuitBreaker('test-breaker', fn, [], options);

        expect(result.success).toBe(true);
        expect(result.metadata.circuitBreakerName).toBe('test-breaker');
      });
    });
  });

  describe('Circuit Breaker Configurations', () => {
    it('should export predefined configurations', () => {
      expect(CircuitBreakerConfigs.api).toBeDefined();
      expect(CircuitBreakerConfigs.database).toBeDefined();
      expect(CircuitBreakerConfigs.fast).toBeDefined();
      expect(CircuitBreakerConfigs.patient).toBeDefined();
      expect(CircuitBreakerConfigs.standard).toBeDefined();
    });

    it('should have different failure thresholds', () => {
      expect(CircuitBreakerConfigs.api.failureThreshold).toBe(5);
      expect(CircuitBreakerConfigs.database.failureThreshold).toBe(3);
      expect(CircuitBreakerConfigs.fast.failureThreshold).toBe(3);
      expect(CircuitBreakerConfigs.patient.failureThreshold).toBe(10);
      expect(CircuitBreakerConfigs.standard.failureThreshold).toBe(5);
    });

    it('should have different timeouts', () => {
      expect(CircuitBreakerConfigs.api.timeout).toBe(10000);
      expect(CircuitBreakerConfigs.database.timeout).toBe(5000);
      expect(CircuitBreakerConfigs.fast.timeout).toBe(5000);
      expect(CircuitBreakerConfigs.patient.timeout).toBe(60000);
      expect(CircuitBreakerConfigs.standard.timeout).toBe(30000);
    });

    it('should have error filter functions for api config', () => {
      const { errorFilter } = CircuitBreakerConfigs.api;
      
      expect(errorFilter(new Error('500 Internal Server Error'))).toBe(true);
      expect(errorFilter(new Error('timeout occurred'))).toBe(true);
      expect(errorFilter(new Error('network error'))).toBe(true);
      expect(errorFilter(new Error('400 Bad Request'))).toBe(false);
    });

    it('should have error filter functions for database config', () => {
      const { errorFilter } = CircuitBreakerConfigs.database;
      
      expect(errorFilter(new Error('connection failed'))).toBe(true);
      expect(errorFilter(new Error('timeout occurred'))).toBe(true);
      expect(errorFilter(new Error('service unavailable'))).toBe(true);
      expect(errorFilter(new Error('validation error'))).toBe(false);
    });
  });

  describe('createCircuitBreakerFn', () => {
    it('should create function with api config', async () => {
      const breakerFn = createCircuitBreakerFn('test-api', 'api');
      const fn = vi.fn().mockResolvedValue('api-result');

      const result = await breakerFn(fn, []);

      expect(result.success).toBe(true);
      expect(result.data).toBe('api-result');
    });

    it('should create function with database config', async () => {
      const breakerFn = createCircuitBreakerFn('test-db', 'database');
      const fn = vi.fn().mockResolvedValue('db-result');

      const result = await breakerFn(fn, []);

      expect(result.success).toBe(true);
      expect(result.data).toBe('db-result');
    });

    it('should create function with fast config', async () => {
      const breakerFn = createCircuitBreakerFn('test-fast', 'fast');
      const fn = vi.fn().mockResolvedValue('fast-result');

      const result = await breakerFn(fn, []);

      expect(result.success).toBe(true);
      expect(result.data).toBe('fast-result');
    });

    it('should create function with patient config', async () => {
      const breakerFn = createCircuitBreakerFn('test-patient', 'patient');
      const fn = vi.fn().mockResolvedValue('patient-result');

      const result = await breakerFn(fn, []);

      expect(result.success).toBe(true);
      expect(result.data).toBe('patient-result');
    });

    it('should create function with standard config', async () => {
      const breakerFn = createCircuitBreakerFn('test-standard', 'standard');
      const fn = vi.fn().mockResolvedValue('standard-result');

      const result = await breakerFn(fn, []);

      expect(result.success).toBe(true);
      expect(result.data).toBe('standard-result');
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple circuit breakers simultaneously', async () => {
      const apiFn = vi.fn().mockResolvedValue('api-success');
      const dbFn = vi.fn().mockResolvedValue('db-success');

      const apiResult = await withCircuitBreaker('api-breaker', apiFn, []);
      const dbResult = await withCircuitBreaker('db-breaker', dbFn, []);

      expect(apiResult.success).toBe(true);
      expect(apiResult.data).toBe('api-success');
      expect(dbResult.success).toBe(true);
      expect(dbResult.data).toBe('db-success');
      expect(circuitBreakerManager.size()).toBe(2);
    });

    it('should maintain separate state for different breakers', async () => {
      const fn1 = vi.fn().mockResolvedValue('success-1');
      const fn2 = vi.fn().mockRejectedValue(new Error('Circuit breaker is open'));

      const result1 = await withCircuitBreaker('breaker-1', fn1, []);
      const result2 = await withCircuitBreaker('breaker-2', fn2, []);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it('should work with async functions and complex arguments', async () => {
      const asyncFn = vi.fn().mockImplementation(async (data, options) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { processed: data, config: options };
      });

      const result = await withCircuitBreaker(
        'async-breaker',
        asyncFn,
        [{ input: 'test' }, { timeout: 5000 }]
      );

      expect(result.success).toBe(true);
      expect(result.data.processed.input).toBe('test');
      expect(result.data.config.timeout).toBe(5000);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle circuit breaker lifecycle events', async () => {
      const onOpen = vi.fn();
      const onClose = vi.fn();
      const onHalfOpen = vi.fn();
      
      const fn = vi.fn().mockResolvedValue('success');
      const breaker = manager.getCircuitBreaker('lifecycle-breaker', fn, {
        onOpen,
        onClose,
        onHalfOpen,
      });

      await manager.withCircuitBreaker('lifecycle-breaker', fn, []);

      expect(breaker.on).toHaveBeenCalledWith('open', onOpen);
      expect(breaker.on).toHaveBeenCalledWith('close', onClose);
      expect(breaker.on).toHaveBeenCalledWith('halfOpen', onHalfOpen);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle functions that throw non-Error objects', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw 'String error';
      });

      const result = await withCircuitBreaker('string-error-breaker', fn, []);

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
    });

    it('should handle functions with varying argument types', async () => {
      const fn = vi.fn().mockImplementation(async (num, str, obj, arr) => {
        return { num, str, obj, arr };
      });

      const result = await withCircuitBreaker(
        'varied-args-breaker',
        fn,
        [42, 'test', { key: 'value' }, [1, 2, 3]]
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        num: 42,
        str: 'test',
        obj: { key: 'value' },
        arr: [1, 2, 3],
      });
    });

    it('should handle breaker removal during execution', () => {
      const fn = vi.fn().mockResolvedValue('success');
      manager.getCircuitBreaker('temp-breaker', fn);

      expect(manager.size()).toBe(1);
      expect(manager.remove('temp-breaker')).toBe(true);
      expect(manager.size()).toBe(0);
    });

    it('should handle cleanup on manager clear', () => {
      const fn = vi.fn().mockResolvedValue('success');
      manager.getCircuitBreaker('breaker-1', fn);
      manager.getCircuitBreaker('breaker-2', fn);

      expect(manager.size()).toBe(2);
      manager.clear();
      expect(manager.size()).toBe(0);
    });

    it('should handle missing methods gracefully', () => {
      const fn = vi.fn().mockResolvedValue('success');
      const breaker = manager.getCircuitBreaker('no-methods-breaker', fn);
      
      // Remove methods to simulate missing functionality
      breaker.removeAllListeners = undefined;
      breaker.destroy = undefined;

      expect(() => manager.remove('no-methods-breaker')).not.toThrow();
    });
  });
});