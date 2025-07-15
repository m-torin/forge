/**
 * Better Auth Harmony integration for validation and normalization
 * This provides utilities that work with the better-auth-harmony plugins
 */

import { logWarn } from '@repo/observability';

// Re-export better-auth-harmony plugins for server configuration
export { emailHarmony, phoneHarmony } from 'better-auth-harmony';

/**
 * Configuration options for better-auth-harmony
 */
export const harmonyConfig = {
  email: {
    // Allow users to sign in with normalized versions of their email
    allowNormalizedSignin: true,
    // Custom validator (optional)
    validator: (email: string) => {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    // Custom normalizer (optional)
    normalizer: (email: string) => {
      return email.toLowerCase().trim();
    },
  },
  phone: {
    // Default country for phone number parsing
    defaultCountry: 'US' as const,
    // Default calling code
    defaultCallingCode: '+1',
    // Extract phone numbers from strings
    extract: true,
    // Custom normalizer (optional)
    normalizer: (phone: string) => {
      // Remove all non-digit characters except '+'
      return phone.replace(/[^\d+]/g, '');
    },
  },
};

/**
 * Utility functions to work with better-auth-harmony
 */
export const harmonyUtils = {
  /**
   * Check if an email is likely to be normalized by the email harmony plugin
   */
  willEmailBeNormalized: (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    const localPart = email.split('@')[0];

    // Gmail normalization
    if (domain === 'gmail.com') {
      return localPart.includes('.') || localPart.includes('+');
    }

    // Other providers that support subaddressing
    const subaddressingDomains = ['outlook.com', 'hotmail.com', 'yahoo.com'];
    if (subaddressingDomains.includes(domain)) {
      return localPart.includes('+');
    }

    return false;
  },

  /**
   * Check if a phone number will be normalized
   */
  willPhoneBeNormalized: (phone: string): boolean => {
    // Check if phone contains formatting that will be removed
    return /[\s\-\(\)\.]+/.test(phone);
  },

  /**
   * Get expected normalized email (for display purposes)
   */
  getExpectedNormalizedEmail: (email: string): string => {
    const [localPart, domain] = email.split('@');

    if (domain?.toLowerCase() === 'gmail.com') {
      // Remove dots and plus addressing for Gmail
      const normalized = localPart.split('+')[0].replace(/\./g, '');
      return `${normalized}@gmail.com`;
    }

    // For other domains, just remove plus addressing
    const normalized = localPart.split('+')[0];
    return `${normalized}@${domain}`;
  },

  /**
   * Get expected normalized phone (for display purposes)
   */
  getExpectedNormalizedPhone: (phone: string, country = 'US'): string => {
    // Simple normalization for display (actual normalization is done by the plugin)
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // Add country code if not present
    if (country === 'US' && cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    return cleaned;
  },
};

/**
 * Migration helper for database schema
 * Note: Run `npx @better-auth/cli migrate` after adding harmony plugins
 */
export const harmonyMigration = {
  /**
   * Database fields that will be added by better-auth-harmony
   */
  requiredFields: {
    user: {
      normalizedEmail: 'string | null',
      phoneNumber: 'string | null',
      normalizedPhoneNumber: 'string | null',
    },
  },

  /**
   * Check if migration is needed
   */
  isMigrationNeeded: () => {
    logWarn('Run: npx @better-auth/cli migrate');
    logWarn('This will add normalizedEmail and phone fields to your user table');
  },
};

export default {
  harmonyConfig,
  harmonyUtils,
  harmonyMigration,
};
