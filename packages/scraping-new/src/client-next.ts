/**
 * Next.js client-side scraping exports
 * Client-side scraping with Next.js specific additions
 *
 * @example
 * ```typescript
 * import { createClientScraping, useScrape } from '@repo/scraping-new/client/next';
 *
 * // In a component
 * const { scrape, data, loading } = useScrape();
 *
 * // Scrape data
 * await scrape('https://example.com');
 * ```
 */

// Re-export all client functionality
export * from './client';

// Re-export Next.js specific hooks and components
export * from './next/hooks';

// Next.js specific client features
export type {
  UseExtractReturn,
  UseMultiScrapeOptions,
  UseMultiScrapeReturn,
  UseScrapeOptions,
  UseScrapeReturn,
} from './next/hooks';
