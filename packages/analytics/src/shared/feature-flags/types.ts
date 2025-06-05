/**
 * Standardized Feature Flag Types
 * Vendor-agnostic abstractions for feature flags across all providers
 */

// ============================================================================
// CORE FEATURE FLAG TYPES
// ============================================================================

export type FlagValue = string | number | boolean | object | null;

export interface FlagContext {
  userId?: string;
  distinctId?: string;
  anonymousId?: string;
  sessionId?: string;
  groups?: Record<string, string>;
  attributes?: Record<string, any>;
  environment?: string;
  [key: string]: any;
}

export interface FlagEvaluationResult<T = FlagValue> {
  key: string;
  value: T;
  variant?: string;
  reason?: FlagEvaluationReason;
  payload?: any;
  source: 'cache' | 'network' | 'fallback' | 'default';
  timestamp: number;
  ruleId?: string;
  segmentId?: string;
}

export type FlagEvaluationReason = 
  | 'targeting_match'
  | 'fallthrough'
  | 'prerequisite_failed'
  | 'individual_targeting'
  | 'rule_match'
  | 'percentage_rollout'
  | 'experiment'
  | 'off'
  | 'error'
  | 'unknown';

// ============================================================================
// FEATURE FLAG PROVIDER INTERFACE
// ============================================================================

export interface FeatureFlagProvider {
  readonly name: string;
  
  // Lifecycle
  initialize(context?: FlagContext): Promise<void>;
  close(): Promise<void>;
  
  // Flag evaluation
  getFlag<T = FlagValue>(
    key: string, 
    defaultValue: T, 
    context?: FlagContext
  ): Promise<FlagEvaluationResult<T>>;
  
  getAllFlags(context?: FlagContext): Promise<Record<string, FlagEvaluationResult>>;
  
  // Variants and experiments
  getVariant(
    key: string, 
    context?: FlagContext
  ): Promise<{ variant: string; payload?: any } | null>;
  
  // Boolean helpers
  isEnabled(key: string, context?: FlagContext): Promise<boolean>;
  
  // Context management
  setContext(context: FlagContext): void;
  updateContext(updates: Partial<FlagContext>): void;
  
  // Real-time updates
  onFlagChange?(
    key: string, 
    callback: (result: FlagEvaluationResult) => void
  ): () => void;
  
  onFlagsChange?(
    callback: (changes: Record<string, FlagEvaluationResult>) => void
  ): () => void;
  
  // Analytics integration
  trackExposure?(
    key: string, 
    result: FlagEvaluationResult, 
    context?: FlagContext
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
    fallbackStrategy?: 'default' | 'cache' | 'last_known';
    
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
  removeProvider(name: string): void;
  getProvider(name: string): FeatureFlagProvider | undefined;
  
  // Flag evaluation (uses primary provider or specific provider)
  getFlag<T = FlagValue>(
    key: string, 
    defaultValue: T, 
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationResult<T>>;
  
  getAllFlags(options?: FlagEvaluationOptions): Promise<Record<string, FlagEvaluationResult>>;
  
  isEnabled(
    key: string, 
    options?: FlagEvaluationOptions
  ): Promise<boolean>;
  
  getVariant(
    key: string, 
    options?: FlagEvaluationOptions
  ): Promise<{ variant: string; payload?: any } | null>;
  
  // Context management
  setContext(context: FlagContext): void;
  updateContext(updates: Partial<FlagContext>): void;
  getContext(): FlagContext;
  
  // Lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export interface FlagEvaluationOptions {
  provider?: string;
  context?: Partial<FlagContext>;
  timeout?: number;
  trackExposure?: boolean;
  fallbackStrategy?: 'default' | 'cache' | 'last_known';
}

// ============================================================================
// EXPERIMENT TYPES
// ============================================================================

export interface ExperimentConfig {
  key: string;
  variants: ExperimentVariant[];
  traffic?: number; // 0-1, percentage of users to include
  segments?: string[];
  prerequisites?: ExperimentPrerequisite[];
}

export interface ExperimentVariant {
  key: string;
  name?: string;
  weight: number; // 0-1, relative weight within the experiment
  payload?: any;
}

export interface ExperimentPrerequisite {
  flag: string;
  values: FlagValue[];
}

export interface ExperimentResult {
  key: string;
  variant: string;
  inExperiment: boolean;
  payload?: any;
  reason: FlagEvaluationReason;
}

// ============================================================================
// TYPED FLAG HELPERS
// ============================================================================

export interface TypedFlag<T = FlagValue> {
  key: string;
  defaultValue: T;
  description?: string;
  type?: 'boolean' | 'string' | 'number' | 'json';
  variants?: string[];
}

export type TypedFlagMap<T extends Record<string, any>> = {
  [K in keyof T]: TypedFlag<T[K]>;
};

// Create typed flag definitions
export function defineFlag<T>(
  key: string, 
  defaultValue: T, 
  options?: Omit<TypedFlag<T>, 'key' | 'defaultValue'>
): TypedFlag<T> {
  return {
    key,
    defaultValue,
    ...options
  };
}

// ============================================================================
// CACHING TYPES
// ============================================================================

export interface FlagCache {
  get(key: string): FlagEvaluationResult | null;
  set(key: string, result: FlagEvaluationResult, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // milliseconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'ttl';
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
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FeatureFlagError';
  }
}

export type FlagErrorCode = 
  | 'PROVIDER_NOT_FOUND'
  | 'PROVIDER_NOT_INITIALIZED'
  | 'FLAG_NOT_FOUND'
  | 'EVALUATION_ERROR'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INVALID_CONTEXT'
  | 'INVALID_CONFIGURATION'
  | 'AUTHENTICATION_ERROR';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface FlagMetrics {
  provider: string;
  evaluations: number;
  errors: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  lastEvaluation?: number;
}

export interface FlagDebugInfo {
  key: string;
  provider: string;
  context: FlagContext;
  result: FlagEvaluationResult;
  evaluationTime: number;
  cacheStatus: 'hit' | 'miss' | 'stale';
  errors?: Error[];
}