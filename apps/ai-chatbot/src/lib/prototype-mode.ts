'use client';

import { env } from '#/root/env';

/**
 * Check if prototype mode is enabled
 * @returns Boolean indicating if prototype mode is active
 */
export function isPrototypeMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variable
    return process.env.NEXT_PUBLIC_PROTOTYPE_MODE === 'true';
  }

  // Client-side: check environment variable or localStorage override
  const envMode = env.NEXT_PUBLIC_PROTOTYPE_MODE === 'true';
  const localOverride = localStorage.getItem('prototype-mode');

  return localOverride ? localOverride === 'true' : envMode;
}

/**
 * Toggle prototype mode (client-side only)
 * @returns New prototype mode state
 */
export function togglePrototypeMode(): boolean {
  if (typeof window === 'undefined') return false;

  const current = isPrototypeMode();
  const newMode = !current;

  localStorage.setItem('prototype-mode', String(newMode));

  // Reload page to apply changes
  window.location.reload();

  return newMode;
}

/**
 * Get prototype mode status with environment fallback
 * @returns Object with mode status, source, and toggle capability
 */
export function getPrototypeModeStatus() {
  const isEnabled = isPrototypeMode();
  const source =
    typeof window !== 'undefined' && localStorage.getItem('prototype-mode')
      ? 'localStorage'
      : 'environment';

  return {
    enabled: isEnabled,
    source,
    canToggle: typeof window !== 'undefined',
  };
}
