/**
 * Client-side specific types
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Client-side scraping options
 */
export interface ClientScrapeOptions extends Omit<ScrapeOptions, 'provider'> {
  provider?: 'fetch' | 'console';
  corsProxy?: string;
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
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
}

/**
 * Client provider configuration
 */
export interface ClientProviderConfig {
  timeout?: number;
  corsProxy?: string;
  headers?: Record<string, string>;
  credentials?: 'omit' | 'same-origin' | 'include';
}

/**
 * Progress tracking for client operations
 */
export interface ClientProgress {
  total: number;
  completed: number;
  percentage: number;
  current?: string;
}

/**
 * Client error context
 */
export interface ClientErrorContext {
  url?: string;
  provider: string;
  method: string;
  browserInfo?: BrowserInfo;
  timestamp: number;
}

/**
 * Download options for client-side file downloads
 */
export interface DownloadOptions {
  filename: string;
  mimeType?: string;
  charset?: string;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  corsProxy?: string;
  timeout?: number;
  debug?: boolean;
  onProgress?: (progress: ClientProgress) => void;
  onError?: (error: Error, context: ClientErrorContext) => void;
}
