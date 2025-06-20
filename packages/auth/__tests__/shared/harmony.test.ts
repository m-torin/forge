/**
 * Tests for better-auth-harmony integration
 */

import { describe, expect, it } from 'vitest';

import { harmonyUtils, harmonyConfig } from '../../shared/harmony';

describe('better-auth-harmony integration', (_: any) => {
  describe('harmonyUtils', (_: any) => {
    it('detects emails that will be normalized', (_: any) => {
      expect(harmonyUtils.willEmailBeNormalized('test.user+tag@gmail.com')).toBe(true);
      expect(harmonyUtils.willEmailBeNormalized('test.user@gmail.com')).toBe(true);
      expect(harmonyUtils.willEmailBeNormalized('test+tag@outlook.com')).toBe(true);
      expect(harmonyUtils.willEmailBeNormalized('test@example.com')).toBe(false);
    });

    it('gets expected normalized email', (_: any) => {
      expect(harmonyUtils.getExpectedNormalizedEmail('test.user+tag@gmail.com')).toBe(
        'testuser@gmail.com',
      );
      expect(harmonyUtils.getExpectedNormalizedEmail('test+tag@outlook.com')).toBe(
        'test@outlook.com',
      );
      expect(harmonyUtils.getExpectedNormalizedEmail('test@example.com')).toBe('test@example.com');
    });

    it('detects phones that will be normalized', (_: any) => {
      expect(harmonyUtils.willPhoneBeNormalized('+1 (555) 123-4567')).toBe(true);
      expect(harmonyUtils.willPhoneBeNormalized('555.123.4567')).toBe(true);
      expect(harmonyUtils.willPhoneBeNormalized('+15551234567')).toBe(false);
    });

    it('gets expected normalized phone', (_: any) => {
      expect(harmonyUtils.getExpectedNormalizedPhone('+1 (555) 123-4567')).toBe('+15551234567');
      expect(harmonyUtils.getExpectedNormalizedPhone('5551234567', 'US')).toBe('+15551234567');
      expect(harmonyUtils.getExpectedNormalizedPhone('+15551234567')).toBe('+15551234567');
    });
  });

  describe('harmonyConfig', (_: any) => {
    it('has correct default configuration', (_: any) => {
      expect(harmonyConfig.email.allowNormalizedSignin).toBe(true);
      expect(harmonyConfig.phone.defaultCountry).toBe('US');
      expect(harmonyConfig.phone.defaultCallingCode).toBe('+1');
      expect(harmonyConfig.phone.extract).toBe(true);
    });

    it('has working custom validators', (_: any) => {
      expect(harmonyConfig.email.validator('test@example.com')).toBe(true);
      expect(harmonyConfig.email.validator('invalid-email')).toBe(false);
    });

    it('has working custom normalizers', (_: any) => {
      expect(harmonyConfig.email.normalizer('  Test@Example.Com  ')).toBe('test@example.com');
      expect(harmonyConfig.phone.normalizer('+1 (555) 123-4567')).toBe('+15551234567');
    });
  });
});
