/**
 * Performance Monitoring Workflow
 * Monitor and optimize system performance across the affiliate marketplace
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const PerformanceMonitoringInput = z.object({
  alerting: z.object({
    channels: z.array(z.enum(['email', 'slack', 'pagerduty', 'webhook'])).default(['email']),
    cooldown: z.number().default(300), // seconds
    enabled: z.boolean().default(true),
    severityLevels: z.object({
      critical: z.object({
        channels: z.array(z.string()),
        threshold: z.number().default(0.9),
      }),
      warning: z.object({
        channels: z.array(z.string()),
        threshold: z.number().default(0.7),
      }),
    }),
  }),
  mode: z.enum(['realtime', 'scheduled', 'diagnostic', 'alert-driven']).default('scheduled'),
  optimization: z.object({
    autoOptimize: z.boolean().default(false),
    autoScale: z.boolean().default(false),
    costAnalysis: z.boolean().default(true),
    recommendations: z.boolean().default(true),
  }),
  scope: z.object({
    metrics: z
      .array(z.enum(['latency', 'throughput', 'errors', 'saturation', 'availability', 'custom']))
      .default(['all']),
    services: z
      .array(z.enum(['api', 'database', 'cache', 'cdn', 'search', 'workers', 'integrations']))
      .default(['all']),
    timeRange: z.object({
      duration: z.string().default('1h'), // 1h, 6h, 24h, 7d
      end: z.string().datetime().optional(),
      start: z.string().datetime().optional(),
    }),
  }),
  thresholds: z.object({
    availability: z.number().default(0.999), // 99.9%
    customMetrics: z
      .record(
        z.object({
          max: z.number().optional(),
          min: z.number().optional(),
          threshold: z.number(),
        }),
      )
      .optional(),
    errorRate: z.number().default(0.01), // 1%
    latency: z.object({
      p50: z.number().default(100), // ms
      p95: z.number().default(500),
      p99: z.number().default(1000),
    }),
    throughput: z.object({
      max: z.number().default(10000),
      min: z.number().default(100), // requests/sec
    }),
  }),
});

// Performance metric schema
const PerformanceMetric = z.object({
  aggregation: z.object({
    method: z.enum(['avg', 'sum', 'min', 'max', 'count', 'percentile']),
    period: z.string(),
    samples: z.number(),
  }),
  dimensions: z.record(z.string()),
  metricType: z.string(),
  service: z.string(),
  status: z.enum(['healthy', 'degraded', 'critical', 'unknown']),
  threshold: z
    .object({
      breached: z.boolean(),
      severity: z.enum(['info', 'warning', 'critical']),
      value: z.number(),
    })
    .optional(),
  timestamp: z.string(),
  unit: z.string(),
  value: z.number(),
});

// Step factory for metric collection
const metricCollectorFactory = createWorkflowStep(
  {
    name: 'Metric Collector',
    category: 'monitoring',
    tags: ['metrics', 'performance', 'observability'],
    version: '1.0.0',
  },
  async (context) => {
    const { metricTypes, services, timeRange } = context.input;
    const metrics = [];

    for (const service of services) {
      for (const metricType of metricTypes) {
        const serviceMetrics = await collectServiceMetrics(service, metricType, timeRange);
        metrics.push(...serviceMetrics);
      }
    }

    return metrics;
  },
);

// Mock metric collection
async function collectServiceMetrics(
  service: string,
  metricType: string,
  timeRange: any,
): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const metrics = [];
  const samples = 60; // One per minute for the last hour

  for (let i = 0; i < samples; i++) {
    const timestamp = new Date(Date.now() - (samples - i) * 60000);

    let value = 0;
    let unit = '';

    switch (metricType) {
      case 'latency':
        value = generateLatencyMetric(service, i);
        unit = 'ms';
        break;
      case 'throughput':
        value = generateThroughputMetric(service, i);
        unit = 'req/s';
        break;
      case 'errors':
        value = generateErrorMetric(service, i);
        unit = 'count';
        break;
      case 'saturation':
        value = generateSaturationMetric(service, i);
        unit = '%';
        break;
      case 'availability':
        value = generateAvailabilityMetric(service, i);
        unit = '%';
        break;
    }

    metrics.push({
      aggregation: {
        method: 'avg',
        period: '1m',
        samples: 1,
      },
      dimensions: {
        environment: 'production',
        region: 'us-east-1',
        version: '1.0.0',
      },
      metricType,
      service,
      status: calculateMetricStatus(metricType, value),
      timestamp: timestamp.toISOString(),
      unit,
      value,
    });
  }

  return metrics;
}

function generateLatencyMetric(service: string, index: number): number {
  const baseLatency = {
    api: 50,
    cache: 5,
    cdn: 15,
    database: 20,
    integrations: 150,
    search: 100,
    workers: 200,
  };

  const base = baseLatency[(service as any)] || 50;
  const variation = Math.sin(index / 10) * base * 0.3;
  const spike = index % 20 === 0 ? base * 2 : 0;

  return Math.max(1, base + variation + spike + Math.random() * base * 0.2);
}

function generateThroughputMetric(service: string, index: number): number {
  const baseThroughput = {
    api: 1000,
    cache: 5000,
    cdn: 10000,
    database: 500,
    integrations: 300,
    search: 200,
    workers: 100,
  };

  const base = baseThroughput[(service as any)] || 500;
  const dayPattern = Math.sin((index / 60) * Math.PI * 2) * base * 0.4;

  return Math.max(10, base + dayPattern + Math.random() * base * 0.1);
}

function generateErrorMetric(service: string, index: number): number {
  const errorRate = Math.random() * 10;
  const spike = Math.random() > 0.95 ? 50 : 0;

  return Math.floor(errorRate + spike);
}

function generateSaturationMetric(service: string, index: number): number {
  const baseSaturation = {
    api: 40,
    cache: 30,
    cdn: 20,
    database: 60,
    integrations: 45,
    search: 50,
    workers: 70,
  };

  const base = baseSaturation[(service as any)] || 50;
  const trend = index * 0.1;

  return Math.min(100, base + trend + Math.random() * 20);
}

function generateAvailabilityMetric(service: string, index: number): number {
  const uptime = Math.random() > 0.01 ? 100 : 0;
  return uptime;
}

function calculateMetricStatus(metricType: string, value: number): string {
  switch (metricType) {
    case 'latency':
      return value < 100 ? 'healthy' : value < 500 ? 'degraded' : 'critical';
    case 'errors':
      return value < 5 ? 'healthy' : value < 20 ? 'degraded' : 'critical';
    case 'availability':
      return value > 99 ? 'healthy' : value > 95 ? 'degraded' : 'critical';
    case 'saturation':
      return value < 70 ? 'healthy' : value < 90 ? 'degraded' : 'critical';
    default:
      return 'unknown';
  }
}

// Step 1: Collect performance metrics
export const collectPerformanceMetricsStep = compose(
  createStepWithValidation(
    'collect-metrics',
    async (input: z.infer<typeof PerformanceMonitoringInput>) => {
      const { scope } = input;

      // Determine services to monitor
      let services = scope.services;
      if (services.includes('all')) {
        services = ['api', 'database', 'cache', 'cdn', 'search', 'workers', 'integrations'];
      }

      // Determine metrics to collect
      let metricTypes = scope.metrics;
      if (metricTypes.includes('all')) {
        metricTypes = ['latency', 'throughput', 'errors', 'saturation', 'availability'];
      }

      // Collect metrics
      const collectedMetrics = await metricCollectorFactory.handler({
        input: {
          metricTypes,
          services,
          timeRange: scope.timeRange,
        },
      });

      // Group metrics by service
      const metricsByService = new Map();
      collectedMetrics.forEach((metric: any) => {
        if (!metricsByService.has(metric.service)) {
          metricsByService.set(metric.service, []);
        }
        metricsByService.get(metric.service).push(metric);
      });

      return {
        ...input,
        collectedMetrics,
        collectionStarted: new Date().toISOString(),
        metricsByService: Array.from(metricsByService.entries()).map(([service, metrics]) => ({
          count: metrics.length,
          metrics,
          service,
        })),
        totalMetrics: collectedMetrics.length,
      };
    },
    (input) => input.scope.services.length > 0,
    (output) => output.totalMetrics > 0,
  ),
  (step) => withStepTimeout(step, { execution: 60000 }),
  (step) =>
    withStepMonitoring(step, {
, 'serviceCount'],
      enableDetailedLogging: true,
    }),
);

// Step 2: Aggregate and analyze metrics
export const analyzeMetricsStep = createStep('analyze-metrics', async (data: any) => {
  const { metricsByService, thresholds } = data;
  const analysisResults = [];

  for (const serviceData of metricsByService) {
    const { metrics, service } = serviceData;

    // Group metrics by type
    const metricsByType = new Map();
    metrics.forEach((metric: any) => {
      if (!metricsByType.has(metric.metricType)) {
        metricsByType.set(metric.metricType, []);
      }
      metricsByType.get(metric.metricType).push(metric);
    });

    // Analyze each metric type
    const serviceAnalysis: any = {
      health: {
        issues: [],
        score: 100,
        status: 'healthy',
      },
      metrics: {},
      service,
      timestamp: new Date().toISOString(),
    };

    for (const [metricType, typeMetrics] of metricsByType.entries()) {
      const analysis = analyzeMetricType(metricType, typeMetrics, thresholds);
      serviceAnalysis.metrics[metricType] = analysis;

      // Update health status
      if (analysis.breaches.length > 0) {
        serviceAnalysis.health.score -= analysis.breaches.length * 10;
        serviceAnalysis.health.issues.push(
          ...analysis.breaches.map((b: any) => ({
            metric: metricType,
            ...b,
          })),
        );
      }
    }

    // Calculate overall health status
    if (serviceAnalysis.health.score < 70) {
      serviceAnalysis.health.status = 'critical';
    } else if (serviceAnalysis.health.score < 90) {
      serviceAnalysis.health.status = 'degraded';
    }

    analysisResults.push(serviceAnalysis);
  }

  return {
    ...data,
    analysisComplete: true,
    analysisResults,
  };
});

function analyzeMetricType(metricType: string, metrics: any[], thresholds: any): any {
  const values = metrics.map((m) => m.value);

  // Calculate statistics
  const stats = {
    avg: values.reduce((sum, v) => sum + v, 0) / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
    p50: calculatePercentile(values, 0.5),
    p95: calculatePercentile(values, 0.95),
    p99: calculatePercentile(values, 0.99),
    stdDev: calculateStdDev(values),
  };

  // Check threshold breaches
  const breaches = [];

  switch (metricType) {
    case 'latency':
      if (stats.p50 > thresholds.latency.p50) {
        breaches.push({
          limit: thresholds.latency.p50,
          severity: 'warning',
          threshold: 'p50',
          value: stats.p50,
        });
      }
      if (stats.p95 > thresholds.latency.p95) {
        breaches.push({
          limit: thresholds.latency.p95,
          severity: 'warning',
          threshold: 'p95',
          value: stats.p95,
        });
      }
      if (stats.p99 > thresholds.latency.p99) {
        breaches.push({
          limit: thresholds.latency.p99,
          severity: 'critical',
          threshold: 'p99',
          value: stats.p99,
        });
      }
      break;

    case 'errors':
      const errorRate = stats.avg / 1000; // Convert to rate
      if (errorRate > thresholds.errorRate) {
        breaches.push({
          limit: thresholds.errorRate,
          severity: 'critical',
          threshold: 'errorRate',
          value: errorRate,
        });
      }
      break;

    case 'availability':
      const availability = stats.avg / 100;
      if (availability < thresholds.availability) {
        breaches.push({
          limit: thresholds.availability,
          severity: 'critical',
          threshold: 'availability',
          value: availability,
        });
      }
      break;
  }

  // Detect anomalies
  const anomalies = detectAnomalies(values, stats);

  return {
    anomalies,
    breaches,
    forecast: forecastNextValue(values),
    stats,
    trend: calculateTrend(values),
  };
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.floor(sorted.length * percentile);
  return sorted[index];
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function detectAnomalies(values: number[], stats: any): any[] {
  const anomalies: any[] = [];
  const threshold = 3; // 3 standard deviations

  values.forEach((value, index) => {
    const zScore = Math.abs((value - stats.avg) / stats.stdDev);
    if (zScore > threshold) {
      anomalies.push({
        type: value > stats.avg ? 'spike' : 'drop',
        index,
        value,
        zScore,
      });
    }
  });

  return anomalies;
}

function calculateTrend(values: number[]): string {
  if (values.length < 10) return 'insufficient_data';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  const change = (secondAvg - firstAvg) / firstAvg;

  if (Math.abs(change) < 0.05) return 'stable';
  return change > 0 ? 'increasing' : 'decreasing';
}

function forecastNextValue(values: number[]): number {
  // Simple moving average forecast
  const windowSize = Math.min(10, values.length);
  const recentValues = values.slice(-windowSize);
  return recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
}

// Step 3: Identify performance bottlenecks
export const identifyBottlenecksStep = createStep('identify-bottlenecks', async (data: any) => {
  const { analysisResults, collectedMetrics } = data;
  const bottlenecks = [];

  // Service-level bottlenecks
  for (const serviceAnalysis of analysisResults) {
    const serviceBottlenecks = identifyServiceBottlenecks(serviceAnalysis);
    if (serviceBottlenecks.length > 0) {
      bottlenecks.push({
        bottlenecks: serviceBottlenecks,
        impact: calculateBottleneckImpact(serviceBottlenecks),
        service: serviceAnalysis.service,
      });
    }
  }

  // Cross-service bottlenecks
  const crossServiceBottlenecks = identifyCrossServiceBottlenecks(analysisResults);
  if (crossServiceBottlenecks.length > 0) {
    bottlenecks.push({
      bottlenecks: crossServiceBottlenecks,
      impact: 'high',
      service: 'cross-service',
    });
  }

  // Cascade effects
  const cascadeEffects = analyzeCascadeEffects(bottlenecks, analysisResults);

  return {
    ...data,
    bottlenecks,
    bottlenecksIdentified: true,
    cascadeEffects,
  };
});

function identifyServiceBottlenecks(serviceAnalysis: any): any[] {
  const bottlenecks = [];

  // High latency
  if (serviceAnalysis.metrics.latency?.stats.p95 > 500) {
    bottlenecks.push({
      type: 'high_latency',
      description: 'P95 latency exceeds acceptable threshold',
      metric: 'latency_p95',
      possibleCauses: [
        'Database query optimization needed',
        'Cache miss rate too high',
        'Insufficient compute resources',
      ],
      severity: 'high',
      value: serviceAnalysis.metrics.latency.stats.p95,
    });
  }

  // High error rate
  if (serviceAnalysis.metrics.errors?.stats.avg > 10) {
    bottlenecks.push({
      type: 'high_error_rate',
      description: 'Error rate exceeds acceptable threshold',
      metric: 'error_rate',
      possibleCauses: [
        'Service dependency failures',
        'Resource exhaustion',
        'Configuration issues',
      ],
      severity: 'critical',
      value: serviceAnalysis.metrics.errors.stats.avg,
    });
  }

  // Resource saturation
  if (serviceAnalysis.metrics.saturation?.stats.avg > 80) {
    bottlenecks.push({
      type: 'resource_saturation',
      description: 'Resource utilization approaching limits',
      metric: 'saturation',
      possibleCauses: ['Need to scale horizontally', 'Memory leaks', 'Inefficient resource usage'],
      severity: 'high',
      value: serviceAnalysis.metrics.saturation.stats.avg,
    });
  }

  return bottlenecks;
}

function identifyCrossServiceBottlenecks(analysisResults: any[]): any[] {
  const bottlenecks = [];

  // Find correlated issues
  const criticalServices = analysisResults.filter((r) => r.health.status === 'critical');

  if (criticalServices.length > 1) {
    // Check for cascade failures
    const apiIssue = criticalServices.find((s) => s.service === 'api');
    const dbIssue = criticalServices.find((s) => s.service === 'database');

    if (apiIssue && dbIssue) {
      bottlenecks.push({
        type: 'cascade_failure',
        description: 'Database issues causing API failures',
        recommendation: 'Implement circuit breakers and fallback mechanisms',
        services: ['api', 'database'],
        severity: 'critical',
      });
    }
  }

  // Check for service dependencies
  const degradedServices = analysisResults.filter(
    (r) => r.health.status === 'degraded' || r.health.status === 'critical',
  );

  if (degradedServices.length > analysisResults.length * 0.3) {
    bottlenecks.push({
      type: 'systemic_issue',
      description: 'Multiple services experiencing issues simultaneously',
      recommendation: 'Check shared infrastructure and dependencies',
      services: degradedServices.map((s: any) => s.service),
      severity: 'critical',
    });
  }

  return bottlenecks;
}

function calculateBottleneckImpact(bottlenecks: any[]): string {
  const criticalCount = bottlenecks.filter((b) => b.severity === 'critical').length;
  const highCount = bottlenecks.filter((b) => b.severity === 'high').length;

  if (criticalCount > 0) return 'critical';
  if (highCount > 1) return 'high';
  if (highCount === 1) return 'medium';
  return 'low';
}

function analyzeCascadeEffects(bottlenecks: any[], analysisResults: any[]): any[] {
  const effects = [];

  // Database bottleneck affects multiple services
  const dbBottleneck = bottlenecks.find((b) => b.service === 'database');
  if (dbBottleneck) {
    const affectedServices = ['api', 'workers', 'search'];
    effects.push({
      affected: affectedServices,
      impact: 'High latency and potential timeouts in dependent services',
      mitigation: 'Implement read replicas and query optimization',
      source: 'database',
    });
  }

  // Cache bottleneck increases database load
  const cacheBottleneck = bottlenecks.find((b) => b.service === 'cache');
  if (cacheBottleneck) {
    effects.push({
      affected: ['database', 'api'],
      impact: 'Increased database load due to cache misses',
      mitigation: 'Increase cache capacity and optimize eviction policies',
      source: 'cache',
    });
  }

  return effects;
}

// Step 4: Generate optimization recommendations
export const generateOptimizationRecommendationsStep = createStep(
  'generate-optimizations',
  async (data: any) => {
    const { analysisResults, bottlenecks, optimization } = data;
    const recommendations = [];

    // Service-specific optimizations
    for (const serviceAnalysis of analysisResults) {
      const serviceRecs = generateServiceOptimizations(serviceAnalysis, optimization);
      if (serviceRecs.length > 0) {
        recommendations.push({
          estimatedImpact: calculateOptimizationImpact(serviceRecs),
          recommendations: serviceRecs,
          service: serviceAnalysis.service,
        });
      }
    }

    // System-wide optimizations
    const systemRecs = generateSystemOptimizations(analysisResults, bottlenecks);
    if (systemRecs.length > 0) {
      recommendations.push({
        estimatedImpact: 'high',
        recommendations: systemRecs,
        service: 'system',
      });
    }

    // Cost optimizations
    if (optimization.costAnalysis) {
      const costRecs = generateCostOptimizations(analysisResults);
      if (costRecs.length > 0) {
        recommendations.push({
          estimatedImpact: 'medium',
          recommendations: costRecs,
          service: 'cost',
        });
      }
    }

    return {
      ...data,
      optimizationsGenerated: true,
      recommendations,
    };
  },
);

function generateServiceOptimizations(serviceAnalysis: any, optimizationConfig: any): any[] {
  const recommendations = [];

  // Latency optimizations
  if (serviceAnalysis.metrics.latency?.stats.p95 > 300) {
    recommendations.push({
      type: 'performance',
      actions: [
        'Enable query result caching',
        'Optimize database indexes',
        'Implement connection pooling',
        'Add service-level caching',
      ],
      description: `P95 latency is ${serviceAnalysis.metrics.latency.stats.p95}ms`,
      effort: 'medium',
      estimatedImprovement: '30-50% latency reduction',
      priority: 'high',
      title: 'Reduce service latency',
    });
  }

  // Throughput optimizations
  if (serviceAnalysis.metrics.throughput?.stats.avg < 500) {
    recommendations.push({
      type: 'scaling',
      actions: [
        'Implement horizontal scaling',
        'Optimize request batching',
        'Enable async processing',
        'Upgrade instance types',
      ],
      description: 'Current throughput below optimal levels',
      effort: 'high',
      estimatedImprovement: '2-3x throughput increase',
      priority: 'medium',
      title: 'Increase service throughput',
    });
  }

  // Availability optimizations
  if (serviceAnalysis.metrics.availability?.stats.avg < 99.9) {
    recommendations.push({
      type: 'reliability',
      actions: [
        'Implement health checks',
        'Add redundancy',
        'Configure auto-recovery',
        'Set up multi-region deployment',
      ],
      description: `Current availability: ${serviceAnalysis.metrics.availability.stats.avg}%`,
      effort: 'high',
      estimatedImprovement: 'Achieve 99.99% availability',
      priority: 'critical',
      title: 'Improve service availability',
    });
  }

  return recommendations;
}

function generateSystemOptimizations(analysisResults: any[], bottlenecks: any[]): any[] {
  const recommendations = [];

  // Cross-service optimizations
  const degradedCount = analysisResults.filter((r) => r.health.status !== 'healthy').length;
  if (degradedCount > 2) {
    recommendations.push({
      type: 'architecture',
      actions: [
        'Deploy service mesh for better observability',
        'Implement circuit breakers',
        'Add request retries with backoff',
        'Enable distributed tracing',
      ],
      description: 'Multiple services experiencing issues',
      effort: 'high',
      estimatedImprovement: 'Reduce cascade failures by 80%',
      priority: 'high',
      title: 'Implement service mesh',
    });
  }

  // Resource optimization
  const highSaturation = analysisResults.filter((r) => r.metrics.saturation?.stats.avg > 70);

  if (highSaturation.length > 0) {
    recommendations.push({
      type: 'resources',
      actions: [
        'Implement auto-scaling policies',
        'Optimize container resource limits',
        'Enable spot instances for workers',
        'Implement resource pooling',
      ],
      description: `${highSaturation.length} services near capacity`,
      effort: 'medium',
      estimatedImprovement: '20-30% cost reduction',
      priority: 'medium',
      title: 'Optimize resource allocation',
    });
  }

  return recommendations;
}

function generateCostOptimizations(analysisResults: any[]): any[] {
  const recommendations = [];

  // Identify over-provisioned services
  const lowUtilization = analysisResults.filter((r) => r.metrics.saturation?.stats.avg < 30);

  if (lowUtilization.length > 0) {
    recommendations.push({
      type: 'cost',
      actions: [
        'Downgrade instance sizes',
        'Consolidate services',
        'Implement serverless for low-traffic services',
      ],
      description: `${lowUtilization.length} services using <30% capacity`,
      effort: 'low',
      estimatedSavings: '$500-1000/month',
      priority: 'low',
      services: lowUtilization.map((s: any) => s.service),
      title: 'Right-size underutilized services',
    });
  }

  // CDN optimization
  const cdnService = analysisResults.find((r) => r.service === 'cdn');
  if (cdnService && cdnService.metrics.throughput?.stats.avg < 1000) {
    recommendations.push({
      type: 'cost',
      actions: [
        'Adjust cache TTLs',
        'Implement origin shielding',
        'Optimize asset compression',
        'Review CDN pricing tiers',
      ],
      description: 'CDN throughput below optimal levels',
      effort: 'low',
      estimatedSavings: '$200-500/month',
      priority: 'medium',
      title: 'Optimize CDN usage',
    });
  }

  return recommendations;
}

function calculateOptimizationImpact(recommendations: any[]): string {
  const highPriority = recommendations.filter((r) => r.priority === 'high').length;
  const criticalPriority = recommendations.filter((r) => r.priority === 'critical').length;

  if (criticalPriority > 0) return 'critical';
  if (highPriority > 1) return 'high';
  if (highPriority === 1) return 'medium';
  return 'low';
}

// Step 5: Check alert conditions
export const checkAlertConditionsStep = createStep('check-alerts', async (data: any) => {
  const { alerting, analysisResults, bottlenecks } = data;

  if (!alerting.enabled) {
    return {
      ...data,
      alertsSkipped: true,
    };
  }

  const alerts = [];
  const alertHistory = await getAlertHistory();

  // Service health alerts
  for (const serviceAnalysis of analysisResults) {
    if (serviceAnalysis.health.status !== 'healthy') {
      const shouldAlert = checkAlertCooldown(
        serviceAnalysis.service,
        serviceAnalysis.health.status,
        alertHistory,
        alerting.cooldown,
      );

      if (shouldAlert) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          channels: determineAlertChannels(serviceAnalysis.health.status, alerting),
          description: `Service health: ${serviceAnalysis.health.status}`,
          issues: serviceAnalysis.health.issues,
          service: serviceAnalysis.service,
          severity: serviceAnalysis.health.status === 'critical' ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          title: `${serviceAnalysis.service} performance degradation`,
        });
      }
    }
  }

  // Bottleneck alerts
  for (const bottleneckGroup of bottlenecks) {
    const criticalBottlenecks = bottleneckGroup.bottlenecks.filter(
      (b: any) => b.severity === 'critical',
    );

    if (criticalBottlenecks.length > 0) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bottlenecks: criticalBottlenecks,
        channels: alerting.severityLevels.critical.channels,
        description: `${criticalBottlenecks.length} critical bottlenecks identified`,
        service: bottleneckGroup.service,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        title: 'Critical performance bottleneck detected',
      });
    }
  }

  return {
    ...data,
    alerts,
    alertsGenerated: alerts.length,
  };
});

async function getAlertHistory(): Promise<any[]> {
  // Mock alert history
  return [];
}

function checkAlertCooldown(
  service: string,
  status: string,
  history: any[],
  cooldownSeconds: number,
): boolean {
  const recentAlert = history.find(
    (a) =>
      a.service === service &&
      a.status === status &&
      Date.now() - new Date(a.timestamp).getTime() < cooldownSeconds * 1000,
  );

  return !recentAlert;
}

function determineAlertChannels(status: string, alertConfig: any): string[] {
  if (status === 'critical') {
    return alertConfig.severityLevels.critical.channels;
  } else if (status === 'degraded') {
    return alertConfig.severityLevels.warning.channels;
  }
  return ['email'];
}

// Step 6: Execute auto-scaling actions
export const executeAutoScalingStep = createStep('auto-scaling', async (data: any) => {
  const { analysisResults, optimization, recommendations } = data;

  if (!optimization.autoScale) {
    return {
      ...data,
      autoScalingSkipped: true,
    };
  }

  const scalingActions = [];

  for (const serviceAnalysis of analysisResults) {
    const scalingDecision = makeScalingDecision(serviceAnalysis);

    if (scalingDecision.action !== 'none') {
      const action = await executeScalingAction(serviceAnalysis.service, scalingDecision);
      scalingActions.push(action);
    }
  }

  return {
    ...data,
    scalingActions,
    scalingExecuted: scalingActions.length > 0,
  };
});

function makeScalingDecision(serviceAnalysis: any): any {
  const decision = {
    action: 'none',
    amount: 0,
    direction: null,
    reason: '',
  };

  // High saturation - scale up
  if (serviceAnalysis.metrics.saturation?.stats.avg > 80) {
    decision.action = 'scale';
    decision.direction = 'up';
    decision.amount = Math.ceil(serviceAnalysis.metrics.saturation.stats.avg / 80);
    decision.reason = 'Resource saturation above 80%';
  }

  // Low utilization - scale down
  else if (
    serviceAnalysis.metrics.saturation?.stats.avg < 20 &&
    serviceAnalysis.health.status === 'healthy'
  ) {
    decision.action = 'scale';
    decision.direction = 'down';
    decision.amount = 1;
    decision.reason = 'Resource utilization below 20%';
  }

  // High latency with low saturation - scale up
  else if (
    serviceAnalysis.metrics.latency?.stats.p95 > 1000 &&
    serviceAnalysis.metrics.saturation?.stats.avg < 60
  ) {
    decision.action = 'scale';
    decision.direction = 'up';
    decision.amount = 1;
    decision.reason = 'High latency with available capacity';
  }

  return decision;
}

async function executeScalingAction(service: string, decision: any): Promise<any> {
  // Simulate scaling action
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    action: decision.action,
    amount: decision.amount,
    direction: decision.direction,
    executedAt: new Date().toISOString(),
    newCapacity: {
      cpu: decision.direction === 'up' ? 8 : 4,
      instances: decision.direction === 'up' ? 5 + decision.amount : 5 - decision.amount,
      memory: decision.direction === 'up' ? 16 : 8,
    },
    reason: decision.reason,
    service,
    status: 'completed',
  };
}

// Step 7: Send notifications
export const sendPerformanceNotificationsStep = createStep(
  'send-notifications',
  async (data: any) => {
    const { alerts, recommendations, scalingActions } = data;
    const notifications = [];

    // Alert notifications
    if (alerts && alerts.length > 0) {
      for (const alert of alerts) {
        const notification = await sendAlert(alert);
        notifications.push(notification);
      }
    }

    // Critical recommendation notifications
    const criticalRecs = recommendations.filter((r: any) =>
      r.recommendations.some((rec: any) => rec.priority === 'critical'),
    );

    if (criticalRecs.length > 0) {
      notifications.push({
        type: 'recommendations',
        channel: 'email',
        data: criticalRecs,
        recipients: ['ops-team@example.com'],
        sent: true,
        subject: 'Critical performance optimizations required',
      });
    }

    // Scaling action notifications
    if (scalingActions && scalingActions.length > 0) {
      notifications.push({
        type: 'scaling',
        channel: 'slack',
        data: scalingActions,
        sent: true,
        subject: `Auto-scaling executed for ${scalingActions.length} services`,
      });
    }

    return {
      ...data,
      notifications,
      notificationsSent: notifications.length,
    };
  },
);

async function sendAlert(alert: any): Promise<any> {
  // Simulate sending alert
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    alertId: alert.id,
    channels: alert.channels,
    sent: true,
    sentAt: new Date().toISOString(),
  };
}

// Step 8: Update performance dashboard
export const updatePerformanceDashboardStep = compose(
  StepTemplates.database('update-dashboard', 'Update performance metrics dashboard'),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
);

// Step 9: Generate performance report
export const generatePerformanceReportStep = createStep('generate-report', async (data: any) => {
  const { alerts, analysisResults, bottlenecks, recommendations, scalingActions } = data;

  const report = {
    actions: {
      alertsSent: alerts?.length || 0,
      scalingDetails:
        scalingActions?.map((a: any) => ({
          amount: a.amount,
          direction: a.direction,
          service: a.service,
        })) || [],
      scalingExecuted: scalingActions?.length || 0,
    },
    bottlenecks: {
      byService: bottlenecks.map((b: any) => ({
        count: b.bottlenecks.length,
        impact: b.impact,
        service: b.service,
      })),
      critical: bottlenecks.reduce(
        (sum: number, b: any) =>
          sum + b.bottlenecks.filter((bn: any) => bn.severity === 'critical').length,
        0,
      ),
      total: bottlenecks.reduce((sum: number, b: any) => sum + b.bottlenecks.length, 0),
    },
    optimizations: {
      byPriority: {
        critical: countRecommendationsByPriority(recommendations, 'critical'),
        high: countRecommendationsByPriority(recommendations, 'high'),
        low: countRecommendationsByPriority(recommendations, 'low'),
        medium: countRecommendationsByPriority(recommendations, 'medium'),
      },
      total: recommendations.reduce((sum: number, r: any) => sum + r.recommendations.length, 0),
    },
    recommendations: generatePerformanceInsights(data),
    reportId: `performance_${Date.now()}`,
    services: analysisResults.map((service: any) => ({
      name: service.service,
      health: service.health.status,
      metrics: Object.entries(service.metrics).map(([type, data]: [string, any]) => ({
        type,
        avg: data.stats?.avg,
        breaches: data.breaches?.length || 0,
        p95: data.stats?.p95,
        trend: data.trend,
      })),
    })),
    summary: {
      criticalServices: analysisResults.filter((r: any) => r.health.status === 'critical').length,
      degradedServices: analysisResults.filter((r: any) => r.health.status === 'degraded').length,
      healthyServices: analysisResults.filter((r: any) => r.health.status === 'healthy').length,
      overallHealth: calculateOverallHealth(analysisResults),
      servicesMonitored: analysisResults.length,
    },
    timestamp: new Date().toISOString(),
    trends: {
      degradingServices: analysisResults.filter((r: any) =>
        Object.values(r.metrics).some((m: any) => m.trend === 'increasing'),
      ).length,
      improvingServices: analysisResults.filter((r: any) =>
        Object.values(r.metrics).some((m: any) => m.trend === 'decreasing'),
      ).length,
    },
  };

  return {
    ...data,
    monitoringComplete: true,
    report,
  };
});

function calculateOverallHealth(analysisResults: any[]): number {
  const totalScore = analysisResults.reduce((sum, r) => sum + r.health.score, 0);
  return totalScore / analysisResults.length;
}

function countRecommendationsByPriority(recommendations: any[], priority: string): number {
  return recommendations.reduce(
    (sum, r) => sum + r.recommendations.filter((rec: any) => rec.priority === priority).length,
    0,
  );
}

function generatePerformanceInsights(data: any): any[] {
  const insights = [];

  // System health insight
  const overallHealth = calculateOverallHealth(data.analysisResults);
  if (overallHealth < 80) {
    insights.push({
      type: 'system_health',
      action: 'immediate_investigation_required',
      message: `Overall system health at ${overallHealth.toFixed(0)}%`,
      priority: 'high',
    });
  }

  // Scaling efficiency
  if (data.scalingActions?.length > 3) {
    insights.push({
      type: 'scaling_pattern',
      action: 'review_scaling_policies',
      message: 'Frequent scaling actions detected',
      priority: 'medium',
    });
  }

  // Alert fatigue
  if (data.alerts?.length > 10) {
    insights.push({
      type: 'alert_fatigue',
      action: 'tune_alert_thresholds',
      message: 'High volume of alerts generated',
      priority: 'medium',
    });
  }

  return insights;
}

// Main workflow definition
export const performanceMonitoringWorkflow = {
  id: 'performance-monitoring',
  name: 'Performance Monitoring',
  config: {
    concurrency: {
      max: 10, // Allow multiple monitoring sessions
    },
    maxDuration: 600000, // 10 minutes
    schedule: {
      cron: '*/5 * * * *', // Every 5 minutes
      timezone: 'UTC',
    },
  },
  description: 'Monitor and optimize system performance across the affiliate marketplace',
  features: {
    alerting: true,
    anomalyDetection: true,
    autoScaling: true,
    performanceOptimization: true,
    realtimeMonitoring: true,
  },
  steps: [
    collectPerformanceMetricsStep,
    analyzeMetricsStep,
    identifyBottlenecksStep,
    generateOptimizationRecommendationsStep,
    checkAlertConditionsStep,
    executeAutoScalingStep,
    sendPerformanceNotificationsStep,
    updatePerformanceDashboardStep,
    generatePerformanceReportStep,
  ],
  version: '1.0.0',
};
