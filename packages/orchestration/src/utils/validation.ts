/**
 * Centralized validation utilities
 */

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a record object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if object has own property
 */
export function hasOwnProperty<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return Object.hasOwn(obj, key);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required fields in payload
 */
export function validatePayload<T extends Record<string, any>>(
  payload: T | undefined,
  requiredFields: (keyof T)[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload || !isRecord(payload)) {
    errors.push('Missing or invalid request payload');
    return { valid: false, errors };
  }

  for (const field of requiredFields) {
    const value = payload[field];
    if (value === undefined || value === null) {
      errors.push(`Missing required field: ${String(field)}`);
    } else if (typeof field === 'string' && field.endsWith('Id') && !isNonEmptyString(value)) {
      errors.push(`Invalid value for field: ${String(field)} (must be non-empty string)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate array of items
 */
export function validateArray<T>(
  items: unknown,
  itemValidator?: (item: unknown) => item is T,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(items)) {
    errors.push('Value must be an array');
    return { valid: false, errors };
  }

  if (items.length === 0) {
    errors.push('Array cannot be empty');
    return { valid: false, errors };
  }

  if (itemValidator) {
    items.forEach((item, index) => {
      if (!itemValidator(item)) {
        errors.push(`Invalid item at index ${index}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe payload extraction with defaults
 */
export function extractPayload<T extends Record<string, any>>(
  context: { requestPayload?: T | null },
  defaults: Partial<T>,
): T {
  return {
    ...defaults,
    ...context.requestPayload,
  } as T;
}

/**
 * Validate numeric value within range
 */
export function validateNumber(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {},
): { valid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'Value must be a valid number' };
  }

  if (options.integer && !Number.isInteger(value)) {
    return { valid: false, error: 'Value must be an integer' };
  }

  if (options.min !== undefined && value < options.min) {
    return { valid: false, error: `Value must be at least ${options.min}` };
  }

  if (options.max !== undefined && value > options.max) {
    return { valid: false, error: `Value must be at most ${options.max}` };
  }

  return { valid: true };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    exact?: number;
  } = {},
): { valid: boolean; error?: string } {
  if (!isNonEmptyString(value)) {
    return { valid: false, error: 'Value must be a non-empty string' };
  }

  const length = value.length;

  if (options.exact !== undefined && length !== options.exact) {
    return { valid: false, error: `String must be exactly ${options.exact} characters` };
  }

  if (options.min !== undefined && length < options.min) {
    return { valid: false, error: `String must be at least ${options.min} characters` };
  }

  if (options.max !== undefined && length > options.max) {
    return { valid: false, error: `String must be at most ${options.max} characters` };
  }

  return { valid: true };
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
): { valid: boolean; error?: string; value?: T } {
  if (!validValues.includes(value as T)) {
    return {
      valid: false,
      error: `Value must be one of: ${validValues.join(', ')}`,
    };
  }

  return { valid: true, value: value as T };
}

/**
 * Composite validator for complex objects
 */
export interface ValidationRule<T> {
  field: keyof T;
  optional?: boolean;
  validator: (value: unknown) => { valid: boolean; error?: string };
}

export function validateObject<T extends Record<string, any>>(
  obj: unknown,
  rules: ValidationRule<T>[],
): { valid: boolean; errors: Record<keyof T, string> } {
  const errors: Partial<Record<keyof T, string>> = {};

  if (!isRecord(obj)) {
    return {
      valid: false,
      errors: { _root: 'Value must be an object' } as Record<keyof T, string>,
    };
  }

  for (const rule of rules) {
    const value = obj[rule.field as string];

    if (value === undefined || value === null) {
      if (!rule.optional) {
        errors[rule.field] = `${String(rule.field)} is required`;
      }
      continue;
    }

    const result = rule.validator(value);
    if (!result.valid) {
      errors[rule.field] = result.error || `Invalid ${String(rule.field)}`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors as Record<keyof T, string>,
  };
}
