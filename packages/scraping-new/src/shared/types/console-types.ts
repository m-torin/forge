/**
 * Console provider types
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Console provider configuration
 */
export interface ConsoleProviderConfig {
  prefix?: string;
  colors?: boolean;
  timestamps?: boolean;
  verbose?: boolean;
}

/**
 * Console scraping options
 */
export interface ConsoleScrapeOptions extends ScrapeOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  dryRun?: boolean;
}

/**
 * Console scraping result
 */
export interface ConsoleScrapeResult extends ScrapeResult {
  logged: boolean;
  logLevel: string;
  timestamp: number;
}

/**
 * Console log entry
 */
export interface ConsoleLogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  url?: string;
  data?: any;
}

/**
 * Console operation result
 */
export interface ConsoleOperationResult {
  success: boolean;
  message: string;
  details?: any;
  duration: number;
}

/**
 * Console mock configuration
 */
export interface ConsoleMockConfig {
  enableMocking?: boolean;
  mockResponse?: any;
  delay?: number;
  shouldFail?: boolean;
  failureMessage?: string;
}
