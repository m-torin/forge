/**
 * Core types for the multi-provider scraping system
 */

// Re-import provider types first
import type {
  Cookie,
  ExtractedData,
  MultiScrapeOptions,
  PDFOptions,
  ProviderType,
  ProxyConfig,
  ResourceType,
  ScrapeOptions,
  ScrapeResult,
  ScreenshotOptions,
  SelectorConfig,
  SelectorMap,
  ViewportConfig,
} from './provider';

export interface ProviderConfig {
  // Provider-specific required fields
  apiKey?: string;
  endpoint?: string;
  token?: string;

  options?: Record<string, any>;
  retries?: number;
  // Optional configuration
  timeout?: number;
  userAgent?: string;
}

export interface ScrapingProvider {
  readonly name: string;
  readonly type: 'browser' | 'html' | 'managed' | 'custom';

  extract(html: string, selectors: SelectorMap): Promise<ExtractedData>;
  initialize(config: ProviderConfig): Promise<void>;
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;

  dispose?(): Promise<void>;
  healthCheck?(): Promise<boolean>;
  pdf?(url: string, options?: PDFOptions): Promise<Buffer>;
  // Optional methods - screenshot for browser providers doesn't take URL
  screenshot?(options?: ScreenshotOptions): Promise<Buffer>;
}

export interface ScrapingContext {
  attempt: number;
  maxAttempts: number;
  options: any;
  provider: string;
  startTime: number;
  url: string;
}

export interface ScrapingConfig {
  debug?: boolean;
  defaults?: Partial<ScrapeOptions>;
  onError?: (
    error: unknown,
    context: { provider: string; method: string; [key: string]: any },
  ) => void;
  onInfo?: (message: string) => void;
  providers: Record<string, ProviderConfig>;

  // Resource management
  resources?: {
    maxConcurrent?: number;
    maxMemory?: string;
    recycleAfter?: number;
  };
}

export type ProviderRegistry = Record<string, (config: ProviderConfig) => ScrapingProvider>;

export interface ScrapingManager {
  dispose(): Promise<void>;
  extract(html: string, selectors: SelectorMap, provider?: string): Promise<ExtractedData>;
  getMetrics(): Promise<Record<string, any>>;
  healthCheck(): Promise<Record<string, boolean>>;
  initialize(): Promise<void>;
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;
  scrapeMultiple(urls: string[], options?: MultiScrapeOptions): Promise<ScrapeResult[]>;
  scrapeStream(urls: string[], options?: MultiScrapeOptions): AsyncIterableIterator<ScrapeResult>;
}

// Re-export existing types
export type {
  Cookie,
  ExtractedData,
  MultiScrapeOptions,
  PDFOptions,
  ProviderType,
  ProxyConfig,
  ResourceType,
  ScrapeOptions,
  ScrapeResult,
  ScreenshotOptions,
  SelectorConfig,
  SelectorMap,
  ViewportConfig,
};

// Add missing types from original package
export type ExtractionResult = Record<string, string | string[] | null>;

// Error types from original package
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
