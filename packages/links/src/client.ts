/**
 * Client-side links exports (non-Next.js)
 * Browser-only link management functionality
 *
 * This file provides client-side link functionality for non-Next.js applications.
 * Use this in browser applications, SPAs, and standalone client environments.
 *
 * For Next.js applications, use '@repo/links/client/next' instead.
 *
 * @example
 * ```typescript
 * import { createClientLinkManager, trackLinkClick } from '@repo/links/client';
 *
 * const linkManager = await createClientLinkManager({
 *   providers: {
 *     dub: {
 *       enabled: true,
 *       apiKey: 'dub_xxx',
 *       defaultDomain: 'yourdomain.com'
 *     }
 *   }
 * };
 *
 * // Track link clicks
 * await trackLinkClick('link-id', {
 *   country: 'US',
 *   browser: 'Chrome'
 * });
 * ```
 */

import { logWarn } from '@repo/observability';
import {
  ClickEvent,
  CreateLinkRequest,
  Link,
  LinkAnalytics,
  LinkConfig,
  LinkManager,
} from './shared/types/index';
import { createLinkManager } from './shared/utils/link-manager';

// ============================================================================
// CORE CLIENT FUNCTIONS
// ============================================================================

/**
 * Create a client-side link manager instance
 * This is the primary way to create link management for client-side applications
 */
export async function createClientLinkManager(config: LinkConfig): Promise<LinkManager> {
  // Validate client-side configuration
  if (typeof window === 'undefined') {
    throw new Error('createClientLinkManager can only be used in browser environments');
  }

  return createLinkManager(config);
}

/**
 * Create a client link manager without browser validation
 * Useful for SSR scenarios where window might not be available
 */
export async function createClientLinkManagerUniversal(config: LinkConfig): Promise<LinkManager> {
  return createLinkManager(config);
}

// ============================================================================
// CLIENT-SPECIFIC UTILITIES
// ============================================================================

/**
 * Track a link click with browser-specific information
 * Automatically captures browser, device, and location information
 */
export async function trackLinkClick(
  linkManager: LinkManager,
  linkId: string,
  additionalData: Partial<ClickEvent> = {},
): Promise<void> {
  if (typeof window === 'undefined') {
    logWarn('trackLinkClick called in non-browser environment', {
      function: 'trackLinkClick',
      linkId,
      environment: 'server-side',
    });
    return;
  }

  const clickEvent: Partial<ClickEvent> = {
    timestamp: new Date(),
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    referrer: document.referrer || undefined,
    referrerUrl: document.referrer || undefined,
    ua: navigator.userAgent,
    ...additionalData,
  };

  await linkManager.trackClick(linkId, clickEvent);
}

/**
 * Create a short link with client-side validation
 */
export async function createShortLink(
  linkManager: LinkManager,
  request: CreateLinkRequest,
): Promise<Link> {
  // Client-side URL validation
  try {
    new URL(request.url);
  } catch {
    throw new Error('Invalid URL provided');
  }

  return linkManager.createLink(request);
}

/**
 * Open a short link and track the click
 */
export async function openAndTrackLink(
  linkManager: LinkManager,
  linkId: string,
  target: '_blank' | '_self' = '_blank',
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('openAndTrackLink can only be used in browser environments');
  }

  const link = await linkManager.getLink(linkId);
  if (!link) {
    throw new Error(`Link with id "${linkId}" not found`);
  }

  // Track the click
  await trackLinkClick(linkManager, linkId);

  // Open the link
  window.open(link.shortLink, target);
}

/**
 * Get link analytics with caching for better performance
 */
export async function getLinkAnalyticsWithCache(
  linkManager: LinkManager,
  linkId: string,
  interval: '1h' | '24h' | '7d' | '30d' | '90d' | 'all' = '7d',
  cacheKey?: string,
): Promise<LinkAnalytics> {
  const key = cacheKey || `link_analytics_${linkId}_${interval}`;

  // Try to get from cache first (if localStorage is available)
  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }
  }

  const analytics = await linkManager.getAnalytics(linkId, interval);

  // Store in cache
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data: analytics,
          timestamp: Date.now(),
        }),
      );
    } catch {
      // Storage quota exceeded or disabled, ignore
    }
  }

  return analytics;
}

// ============================================================================
// BROWSER UTILITIES
// ============================================================================

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  const ua = navigator.userAgent;

  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';

  return 'Other';
}

function getDeviceInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Linux';

  return 'Other';
}

// ============================================================================
// RE-EXPORT TYPES AND UTILITIES
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
