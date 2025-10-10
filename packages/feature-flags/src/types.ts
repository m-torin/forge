/**
 * Standardized Feature Flag Types
 * Vendor-agnostic abstractions for feature flags across all providers
 */

// ============================================================================
// CORE FEATURE FLAG TYPES
// ============================================================================

export type FlagValue = string | number | boolean | object | null;

export interface FlagContext {
  [key: string]: any;
  anonymousId?: string;
  attributes?: Record<string, any>;
  distinctId?: string;
  environment?: string;
  groups?: Record<string, string>;
  sessionId?: string;
  userId?: string;
}

export interface FlagEvaluationResult<T = FlagValue> {
  key: string;
  payload?: any;
  reason?: FlagEvaluationReason;
  ruleId?: string;
  segmentId?: string;
  source: "cache" | "network" | "fallback" | "default";
  timestamp: number;
  value: T;
  variant?: string;
}

export type FlagEvaluationReason =
  | "targeting_match"
  | "fallthrough"
  | "prerequisite_failed"
  | "individual_targeting"
  | "rule_match"
  | "percentage_rollout"
  | "experiment"
  | "off"
  | "error"
  | "unknown";

// ============================================================================
// FEATURE FLAG PROVIDER INTERFACE
// ============================================================================

export interface FeatureFlagProvider {
  readonly name: string;

  close(): Promise<void>;
  // Lifecycle
  initialize(context?: FlagContext): Promise<void>;

  // Flag evaluation
  getFlag<T = FlagValue>(
    key: string,
    defaultValue: T,
    context?: FlagContext,
  ): Promise<FlagEvaluationResult<T>>;

  getAllFlags(
    context?: FlagContext,
  ): Promise<Record<string, FlagEvaluationResult>>;

  // Variants and experiments
  getVariant(
    key: string,
    context?: FlagContext,
  ): Promise<{ variant: string; payload?: any } | null>;

  // Boolean helpers
  isEnabled(key: string, context?: FlagContext): Promise<boolean>;

  // Context management
  setContext(context: FlagContext): void;
  updateContext(updates: Partial<FlagContext>): void;

  // Real-time updates
  onFlagChange?(
    key: string,
    callback: (result: FlagEvaluationResult) => void,
  ): () => void;

  onFlagsChange?(
    callback: (changes: Record<string, FlagEvaluationResult>) => void,
  ): () => void;

  // Analytics integration
  trackExposure?(
    key: string,
    result: FlagEvaluationResult,
    context?: FlagContext,
  ): void;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface FlagConfig {
  // Provider configuration
  provider: string;

  // Provider-specific options
  options?: {
    // Common options
    apiKey?: string;
    sdkKey?: string;
    environment?: string;
    timeout?: number;
    pollInterval?: number;

    // Caching
    enableCache?: boolean;
    cacheTTL?: number;

    // Bootstrap data
    bootstrap?: Record<string, FlagValue>;

    // Real-time updates
    streaming?: boolean;

    // Analytics integration
    trackExposures?: boolean;
    analyticsProvider?: string;

    // Error handling
    fallbackStrategy?: "default" | "cache" | "last_known";

    // Provider-specific options
    [key: string]: any;
  };

  // Default context
  defaultContext?: FlagContext;

  // Error handling
  onError?: (error: Error, context?: any) => void;
  onReady?: () => void;
}

// ============================================================================
// MANAGER INTERFACE
// ============================================================================

export interface FeatureFlagManager {
  // Provider management
  addProvider(config: FlagConfig): Promise<void>;
  getProvider(name: string): FeatureFlagProvider | undefined;
  removeProvider(name: string): void;

  // Flag evaluation (uses primary provider or specific provider)
  getFlag<T = FlagValue>(
    key: string,
    defaultValue: T,
    options?: FlagEvaluationOptions,
  ): Promise<FlagEvaluationResult<T>>;

  getAllFlags(
    options?: FlagEvaluationOptions,
  ): Promise<Record<string, FlagEvaluationResult>>;

  isEnabled(key: string, options?: FlagEvaluationOptions): Promise<boolean>;

  getVariant(
    key: string,
    options?: FlagEvaluationOptions,
  ): Promise<{ variant: string; payload?: any } | null>;

  getContext(): FlagContext;
  // Context management
  setContext(context: FlagContext): void;
  updateContext(updates: Partial<FlagContext>): void;

  close(): Promise<void>;
  // Lifecycle
  initialize(): Promise<void>;
}

export interface FlagEvaluationOptions {
  context?: Partial<FlagContext>;
  fallbackStrategy?: "default" | "cache" | "last_known";
  provider?: string;
  timeout?: number;
  trackExposure?: boolean;
}

// ============================================================================
// EXPERIMENT TYPES
// ============================================================================

export interface ExperimentConfig {
  key: string;
  prerequisites?: ExperimentPrerequisite[];
  segments?: string[];
  traffic?: number;
  variants: ExperimentVariant[];
}

export interface ExperimentVariant {
  key: string;
  name?: string;
  payload?: any;
  weight: number; // 0-1, relative weight within the experiment
}

export interface ExperimentPrerequisite {
  flag: string;
  values: FlagValue[];
}

export interface ExperimentResult {
  inExperiment: boolean;
  key: string;
  payload?: any;
  reason: FlagEvaluationReason;
  variant: string;
}

// ============================================================================
// TYPED FLAG HELPERS
// ============================================================================

export interface TypedFlag<T = FlagValue> {
  defaultValue: T;
  description?: string;
  key: string;
  type?: "boolean" | "string" | "number" | "json";
  variants?: string[];
}

export type TypedFlagMap<T extends Record<string, any>> = {
  [K in keyof T]: TypedFlag<T[K]>;
};

// Create typed flag definitions
export function defineFlag<T>(
  key: string,
  defaultValue: T,
  options?: Omit<TypedFlag<T>, "key" | "defaultValue">,
): TypedFlag<T> {
  return {
    defaultValue,
    key,
    ...options,
  };
}

// ============================================================================
// CACHING TYPES
// ============================================================================

export interface FlagCache {
  clear(): void;
  delete(key: string): void;
  get(key: string): FlagEvaluationResult | null;
  keys(): string[];
  set(key: string, result: FlagEvaluationResult, ttl?: number): void;
}

export interface CacheConfig {
  enabled: boolean;
  maxSize?: number;
  strategy?: "lru" | "fifo" | "ttl";
  ttl: number; // milliseconds
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class FeatureFlagError extends Error {
  constructor(
    message: string,
    public readonly code: FlagErrorCode,
    public readonly provider?: string,
    public readonly flagKey?: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "FeatureFlagError";
  }
}

export type FlagErrorCode =
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_NOT_INITIALIZED"
  | "FLAG_NOT_FOUND"
  | "EVALUATION_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_CONTEXT"
  | "INVALID_CONFIGURATION"
  | "AUTHENTICATION_ERROR";

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface FlagMetrics {
  avgResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  evaluations: number;
  lastEvaluation?: number;
  provider: string;
}

export interface FlagDebugInfo {
  cacheStatus: "hit" | "miss" | "stale";
  context: FlagContext;
  errors?: Error[];
  evaluationTime: number;
  key: string;
  provider: string;
  result: FlagEvaluationResult;
}
