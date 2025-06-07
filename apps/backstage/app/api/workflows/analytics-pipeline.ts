/**
 * Analytics Pipeline Workflow
 * ETL pipeline for processing analytics data with aggregations and insights
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepMonitoring,
  withStepTimeout,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schemas
const AnalyticsPipelineInput = z.object({
  pipelineId: z.string(),
  dateRange: z.object({
    start: z.string(), // ISO date
    end: z.string(),   // ISO date
  }),
  sources: z.array(z.enum(['web', 'mobile', 'api', 'third_party'])).default(['web', 'mobile', 'api']),
  metrics: z.array(z.enum([
    'pageviews',
    'sessions',
    'users',
    'conversions',
    'revenue',
    'bounce_rate',
    'avg_session_duration',
  ])).default(['pageviews', 'sessions', 'users', 'conversions']),
  dimensions: z.array(z.enum(['country', 'device', 'source', 'page', 'campaign'])).optional(),
  realtime: z.boolean().default(false),
});

// Step 1: Extract raw data from sources
export const extractDataStep = compose(
  createStepWithValidation(
    'extract-data',
    async (input: z.infer<typeof AnalyticsPipelineInput>) => {
      const { sources, dateRange } = input;
      const extractedData = [];

      for (const source of sources) {
        // Simulate data extraction with different volumes per source
        const volumeMap = {
          web: 50000,
          mobile: 30000,
          api: 20000,
          third_party: 10000,
        };

        const records = Array.from({ length: volumeMap[source] }, (_, i) => ({
          timestamp: new Date(
            new Date(dateRange.start).getTime() + 
            Math.random() * (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime())
          ).toISOString(),
          source,
          eventType: ['pageview', 'click', 'conversion', 'session_start'][Math.floor(Math.random() * 4)],
          userId: `user_${Math.floor(Math.random() * 10000)}`,
          sessionId: `session_${Math.floor(Math.random() * 20000)}`,
          properties: {
            page: `/page-${Math.floor(Math.random() * 100)}`,
            country: ['US', 'UK', 'DE', 'FR', 'JP'][Math.floor(Math.random() * 5)],
            device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
            campaign: Math.random() > 0.7 ? `campaign_${Math.floor(Math.random() * 10)}` : null,
            revenue: Math.random() > 0.9 ? Math.floor(Math.random() * 1000) : 0,
          },
        }));

        extractedData.push({
          source,
          records,
          count: records.length,
          extractedAt: new Date().toISOString(),
        });
      }

      return {
        ...input,
        extractedData,
        totalRecords: extractedData.reduce((sum, d) => sum + d.count, 0),
        extraction: {
          startedAt: new Date().toISOString(),
          sources: sources.length,
        },
      };
    },
    (input) => !!input.dateRange && new Date(input.dateRange.start) < new Date(input.dateRange.end),
    (output) => output.totalRecords > 0
  ),
  (step) => withStepTimeout(step, { execution: 60000 }), // 1 minute timeout
  (step) => withStepMonitoring(step, { 
    enableDetailedLogging: true,
    customMetrics: ['recordCount', 'extractionTime'],
  })
);

// Step 2: Clean and validate data
export const cleanDataStep = createStep(
  'clean-data',
  async (data: any) => {
    const { extractedData } = data;
    const cleanedData = [];
    const errors = [];

    for (const sourceData of extractedData) {
      const cleaned = sourceData.records.filter((record: any) => {
        // Validate required fields
        if (!record.timestamp || !record.userId || !record.sessionId) {
          errors.push({
            source: sourceData.source,
            error: 'Missing required fields',
            record,
          });
          return false;
        }

        // Validate timestamp is within range
        const ts = new Date(record.timestamp);
        if (ts < new Date(data.dateRange.start) || ts > new Date(data.dateRange.end)) {
          errors.push({
            source: sourceData.source,
            error: 'Timestamp out of range',
            record,
          });
          return false;
        }

        return true;
      }).map((record: any) => ({
        ...record,
        // Normalize data
        properties: {
          ...record.properties,
          country: record.properties.country?.toUpperCase(),
          device: record.properties.device?.toLowerCase(),
          page: record.properties.page?.toLowerCase(),
        },
        // Add derived fields
        hour: new Date(record.timestamp).getHours(),
        dayOfWeek: new Date(record.timestamp).getDay(),
        isWeekend: [0, 6].includes(new Date(record.timestamp).getDay()),
      }));

      cleanedData.push({
        source: sourceData.source,
        records: cleaned,
        originalCount: sourceData.count,
        cleanedCount: cleaned.length,
        errorCount: sourceData.count - cleaned.length,
      });
    }

    return {
      ...data,
      cleanedData,
      cleaning: {
        totalErrors: errors.length,
        errorRate: (errors.length / data.totalRecords) * 100,
        errors: errors.slice(0, 100), // Keep first 100 errors for debugging
      },
    };
  }
);

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
          // Add session metrics
          isNewSession: Math.random() > 0.7,
          isBounce: record.eventType === 'pageview' && Math.random() > 0.6,
          // Add user metrics
          isNewUser: Math.random() > 0.8,
          userSegment: ['high_value', 'medium_value', 'low_value', 'new'][
            Math.floor(Math.random() * 4)
          ],
          // Calculate metrics
          metrics: {},
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
      transformedRecords,
      transformation: {
        totalRecords: transformedRecords.length,
        completedAt: new Date().toISOString(),
      },
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 2 })
);

// Step 4: Aggregate metrics
export const aggregateMetricsStep = createStep(
  'aggregate-metrics',
  async (data: any) => {
    const { transformedRecords, metrics, dimensions } = data;
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
      overallMetrics.pageviews = transformedRecords.filter((r: any) => r.eventType === 'pageview').length;
    }

    if (metrics.includes('conversions')) {
      overallMetrics.conversions = transformedRecords.filter((r: any) => r.eventType === 'conversion').length;
      overallMetrics.conversion_rate = (overallMetrics.conversions / overallMetrics.total_sessions) * 100;
    }

    if (metrics.includes('revenue')) {
      overallMetrics.total_revenue = transformedRecords.reduce((sum: number, r: any) => 
        sum + (r.metrics?.revenue || 0), 0
      );
      overallMetrics.avg_order_value = overallMetrics.conversions > 0 
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
        const groups = transformedRecords.reduce((acc: any, record: any) => {
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
            users: new Set(groupRecords.map(r => r.userId)).size,
            revenue: groupRecords.reduce((sum, r) => sum + (r.metrics?.revenue || 0), 0),
          };
        }

        aggregations[dimension] = dimensionAgg;
      }
    }

    return {
      ...data,
      aggregations,
      aggregation: {
        metricsCalculated: metrics.length,
        dimensionsProcessed: dimensions?.length || 0,
        completedAt: new Date().toISOString(),
      },
    };
  }
);

// Step 5: Generate insights
export const generateInsightsStep = createStep(
  'generate-insights',
  async (data: any) => {
    const { aggregations } = data;
    const insights = [];

    // Traffic insights
    if (aggregations.overall.pageviews) {
      const avgPageviewsPerSession = aggregations.overall.pageviews / aggregations.overall.total_sessions;
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
          value: aggregations.overall.conversion_rate,
          recommendation: 'Consider A/B testing checkout flow',
        });
      }
    }

    // Device insights
    if (aggregations.device) {
      const mobileShare = (aggregations.device.mobile?.count || 0) / aggregations.overall.total_events;
      if (mobileShare > 0.6) {
        insights.push({
          type: 'info',
          category: 'device',
          message: `Mobile traffic dominates at ${(mobileShare * 100).toFixed(1)}%`,
          metric: 'mobile_share',
          value: mobileShare,
          recommendation: 'Prioritize mobile experience improvements',
        });
      }
    }

    // Geographic insights
    if (aggregations.country) {
      const topCountry = Object.entries(aggregations.country)
        .sort((a: any, b: any) => b[1].count - a[1].count)[0];
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
      insights,
      insightGeneration: {
        totalInsights: insights.length,
        categories: [...new Set(insights.map(i => i.category))],
        completedAt: new Date().toISOString(),
      },
    };
  }
);

// Step 6: Store processed data
export const storeDataStep = compose(
  StepTemplates.database('store-analytics', 'Save aggregated analytics data'),
  (step) => withStepRetry(step, { maxAttempts: 3 })
);

// Step 7: Update dashboards
export const updateDashboardsStep = createStep(
  'update-dashboards',
  async (data: any) => {
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
    await new Promise(resolve => setTimeout(resolve, realtime ? 100 : 500));

    return {
      ...data,
      dashboards,
      dashboardUpdate: {
        count: dashboards.length,
        realtime,
        completedAt: new Date().toISOString(),
      },
    };
  }
);

// Step 8: Send alerts if needed
export const sendAlertsStep = StepTemplates.conditional(
  'send-alerts',
  'Send alerts for anomalies or achievements',
  {
    condition: (data: any) => {
      const alerts = data.insights?.filter((i: any) => 
        i.type === 'warning' || 
        (i.type === 'positive' && i.category === 'conversion')
      );
      return alerts && alerts.length > 0;
    },
    trueStep: StepTemplates.notification('alert-notification', 'Send alert notifications', {
      channels: ['email', 'slack'],
      priority: 'high',
    }),
  }
);

// Step 9: Archive raw data
export const archiveDataStep = createStep(
  'archive-data',
  async (data: any) => {
    const { pipelineId, dateRange, totalRecords } = data;
    
    const archive = {
      pipelineId,
      dateRange,
      recordCount: totalRecords,
      location: `s3://analytics-archive/${pipelineId}/${dateRange.start}-${dateRange.end}.parquet`,
      compression: 'snappy',
      size: Math.floor(totalRecords * 0.5), // KB
      archivedAt: new Date().toISOString(),
    };

    return {
      ...data,
      archive,
      pipelineComplete: true,
    };
  }
);

// Main workflow definition
export const analyticsPipelineWorkflow = {
  id: 'analytics-pipeline',
  name: 'Analytics Pipeline',
  description: 'ETL pipeline for processing analytics data with aggregations and insights',
  version: '1.0.0',
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
  config: {
    maxDuration: 600000, // 10 minutes
    concurrency: {
      max: 3, // Allow 3 pipelines to run in parallel
    },
    schedule: {
      cron: '0 * * * *', // Run every hour
      timezone: 'UTC',
    },
  },
};