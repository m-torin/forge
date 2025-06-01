'use client';

import { useEffect, useState } from 'react';

/**
 * Client-side feature flag functions
 * Uses PostHog for flag evaluation and automatically tracks usage
 */

// Type declaration for PostHog on window
declare global {
  interface Window {
    posthog?: {
      isFeatureEnabled(key: string): boolean | undefined;
      [key: string]: any;
    };
  }
}

// Parse local flags once at startup
let localFlags: Record<string, boolean> | null = null;
if (typeof window !== 'undefined') {
  const localFlagsEnv = process.env.NEXT_PUBLIC_LOCAL_FLAGS;
  if (localFlagsEnv) {
    try {
      localFlags = JSON.parse(localFlagsEnv);
      console.log('[Analytics] Using local feature flags:', Object.keys(localFlags || {}).length, 'flags');
    } catch (error) {
      console.error('[Analytics] Failed to parse LOCAL_FLAGS:', error);
    }
  }
}

/**
 * Client-side feature flag evaluation
 * Note: This only works on the client side. For server-side evaluation, use @repo/analytics/server
 * 
 * @param key - The feature flag key
 * @param userId - User ID for flag evaluation (unused in client)
 * @returns Promise<boolean> - Whether the flag is enabled
 */
export async function flag(key: string, userId?: string): Promise<boolean> {
  // 1. Check environment variable override first
  const envOverride = process.env[`NEXT_PUBLIC_FF_${key.toUpperCase().replace(/\./g, '_')}`];
  if (envOverride !== undefined) {
    console.log(`[Analytics] Using env override for ${key}: ${envOverride}`);
    return envOverride === 'true';
  }

  // 2. Check local flags (for development)
  if (localFlags && key in localFlags) {
    console.log(`[Analytics] Using local flag for ${key}: ${localFlags[key]}`);
    return localFlags[key];
  }

  // 3. Client-side: Use PostHog client
  if (typeof window !== 'undefined' && window.posthog) {
    return window.posthog.isFeatureEnabled(key) ?? false;
  }

  // 4. Default to false
  console.log(`[Analytics] PostHog not available for flag ${key}, defaulting to false`);
  return false;
}

/**
 * Client-side bulk feature flag evaluation
 * 
 * @param keys - Array of feature flag keys
 * @param userId - User ID for flag evaluation (unused in client)
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
 * React hook for feature flags
 * 
 * @param key - The feature flag key
 * @param userId - Optional user ID (unused in client)
 * @returns boolean - Whether the flag is enabled
 */
export function useFlag(key: string, userId?: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    flag(key, userId).then(setEnabled);
  }, [key, userId]);

  return enabled;
}