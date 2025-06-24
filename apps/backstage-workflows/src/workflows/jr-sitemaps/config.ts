import { createHash } from 'crypto';

export const JR_SITEMAPS_CONFIG = {
  sitemapsPerStep: 10,
  urlBatchSize: parseInt(process.env.JR_SITEMAPS_URL_BATCH_SIZE || '500'),
  priorityDomains: (
    process.env.JR_SITEMAPS_PRIORITY_DOMAINS || 'shopdisney.com,disneystore.com'
  ).split(','),
  delayBetweenBatches: process.env.JR_SITEMAPS_BATCH_DELAY || '2s',
  delayBetweenPrioritySitemaps: process.env.JR_SITEMAPS_PRIORITY_DELAY || '1s',
  requestThrottle: parseInt(process.env.JR_SITEMAPS_REQUEST_THROTTLE || '1000'),
  sitemapTimeout: parseInt(process.env.JR_SITEMAPS_TIMEOUT || '60000'),
  maxSitemapSize: parseInt(process.env.JR_SITEMAPS_MAX_SIZE || '104857600'),
  maxChildWorkflows: parseInt(process.env.JR_SITEMAPS_MAX_CHILDREN || '5'),
  allowedDomains: (
    process.env.JR_SITEMAPS_ALLOWED_DOMAINS || 'shopdisney.com,disneystore.com'
  ).split(','),
  redis: {
    urlTTL: parseInt(process.env.JR_SITEMAPS_REDIS_URL_TTL || '7776000'),
    metaTTL: parseInt(process.env.JR_SITEMAPS_REDIS_META_TTL || '2592000'),
  },
  redisKeys: {
    urlSet: process.env.REDIS_PREFIX
      ? `${process.env.REDIS_PREFIX}:jr-sitemaps:urls`
      : 'jr-sitemaps:urls',
    urlDetails: process.env.REDIS_PREFIX
      ? `${process.env.REDIS_PREFIX}:jr-sitemaps:url:details`
      : 'jr-sitemaps:url:details',
    sitemapMeta: process.env.REDIS_PREFIX
      ? `${process.env.REDIS_PREFIX}:jr-sitemaps:meta`
      : 'jr-sitemaps:meta',
    stats: process.env.REDIS_PREFIX
      ? `${process.env.REDIS_PREFIX}:jr-sitemaps:stats`
      : 'jr-sitemaps:stats',
    processingLock: process.env.REDIS_PREFIX
      ? `${process.env.REDIS_PREFIX}:jr-sitemaps:lock`
      : 'jr-sitemaps:lock',
  },
  progressReportInterval: parseInt(process.env.JR_SITEMAPS_PROGRESS_INTERVAL || '1000'),
  maxRetries: parseInt(process.env.JR_SITEMAPS_MAX_RETRIES || '3'),
} as const;

/**
 * Generates a consistent URL key for storage
 */
export function generateJrSitemapUrlKey(url: string): string {
  return createHash('sha256').update(url).digest('base64url');
}

/**
 * Cleans URL by removing query parameters and fragments
 */
export function cleanJrSitemapUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    // Normalize trailing slashes
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
