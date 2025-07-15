import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useStripeCustomer, useStripePaymentIntent } from '../src/client-next';

// Mock fetch globally
global.fetch = vi.fn();

describe('payments Client Next.js Utilities', () => {
  describe('useStripePaymentIntent', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should initialize with default state', () => {
      const { result } = renderHook(() => useStripePaymentIntent());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.paymentIntent).toBeNull();
      expect(typeof result.current.createPaymentIntent).toBe('function');
    });

    test('should handle successful payment intent creation', async () => {
      const mockResponse = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useStripePaymentIntent({ onSuccess }));

      await act(async () => {
        await result.current.createPaymentIntent({
          amount: 1000,
          currency: 'usd',
        });
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.paymentIntent).toEqual(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    test('should handle API errors', async () => {
      const mockError = { error: 'Invalid amount' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useStripePaymentIntent({ onError }));

      await act(async () => {
        try {
          await result.current.createPaymentIntent({
            amount: 1000,
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe('HTTP error! status: 400');
      expect(result.current.paymentIntent).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const onError = vi.fn();
      const { result } = renderHook(() => useStripePaymentIntent({ onError }));

      await act(async () => {
        try {
          await result.current.createPaymentIntent({
            amount: 1000,
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe('Network error');
      expect(result.current.paymentIntent).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle non-Error objects thrown by fetch', async () => {
      (global.fetch as any).mockRejectedValueOnce('String error');

      const onError = vi.fn();
      const { result } = renderHook(() => useStripePaymentIntent({ onError }));

      await act(async () => {
        try {
          await result.current.createPaymentIntent({
            amount: 1000,
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe('Unknown error');
      expect(result.current.paymentIntent).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should set loading state during request', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      const { result } = renderHook(() => useStripePaymentIntent());

      // Start the request
      act(() => {
        result.current.createPaymentIntent({ amount: 1000 });
      });

      // Should be loading
      expect(result.current.loading).toBeTruthy();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ id: 'pi_123', client_secret: 'secret' }),
        });
        await promise;
      });

      // Should no longer be loading
      expect(result.current.loading).toBeFalsy();
    });

    test('should reset state', () => {
      const { result } = renderHook(() => useStripePaymentIntent());

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.paymentIntent).toBeNull();
    });
  });

  describe('useStripeCustomer', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useStripeCustomer());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.customer).toBeNull();
      expect(typeof result.current.createCustomer).toBe('function');
    });

    test('should create customer successfully', async () => {
      const mockCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useStripeCustomer({ onSuccess }));

      await act(async () => {
        await result.current.createCustomer({
          email: 'test@example.com',
          name: 'Test User',
        });
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.customer).toEqual(mockCustomer);
      expect(onSuccess).toHaveBeenCalledWith(mockCustomer);
    });

    test('should handle customer creation errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useStripeCustomer({ onError }));

      await act(async () => {
        try {
          await result.current.createCustomer({
            email: 'test@example.com',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe('HTTP error! status: 400');
      expect(result.current.customer).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle non-Error objects thrown by fetch in customer creation', async () => {
      (global.fetch as any).mockRejectedValueOnce('Network failure');

      const onError = vi.fn();
      const { result } = renderHook(() => useStripeCustomer({ onError }));

      await act(async () => {
        try {
          await result.current.createCustomer({
            email: 'test@example.com',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe('Unknown error');
      expect(result.current.customer).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should reset customer state', () => {
      const { result } = renderHook(() => useStripeCustomer());

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.customer).toBeNull();
    });
  });
});
