/**
 * Client-side specific types
 */

import { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Browser environment info
 */
export interface BrowserInfo {
  cookieEnabled: boolean;
  language: string;
  onLine: boolean;
  platform: string;
  userAgent: string;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  corsProxy?: string;
  debug?: boolean;
  onError?: (error: Error, context: ClientErrorContext) => void;
  onProgress?: (progress: ClientProgress) => void;
  timeout?: number;
}

/**
 * Client error context
 */
export interface ClientErrorContext {
  browserInfo?: BrowserInfo;
  method: string;
  provider: string;
  timestamp: number;
  url?: string;
}

/**
 * Progress tracking for client operations
 */
export interface ClientProgress {
  completed: number;
  current?: string;
  percentage: number;
  total: number;
}

/**
 * Client provider configuration
 */
export interface ClientProviderConfig {
  corsProxy?: string;
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Client-side scraping options
 */
export interface ClientScrapeOptions extends Omit<ScrapeOptions, 'provider'> {
  corsProxy?: string;
  provider?: 'console' | 'fetch';
}

/**
 * Client-side scraping result
 */
export interface ClientScrapeResult extends ScrapeResult {
  isCORS?: boolean;
  proxyUsed?: boolean;
}

/**
 * Download options for client-side file downloads
 */
export interface DownloadOptions {
  charset?: string;
  filename: string;
  mimeType?: string;
}
