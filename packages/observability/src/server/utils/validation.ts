/**
 * Server-side configuration validation utilities
 * Node.js version with server-specific functionality
 */

import {
  LogLevel,
  ObservabilityConfig,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
import { Environment } from '../../shared/utils/environment';

export interface ValidationError {
  field?: string;
  message: string;
  provider?: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  valid: boolean;
}

/**
 * Debug configuration by logging validation results (server version)
 */
export function debugConfig(config: ObservabilityConfig): void {
  // Use centralized environment detection
  if (Environment.isProduction()) return;

  const result = validateObservabilityConfig(config);

  if (result.valid) {
    console.log('[Observability] Configuration is valid');
    console.log('[Observability] Providers: ', Object.keys(config.providers).join(', '));
  } else {
    throw new Error(
      `[Observability] Configuration errors: ${result.errors
        .map((error: any) => {
          const prefix = error.provider ? `[${error.provider}]` : '';
          const field = error.field ? ` ${error.field}:` : '';
          return `${prefix}${field} ${(error as Error)?.message || 'Unknown error'}`;
        })
        .join(', ')}`,
    );
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  const [localPart, domain] = email.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }
  return true;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate configuration (throws on error - for tests)
 */
export function validateConfig(config: any): void {
  if (!config) {
    throw new Error('Configuration is required');
  }

  if (!Array.isArray(config.providers)) {
    throw new Error('Providers must be an array');
  }

  if (config.defaultLogLevel !== undefined) {
    validateLogLevel(config.defaultLogLevel);
  }

  if (config.enableConsoleInDev !== undefined && typeof config.enableConsoleInDev !== 'boolean') {
    throw new Error('enableConsoleInDev must be a boolean');
  }

  if (config.enabledEnvironments !== undefined) {
    if (!Array.isArray(config.enabledEnvironments)) {
      throw new Error('enabledEnvironments must be an array');
    }

    for (const env of config.enabledEnvironments) {
      if (typeof env !== 'string') {
        throw new Error('All environments must be strings');
      }
    }
  }
}

/**
 * Validate log level
 */
export function validateLogLevel(level: LogLevel): void {
  const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  if (!validLevels.includes(level)) {
    throw new Error(`Invalid log level: ${level}. Valid levels are: ${validLevels.join(', ')}`);
  }
}

/**
 * Validate observability configuration (returns ValidationResult)
 */
export function validateObservabilityConfig(config: ObservabilityConfig): ValidationResult {
  const errors: ValidationError[] = [];

  if (!config) {
    errors.push({ message: 'Configuration is required' });
    return { errors, valid: false };
  }

  if (!config.providers || typeof config.providers !== 'object') {
    errors.push({ message: 'Providers configuration is required' });
    return { errors, valid: false };
  }

  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    const providerErrors = validateProviderConfig(providerName, providerConfig);
    errors.push(...providerErrors);
  }

  return {
    errors,
    valid: errors.length === 0,
  };
}

/**
 * Validate observability provider
 */
export function validateProvider(provider: unknown): void {
  if (provider === null || provider === undefined) {
    throw new Error('Provider cannot be null or undefined');
  }

  if (typeof provider !== 'object') {
    throw new Error('Provider must be an object');
  }

  const providerObj = provider as Record<string, unknown>;

  if (typeof providerObj.log !== 'function') {
    throw new Error('Provider must implement log method');
  }

  if (typeof providerObj.captureException !== 'function') {
    throw new Error('Provider must implement captureException method');
  }
}

/**
 * Validate individual provider configuration (server-focused)
 */
export function validateProviderConfig(
  name: string,
  config: ObservabilityProviderConfig,
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (name) {
    case 'better-stack':

    case 'logtail':
      if (!config.sourceToken) {
        errors.push({
          field: 'sourceToken',
          message: 'Better Stack source token is required',
          provider: name,
        });
      }
      break;
    case 'console':
      // Console provider has no required fields
      break;
    case 'opentelemetry':

    case 'otel':
    case 'vercel-otel':
      if (!config.serviceName) {
        errors.push({
          field: 'serviceName',
          message: 'Service name is required for OpenTelemetry',
          provider: name,
        });
      }
      break;

    case 'pino':
    case 'winston':
      // Logging providers have sensible defaults
      break;

    case 'sentry':
    case 'sentry-edge':
      if (!config.dsn) {
        errors.push({
          field: 'dsn',
          message: 'Sentry DSN is required',
          provider: name,
        });
      }
      break;

    default:
      // Unknown provider - not necessarily an error as it might be custom
      break;
  }

  return errors;
}
