/**
 * Configuration types for the scraping system
 */

import { ErrorContext } from '../errors';

import { ProviderConfig, ScrapeOptions, ScrapingMiddleware } from './provider';

export interface ApifyConfig extends ManagedProviderConfig {
  actorId?: string;
  build?: string;
  memory?: number;
}

export interface BrightDataConfig extends ManagedProviderConfig {
  asn?: number;
  city?: string;
  country?: string;
  zone?: string;
}

// Provider-specific configurations
export interface BrowserProviderConfig {
  args?: string[];
  defaultViewport?: {
    height: number;
    width: number;
  };
  devtools?: boolean;
  executablePath?: string;
  headless?: boolean;
  ignoreDefaultArgs?: string[];
  slowMo?: number;
}

export interface CheerioProviderConfig {
  decodeEntities?: boolean;
  normalizeWhitespace?: boolean;
  // Cheerio-specific options
  xml?: boolean;
}

export interface ErrorHandlingConfig {
  backoffMultiplier?: number;
  maxRetries?: number;
  onError?: (error: Error, context: ErrorContext) => Promise<void> | void;
  retryOn?: string[];
}

export interface HeroProviderConfig extends BrowserProviderConfig {
  disableDevtools?: boolean;
  showChrome?: boolean;
  userProfile?: string;
}

export interface ManagedProviderConfig {
  apiEndpoint?: string;
  apiKey: string;
  maxRequestsPerSecond?: number;
  timeout?: number;
}

export interface PlaywrightProviderConfig extends BrowserProviderConfig {
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  channel?: string;
}

export interface PuppeteerProviderConfig extends BrowserProviderConfig {
  product?: 'chrome' | 'firefox';
  protocol?: 'cdp' | 'webDriverBiDi';
}

export interface ResourceConfig {
  instancesPerProvider?: Record<string, number>;
  maxConcurrent?: number;
  maxMemory?: string;
  recycleAfter?: number;
}

export interface RoutingConfig {
  default?: string;
  fallback?: string;
  rules?: RoutingRule[];
}

export interface RoutingRule {
  hint?: 'dynamic' | 'protected' | 'static';
  pattern?: RegExp | string;
  priority?: number;
  provider: string;
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

// Global configuration
export interface ScrapingConfig {
  // Default options applied to all scrapes
  defaults?: ScrapingDefaults;

  // Error handling
  errorHandling?: ErrorHandlingConfig;

  // Middleware pipeline
  middleware?: ScrapingMiddleware[];

  providers: ProviderConfig[];

  // Resource management
  resources?: ResourceConfig;

  // Routing rules for automatic provider selection
  routing?: RoutingConfig;

  // Telemetry and monitoring
  telemetry?: TelemetryConfig;
}

export interface ScrapingDefaults extends Partial<ScrapeOptions> {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
}

export interface TelemetryConfig {
  apiKey?: string;
  enabled?: boolean;
  endpoint?: string;
  includeErrors?: boolean;
  includeTimings?: boolean;
  sampleRate?: number;
}
