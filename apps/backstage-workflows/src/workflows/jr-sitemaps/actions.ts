'use server';

import { cache } from 'react';
import { createHash } from 'crypto';
import {
  JR_SITEMAPS_CONFIG,
  generateJrSitemapUrlKey,
  cleanJrSitemapUrl,
} from '@/workflows/jr-sitemaps/config';
import { JrSitemapUrlDetails, JrSitemapsProcessingStats } from '@/workflows/jr-sitemaps/types';

// Mock Redis for now - will be replaced with actual Redis implementation
const mockRedis = new Map<string, any>();

/**
 * Validates sitemap URL with enhanced security checks
 */
export const validateJrSitemapUrl = cache(async (url: string) => {
  try {
    const parsed = new URL(url);

    // Security checks
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Invalid protocol', isPriority: false };
    }

    // Prevent SSRF attacks
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname.startsWith('127.') ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.')
    ) {
      return { valid: false, error: 'Private IP addresses not allowed', isPriority: false };
    }

    const domain = parsed.hostname.replace('www.', '');
    const isPriority = JR_SITEMAPS_CONFIG.priorityDomains.some((pd) => domain.includes(pd));

    if (
      !JR_SITEMAPS_CONFIG.allowedDomains.some(
        (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
      )
    ) {
      return { valid: false, error: `Domain ${domain} not in whitelist`, isPriority: false };
    }

    if (!parsed.pathname.includes('sitemap') && !parsed.pathname.endsWith('.xml')) {
      return { valid: false, error: 'URL does not appear to be a sitemap', isPriority: false };
    }

    return { valid: true, isPriority };
  } catch (error) {
    console.error('JR-Sitemaps URL validation error', { url, error });
    return { valid: false, error: 'Invalid URL format', isPriority: false };
  }
});

/**
 * Efficiently stores URLs in storage with batch processing
 */
export async function storeJrSitemapUrlBatch(
  urls: string[],
  source: string,
): Promise<{ inserted: number; updated: number; skipped: number }> {
  const now = new Date().toISOString();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    // Process in smaller chunks
    const chunkSize = 100;

    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);

      for (const url of chunk) {
        const cleanedUrl = cleanJrSitemapUrl(url);
        const urlKey = generateJrSitemapUrlKey(cleanedUrl);
        const detailsKey = `${JR_SITEMAPS_CONFIG.redisKeys.urlDetails}:${urlKey}`;

        // Check existence
        const exists = mockRedis.has(cleanedUrl);

        if (exists) {
          // Update existing URL
          const existing = mockRedis.get(detailsKey) || {};
          mockRedis.set(detailsKey, {
            ...existing,
            lastSeen: now,
            updateCount: (existing.updateCount || 0) + 1,
          });
          updated++;
        } else {
          // Insert new URL
          mockRedis.set(cleanedUrl, true);
          mockRedis.set(detailsKey, {
            url: cleanedUrl,
            firstSeen: now,
            lastSeen: now,
            source,
            updateCount: 1,
          } as JrSitemapUrlDetails);
          inserted++;
        }
      }
    }

    // Update global stats
    const statsKey = JR_SITEMAPS_CONFIG.redisKeys.stats;
    const currentStats = mockRedis.get(statsKey) || {};
    mockRedis.set(statsKey, {
      ...currentStats,
      totalUrls: (currentStats.totalUrls || 0) + inserted,
      totalUpdates: (currentStats.totalUpdates || 0) + updated,
      lastUpdated: now,
    });
  } catch (error) {
    console.error('JR-Sitemaps batch store error', { error, urlCount: urls.length });
    throw new Error('Failed to store URLs');
  }

  return { inserted, updated, skipped };
}

/**
 * Retrieves JR-Sitemaps processing statistics with caching
 */
export const getJrSitemapsProcessingStats = cache(async (): Promise<JrSitemapsProcessingStats> => {
  try {
    const statsKey = JR_SITEMAPS_CONFIG.redisKeys.stats;
    const stats = mockRedis.get(statsKey) || {};

    // Count total unique URLs
    let totalUniqueUrls = 0;
    for (const [key] of mockRedis.entries()) {
      if (key.startsWith('http')) {
        totalUniqueUrls++;
      }
    }

    return {
      totalSitemapsProcessed: Number(stats?.totalSitemapsProcessed || 0),
      totalUrlsFound: Number(stats?.totalUrlsFound || 0),
      totalUrlsInserted: Number(stats?.totalUrls || 0),
      totalUrlsUpdated: Number(stats?.totalUpdates || 0),
      skippedDueToDuplicates: Number(stats?.skippedDuplicates || 0),
      prioritySitemapsProcessed: Number(stats?.prioritySitemapsProcessed || 0),
      failedSitemaps: [],
      errors: [],
      warnings: [],
      processingTimeMs: 0,
      totalUniqueUrls,
      lastUpdated: stats?.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get JR-Sitemaps processing stats', { error });
    throw new Error('Failed to retrieve JR-Sitemaps statistics');
  }
});

/**
 * Checks if a sitemap has changed since last processing
 */
export async function checkJrSitemapChanged(url: string): Promise<boolean> {
  try {
    const metaKey = `${JR_SITEMAPS_CONFIG.redisKeys.sitemapMeta}:${Buffer.from(url).toString('base64')}`;
    const metadata = mockRedis.get(metaKey);

    if (!metadata) return true;

    // For now, always return true to reprocess
    // In production, this would check HTTP headers
    return true;
  } catch (error) {
    console.error('Error checking sitemap change', { url, error });
    return true;
  }
}

/**
 * Updates sitemap metadata after processing
 */
export async function updateJrSitemapMetadata(url: string, urlCount: number): Promise<void> {
  try {
    const metaKey = `${JR_SITEMAPS_CONFIG.redisKeys.sitemapMeta}:${Buffer.from(url).toString('base64')}`;

    mockRedis.set(metaKey, {
      url,
      lastProcessed: new Date().toISOString(),
      hash: createHash('md5')
        .update(url + Date.now())
        .digest('hex'),
      urlCount,
    });
  } catch (error) {
    console.error('Error updating sitemap metadata', { url, error });
  }
}
