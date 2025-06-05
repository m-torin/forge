/**
 * Feature Flag Emitters
 * Standardized emitter functions for feature flag operations
 */

import type { FlagContext, FlagEvaluationOptions, FlagValue, TypedFlag } from './types';

// ============================================================================
// CORE FEATURE FLAG EMITTERS
// ============================================================================

export interface FlagEvaluationPayload {
  context?: FlagContext;
  defaultValue: any;
  key: string;
  options?: FlagEvaluationOptions;
  timestamp: number;
  type: 'flag_evaluation';
}

export interface FlagExposurePayload {
  context?: FlagContext;
  key: string;
  reason?: string;
  timestamp: number;
  type: 'flag_exposure';
  value: FlagValue;
  variant?: string;
}

export interface FlagContextPayload {
  context: FlagContext;
  timestamp: number;
  type: 'flag_context_update';
}

export interface FlagBatchEvaluationPayload {
  context?: FlagContext;
  keys: string[];
  options?: FlagEvaluationOptions;
  timestamp: number;
  type: 'flag_batch_evaluation';
}

export type FeatureFlagPayload =
  | FlagEvaluationPayload
  | FlagExposurePayload
  | FlagContextPayload
  | FlagBatchEvaluationPayload;

// ============================================================================
// EMITTER FUNCTIONS
// ============================================================================

/**
 * Evaluate a single feature flag
 */
export function evaluateFlag<T extends FlagValue = FlagValue>(
  key: string,
  defaultValue: T,
  options?: {
    context?: FlagContext;
    provider?: string;
    trackExposure?: boolean;
    timeout?: number;
  },
): FlagEvaluationPayload {
  return {
    type: 'flag_evaluation',
    context: options?.context,
    defaultValue,
    key,
    options: {
      provider: options?.provider,
      timeout: options?.timeout,
      trackExposure: options?.trackExposure,
    },
    timestamp: Date.now(),
  };
}

/**
 * Track feature flag exposure for analytics
 */
export function trackFlagExposure(
  key: string,
  value: FlagValue,
  options?: {
    variant?: string;
    context?: FlagContext;
    reason?: string;
    properties?: Record<string, any>;
  },
): FlagExposurePayload {
  return {
    type: 'flag_exposure',
    context: options?.context,
    key,
    reason: options?.reason,
    timestamp: Date.now(),
    value,
    variant: options?.variant,
  };
}

/**
 * Update feature flag context
 */
export function updateFlagContext(context: FlagContext): FlagContextPayload {
  return {
    type: 'flag_context_update',
    context,
    timestamp: Date.now(),
  };
}

/**
 * Evaluate multiple flags in batch
 */
export function evaluateFlagBatch(
  keys: string[],
  options?: {
    context?: FlagContext;
    provider?: string;
    timeout?: number;
  },
): FlagBatchEvaluationPayload {
  return {
    type: 'flag_batch_evaluation',
    context: options?.context,
    keys,
    options: {
      provider: options?.provider,
      timeout: options?.timeout,
    },
    timestamp: Date.now(),
  };
}

// ============================================================================
// TYPED FLAG EMITTERS
// ============================================================================

/**
 * Create typed flag evaluation functions
 */
export function createTypedFlagEmitters<T extends Record<string, any>>(
  flags: Record<keyof T, TypedFlag<T[keyof T]>>,
) {
  return {
    // Evaluate a specific typed flag
    evaluate<K extends keyof T>(
      key: K,
      options?: {
        context?: FlagContext;
        provider?: string;
        trackExposure?: boolean;
      },
    ): FlagEvaluationPayload {
      const flag = flags[key];
      return evaluateFlag(flag.key, flag.defaultValue, options);
    },

    // Evaluate multiple typed flags
    evaluateBatch<K extends keyof T>(
      keys: K[],
      options?: {
        context?: FlagContext;
        provider?: string;
      },
    ): FlagBatchEvaluationPayload {
      const flagKeys = keys.map((key) => flags[key].key);
      return evaluateFlagBatch(flagKeys, options);
    },

    // Track exposure for typed flag
    trackExposure<K extends keyof T>(
      key: K,
      value: T[K],
      options?: {
        variant?: string;
        context?: FlagContext;
        reason?: string;
      },
    ): FlagExposurePayload {
      const flag = flags[key];
      return trackFlagExposure(flag.key, value, options);
    },

    // Get flag definitions
    getFlags: () => flags,
  };
}

// ============================================================================
// EXPERIMENT EMITTERS
// ============================================================================

export interface ExperimentEnrollmentPayload {
  context?: FlagContext;
  experimentKey: string;
  timestamp: number;
  type: 'experiment_enrollment';
  variant: string;
}

export interface ExperimentConversionPayload {
  context?: FlagContext;
  experimentKey: string;
  metric: string;
  timestamp: number;
  type: 'experiment_conversion';
  value?: number;
  variant: string;
}

/**
 * Track experiment enrollment
 */
export function trackExperimentEnrollment(
  experimentKey: string,
  variant: string,
  options?: {
    context?: FlagContext;
    properties?: Record<string, any>;
  },
): ExperimentEnrollmentPayload {
  return {
    type: 'experiment_enrollment',
    context: options?.context,
    experimentKey,
    timestamp: Date.now(),
    variant,
  };
}

/**
 * Track experiment conversion
 */
export function trackExperimentConversion(
  experimentKey: string,
  variant: string,
  metric: string,
  options?: {
    value?: number;
    context?: FlagContext;
    properties?: Record<string, any>;
  },
): ExperimentConversionPayload {
  return {
    type: 'experiment_conversion',
    context: options?.context,
    experimentKey,
    metric,
    timestamp: Date.now(),
    value: options?.value,
    variant,
  };
}

// ============================================================================
// FLAG LIFECYCLE EMITTERS
// ============================================================================

export interface FlagStatusPayload {
  context?: FlagContext;
  key: string;
  status: 'enabled' | 'disabled' | 'archived';
  timestamp: number;
  type: 'flag_status_change';
}

export interface FlagRuleChangePayload {
  action: 'created' | 'updated' | 'deleted';
  context?: FlagContext;
  key: string;
  ruleId: string;
  timestamp: number;
  type: 'flag_rule_change';
}

/**
 * Track flag status changes
 */
export function trackFlagStatusChange(
  key: string,
  status: 'enabled' | 'disabled' | 'archived',
  options?: {
    context?: FlagContext;
  },
): FlagStatusPayload {
  return {
    type: 'flag_status_change',
    context: options?.context,
    key,
    status,
    timestamp: Date.now(),
  };
}

/**
 * Track flag rule changes
 */
export function trackFlagRuleChange(
  key: string,
  ruleId: string,
  action: 'created' | 'updated' | 'deleted',
  options?: {
    context?: FlagContext;
  },
): FlagRuleChangePayload {
  return {
    type: 'flag_rule_change',
    action,
    context: options?.context,
    key,
    ruleId,
    timestamp: Date.now(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guards for feature flag payloads
 */
export function isFlagEvaluationPayload(payload: any): payload is FlagEvaluationPayload {
  return payload?.type === 'flag_evaluation';
}

export function isFlagExposurePayload(payload: any): payload is FlagExposurePayload {
  return payload?.type === 'flag_exposure';
}

export function isFlagContextPayload(payload: any): payload is FlagContextPayload {
  return payload?.type === 'flag_context_update';
}

export function isExperimentEnrollmentPayload(
  payload: any,
): payload is ExperimentEnrollmentPayload {
  return payload?.type === 'experiment_enrollment';
}

export function isExperimentConversionPayload(
  payload: any,
): payload is ExperimentConversionPayload {
  return payload?.type === 'experiment_conversion';
}

/**
 * Validate flag context
 */
export function validateFlagContext(context: FlagContext): boolean {
  // Basic validation - ensure context has at least one identifier
  return !!(context.userId || context.distinctId || context.anonymousId || context.sessionId);
}

/**
 * Merge flag contexts
 */
export function mergeFlagContexts(base: FlagContext, override: Partial<FlagContext>): FlagContext {
  return {
    ...base,
    ...override,
    // Merge attributes deeply
    attributes: {
      ...base.attributes,
      ...override.attributes,
    },
    // Merge groups deeply
    groups: {
      ...base.groups,
      ...override.groups,
    },
  };
}

/**
 * Create flag context builder
 */
export class FlagContextBuilder {
  private context: FlagContext = {};

  userId(id: string): this {
    this.context.userId = id;
    return this;
  }

  distinctId(id: string): this {
    this.context.distinctId = id;
    return this;
  }

  anonymousId(id: string): this {
    this.context.anonymousId = id;
    return this;
  }

  sessionId(id: string): this {
    this.context.sessionId = id;
    return this;
  }

  group(type: string, id: string): this {
    if (!this.context.groups) {
      this.context.groups = {};
    }
    this.context.groups[type] = id;
    return this;
  }

  attribute(key: string, value: any): this {
    if (!this.context.attributes) {
      this.context.attributes = {};
    }
    this.context.attributes[key] = value;
    return this;
  }

  attributes(attrs: Record<string, any>): this {
    this.context.attributes = {
      ...this.context.attributes,
      ...attrs,
    };
    return this;
  }

  environment(env: string): this {
    this.context.environment = env;
    return this;
  }

  build(): FlagContext {
    return { ...this.context };
  }
}

/**
 * Create flag context builder instance
 */
export function createFlagContext(): FlagContextBuilder {
  return new FlagContextBuilder();
}
