/**
 * PostHog bootstrap utilities for Next.js server-side rendering
 * Enables consistent feature flag delivery from server to client
 */

import type { BootstrapData, PostHogCookie } from '../types/posthog-types';

/**
 * Generate a unique distinct ID (compatible with PostHog format)
 */
export function generateDistinctId(): string {
  // Use a similar format to PostHog's default distinct ID generation
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Parse PostHog cookie to extract distinct ID
 */
export function parsePostHogCookie(
  cookieValue: string,
  _projectApiKey: string,
): PostHogCookie | null {
  try {
    const parsed = JSON.parse(cookieValue);

    // Validate the cookie structure
    if (parsed && typeof parsed.distinct_id === 'string') {
      return parsed as PostHogCookie;
    }

    return null;
  } catch (_error) {
    // Silently fail - cookies may be malformed
    return null;
  }
}

/**
 * Get PostHog cookie name for a project
 */
export function getPostHogCookieName(projectApiKey: string): string {
  return `ph_${projectApiKey}_posthog`;
}

/**
 * Extract distinct ID from cookies (Next.js compatible)
 */
export function getDistinctIdFromCookies(
  cookies: any, // Next.js cookies object or cookie string
  projectApiKey: string,
): string | null {
  try {
    const cookieName = getPostHogCookieName(projectApiKey);

    // Handle Next.js cookies() object
    if (cookies && typeof cookies.get === 'function') {
      const cookie = cookies.get(cookieName);
      if (cookie?.value) {
        const parsed = parsePostHogCookie(cookie.value, projectApiKey);
        return parsed?.distinct_id || null;
      }
    }

    // Handle raw cookie string
    if (typeof cookies === 'string') {
      // eslint-disable-next-line security/detect-non-literal-regexp -- Cookie name is constructed from trusted project API key
      const cookieMatch = cookies.match(new RegExp(`${cookieName}=([^;]+)`));
      if (cookieMatch) {
        const parsed = parsePostHogCookie(decodeURIComponent(cookieMatch[1]), projectApiKey);
        return parsed?.distinct_id || null;
      }
    }

    return null;
  } catch (_error) {
    // Silently fail - cookies may be malformed or missing
    return null;
  }
}

/**
 * Create bootstrap data for PostHog client initialization
 */
export function createBootstrapData(distinctId: string): BootstrapData {
  return {
    distinctID: distinctId,
  };
}

/**
 * Cached bootstrap data fetcher (React cache compatible)
 */
const bootstrapCache = new Map<string, { data: BootstrapData; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function getCachedBootstrapData(distinctId: string): BootstrapData | null {
  const cached = bootstrapCache.get(distinctId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Clean up expired entries
  for (const [key, value] of bootstrapCache.entries()) {
    if (Date.now() - value.timestamp >= CACHE_TTL) {
      bootstrapCache.delete(key);
    }
  }

  return null;
}

export function setCachedBootstrapData(distinctId: string, data: BootstrapData): void {
  bootstrapCache.set(distinctId, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Merge multiple bootstrap data objects (useful for combining providers)
 */
function _mergeBootstrapData(...bootstrapData: BootstrapData[]): BootstrapData {
  const merged: BootstrapData = {
    distinctID: '',
  };

  for (const data of bootstrapData) {
    // Use the first non-empty distinct ID
    if (!merged.distinctID && data.distinctID) {
      merged.distinctID = data.distinctID;
    }
  }

  return merged;
}

/**
 * Validate bootstrap data structure
 */
export function validateBootstrapData(data: any): data is BootstrapData {
  return data && typeof data === 'object' && typeof data.distinctID === 'string';
}

/**
 * Serialize bootstrap data for client transmission
 */
function _serializeBootstrapData(data: BootstrapData): string {
  try {
    return JSON.stringify(data);
  } catch (_error) {
    // Fallback to minimal data
    return JSON.stringify({ distinctID: data.distinctID });
  }
}

/**
 * Deserialize bootstrap data from client
 */
function _deserializeBootstrapData(serialized: string): BootstrapData | null {
  try {
    const data = JSON.parse(serialized);
    return validateBootstrapData(data) ? data : null;
  } catch (_error) {
    // Silently fail - data may be corrupted
    return null;
  }
}

/**
 * Create minimal bootstrap data when full data is unavailable
 */
export function createMinimalBootstrapData(distinctId?: string): BootstrapData {
  return {
    distinctID: distinctId || generateDistinctId(),
  };
}
