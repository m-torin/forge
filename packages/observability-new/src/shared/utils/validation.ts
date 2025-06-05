/**
 * Configuration validation utilities
 */

import type { ObservabilityConfig, ObservabilityProviderConfig } from '../types/types';

export interface ValidationError {
  provider?: string;
  field?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate observability configuration
 */
export function validateConfig(config: ObservabilityConfig): ValidationResult {
  const errors: ValidationError[] = [];

  if (!config) {
    errors.push({ message: 'Configuration is required' });
    return { valid: false, errors };
  }

  if (!config.providers || typeof config.providers !== 'object') {
    errors.push({ message: 'Providers configuration is required' });
    return { valid: false, errors };
  }

  // Validate each provider
  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    const providerErrors = validateProvider(providerName, providerConfig);
    errors.push(...providerErrors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate individual provider configuration
 */
export function validateProvider(name: string, config: ObservabilityProviderConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (name) {
    case 'sentry':
      if (!config.dsn) {
        errors.push({
          provider: name,
          field: 'dsn',
          message: 'Sentry DSN is required'
        });
      }
      break;

    case 'opentelemetry':
      if (!config.serviceName) {
        errors.push({
          provider: name,
          field: 'serviceName',
          message: 'Service name is required for OpenTelemetry'
        });
      }
      break;

    case 'pino':
    case 'winston':
      // Logging providers have sensible defaults
      break;

    case 'console':
      // Console provider has no required fields
      break;

    default:
      // Unknown provider - not necessarily an error as it might be custom
      break;
  }

  return errors;
}

/**
 * Debug configuration by logging validation results
 */
export function debugConfig(config: ObservabilityConfig): void {
  const result = validateConfig(config);
  
  if (result.valid) {
    console.log('[Observability] Configuration is valid');
    console.log('[Observability] Providers:', Object.keys(config.providers).join(', '));
  } else {
    console.error('[Observability] Configuration errors:');
    result.errors.forEach(error => {
      const prefix = error.provider ? `[${error.provider}]` : '';
      const field = error.field ? ` ${error.field}:` : '';
      console.error(`  ${prefix}${field} ${error.message}`);
    });
  }
}