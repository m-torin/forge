import { dedupe } from 'flags/next';
import { nanoid } from 'nanoid';

import { safeEnv } from '../../env';
import type { CookieStore, HeaderStore } from './types';

/**
 * Generate a visitor ID for anonymous users
 */
export const generateVisitorId = dedupe(async () => nanoid());

/**
 * Get or generate a visitor ID from cookies/headers
 */
export async function getOrGenerateVisitorId(
  cookies: CookieStore,
  headers?: HeaderStore,
  cookieName = 'visitor-id',
): Promise<string> {
  // Check cookies first
  const cookieVisitorId = cookies.get(cookieName)?.value;
  if (cookieVisitorId) return cookieVisitorId;

  // Check headers in case middleware set a cookie on the response
  if (headers) {
    const headerVisitorId = headers.get(`x-${cookieName}`);
    if (headerVisitorId) return headerVisitorId;
  }

  // Generate new ID
  return generateVisitorId();
}

/**
 * Parse feature flag overrides from cookies (for Vercel Toolbar)
 */
export function parseOverrides(cookies: CookieStore) {
  const overrides = cookies.get('vercel-flag-overrides')?.value;
  if (!overrides) return undefined;

  try {
    return JSON.parse(overrides);
  } catch {
    return undefined;
  }
}

/**
 * Create deterministic hash from string for consistent offline evaluation
 */
export function createDeterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get percentage rollout based on key and context for offline evaluation
 */
export function getOfflineRolloutPercentage(
  key: string,
  context: string,
  percentage: number,
): boolean {
  const hash = createDeterministicHash(key + context);
  return hash % 100 < percentage;
}

/**
 * Get variant from list based on key and context for offline A/B testing
 */
export function getOfflineVariant<T>(key: string, context: string, variants: T[]): T {
  if (variants.length === 0) throw new Error('Variants array cannot be empty');
  const hash = createDeterministicHash(key + context);
  return variants[hash % variants.length];
}

/**
 * Extract user context from Next.js cookies with fallbacks
 */
export function extractUserContext(cookies: CookieStore): {
  userId: string;
  visitorId: string;
  sessionId: string;
} {
  return {
    userId:
      cookies.get('user-id')?.value || cookies.get('auth-token')?.value?.slice(0, 8) || 'anonymous',
    visitorId:
      cookies.get('visitor-id')?.value ||
      cookies.get('_ga')?.value?.slice(-8) ||
      'visitor-' + Date.now().toString(36),
    sessionId: cookies.get('session-id')?.value || 'session-' + Date.now().toString(36),
  };
}

/**
 * Extract request context from Next.js headers for offline evaluation
 */
export function extractRequestContext(headers: HeaderStore): {
  userAgent: string;
  country: string;
  environment: string;
  deployment: string;
} {
  return {
    userAgent: headers.get('user-agent') || 'unknown',
    country: headers.get('x-country') || headers.get('cf-ipcountry') || 'US',
    environment: headers.get('x-environment') || safeEnv().NODE_ENV || 'development',
    deployment: headers.get('x-deployment-id') || process.env.DEPLOYMENT_ID || 'local', // DEPLOYMENT_ID not in env schema
  };
}

/**
 * Check if flag should be enabled based on environment variables (offline override)
 */
export function checkEnvironmentOverride(key: string): boolean | string | undefined {
  const envKey = `FLAG_${key.toUpperCase().replace(/-/g, '_')}`;
  const value = process.env[envKey];

  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value; // Return as string for non-boolean values
}

/**
 * Time-based flag evaluation for offline scenarios
 */
export function getTimeBasedFlag(
  key: string,
  schedule: {
    start?: Date | string;
    end?: Date | string;
    timezone?: string;
    days?: number[]; // 0-6, Sunday = 0
    hours?: number[]; // 0-23
  },
): boolean {
  const now = new Date();

  // Check date range
  if (schedule.start && now < new Date(schedule.start)) return false;
  if (schedule.end && now > new Date(schedule.end)) return false;

  // Check day of week
  if (schedule.days && !schedule.days.includes(now.getDay())) return false;

  // Check hour range
  if (schedule.hours && !schedule.hours.includes(now.getHours())) return false;

  return true;
}
