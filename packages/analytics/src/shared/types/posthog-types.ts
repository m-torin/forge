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
    capture_pageleave?: boolean;
    disable_session_recording?: boolean;
    cross_subdomain_cookie?: boolean;
    persistence?: "localStorage" | "cookie" | "memory" | "localStorage+cookie";
    persistence_name?: string;
    loaded?: (posthog: any) => void;

    // Privacy & GDPR compliance (NEW SECTION)
    person_profiles?: "always" | "never" | "identified_only";
    opt_in_site_apps?: boolean;
    respect_dnt?: boolean;

    // Performance optimizations (NEW)
    uuid_version?: "v4" | "v7";
    request_batching?: boolean;
    batch_flush_interval_ms?: number;

    // Session recording configuration (NEW SECTION)
    session_recording?: {
      maskAllInputs?: boolean;
      maskInputOptions?: {
        color?: boolean;
        date?: boolean;
        "datetime-local"?: boolean;
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
    before_send?: (event: any) => any | null;
    sanitize_properties?: (properties: any, event: string) => any;

    // Debug and development (NEW)
    debug?: boolean;
    advanced_disable_decide?: boolean;

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

interface _PostHogProperties {
  $set?: Record<string, any>;
  $set_once?: Record<string, any>;
  $unset?: string[];
  [key: string]: any;
}

interface _PostHogUserProperties {
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
