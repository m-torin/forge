/**
 * Tests for better-auth-harmony integration
 */

import { describe, expect } from 'vitest';
import { harmonyConfig, harmonyUtils } from '../../src/shared/harmony';

describe('better-auth-harmony integration', () => {
  describe('harmonyUtils', () => {
    test('detects emails that will be normalized', () => {
      expect(harmonyUtils.willEmailBeNormalized('test.user+tag@gmail.com')).toBeTruthy();
      expect(harmonyUtils.willEmailBeNormalized('test.user@gmail.com')).toBeTruthy();
      expect(harmonyUtils.willEmailBeNormalized('test+tag@outlook.com')).toBeTruthy();
      expect(harmonyUtils.willEmailBeNormalized('test@example.com')).toBeFalsy();
    });

    test('gets expected normalized email', () => {
      expect(harmonyUtils.getExpectedNormalizedEmail('test.user+tag@gmail.com')).toBe(
        'testuser@gmail.com',
      );
      expect(harmonyUtils.getExpectedNormalizedEmail('test+tag@outlook.com')).toBe(
        'test@outlook.com',
      );
      expect(harmonyUtils.getExpectedNormalizedEmail('test@example.com')).toBe('test@example.com');
    });

    test('detects phones that will be normalized', () => {
      expect(harmonyUtils.willPhoneBeNormalized('+1 (555) 123-4567')).toBeTruthy();
      expect(harmonyUtils.willPhoneBeNormalized('555.123.4567')).toBeTruthy();
      expect(harmonyUtils.willPhoneBeNormalized('+15551234567')).toBeFalsy();
    });

    test('gets expected normalized phone', () => {
      expect(harmonyUtils.getExpectedNormalizedPhone('+1 (555) 123-4567')).toBe('+15551234567');
      expect(harmonyUtils.getExpectedNormalizedPhone('5551234567', 'US')).toBe('+15551234567');
      expect(harmonyUtils.getExpectedNormalizedPhone('+15551234567')).toBe('+15551234567');
    });
  });

  describe('harmonyConfig', () => {
    test('has correct default configuration', () => {
      expect(harmonyConfig.email.allowNormalizedSignin).toBeTruthy();
      expect(harmonyConfig.phone.defaultCountry).toBe('US');
      expect(harmonyConfig.phone.defaultCallingCode).toBe('+1');
      expect(harmonyConfig.phone.extract).toBeTruthy();
    });

    test('has working custom validators', () => {
      expect(harmonyConfig.email.validator('test@example.com')).toBeTruthy();
      expect(harmonyConfig.email.validator('invalid-email')).toBeFalsy();
    });

    test('has working custom normalizers', () => {
      expect(harmonyConfig.email.normalizer('  Test@Example.Com  ')).toBe('test@example.com');
      expect(harmonyConfig.phone.normalizer('+1 (555) 123-4567')).toBe('+15551234567');
    });
  });
});
