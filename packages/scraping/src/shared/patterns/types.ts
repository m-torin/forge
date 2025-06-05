/**
 * Types for scraping patterns
 */

import type { ScrapeOptions, ScrapeResult } from '../types/scraping-types';

// Quick scrape types
export interface QuickScrapeOptions extends Omit<ScrapeOptions, 'extract'> {
  provider?: string;
  retries?: number;
}

// Multi-scraping types
export interface MultiScrapeOptions {
  concurrent?: number;
  delayBetween?: number;
  onError?: (url: string, error: Error, index: number, total: number) => void;
  onProgress?: (url: string, index: number, total: number, result?: ScrapeResult) => void;
  provider?: string;
  retries?: number;
  timeout?: number;
}

export interface MultiScrapeResult {
  data?: Record<string, any>;
  duration: number;
  error?: string;
  index: number;
  url: string;
}

// Pagination types
export interface PaginationOptions {
  delay?: number;
  maxPages?: number;
  nextPageSelector?: string;
  onPageComplete?: (page: number, data: any) => void;
  stopCondition?: (page: number, data: any) => boolean;
}

export interface PaginationResult {
  data: Record<string, any>;
  page: number;
  url: string;
}

// Session types
export interface SessionOptions {
  cookies?: boolean;
  localStorage?: boolean;
  persistent?: boolean;
  timeout?: number;
}

export interface SessionResult {
  cookies?: any[];
  data: Record<string, any>;
  localStorage?: Record<string, string>;
  sessionId: string;
}

// Browser scraping types
export interface BrowserScrapeOptions extends ScrapeOptions {
  interactions?: InteractionStep[];
  recordSession?: boolean;
  waitForStable?: boolean;
}

export interface InteractionStep {
  delay?: number;
  options?: Record<string, unknown>;
  selector?: string;
  type: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'wait' | 'navigate';
  value?: string;
}

// AI extraction types
export interface AIExtractionOptions {
  confidence?: number;
  model?: string;
  prompt: string;
  schema?: Record<string, any>;
}

export interface AIExtractionResult {
  confidence: number;
  data: any;
  metadata: {
    tokens?: number;
    cost?: number;
    duration: number;
  };
  model: string;
}
