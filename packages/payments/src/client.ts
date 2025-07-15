// Client-safe exports (types and utilities that can be used in browser)

// Re-export commonly used types that are safe for client-side use
import Stripe from 'stripe';

export type { Stripe } from 'stripe';

export type StripeInstance = Stripe;
export type StripeError = Stripe.errors.StripeError;
export type StripeCardError = Stripe.errors.StripeCardError;
export type StripeInvalidRequestError = Stripe.errors.StripeInvalidRequestError;
export type StripeAPIError = Stripe.errors.StripeAPIError;
export type StripeConnectionError = Stripe.errors.StripeConnectionError;
export type StripeAuthenticationError = Stripe.errors.StripeAuthenticationError;
export type StripePermissionError = Stripe.errors.StripePermissionError;
export type StripeRateLimitError = Stripe.errors.StripeRateLimitError;

// Client-safe utilities
export const formatCurrency = (amount: number, currency = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe amounts are in cents
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common payment status constants
export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded',
} as const;

export const SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
