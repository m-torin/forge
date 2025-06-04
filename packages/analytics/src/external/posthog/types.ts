/**
 * PostHog-specific types
 */

export interface PostHogConfig {
  apiKey: string;
  options?: {
    api_host?: string;
    ui_host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    disable_session_recording?: boolean;
    cross_subdomain_cookie?: boolean;
    persistence?: 'localStorage' | 'cookie' | 'memory';
    persistence_name?: string;
    loaded?: (posthog: any) => void;
  };
}

export interface PostHogProperties {
  [key: string]: any;
  $set?: Record<string, any>;
  $set_once?: Record<string, any>;
  $unset?: string[];
}

export interface PostHogUserProperties {
  [key: string]: any;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}