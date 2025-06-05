/**
 * Core provider types for the scraping system
 */

export type ProviderType = 'browser' | 'html' | 'managed' | 'custom';

export type ScrapingCapability =
  | 'scrape'
  | 'extract'
  | 'screenshot'
  | 'pdf'
  | 'interact'
  | 'javascript'
  | 'proxy'
  | 'cookies'
  | 'concurrent'
  | 'stream'
  | 'captcha';

// Core scraping options
export interface ScrapeOptions {
  timeout?: number;
  waitForFunction?: string;
  // Navigation
  waitForSelector?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';

  // Resource blocking
  blockResources?: ResourceType[];

  executeScript?: () => any;
  // Extraction
  extract?: SelectorMap;

  // Authentication
  cookies?: Cookie[];
  headers?: Record<string, string>;
  proxy?: ProxyConfig;

  device?: string;
  locale?: string;
  timezone?: string;
  // Behavior
  userAgent?: string;
  viewport?: ViewportConfig;

  pdf?: boolean | PDFOptions;
  // Performance
  screenshot?: boolean | ScreenshotOptions;

  hint?: 'static' | 'dynamic' | 'protected';
  // Provider hint
  provider?: string;
}

// Result types
export interface ScrapeResult {
  data?: Record<string, any>;
  error?: Error;
  html: string;
  metadata: {
    title?: string;
    description?: string;
    contentType?: string;
    contentLength?: number;
    statusCode?: number;
    headers?: Record<string, string>;
    timing?: {
      start: number;
      end: number;
      duration: number;
    };
  };
  pdf?: Buffer;
  provider: string;
  screenshot?: Buffer;
  url: string;
}

// Extraction types
export interface SelectorConfig {
  attribute?: string | 'text' | 'html';
  multiple?: boolean;
  optional?: boolean;
  selector: string;
  transform?: (value: any) => any;
}

export type SelectorMap = Record<string, SelectorConfig | string>;

export type ExtractedData = Record<string, any>;

// Provider configuration
export interface ProviderConfig {
  config?: Record<string, any>;
  enabled?: boolean;
  instances?: number;
  name: string;
  priority?: number;
  type: ProviderType;
}

// Resource types
export type ResourceType =
  | 'document'
  | 'stylesheet'
  | 'image'
  | 'media'
  | 'font'
  | 'script'
  | 'texttrack'
  | 'xhr'
  | 'fetch'
  | 'eventsource'
  | 'websocket'
  | 'manifest'
  | 'other';

// Helper types
export interface Cookie {
  domain?: string;
  expires?: number;
  httpOnly?: boolean;
  name: string;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  value: string;
}

export interface ProxyConfig {
  bypass?: string[];
  password?: string;
  server: string;
  username?: string;
}

export interface ViewportConfig {
  deviceScaleFactor?: number;
  hasTouch?: boolean;
  height: number;
  isLandscape?: boolean;
  isMobile?: boolean;
  width: number;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  omitBackground?: boolean;
  quality?: number;
  selector?: string;
  type?: 'png' | 'jpeg' | 'webp';
}

export interface PDFOptions {
  format?:
    | 'Letter'
    | 'Legal'
    | 'Tabloid'
    | 'Ledger'
    | 'A0'
    | 'A1'
    | 'A2'
    | 'A3'
    | 'A4'
    | 'A5'
    | 'A6';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

// Interaction types
export interface InteractionStep {
  options?: Record<string, any>;
  selector?: string;
  type: 'click' | 'type' | 'scroll' | 'wait' | 'hover' | 'select' | 'press' | 'screenshot';
  value?: string | number;
}

export interface InteractionResult {
  data?: ExtractedData;
  finalHtml?: string;
  steps: {
    step: InteractionStep;
    success: boolean;
    error?: Error;
    duration?: number;
  }[];
  success: boolean;
}

// Multi-scrape types
export interface MultiScrapeOptions extends ScrapeOptions {
  concurrent?: number;
  continueOnError?: boolean;
  distribution?: Record<string, number>;
  onProgress?: (url: string, index: number, total: number, result?: ScrapeResult) => void;
}

// Provider interface
export interface ScrapingProvider {
  readonly capabilities: Set<ScrapingCapability>;
  readonly name: string;
  readonly type: ProviderType;

  extract(html: string, selectors: SelectorMap): Promise<ExtractedData>;
  // Core methods
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;

  interact?(url: string, actions: InteractionStep[]): Promise<InteractionResult>;
  pdf?(url: string, options?: PDFOptions): Promise<Buffer>;
  scrapeMultiple?(
    urls: string[],
    options?: MultiScrapeOptions,
  ): AsyncIterableIterator<ScrapeResult>;
  // Optional capabilities
  screenshot?(url: string, options?: ScreenshotOptions): Promise<Buffer>;

  dispose?(): Promise<void>;
  healthCheck?(): Promise<boolean>;
  // Lifecycle
  initialize?(): Promise<void>;

  // Metadata
  getMetrics?(): Promise<ProviderMetrics>;
}

// Provider metrics
export interface ProviderMetrics {
  averageResponseTime: number;
  customMetrics?: Record<string, any>;
  failedRequests: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastUsed?: Date;
  successfulRequests: number;
  totalRequests: number;
}

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

export interface MiddlewareContext {
  error?: Error;
  options: ScrapeOptions;
  provider: string;
  result?: ScrapeResult;
  timing: {
    start: number;
    end?: number;
  };
  url: string;
}
