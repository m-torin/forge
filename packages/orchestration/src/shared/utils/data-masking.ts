/**
 * Data masking utilities for protecting sensitive information in logs and errors
 */

/**
 * List of sensitive field names to mask
 */
const SENSITIVE_FIELDS = new Set([
  // Authentication
  'password',
  'token',
  'apikey',
  'api_key',
  'apiKey',
  'secret',
  'clientsecret',
  'client_secret',
  'clientSecret',
  'auth',
  'authorization',
  'bearer',

  // Personal data
  'ssn',
  'social_security_number',
  'socialSecurityNumber',
  'tax_id',
  'taxId',
  'driver_license',
  'driverLicense',
  'passport',
  'email',
  'phone',
  'phoneNumber',
  'phone_number',

  // Financial data
  'credit_card',
  'creditCard',
  'card_number',
  'cardNumber',
  'cvv',
  'cvc',
  'account_number',
  'accountNumber',
  'routing_number',
  'routingNumber',
  'iban',

  // Redis/Upstash specific
  'redis_url',
  'redisUrl',
  'redis_token',
  'redisToken',
  'qstash_token',
  'qstashToken',
  'upstash_redis_rest_url',
  'upstash_redis_rest_token',
]);

/**
 * Patterns to match sensitive data in strings
 */
const SENSITIVE_PATTERNS = [
  // API Keys and tokens (alphanumeric strings of certain lengths)
  { pattern: /\b[A-Za-z0-9]{32,}\b/g, replacement: '[REDACTED_TOKEN]' },

  // URLs with credentials
  { pattern: /([a-zA-Z]+:\/\/)([^:]+):([^@]+)#/g, replacement: '$1[REDACTED]:[REDACTED]@' },

  // Email addresses (partial masking)
  {
    pattern: /\b([a-zA-Z0-9._%+-]{1,3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    replacement: '$1***@$2',
  },

  // Credit card numbers
  { pattern: /\b(\d{4})[\s-]?\d{4}[\s-]?\d{4}[\s-]?(\d{4})\b/g, replacement: '$1-****-****-$2' },

  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' },

  // Phone numbers
  { pattern: /\b(\d{3})[-.\s]?\d{3}[-.\s]?(\d{4})\b/g, replacement: '$1-***-$2' },
];

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  return (
    SENSITIVE_FIELDS.has(lowerFieldName) ||
    Array.from(SENSITIVE_FIELDS).some((sensitive: any) => lowerFieldName.includes(sensitive))
  );
}

/**
 * Mask sensitive data in a string
 */
function maskString(value: string): string {
  let masked = value;

  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, replacement);
  }

  return masked;
}

/**
 * Mask sensitive data in an object recursively
 */
export function maskSensitiveData<T>(data: T, depth = 0, maxDepth = 10): T {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return '[MAX_DEPTH_REACHED]' as T;
  }

  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    return maskString(data) as T;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item: any) => maskSensitiveData(item, depth + 1, maxDepth)) as T;
  }

  // Handle objects
  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Check if the field name indicates sensitive data
      if (isSensitiveField(key)) {
        masked[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        // Still check string values for patterns
        masked[key] = maskString(value);
      } else {
        // Recursively mask nested objects
        masked[key] = maskSensitiveData(value, depth + 1, maxDepth);
      }
    }

    return masked as T;
  }

  // Return other types as-is
  return data;
}

/**
 * Create a masked error for logging
 */
export function createMaskedError(error: Error): Error {
  const maskedError = new Error(maskString((error as Error)?.message || 'Unknown error'));
  maskedError.name = error.name;
  maskedError.stack = error.stack ? maskString(error.stack) : undefined;

  // Copy and mask any additional properties
  for (const key of Object.keys(error)) {
    if (key !== 'name' && key !== 'message' && key !== 'stack') {
      const errorAsRecord = error as unknown as Record<string, unknown>;
      (maskedError as unknown as Record<string, unknown>)[key] = maskSensitiveData(
        errorAsRecord[key],
      );
    }
  }

  return maskedError;
}

/**
 * Safe console logging that masks sensitive data
 */
export const safeConsole = {
  log: (..._args: unknown[]) => {
    // console.info(...args.map((arg: any) => _maskSensitiveData(arg)));
  },

  error: (..._args: unknown[]) => {
    // console.error(
    //   ...args.map((arg: any) =>
    //     arg instanceof Error ? _createMaskedError(arg) : _maskSensitiveData(arg),
    //   ),
    // );
  },

  warn: (..._args: unknown[]) => {
    // console.warn(...args.map((arg: any) => _maskSensitiveData(arg)));
  },

  info: (..._args: unknown[]) => {
    // console.info(...args.map((arg: any) => _maskSensitiveData(arg)));
  },

  debug: (..._args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // console.debug(...args.map((arg: any) => _maskSensitiveData(arg)));
    }
  },
};

/**
 * Create a safe logger instance
 */
export function createSafeLogger(prefix?: string) {
  const logPrefix = prefix ? `[${prefix}] ` : '';

  return {
    log: (message: string, ...args: unknown[]) => {
      safeConsole.log(logPrefix + message, ...args);
    },

    error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
      if (error instanceof Error) {
        safeConsole.error(logPrefix + message, createMaskedError(error), ...args);
      } else {
        safeConsole.error(logPrefix + message, maskSensitiveData(error), ...args);
      }
    },

    warn: (message: string, ...args: unknown[]) => {
      safeConsole.warn(logPrefix + message, ...args);
    },

    info: (message: string, ...args: unknown[]) => {
      safeConsole.info(logPrefix + message, ...args);
    },

    debug: (message: string, ...args: unknown[]) => {
      safeConsole.debug(logPrefix + message, ...args);
    },
  };
}

/**
 * Wrap a function to automatically mask any errors it throws
 */
export function withMaskedErrors<T extends (...args: unknown[]) => unknown>(
  fn: T,
  errorPrefix?: string,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error: any) {
      const prefix = errorPrefix ? `${errorPrefix}: ` : '';
      if (error instanceof Error) {
        throw createMaskedError(new Error(prefix + (error as Error)?.message || 'Unknown error'));
      }
      throw new Error(prefix + 'An unknown error occurred');
    }
  }) as T;
}

// Functions are already exported above
