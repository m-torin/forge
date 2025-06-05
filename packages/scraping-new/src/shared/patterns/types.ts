/**
 * Types for scraping patterns
 */

import type { SelectorMap, ScrapeOptions, ScrapeResult } from '../types/scraping-types';

// Quick scrape types
export interface QuickScrapeOptions extends Omit<ScrapeOptions, 'extract'> {
  provider?: string;
  retries?: number;
}

// Multi-scraping types
export interface MultiScrapeOptions {
  concurrent?: number;
  provider?: string;
  retries?: number;
  onProgress?: (url: string, index: number, total: number, result?: ScrapeResult) => void;
  onError?: (url: string, error: Error, index: number, total: number) => void;
  timeout?: number;
  delayBetween?: number;
}

export interface MultiScrapeResult {
  url: string;
  data?: Record<string, any>;
  error?: string;
  index: number;
  duration: number;
}

// Pagination types
export interface PaginationOptions {
  maxPages?: number;
  delay?: number;
  nextPageSelector?: string;
  stopCondition?: (page: number, data: any) => boolean;
  onPageComplete?: (page: number, data: any) => void;
}

export interface PaginationResult {
  page: number;
  data: Record<string, any>;
  url: string;
}

// Session types
export interface SessionOptions {
  timeout?: number;
  persistent?: boolean;
  cookies?: boolean;
  localStorage?: boolean;
}

export interface SessionResult {
  sessionId: string;
  data: Record<string, any>;
  cookies?: any[];
  localStorage?: Record<string, string>;
}

// Browser scraping types
export interface BrowserScrapeOptions extends ScrapeOptions {
  interactions?: InteractionStep[];
  waitForStable?: boolean;
  recordSession?: boolean;
}

export interface InteractionStep {
  type: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'wait' | 'navigate';
  selector?: string;
  value?: string;
  delay?: number;
  options?: Record<string, unknown>;
}

// AI extraction types
export interface AIExtractionOptions {
  prompt: string;
  model?: string;
  schema?: Record<string, any>;
  confidence?: number;
}

export interface AIExtractionResult {
  data: any;
  confidence: number;
  model: string;
  metadata: {
    tokens?: number;
    cost?: number;
    duration: number;
  };
}
