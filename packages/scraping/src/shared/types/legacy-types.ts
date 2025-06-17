/**
 * Legacy types for backward compatibility
 */

import { ScrapeOptions, ScrapeResult } from './scraping-types';

export type BrowserManager = LegacyBrowserManager;

export type EnhancedScraperOptions = LegacyEnhancedScraperOptions;

/**
 * Legacy browser manager interface
 */
export interface LegacyBrowserManager {
  close(): Promise<void>;
  extract(html: string, selectors: any): any;
  isHealthy(): Promise<boolean>;
  launch(): Promise<void>;
  scrape(options: ScrapingOptions): Promise<ScrapeResult>;
}

/**
 * Legacy enhanced scraper options
 */
export interface LegacyEnhancedScraperOptions {
  autoClose?: boolean;
  maxRetries?: number;
  proxyRotation?: boolean;
  retryDelay?: number;
  sessionPersistence?: boolean;
  userAgentRotation?: boolean;
}

export type LegacyScrapeFunction = (
  options: ScrapingOptions,
  config?: Partial<LegacyScrapingEngineConfig>,
) => Promise<ScrapeResult>;

/**
 * Legacy factory function types
 */
export type LegacyScraperFactory = (
  config?: Partial<LegacyScrapingEngineConfig>,
) => LegacyBrowserManager;

/**
 * Legacy scraping engine configuration
 */
export interface LegacyScrapingEngineConfig {
  args?: string[];
  engine: 'hero' | 'playwright' | 'puppeteer';
  executablePath?: string;
  headless?: boolean;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Legacy error types
 */
export interface LegacyScrapingError extends Error {
  attempt?: number;
  code: string;
  context?: ScrapingContext;
  provider?: string;
  url?: string;
}

/**
 * Legacy scraping session
 */
export interface LegacyScrapingSession {
  completed: string[];
  endTime?: number;
  failed: string[];
  id: string;
  results: Map<string, ScrapeResult>;
  startTime: number;
  urls: string[];
}

export type ScrapeFunction = LegacyScrapeFunction;
export type ScraperFactory = LegacyScraperFactory;
/**
 * Legacy scraping context
 */
export interface ScrapingContext {
  attempt: number;
  maxAttempts: number;
  options: ScrapingOptions;
  provider: string;
  startTime: number;
  url: string;
}
/**
 * Legacy compatibility re-exports
 */
export type ScrapingEngine = 'hero' | 'playwright' | 'puppeteer';
export type ScrapingEngineConfig = LegacyScrapingEngineConfig;
export type ScrapingError = LegacyScrapingError;
/**
 * Legacy scraping options (from old package)
 */
export interface ScrapingOptions extends ScrapeOptions {
  blockedResourceTypes?: string[];
  engine?: 'hero' | 'playwright' | 'puppeteer';
  fullPage?: boolean;
  javascript?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  waitForTimeout?: number;
}
export type ScrapingSession = LegacyScrapingSession;
