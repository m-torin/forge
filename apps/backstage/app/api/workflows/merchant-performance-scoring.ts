/**
 * Merchant Performance Scoring Workflow
 * Evaluate and score merchant performance across multiple metrics and dimensions
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepBulkhead,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const MerchantScoringInput = z.object({
  actionConfig: z.object({
    identifyRisks: z.boolean().default(true),
    createAlerts: z.boolean().default(true),
    generateRecommendations: z.boolean().default(true),
    segmentMerchants: z.boolean().default(true),
    updateTiers: z.boolean().default(false), // Update merchant tier status
  }),
  reportingConfig: z.object({
    exportFormat: z.enum(['json', 'csv', 'excel']).default('json'),
    includeComparisons: z.boolean().default(true),
    includeInsights: z.boolean().default(true),
    sendNotifications: z.boolean().default(true),
  }),
  scope: z.object({
    all: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    merchants: z.array(z.string()).optional(),
    newMerchants: z.boolean().default(false), // Only merchants joined in last 90 days
    regions: z.array(z.string()).optional(),
  }),
  scoringConfig: z.object({
    benchmarkType: z
      .enum(['peer-group', 'top-performers', 'industry-standard'])
      .default('peer-group'),
    includeHistoricalTrends: z.boolean().default(true),
    penalizeInactivity: z.boolean().default(true),
    weightings: z.object({
      compliance: z.number().default(0.1),
      customerService: z.number().default(0.15),
      fulfillment: z.number().default(0.15),
      growth: z.number().default(0.1),
      quality: z.number().default(0.2),
      reliability: z.number().default(0.05),
      sales: z.number().default(0.25),
    }),
  }),
  scoringPeriod: z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
    end: z.string().datetime(),
    start: z.string().datetime(),
  }),
});

// Merchant performance metrics schema
const MerchantMetrics = z.object({
  compliance: z.object({
    auditScore: z.number(),
    dataPrivacyScore: z.number(),
    licenseStatus: z.boolean(),
    policyViolations: z.number(),
    safetyStandards: z.number(),
    taxCompliance: z.boolean(),
  }),
  customerService: z.object({
    complaintRate: z.number(),
    customerSatisfactionScore: z.number(),
    escalationRate: z.number(),
    resolutionTime: z.number(), // hours
    responseRate: z.number(),
    responseTime: z.number(), // hours
  }),
  fulfillment: z.object({
    averageShippingTime: z.number(), // days
    cancellationRate: z.number(),
    inventoryAccuracy: z.number(),
    onTimeDeliveryRate: z.number(),
    packagingQualityScore: z.number(),
    trackingAccuracy: z.number(),
  }),
  merchantId: z.string(),
  period: z.object({
    end: z.string().datetime(),
    start: z.string().datetime(),
  }),
  quality: z.object({
    averageRating: z.number(),
    defectRate: z.number(),
    positiveReviewRate: z.number(),
    productQualityScore: z.number(),
    returnReason: z.record(z.number()),
    reviewCount: z.number(),
  }),
  reliability: z.object({
    communicationScore: z.number(),
    contractCompliance: z.number(),
    dataAccuracy: z.number(),
    systemIntegrationScore: z.number(),
    uptime: z.number(), // percentage
  }),
  sales: z.object({
    averageOrderValue: z.number(),
    conversionRate: z.number(),
    growthRate: z.number(),
    returnRate: z.number(),
    totalOrders: z.number(),
    totalRevenue: z.number(),
  }),
});

// Performance score schema
const PerformanceScore = z.object({
  benchmarkComparison: z.object({
    industryAverage: z.number(),
    peerGroupAverage: z.number(),
    percentile: z.number(),
    topPerformerAverage: z.number(),
  }),
  categoryScores: z.object({
    compliance: z.number(),
    customerService: z.number(),
    fulfillment: z.number(),
    growth: z.number(),
    quality: z.number(),
    reliability: z.number(),
    sales: z.number(),
  }),
  merchantId: z.string(),
  overallScore: z.number().min(0).max(100),
  riskFactors: z.array(
    z.object({
      factor: z.string(),
      impact: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    }),
  ),
  strengths: z.array(z.string()),
  tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'probation']),
  trends: z.object({
    monthlyScores: z.array(
      z.object({
        month: z.string(),
        score: z.number(),
      }),
    ),
    previousScore: z.number(),
    scoreChange: z.number(),
    trend: z.enum(['improving', 'stable', 'declining']),
  }),
  weaknesses: z.array(z.string()),
});

// Step factory for performance analysis
const performanceAnalyzerFactory = createWorkflowStep(
  {
    name: 'Performance Analyzer',
    category: 'analytics',
    tags: ['merchant', 'scoring', 'performance'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, merchants, metrics } = context.input;
    const scores = [];

    for (const merchant of merchants) {
      const merchantMetrics = metrics.find((m: any) => m.merchantId === merchant.merchantId);
      if (merchantMetrics) {
        const score = await calculatePerformanceScore(merchant, merchantMetrics, config);
        scores.push(score);
      }
    }

    return scores;
  },
);

// Mock performance score calculation
async function calculatePerformanceScore(merchant: any, metrics: any, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Calculate category scores
  const categoryScores = {
    compliance: calculateComplianceScore(metrics.compliance),
    customerService: calculateCustomerServiceScore(metrics.customerService),
    fulfillment: calculateFulfillmentScore(metrics.fulfillment),
    growth: calculateGrowthScore(metrics.sales),
    quality: calculateQualityScore(metrics.quality),
    reliability: calculateReliabilityScore(metrics.reliability),
    sales: calculateSalesScore(metrics.sales),
  };

  // Calculate weighted overall score
  const overallScore = Object.entries(categoryScores).reduce((sum, [category, score]) => {
    const weight = config.weightings[category] || 0;
    return sum + score * weight;
  }, 0);

  // Determine tier
  const tier = determineMerchantTier(overallScore);

  // Generate benchmark comparison
  const benchmarkComparison = generateBenchmarkComparison(overallScore, merchant.category);

  // Analyze trends
  const trends = analyzeTrends(merchant, overallScore);

  // Identify strengths and weaknesses
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(categoryScores);

  // Assess risk factors
  const riskFactors = assessRiskFactors(metrics, categoryScores);

  return {
    benchmarkComparison,
    categoryScores,
    merchantId: merchant.merchantId,
    overallScore: Math.round(overallScore * 100) / 100,
    riskFactors,
    strengths,
    tier,
    trends,
    weaknesses,
  };
}

function calculateSalesScore(salesMetrics: any): number {
  let score = 0;

  // Revenue growth weight: 40%
  const growthScore = Math.min(salesMetrics.growthRate / 0.2, 1); // 20% growth = perfect score
  score += growthScore * 0.4;

  // Conversion rate weight: 30%
  const conversionScore = Math.min(salesMetrics.conversionRate / 0.05, 1); // 5% conversion = perfect
  score += conversionScore * 0.3;

  // Order value weight: 20%
  const avgOrderValue = salesMetrics.averageOrderValue;
  const aovScore = Math.min(avgOrderValue / 150, 1); // $150 AOV = perfect
  score += aovScore * 0.2;

  // Return rate (inverse) weight: 10%
  const returnScore = Math.max(0, 1 - salesMetrics.returnRate / 0.15); // 15% return rate = 0 score
  score += returnScore * 0.1;

  return Math.min(score, 1);
}

function calculateQualityScore(qualityMetrics: any): number {
  let score = 0;

  // Average rating weight: 40%
  const ratingScore = (qualityMetrics.averageRating - 1) / 4; // 1-5 scale normalized
  score += Math.max(0, ratingScore) * 0.4;

  // Positive review rate weight: 30%
  score += qualityMetrics.positiveReviewRate * 0.3;

  // Product quality score weight: 20%
  score += qualityMetrics.productQualityScore * 0.2;

  // Defect rate (inverse) weight: 10%
  const defectScore = Math.max(0, 1 - qualityMetrics.defectRate / 0.05); // 5% defect rate = 0 score
  score += defectScore * 0.1;

  return Math.min(score, 1);
}

function calculateCustomerServiceScore(serviceMetrics: any): number {
  let score = 0;

  // Response time (inverse) weight: 30%
  const responseScore = Math.max(0, 1 - serviceMetrics.responseTime / 24); // 24 hours = 0 score
  score += responseScore * 0.3;

  // Customer satisfaction weight: 30%
  score += serviceMetrics.customerSatisfactionScore * 0.3;

  // Resolution time (inverse) weight: 20%
  const resolutionScore = Math.max(0, 1 - serviceMetrics.resolutionTime / 72); // 72 hours = 0 score
  score += resolutionScore * 0.2;

  // Complaint rate (inverse) weight: 10%
  const complaintScore = Math.max(0, 1 - serviceMetrics.complaintRate / 0.1); // 10% complaint rate = 0 score
  score += complaintScore * 0.1;

  // Response rate weight: 10%
  score += serviceMetrics.responseRate * 0.1;

  return Math.min(score, 1);
}

function calculateFulfillmentScore(fulfillmentMetrics: any): number {
  let score = 0;

  // On-time delivery weight: 40%
  score += fulfillmentMetrics.onTimeDeliveryRate * 0.4;

  // Shipping time (inverse) weight: 25%
  const shippingScore = Math.max(0, 1 - fulfillmentMetrics.averageShippingTime / 7); // 7 days = 0 score
  score += shippingScore * 0.25;

  // Inventory accuracy weight: 15%
  score += fulfillmentMetrics.inventoryAccuracy * 0.15;

  // Packaging quality weight: 10%
  score += fulfillmentMetrics.packagingQualityScore * 0.1;

  // Cancellation rate (inverse) weight: 10%
  const cancellationScore = Math.max(0, 1 - fulfillmentMetrics.cancellationRate / 0.1); // 10% = 0 score
  score += cancellationScore * 0.1;

  return Math.min(score, 1);
}

function calculateComplianceScore(complianceMetrics: any): number {
  let score = 0;

  // Policy violations (inverse) weight: 30%
  const violationScore = Math.max(0, 1 - complianceMetrics.policyViolations / 10); // 10 violations = 0 score
  score += violationScore * 0.3;

  // Tax compliance weight: 25%
  score += (complianceMetrics.taxCompliance ? 1 : 0) * 0.25;

  // License status weight: 20%
  score += (complianceMetrics.licenseStatus ? 1 : 0) * 0.2;

  // Audit score weight: 15%
  score += complianceMetrics.auditScore * 0.15;

  // Data privacy score weight: 10%
  score += complianceMetrics.dataPrivacyScore * 0.1;

  return Math.min(score, 1);
}

function calculateGrowthScore(salesMetrics: any): number {
  // Growth score based on revenue growth rate
  const growthRate = salesMetrics.growthRate;

  if (growthRate >= 0.3) return 1; // 30%+ growth = perfect score
  if (growthRate >= 0.2) return 0.9; // 20-30% growth
  if (growthRate >= 0.1) return 0.7; // 10-20% growth
  if (growthRate >= 0.05) return 0.5; // 5-10% growth
  if (growthRate >= 0) return 0.3; // 0-5% growth
  if (growthRate >= -0.05) return 0.2; // 0 to -5% decline
  if (growthRate >= -0.1) return 0.1; // -5% to -10% decline
  return 0; // More than -10% decline
}

function calculateReliabilityScore(reliabilityMetrics: any): number {
  let score = 0;

  // Uptime weight: 40%
  score += reliabilityMetrics.uptime * 0.4;

  // System integration weight: 25%
  score += reliabilityMetrics.systemIntegrationScore * 0.25;

  // Data accuracy weight: 20%
  score += reliabilityMetrics.dataAccuracy * 0.2;

  // Communication score weight: 10%
  score += reliabilityMetrics.communicationScore * 0.1;

  // Contract compliance weight: 5%
  score += reliabilityMetrics.contractCompliance * 0.05;

  return Math.min(score, 1);
}

function determineMerchantTier(overallScore: number): string {
  if (overallScore >= 0.9) return 'platinum';
  if (overallScore >= 0.8) return 'gold';
  if (overallScore >= 0.65) return 'silver';
  if (overallScore >= 0.5) return 'bronze';
  return 'probation';
}

function generateBenchmarkComparison(score: number, category: string): any {
  // Mock benchmark data
  const benchmarks = {
    industryAverage: 0.6 + Math.random() * 0.25,
    peerGroupAverage: 0.65 + Math.random() * 0.2,
    topPerformerAverage: 0.85 + Math.random() * 0.1,
  };

  // Calculate percentile
  const percentile = Math.min(95, Math.max(5, score * 100 + (Math.random() - 0.5) * 20));

  return {
    percentile,
    ...benchmarks,
  };
}

function analyzeTrends(merchant: any, currentScore: number): any {
  // Mock historical data
  const previousScore = currentScore + (Math.random() - 0.5) * 0.2;
  const scoreChange = currentScore - previousScore;

  const trend = scoreChange > 0.05 ? 'improving' : scoreChange < -0.05 ? 'declining' : 'stable';

  // Generate monthly scores for the last 6 months
  const monthlyScores = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const baseScore = previousScore + (scoreChange * (5 - i)) / 5;
    const monthScore = Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * 0.1));

    monthlyScores.push({
      month: date.toISOString().substring(0, 7),
      score: Math.round(monthScore * 100) / 100,
    });
  }

  return {
    monthlyScores,
    previousScore: Math.round(previousScore * 100) / 100,
    scoreChange: Math.round(scoreChange * 100) / 100,
    trend,
  };
}

function identifyStrengthsWeaknesses(categoryScores: Record<string, number>): any {
  const entries = Object.entries(categoryScores);

  // Identify top 2 performing categories as strengths
  const strengths = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([_, score]) => score > 0.7)
    .map(([category, score]) => {
      const percentage = (score * 100).toFixed(0);
      return `Excellent ${category} performance (${percentage}%)`;
    });

  // Identify bottom 2 performing categories as weaknesses
  const weaknesses = entries
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .filter(([_, score]) => score < 0.6)
    .map(([category, score]) => {
      const percentage = (score * 100).toFixed(0);
      return `Needs improvement in ${category} (${percentage}%)`;
    });

  return { strengths, weaknesses };
}

function assessRiskFactors(metrics: any, categoryScores: Record<string, number>): any[] {
  const riskFactors = [];

  // Low compliance score
  if (categoryScores.compliance < 0.5) {
    riskFactors.push({
      factor: 'compliance_risk',
      impact: 'Potential policy violations and regulatory issues',
      severity: 'high',
    });
  }

  // Poor customer service
  if (categoryScores.customerService < 0.4) {
    riskFactors.push({
      factor: 'customer_service_risk',
      impact: 'Customer dissatisfaction and potential churn',
      severity: 'medium',
    });
  }

  // High return rate
  if (metrics.sales?.returnRate > 0.2) {
    riskFactors.push({
      factor: 'quality_risk',
      impact: 'High return rates indicate quality issues',
      severity: 'medium',
    });
  }

  // Declining growth
  if (metrics.sales?.growthRate < -0.1) {
    riskFactors.push({
      factor: 'growth_risk',
      impact: 'Negative growth trend threatens business sustainability',
      severity: 'high',
    });
  }

  // Poor fulfillment
  if (categoryScores.fulfillment < 0.5) {
    riskFactors.push({
      factor: 'fulfillment_risk',
      impact: 'Delivery issues affecting customer satisfaction',
      severity: 'medium',
    });
  }

  return riskFactors;
}

// Step 1: Collect merchants for scoring
export const collectMerchantsStep = compose(
  createStepWithValidation(
    'collect-merchants',
    async (input: z.infer<typeof MerchantScoringInput>) => {
      const { scope } = input;

      let merchants = [];

      if (scope.all) {
        merchants = await fetchAllMerchants();
      } else {
        if (scope.merchants) {
          const merchantData = await fetchMerchantsByIds(scope.merchants);
          merchants.push(...merchantData);
        }
        if (scope.categories) {
          const categoryMerchants = await fetchMerchantsByCategories(scope.categories);
          merchants.push(...categoryMerchants);
        }
        if (scope.regions) {
          const regionMerchants = await fetchMerchantsByRegions(scope.regions);
          merchants.push(...regionMerchants);
        }
      }

      // Filter for new merchants if specified
      if (scope.newMerchants) {
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        merchants = merchants.filter((m) => new Date(m.joinDate) > cutoffDate);
      }

      // Remove duplicates
      const uniqueMerchants = Array.from(new Map(merchants.map((m) => [m.merchantId, m])).values());

      return {
        ...input,
        merchants: uniqueMerchants,
        scoringStarted: new Date().toISOString(),
        totalMerchants: uniqueMerchants.length,
      };
    },
    (input) =>
      input.scope.all ||
      input.scope.merchants?.length > 0 ||
      input.scope.categories?.length > 0 ||
      input.scope.regions?.length > 0,
    (output) => output.merchants.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 60000 }),
  (step) =>
    withStepMonitoring(step, {
,
      enableDetailedLogging: true,
    }),
);

// Mock merchant fetching functions
async function fetchAllMerchants(): Promise<any[]> {
  const count = 200 + Math.floor(Math.random() * 300);
  return Array.from({ length: count }, (_, i) => generateMockMerchant(`merchant_${i}`));
}

async function fetchMerchantsByIds(ids: string[]): Promise<any[]> {
  return ids.map((id) => generateMockMerchant(id));
}

async function fetchMerchantsByCategories(categories: string[]): Promise<any[]> {
  const allMerchants = await fetchAllMerchants();
  return allMerchants.filter((m) => categories.includes(m.category));
}

async function fetchMerchantsByRegions(regions: string[]): Promise<any[]> {
  const allMerchants = await fetchAllMerchants();
  return allMerchants.filter((m) => regions.includes(m.region));
}

function generateMockMerchant(merchantId: string): any {
  return {
    name: `Merchant ${merchantId}`,
    category: ['Electronics', 'Clothing', 'Home', 'Health', 'Sports'][
      Math.floor(Math.random() * 5)
    ],
    joinDate: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    merchantId,
    region: ['US', 'EU', 'APAC', 'LATAM'][Math.floor(Math.random() * 4)],
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    tier: ['platinum', 'gold', 'silver', 'bronze', 'probation'][Math.floor(Math.random() * 5)],
  };
}

// Step 2: Collect performance metrics
export const collectPerformanceMetricsStep = compose(
  createStep('collect-metrics', async (data: any) => {
    const { merchants, scoringPeriod } = data;
    const allMetrics = [];

    for (const merchant of merchants) {
      const metrics = await collectMerchantMetrics(merchant, scoringPeriod);
      allMetrics.push(metrics);
    }

    return {
      ...data,
      metrics: allMetrics,
      metricsCollected: true,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 10,
      maxQueued: 50,
    }),
);

async function collectMerchantMetrics(merchant: any, period: any): Promise<any> {
  // Simulate metrics collection
  await new Promise((resolve) => setTimeout(resolve, 50));

  const baseRevenue = 10000 + Math.random() * 90000;
  const totalOrders = Math.floor(baseRevenue / (50 + Math.random() * 100));

  return {
    compliance: {
      auditScore: 0.5 + Math.random() * 0.5,
      dataPrivacyScore: 0.7 + Math.random() * 0.3,
      licenseStatus: Math.random() > 0.05, // 95% valid licenses
      policyViolations: Math.floor(Math.random() * 5),
      safetyStandards: 0.6 + Math.random() * 0.4,
      taxCompliance: Math.random() > 0.1, // 90% compliance
    },
    customerService: {
      complaintRate: Math.random() * 0.1, // 0-10%
      customerSatisfactionScore: 0.5 + Math.random() * 0.5,
      escalationRate: Math.random() * 0.05, // 0-5%
      resolutionTime: Math.random() * 168, // 0-168 hours (1 week)
      responseRate: 0.7 + Math.random() * 0.3, // 70-100%
      responseTime: Math.random() * 48, // 0-48 hours
    },
    fulfillment: {
      averageShippingTime: 1 + Math.random() * 10, // 1-11 days
      cancellationRate: Math.random() * 0.05, // 0-5%
      inventoryAccuracy: 0.85 + Math.random() * 0.15, // 85-100%
      onTimeDeliveryRate: 0.6 + Math.random() * 0.4, // 60-100%
      packagingQualityScore: 0.5 + Math.random() * 0.5,
      trackingAccuracy: 0.8 + Math.random() * 0.2, // 80-100%
    },
    merchantId: merchant.merchantId,
    period: {
      end: period.end,
      start: period.start,
    },
    quality: {
      averageRating: 3 + Math.random() * 2,
      defectRate: Math.random() * 0.08, // 0-8%
      positiveReviewRate: 0.6 + Math.random() * 0.4,
      productQualityScore: 0.5 + Math.random() * 0.5,
      returnReason: {
        defective: Math.random() * 0.3,
        not_as_described: Math.random() * 0.2,
        wrong_item: Math.random() * 0.1,
      },
      reviewCount: Math.floor(Math.random() * 1000),
    },
    reliability: {
      communicationScore: 0.6 + Math.random() * 0.4,
      contractCompliance: 0.8 + Math.random() * 0.2,
      dataAccuracy: 0.8 + Math.random() * 0.2,
      systemIntegrationScore: 0.7 + Math.random() * 0.3,
      uptime: 0.95 + Math.random() * 0.05, // 95-100%
    },
    sales: {
      averageOrderValue: baseRevenue / totalOrders,
      conversionRate: 0.01 + Math.random() * 0.04, // 1-5%
      growthRate: -0.2 + Math.random() * 0.5, // -20% to +30%
      returnRate: Math.random() * 0.15, // 0-15%
      totalOrders,
      totalRevenue: baseRevenue,
    },
  };
}

// Step 3: Calculate performance scores
export const calculatePerformanceScoresStep = compose(
  createStep('calculate-scores', async (data: any) => {
    const { merchants, metrics, scoringConfig } = data;

    // Calculate scores using the analyzer factory
    const performanceScores = await performanceAnalyzerFactory.handler({
      input: {
        config: scoringConfig,
        merchants,
        metrics,
      },
    });

    return {
      ...data,
      performanceScores,
      scoresCalculated: true,
    };
  }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
,
    }),
);

// Step 4: Generate benchmark comparisons
export const generateBenchmarkComparisonsStep = createStep(
  'generate-benchmarks',
  async (data: any) => {
    const { performanceScores, scoringConfig } = data;
    const benchmarkData = [];

    // Calculate peer group benchmarks
    const scoresByCategory = new Map();
    const scoresByRegion = new Map();
    const scoresByTier = new Map();

    performanceScores.forEach((score: any) => {
      const merchant = data.merchants.find((m: any) => m.merchantId === score.merchantId);

      // Group by category
      if (!scoresByCategory.has(merchant.category)) {
        scoresByCategory.set(merchant.category, []);
      }
      scoresByCategory.get(merchant.category).push(score);

      // Group by region
      if (!scoresByRegion.has(merchant.region)) {
        scoresByRegion.set(merchant.region, []);
      }
      scoresByRegion.get(merchant.region).push(score);

      // Group by tier
      if (!scoresByTier.has(merchant.tier)) {
        scoresByTier.set(merchant.tier, []);
      }
      scoresByTier.get(merchant.tier).push(score);
    });

    // Calculate benchmark statistics
    for (const score of performanceScores) {
      const merchant = data.merchants.find((m: any) => m.merchantId === score.merchantId);

      const categoryPeers = scoresByCategory.get(merchant.category) || [];
      const regionPeers = scoresByRegion.get(merchant.region) || [];
      const tierPeers = scoresByTier.get(merchant.tier) || [];

      benchmarkData.push({
        category: {
          average: calculateAverage(categoryPeers.map((s: any) => s.overallScore)),
          median: calculateMedian(categoryPeers.map((s: any) => s.overallScore)),
          peerCount: categoryPeers.length,
          percentile: calculatePercentile(
            score.overallScore,
            categoryPeers.map((s: any) => s.overallScore),
          ),
        },
        merchantId: score.merchantId,
        region: {
          average: calculateAverage(regionPeers.map((s: any) => s.overallScore)),
          median: calculateMedian(regionPeers.map((s: any) => s.overallScore)),
          peerCount: regionPeers.length,
          percentile: calculatePercentile(
            score.overallScore,
            regionPeers.map((s: any) => s.overallScore),
          ),
        },
        tier: {
          average: calculateAverage(tierPeers.map((s: any) => s.overallScore)),
          median: calculateMedian(tierPeers.map((s: any) => s.overallScore)),
          peerCount: tierPeers.length,
          percentile: calculatePercentile(
            score.overallScore,
            tierPeers.map((s: any) => s.overallScore),
          ),
        },
      });
    }

    return {
      ...data,
      benchmarkData,
      benchmarksGenerated: true,
    };
  },
);

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculatePercentile(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = sorted.filter((v) => v <= value).length;
  return (rank / sorted.length) * 100;
}

// Step 5: Identify actionable insights
export const identifyActionableInsightsStep = createStep('identify-insights', async (data: any) => {
  const { actionConfig, benchmarkData, performanceScores } = data;
  const insights = [];
  const recommendations = [];
  const alerts: any[] = [];

  if (actionConfig.generateRecommendations) {
    for (const score of performanceScores) {
      const merchantRecommendations = generateMerchantRecommendations(score);
      recommendations.push({
        merchantId: score.merchantId,
        recommendations: merchantRecommendations,
      });
    }
  }

  if (actionConfig.identifyRisks) {
    const riskMerchants = performanceScores.filter(
      (s: any) => s.overallScore < 0.5 || s.riskFactors.some((r: any) => r.severity === 'high'),
    );

    riskMerchants.forEach((merchant: any) => {
      alerts.push({
        type: 'performance_risk',
        merchantId: merchant.merchantId,
        message: `Merchant performance score of ${(merchant.overallScore * 100).toFixed(1)}% indicates risk`,
        riskFactors: merchant.riskFactors,
        severity: merchant.overallScore < 0.3 ? 'critical' : 'high',
      });
    });
  }

  // Generate marketplace insights
  const marketplaceInsights = generateMarketplaceInsights(performanceScores, benchmarkData);
  insights.push(...marketplaceInsights);

  return {
    ...data,
    alerts,
    insights,
    insightsGenerated: true,
    recommendations,
  };
});

function generateMerchantRecommendations(score: any): any[] {
  const recommendations = [];

  // Category-specific recommendations
  Object.entries(score.categoryScores).forEach(([category, categoryScore]: [string, any]) => {
    if (categoryScore < 0.6) {
      recommendations.push({
        action: getImprovementAction(category, categoryScore),
        category,
        expectedImpact: `Improve ${category} score by 15-25%`,
        priority: categoryScore < 0.4 ? 'high' : 'medium',
      });
    }
  });

  // Risk-based recommendations
  score.riskFactors.forEach((risk: any) => {
    recommendations.push({
      action: getRiskMitigationAction(risk.factor),
      category: 'risk_mitigation',
      expectedImpact: risk.impact,
      priority: risk.severity,
    });
  });

  // Growth recommendations
  if (score.trends.trend === 'declining') {
    recommendations.push({
      action: 'Implement performance improvement plan',
      category: 'performance_recovery',
      expectedImpact: 'Reverse declining trend and stabilize performance',
      priority: 'high',
    });
  }

  return recommendations;
}

function getImprovementAction(category: string, score: number): string {
  const actions = {
    compliance: 'Review and update compliance procedures',
    customerService: 'Reduce response times and improve resolution processes',
    fulfillment: 'Optimize shipping processes and inventory management',
    growth: 'Develop growth strategy and marketing initiatives',
    quality: 'Implement quality control measures and product testing',
    reliability: 'Improve system uptime and data accuracy',
    sales: 'Focus on conversion optimization and customer acquisition',
  };

  return actions[(category as any)] || 'Implement improvement measures';
}

function getRiskMitigationAction(riskFactor: string): string {
  const actions = {
    compliance_risk: 'Conduct compliance audit and training',
    customer_service_risk: 'Implement customer service training program',
    fulfillment_risk: 'Optimize logistics and fulfillment operations',
    growth_risk: 'Develop business recovery plan',
    quality_risk: 'Review product quality control processes',
  };

  return actions[(riskFactor as any)] || 'Address identified risk factors';
}

function generateMarketplaceInsights(scores: any[], benchmarkData: any[]): any[] {
  const insights = [];

  // Overall performance distribution
  const tierCounts = scores.reduce((acc, score) => {
    acc[score.tier] = (acc[score.tier] || 0) + 1;
    return acc;
  }, {});

  if (tierCounts.probation > scores.length * 0.1) {
    insights.push({
      type: 'marketplace_health',
      action: 'Implement merchant support programs',
      description: `${tierCounts.probation} merchants (${((tierCounts.probation / scores.length) * 100).toFixed(1)}%) are on probation`,
      priority: 'medium',
      title: 'High Number of Underperforming Merchants',
    });
  }

  // Category performance analysis
  const categoryPerformance = new Map();
  scores.forEach((score) => {
    const merchant = { category: 'Electronics' }; // Mock - would be from actual data
    if (!categoryPerformance.has(merchant.category)) {
      categoryPerformance.set(merchant.category, []);
    }
    categoryPerformance.get(merchant.category).push(score.overallScore);
  });

  categoryPerformance.forEach((scores, category) => {
    const avgScore = calculateAverage(scores);
    if (avgScore < 0.6) {
      insights.push({
        type: 'category_performance',
        action: `Provide category-specific support for ${category} merchants`,
        description: `Average score of ${(avgScore * 100).toFixed(1)}% below marketplace average`,
        priority: 'low',
        title: `${category} Category Underperforming`,
      });
    }
  });

  return insights;
}

// Step 6: Generate merchant segments
export const generateMerchantSegmentsStep = createStep('generate-segments', async (data: any) => {
  const { actionConfig, performanceScores } = data;

  if (!actionConfig.segmentMerchants) {
    return {
      ...data,
      segmentationSkipped: true,
    };
  }

  const segments = {
    at_risk: [],
    champions: [],
    critical: [],
    rising_stars: [],
    steady_performers: [],
  };

  performanceScores.forEach((score: any) => {
    if (score.overallScore >= 0.85 && score.trends.trend !== 'declining') {
      segments.champions.push(score.merchantId);
    } else if (score.overallScore >= 0.7 && score.trends.trend === 'improving') {
      segments.rising_stars.push(score.merchantId);
    } else if (score.overallScore >= 0.6 && score.trends.trend === 'stable') {
      segments.steady_performers.push(score.merchantId);
    } else if (score.overallScore >= 0.4) {
      segments.at_risk.push(score.merchantId);
    } else {
      segments.critical.push(score.merchantId);
    }
  });

  return {
    ...data,
    merchantSegments: segments,
    segmentationComplete: true,
  };
});

// Step 7: Update merchant tiers
export const updateMerchantTiersStep = createStep('update-tiers', async (data: any) => {
  const { actionConfig, performanceScores } = data;

  if (!actionConfig.updateTiers) {
    return {
      ...data,
      tierUpdatesSkipped: true,
    };
  }

  const tierUpdates = [];

  for (const score of performanceScores) {
    const currentMerchant = data.merchants.find((m: any) => m.merchantId === score.merchantId);
    const newTier = score.tier;
    const oldTier = currentMerchant.tier;

    if (newTier !== oldTier) {
      const update = await updateMerchantTier(score.merchantId, oldTier, newTier);
      tierUpdates.push(update);
    }
  }

  return {
    ...data,
    tiersUpdated: true,
    tierUpdates,
  };
});

async function updateMerchantTier(
  merchantId: string,
  oldTier: string,
  newTier: string,
): Promise<any> {
  // Simulate tier update
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    merchantId,
    newTier,
    oldTier,
    success: Math.random() > 0.05, // 95% success rate
    updatedAt: new Date().toISOString(),
  };
}

// Step 8: Send notifications
export const sendNotificationsStep = createStep('send-notifications', async (data: any) => {
  const { alerts, performanceScores, reportingConfig, tierUpdates } = data;

  if (!reportingConfig.sendNotifications) {
    return {
      ...data,
      notificationsSkipped: true,
    };
  }

  const notifications = [];

  // Notify merchants of their scores
  for (const score of performanceScores) {
    const notification = await sendMerchantScoreNotification(score);
    notifications.push(notification);
  }

  // Send alerts to platform team
  if (alerts.length > 0) {
    const alertNotification = await sendAlertNotification(alerts);
    notifications.push(alertNotification);
  }

  // Notify about tier changes
  for (const update of tierUpdates || []) {
    if (update.success) {
      const tierNotification = await sendTierUpdateNotification(update);
      notifications.push(tierNotification);
    }
  }

  return {
    ...data,
    notifications,
    notificationsSent: notifications.filter((n) => n.sent).length,
  };
});

async function sendMerchantScoreNotification(score: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    type: 'merchant_score',
    content: {
      score: score.overallScore,
      tier: score.tier,
      trend: score.trends.trend,
    },
    merchantId: score.merchantId,
    sent: Math.random() > 0.05, // 95% delivery rate
    sentAt: new Date().toISOString(),
  };
}

async function sendAlertNotification(alerts: any[]): Promise<any> {
  return {
    type: 'platform_alert',
    content: {
      alertCount: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
    },
    recipient: 'merchant_success_team',
    sent: true,
    sentAt: new Date().toISOString(),
  };
}

async function sendTierUpdateNotification(update: any): Promise<any> {
  return {
    type: 'tier_update',
    content: {
      direction: getTierDirection(update.oldTier, update.newTier),
      newTier: update.newTier,
      oldTier: update.oldTier,
    },
    merchantId: update.merchantId,
    sent: true,
    sentAt: new Date().toISOString(),
  };
}

function getTierDirection(oldTier: string, newTier: string): string {
  const tierOrder = ['probation', 'bronze', 'silver', 'gold', 'platinum'];
  const oldIndex = tierOrder.indexOf(oldTier);
  const newIndex = tierOrder.indexOf(newTier);

  if (newIndex > oldIndex) return 'promotion';
  if (newIndex < oldIndex) return 'demotion';
  return 'unchanged';
}

// Step 9: Generate performance report
export const generatePerformanceReportStep = createStep('generate-report', async (data: any) => {
  const {
    alerts,
    benchmarkData,
    insights,
    merchantSegments,
    performanceScores,
    recommendations,
    tierUpdates,
    totalMerchants,
  } = data;

  const report = {
    alerts: alerts.filter((a: any) => a.severity === 'critical' || a.severity === 'high'),
    bottomPerformers: performanceScores
      .sort((a: any, b: any) => a.overallScore - b.overallScore)
      .slice(0, 10)
      .map((s: any) => ({
        merchantId: s.merchantId,
        riskFactors: s.riskFactors.filter((r: any) => r.severity === 'high'),
        score: s.overallScore,
        tier: s.tier,
        weaknesses: s.weaknesses.slice(0, 2),
      })),
    changes: {
      demotions:
        tierUpdates?.filter((u: any) => getTierDirection(u.oldTier, u.newTier) === 'demotion')
          .length || 0,
      promotions:
        tierUpdates?.filter((u: any) => getTierDirection(u.oldTier, u.newTier) === 'promotion')
          .length || 0,
      tierUpdates: tierUpdates?.length || 0,
    },
    insights: insights.slice(0, 10),
    period: data.scoringPeriod,
    recommendations: generateTopRecommendations(recommendations),
    reportId: `merchant_performance_${Date.now()}`,
    segments: merchantSegments,
    summary: {
      averageScore: calculateAverage(performanceScores.map((s: any) => s.overallScore)),
      merchantsEvaluated: totalMerchants,
      scoreDistribution: calculateScoreDistribution(performanceScores),
      tierDistribution: calculateTierDistribution(performanceScores),
      trendsOverview: analyzeTrendsOverview(performanceScores),
    },
    timestamp: new Date().toISOString(),
    topPerformers: performanceScores
      .sort((a: any, b: any) => b.overallScore - a.overallScore)
      .slice(0, 10)
      .map((s: any) => ({
        merchantId: s.merchantId,
        score: s.overallScore,
        strengths: s.strengths.slice(0, 2),
        tier: s.tier,
      })),
  };

  return {
    ...data,
    report,
    scoringComplete: true,
  };
});

function calculateScoreDistribution(scores: any[]): any {
  const distribution = {
    '50-59': 0,
    '60-69': 0,
    '70-79': 0,
    '80-89': 0,
    '90-100': 0,
    'below-50': 0,
  };

  scores.forEach((score) => {
    const percentage = score.overallScore * 100;
    if (percentage >= 90) distribution['90-100']++;
    else if (percentage >= 80) distribution['80-89']++;
    else if (percentage >= 70) distribution['70-79']++;
    else if (percentage >= 60) distribution['60-69']++;
    else if (percentage >= 50) distribution['50-59']++;
    else distribution['below-50']++;
  });

  return distribution;
}

function calculateTierDistribution(scores: any[]): any {
  return scores.reduce((acc, score) => {
    acc[score.tier] = (acc[score.tier] || 0) + 1;
    return acc;
  }, {});
}

function analyzeTrendsOverview(scores: any[]): any {
  const trends = { declining: 0, improving: 0, stable: 0 };

  scores.forEach((score) => {
    trends[(score.trends.trend as any)]++;
  });

  return {
    distribution: trends,
    dominant: Object.entries(trends).sort((a, b) => b[1] - a[1])[0][0],
  };
}

function generateTopRecommendations(merchantRecommendations: any[]): any[] {
  const allRecommendations = merchantRecommendations.flatMap((mr) =>
    mr.recommendations.map((r: any) => ({
      ...r,
      merchantId: mr.merchantId,
    })),
  );

  // Group by action and count frequency
  const actionCounts = new Map();
  allRecommendations.forEach((rec) => {
    const count = actionCounts.get(rec.action) || 0;
    actionCounts.set(rec.action, count + 1);
  });

  return Array.from(actionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([action, count]) => ({
      action,
      impact: 'Improve overall marketplace performance',
      merchantCount: count,
    }));
}

// Main workflow definition
export const merchantPerformanceScoringWorkflow = {
  id: 'merchant-performance-scoring',
  name: 'Merchant Performance Scoring',
  config: {
    concurrency: {
      max: 3, // Limit concurrent scoring jobs
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 3 1 * *', // Monthly on 1st at 3 AM
      timezone: 'UTC',
    },
  },
  description: 'Evaluate and score merchant performance across multiple metrics',
  features: {
    actionableInsights: true,
    benchmarkComparisons: true,
    multiDimensionalScoring: true,
    riskAssessment: true,
    trendAnalysis: true,
  },
  steps: [
    collectMerchantsStep,
    collectPerformanceMetricsStep,
    calculatePerformanceScoresStep,
    generateBenchmarkComparisonsStep,
    identifyActionableInsightsStep,
    generateMerchantSegmentsStep,
    updateMerchantTiersStep,
    sendNotificationsStep,
    generatePerformanceReportStep,
  ],
  version: '1.0.0',
};
