/**
 * Console provider types
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Console provider configuration
 */
export interface ConsoleProviderConfig {
  colors?: boolean;
  prefix?: string;
  timestamps?: boolean;
  verbose?: boolean;
}

// Aliases for backward compatibility
export type ConsoleConfig = ConsoleProviderConfig;
export interface ConsoleOptions extends ConsoleScrapeOptions {}

/**
 * Console scraping options
 */
export interface ConsoleScrapeOptions extends ScrapeOptions {
  dryRun?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
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
  data?: any;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  url?: string;
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
