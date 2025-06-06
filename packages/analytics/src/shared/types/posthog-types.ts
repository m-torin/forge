/**
 * PostHog-specific types
 */

export interface PostHogConfig {
  apiKey: string;
  options?: {
    // Core configuration (existing)
    api_host?: string;
    ui_host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    capture_pageleave?: boolean; // NEW: Critical for engagement tracking
    disable_session_recording?: boolean;
    cross_subdomain_cookie?: boolean;
    persistence?: 'localStorage' | 'cookie' | 'memory' | 'localStorage+cookie'; // EXPANDED
    persistence_name?: string;
    loaded?: (posthog: any) => void;

    // Privacy & GDPR compliance (NEW SECTION)
    person_profiles?: 'always' | 'never' | 'identified_only'; // Critical for GDPR
    opt_in_site_apps?: boolean; // Control over PostHog apps
    respect_dnt?: boolean; // Do Not Track header respect

    // Performance optimizations (NEW)
    uuid_version?: 'v4' | 'v7'; // UUID version for better performance
    request_batching?: boolean; // Batch requests for better performance
    batch_flush_interval_ms?: number; // Control batching timing

    // Session recording configuration (NEW SECTION)
    session_recording?: {
      maskAllInputs?: boolean;
      maskInputOptions?: {
        color?: boolean;
        date?: boolean;
        'datetime-local'?: boolean;
        email?: boolean;
        month?: boolean;
        number?: boolean;
        password?: boolean;
        range?: boolean;
        search?: boolean;
        tel?: boolean;
        text?: boolean;
        time?: boolean;
        url?: boolean;
        week?: boolean;
      };
      recordCrossOriginIframes?: boolean;
      recordCanvas?: boolean;
      maskTextSelector?: string;
      blockSelector?: string;
      sampling?: {
        minimumDurationMs?: number;
        sampleRate?: number;
      };
    };

    // Event processing hooks (NEW)
    before_send?: (event: any) => any | null; // Event preprocessing
    sanitize_properties?: (properties: any, event: string) => any; // Property sanitization

    // Debug and development (NEW)
    debug?: boolean;
    advanced_disable_decide?: boolean; // Disable feature flag requests

    // Server-side specific options
    flushAt?: number;
    flushInterval?: number;

    // Next.js specific options
    fetch_options?: {
      cache?: RequestCache;
      next?: {
        revalidate?: number;
        tags?: string[];
      };
    };

    // Bootstrap options
    bootstrap?: BootstrapData;
  };
}

export interface PostHogProperties {
  $set?: Record<string, any>;
  $set_once?: Record<string, any>;
  $unset?: string[];
  [key: string]: any;
}

export interface PostHogUserProperties {
  [key: string]: any;
  avatar?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface ExperimentInfo {
  key: string;
  payload?: Record<string, any>;
  variant?: string | boolean;
}

/**
 * Bootstrap data for server-side rendering
 */
export interface BootstrapData {
  distinctID: string;
}

/**
 * PostHog cookie structure
 */
export interface PostHogCookie {
  $sesid?: [number, string, number];
  $session_id?: string;
  $window_id?: string;
  distinct_id: string;
}

/**
 * Enhanced PostHog provider interface
 */
export interface EnhancedPostHogProvider {
  alias(userId: string, previousId: string): Promise<void>;
  group(groupId: string, traits?: any): Promise<void>;
  identify(userId: string, traits?: any): Promise<void>;
  page(name?: string, properties?: any): Promise<void>;
  // Standard analytics methods
  track(event: string, properties?: any): Promise<void>;

  // Experiment methods
  getActiveExperiments(userId?: string): Promise<ExperimentInfo[]>;

  // Bootstrap methods (server-side)
  getBootstrapData(distinctId: string): Promise<BootstrapData>;

  // Utility methods
  reset(): void;
  shutdown(): Promise<void>;
}

export type PostHogOptions = Record<string, any>;
