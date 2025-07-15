import { useStripeCustomer, useStripePaymentIntent } from '#/client-next';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// ================================================================================================
// DRY PAYMENTS CLIENT TESTING PATTERNS
// ================================================================================================

/**
 * DRY patterns for testing payment hooks
 */
const paymentsTestPatterns = {
  /**
   * Test React hook with different scenarios
   */
  testHook: (
    hookName: string,
    useHook: () => any,
    scenarios: Array<{
      name: string;
      setup?: () => void;
      action?: (result: any) => Promise<void> | void;
      assertion: (result: any) => void;
      options?: any;
    }>,
  ) => {
    describe(hookName, () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name}`, async () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const { result } = renderHook(() => useHook());

          if (scenario.action) {
            await act(async () => {
              await scenario.action!(result.current);
            });
          }

          scenario.assertion(result.current);
        });
      });
    });
  },

  /**
   * Test API operations with different response scenarios
   */
  testAPIOperation: (
    hookName: string,
    useHook: (options?: any) => any,
    operation: string,
    scenarios: Array<{
      name: string;
      mockResponse?: any;
      mockError?: any;
      operationArgs: any;
      setup?: () => void;
      assertion: (result: any, mockFn?: any) => void;
      options?: any;
    }>,
  ) => {
    describe(`${hookName} ${operation}`, () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name}`, async () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const mockFn = scenario.options?.onSuccess || scenario.options?.onError;
          const { result } = renderHook(() => useHook(scenario.options));

          await act(async () => {
            try {
              await result.current[operation](scenario.operationArgs);
            } catch (error) {
              // Expected for error scenarios
            }
          });

          scenario.assertion(result.current, mockFn);
        });
      });
    });
  },
};

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('payments Client Next.js Utilities (DRY Modernized)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  // ================================================================================================
  // PAYMENT INTENT HOOK TESTING
  // ================================================================================================

  paymentsTestPatterns.testHook(
    'useStripePaymentIntent initialization',
    () => useStripePaymentIntent(),
    [
      {
        name: 'initialize with default state',
        assertion: result => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBeNull();
          expect(result.paymentIntent).toBeNull();
          expect(typeof result.createPaymentIntent).toBe('function');
        },
      },
      {
        name: 'reset state correctly',
        action: result => {
          result.reset();
        },
        assertion: result => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBeNull();
          expect(result.paymentIntent).toBeNull();
        },
      },
    ],
  );

  paymentsTestPatterns.testAPIOperation(
    'useStripePaymentIntent',
    options => useStripePaymentIntent(options),
    'createPaymentIntent',
    [
      {
        name: 'handle successful payment intent creation',
        setup: () => {
          const mockResponse = { id: 'pi_123', client_secret: 'pi_123_secret' };
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
          });
        },
        operationArgs: { amount: 1000, currency: 'usd' },
        options: { onSuccess: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBeNull();
          expect(result.paymentIntent).toStrictEqual({
            id: 'pi_123',
            client_secret: 'pi_123_secret',
          });
          expect(mockFn).toHaveBeenCalledWith({ id: 'pi_123', client_secret: 'pi_123_secret' });
        },
      },
      {
        name: 'handle API errors',
        setup: () => {
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid amount' }),
          });
        },
        operationArgs: { amount: 1000 },
        options: { onError: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBe('HTTP error! status: 400');
          expect(result.paymentIntent).toBeNull();
          expect(mockFn).toHaveBeenCalledWith(expect.any(Error));
        },
      },
      {
        name: 'handle network errors',
        setup: () => {
          mockFetch.mockRejectedValueOnce(new Error('Network error'));
        },
        operationArgs: { amount: 1000 },
        options: { onError: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBe('Network error');
          expect(result.paymentIntent).toBeNull();
          expect(mockFn).toHaveBeenCalledWith(expect.any(Error));
        },
      },
      {
        name: 'handle non-Error objects thrown by fetch',
        setup: () => {
          mockFetch.mockRejectedValueOnce('String error');
        },
        operationArgs: { amount: 1000 },
        options: { onError: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBe('Unknown error');
          expect(result.paymentIntent).toBeNull();
          expect(mockFn).toHaveBeenCalledWith(expect.any(Error));
        },
      },
    ],
  );

  test('should set loading state during request', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(promise);
    const { result } = renderHook(() => useStripePaymentIntent());

    act(() => {
      result.current.createPaymentIntent({ amount: 1000 });
    });

    expect(result.current.loading).toBeTruthy();

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ id: 'pi_123', client_secret: 'secret' }),
      });
      await promise;
    });

    expect(result.current.loading).toBeFalsy();
  });

  // ================================================================================================
  // CUSTOMER HOOK TESTING
  // ================================================================================================

  paymentsTestPatterns.testHook('useStripeCustomer initialization', () => useStripeCustomer(), [
    {
      name: 'initialize with default state',
      assertion: result => {
        expect(result.loading).toBeFalsy();
        expect(result.error).toBeNull();
        expect(result.customer).toBeNull();
        expect(typeof result.createCustomer).toBe('function');
      },
    },
    {
      name: 'reset customer state',
      action: result => {
        result.reset();
      },
      assertion: result => {
        expect(result.loading).toBeFalsy();
        expect(result.error).toBeNull();
        expect(result.customer).toBeNull();
      },
    },
  ]);

  paymentsTestPatterns.testAPIOperation(
    'useStripeCustomer',
    options => useStripeCustomer(options),
    'createCustomer',
    [
      {
        name: 'create customer successfully',
        setup: () => {
          const mockCustomer = { id: 'cus_123', email: 'test@example.com' };
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockCustomer,
          });
        },
        operationArgs: { email: 'test@example.com', name: 'Test User' },
        options: { onSuccess: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBeNull();
          expect(result.customer).toStrictEqual({ id: 'cus_123', email: 'test@example.com' });
          expect(mockFn).toHaveBeenCalledWith({ id: 'cus_123', email: 'test@example.com' });
        },
      },
      {
        name: 'handle customer creation errors',
        setup: () => {
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
          });
        },
        operationArgs: { email: 'test@example.com' },
        options: { onError: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBe('HTTP error! status: 400');
          expect(result.customer).toBeNull();
          expect(mockFn).toHaveBeenCalledWith(expect.any(Error));
        },
      },
      {
        name: 'handle non-Error objects thrown by fetch in customer creation',
        setup: () => {
          mockFetch.mockRejectedValueOnce('Network failure');
        },
        operationArgs: { email: 'test@example.com' },
        options: { onError: vi.fn() },
        assertion: (result, mockFn) => {
          expect(result.loading).toBeFalsy();
          expect(result.error).toBe('Unknown error');
          expect(result.customer).toBeNull();
          expect(mockFn).toHaveBeenCalledWith(expect.any(Error));
        },
      },
    ],
  );
});
