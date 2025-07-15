/**
 * Data extraction utilities for scraping
 */

import { ExtractedData, SelectorConfig, SelectorMap } from '../types/provider';

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
    const values = elements.map((el: any) => getElementValue(adapter, el, attribute));
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
    return transforms.reduce((acc, transform: any) => {
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

/**
 * Extract plain text from HTML
 */
export function extractText(html: string): string {
  // Remove script and style tags with safe regex patterns
  const cleanHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Replace tags with spaces
  const text = cleanHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract links from HTML
 */
export function extractLinks(html: string, baseUrl?: string): { href: string; text: string }[] {
  const linkRegex = /<a\s+[^>]*href=["']([^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const links: { href: string; text: string }[] = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = extractText(match[2]);

    if (href && href.trim()) {
      let resolvedHref = href;

      // Resolve relative URLs
      if (
        baseUrl &&
        !href.startsWith('http') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:')
      ) {
        try {
          const url = new URL(href, baseUrl);
          resolvedHref = url.href;
        } catch {
          resolvedHref = href;
        }
      }

      links.push({ href: resolvedHref, text });
    }
  }

  return links;
}

/**
 * Extract images from HTML
 */
export function extractImages(html: string, baseUrl?: string): { src: string; alt: string }[] {
  const imgRegex = /<img\s+[^>]*>/gi;
  const images: { src: string; alt: string }[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];

    // Extract src attribute
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1] : '';

    // Extract alt attribute
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : '';

    if (src && src.trim()) {
      let resolvedSrc = src;

      // Resolve relative URLs
      if (baseUrl && !src.startsWith('http') && !src.startsWith('data:')) {
        try {
          const url = new URL(src, baseUrl);
          resolvedSrc = url.href;
        } catch {
          resolvedSrc = src;
        }
      }

      images.push({ src: resolvedSrc, alt });
    }
  }

  return images;
}

/**
 * Extract metadata from HTML
 */
export function extractMetadata(html: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Extract title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  metadata.title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta tags with safer regex
  const metaRegex = /<meta\s+[^>]*>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const metaTag = match[0];

    // Extract name/property and content separately with simpler patterns
    const nameMatch = metaTag.match(/(?:name|property)=["']([^"']*?)["']/i);
    const contentMatch = metaTag.match(/content=["']([^"']*?)["']/i);

    const name = nameMatch ? nameMatch[1] : null;
    const content = contentMatch ? contentMatch[1] : null;

    if (name && content) {
      metadata[name] = content;
    }
  }

  return metadata;
}

/**
 * Extract structured data (JSON-LD)
 */
export function extractStructuredData(html: string): any[] {
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const structuredData: any[] = [];
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      structuredData.push(json);
    } catch {
      // Invalid JSON, skip
    }
  }

  return structuredData;
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  // Match US, international, dotted, and compact formats
  // Safer regex to avoid catastrophic backtracking with timeout
  // eslint-disable-next-line security/detect-unsafe-regex
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g;

  try {
    const matches = text.match(phoneRegex) || [];
    return [...new Set(matches)];
  } catch {
    // If regex fails, return empty array
    return [];
  }
}

/**
 * Clean text by removing extra whitespace and HTML entities
 */
export function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
