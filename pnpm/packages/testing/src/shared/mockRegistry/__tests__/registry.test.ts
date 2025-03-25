import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockRegistry, mockRegistry } from '../registry.ts';
import { mockStripeKeys } from '../services/stripe.ts';

describe('MockRegistry', () => {
  beforeEach(() => {
    // Reset the registry before each test
    mockRegistry.reset();
  });

  it('should return default values', () => {
    expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe('sk_test_stripe_secret_key');
    expect(mockRegistry.get('STRIPE_WEBHOOK_SECRET')).toBe('whsec_test_stripe_webhook_secret');
  });

  it('should allow setting values', () => {
    mockRegistry.set('STRIPE_SECRET_KEY', 'custom_key');
    expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe('custom_key');
  });

  it('should allow overriding values temporarily', () => {
    const originalValue = mockRegistry.get('STRIPE_SECRET_KEY');
    
    mockRegistry.override({
      STRIPE_SECRET_KEY: 'temporary_key',
    }, () => {
      expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe('temporary_key');
    });
    
    // Value should be restored after the callback
    expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe(originalValue);
  });

  it('should restore values even if the callback throws', () => {
    const originalValue = mockRegistry.get('STRIPE_SECRET_KEY');
    
    try {
      mockRegistry.override({
        STRIPE_SECRET_KEY: 'temporary_key',
      }, () => {
        throw new Error('Test error');
      });
    } catch (error) {
      // Ignore the error
    }
    
    // Value should be restored even if the callback throws
    expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe(originalValue);
  });

  it('should reset all values to defaults', () => {
    mockRegistry.set('STRIPE_SECRET_KEY', 'custom_key');
    mockRegistry.reset();
    expect(mockRegistry.get('STRIPE_SECRET_KEY')).toBe('sk_test_stripe_secret_key');
  });
});

describe('mockStripeKeys', () => {
  beforeEach(() => {
    // Reset the registry before each test
    mockRegistry.reset();
  });

  it('should get Stripe secret key', () => {
    expect(mockStripeKeys.getSecretKey()).toBe('sk_test_stripe_secret_key');
  });

  it('should get Stripe webhook secret', () => {
    expect(mockStripeKeys.getWebhookSecret()).toBe('whsec_test_stripe_webhook_secret');
  });

  it('should set Stripe secret key', () => {
    mockStripeKeys.setSecretKey('custom_key');
    expect(mockStripeKeys.getSecretKey()).toBe('custom_key');
  });

  it('should set Stripe webhook secret', () => {
    mockStripeKeys.setWebhookSecret('custom_webhook_secret');
    expect(mockStripeKeys.getWebhookSecret()).toBe('custom_webhook_secret');
  });

  it('should override Stripe keys temporarily', () => {
    const originalSecretKey = mockStripeKeys.getSecretKey();
    
    mockStripeKeys.override({
      secretKey: 'temporary_key',
    }, () => {
      expect(mockStripeKeys.getSecretKey()).toBe('temporary_key');
      expect(mockStripeKeys.getWebhookSecret()).toBe('whsec_test_stripe_webhook_secret');
    });
    
    // Values should be restored after the callback
    expect(mockStripeKeys.getSecretKey()).toBe(originalSecretKey);
  });

  it('should reset Stripe keys to defaults', () => {
    mockStripeKeys.setSecretKey('custom_key');
    mockStripeKeys.reset();
    expect(mockStripeKeys.getSecretKey()).toBe('sk_test_stripe_secret_key');
  });
});
