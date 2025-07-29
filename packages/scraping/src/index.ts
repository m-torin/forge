/**
 * Main exports for the scraping package
 */

// Client exports
export { createClientScraping, quickScrape } from './client';
export { createClientScraping as createClientScrapingNext } from './client-next';

// Server exports
export { createServerScraping, quickScrape as quickScrapeServer } from './server';
export { createServerScraping as createServerScrapingNext } from './server-next';

// Shared exports
export * from './shared';
