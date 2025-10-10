/**
 * PostHog experiments operations
 */

import type { PostHogExperiment } from '../types';

export function createExperiment(
  experimentKey: string,
  variant: string,
  featureFlag?: string,
  payload?: any,
): PostHogExperiment {
  return {
    key: experimentKey,
    variant,
    payload,
    featureFlag,
    featureFlagPayload: payload,
  };
}

export function trackExperimentActivation(
  experimentKey: string,
  variant: string,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: '$experiment_activated',
    properties: {
      $experiment_name: experimentKey,
      $experiment_variant: variant,
      ...properties,
    },
    distinctId,
  };
}

export function trackExperimentExposure(
  experimentKey: string,
  variant: string,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: 'Experiment Exposed',
    properties: {
      experiment_name: experimentKey,
      experiment_variant: variant,
      ...properties,
    },
    distinctId,
  };
}

export function trackExperimentConversion(
  experimentKey: string,
  variant: string,
  conversionEvent: string,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: conversionEvent,
    properties: {
      experiment_name: experimentKey,
      experiment_variant: variant,
      is_conversion: true,
      ...properties,
    },
    distinctId,
  };
}

// A/B Test helpers
export function createABTest(
  testName: string,
  variants: string[] = ['control', 'test'],
  traffic = 100,
): {
  name: string;
  variants: Array<{ key: string; rollout: number }>;
} {
  const rolloutPerVariant = Math.floor(traffic / variants.length);
  const remainder = traffic % variants.length;

  return {
    name: testName,
    variants: variants.map((variant, index) => ({
      key: variant,
      rollout: rolloutPerVariant + (index < remainder ? 1 : 0),
    })),
  };
}

// Multivariate test helpers
export function createMultivariateTest(
  testName: string,
  variants: Array<{ key: string; weight: number }>,
  traffic = 100,
): {
  name: string;
  variants: Array<{ key: string; rollout: number }>;
} {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

  return {
    name: testName,
    variants: variants.map(variant => ({
      key: variant.key,
      rollout: Math.floor((variant.weight / totalWeight) * traffic),
    })),
  };
}

// Funnel experiment tracking
export function trackFunnelStep(
  experimentKey: string,
  variant: string,
  step: string,
  stepNumber: number,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: `Funnel Step: ${step}`,
    properties: {
      experiment_name: experimentKey,
      experiment_variant: variant,
      funnel_step: step,
      funnel_step_number: stepNumber,
      ...properties,
    },
    distinctId,
  };
}

// Experiment cohort tracking
export function assignToCohort(
  experimentKey: string,
  cohortName: string,
  distinctId: string,
  properties?: Record<string, any>,
) {
  return {
    event: 'Assigned to Cohort',
    properties: {
      experiment_name: experimentKey,
      cohort_name: cohortName,
      ...properties,
    },
    distinctId,
  };
}

// Experiment outcome tracking
export function trackExperimentOutcome(
  experimentKey: string,
  variant: string,
  outcome: 'success' | 'failure' | 'neutral',
  metricValue?: number,
  distinctId?: string,
  properties?: Record<string, any>,
) {
  return {
    event: 'Experiment Outcome',
    properties: {
      experiment_name: experimentKey,
      experiment_variant: variant,
      experiment_outcome: outcome,
      metric_value: metricValue,
      ...properties,
    },
    distinctId,
  };
}

// Statistical significance helpers
export function calculateSampleSize(
  baselineConversion: number,
  minimumDetectableEffect: number,
  significance = 0.05,
  power = 0.8,
): number {
  // Simplified sample size calculation
  // In practice, you'd use a proper statistical library
  const alpha = significance;
  const beta = 1 - power;
  const effect = minimumDetectableEffect;

  // Approximation for A/B test sample size
  const za = 1.96; // Z-score for 95% confidence
  const zb = 0.84; // Z-score for 80% power

  const p1 = baselineConversion;
  const p2 = p1 * (1 + effect);
  const pooled = (p1 + p2) / 2;

  const numerator = Math.pow(za + zb, 2) * pooled * (1 - pooled);
  const denominator = Math.pow(p1 - p2, 2);

  return Math.ceil((2 * numerator) / denominator);
}

export function getExperimentStatus(
  startDate: Date,
  endDate: Date,
  currentSampleSize: number,
  targetSampleSize: number,
): {
  status: 'not_started' | 'running' | 'completed' | 'stopped';
  progress: number;
  daysRemaining?: number;
} {
  const now = new Date();

  if (now < startDate) {
    return { status: 'not_started', progress: 0 };
  }

  if (now > endDate) {
    return { status: 'completed', progress: 100 };
  }

  const progress = Math.min((currentSampleSize / targetSampleSize) * 100, 100);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    status: progress >= 100 ? 'completed' : 'running',
    progress,
    daysRemaining,
  };
}
