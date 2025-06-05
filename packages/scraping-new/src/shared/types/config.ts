/**
 * Configuration types for the scraping system
 */

import type { ProviderConfig, ScrapeOptions, ScrapingMiddleware } from './provider';

// Global configuration
export interface ScrapingConfig {
  providers: ProviderConfig[];

  // Default options applied to all scrapes
  defaults?: ScrapingDefaults;

  // Routing rules for automatic provider selection
  routing?: RoutingConfig;

  // Resource management
  resources?: ResourceConfig;

  // Middleware pipeline
  middleware?: ScrapingMiddleware[];

  // Telemetry and monitoring
  telemetry?: TelemetryConfig;

  // Error handling
  errorHandling?: ErrorHandlingConfig;
}

export interface ScrapingDefaults extends Partial<ScrapeOptions> {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
}

export interface RoutingConfig {
  default?: string;
  fallback?: string;
  rules?: RoutingRule[];
}

export interface RoutingRule {
  hint?: 'static' | 'dynamic' | 'protected';
  pattern?: string | RegExp;
  priority?: number;
  provider: string;
}

export interface ResourceConfig {
  instancesPerProvider?: Record<string, number>;
  maxConcurrent?: number;
  maxMemory?: string;
  recycleAfter?: number;
}

export interface TelemetryConfig {
  apiKey?: string;
  enabled?: boolean;
  endpoint?: string;
  includeErrors?: boolean;
  includeTimings?: boolean;
  sampleRate?: number;
}

export interface ErrorHandlingConfig {
  backoffMultiplier?: number;
  maxRetries?: number;
  onError?: (error: Error, context: ErrorContext) => void | Promise<void>;
  retryOn?: string[];
}

export interface ErrorContext {
  attempt: number;
  options: ScrapeOptions;
  provider: string;
  url: string;
}

// Provider-specific configurations
export interface BrowserProviderConfig {
  args?: string[];
  defaultViewport?: {
    width: number;
    height: number;
  };
  devtools?: boolean;
  executablePath?: string;
  headless?: boolean;
  ignoreDefaultArgs?: string[];
  slowMo?: number;
}

export interface PlaywrightProviderConfig extends BrowserProviderConfig {
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  channel?: string;
}

export interface PuppeteerProviderConfig extends BrowserProviderConfig {
  product?: 'chrome' | 'firefox';
  protocol?: 'cdp' | 'webDriverBiDi';
}

export interface HeroProviderConfig extends BrowserProviderConfig {
  disableDevtools?: boolean;
  showChrome?: boolean;
  userProfile?: string;
}

export interface CheerioProviderConfig {
  decodeEntities?: boolean;
  normalizeWhitespace?: boolean;
  // Cheerio-specific options
  xml?: boolean;
}

export interface ManagedProviderConfig {
  apiEndpoint?: string;
  apiKey: string;
  maxRequestsPerSecond?: number;
  timeout?: number;
}

export interface ScrapingBeeConfig extends ManagedProviderConfig {
  block_ads?: boolean;
  block_resources?: boolean;
  country?: string;
  premium?: boolean;
  render_js?: boolean;
  wait?: number;
  wait_for?: string;
}

export interface BrightDataConfig extends ManagedProviderConfig {
  asn?: number;
  city?: string;
  country?: string;
  zone?: string;
}

export interface ApifyConfig extends ManagedProviderConfig {
  actorId?: string;
  build?: string;
  memory?: number;
}
