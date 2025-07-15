/**
 * Validation utilities for scraping
 */

import { z } from 'zod/v4';

import { ConfigurationError } from '../errors';
import { ProviderConfig, ScrapeOptions } from '../types/provider';
import { ScrapingConfig } from '../types/scraping-types';

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    // URL parsing failures are expected for invalid URLs, so we return false
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    throw new ConfigurationError(`Invalid URL: ${url}`);
  }
}

/**
 * Selector validation
 */
export function isValidSelector(selector: string): boolean {
  try {
    // Basic validation - could be enhanced
    if (!selector || typeof selector !== 'string') {
      return false;
    }

    // Check for common invalid patterns
    const invalidPatterns = [
      /^\d/, // Starts with number
      /\s{2,}/, // Multiple spaces
      /[<>]/, // HTML tags
    ];

    return !invalidPatterns.some((pattern: any) => pattern.test(selector));
  } catch {
    return false;
  }
}

/**
 * Options validation schemas
 */
const cookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string().optional(),
  path: z.string().optional(),
  expires: z.number().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
});

const proxySchema = z.object({
  server: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  bypass: z.array(z.string()).optional(),
});

const viewportSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  deviceScaleFactor: z.number().positive().optional(),
  isMobile: z.boolean().optional(),
  hasTouch: z.boolean().optional(),
  isLandscape: z.boolean().optional(),
});

const screenshotOptionsSchema = z.object({
  fullPage: z.boolean().optional(),
  selector: z.string().optional(),
  type: z.enum(['png', 'jpeg', 'webp']).optional(),
  quality: z.number().min(0).max(100).optional(),
  omitBackground: z.boolean().optional(),
});

const scrapeOptionsSchema = z.object({
  // Navigation
  waitForSelector: z.string().optional(),
  waitForFunction: z.string().optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  timeout: z.number().positive().optional(),

  // Resource blocking
  blockResources: z
    .array(
      z.enum([
        'document',
        'stylesheet',
        'image',
        'media',
        'font',
        'script',
        'texttrack',
        'xhr',
        'fetch',
        'eventsource',
        'websocket',
        'manifest',
        'other',
      ]),
    )
    .optional(),

  // Authentication
  cookies: z.array(cookieSchema).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  proxy: proxySchema.optional(),

  // Behavior
  userAgent: z.string().optional(),
  viewport: viewportSchema.optional(),
  device: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),

  // Performance
  screenshot: z.union([z.boolean(), screenshotOptionsSchema]).optional(),

  // Provider hint
  provider: z.string().optional(),
  hint: z.enum(['static', 'dynamic', 'protected']).optional(),
});

/**
 * Validate scrape options
 */
export function validateScrapeOptions(options: unknown): ScrapeOptions {
  try {
    return scrapeOptionsSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ConfigurationError(`Invalid scrape options: ${issues}`);
    }
    throw error;
  }
}

/**
 * Provider configuration validation
 */
const providerConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['browser', 'html', 'managed', 'custom']),
  priority: z.number().optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
  instances: z.number().positive().optional(),
});

export function validateProviderConfig(config: unknown): ProviderConfig {
  try {
    return providerConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ConfigurationError(`Invalid provider configuration: ${issues}`);
    }
    throw error;
  }
}

/**
 * Scraping configuration validation
 */
const scrapingConfigSchema = z.object({
  providers: z.record(
    z.string(),
    z.object({
      apiKey: z.string().optional(),
      endpoint: z.string().optional(),
      token: z.string().optional(),
      timeout: z.number().optional(),
      retries: z.number().optional(),
      userAgent: z.string().optional(),
      options: z.record(z.string(), z.any()).optional(),
    }),
  ),
  debug: z.boolean().optional(),
  defaults: z
    .object({
      timeout: z.number().positive().optional(),
      retries: z.number().min(0).optional(),
      retryDelay: z.number().min(0).optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
  resources: z
    .object({
      maxConcurrent: z.number().positive().optional(),
      maxMemory: z.string().optional(),
      recycleAfter: z.number().positive().optional(),
    })
    .optional(),
  onError: z.any().optional(),
  onInfo: z.any().optional(),
});

export function validateScrapingConfig(config: unknown): ScrapingConfig {
  try {
    return scrapingConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ConfigurationError(`Invalid scraping configuration: ${issues}`);
    }
    throw error;
  }
}

/**
 * Content type validation
 */
export function isHtmlContent(contentType?: string): boolean {
  if (!contentType) return true;
  return contentType.toLowerCase().includes('text/html');
}

export function isJsonContent(contentType?: string): boolean {
  if (!contentType) return false;
  return contentType.toLowerCase().includes('application/json');
}

/**
 * Resource validation
 */
export function parseMemoryLimit(limit: string): number {
  // Use string parsing instead of regex to avoid security warnings
  const trimmed = limit.trim().toUpperCase();

  // Extract numeric part using string manipulation instead of regex
  let numericString = '';
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if ((char >= '0' && char <= '9') || char === '.') {
      numericString += char;
    } else {
      break;
    }
  }

  if (!numericString) {
    throw new ConfigurationError(`Invalid memory limit: ${limit}`);
  }

  const value = parseFloat(numericString);

  // Determine unit
  let unit = 'B';
  if (trimmed.endsWith('KB')) unit = 'KB';
  else if (trimmed.endsWith('MB')) unit = 'MB';
  else if (trimmed.endsWith('GB')) unit = 'GB';
  else if (trimmed.endsWith('TB')) unit = 'TB';

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  return value * multipliers[unit];
}

/**
 * Robots.txt validation
 */
export function canScrapeUrl(url: string, robotsTxt?: string): boolean {
  if (!robotsTxt) return true;

  // Simple robots.txt parser - could be enhanced
  const lines = robotsTxt.split('\n');
  const rules: Array<{ allow: boolean; path: string }> = [];
  let currentUserAgent = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) continue;

    const [key, value] = trimmed.split(':').map((s: any) => s.trim());

    if (key.toLowerCase() === 'user-agent') {
      currentUserAgent = value.toLowerCase();
    } else if (currentUserAgent === '*' || currentUserAgent === 'bot') {
      if (key.toLowerCase() === 'disallow') {
        rules.push({ allow: false, path: value });
      } else if (key.toLowerCase() === 'allow') {
        rules.push({ allow: true, path: value });
      }
    }
  }

  const urlPath = new URL(url).pathname;

  // Check rules in order
  for (const rule of rules) {
    if (urlPath.startsWith(rule.path)) {
      return rule.allow;
    }
  }

  return true;
}

/**
 * Additional validation functions and types for compatibility
 */

/**
 * Validate provider name
 */
export function validateProvider(provider: string): boolean {
  const validProviders = [
    'playwright',
    'puppeteer',
    'hero',
    'cheerio',
    'node-fetch',
    'fetch',
    'console',
  ];
  return validProviders.includes(provider);
}

/**
 * Validate configuration and throw if invalid
 */
export function validateConfigOrThrow(config: any): void {
  try {
    validateScrapingConfig(config);
  } catch (error) {
    throw new ConfigurationError(
      `Configuration validation failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
}

/**
 * Debug configuration utility
 */
export function debugConfig(config: any): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}
