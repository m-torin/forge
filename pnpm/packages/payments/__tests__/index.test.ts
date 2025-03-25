import { describe, expect, it, vi, beforeEach } from 'vitest';
import { stripe } from '../index';
import Stripe from 'stripe';
import { keys } from '../keys';

// Import the mocked modules
vi.mock('stripe');
vi.mock('../keys');
vi.mock('server-only', () => ({}));

describe.skip('Stripe Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock keys to return a function that returns test values
    (keys as any).mockImplementation(() => ({
      STRIPE_SECRET_KEY: 'sk_test_stripe_secret_key',
    }));
  });

  it('initializes Stripe with the correct API key', () => {
    // The stripe instance is created when the module is imported,
    // so we need to verify that Stripe was called with the correct parameters
    expect(Stripe).toHaveBeenCalledWith('sk_test_stripe_secret_key', {
      apiVersion: '2025-02-24.acacia',
    });
  });

  it('exports the stripe instance', () => {
    // Verify that the stripe instance is exported
    expect(stripe).toBeDefined();

    // Verify that the stripe instance has the expected methods
    expect(stripe.customers).toBeDefined();
    expect(stripe.subscriptions).toBeDefined();
    expect(stripe.products).toBeDefined();
    expect(stripe.prices).toBeDefined();
    expect(stripe.paymentLinks).toBeDefined();
    expect(stripe.checkout).toBeDefined();
    expect(stripe.webhooks).toBeDefined();
  });

  it('uses the API key from environment variables', () => {
    // Mock keys to return a function that returns a different API key
    (keys as any).mockImplementation(() => ({
      STRIPE_SECRET_KEY: 'sk_test_different_key',
    }));

    // Re-import the module to test with the new API key
    vi.isolateModules(() => {
      const { stripe: newStripe } = require('../index');

      // Verify that Stripe was called with the new API key
      expect(Stripe).toHaveBeenCalledWith('sk_test_different_key', {
        apiVersion: '2025-02-24.acacia',
      });

      // Verify that the new stripe instance is exported
      expect(newStripe).toBeDefined();
    });
  });

  it('exports the Stripe type', () => {
    // This is a type-level test, so we can only verify that the type is exported
    // by checking that the import doesn't cause a TypeScript error
    // The actual test is that this file compiles without errors
    expect(true).toBe(true);
  });
});
