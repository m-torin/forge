/**
 * Stripe payment integration for server-side operations
 * Provides proxy-based Stripe client with fallback behavior when API key is missing
 */

import 'server-only';
import Stripe from 'stripe';

import { logWarn } from '@repo/observability';
import { safeEnv } from '../env';

let stripeInstance: Stripe | null = null;
let hasLoggedWarning = false;

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const { STRIPE_SECRET_KEY } = safeEnv();

    // Return no-op functions if key is missing
    if (!STRIPE_SECRET_KEY) {
      if (!hasLoggedWarning) {
        logWarn('Stripe payment service is disabled: Missing STRIPE_SECRET_KEY');
        hasLoggedWarning = true;
      }

      // Return mock objects for common Stripe resources
      if (typeof prop === 'string') {
        const mockResource = {
          create: () => Promise.resolve({ id: `mock_${prop}_id` }),
          del: () => Promise.resolve({ id: `mock_${prop}_id`, deleted: true }),
          list: () => Promise.resolve({ data: [], has_more: false }),
          retrieve: () => Promise.resolve({ id: `mock_${prop}_id` }),
          update: () => Promise.resolve({ id: `mock_${prop}_id` }),
        };

        if (
          [
            'checkout',
            'customers',
            'invoices',
            'paymentIntents',
            'prices',
            'products',
            'subscriptions',
          ].includes(prop)
        ) {
          return mockResource;
        }
      }
      return undefined;
    }

    // Initialize Stripe instance on first use
    if (!stripeInstance) {
      stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil',
      });
    }

    return stripeInstance[prop as keyof Stripe];
  },
});

/**
 * Construct and verify a Stripe webhook event
 * @param payload - Raw request payload from Stripe
 * @param signature - Stripe signature header value
 * @param secret - Optional webhook secret (uses env var if not provided)
 * @returns Verified Stripe event object
 * @throws Error if webhook secret is missing or verification fails
 */
export const constructEvent = (
  payload: string | Buffer,
  signature: string | Buffer | Array<string>,
  secret?: string,
): Stripe.Event => {
  if (!secret) {
    const { STRIPE_WEBHOOK_SECRET } = safeEnv();
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
    }
    secret = STRIPE_WEBHOOK_SECRET;
  }
  if (!secret) {
    throw new Error('Webhook secret is required for webhook verification');
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

export type { Stripe } from 'stripe';
