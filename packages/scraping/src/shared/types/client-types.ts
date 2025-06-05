/**
 * Client-side specific types
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Client-side scraping options
 */
export interface ClientScrapeOptions extends Omit<ScrapeOptions, 'provider'> {
  corsProxy?: string;
  provider?: 'fetch' | 'console';
}

/**
 * Client-side scraping result
 */
export interface ClientScrapeResult extends ScrapeResult {
  isCORS?: boolean;
  proxyUsed?: boolean;
}

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
 * Client provider configuration
 */
export interface ClientProviderConfig {
  corsProxy?: string;
  credentials?: 'omit' | 'same-origin' | 'include';
  headers?: Record<string, string>;
  timeout?: number;
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
 * Download options for client-side file downloads
 */
export interface DownloadOptions {
  charset?: string;
  filename: string;
  mimeType?: string;
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
