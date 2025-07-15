/**
 * Server-side links exports (non-Next.js)
 * Complete link management solution for server/Node.js environments
 *
 * This file provides server-side link functionality for non-Next.js applications.
 * Use this in Node.js applications, API servers, and standalone server environments.
 *
 * For Next.js applications, use '@repo/orchestration/server/next' instead.
 *
 * @example
 * ```typescript
 * import { createServerLinkManager } from '@repo/links/server';
 *
 * const linkManager = await createServerLinkManager({
 *   providers: {
 *     dub: {
 *       enabled: true,
 *       apiKey: process.env.DUB_API_KEY,
 *       workspace: process.env.DUB_WORKSPACE,
 *       defaultDomain: 'yourdomain.com'
 *     }
 *   }
 * };
 *
 * // Create a short link
 * const link = await linkManager.createLink({
 *   url: 'https://example.com/very/long/url',
 *   title: 'Example Page',
 *   tags: ['marketing', 'campaign']
 * });
 * ```
 */

import { logDebug, logError } from '@repo/observability/server';
import {
  BulkCreateResponse,
  ClickEvent,
  CreateLinkRequest,
  LinkConfig,
  LinkManager,
  LinkMetrics,
} from './shared/types/index';
import { createLinkManager } from './shared/utils/link-manager';

// ============================================================================
// CORE SERVER FUNCTIONS
// ============================================================================

/**
 * Create a server-side link manager instance
 * This is the primary way to create link management for server-side applications
 */
export async function createServerLinkManager(config: LinkConfig): Promise<LinkManager> {
  return createLinkManager(config);
}

/**
 * Create a server link manager with environment validation
 * Validates required environment variables and configuration
 */
export async function createServerLinkManagerWithValidation(
  config: LinkConfig,
  requiredEnvVars: string[] = [],
): Promise<LinkManager> {
  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable "${envVar}" is not set`);
    }
  }

  // Validate configuration
  validateServerConfig(config);

  return createLinkManager(config);
}

/**
 * Create a server link manager with analytics integration
 * Automatically configures analytics if @repo/analytics is available
 */
export async function createServerLinkManagerWithAnalytics(
  config: LinkConfig,
  analyticsConfig?: any, // ObservabilityConfig from @repo/analytics
): Promise<LinkManager> {
  const enhancedConfig = { ...config };

  // Try to integrate with analytics package if available
  if (analyticsConfig) {
    try {
      // const { createServerObservability } = await import('@repo/analytics/server/next'); // Commented: property doesn't exist
      // const analytics = await createServerObservability(analyticsConfig); // Commented: property doesn't exist
      const analyticsModule = await import('@repo/analytics/shared');
      const analytics = await analyticsModule.createAnalytics(analyticsConfig);

      enhancedConfig.analytics = {
        enabled: true,
        provider: {
          track: async (event: string, properties?: Record<string, any>) => {
            // await analytics.log('info', `Link Event: ${event}`, properties); // Commented: log method doesn't exist
            await analytics.track(event, properties);
          },
        },
        events: ['link_created', 'link_clicked', 'link_deleted', 'bulk_created'],
        sampling: 1.0,
        debugMode: process.env.NODE_ENV === 'development',
      };
    } catch (error) {
      logDebug('[LinkManager] Analytics integration not available', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return createLinkManager(enhancedConfig);
}

// ============================================================================
// SERVER-SPECIFIC UTILITIES
// ============================================================================

/**
 * Create multiple short links in batch with server-side optimizations
 */
export async function bulkCreateShortLinks(
  linkManager: LinkManager,
  requests: CreateLinkRequest[],
  options: {
    validateUrls?: boolean;
    chunkSize?: number;
    concurrency?: number;
  } = {},
): Promise<BulkCreateResponse> {
  const { validateUrls = true, chunkSize = 100, concurrency: _concurrency = 5 } = options;

  // Validate URLs if requested
  if (validateUrls) {
    for (const request of requests) {
      try {
        new URL(request.url);
      } catch {
        throw new Error(`Invalid URL: ${request.url}`);
      }
    }
  }

  // Process in chunks to avoid overwhelming the API
  const chunks = chunkArray(requests, chunkSize);
  const allResults: BulkCreateResponse = { created: [], errors: [] };

  for (const chunk of chunks) {
    try {
      const result = await linkManager.bulkCreate({ links: chunk });
      allResults.created.push(...result.created);
      allResults.errors.push(...result.errors);
    } catch (_error) {
      // If bulk creation fails, fall back to individual creation
      for (const request of chunk) {
        try {
          const link = await linkManager.createLink(request);
          allResults.created.push(link);
        } catch (error: any) {
          allResults.errors.push({
            url: request.url,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  return allResults;
}

/**
 * Track server-side click event with IP geolocation
 */
export async function trackServerClick(
  linkManager: LinkManager,
  linkId: string,
  request: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    headers?: Record<string, string>;
  },
): Promise<void> {
  const clickEvent: Partial<ClickEvent> = {
    timestamp: new Date(),
    ip: request.ip,
    ua: request.userAgent,
    referrer: request.referrer,
  };

  // Add geolocation data if IP is available
  if (request.ip) {
    const geoData = await getGeolocationFromIP(request.ip);
    if (geoData) {
      clickEvent.country = geoData.country;
      clickEvent.city = geoData.city;
      clickEvent.region = geoData.region;
      clickEvent.latitude = geoData.latitude;
      clickEvent.longitude = geoData.longitude;
    }
  }

  // Extract browser and OS from user agent
  if (request.userAgent) {
    clickEvent.browser = extractBrowserFromUA(request.userAgent);
    clickEvent.os = extractOSFromUA(request.userAgent);
    clickEvent.device = extractDeviceFromUA(request.userAgent);
  }

  await linkManager.trackClick(linkId, clickEvent);
}

/**
 * Get comprehensive link metrics with server-side caching
 */
export async function getLinkMetricsWithCache(
  linkManager: LinkManager,
  linkId: string,
  cacheOptions: {
    ttl?: number; // Time to live in seconds
    useRedis?: boolean;
    redisKey?: string;
  } = {},
): Promise<LinkMetrics> {
  const { ttl: _ttl = 300, useRedis = false, redisKey } = cacheOptions;
  const _key = redisKey || `link_metrics:${linkId}`;

  // Try to get from cache first (simplified - would use Redis in production)
  let cached: LinkMetrics | null = null;
  if (useRedis) {
    // In a real implementation, this would use Redis
    // cached = await redis.get(key);
  }

  if (cached) {
    return cached;
  }

  const metrics = await linkManager.getMetrics(linkId);

  // Store in cache
  if (useRedis) {
    // In a real implementation, this would use Redis
    // await redis.setex(key, ttl, JSON.stringify(metrics));
  }

  return metrics;
}

/**
 * Create a redirect handler for short links
 */
export function createRedirectHandler(linkManager: LinkManager) {
  return async (
    domain: string,
    key: string,
    request: {
      ip?: string;
      userAgent?: string;
      referrer?: string;
      headers?: Record<string, string>;
    },
  ): Promise<{ url: string; status: number } | null> => {
    try {
      const link = await linkManager.getLinkByKey(key, domain);
      if (!link) {
        return null;
      }

      // Check if link is expired
      if (link.expiresAt && new Date() > link.expiresAt) {
        if (link.expiredUrl) {
          return { url: link.expiredUrl, status: 302 };
        }
        return null;
      }

      // Check password protection
      if (link.password) {
        // This would need additional logic for password verification
        // For now, we'll skip password-protected links
        return null;
      }

      // Track the click
      await trackServerClick(linkManager, link.id, request);

      // Return the redirect URL
      return { url: link.url, status: 302 };
    } catch (error: any) {
      logError(
        error instanceof Error ? error : new Error(`Error handling redirect: ${String(error)}`),
      );
      return null;
    }
  };
}

/**
 * Validate server configuration
 */
function validateServerConfig(config: LinkConfig): void {
  if (!config.providers) {
    throw new Error('No providers configured');
  }

  const enabledProviders = Object.entries(config.providers).filter(
    ([, providerConfig]: any) => providerConfig?.enabled,
  );

  if (enabledProviders.length === 0) {
    throw new Error('No providers enabled');
  }

  // Validate Dub configuration if enabled
  if (config.providers.dub?.enabled) {
    if (!config.providers.dub.apiKey) {
      throw new Error('Dub API key is required when Dub provider is enabled');
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function getGeolocationFromIP(_ip: string): Promise<{
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
} | null> {
  // This would integrate with a geolocation service like ipapi.co or MaxMind
  // For now, return null
  return null;
}

function extractBrowserFromUA(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
}

function extractOSFromUA(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent) && !/iPhone|iPad|iPod/i.test(userAgent)) return 'Mac';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  return 'Other';
}

function extractDeviceFromUA(userAgent: string): string {
  if (/Mobile/i.test(userAgent)) return 'Mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

// ============================================================================
// RE-EXPORT CORE FUNCTIONALITY
// ============================================================================

export { createLinkManager };

export type {
  // Analytics integration types
  AnalyticsConfig,
  AnalyticsIntegration,
  AnalyticsManager,
  BulkCreateRequest,
  BulkCreateResponse,
  ClickEvent,
  CreateLinkRequest,
  DubProviderConfig,
  Link,
  LinkAnalytics,
  LinkAnalyticsEvent,
  LinkAnalyticsEventData,
  LinkClickedEvent,
  LinkConfig,
  LinkCreatedEvent,
  LinkManager,
  LinkMetrics,
  LinkProvider,
  LinkTag,
  UpdateLinkRequest,
} from './shared/types/index';
