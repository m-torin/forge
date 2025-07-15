/**
 * Feature Flags v4 Type Definitions
 * Complete with JSDoc documentation and v4 naming conventions
 */

// Re-export core types from flags SDK with JSDoc enhancements
import type { FlagOverridesType as BaseFlagOverridesType } from 'flags';

/**
 * Type definitions for flag values with comprehensive JSDoc documentation
 * Represents the resolved values of feature flags after evaluation
 *
 * @example
 * ```typescript
 * const flagValues: FlagValuesType = {
 *   'checkout-flow': 'variant-a',
 *   'show-banner': true,
 *   'max-items': 10
 * };
 * ```
 */
export type FlagValuesType = Record<string, any>;

/**
 * Flag definitions type with v4 naming conventions
 * Includes the new 'origin' field (replaces 'url' from v3)
 *
 * @example
 * ```typescript
 * const definitions: FlagDefinitionsType = {
 *   'my-flag': {
 *     key: 'my-flag',
 *     defaultValue: false,
 *     origin: 'https://vercel.com/flags', // v4: was 'url' in v3
 *     options: [
 *       { value: true, label: 'Enabled' },
 *       { value: false, label: 'Disabled' }
 *     ]
 *   }
 * };
 * ```
 */
export interface FlagDefinitionsType {
  [key: string]: FlagDefinition;
}

/**
 * Individual flag definition with v4 enhancements
 * Updated with new field names and improved structure
 */
export interface FlagDefinition {
  /** Unique identifier for the flag */
  key: string;

  /** Default value when flag cannot be evaluated */
  defaultValue?: any;

  /**
   * Origin URL for flag definition (v4: replaces 'url' field)
   * Used by Flags Explorer and debugging tools
   */
  origin?: string;

  /** Human-readable description of the flag */
  description?: string;

  /** Available options for the flag */
  options?: Array<{
    value: any;
    label: string;
    description?: string;
  }>;

  /**
   * Flag evaluation function
   * @param context - Evaluation context (user, request, etc.)
   * @returns Promise resolving to flag value
   */
  decide?: (context?: any) => Promise<any> | any;

  /** Flag adapter for external provider integration */
  adapter?: any;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * API data structure returned by discovery endpoints
 * Complete data package for flag consumption
 */
export interface ApiData {
  /** Flag definitions with metadata */
  definitions: FlagDefinitionsType;

  /** Current flag values */
  values: FlagValuesType;

  /** Override values for testing/debugging */
  overrides: BaseFlagOverridesType;

  /** Treatment assignments for experiments */
  treatments: Record<string, any>;

  /** Optional encryption mode override */
  overrideEncryptionMode?: boolean;
}

/**
 * Flag overrides type with comprehensive JSDoc documentation
 * Used for testing and debugging flag values
 *
 * @example
 * ```typescript
 * const overrides: FlagOverridesType = {
 *   'checkout-flow': 'test-variant',
 *   'show-banner': false
 * };
 * ```
 */
export type FlagOverridesType = BaseFlagOverridesType;

/**
 * Context information for flag evaluation
 * Provides user and request data to flag decision functions
 */
export interface FlagContext {
  /** User identification */
  user?: {
    id?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };

  /** Request information */
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };

  /** Geographic information */
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };

  /** Device information */
  device?: {
    type?: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
  };

  /** Custom context data */
  [key: string]: any;
}

/**
 * Provider adapter interface for external integrations
 * Standardized interface for PostHog, Edge Config, etc.
 */
export interface ProviderAdapter<T = any, E = any> {
  /** Adapter name for identification */
  name: string;

  /** Check if feature is enabled */
  isFeatureEnabled?: (context?: E) => Promise<boolean> | boolean;

  /** Get feature flag value */
  featureFlagValue?: (context?: E) => Promise<T> | T;

  /** Get feature flag payload */
  featureFlagPayload?: (context?: E) => Promise<T> | T;

  /** Provider-specific configuration */
  config?: Record<string, any>;
}

/**
 * Next.js specific types for framework integration
 */

/**
 * Cookie store interface for Next.js integration
 * Provides access to request cookies in server components
 */
export interface CookieStore {
  /**
   * Get cookie value by name
   * @param name - Cookie name
   * @returns Cookie object with value or undefined
   */
  get(name: string): { value: string } | undefined;
}

/**
 * Header store interface for Next.js integration
 * Provides access to request headers in server components
 */
export interface HeaderStore {
  /**
   * Get header value by name
   * @param name - Header name
   * @returns Header value or null
   */
  get(name: string): string | null;
}

/**
 * Analytics integration types
 */

/**
 * Flag exposure event data for analytics tracking
 */
export interface FlagExposureEvent {
  /** Flag key that was evaluated */
  flagKey: string;

  /** Resolved flag value */
  value: any;

  /** Evaluation timestamp */
  timestamp: string;

  /** Evaluation context */
  context: Record<string, any>;

  /** Event type identifier */
  type: 'flag_exposure';
}

/**
 * Analytics configuration for Vercel Analytics integration
 */
export interface AnalyticsConfig {
  /** Flag keys to track in analytics */
  trackedKeys: string[];

  /** Whether to include flag metadata */
  includeMetadata: boolean;

  /** Environment identifier */
  environment: string;

  /** Additional analytics properties */
  properties?: Record<string, any>;
}

/**
 * Error types for better error handling and debugging
 */

/**
 * Flag evaluation error with detailed context
 */
export class FlagEvaluationError extends Error {
  constructor(
    message: string,
    public flagKey: string,
    public context?: any,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'FlagEvaluationError';
  }
}

/**
 * Provider connection error for adapter failures
 */
export class ProviderConnectionError extends Error {
  constructor(
    message: string,
    public provider: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ProviderConnectionError';
  }
}

/**
 * Encryption error for security-related failures
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public operation: 'encrypt' | 'decrypt',
    public cause?: Error,
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Type guards for runtime type checking
 */

/**
 * Check if value is a valid flag definition
 */
export function isFlagDefinition(value: any): value is FlagDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.key === 'string' &&
    value.key.length > 0
  );
}

/**
 * Check if value is valid API data
 */
export function isApiData(value: any): value is ApiData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.definitions === 'object' &&
    typeof value.values === 'object' &&
    typeof value.overrides === 'object' &&
    typeof value.treatments === 'object'
  );
}

/**
 * Utility types for advanced usage
 */

/**
 * Extract flag value type from flag definition
 */
export type FlagValue<T extends FlagDefinition> = T['defaultValue'];

/**
 * Create typed flag values from definitions
 */
export type TypedFlagValues<T extends FlagDefinitionsType> = {
  [K in keyof T]: FlagValue<T[K]>;
};

/**
 * Provider data extraction utility type
 */
export type ProviderData<T extends ProviderAdapter> =
  T extends ProviderAdapter<infer U> ? U : never;
