/**
 * Stripe Mock Keys
 * 
 * Service-specific helpers for Stripe mock values.
 * This provides a convenient interface for getting and overriding Stripe-related mock values.
 */

import { mockRegistry } from '../registry.ts';

/**
 * Stripe mock keys interface
 */
export interface StripeKeys {
  secretKey?: string;
  webhookSecret?: string;
}

/**
 * Stripe mock keys helper
 */
export const mockStripeKeys = {
  /**
   * Get the Stripe secret key
   * @returns The Stripe secret key
   */
  getSecretKey: (): string => {
    return mockRegistry.get<string>('STRIPE_SECRET_KEY');
  },

  /**
   * Get the Stripe webhook secret
   * @returns The Stripe webhook secret
   */
  getWebhookSecret: (): string => {
    return mockRegistry.get<string>('STRIPE_WEBHOOK_SECRET');
  },

  /**
   * Get all Stripe keys
   * @returns All Stripe keys
   */
  getAll: (): StripeKeys => {
    return {
      secretKey: mockRegistry.get<string>('STRIPE_SECRET_KEY'),
      webhookSecret: mockRegistry.get<string>('STRIPE_WEBHOOK_SECRET'),
    };
  },

  /**
   * Set the Stripe secret key
   * @param value The Stripe secret key
   */
  setSecretKey: (value: string): void => {
    mockRegistry.set('STRIPE_SECRET_KEY', value);
  },

  /**
   * Set the Stripe webhook secret
   * @param value The Stripe webhook secret
   */
  setWebhookSecret: (value: string): void => {
    mockRegistry.set('STRIPE_WEBHOOK_SECRET', value);
  },

  /**
   * Set all Stripe keys
   * @param keys The Stripe keys
   */
  setAll: (keys: StripeKeys): void => {
    if (keys.secretKey !== undefined) {
      mockRegistry.set('STRIPE_SECRET_KEY', keys.secretKey);
    }
    if (keys.webhookSecret !== undefined) {
      mockRegistry.set('STRIPE_WEBHOOK_SECRET', keys.webhookSecret);
    }
  },

  /**
   * Override Stripe keys temporarily for a callback
   * @param keys The Stripe keys to override
   * @param callback The callback to execute with overridden keys
   */
  override: (keys: StripeKeys, callback: () => void): void => {
    const overrides: Record<string, any> = {};
    
    if (keys.secretKey !== undefined) {
      overrides['STRIPE_SECRET_KEY'] = keys.secretKey;
    }
    
    if (keys.webhookSecret !== undefined) {
      overrides['STRIPE_WEBHOOK_SECRET'] = keys.webhookSecret;
    }
    
    mockRegistry.override(overrides, callback);
  },

  /**
   * Reset Stripe keys to defaults
   */
  reset: (): void => {
    // Only reset Stripe-related keys
    const allValues = mockRegistry.getAll();
    const defaultStripeSecretKey = 'sk_test_stripe_secret_key';
    const defaultStripeWebhookSecret = 'whsec_test_stripe_webhook_secret';
    
    mockRegistry.set('STRIPE_SECRET_KEY', defaultStripeSecretKey);
    mockRegistry.set('STRIPE_WEBHOOK_SECRET', defaultStripeWebhookSecret);
  },
};
