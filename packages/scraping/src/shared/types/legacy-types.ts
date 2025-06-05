/**
 * Legacy types for backward compatibility
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Legacy scraping options (from old package)
 */
export interface ScrapingOptions extends ScrapeOptions {
  blockedResourceTypes?: string[];
  engine?: 'puppeteer' | 'playwright' | 'hero';
  fullPage?: boolean;
  javascript?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  waitForTimeout?: number;
}

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
 * Legacy scraping engine configuration
 */
export interface LegacyScrapingEngineConfig {
  args?: string[];
  engine: 'puppeteer' | 'playwright' | 'hero';
  executablePath?: string;
  headless?: boolean;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
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
  attempt?: number;
  code: string;
  context?: ScrapingContext;
  provider?: string;
  url?: string;
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
