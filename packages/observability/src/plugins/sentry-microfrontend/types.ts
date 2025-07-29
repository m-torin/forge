/**
 * Types for Sentry Micro Frontend Plugin
 */

import type { SentryPluginConfig } from '../sentry';

/**
 * Configuration for a specific micro frontend zone
 */
export interface ZoneConfig {
  /**
   * Name of the zone (e.g., 'cms', 'workflows', 'authmgmt')
   */
  name: string;

  /**
   * Sentry DSN for this zone (optional, uses default if not provided)
   */
  dsn?: string;

  /**
   * Release version for this zone
   */
  release?: string;

  /**
   * Additional tags to apply to events from this zone
   */
  tags?: Record<string, string>;

  /**
   * Path patterns that identify this zone
   */
  pathPatterns?: (string | RegExp)[];
}

/**
 * Mode of operation for the micro frontend
 */
export type MicroFrontendMode = 'host' | 'child' | 'standalone';

/**
 * Configuration for Sentry Micro Frontend Plugin
 */
export interface SentryMicroFrontendConfig extends Omit<SentryPluginConfig, 'transport'> {
  /**
   * Whether this is the host application that manages routing
   */
  isHost?: boolean;

  /**
   * The zone identifier for this micro frontend (e.g., 'cms', 'workflows')
   */
  zone?: string;

  /**
   * Configuration for all zones (only used in host mode)
   */
  zones?: ZoneConfig[];

  /**
   * Whether to detect and use parent Sentry instance
   * @default true
   */
  detectParent?: boolean;

  /**
   * Custom function to detect the current zone
   */
  zoneDetector?: () => string | undefined;

  /**
   * Whether to add zone information to all events
   * @default true
   */
  addZoneContext?: boolean;

  /**
   * Fallback DSN to use if zone-specific DSN is not found
   */
  fallbackDsn?: string;

  /**
   * Whether to use multiplexed transport in host mode
   * @default true
   */
  useMultiplexedTransport?: boolean;

  /**
   * Global tags to apply to all events
   */
  globalTags?: Record<string, string>;

  /**
   * Whether to prevent initialization if parent exists
   * @default true
   */
  preventDuplicateInit?: boolean;

  /**
   * Integration configuration to be handled during initialization
   */
  integrationConfig?: {
    nodeProfilingIntegration?: boolean;
    captureConsoleIntegration?: boolean;
    vercelAIIntegration?: boolean;
  };

  /**
   * Sentry experimental features
   */
  _experiments?: {
    enableLogs?: boolean;
  };
}

/**
 * Extended window interface for Sentry
 */
declare global {
  interface Window {
    Sentry?: any;
    __SENTRY_MICRO_FRONTEND_HOST__?: boolean;
    __SENTRY_MICRO_FRONTEND_ZONE__?: string;
  }
}
