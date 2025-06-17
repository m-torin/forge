/**
 * Next.js integration exports
 */

// Re-export core types for convenience
export type {
  ExtractedData,
  MultiScrapeOptions,
  ScrapeOptions,
  ScrapeResult,
  ScrapingManagerConfig,
  SelectorMap,
} from '../shared/types';

// React hooks
export { useExtract, useMultiScrape, useScrape, useScrapeStatus } from './hooks';

export type {
  UseExtractReturn,
  UseMultiScrapeOptions,
  UseMultiScrapeReturn,
  UseScrapeOptions,
  UseScrapeReturn,
} from './hooks';

// Server utilities
export {
  createScrapingAPI,
  edgeScrape,
  getScrapingManager,
  handleExtractRequest,
  handleMultiScrapeRequest,
  handleScrapeRequest,
  handleStatusRequest,
  withRateLimit,
} from './server';
