/**
 * Server-side scraping exports for Next.js
 * Server-side scraping with Next.js specific additions
 *
 * This file provides server-side scraping functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js server environments.
 *
 * For non-Next.js applications, use '@repo/scraping/server' instead.
 *
 * @example
 * ```typescript
 * import { createServerScraping, handleScrapeRequest } from '@repo/scraping/server/next';
 *
 * // In API routes
 * export const POST = handleScrapeRequest;
 *
 * // In server components
 * const scraper = await createServerScraping({ providers: { 'node-fetch': {} } };
 * const result = await scraper.scrape(url);
 * ```
 */

// Re-export all server functionality
export * from './server';

// Re-export Next.js specific server features (if the file exists)
// export * from './next/server';

// Additional Next.js specific server utilities
export type { NextRequest } from 'next/server';
