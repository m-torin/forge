/**
 * Console provider types
 */

import { ScrapeOptions, ScrapeResult } from './scraping-types';

// Aliases for backward compatibility
export type ConsoleConfig = ConsoleProviderConfig;

/**
 * Console log entry
 */
interface _ConsoleLogEntry {
  data?: any;
  level: 'debug' | 'error' | 'info' | 'warn';
  message: string;
  timestamp: number;
  url?: string;
}
/**
 * Console mock configuration
 */
interface _ConsoleMockConfig {
  delay?: number;
  enableMocking?: boolean;
  failureMessage?: string;
  mockResponse?: any;
  shouldFail?: boolean;
}

/**
 * Console operation result
 */
interface _ConsoleOperationResult {
  details?: any;
  duration: number;
  message: string;
  success: boolean;
}

export type ConsoleOptions = ConsoleScrapeOptions;

/**
 * Console provider configuration
 */
export interface ConsoleProviderConfig {
  colors?: boolean;
  prefix?: string;
  timestamps?: boolean;
  verbose?: boolean;
}

/**
 * Console scraping options
 */
export interface ConsoleScrapeOptions extends ScrapeOptions {
  dryRun?: boolean;
  logLevel?: 'debug' | 'error' | 'info' | 'warn';
}

/**
 * Console scraping result
 */
interface _ConsoleScrapeResult extends ScrapeResult {
  logged: boolean;
  logLevel: string;
  timestamp: number;
}
