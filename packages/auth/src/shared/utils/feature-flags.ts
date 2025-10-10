/**
 * Shared auth feature flag helpers
 */

import { safeClientEnv, safeServerEnv } from '../../../env';

type FlagValue = string | boolean | undefined | null;

const DEFAULT_ENABLED = false;

const toBoolean = (value: FlagValue): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const readServerFlag = (): boolean | undefined => {
  // Prefer process.env to respect runtime overrides
  const direct = toBoolean(process.env?.ENABLE_BETTER_AUTH);
  if (typeof direct !== 'undefined') return direct;

  // Fall back to validated env helper (server-only fields)
  const serverEnv = safeServerEnv();
  return toBoolean((serverEnv as Record<string, FlagValue>).ENABLE_BETTER_AUTH);
};

const readClientFlag = (): boolean | undefined => {
  const direct = toBoolean(process.env?.NEXT_PUBLIC_ENABLE_BETTER_AUTH);
  if (typeof direct !== 'undefined') return direct;

  const clientEnv = safeClientEnv();
  return toBoolean((clientEnv as Record<string, FlagValue>).NEXT_PUBLIC_ENABLE_BETTER_AUTH);
};

/**
 * Returns the canonical auth enable flag respecting server/client envs.
 */
export function authFeatureFlag(defaultValue: boolean = DEFAULT_ENABLED): boolean {
  if (typeof window === 'undefined') {
    const serverFlag = readServerFlag();
    if (typeof serverFlag !== 'undefined') return serverFlag;
    const publicFlag = readClientFlag();
    if (typeof publicFlag !== 'undefined') return publicFlag;
    return defaultValue;
  }

  const clientFlag = readClientFlag();
  if (typeof clientFlag !== 'undefined') return clientFlag;
  return defaultValue;
}

/**
 * Helper for server contexts (RSC, route handlers, middleware)
 */
export function isAuthEnabled(): boolean {
  return authFeatureFlag(DEFAULT_ENABLED);
}

/**
 * Helper for client components/hooks
 */
export function isAuthEnabledClient(): boolean {
  return authFeatureFlag(DEFAULT_ENABLED);
}

/**
 * Convenience helper for lazy-loading auth-only bundles in the client
 */
export function shouldLoadAuthComponents(): boolean {
  return isAuthEnabledClient();
}
