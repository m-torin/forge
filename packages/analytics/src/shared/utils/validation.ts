/**
 * Validation utilities for analytics configuration
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { PROVIDER_REQUIREMENTS } from './config';

import type { AnalyticsConfig, ProviderConfig } from '../types/types';

export interface ValidationError {
  field: string;
  message: string;
  provider: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  warnings: string[];
}

/**
 * Comprehensive configuration validation
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
  } else {
    // Server-side warnings
    if (config.providers.vercel) {
      warnings.push(
        'Vercel Analytics has limited server-side support. Consider using client-side for better features.',
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
 * Validate environment variables for analytics
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check for common environment variables
  const envVars = {
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  };

  for (const [varName, value] of Object.entries(envVars)) {
    if (value && typeof value === 'string') {
      if (value.trim() === '') {
        warnings.push(`Environment variable ${varName} is set but empty`);
      } else if (value.includes('your-') || value.includes('paste-')) {
        warnings.push(`Environment variable ${varName} appears to contain placeholder text`);
      }
    }
  }

  // Warn about development environment
  if (process.env.NODE_ENV === 'development') {
    if (!envVars.SEGMENT_WRITE_KEY && !envVars.POSTHOG_API_KEY) {
      warnings.push(
        'No analytics environment variables detected in development. Consider using console provider for debugging.',
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
 * Utility to throw validation errors (for strict validation)
 */
export function validateConfigOrThrow(config: AnalyticsConfig): void {
  const result = validateAnalyticsConfig(config);

  if (!result.isValid) {
    const errorMessages = result.errors
      .map(error => `${error.provider}.${error.field}: ${error.message}`)
      .join('\n');

    throw new Error(`Analytics configuration validation failed:\n${errorMessages}`);
  }

  // Log warnings but don't throw
  if (result.warnings.length > 0 && config.onError) {
    config.onError(new Error('Analytics configuration warnings'), {
      provider: 'analytics',
      method: 'validateConfig',
      warnings: result.warnings,
    });
  }
}

/**
 * Development helper to check configuration
 */
export async function debugConfig(config: AnalyticsConfig): Promise<void> {
  const result = validateAnalyticsConfig(config);

  logInfo('Analytics Configuration Debug', {
    config,
    validationResult: result,
  });

  if (result.errors.length > 0) {
    logError('Analytics configuration errors: Validation failed', {
      errors: result.errors,
    });
  }

  if (result.warnings.length > 0) {
    logWarn('Analytics configuration warnings', { warnings: result.warnings });
  }
}
