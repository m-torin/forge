/**
 * Legacy types for backward compatibility
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Legacy scraping options (from old package)
 */
export interface ScrapingOptions extends ScrapeOptions {
  engine?: 'puppeteer' | 'playwright' | 'hero';
  blockedResourceTypes?: string[];
  javascript?: boolean;
  fullPage?: boolean;
  waitForTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Legacy scraping context
 */
export interface ScrapingContext {
  url: string;
  provider: string;
  startTime: number;
  attempt: number;
  maxAttempts: number;
  options: ScrapingOptions;
}

/**
 * Legacy browser manager interface
 */
export interface LegacyBrowserManager {
  launch(): Promise<void>;
  close(): Promise<void>;
  scrape(options: ScrapingOptions): Promise<ScrapeResult>;
  extract(html: string, selectors: any): any;
  isHealthy(): Promise<boolean>;
}

/**
 * Legacy scraping engine configuration
 */
export interface LegacyScrapingEngineConfig {
  engine: 'puppeteer' | 'playwright' | 'hero';
  headless?: boolean;
  args?: string[];
  executablePath?: string;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Legacy scraping session
 */
export interface LegacyScrapingSession {
  id: string;
  startTime: number;
  endTime?: number;
  urls: string[];
  completed: string[];
  failed: string[];
  results: Map<string, ScrapeResult>;
}

/**
 * Legacy enhanced scraper options
 */
export interface LegacyEnhancedScraperOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoClose?: boolean;
  sessionPersistence?: boolean;
  proxyRotation?: boolean;
  userAgentRotation?: boolean;
}

/**
 * Legacy factory function types
 */
export type LegacyScraperFactory = (
  config?: Partial<LegacyScrapingEngineConfig>,
) => LegacyBrowserManager;

export type LegacyScrapeFunction = (
  options: ScrapingOptions,
  config?: Partial<LegacyScrapingEngineConfig>,
) => Promise<ScrapeResult>;

/**
 * Legacy error types
 */
export interface LegacyScrapingError extends Error {
  code: string;
  url?: string;
  provider?: string;
  attempt?: number;
  context?: ScrapingContext;
}

/**
 * Legacy compatibility re-exports
 */
export type ScrapingEngine = 'puppeteer' | 'playwright' | 'hero';
export type BrowserManager = LegacyBrowserManager;
export type ScrapingEngineConfig = LegacyScrapingEngineConfig;
export type ScrapingSession = LegacyScrapingSession;
export type EnhancedScraperOptions = LegacyEnhancedScraperOptions;
export type ScraperFactory = LegacyScraperFactory;
export type ScrapeFunction = LegacyScrapeFunction;
export type ScrapingError = LegacyScrapingError;
