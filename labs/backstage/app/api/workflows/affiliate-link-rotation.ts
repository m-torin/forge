/**
 * Affiliate Link Rotation Workflow
 * Manage and optimize affiliate link performance through intelligent rotation
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const AffiliateLinkRotationInput = z.object({
  mode: z.enum(['optimize', 'test', 'failover', 'geographic']).default('optimize'),
  networks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      commissionRate: z.number().min(0).max(100),
      cookieDuration: z.number(), // days
      minimumPayout: z.number(),
      priority: z.number().min(1).max(10),
      regions: z.array(z.string()).optional(),
    }),
  ),
  performanceThresholds: z.object({
    healthCheckInterval: z.number().default(300), // 5 minutes
    maxBounceRate: z.number().default(0.7), // 70%
    minConversionRate: z.number().default(0.01), // 1%
    minCTR: z.number().default(0.02), // 2%
  }),
  products: z
    .array(
      z.object({
        category: z.string(),
        currentPrice: z.number(),
        priority: z.enum(['high', 'medium', 'low']).default('medium'),
        productId: z.string(),
      }),
    )
    .optional(),
  rotationConfig: z.object({
    confidenceThreshold: z.number().min(0).max(1).default(0.95),
    algorithm: z
      .enum(['weighted', 'round-robin', 'performance', 'ml-optimized'])
      .default('performance'),
    deviceTargeting: z.boolean().default(false),
    geoTargeting: z.boolean().default(true),
    minConversions: z.number().default(100),
    testDuration: z.number().default(7), // days
  }),
});

// Performance metrics schema
const LinkPerformanceMetrics = z.object({
  linkId: z.string(),
  metrics: z.object({
    averageOrderValue: z.number(),
    bounceRate: z.number(),
    clicks: z.number(),
    conversionRate: z.number(),
    conversions: z.number(),
    ctr: z.number(),
    epc: z.number(), // earnings per click
    revenue: z.number(),
  }),
  networkId: z.string(),
  productId: z.string(),
  segmentation: z
    .object({
      byDevice: z.record(z.any()).optional(),
      byReferrer: z.record(z.any()).optional(),
      byRegion: z.record(z.any()).optional(),
    })
    .optional(),
  timeRange: z.object({
    end: z.string(),
    start: z.string(),
  }),
});

// Step 1: Fetch current link performance
export const fetchLinkPerformanceStep = compose(
  createStepWithValidation(
    'fetch-performance',
    async (input: z.infer<typeof AffiliateLinkRotationInput>) => {
      const { networks, products, rotationConfig } = input;

      // Fetch performance data for all active links
      const performanceData = [];
      const linkInventory = [];

      // Get products to analyze
      const productsToAnalyze = products || generateDefaultProducts();

      for (const product of productsToAnalyze) {
        for (const network of networks) {
          // Simulate fetching performance metrics
          const metrics = await fetchNetworkMetrics(
            product.productId,
            network.id,
            rotationConfig.testDuration,
          );
          performanceData.push(metrics);

          linkInventory.push({
            url: generateAffiliateUrl(product.productId, network),
            isActive: metrics.metrics.clicks > 0,
            lastChecked: new Date().toISOString(),
            networkId: network.id,
            networkName: network.name,
            productId: product.productId,
          });
        }
      }

      return {
        ...input,
        activeLinks: linkInventory.filter((l) => l.isActive).length,
        analysisStarted: new Date().toISOString(),
        linkInventory,
        performanceData,
        totalLinks: linkInventory.length,
      };
    },
    (input) => input.networks.length > 0,
    (output) => output.performanceData.length > 0,
  ),
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepMonitoring(step),
);

// Mock function to generate default products
function generateDefaultProducts(): any[] {
  return Array.from({ length: 100 }, (_, i) => ({
    category: ['Electronics', 'Clothing', 'Home', 'Sports'][Math.floor(Math.random() * 4)],
    currentPrice: Math.floor(Math.random() * 500) + 10,
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    productId: `prod_${i}`,
  }));
}

// Mock function to fetch network metrics
async function fetchNetworkMetrics(
  productId: string,
  networkId: string,
  days: number,
): Promise<any> {
  const clicks = Math.floor(Math.random() * 1000);
  const conversions = Math.floor(clicks * (Math.random() * 0.05));
  const revenue = conversions * (Math.random() * 100 + 20);

  return {
    linkId: `link_${productId}_${networkId}`,
    metrics: {
      averageOrderValue: conversions > 0 ? revenue / conversions : 0,
      bounceRate: Math.random() * 0.8,
      clicks,
      conversionRate: clicks > 0 ? conversions / clicks : 0,
      conversions,
      ctr: Math.random() * 0.05,
      epc: clicks > 0 ? revenue / clicks : 0,
      revenue,
    },
    networkId,
    productId,
    segmentation: {
      byRegion: {
        CA: { clicks: clicks * 0.15, conversions: conversions * 0.18 },
        Other: { clicks: clicks * 0.25, conversions: conversions * 0.15 },
        UK: { clicks: clicks * 0.2, conversions: conversions * 0.22 },
        US: { clicks: clicks * 0.4, conversions: conversions * 0.45 },
      },
    },
    timeRange: {
      end: new Date().toISOString(),
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

// Helper function to generate affiliate URL
function generateAffiliateUrl(productId: string, network: any): string {
  const baseUrls: Record<string, string> = {
    amazon: `https://www.amazon.com/dp/${productId}?tag=`,
    ebay: `https://rover.ebay.com/rover/1/AFFILIATE_ID/${productId}`,
    target: `https://goto.target.com/c/AFFILIATE_ID/${productId}`,
    walmart: `https://goto.walmart.com/c/AFFILIATE_ID/OFFER_ID/${productId}`,
  };

  return `${baseUrls[network.name as string] || 'https://affiliate.example.com'}${network.id}`;
}

// Step 2: Health check affiliate links
export const healthCheckLinksStep = compose(
  createStep('health-check', async (data: any) => {
    const { linkInventory, performanceThresholds } = data;
    const healthResults = [];
    const deadLinks = [];

    // Check each link's health
    for (const link of linkInventory) {
      try {
        // Simulate health check
        const isHealthy = Math.random() > 0.05; // 95% healthy
        const responseTime = Math.random() * 500;

        const healthStatus = {
          url: link.url,
          errorCount: isHealthy ? 0 : Math.floor(Math.random() * 5),
          errorMessage: isHealthy ? null : 'Link not found or expired',
          lastSuccessfulCheck: isHealthy ? new Date().toISOString() : null,
          linkId: `${link.productId}_${link.networkId}`,
          responseTime,
          status: isHealthy ? 'healthy' : 'dead',
        };

        healthResults.push(healthStatus);

        if (!isHealthy) {
          deadLinks.push(link);
        }
      } catch (error) {
        console.error(`Health check failed for ${link.url}:`, error);
        deadLinks.push(link);
      }
    }

    return {
      ...data,
      deadLinks,
      healthResults,
      healthStats: {
        averageResponseTime:
          healthResults.reduce((sum, h) => sum + h.responseTime, 0) / healthResults.length,
        dead: deadLinks.length,
        healthy: healthResults.filter((h) => h.status === 'healthy').length,
        totalChecked: healthResults.length,
      },
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 2,
    }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 30000,
      threshold: 0.5,
    }),
);

// Step 3: Calculate rotation weights
export const calculateRotationWeightsStep = createStep('calculate-weights', async (data: any) => {
  const { healthResults, networks, performanceData, rotationConfig } = data;
  const { confidenceThreshold, algorithm } = rotationConfig;

  const rotationWeights = new Map();

  // Group performance by product
  const productPerformance = new Map();
  performanceData.forEach((perf: any) => {
    if (!productPerformance.has(perf.productId)) {
      productPerformance.set(perf.productId, []);
    }
    productPerformance.get(perf.productId).push(perf);
  });

  // Calculate weights for each product
  for (const [productId, performances] of productPerformance.entries()) {
    const weights = calculateWeightsForProduct(performances, networks, algorithm, healthResults);

    rotationWeights.set(productId, {
      confidence: calculateConfidence(performances),
      productId,
      recommendation: getRotationRecommendation(weights, confidenceThreshold),
      weights,
    });
  }

  return {
    ...data,
    calculatedAt: new Date().toISOString(),
    rotationWeights: Array.from(rotationWeights.values()),
    weightingAlgorithm: algorithm,
  };
});

// Helper function to calculate weights for a product
function calculateWeightsForProduct(
  performances: any[],
  networks: any[],
  algorithm: string,
  healthResults: any[],
): Record<string, number> {
  const weights: Record<string, number> = {};

  switch (algorithm) {
    case 'performance':
      // Weight by conversion rate and EPC
      const totalEPC = performances.reduce((sum, p) => sum + p.metrics.epc, 0);
      performances.forEach((perf) => {
        const health = healthResults.find((h: any) => h.linkId === perf.linkId);
        if (health?.status === 'healthy') {
          weights[perf.networkId] = totalEPC > 0 ? perf.metrics.epc / totalEPC : 0;
        }
      });
      break;

    case 'weighted':
      // Use network priority
      const totalPriority = networks.reduce((sum, n) => sum + n.priority, 0);
      networks.forEach((network) => {
        weights[network.id] = network.priority / totalPriority;
      });
      break;

    case 'round-robin':
      // Equal weights
      networks.forEach((network) => {
        weights[network.id] = 1 / networks.length;
      });
      break;

    case 'ml-optimized':
      // Simulate ML model output
      performances.forEach((perf) => {
        const score =
          perf.metrics.conversionRate * 0.4 +
          perf.metrics.epc * 0.3 +
          (1 - perf.metrics.bounceRate) * 0.2 +
          perf.metrics.ctr * 0.1;
        weights[perf.networkId] = score;
      });
      break;
  }

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight > 0) {
    Object.keys(weights).forEach((key) => {
      weights[key] = weights[key] / totalWeight;
    });
  }

  return weights;
}

// Helper function to calculate confidence
function calculateConfidence(performances: any[]): number {
  const totalConversions = performances.reduce((sum, p) => sum + p.metrics.conversions, 0);
  const totalClicks = performances.reduce((sum, p) => sum + p.metrics.clicks, 0);

  // Simple confidence based on sample size
  if (totalConversions < 10) return 0.1;
  if (totalConversions < 50) return 0.5;
  if (totalConversions < 100) return 0.7;
  if (totalConversions < 500) return 0.9;
  return 0.95;
}

// Helper function to get rotation recommendation
function getRotationRecommendation(weights: Record<string, number>, threshold: number): string {
  const sortedWeights = Object.entries(weights).sort((a: any, b: any) => b[1] - a[1]);

  if (sortedWeights.length === 0) return 'no_data';
  if (sortedWeights[0][1] > threshold) return 'single_best';
  if (sortedWeights[0][1] > 0.5) return 'primary_with_fallback';
  return 'balanced_rotation';
}

// Step 4: Implement geographic optimization
export const optimizeGeographicRoutingStep = createStep(
  'geographic-optimization',
  async (data: any) => {
    const { networks, performanceData, rotationConfig } = data;

    if (!rotationConfig.geoTargeting) {
      return {
        ...data,
        geoOptimizationSkipped: true,
      };
    }

    const geoRouting = new Map();

    // Analyze performance by region
    performanceData.forEach((perf: any) => {
      if (perf.segmentation?.byRegion) {
        Object.entries(perf.segmentation.byRegion).forEach(([region, metrics]: [string, any]) => {
          if (!geoRouting.has(region)) {
            geoRouting.set(region, []);
          }

          geoRouting.get(region).push({
            networkId: perf.networkId,
            performance: {
              clicks: metrics.clicks,
              conversionRate: metrics.clicks > 0 ? metrics.conversions / metrics.clicks : 0,
              conversions: metrics.conversions,
            },
            productId: perf.productId,
          });
        });
      }
    });

    // Calculate best network per region
    const geoOptimization: Record<string, any> = {};
    for (const [region, performances] of geoRouting.entries()) {
      const regionBest = performances.reduce((best: any, curr: any) => {
        if (!best || curr.performance.conversionRate > best.performance.conversionRate) {
          return curr;
        }
        return best;
      }, null);

      geoOptimization[region] = {
        fallbackNetworks: performances
          .filter((p: any) => p.networkId !== regionBest?.networkId)
          .sort((a: any, b: any) => b.performance.conversionRate - a.performance.conversionRate)
          .slice(0, 2)
          .map((p: any) => p.networkId),
        preferredNetwork: regionBest?.networkId,
      };
    }

    return {
      ...data,
      geoOptimization,
      geoRoutingEnabled: true,
      optimizedRegions: Object.keys(geoOptimization),
    };
  },
);

// Step 5: Set up A/B tests
export const setupABTestsStep = createStep('setup-ab-tests', async (data: any) => {
  const { products, rotationConfig, rotationWeights } = data;
  const { minConversions, mode, testDuration } = rotationConfig;

  if (mode !== 'test') {
    return {
      ...data,
      abTestingSkipped: true,
    };
  }

  const abTests: any[] = [];

  // Create A/B tests for products with low confidence
  rotationWeights.forEach((weight: any) => {
    if (weight.confidence < 0.7) {
      const test = {
        currentConversions: 0,
        endDate: new Date(Date.now() + testDuration * 24 * 60 * 60 * 1000).toISOString(),
        productId: weight.productId,
        startDate: new Date().toISOString(),
        status: 'active',
        targetConversions: minConversions,
        testId: `test_${weight.productId}_${Date.now()}`,
        variants: Object.entries(weight.weights)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3) // Top 3 networks
          .map(([networkId, weight], index) => ({
            allocation: index === 0 ? 0.5 : 0.25, // 50% to best, 25% each to others
            networkId,
            variantId: `variant_${index}`,
          })),
      };

      abTests.push(test);
    }
  });

  return {
    ...data,
    abTests,
    activeTests: abTests.length,
    testingEnabled: true,
  };
});

// Step 6: Configure failover rules
export const configureFailoverStep = createStep('configure-failover', async (data: any) => {
  const { healthResults, networks, rotationWeights } = data;

  const failoverRules: any[] = [];

  // Create failover rules for each product
  rotationWeights.forEach((weight: any) => {
    const productFailover = {
      productId: weight.productId,
      rules: [] as any[],
    };

    // Sort networks by weight
    const sortedNetworks = Object.entries(weight.weights)
      .sort((a: any, b: any) => b[1] - a[1])
      .map(([networkId]) => networkId);

    // Create failover chain
    for (let i = 0; i < sortedNetworks.length - 1; i++) {
      const primary = sortedNetworks[i];
      const fallback = sortedNetworks[i + 1];

      productFailover.rules.push({
        condition: 'link_dead',
        fallback: fallback,
        primary: primary,
        priority: i + 1,
      });
    }

    // Add performance-based failover
    productFailover.rules.push({
      action: 'rotate_to_next',
      condition: 'low_performance',
      threshold: {
        conversionRate: 0.005, // 0.5%
        timeWindow: 3600, // 1 hour
      },
    });

    failoverRules.push(productFailover);
  });

  return {
    ...data,
    failoverConfigured: true,
    failoverRules,
    totalRules: failoverRules.reduce((sum, pf) => sum + pf.rules.length, 0),
  };
});

// Step 7: Update routing configuration
export const updateRoutingConfigStep = compose(
  StepTemplates.database('update-routing', 'Update affiliate link routing configuration'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 8: Monitor and report
export const generateRotationReportStep = createStep('generate-report', async (data: any) => {
  const { abTests, failoverRules, geoOptimization, healthStats, performanceData, rotationWeights } =
    data;

  const report = {
    nextActions: [] as any[],
    performance: {
      averageConversionRate: calculateAverageMetric(performanceData, 'conversionRate'),
      averageEPC: calculateAverageMetric(performanceData, 'epc'),
      topPerformingNetworks: getTopNetworks(performanceData, 5),
      worstPerformingNetworks: getWorstNetworks(performanceData, 3),
    },
    recommendations: generateRecommendations(data),
    reportId: `rotation_${Date.now()}`,
    summary: {
      activeABTests: abTests?.length || 0,
      deadLinks: healthStats.dead,
      geoOptimizedRegions: data.optimizedRegions?.length || 0,
      healthyLinks: healthStats.healthy,
      totalNetworks: data.networks.length,
      totalProducts: rotationWeights.length,
    },
    timestamp: new Date().toISOString(),
  };

  // Add next actions
  if (healthStats.dead > 0) {
    report.nextActions.push({
      action: 'replace_dead_links',
      affectedProducts: data.deadLinks.length,
      priority: 'high',
    });
  }

  if (report.performance.averageConversionRate < 0.01) {
    report.nextActions.push({
      action: 'review_low_performers',
      message: 'Overall conversion rate below 1%',
      priority: 'medium',
    });
  }

  return {
    ...data,
    report,
    rotationComplete: true,
  };
});

// Helper functions for report generation
function getTopNetworks(performanceData: any[], limit: number): any[] {
  const networkPerformance = new Map();

  performanceData.forEach((perf) => {
    if (!networkPerformance.has(perf.networkId)) {
      networkPerformance.set(perf.networkId, {
        networkId: perf.networkId,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
      });
    }

    const network = networkPerformance.get(perf.networkId);
    network.totalRevenue += perf.metrics.revenue;
    network.totalConversions += perf.metrics.conversions;
    network.totalClicks += perf.metrics.clicks;
  });

  return Array.from(networkPerformance.values())
    .map((n) => ({
      ...n,
      conversionRate: n.totalClicks > 0 ? n.totalConversions / n.totalClicks : 0,
      epc: n.totalClicks > 0 ? n.totalRevenue / n.totalClicks : 0,
    }))
    .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

function getWorstNetworks(performanceData: any[], limit: number): any[] {
  return getTopNetworks(performanceData, 999).reverse().slice(0, limit);
}

function calculateAverageMetric(performanceData: any[], metric: string): number {
  const values = performanceData.map((p) => p.metrics[metric]).filter((v) => v !== undefined);
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

function generateRecommendations(data: any): any[] {
  const recommendations = [];

  // Check for underperforming networks
  const avgConversionRate = calculateAverageMetric(data.performanceData, 'conversionRate');
  data.performanceData.forEach((perf: any) => {
    if (perf.metrics.conversionRate < avgConversionRate * 0.5) {
      recommendations.push({
        type: 'performance',
        action: 'consider_removal',
        message: `Network performing at ${(perf.metrics.conversionRate * 100).toFixed(2)}% conversion rate, well below average`,
        networkId: perf.networkId,
      });
    }
  });

  // Geographic optimization opportunities
  if (
    !data.rotationConfig.geoTargeting &&
    data.performanceData.some((p: any) => p.segmentation?.byRegion)
  ) {
    recommendations.push({
      type: 'optimization',
      action: 'enable_geo_targeting',
      message: 'Geographic performance data available but geo-targeting disabled',
      potentialImprovement: '15-25%',
    });
  }

  return recommendations;
}

// Main workflow definition
export const affiliateLinkRotationWorkflow = {
  id: 'affiliate-link-rotation',
  name: 'Affiliate Link Rotation',
  config: {
    concurrency: {
      max: 10, // Allow multiple rotation jobs
    },
    maxDuration: 1800000, // 30 minutes
    schedule: {
      cron: '0 * * * *', // Every hour
      timezone: 'UTC',
    },
  },
  description: 'Manage and optimize affiliate link performance through intelligent rotation',
  features: {
    abTesting: true,
    automaticFailover: true,
    geographicRouting: true,
    mlOptimization: true,
    performanceOptimization: true,
  },
  steps: [
    fetchLinkPerformanceStep,
    healthCheckLinksStep,
    calculateRotationWeightsStep,
    optimizeGeographicRoutingStep,
    setupABTestsStep,
    configureFailoverStep,
    updateRoutingConfigStep,
    generateRotationReportStep,
  ],
  version: '1.0.0',
};
