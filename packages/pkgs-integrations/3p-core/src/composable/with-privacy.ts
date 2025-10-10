/**
 * Composable Privacy Utility - Tree-shaking optimized
 * Only imported when privacy functionality is needed
 */

import type { MinimalAdapter } from '../adapters/minimal-adapter';
import type { AnalyticsEvent, GroupPayload, IdentifyPayload, PagePayload } from '../types';

export interface PrivacyConfig {
  anonymizeIp?: boolean;
  respectDoNotTrack?: boolean;
  gdprCompliant?: boolean;
  ccpaCompliant?: boolean;
  cookieConsent?: boolean;
  consentStorageKey?: string;
}

class PrivacyManager {
  constructor(private config: PrivacyConfig) {}

  canTrack(type: 'analytics' | 'advertising' = 'analytics'): boolean {
    // Check Do Not Track
    if (this.config.respectDoNotTrack && typeof navigator !== 'undefined') {
      if (navigator.doNotTrack === '1' || (navigator as any).msDoNotTrack === '1') {
        return false;
      }
    }

    // Check cookie consent
    if (this.config.cookieConsent && typeof localStorage !== 'undefined') {
      const consentKey = this.config.consentStorageKey || 'analytics-consent';
      const consent = localStorage.getItem(consentKey);
      if (!consent || consent !== 'granted') {
        return false;
      }
    }

    return true;
  }

  anonymizeData<T extends Record<string, any>>(data: T): T {
    if (!this.config.anonymizeIp && !this.config.gdprCompliant) {
      return data;
    }

    const anonymized = { ...data };

    // Remove PII fields
    const piiFields = ['email', 'phone', 'ip', 'address', 'ssn', 'credit_card'];

    const removePII = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const cleaned = { ...obj };

      for (const key in cleaned) {
        if (piiFields.some(field => key.toLowerCase().includes(field))) {
          delete cleaned[key];
        } else if (typeof cleaned[key] === 'object') {
          cleaned[key] = removePII(cleaned[key]);
        }
      }

      return cleaned;
    };

    return removePII(anonymized);
  }

  // CCPA compliance - user opt-out check
  isOptedOut(): boolean {
    if (!this.config.ccpaCompliant || typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem('ccpa-opt-out') === 'true';
  }
}

export function withPrivacy(
  adapter: MinimalAdapter,
  privacyConfig?: PrivacyConfig,
): MinimalAdapter {
  const privacyManager = new PrivacyManager(privacyConfig || {});

  const checkPrivacy = (): boolean => {
    return privacyManager.canTrack('analytics') && !privacyManager.isOptedOut();
  };

  return {
    ...adapter,
    async track(event: AnalyticsEvent): Promise<boolean> {
      if (!checkPrivacy()) return true; // Silently succeed

      const anonymizedEvent = privacyManager.anonymizeData(event);
      return adapter.track(anonymizedEvent);
    },

    async identify(payload: IdentifyPayload): Promise<boolean> {
      if (!checkPrivacy()) return true;

      const anonymizedPayload = privacyManager.anonymizeData(payload);
      return adapter.identify(anonymizedPayload);
    },

    async group(payload: GroupPayload): Promise<boolean> {
      if (!checkPrivacy()) return true;

      const anonymizedPayload = privacyManager.anonymizeData(payload);
      return adapter.group(anonymizedPayload);
    },

    async page(payload: PagePayload): Promise<boolean> {
      if (!checkPrivacy()) return true;

      const anonymizedPayload = privacyManager.anonymizeData(payload);
      return adapter.page(anonymizedPayload);
    },
  };
}
