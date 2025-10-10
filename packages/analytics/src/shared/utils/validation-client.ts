/**
 * Client-safe validation utilities for analytics configuration
 * This file contains only validation functions that are safe to use in browser environments
 */

import { PROVIDER_REQUIREMENTS } from './config';

import type { AnalyticsConfig, ProviderConfig } from '../types/types';

interface ValidationError {
  field: string;
  message: string;
  provider: string;
}

interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  warnings: string[];
}

/**
 * Comprehensive configuration validation (client-safe version)
 */
export function validateAnalyticsConfig(config: AnalyticsConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check if config exists
  if (!config) {
    errors.push({
      provider: 'global',
      field: 'config',
      message: 'Analytics configuration is required',
    });
    return { isValid: false, errors, warnings };
  }

  // Check if providers object exists
  if (!config.providers || typeof config.providers !== 'object') {
    errors.push({
      provider: 'global',
      field: 'providers',
      message: 'Providers configuration is required and must be an object',
    });
    return { isValid: false, errors, warnings };
  }

  // Check if at least one provider is configured
  const providerCount = Object.keys(config.providers).length;
  if (providerCount === 0) {
    warnings.push('No providers configured. Analytics will not track any events.');
  }

  // Validate each provider
  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    const providerErrors = validateProvider(providerName, providerConfig);
    errors.push(...providerErrors);
  }

  // Environment-specific warnings
  if (typeof window !== 'undefined') {
    // Client-side warnings
    if (config.providers.mixpanel) {
      warnings.push(
        'Mixpanel provider configured on client-side. Consider using server-side for better performance.',
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single provider configuration
 */
export function validateProvider(providerName: string, config: ProviderConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if provider is known
  const knownProviders = ['segment', 'posthog', 'vercel', 'console'];
  if (!knownProviders.includes(providerName)) {
    errors.push({
      provider: providerName,
      field: 'name',
      message: `Unknown provider '${providerName}'. Known providers: ${knownProviders.join(', ')}`,
    });
    return errors;
  }

  // Check required fields
  const requiredFields = PROVIDER_REQUIREMENTS[providerName] || [];
  for (const field of requiredFields) {
    const value = config[field as keyof ProviderConfig];

    if (!value) {
      errors.push({
        provider: providerName,
        field,
        message: `Required field '${field}' is missing for provider '${providerName}'`,
      });
    } else if (typeof value === 'string' && value.trim() === '') {
      errors.push({
        provider: providerName,
        field,
        message: `Required field '${field}' cannot be empty for provider '${providerName}'`,
      });
    }
  }

  // Provider-specific validation
  switch (providerName) {
    case 'segment':
      if (config.writeKey && !isValidSegmentWriteKey(config.writeKey)) {
        errors.push({
          provider: providerName,
          field: 'writeKey',
          message: 'Segment writeKey appears to be invalid format',
        });
      }
      break;

    case 'posthog':
      if (config.apiKey && !isValidPostHogApiKey(config.apiKey)) {
        errors.push({
          provider: providerName,
          field: 'apiKey',
          message: 'PostHog apiKey appears to be invalid format',
        });
      }
      break;
  }

  return errors;
}

/**
 * Helper functions for format validation
 */
function isValidSegmentWriteKey(writeKey: string): boolean {
  // Segment write keys are typically 32 characters, alphanumeric
  return /^[a-zA-Z0-9]{20,40}$/.test(writeKey);
}

function isValidPostHogApiKey(apiKey: string): boolean {
  // PostHog API keys start with 'phc_' followed by alphanumeric characters
  return /^phc_[a-zA-Z0-9]{43}$/.test(apiKey);
}

/**
 * Utility to validate configuration (client-safe version without throwing)
 * Returns validation result instead of throwing errors
 */
export function validateConfig(config: AnalyticsConfig): ValidationResult {
  return validateAnalyticsConfig(config);
}
