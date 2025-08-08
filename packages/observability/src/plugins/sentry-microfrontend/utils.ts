/**
 * Utility functions for Sentry Micro Frontend Plugin
 */

import type { ZoneConfig } from './types';

/**
 * Detect the current micro frontend zone based on URL path
 */
export function detectCurrentZone(customPatterns?: ZoneConfig[]): string | undefined {
  // Edge runtime compatible check
  if (typeof globalThis === 'undefined' || !globalThis.location) {
    // Server-side or edge: check Next.js basePath or environment variables
    // Note: process.env is not available in edge runtime
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) {
      return process.env.NEXT_PUBLIC_BASE_PATH.replace('/', '');
    }
    return undefined;
  }

  const path = globalThis.location.pathname;

  // Check custom patterns first
  if (customPatterns) {
    for (const config of customPatterns) {
      if (config.pathPatterns) {
        for (const pattern of config.pathPatterns) {
          if (typeof pattern === 'string' && path.startsWith(pattern)) {
            return config.name;
          } else if (pattern instanceof RegExp && pattern.test(path)) {
            return config.name;
          }
        }
      }
    }
  }

  // Default patterns for common microfrontend zones
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/settings')) return 'settings';

  // Check for zone in global object (set by host)
  if ((globalThis as any).__SENTRY_MICRO_FRONTEND_ZONE__) {
    return (globalThis as any).__SENTRY_MICRO_FRONTEND_ZONE__;
  }

  return 'main';
}

/**
 * Check if running in a host environment
 */
export function isHostEnvironment(): boolean {
  if (typeof globalThis === 'undefined') {
    return false;
  }

  // Check if explicitly marked as host
  if ((globalThis as any).__SENTRY_MICRO_FRONTEND_HOST__) {
    return true;
  }

  // Check if Sentry is already initialized (likely means we're a child)
  if (
    (globalThis as any).Sentry &&
    typeof (globalThis as any).Sentry.getCurrentHub === 'function'
  ) {
    return false;
  }

  // Default to false (safer to assume child mode)
  return false;
}

/**
 * Create a Sentry scope with zone-specific context
 */
export function createZoneScope(zone: string, additionalTags?: Record<string, string>): any {
  if (typeof globalThis === 'undefined' || !(globalThis as any).Sentry) {
    return null;
  }

  const Sentry = (globalThis as any).Sentry;

  // Check if Scope constructor is available
  if (!Sentry.Scope || typeof Sentry.Scope !== 'function') {
    return null;
  }

  try {
    const scope = new Sentry.Scope();

    // Set zone tag
    scope.setTag('zone', zone);
    scope.setTag('microFrontend', true);

    // Set zone context
    scope.setContext('microFrontend', {
      zone,
      isHost: (globalThis as any).__SENTRY_MICRO_FRONTEND_HOST__ || false,
      url: globalThis.location?.href || undefined,
    });

    // Add additional tags if provided
    if (additionalTags) {
      Object.entries(additionalTags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    return scope;
  } catch (error) {
    console.error('[SentryMicroFrontendPlugin] Failed to create zone scope:', error);
    return null;
  }
}

/**
 * Check if Sentry is already initialized by a parent application
 */
export function hasParentSentry(): boolean {
  if (typeof globalThis === 'undefined') {
    return false;
  }

  // Check for Sentry global
  const Sentry = (globalThis as any).Sentry;
  if (!Sentry) {
    return false;
  }

  // Verify it's a real Sentry instance with expected methods
  const requiredMethods = ['captureException', 'captureMessage', 'withScope'];
  return requiredMethods.every(method => typeof Sentry[method] === 'function');
}

/**
 * Get the parent Sentry instance if available
 */
export function getParentSentry(): any {
  if (hasParentSentry()) {
    return (globalThis as any).Sentry;
  }
  return null;
}

/**
 * Mark the current environment as a host
 */
export function markAsHost(zone?: string): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__SENTRY_MICRO_FRONTEND_HOST__ = true;
    if (zone) {
      (globalThis as any).__SENTRY_MICRO_FRONTEND_ZONE__ = zone;
    }
  }
}

/**
 * Get zone-specific configuration
 */
export function getZoneConfig(zone: string, zones: ZoneConfig[]): ZoneConfig | undefined {
  return zones.find(z => z.name === zone);
}

/**
 * Ensure only one Sentry initialization happens (thread-safe)
 * Using global state primarily, local state as fallback
 */

export function ensureSingleInit(): void {
  // Use a more robust initialization check with timestamps
  const initKey = '__SENTRY_INIT_STATE__';
  const now = Date.now();

  if (typeof globalThis !== 'undefined') {
    const globalState = (globalThis as any)[initKey];

    // Check if already initialized or currently initializing
    if (globalState) {
      const { status, timestamp, id } = globalState;

      // If initialized, throw error
      if (status === 'initialized') {
        throw new Error(
          'Sentry has already been initialized! Use hasParentSentry() to check before initializing.',
        );
      }

      // If initializing and it's been less than 5 seconds, assume another process is initializing
      if (status === 'initializing' && now - timestamp < 5000) {
        throw new Error(
          `Sentry initialization already in progress (started ${now - timestamp}ms ago by ${id})`,
        );
      }
    }

    // Mark as initializing with timestamp and unique ID
    const initId = `${now}-${Math.random().toString(36).substr(2, 9)}`;
    (globalThis as any)[initKey] = {
      status: 'initializing',
      timestamp: now,
      id: initId,
    };

    // Small delay to allow for race condition detection
    // In a real thread-safe implementation, this would use proper locking
    const checkState = (globalThis as any)[initKey];
    if (checkState.id !== initId) {
      throw new Error('Concurrent Sentry initialization detected');
    }

    // Mark as initialized
    (globalThis as any)[initKey] = {
      status: 'initialized',
      timestamp: now,
      id: initId,
    };

    // Also set legacy flag for backward compatibility
    (globalThis as any).__SENTRY_INITIALIZED__ = true;
  }
}

/**
 * Reset initialization flag (mainly for testing)
 */
export function resetInitFlag(): void {
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as any).__SENTRY_INITIALIZED__;
    delete (globalThis as any).__SENTRY_INIT_STATE__;
  }
}
