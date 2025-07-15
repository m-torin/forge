/**
 * Configuration utilities for observability
 * Deep merging and config validation helpers
 */

/**
 * Deep merge utility for configuration objects
 * Handles nested objects, arrays, and prevents prototype pollution
 */
export function deepMerge<T = any>(target: T, source: Partial<T>): T {
  // Handle null/undefined
  if (!source || typeof source !== 'object') {
    return target;
  }

  if (!target || typeof target !== 'object') {
    return source as T;
  }

  // Handle arrays - replace instead of merge for simplicity
  if (Array.isArray(source)) {
    return source as T;
  }

  if (Array.isArray(target)) {
    return source as T;
  }

  // Create result object
  const result = { ...target } as any;

  // Deep merge each property
  for (const key in source) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = (target as any)[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      // Recursively merge nested objects
      result[key] = deepMerge(targetValue || {}, sourceValue);
    } else {
      // Direct assignment for primitives, arrays, and null values
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Merge multiple configuration objects with deep merging
 */
export function mergeConfigs<T>(...configs: Array<Partial<T> | undefined>): T {
  let result = {} as T;

  for (const config of configs) {
    if (config) {
      result = deepMerge(result, config);
    }
  }

  return result;
}

/**
 * Deep clone an object (useful for preventing mutation)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: any) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Check if a value is a plain object (not array, date, etc.)
 */
export function isPlainObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Merge observability contexts with deep merging for nested objects
 */
export function mergeObservabilityContext(
  base: Record<string, any> | undefined = {},
  override: Record<string, any> | undefined = {},
): Record<string, any> {
  if (!base && !override) return {};
  if (!base) return override;
  if (!override) return base;

  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Prevent prototype pollution
    }

    if (isPlainObject(value) && isPlainObject(result[key])) {
      // Deep merge for nested objects
      result[key] = deepMerge(result[key], value);
    } else {
      // Direct assignment for primitives, arrays, etc.
      result[key] = value;
    }
  }

  return result;
}

/**
 * Validate and normalize configuration values
 */
export function normalizeConfig<T extends Record<string, any>>(
  config: T,
  defaults: Partial<T> = {},
): T {
  // Start with defaults
  const normalized = deepClone(defaults) as T;

  // Deep merge with provided config
  return deepMerge(normalized, config);
}

/**
 * Safe config accessor with fallback
 */
export function getConfigValue<T>(config: Record<string, any>, path: string, fallback: T): T {
  const keys = path.split('.');
  let current = config;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }

  return current as T;
}

/**
 * Set config value at nested path
 */
export function setConfigValue(
  config: Record<string, any>,
  path: string,
  value: any,
): Record<string, any> {
  const result = deepClone(config);
  const keys = path.split('.');
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Create default observability configuration
 */
export function createDefaultConfig(overrides: any = {}): any {
  const defaults = {
    debug: false,
    providers: {
      console: {
        type: 'console',
        enabled: true,
        logLevel: 'info',
      },
    },
  };

  return deepMerge(defaults, overrides);
}

/**
 * Normalize provider configuration with defaults
 */
export function normalizeProviderConfig(name: string, config: any): any {
  const defaults = {
    logLevel: 'info',
    enabled: true,
  };

  return { ...defaults, ...config };
}

/**
 * Validate configuration structure
 */
export function validateConfigStructure(config: any): { valid: boolean; errors: any[] } {
  const errors: any[] = [];

  if (!config) {
    errors.push({ field: 'config', message: 'Configuration is required' });
    return { valid: false, errors };
  }

  if (!config.providers) {
    errors.push({ field: 'providers', message: 'Providers field is required' });
    return { valid: false, errors };
  }

  if (typeof config.providers !== 'object' || Array.isArray(config.providers)) {
    errors.push({ field: 'providers', message: 'Providers must be an object' });
    return { valid: false, errors };
  }

  const providerKeys = Object.keys(config.providers);
  if (providerKeys.length === 0) {
    errors.push({ field: 'providers', message: 'Must have at least one provider configured' });
    return { valid: false, errors };
  }

  // Validate each provider
  for (const [name, providerConfig] of Object.entries(config.providers)) {
    if (!providerConfig || typeof providerConfig !== 'object') {
      errors.push({ field: `providers.${name}`, message: 'Provider config must be an object' });
      continue;
    }

    const provider = providerConfig as any;
    if (!provider.type) {
      errors.push({ field: `providers.${name}.type`, message: 'Provider type is required' });
    } else if (!['console', 'sentry', 'logtail', 'opentelemetry'].includes(provider.type)) {
      errors.push({
        field: `providers.${name}.type`,
        message: `Unknown provider type: ${provider.type}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
