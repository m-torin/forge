import 'server-only';

import { analytics } from './posthog/server';

/**
 * Server-safe feature flag functions
 * Uses PostHog for flag evaluation and automatically tracks usage
 */

// Parse local flags once at startup
let localFlags: Record<string, boolean> | null = null;
const localFlagsEnv = process.env.LOCAL_FLAGS || process.env.NEXT_PUBLIC_LOCAL_FLAGS;
if (localFlagsEnv) {
  try {
    localFlags = JSON.parse(localFlagsEnv);
    console.log('[Analytics] Using local feature flags:', Object.keys(localFlags || {}).length, 'flags');
  } catch (error) {
    console.error('[Analytics] Failed to parse LOCAL_FLAGS:', error);
  }
}

/**
 * Server-side feature flag evaluation
 * 
 * @param key - The feature flag key
 * @param userId - User ID for flag evaluation
 * @returns Promise<boolean> - Whether the flag is enabled
 */
export async function flag(key: string, userId?: string): Promise<boolean> {
  // 1. Check environment variable override first
  const envOverride = process.env[`FF_${key.toUpperCase().replace(/\./g, '_')}`];
  if (envOverride !== undefined) {
    console.log(`[Analytics] Using env override for ${key}: ${envOverride}`);
    return envOverride === 'true';
  }

  // 2. Check local flags (for development)
  if (localFlags && key in localFlags) {
    console.log(`[Analytics] Using local flag for ${key}: ${localFlags[key]}`);
    return localFlags[key];
  }

  // 3. Server-side: Use PostHog server client
  if (userId) {
    try {
      return await analytics.isFeatureEnabled(key, userId) ?? false;
    } catch (error) {
      console.error('[Analytics] Failed to check server flag:', error);
      return false;
    }
  }

  // 4. Default to false for anonymous users
  console.log(`[Analytics] No userId provided for flag ${key}, defaulting to false`);
  return false;
}

/**
 * Server-side bulk feature flag evaluation
 * 
 * @param keys - Array of feature flag keys
 * @param userId - User ID for flag evaluation
 * @returns Promise<Record<string, boolean>> - Map of flags to their enabled state
 */
export async function flags(keys: string[], userId?: string): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  // Use Promise.all for parallel flag evaluation
  const values = await Promise.all(
    keys.map(key => flag(key, userId))
  );
  
  keys.forEach((key, index) => {
    results[key] = values[index];
  });
  
  return results;
}

/**
 * Analytics-specific feature flags
 */
export async function analyticsEnabled(userId?: string): Promise<boolean> {
  return flag('analytics.enabled', userId);
}

export async function segmentAnalyticsEnabled(userId?: string): Promise<boolean> {
  return flag('analytics.segment.enabled', userId);
}

export async function posthogAnalyticsEnabled(userId?: string): Promise<boolean> {
  return flag('analytics.posthog.enabled', userId);
}

export async function googleAnalyticsEnabled(userId?: string): Promise<boolean> {
  return flag('analytics.google.enabled', userId);
}

export async function analyticsDebugMode(userId?: string): Promise<boolean> {
  return flag('analytics.debug', userId);
}

export async function analyticsProductionOnly(userId?: string): Promise<boolean> {
  return flag('analytics.production_only', userId);
}

export async function analyticsDevelopmentMode(userId?: string): Promise<boolean> {
  return flag('analytics.development_mode', userId);
}