// Next.js client-specific hooks and components
import { useCallback, useState } from 'react';

('use client');

// Re-export client-safe utilities
export * from './client';

export interface UseStripePaymentIntentOptions {
  onSuccess?: (paymentIntent: { id: string; status: string }) => void;
  onError?: (error: Error) => void;
}

export interface PaymentIntentState {
  loading: boolean;
  error: string | null;
  paymentIntent: { id: string; client_secret: string } | null;
}

// Custom hook for managing payment intent creation
export const useStripePaymentIntent = (options: UseStripePaymentIntentOptions = {}) => {
  const [state, setState] = useState<PaymentIntentState>({
    loading: false,
    error: null,
    paymentIntent: null,
  });

  const createPaymentIntent = useCallback(
    async (params: { amount: number; currency?: string; metadata?: Record<string, string> }) => {
      setState((prev: PaymentIntentState) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const paymentIntent = await response.json();
        setState((prev: PaymentIntentState) => ({ ...prev, loading: false, paymentIntent }));
        options.onSuccess?.(paymentIntent);
        return paymentIntent;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev: PaymentIntentState) => ({ ...prev, loading: false, error: errorMessage }));
        options.onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error;
      }
    },
    [options],
  );

  return {
    ...state,
    createPaymentIntent,
    reset: () => setState({ loading: false, error: null, paymentIntent: null }),
  };
};

export interface UseStripeCustomerOptions {
  onSuccess?: (customer: { id: string; email: string }) => void;
  onError?: (error: Error) => void;
}

export interface CustomerState {
  loading: boolean;
  error: string | null;
  customer: { id: string; email: string } | null;
}

// Custom hook for managing customer operations
export const useStripeCustomer = (options: UseStripeCustomerOptions = {}) => {
  const [state, setState] = useState<CustomerState>({
    loading: false,
    error: null,
    customer: null,
  });

  const createCustomer = useCallback(
    async (params: { email: string; name?: string; metadata?: Record<string, string> }) => {
      setState((prev: CustomerState) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/payments/create-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const customer = await response.json();
        setState((prev: CustomerState) => ({ ...prev, loading: false, customer }));
        options.onSuccess?.(customer);
        return customer;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev: CustomerState) => ({ ...prev, loading: false, error: errorMessage }));
        options.onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error;
      }
    },
    [options],
  );

  return {
    ...state,
    createCustomer,
    reset: () => setState({ loading: false, error: null, customer: null }),
  };
};
