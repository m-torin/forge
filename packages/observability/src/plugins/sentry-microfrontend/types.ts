/**
 * Types for Sentry Micro Frontend Plugin
 */

import type { SentryPluginConfig } from '../sentry';

/**
 * Configuration for a specific micro frontend backstageApp
 */
export interface BackstageAppConfig {
  /**
   * Name of the backstageApp (e.g., 'cms', 'workflows', 'authmgmt')
   */
  name: string;

  /**
   * Sentry DSN for this backstageApp (optional, uses default if not provided)
   */
  dsn?: string;

  /**
   * Release version for this backstageApp
   */
  release?: string;

  /**
   * Additional tags to apply to events from this backstageApp
   */
  tags?: Record<string, string>;

  /**
   * Path patterns that identify this backstageApp
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
   * The backstageApp identifier for this micro frontend (e.g., 'cms', 'workflows')
   */
  backstageApp?: string;

  /**
   * Configuration for all backstage (only used in host mode)
   */
  backstageApps?: BackstageAppConfig[];

  /**
   * Whether to detect and use parent Sentry instance
   * @default true
   */
  detectParent?: boolean;

  /**
   * Custom function to detect the current backstageApp
   */
  backstageAppDetector?: () => string | undefined;

  /**
   * Whether to add backstageApp information to all events
   * @default true
   */
  addBackstageContext?: boolean;

  /**
   * Fallback DSN to use if backstageApp-specific DSN is not found
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
    __SENTRY_MICRO_FRONTEND_APP__?: string;
  }
}
