import { z } from 'zod';

// Common scraping options
export const ScrapingOptionsSchema = z.object({
  url: z.string().url(),
  blockedResourceTypes: z.array(z.string()).optional(),
  cookies: z
    .array(
      z.object({
        name: z.string(),
        domain: z.string().optional(),
        expires: z.number().optional(),
        httpOnly: z.boolean().optional(),
        path: z.string().optional(),
        sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
        secure: z.boolean().optional(),
        value: z.string(),
      }),
    )
    .optional(),
  fullPage: z.boolean().default(false),
  headers: z.record(z.string()).optional(),
  javascript: z.boolean().default(true),
  proxy: z
    .object({
      username: z.string().optional(),
      password: z.string().optional(),
      server: z.string(),
    })
    .optional(),
  screenshot: z.boolean().default(false),
  userAgent: z.string().optional(),
  viewport: z
    .object({
      width: z.number().default(1920),
      height: z.number().default(1080),
    })
    .optional(),
  waitForSelector: z.string().optional(),
  waitForTimeout: z.number().default(30000),
});

export type ScrapingOptions = z.infer<typeof ScrapingOptionsSchema>;

// Scraping result
export interface ScrapingResult {
  error?: string;
  html: string;
  metadata: {
    title?: string;
    description?: string;
    statusCode?: number;
    headers?: Record<string, string>;
    timing: {
      start: number;
      end: number;
      duration: number;
    };
  };
  screenshot?: Buffer;
  url: string;
}

// Selector extraction
export type SelectorMap = Record<string, string | SelectorConfig>;

export interface SelectorConfig {
  attribute?: string;
  multiple?: boolean;
  selector: string;
  transform?: 'text' | 'html' | 'href' | 'src' | 'value';
}

export type ExtractionResult = Record<string, string | string[] | null>;

// Browser instance management
export interface BrowserManager {
  close(): Promise<void>;
  extract(html: string, selectors: SelectorMap): ExtractionResult;
  isHealthy(): Promise<boolean>;
  launch(): Promise<void>;
  scrape(options: ScrapingOptions): Promise<ScrapingResult>;
}

// Scraping engine types
export type ScrapingEngine = 'puppeteer' | 'playwright' | 'hero';

export interface ScrapingEngineConfig {
  args?: string[];
  engine: ScrapingEngine;
  executablePath?: string;
  headless?: boolean;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Advanced scraping features
export interface InteractionStep {
  delay?: number;
  options?: Record<string, unknown>;
  selector?: string;
  type: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'wait';
  value?: string;
}

export interface ScrapingSession {
  completed: string[];
  endTime?: number;
  failed: string[];
  id: string;
  results: Map<string, ScrapingResult>;
  startTime: number;
  urls: string[];
}

// Error types
export class ScrapingError extends Error {
  constructor(
    message: string,
    public code: string,
    public url?: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export const ScrapingErrorCodes = {
  BLOCKED_BY_ROBOTS: 'BLOCKED_BY_ROBOTS',
  BROWSER_LAUNCH_FAILED: 'BROWSER_LAUNCH_FAILED',
  CAPTCHA_DETECTED: 'CAPTCHA_DETECTED',
  INVALID_URL: 'INVALID_URL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PAGE_LOAD_FAILED: 'PAGE_LOAD_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  SELECTOR_NOT_FOUND: 'SELECTOR_NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
} as const;

// Utility types
export type PromiseOrValue<T> = T | Promise<T>;
