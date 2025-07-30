import {
  formatCurrency,
  isValidEmail,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  type PaymentStatus,
  type SubscriptionStatus,
} from '#/client';
import { describe, expect, test } from 'vitest';

describe('payments Client Utilities', () => {
  describe('formatCurrency', () => {
    test('should format USD currency correctly', () => {
      expect(formatCurrency(1299)).toBe('$12.99');
      expect(formatCurrency(100)).toBe('$1.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('should format other currencies correctly', () => {
      expect(formatCurrency(1299, 'eur')).toBe('€12.99');
      expect(formatCurrency(1299, 'gbp')).toBe('£12.99');
    });

    test('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('$10,000.00');
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBeTruthy();
      expect(isValidEmail('user.name@domain.co.uk')).toBeTruthy();
      expect(isValidEmail('user+tag@domain.com')).toBeTruthy();
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBeFalsy();
      expect(isValidEmail('invalid')).toBeFalsy();
      expect(isValidEmail('invalid@')).toBeFalsy();
      expect(isValidEmail('@domain.com')).toBeFalsy();
      expect(isValidEmail('invalid@domain')).toBeFalsy();
    });
  });

  describe('constants', () => {
    test('should export PAYMENT_STATUS constants', () => {
      expect(PAYMENT_STATUS.REQUIRES_PAYMENT_METHOD).toBe('requires_payment_method');
      expect(PAYMENT_STATUS.REQUIRES_CONFIRMATION).toBe('requires_confirmation');
      expect(PAYMENT_STATUS.REQUIRES_ACTION).toBe('requires_action');
      expect(PAYMENT_STATUS.PROCESSING).toBe('processing');
      expect(PAYMENT_STATUS.REQUIRES_CAPTURE).toBe('requires_capture');
      expect(PAYMENT_STATUS.CANCELED).toBe('canceled');
      expect(PAYMENT_STATUS.SUCCEEDED).toBe('succeeded');
    });

    test('should export SUBSCRIPTION_STATUS constants', () => {
      expect(SUBSCRIPTION_STATUS.INCOMPLETE).toBe('incomplete');
      expect(SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED).toBe('incomplete_expired');
      expect(SUBSCRIPTION_STATUS.TRIALING).toBe('trialing');
      expect(SUBSCRIPTION_STATUS.ACTIVE).toBe('active');
      expect(SUBSCRIPTION_STATUS.PAST_DUE).toBe('past_due');
      expect(SUBSCRIPTION_STATUS.CANCELED).toBe('canceled');
      expect(SUBSCRIPTION_STATUS.UNPAID).toBe('unpaid');
    });

    test('should have correct type definitions', () => {
      const paymentStatus: PaymentStatus = PAYMENT_STATUS.SUCCEEDED;
      const subscriptionStatus: SubscriptionStatus = SUBSCRIPTION_STATUS.ACTIVE;

      expect(paymentStatus).toBe('succeeded');
      expect(subscriptionStatus).toBe('active');
    });
  });
});
