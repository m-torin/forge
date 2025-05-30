import 'server-only';
import Stripe from 'stripe';

import { keys } from './keys';

let stripeInstance: Stripe | null = null;
let hasLoggedWarning = false;

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const { STRIPE_SECRET_KEY } = keys();

    // Return no-op functions if key is missing
    if (!STRIPE_SECRET_KEY) {
      if (!hasLoggedWarning) {
        console.warn('Stripe payment service is disabled: Missing STRIPE_SECRET_KEY');
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
        apiVersion: '2025-05-28.basil',
      });
    }

    return stripeInstance[prop as keyof Stripe];
  },
});

export type { Stripe } from 'stripe';
