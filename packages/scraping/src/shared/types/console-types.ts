/**
 * Console provider types
 */

import { ScrapeOptions, ScrapeResult } from './scraping-types';

// Aliases for backward compatibility
export type ConsoleConfig = ConsoleProviderConfig;

/**
 * Console log entry
 */
export interface ConsoleLogEntry {
  data?: any;
  level: 'debug' | 'error' | 'info' | 'warn';
  message: string;
  timestamp: number;
  url?: string;
}
/**
 * Console mock configuration
 */
export interface ConsoleMockConfig {
  delay?: number;
  enableMocking?: boolean;
  failureMessage?: string;
  mockResponse?: any;
  shouldFail?: boolean;
}

/**
 * Console operation result
 */
export interface ConsoleOperationResult {
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
export interface ConsoleScrapeResult extends ScrapeResult {
  logged: boolean;
  logLevel: string;
  timestamp: number;
}
