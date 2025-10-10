/**
 * PostHog feature flags operations
 */

import type { PostHogFeatureFlag, PostHogFeatureFlagsResponse } from '../types';

export function evaluateFeatureFlag(
  flagKey: string,
  distinctId: string,
  context?: any,
): PostHogFeatureFlag {
  return {
    key: flagKey,
    value: false, // Will be evaluated by PostHog
    payload: context,
    reason: 'unevaluated',
  };
}

export function createFeatureFlagEvent(
  flagKey: string,
  flagValue: boolean | string | number,
  distinctId: string,
  matchValue?: any,
) {
  return {
    event: '$feature_flag_called',
    properties: {
      $feature_flag: flagKey,
      $feature_flag_response: flagValue,
      $feature_flag_bootstrapped: false,
      $feature_flag_payload: matchValue,
      distinct_id: distinctId,
    },
    distinctId,
  };
}

export function bootstrapFeatureFlags(
  featureFlags: Record<string, boolean | string>,
  featureFlagPayloads?: Record<string, any>,
): PostHogFeatureFlagsResponse {
  return {
    featureFlags,
    featureFlagPayloads: featureFlagPayloads || {},
    errorsWhileComputingFlags: false,
  };
}

export function trackFeatureFlagEvaluation(
  flagKey: string,
  flagValue: boolean | string | number,
  distinctId: string,
  options: {
    payload?: any;
    matchValue?: any;
    reason?: string;
    bootstrapped?: boolean;
  } = {},
) {
  return {
    event: '$feature_flag_called',
    properties: {
      $feature_flag: flagKey,
      $feature_flag_response: flagValue,
      $feature_flag_bootstrapped: options.bootstrapped || false,
      $feature_flag_payload: options.payload,
      $feature_flag_match_value: options.matchValue,
      $feature_flag_reason: options.reason || 'evaluation',
    },
    distinctId,
  };
}

export function createFeatureFlagContext(
  distinctId: string,
  groups?: Record<string, string>,
  personProperties?: Record<string, any>,
) {
  return {
    distinct_id: distinctId,
    groups: groups || {},
    person_properties: personProperties || {},
    group_properties: {},
  };
}

// Helper functions for common feature flag patterns
export function isFeatureEnabled(flagValue: boolean | string | number | undefined): boolean {
  if (typeof flagValue === 'boolean') return flagValue;
  if (typeof flagValue === 'string') return flagValue.toLowerCase() === 'true';
  if (typeof flagValue === 'number') return flagValue > 0;
  return false;
}

export function getFeatureVariant(
  flagValue: boolean | string | number | undefined,
  defaultVariant = 'control',
): string {
  if (typeof flagValue === 'string') return flagValue;
  if (typeof flagValue === 'boolean') return flagValue ? 'test' : 'control';
  if (typeof flagValue === 'number') return flagValue.toString();
  return defaultVariant;
}

export function createMultivariateFlag(
  flagKey: string,
  variants: Array<{ key: string; rollout: number }>,
  distinctId: string,
): PostHogFeatureFlag {
  // This would typically be handled by PostHog's client
  // but we can provide the structure for multivariate flags
  const totalRollout = variants.reduce((sum, v) => sum + v.rollout, 0);

  if (totalRollout > 100) {
    throw new Error('Total rollout percentage cannot exceed 100%');
  }

  return {
    key: flagKey,
    value: 'control', // Default, will be overridden by PostHog
    payload: {
      variants,
      total_rollout: totalRollout,
    },
  };
}

export function trackFeatureFlagExposure(
  flagKey: string,
  variant: string,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: 'Feature Flag Exposed',
    properties: {
      feature_flag: flagKey,
      variant,
      ...properties,
    },
    distinctId,
  };
}
