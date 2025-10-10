/**
 * Privacy and compliance utilities for 3rd party analytics integrations
 */

import type { ConsentStatus, PrivacyConfig } from '../types';

export class PrivacyManager {
  private consentStatus: ConsentStatus | null = null;
  private config: PrivacyConfig;

  constructor(config: PrivacyConfig) {
    this.config = config;
    this.initializeConsent();
  }

  private initializeConsent(): void {
    if (typeof window === 'undefined') {
      return; // Server-side, no consent management needed
    }

    // Check for stored consent
    const stored = this.getStoredConsent();
    if (stored) {
      this.consentStatus = stored;
      return;
    }

    // Check for Do Not Track
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.consentStatus = {
        granted: false,
        categories: {
          analytics: false,
          marketing: false,
          personalization: false,
          essential: true, // Essential cookies are always allowed
        },
        timestamp: new Date(),
      };
      return;
    }

    // Default consent status
    this.consentStatus = {
      granted: !this.config.cookieConsent, // If cookie consent required, default to false
      categories: {
        analytics: !this.config.cookieConsent,
        marketing: false, // Marketing always requires explicit consent
        personalization: !this.config.cookieConsent,
        essential: true,
      },
      timestamp: new Date(),
    };
  }

  setConsent(consent: Partial<ConsentStatus>): void {
    this.consentStatus = {
      granted: consent.granted ?? false,
      categories: {
        analytics: consent.categories?.analytics ?? false,
        marketing: consent.categories?.marketing ?? false,
        personalization: consent.categories?.personalization ?? false,
        essential: consent.categories?.essential ?? true,
      },
      timestamp: new Date(),
    };

    this.storeConsent(this.consentStatus);
    this.emitConsentChange(this.consentStatus);
  }

  getConsent(): ConsentStatus | null {
    return this.consentStatus;
  }

  canTrack(
    category: 'analytics' | 'marketing' | 'personalization' | 'essential' = 'analytics',
  ): boolean {
    if (!this.consentStatus) {
      return false;
    }

    // Essential tracking is always allowed
    if (category === 'essential') {
      return true;
    }

    // Check overall consent
    if (!this.consentStatus.granted) {
      return false;
    }

    // Check category-specific consent
    return this.consentStatus.categories[category] ?? false;
  }

  isGDPRRequired(): boolean {
    if (typeof window === 'undefined') {
      return this.config.gdprCompliant ?? true; // Default to compliant on server
    }

    // Simple GDPR detection based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Amsterdam',
      'Europe/Brussels',
      'Europe/Vienna',
      'Europe/Stockholm',
      'Europe/Copenhagen',
      'Europe/Helsinki',
      'Europe/Prague',
      'Europe/Warsaw',
      'Europe/Budapest',
      'Europe/Bucharest',
      'Europe/Sofia',
      'Europe/Zagreb',
      'Europe/Ljubljana',
      'Europe/Bratislava',
      'Europe/Vilnius',
      'Europe/Riga',
      'Europe/Tallinn',
      'Europe/Dublin',
      'Europe/Luxembourg',
      'Europe/Malta',
      'Atlantic/Azores',
      'Atlantic/Madeira',
    ];

    return euTimezones.includes(timezone);
  }

  isCCPARequired(): boolean {
    if (typeof window === 'undefined') {
      return this.config.ccpaCompliant ?? true; // Default to compliant on server
    }

    // Simple CCPA detection - would need more sophisticated geo-detection in production
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone === 'America/Los_Angeles' || timezone === 'America/San_Francisco';
  }

  anonymizeData<T extends Record<string, any>>(data: T): T {
    const anonymized = { ...data };

    // Remove or hash potentially identifying information
    if (anonymized.email) {
      anonymized.email = this.hashString(anonymized.email);
    }

    if (anonymized.userId && this.config.gdprCompliant) {
      anonymized.userId = this.hashString(anonymized.userId);
    }

    if (anonymized.ip && this.config.anonymizeIp) {
      anonymized.ip = this.anonymizeIP(anonymized.ip);
    }

    // Remove PII from properties
    if (anonymized.properties) {
      anonymized.properties = this.removePII(anonymized.properties);
    }

    return anonymized;
  }

  private getStoredConsent(): ConsentStatus | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem('analytics_consent');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeConsent(consent: ConsentStatus): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('analytics_consent', JSON.stringify(consent));
    } catch {
      // Storage failed, continue without persistence
    }
  }

  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return (
      navigator.doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1' ||
      (window as any).doNotTrack === '1'
    );
  }

  private emitConsentChange(consent: ConsentStatus): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('analytics:consent-changed', {
        detail: consent,
      }),
    );
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private anonymizeIP(ip: string): string {
    // IPv4: Remove last octet
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }

    // IPv6: Remove last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return parts.slice(0, 4).join(':') + '::';
      }
    }

    return '0.0.0.0';
  }

  private removePII(properties: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    const piiKeys = ['email', 'phone', 'address', 'ssn', 'creditcard', 'password'];

    for (const [key, value] of Object.entries(properties)) {
      const lowerKey = key.toLowerCase();

      // Skip known PII keys
      if (piiKeys.some(pii => lowerKey.includes(pii))) {
        continue;
      }

      // Skip values that look like emails
      if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
        continue;
      }

      cleaned[key] = value;
    }

    return cleaned;
  }
}

export function createPrivacyManager(config: PrivacyConfig): PrivacyManager {
  return new PrivacyManager(config);
}

export function getDefaultPrivacyConfig(): PrivacyConfig {
  return {
    anonymizeIp: true,
    respectDoNotTrack: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    cookieConsent: true,
  };
}
