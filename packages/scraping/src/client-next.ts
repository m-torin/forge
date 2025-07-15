/**
 * Client-side scraping exports for Next.js
 * Client-side scraping with Next.js specific additions
 *
 * This file provides client-side scraping functionality specifically for Next.js applications.
 * Use this in client components, React hooks, and Next.js browser environments.
 *
 * For non-Next.js applications, use '@repo/scraping/client' instead.
 *
 * @example
 * ```typescript
 * import { createClientScraping, useScrape } from '@repo/scraping/client/next';
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
