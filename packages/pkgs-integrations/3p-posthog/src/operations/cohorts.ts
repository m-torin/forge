/**
 * PostHog cohorts operations
 */

import type { PostHogCohort } from '../types';

export function createCohortDefinition(
  name: string,
  description: string,
  filters: Array<{
    type: 'event' | 'property' | 'cohort';
    key: string;
    operator:
      | 'equals'
      | 'not_equals'
      | 'contains'
      | 'not_contains'
      | 'greater_than'
      | 'less_than'
      | 'is_set'
      | 'is_not_set';
    value?: string | number | boolean;
  }>,
): Partial<PostHogCohort> {
  return {
    name,
    description,
    // filters would be processed into PostHog's cohort filter format
  };
}

export function trackCohortMembership(
  cohortId: string,
  cohortName: string,
  distinctId: string,
  action: 'added' | 'removed',
  properties?: Record<string, any>,
) {
  return {
    event: 'Cohort Membership Changed',
    properties: {
      cohort_id: cohortId,
      cohort_name: cohortName,
      membership_action: action,
      ...properties,
    },
    distinctId,
  };
}

export function createBehavioralCohort(
  name: string,
  eventName: string,
  timeframe: {
    period: 'days' | 'weeks' | 'months';
    value: number;
  },
  frequency: {
    operator: 'at_least' | 'exactly' | 'at_most';
    value: number;
  },
): Partial<PostHogCohort> {
  return {
    name,
    description: `Users who performed ${eventName} ${frequency.operator} ${frequency.value} times in the last ${timeframe.value} ${timeframe.period}`,
  };
}

export function createPropertyCohort(
  name: string,
  properties: Array<{
    key: string;
    operator:
      | 'equals'
      | 'not_equals'
      | 'contains'
      | 'not_contains'
      | 'greater_than'
      | 'less_than'
      | 'is_set'
      | 'is_not_set';
    value?: string | number | boolean;
  }>,
): Partial<PostHogCohort> {
  return {
    name,
    description: `Users matching property conditions: ${properties.map(p => `${p.key} ${p.operator} ${p.value}`).join(', ')}`,
  };
}

export function createFunnelCohort(
  name: string,
  funnelSteps: Array<{
    event: string;
    properties?: Record<string, any>;
  }>,
  timeframe: {
    period: 'days' | 'weeks' | 'months';
    value: number;
  },
  conversionWindow: {
    period: 'minutes' | 'hours' | 'days';
    value: number;
  },
): Partial<PostHogCohort> {
  return {
    name,
    description: `Users who completed funnel: ${funnelSteps.map(s => s.event).join(' → ')} within ${conversionWindow.value} ${conversionWindow.period} in the last ${timeframe.value} ${timeframe.period}`,
  };
}

export function createRetentionCohort(
  name: string,
  initialEvent: string,
  returningEvent: string,
  periods: Array<{
    period: 'days' | 'weeks' | 'months';
    value: number;
  }>,
): Partial<PostHogCohort> {
  return {
    name,
    description: `Users who performed ${initialEvent} and then ${returningEvent} in periods: ${periods.map(p => `${p.value} ${p.period}`).join(', ')}`,
  };
}

export function trackCohortAnalysis(
  cohortId: string,
  cohortName: string,
  analysisType: 'retention' | 'conversion' | 'lifecycle' | 'paths',
  results: Record<string, any>,
  distinctId?: string,
) {
  return {
    event: 'Cohort Analysis Performed',
    properties: {
      cohort_id: cohortId,
      cohort_name: cohortName,
      analysis_type: analysisType,
      ...results,
    },
    distinctId,
  };
}

// Dynamic cohort helpers
export function createDynamicCohort(
  name: string,
  refreshInterval: 'hourly' | 'daily' | 'weekly',
  conditions: {
    events?: Array<{ name: string; timeframe: string; count?: number }>;
    properties?: Array<{ key: string; operator: string; value: any }>;
    cohorts?: string[]; // Other cohort IDs to combine
  },
): Partial<PostHogCohort> {
  return {
    name,
    description: `Dynamic cohort refreshed ${refreshInterval}`,
  };
}

export function getCohortInsights(
  cohort: PostHogCohort,
  metrics: Array<'size' | 'growth_rate' | 'activity_level' | 'retention_rate'>,
): Record<string, any> {
  const insights: Record<string, any> = {};

  metrics.forEach(metric => {
    switch (metric) {
      case 'size':
        insights.size = cohort.count || 0;
        break;
      case 'growth_rate':
        insights.growth_rate = 0; // Would be calculated from historical data
        break;
      case 'activity_level':
        insights.activity_level = 'medium'; // Would be calculated from event frequency
        break;
      case 'retention_rate':
        insights.retention_rate = 0.5; // Would be calculated from retention analysis
        break;
    }
  });

  return insights;
}

// Cohort comparison utilities
export function compareCohorts(
  cohortA: PostHogCohort,
  cohortB: PostHogCohort,
  metrics: string[],
): {
  cohort_a: Record<string, any>;
  cohort_b: Record<string, any>;
  differences: Record<string, number>;
} {
  const metricsA = getCohortInsights(cohortA, metrics as any);
  const metricsB = getCohortInsights(cohortB, metrics as any);

  const differences: Record<string, number> = {};
  metrics.forEach(metric => {
    const valueA = metricsA[metric] || 0;
    const valueB = metricsB[metric] || 0;
    differences[metric] = valueB - valueA;
  });

  return {
    cohort_a: metricsA,
    cohort_b: metricsB,
    differences,
  };
}
