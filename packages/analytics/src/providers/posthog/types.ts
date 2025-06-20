/**
 * PostHog provider types
 */

export interface PostHogConfig {
  apiKey: string;
  options?: PostHogOptions;
}

export interface PostHogOptions {
  host?: string;
  autocapture?: boolean;
  capture_pageview?: boolean;
  capture_pageleave?: boolean;
  session_recording?: boolean;
  debug?: boolean;
  bootstrap?: BootstrapData;
  person_profiles?: 'always' | 'never' | 'identified_only';
  api?: {
    host?: string;
  };
  ui?: {
    host?: string;
  };
  feature_flag_request_timeout_ms?: number;
  advanced_disable_decide?: boolean;
  disable_surveys?: boolean;
  disable_toolbar?: boolean;
  disable_session_recording?: boolean;
  property_blacklist?: string[];
  sanitize_properties?: (properties: any, event: string) => any;
  request_headers?: Record<string, string>;
  respect_dnt?: boolean;
  opt_out_capturing_by_default?: boolean;
  opt_out_persistence_by_default?: boolean;
  opt_out_useragent_filter?: boolean;
  cross_subdomain_cookie?: boolean;
  persistence?: 'localStorage' | 'cookie' | 'memory' | 'localStorage+cookie';
  persistence_name?: string;
  cookie_name?: string;
  loaded?: (posthog: any) => void;
  on_xhr_error?: (failedRequest: XMLHttpRequest) => void;
  mask_all_element_attributes?: boolean;
  mask_all_text?: boolean;
  advanced_disable_feature_flags?: boolean;
  advanced_disable_feature_flags_on_first_load?: boolean;
  advanced_disable_toolbar_metrics?: boolean;
  segment?: any;
  name?: string;

  // Server-specific options
  flushAt?: number;
  flushInterval?: number;
  api_host?: string;
  ui_host?: string;
  fetch_options?: any;
}

export interface BootstrapData {
  distinctID?: string;
  isIdentifiedID?: boolean;
  featureFlags?: Record<string, any>;
  featureFlagPayloads?: Record<string, any>;
  sessionRecording?: {
    endpoint?: string;
  };
  surveys?: any[];
  toolbarParams?: Record<string, any>;
}

export interface ExperimentInfo {
  key: string;
  variant: string | boolean;
  payload?: any;
}

export interface EnhancedPostHogProvider {
  // Feature flag methods
  isFeatureEnabled(flag: string, userId?: string): Promise<boolean>;
  getFeatureFlag(flag: string, userId?: string): Promise<any>;
  getFeatureFlagPayload(flag: string): any;
  reloadFeatureFlags(): Promise<void>;
  getAllFlags(userId?: string): Promise<Record<string, any>>;

  // Experiment methods
  getActiveExperiments(userId?: string): Promise<ExperimentInfo[]>;

  // Bootstrap methods
  getBootstrapData(distinctId: string): Promise<BootstrapData>;

  // Session methods
  startSessionRecording(): void;
  stopSessionRecording(): void;

  // Advanced methods
  reset(): void;
  register(properties: Record<string, any>): void;
  unregister(property: string): void;
}
