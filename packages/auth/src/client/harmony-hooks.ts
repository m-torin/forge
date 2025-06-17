/**
 * React hooks for client-side utilities with better-auth-harmony integration
 */

'use client';

import { useCallback, useState } from 'react';

import { harmonyUtils } from '../shared/harmony';

/**
 * Hook for email normalization preview with better-auth-harmony
 */
export function useEmailNormalization() {
  const [emailInfo, setEmailInfo] = useState<{
    original: string;
    willBeNormalized: boolean;
    expectedNormalized: string;
  }>({ original: '', willBeNormalized: false, expectedNormalized: '' });

  const checkEmail = useCallback((email: string) => {
    if (!email) {
      setEmailInfo({ original: '', willBeNormalized: false, expectedNormalized: '' });
      return;
    }

    const willBeNormalized = harmonyUtils.willEmailBeNormalized(email);
    const expectedNormalized = willBeNormalized
      ? harmonyUtils.getExpectedNormalizedEmail(email)
      : email;

    setEmailInfo({
      original: email,
      willBeNormalized,
      expectedNormalized,
    });
  }, []);

  return { emailInfo, checkEmail };
}

/**
 * Hook for phone number normalization preview with better-auth-harmony
 */
export function usePhoneNormalization() {
  const [phoneInfo, setPhoneInfo] = useState<{
    original: string;
    willBeNormalized: boolean;
    expectedNormalized: string;
  }>({ original: '', willBeNormalized: false, expectedNormalized: '' });

  const checkPhone = useCallback((phone: string, country = 'US') => {
    if (!phone) {
      setPhoneInfo({ original: '', willBeNormalized: false, expectedNormalized: '' });
      return;
    }

    const willBeNormalized = harmonyUtils.willPhoneBeNormalized(phone);
    const expectedNormalized = harmonyUtils.getExpectedNormalizedPhone(phone, country);

    setPhoneInfo({
      original: phone,
      willBeNormalized,
      expectedNormalized,
    });
  }, []);

  return { phoneInfo, checkPhone };
}

/**
 * Combined hook for better-auth-harmony utilities
 */
export function useHarmony() {
  const email = useEmailNormalization();
  const phone = usePhoneNormalization();

  return {
    email,
    phone,
    utils: harmonyUtils,
  };
}

/**
 * Hook for form field previews with normalization hints
 */
export function useHarmonyFormField() {
  const showNormalizationHint = useCallback(
    (value: string, type: 'email' | 'phone', country?: string) => {
      if (type === 'email') {
        const willNormalize = harmonyUtils.willEmailBeNormalized(value);
        if (willNormalize) {
          const normalized = harmonyUtils.getExpectedNormalizedEmail(value);
          return {
            show: true,
            message: `Will be normalized to: ${normalized}`,
            normalized,
          };
        }
      } else if (type === 'phone') {
        const willNormalize = harmonyUtils.willPhoneBeNormalized(value);
        if (willNormalize) {
          const normalized = harmonyUtils.getExpectedNormalizedPhone(value, country);
          return {
            show: true,
            message: `Will be normalized to: ${normalized}`,
            normalized,
          };
        }
      }

      return { show: false, message: '', normalized: value };
    },
    [],
  );

  return { showNormalizationHint };
}
