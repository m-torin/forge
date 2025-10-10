/**
 * PostHog-specific types
 */

import type { BaseProviderConfig } from '@repo/3p-core/types';

export interface PostHogConfig extends BaseProviderConfig {
  provider: 'posthog';
  apiKey: string;
  host?: string;
  ui_host?: string;

  // PostHog-specific options
  autocapture?: boolean;
  capture_pageview?: boolean;
  capture_pageleave?: boolean;
  cross_subdomain_cookie?: boolean;
  persistence?: 'localStorage' | 'cookie' | 'memory' | 'sessionStorage';
  persistence_name?: string;
  cookie_name?: string;
  loaded?: (posthog: any) => void;

  // Session recording
  session_recording?: {
    recordHeaders?: boolean;
    recordBody?: boolean;
    maskAllInputs?: boolean;
    maskInputOptions?: Record<string, boolean>;
    blockClass?: string;
    blockSelector?: string;
    ignoreClass?: string;
    maskTextClass?: string;
    maskTextSelector?: string;
  };

  // Feature flags
  bootstrap?: {
    distinctID?: string;
    isIdentifiedID?: boolean;
    featureFlags?: Record<string, boolean | string>;
    featureFlagPayloads?: Record<string, any>;
  };

  // Experiments
  opt_out_useragent_filter?: boolean;
  opt_out_capturing_by_default?: boolean;

  // Advanced
  sanitize_properties?: (properties: Record<string, any>, eventName: string) => Record<string, any>;
  property_blacklist?: string[];
  respect_dnt?: boolean;
  secure_cookie?: boolean;
  custom_campaign_params?: string[];
  save_referrer?: boolean;
  verbose?: boolean;

  // Node.js specific (server-side)
  personalApiKey?: string;
  projectId?: string;
  flushAt?: number;
  flushInterval?: number;
  requestTimeout?: number;
}

export interface PostHogEvent {
  event: string;
  properties?: Record<string, any>;
  distinctId?: string;
  groups?: Record<string, string>;
  sendFeatureFlags?: boolean;
  timestamp?: Date | string;
  uuid?: string;
}

export interface PostHogIdentifyPayload {
  distinctId: string;
  properties?: Record<string, any>;
  groups?: Record<string, string>;
}

export interface PostHogGroupPayload {
  groupType: string;
  groupKey: string;
  properties?: Record<string, any>;
  distinctId?: string;
}

export interface PostHogFeatureFlag {
  key: string;
  value: boolean | string | number;
  payload?: any;
  matchValue?: any;
  reason?: string;
}

export interface PostHogExperiment {
  key: string;
  variant: string;
  payload?: any;
  featureFlag?: string;
  featureFlagPayload?: any;
}

export interface PostHogCohort {
  id: string;
  name: string;
  description?: string;
  count?: number;
  is_calculating?: boolean;
  errors_calculating?: number;
  last_calculation?: string;
  created_at?: string;
  created_by?: {
    id: number;
    uuid: string;
    distinct_id: string;
    first_name: string;
    email: string;
  };
}

export interface PostHogSessionRecording {
  session_id: string;
  distinct_id: string;
  start_time: string;
  end_time?: string;
  recording_duration?: number;
  click_count?: number;
  keypress_count?: number;
  mouse_activity_count?: number;
  active_milliseconds?: number;
}

// PostHog API response types
export interface PostHogFeatureFlagsResponse {
  featureFlags: Record<string, boolean | string>;
  featureFlagPayloads: Record<string, any>;
  errorsWhileComputingFlags: boolean;
}

export interface PostHogPersonProfile {
  distinct_ids: string[];
  properties: Record<string, any>;
  created_at: string;
  uuid: string;
}

export type PostHogEventType =
  | '$pageview'
  | '$pageleave'
  | '$autocapture'
  | '$identify'
  | '$create_alias'
  | '$groupidentify'
  | '$feature_flag_called'
  | '$experiment_activated'
  | string;
