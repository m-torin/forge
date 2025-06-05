/**
 * Data extraction utilities for scraping
 */

import type { SelectorMap, SelectorConfig, ExtractedData } from '../types/provider';

// Browser-agnostic extraction interface
export interface DOMAdapter {
  querySelector(selector: string): any;
  querySelectorAll(selector: string): any[];
  getAttribute(element: any, attribute: string): string | null;
  getTextContent(element: any): string;
  getInnerHTML(element: any): string;
}

/**
 * Extract data from HTML using selectors
 */
export function extractData(adapter: DOMAdapter, selectors: SelectorMap): ExtractedData {
  const result: ExtractedData = {};

  for (const [key, config] of Object.entries(selectors)) {
    try {
      const selectorConfig = normalizeSelectorConfig(config);
      const value = extractField(adapter, selectorConfig);

      if (value !== null || !selectorConfig.optional) {
        result[key] = value;
      }
    } catch (error) {
      if (!isOptionalField(config)) {
        throw new Error(`Failed to extract field "${key}": ${error}`);
      }
    }
  }

  return result;
}

/**
 * Extract a single field using selector configuration
 */
function extractField(adapter: DOMAdapter, config: SelectorConfig): any {
  const { selector, attribute, multiple, transform } = config;

  if (multiple) {
    const elements = adapter.querySelectorAll(selector);
    const values = elements.map((el) => getElementValue(adapter, el, attribute));
    return transform ? values.map(transform) : values;
  } else {
    const element = adapter.querySelector(selector);
    if (!element && !config.optional) {
      throw new Error(`Element not found: ${selector}`);
    }

    const value = element ? getElementValue(adapter, element, attribute) : null;
    return transform && value !== null ? transform(value) : value;
  }
}

/**
 * Get value from element based on attribute
 */
function getElementValue(adapter: DOMAdapter, element: any, attribute?: string): string | null {
  if (!attribute || attribute === 'text') {
    return adapter.getTextContent(element).trim();
  }

  if (attribute === 'html') {
    return adapter.getInnerHTML(element).trim();
  }

  return adapter.getAttribute(element, attribute);
}

/**
 * Normalize selector configuration
 */
function normalizeSelectorConfig(config: SelectorConfig | string): SelectorConfig {
  if (typeof config === 'string') {
    return {
      selector: config,
      attribute: 'text',
      multiple: false,
      optional: false,
    };
  }

  return {
    attribute: 'text',
    multiple: false,
    optional: false,
    ...config,
  };
}

/**
 * Check if field is optional
 */
function isOptionalField(config: SelectorConfig | string): boolean {
  if (typeof config === 'string') {
    return false;
  }
  return config.optional === true;
}

/**
 * Transform utilities
 */
export const transforms = {
  trim: (value: string) => value.trim(),

  toLowerCase: (value: string) => value.toLowerCase(),

  toUpperCase: (value: string) => value.toUpperCase(),

  toNumber: (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  },

  toBoolean: (value: string) => {
    const lower = value.toLowerCase().trim();
    return ['true', 'yes', '1', 'on'].includes(lower);
  },

  toDate: (value: string) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },

  extractPrice: (value: string) => {
    const match = value.match(/[\d,]+\.?\d*/);
    if (!match) return null;
    return parseFloat(match[0].replace(/,/g, ''));
  },

  extractEmail: (value: string) => {
    const match = value.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    return match ? match[0] : null;
  },

  extractUrl: (value: string) => {
    const match = value.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  },

  jsonParse: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
};

/**
 * Create a custom transform pipeline
 */
export function createTransform(...transforms: Array<(value: any) => any>) {
  return (value: any) => {
    return transforms.reduce((acc, transform) => {
      return acc !== null && acc !== undefined ? transform(acc) : acc;
    }, value);
  };
}

/**
 * Schema validation for extracted data
 */
export interface Schema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    items?: Schema;
    properties?: Schema;
  };
}

export function validateExtractedData(
  data: ExtractedData,
  schema: Schema,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Check required
    if (rules.required && (value === null || value === undefined)) {
      errors.push(`Field "${key}" is required`);
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    // Type validation
    if (!validateType(value, rules.type)) {
      errors.push(`Field "${key}" must be of type ${rules.type}`);
    }

    // Additional validations
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Field "${key}" must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Field "${key}" must be at most ${rules.max}`);
    }

    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(`Field "${key}" does not match required pattern`);
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Field "${key}" must be one of: ${rules.enum.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && !Array.isArray(value) && value !== null;
    case 'date':
      return value instanceof Date && !isNaN(value.getTime());
    default:
      return false;
  }
}
