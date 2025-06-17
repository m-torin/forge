/**
 * Core provider types for the scraping system
 */

// Helper types
export interface Cookie {
  domain?: string;
  expires?: number;
  httpOnly?: boolean;
  name: string;
  path?: string;
  sameSite?: 'Lax' | 'None' | 'Strict';
  secure?: boolean;
  value: string;
}

export type ExtractedData = Record<string, any>;

export interface InteractionResult {
  data?: ExtractedData;
  finalHtml?: string;
  steps: {
    duration?: number;
    error?: Error;
    step: InteractionStep;
    success: boolean;
  }[];
  success: boolean;
}

// Interaction types
export interface InteractionStep {
  options?: Record<string, any>;
  selector?: string;
  type: 'click' | 'hover' | 'press' | 'screenshot' | 'scroll' | 'select' | 'type' | 'wait';
  value?: number | string;
}

export interface MiddlewareContext {
  error?: Error;
  options: ScrapeOptions;
  provider: string;
  result?: ScrapeResult;
  timing: {
    end?: number;
    start: number;
  };
  url: string;
}

// Multi-scrape types
export interface MultiScrapeOptions extends ScrapeOptions {
  concurrent?: number;
  continueOnError?: boolean;
  distribution?: Record<string, number>;
  onProgress?: (url: string, index: number, total: number, result?: ScrapeResult) => void;
}

export interface PDFOptions {
  format?:
    | 'A0'
    | 'A1'
    | 'A2'
    | 'A3'
    | 'A4'
    | 'A5'
    | 'A6'
    | 'Ledger'
    | 'Legal'
    | 'Letter'
    | 'Tabloid';
  landscape?: boolean;
  margin?: {
    bottom?: string;
    left?: string;
    right?: string;
    top?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

// Provider configuration
export interface ProviderConfig {
  config?: Record<string, any>;
  enabled?: boolean;
  instances?: number;
  name: string;
  priority?: number;
  type: ProviderType;
}

// Provider metrics
export interface ProviderMetrics {
  averageResponseTime: number;
  customMetrics?: Record<string, any>;
  failedRequests: number;
  health: 'degraded' | 'healthy' | 'unhealthy';
  lastUsed?: Date;
  successfulRequests: number;
  totalRequests: number;
}

export type ProviderType = 'browser' | 'custom' | 'html' | 'managed';

export interface ProxyConfig {
  bypass?: string[];
  password?: string;
  server: string;
  username?: string;
}

// Resource types
export type ResourceType =
  | 'document'
  | 'eventsource'
  | 'fetch'
  | 'font'
  | 'image'
  | 'manifest'
  | 'media'
  | 'other'
  | 'script'
  | 'stylesheet'
  | 'texttrack'
  | 'websocket'
  | 'xhr';

// Core scraping options
export interface ScrapeOptions {
  // Resource blocking
  blockResources?: ResourceType[];
  // Authentication
  cookies?: Cookie[];
  device?: string;
  executeScript?: () => any;

  // Extraction
  extract?: SelectorMap;

  headers?: Record<string, string>;
  hint?: 'dynamic' | 'protected' | 'static';

  locale?: string;
  pdf?: boolean | PDFOptions;
  // Provider hint
  provider?: string;

  proxy?: ProxyConfig;
  // Performance
  screenshot?: boolean | ScreenshotOptions;
  timeout?: number;
  timezone?: string;
  // Behavior
  userAgent?: string;

  viewport?: ViewportConfig;
  waitForFunction?: string;

  // Navigation
  waitForSelector?: string;
  waitUntil?: 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2';
}

// Result types
export interface ScrapeResult {
  data?: Record<string, any>;
  error?: Error;
  html: string;
  metadata: {
    contentLength?: number;
    contentType?: string;
    description?: string;
    headers?: Record<string, string>;
    statusCode?: number;
    timing?: {
      duration: number;
      end: number;
      start: number;
    };
    title?: string;
  };
  pdf?: Buffer;
  provider: string;
  screenshot?: Buffer;
  url: string;
}

export type ScrapingCapability =
  | 'captcha'
  | 'concurrent'
  | 'cookies'
  | 'extract'
  | 'interact'
  | 'javascript'
  | 'pdf'
  | 'proxy'
  | 'scrape'
  | 'screenshot'
  | 'stream';

// Manager configuration
export interface ScrapingManagerConfig {
  defaults?: Partial<ScrapeOptions>;
  middleware?: ScrapingMiddleware[];
  providers: ProviderConfig[];
  resources?: {
    maxConcurrent?: number;
    maxMemory?: string;
    recycleAfter?: number;
  };
  routing?: Record<string, string>;
  telemetry?: {
    enabled?: boolean;
    endpoint?: string;
  };
}

// Middleware
export type ScrapingMiddleware = (context: MiddlewareContext) => Promise<void>;

// Provider interface
export interface ScrapingProvider {
  readonly capabilities: Set<ScrapingCapability>;
  dispose?(): Promise<void>;
  extract(html: string, selectors: SelectorMap): Promise<ExtractedData>;

  // Metadata
  getMetrics?(): Promise<ProviderMetrics>;
  healthCheck?(): Promise<boolean>;

  // Lifecycle
  initialize?(): Promise<void>;
  interact?(url: string, actions: InteractionStep[]): Promise<InteractionResult>;
  readonly name: string;
  pdf?(url: string, options?: PDFOptions): Promise<Buffer>;

  // Core methods
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;
  scrapeMultiple?(
    urls: string[],
    options?: MultiScrapeOptions,
  ): AsyncIterableIterator<ScrapeResult>;
  // Optional capabilities
  screenshot?(url: string, options?: ScreenshotOptions): Promise<Buffer>;

  readonly type: ProviderType;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  omitBackground?: boolean;
  quality?: number;
  selector?: string;
  type?: 'jpeg' | 'png' | 'webp';
}

// Extraction types
export interface SelectorConfig {
  attribute?: string;
  multiple?: boolean;
  optional?: boolean;
  selector: string;
  transform?: (value: any) => any;
}

export type SelectorMap = Record<string, SelectorConfig | string>;

export interface ViewportConfig {
  deviceScaleFactor?: number;
  hasTouch?: boolean;
  height: number;
  isLandscape?: boolean;
  isMobile?: boolean;
  width: number;
}
