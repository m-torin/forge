/**
 * Analytics Pipeline Workflow
 * ETL pipeline for processing analytics data with aggregations and insights
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const AnalyticsPipelineInput = z.object({
  dateRange: z.object({
    end: z.string(), // ISO date
    start: z.string(), // ISO date
  }),
  dimensions: z.array(z.enum(['country', 'device', 'source', 'page', 'campaign'])).optional(),
  metrics: z
    .array(
      z.enum([
        'pageviews',
        'sessions',
        'users',
        'conversions',
        'revenue',
        'bounce_rate',
        'avg_session_duration',
      ]),
    )
    .default(['pageviews', 'sessions', 'users', 'conversions']),
  pipelineId: z.string(),
  realtime: z.boolean().default(false),
  sources: z
    .array(z.enum(['web', 'mobile', 'api', 'third_party']))
    .default(['web', 'mobile', 'api']),
});

// Step 1: Extract raw data from sources
export const extractDataStep = compose(
  createStepWithValidation(
    'extract-data',
    async (input: z.infer<typeof AnalyticsPipelineInput>) => {
      const { dateRange, sources } = input;
      const extractedData = [];

      for (const source of sources) {
        // Simulate data extraction with different volumes per source
        const volumeMap = {
          api: 20000,
          mobile: 30000,
          third_party: 10000,
          web: 50000,
        };

        const records = Array.from({ length: volumeMap[source] }, (_, i) => ({
          eventType: ['pageview', 'click', 'conversion', 'session_start'][
            Math.floor(Math.random() * 4)
          ],
          properties: {
            campaign: Math.random() > 0.7 ? `campaign_${Math.floor(Math.random() * 10)}` : null,
            country: ['US', 'UK', 'DE', 'FR', 'JP'][Math.floor(Math.random() * 5)],
            device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
            page: `/page-${Math.floor(Math.random() * 100)}`,
            revenue: Math.random() > 0.9 ? Math.floor(Math.random() * 1000) : 0,
          },
          sessionId: `session_${Math.floor(Math.random() * 20000)}`,
          source,
          timestamp: new Date(
            new Date(dateRange.start).getTime() +
              Math.random() *
                (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()),
          ).toISOString(),
          userId: `user_${Math.floor(Math.random() * 10000)}`,
        }));

        extractedData.push({
          count: records.length,
          extractedAt: new Date().toISOString(),
          records,
          source,
        });
      }

      return {
        ...input,
        extractedData,
        extraction: {
          sources: sources.length,
          startedAt: new Date().toISOString(),
        },
        totalRecords: extractedData.reduce((sum, d) => sum + d.count, 0),
      };
    },
    (input) => !!input.dateRange && new Date(input.dateRange.start) < new Date(input.dateRange.end),
    (output) => output.totalRecords > 0,
  ),
  (step: any) => withStepTimeout(step, 60000), // 1 minute timeout
  (step: any) => withStepMonitoring(step),
);

// Step 2: Clean and validate data
export const cleanDataStep = createStep('clean-data', async (data: any) => {
  const { extractedData } = data;
  const cleanedData = [];
  const errors: any[] = [];

  for (const sourceData of extractedData) {
    const cleaned = sourceData.records
      .filter((record: any) => {
        // Validate required fields
        if (!record.timestamp || !record.userId || !record.sessionId) {
          errors.push({
            error: 'Missing required fields',
            record,
            source: sourceData.source,
          });
          return false;
        }

        // Validate timestamp is within range
        const ts = new Date(record.timestamp);
        if (ts < new Date(data.dateRange.start) || ts > new Date(data.dateRange.end)) {
          errors.push({
            error: 'Timestamp out of range',
            record,
            source: sourceData.source,
          });
          return false;
        }

        return true;
      })
      .map((record: any) => ({
        ...record,
        dayOfWeek: new Date(record.timestamp).getDay(),
        // Add derived fields
        hour: new Date(record.timestamp).getHours(),
        isWeekend: [0, 6].includes(new Date(record.timestamp).getDay()),
        // Normalize data
        properties: {
          ...record.properties,
          country: record.properties.country?.toUpperCase(),
          device: record.properties.device?.toLowerCase(),
          page: record.properties.page?.toLowerCase(),
        },
      }));

    cleanedData.push({
      cleanedCount: cleaned.length,
      errorCount: sourceData.count - cleaned.length,
      originalCount: sourceData.count,
      records: cleaned,
      source: sourceData.source,
    });
  }

  return {
    ...data,
    cleanedData,
    cleaning: {
      errorRate: (errors.length / data.totalRecords) * 100,
      errors: errors.slice(0, 100), // Keep first 100 errors for debugging
      totalErrors: errors.length,
    },
  };
});

// Step 3: Transform and enrich data
export const transformDataStep = compose(
  createStep('transform-data', async (data: any) => {
    const { cleanedData, metrics } = data;
    const transformedRecords = [];

    // Flatten and enrich all records
    for (const sourceData of cleanedData) {
      for (const record of sourceData.records) {
        const transformed = {
          ...record,
          isBounce: record.eventType === 'pageview' && Math.random() > 0.6,
          // Add session metrics
          isNewSession: Math.random() > 0.7,
          // Add user metrics
          isNewUser: Math.random() > 0.8,
          // Calculate metrics
          metrics: {} as Record<string, any>,
          userSegment: ['high_value', 'medium_value', 'low_value', 'new'][
            Math.floor(Math.random() * 4)
          ],
        };

        // Calculate specific metrics
        if (metrics.includes('revenue') && record.properties.revenue > 0) {
          transformed.metrics.revenue = record.properties.revenue;
        }
        if (metrics.includes('avg_session_duration')) {
          transformed.metrics.sessionDuration = Math.floor(Math.random() * 600); // seconds
        }

        transformedRecords.push(transformed);
      }
    }

    return {
      ...data,
      transformation: {
        completedAt: new Date().toISOString(),
        totalRecords: transformedRecords.length,
      },
      transformedRecords,
    };
  }),
  (step: any) => withStepRetry(step, { maxRetries: 2 }),
);

// Step 4: Aggregate metrics
export const aggregateMetricsStep = createStep('aggregate-metrics', async (data: any) => {
  const { dimensions, metrics, transformedRecords } = data;
  const aggregations: any = {};

  // Overall metrics
  const overallMetrics: any = {
    total_events: transformedRecords.length,
  };

  if (metrics.includes('users')) {
    const uniqueUsers = new Set(transformedRecords.map((r: any) => r.userId));
    overallMetrics.unique_users = uniqueUsers.size;
    overallMetrics.new_users = transformedRecords.filter((r: any) => r.isNewUser).length;
  }

  if (metrics.includes('sessions')) {
    const uniqueSessions = new Set(transformedRecords.map((r: any) => r.sessionId));
    overallMetrics.total_sessions = uniqueSessions.size;
    overallMetrics.new_sessions = transformedRecords.filter((r: any) => r.isNewSession).length;
  }

  if (metrics.includes('pageviews')) {
    overallMetrics.pageviews = transformedRecords.filter(
      (r: any) => r.eventType === 'pageview',
    ).length;
  }

  if (metrics.includes('conversions')) {
    overallMetrics.conversions = transformedRecords.filter(
      (r: any) => r.eventType === 'conversion',
    ).length;
    overallMetrics.conversion_rate =
      (overallMetrics.conversions / overallMetrics.total_sessions) * 100;
  }

  if (metrics.includes('revenue')) {
    overallMetrics.total_revenue = transformedRecords.reduce(
      (sum: number, r: any) => sum + (r.metrics?.revenue || 0),
      0,
    );
    overallMetrics.avg_order_value =
      overallMetrics.conversions > 0
        ? overallMetrics.total_revenue / overallMetrics.conversions
        : 0;
  }

  if (metrics.includes('bounce_rate')) {
    const bounces = transformedRecords.filter((r: any) => r.isBounce).length;
    overallMetrics.bounce_rate = (bounces / overallMetrics.pageviews) * 100;
  }

  aggregations.overall = overallMetrics;

  // Dimensional aggregations
  if (dimensions && dimensions.length > 0) {
    for (const dimension of dimensions) {
      const dimensionAgg: any = {};

      // Group by dimension
      const groups = transformedRecords.reduce((acc: Record<string, any[]>, record: any) => {
        const key = record.properties[dimension] || 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
      }, {});

      // Calculate metrics per group
      for (const [key, records] of Object.entries(groups)) {
        const groupRecords = records as any[];
        dimensionAgg[key] = {
          count: groupRecords.length,
          revenue: groupRecords.reduce((sum, r) => sum + (r.metrics?.revenue || 0), 0),
          users: new Set(groupRecords.map((r) => r.userId)).size,
        };
      }

      aggregations[dimension] = dimensionAgg;
    }
  }

  return {
    ...data,
    aggregation: {
      completedAt: new Date().toISOString(),
      dimensionsProcessed: dimensions?.length || 0,
      metricsCalculated: metrics.length,
    },
    aggregations,
  };
});

// Step 5: Generate insights
export const generateInsightsStep = createStep('generate-insights', async (data: any) => {
  const { aggregations } = data;
  const insights = [];

  // Traffic insights
  if (aggregations.overall.pageviews) {
    const avgPageviewsPerSession =
      aggregations.overall.pageviews / aggregations.overall.total_sessions;
    if (avgPageviewsPerSession > 3) {
      insights.push({
        type: 'positive',
        category: 'engagement',
        message: `High engagement with ${avgPageviewsPerSession.toFixed(1)} pageviews per session`,
        metric: 'pageviews_per_session',
        value: avgPageviewsPerSession,
      });
    }
  }

  // Conversion insights
  if (aggregations.overall.conversion_rate) {
    if (aggregations.overall.conversion_rate > 2) {
      insights.push({
        type: 'positive',
        category: 'conversion',
        message: `Strong conversion rate at ${aggregations.overall.conversion_rate.toFixed(2)}%`,
        metric: 'conversion_rate',
        value: aggregations.overall.conversion_rate,
      });
    } else if (aggregations.overall.conversion_rate < 0.5) {
      insights.push({
        type: 'warning',
        category: 'conversion',
        message: `Low conversion rate at ${aggregations.overall.conversion_rate.toFixed(2)}%`,
        metric: 'conversion_rate',
        recommendation: 'Consider A/B testing checkout flow',
        value: aggregations.overall.conversion_rate,
      });
    }
  }

  // Device insights
  if (aggregations.device) {
    const mobileShare =
      (aggregations.device.mobile?.count || 0) / aggregations.overall.total_events;
    if (mobileShare > 0.6) {
      insights.push({
        type: 'info',
        category: 'device',
        message: `Mobile traffic dominates at ${(mobileShare * 100).toFixed(1)}%`,
        metric: 'mobile_share',
        recommendation: 'Prioritize mobile experience improvements',
        value: mobileShare,
      });
    }
  }

  // Geographic insights
  if (aggregations.country) {
    const topCountry = Object.entries(aggregations.country).sort(
      (a: any, b: any) => b[1].count - a[1].count,
    )[0];
    insights.push({
      type: 'info',
      category: 'geographic',
      message: `${topCountry[0]} is your top market with ${(topCountry[1] as any).count} events`,
      metric: 'top_country',
      value: topCountry[0],
    });
  }

  return {
    ...data,
    insightGeneration: {
      categories: [...new Set(insights.map((i) => i.category))],
      completedAt: new Date().toISOString(),
      totalInsights: insights.length,
    },
    insights,
  };
});

// Step 6: Store processed data
export const storeDataStep = compose(
  StepTemplates.database('store-analytics', 'Save aggregated analytics data'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 7: Update dashboards
export const updateDashboardsStep = createStep('update-dashboards', async (data: any) => {
  const { aggregations, insights, realtime } = data;

  const dashboards = [
    {
      id: 'main-dashboard',
      widgets: [
        { type: 'metric', data: aggregations.overall },
        { type: 'insights', data: insights },
      ],
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Add dimensional dashboards
  if (aggregations.country) {
    dashboards.push({
      id: 'geographic-dashboard',
      widgets: [
        { type: 'map', data: aggregations.country },
        { type: 'table', data: aggregations.country },
      ],
      lastUpdated: new Date().toISOString(),
    });
  }

  // Simulate dashboard update
  await new Promise((resolve) => setTimeout(resolve, realtime ? 100 : 500));

  return {
    ...data,
    dashboards,
    dashboardUpdate: {
      completedAt: new Date().toISOString(),
      count: dashboards.length,
      realtime,
    },
  };
});

// Step 8: Send alerts if needed
export const sendAlertsStep = StepTemplates.conditional(
  'send-alerts',
  (data: any) => {
    const alerts = data.insights?.filter(
      (i: any) => i.type === 'warning' || (i.type === 'positive' && i.category === 'conversion'),
    );
    return alerts && alerts.length > 0;
  },
  {
    trueStep: StepTemplates.notification('alert-notification', 'warning'),
  },
);

// Step 9: Archive raw data
export const archiveDataStep = createStep('archive-data', async (data: any) => {
  const { dateRange, pipelineId, totalRecords } = data;

  const archive = {
    archivedAt: new Date().toISOString(),
    compression: 'snappy',
    dateRange,
    location: `s3://analytics-archive/${pipelineId}/${dateRange.start}-${dateRange.end}.parquet`,
    pipelineId,
    recordCount: totalRecords,
    size: Math.floor(totalRecords * 0.5), // KB
  };

  return {
    ...data,
    archive,
    pipelineComplete: true,
  };
});

// Main workflow definition
export const analyticsPipelineWorkflow = {
  id: 'analytics-pipeline',
  name: 'Analytics Pipeline',
  config: {
    concurrency: {
      max: 3, // Allow 3 pipelines to run in parallel
    },
    maxDuration: 600000, // 10 minutes
    schedule: {
      cron: '0 * * * *', // Run every hour
      timezone: 'UTC',
    },
  },
  description: 'ETL pipeline for processing analytics data with aggregations and insights',
  steps: [
    extractDataStep,
    cleanDataStep,
    transformDataStep,
    aggregateMetricsStep,
    generateInsightsStep,
    storeDataStep,
    updateDashboardsStep,
    sendAlertsStep,
    archiveDataStep,
  ],
  version: '1.0.0',
};
