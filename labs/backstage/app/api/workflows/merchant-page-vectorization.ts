/**
 * Merchant Page Vectorization Workflow
 * Vectorize merchant PDP pages to analyze trends and match duplicates across retailers
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const MerchantPageVectorizationInput = z.object({
  analysisConfig: z.object({
    clusteringAlgorithm: z.enum(['kmeans', 'dbscan', 'hierarchical']).default('dbscan'),
    duplicateThreshold: z.number().min(0).max(1).default(0.85),
    minClusterSize: z.number().default(2),
    trendWindow: z.number().default(30), // days
  }),
  merchants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      domain: z.string(),
      pdpPatterns: z.array(
        z.object({
          urlPattern: z.string(), // regex pattern
          selector: z.object({
            availability: z.string().optional(),
            description: z.string(),
            images: z.string(),
            price: z.string(),
            specifications: z.string().optional(),
            title: z.string(),
          }),
        }),
      ),
    }),
  ),
  mode: z.enum(['single', 'batch', 'continuous']).default('batch'),
  pages: z
    .array(
      z.object({
        url: z.string().url(),
        lastCrawled: z.string().datetime().optional(),
        merchantId: z.string(),
        productId: z.string().optional(),
      }),
    )
    .optional(),
  vectorizationConfig: z.object({
    dimensions: z.number().default(768),
    includePriceFeatures: z.boolean().default(true),
    includeStructuralFeatures: z.boolean().default(true),
    includeTextFeatures: z.boolean().default(true),
    includeVisualFeatures: z.boolean().default(true),
    model: z
      .enum(['sentence-transformer', 'clip', 'bert', 'custom'])
      .default('sentence-transformer'),
  }),
});

// Page vector schema
const PageVector = z.object({
  url: z.string(),
  features: z.object({
    availability: z.string(),
    brand: z.string().optional(),
    category: z.array(z.string()),
    currency: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    price: z.number(),
    specifications: z.record(z.string()),
    title: z.string(),
  }),
  merchantId: z.string(),
  metadata: z.object({
    crawledAt: z.string(),
    processingTime: z.number(),
    quality: z.number(),
  }),
  pageId: z.string(),
  timestamp: z.string(),
  vector: z.object({
    combined: z.array(z.number()),
    price: z.array(z.number()).optional(),
    structural: z.array(z.number()).optional(),
    text: z.array(z.number()),
    visual: z.array(z.number()).optional(),
  }),
});

// Step factory for page vectorization
const pageVectorizerFactory = createWorkflowStep(
  {
    name: 'Page Vectorizer',
    category: 'ml',
    tags: ['vectorization', 'nlp', 'computer-vision'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, pages } = context.input;
    const vectors = [];

    for (const page of pages) {
      const vector = await vectorizePage(page, config);
      vectors.push(vector);
    }

    return vectors;
  },
);

// Mock page vectorization
async function vectorizePage(page: any, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const dimensions = config.dimensions;

  // Generate mock vectors
  const vectors: any = {};

  if (config.includeTextFeatures) {
    vectors.text = Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
  }

  if (config.includeVisualFeatures) {
    vectors.visual = Array.from({ length: dimensions / 2 }, () => Math.random() * 2 - 1);
  }

  if (config.includePriceFeatures) {
    vectors.price = Array.from({ length: 32 }, () => Math.random());
  }

  if (config.includeStructuralFeatures) {
    vectors.structural = Array.from({ length: 64 }, () => Math.random());
  }

  // Combine all vectors
  vectors.combined = [
    ...(vectors.text || []),
    ...(vectors.visual || []),
    ...(vectors.price || []),
    ...(vectors.structural || []),
  ].slice(0, dimensions);

  return {
    url: page.url,
    features: {
      availability: 'in_stock',
      category: ['Electronics', 'Accessories'],
      currency: 'USD',
      description: 'Product description extracted from page',
      images: [`https://example.com/image1.jpg`, `https://example.com/image2.jpg`],
      price: Math.floor(Math.random() * 500) + 10,
      specifications: {
        brand: 'BrandName',
        color: 'Black',
        model: 'ModelXYZ',
        size: 'Medium',
      },
      title: `Product Title from ${page.merchantId}`,
    },
    merchantId: page.merchantId,
    metadata: {
      crawledAt: new Date().toISOString(),
      processingTime: Math.random() * 1000,
      quality: 0.85 + Math.random() * 0.15,
    },
    pageId: `page_${page.productId || Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    vector: vectors,
  };
}

// Step 1: Crawl merchant pages
export const crawlMerchantPagesStep = compose(
  createStepWithValidation(
    'crawl-pages',
    async (input: z.infer<typeof MerchantPageVectorizationInput>) => {
      const { merchants, mode, pages } = input;

      let pagesToCrawl = pages || [];

      // If no pages provided, generate from merchant patterns
      if (!pages || pages.length === 0) {
        pagesToCrawl = await generatePageList(merchants, mode);
      }

      const crawledPages: any[] = [];
      const failedPages: any[] = [];

      // Crawl pages in batches
      const batchSize = 10;
      for (let i = 0; i < pagesToCrawl.length; i += batchSize) {
        const batch = pagesToCrawl.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
          batch.map((page) => crawlPage(page, merchants)),
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            crawledPages.push(result.value);
          } else {
            failedPages.push({
              error: result.reason.message,
              page: batch[index],
            });
          }
        });
      }

      return {
        ...input,
        crawledPages,
        crawlStarted: new Date().toISOString(),
        crawlStats: {
          failed: failedPages.length,
          success: crawledPages.length,
          successRate: crawledPages.length / (crawledPages.length + failedPages.length),
        },
        failedPages,
        totalPages: crawledPages.length,
      };
    },
    (input) => input.merchants.length > 0,
    (output) => output.crawledPages.length > 0,
  ),
  (step: any) => withStepTimeout(step, 300000), // 5 minutes
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 0.5,
      // timeout: 30000,
    }),
);

// Mock functions
async function generatePageList(merchants: any[], mode: string): Promise<any[]> {
  const pages: any[] = [];

  merchants.forEach((merchant) => {
    // Generate sample pages per merchant
    const pageCount = mode === 'single' ? 1 : mode === 'batch' ? 20 : 100;

    for (let i = 0; i < pageCount; i++) {
      pages.push({
        url: `https://${merchant.domain}/product/${i}`,
        merchantId: merchant.id,
        productId: `${merchant.id}_prod_${i}`,
      });
    }
  });

  return pages;
}

async function crawlPage(page: any, merchants: any[]): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));

  const merchant = merchants.find((m) => m.id === page.merchantId);
  if (!merchant) throw new Error('Merchant not found');

  // Simulate page crawling
  return {
    ...page,
    contentType: 'text/html',
    crawledAt: new Date().toISOString(),
    html: '<html>...</html>', // Mock HTML
    statusCode: 200,
  };
}

// Step 2: Extract features from pages
export const extractPageFeaturesStep = createStep('extract-features', async (data: any) => {
  const { crawledPages, merchants } = data;
  const extractedFeatures = [];

  for (const page of crawledPages) {
    const merchant = merchants.find((m: any) => m.id === page.merchantId);
    const features = await extractFeatures(page, merchant);
    extractedFeatures.push(features);
  }

  return {
    ...data,
    extractedFeatures,
    featuresExtracted: true,
  };
});

async function extractFeatures(page: any, merchant: any): Promise<any> {
  // Simulate feature extraction using merchant's selectors
  return {
    url: page.url,
    extractedAt: new Date().toISOString(),
    features: {
      availability: 'in_stock',
      description: 'Extracted product description with details',
      images: Array.from({ length: 3 }, (_, i) => `https://example.com/img${i}.jpg`),
      price: Math.floor(Math.random() * 500) + 10,
      specifications: {
        brand: 'ExtractedBrand',
        dimensions: '10x20x5cm',
        model: 'Model123',
      },
      structuralFeatures: {
        hasVideo: false,
        hasComparison: true,
        hasReviews: true,
        layoutType: 'standard',
      },
      title: 'Extracted Product Title',
    },
    merchantId: page.merchantId,
    pageId: page.productId || `page_${Math.random().toString(36).substr(2, 9)}`,
  };
}

// Step 3: Generate page vectors
export const generatePageVectorsStep = compose(
  createStep('generate-vectors', async (data: any) => {
    const { extractedFeatures, vectorizationConfig } = data;

    // Process in batches for efficiency
    const batchSize = 20;
    const allVectors = [];

    for (let i = 0; i < extractedFeatures.length; i += batchSize) {
      const batch = extractedFeatures.slice(i, i + batchSize);

      const batchVectors = await pageVectorizerFactory.handler({
        input: {
          config: vectorizationConfig,
          pages: batch,
        },
      });

      allVectors.push(...batchVectors);
    }

    return {
      ...data,
      pageVectors: allVectors,
      vectorsGenerated: true,
      vectorStats: {
        averageDimensions: vectorizationConfig.dimensions,
        includesText: vectorizationConfig.includeTextFeatures,
        includesVisual: vectorizationConfig.includeVisualFeatures,
        totalVectors: allVectors.length,
      },
    };
  }),
  (step: any) => withStepMonitoring(step),
);

// Step 4: Find duplicate products across merchants
export const findDuplicateProductsStep = createStep('find-duplicates', async (data: any) => {
  const { analysisConfig, pageVectors } = data;
  const { clusteringAlgorithm, duplicateThreshold, minClusterSize } = analysisConfig;

  // Calculate similarity matrix
  const similarities = [];
  const duplicateClusters: any[] = [];

  for (let i = 0; i < pageVectors.length; i++) {
    for (let j = i + 1; j < pageVectors.length; j++) {
      const similarity = calculateCosineSimilarity(
        pageVectors[i].vector.combined,
        pageVectors[j].vector.combined,
      );

      if (similarity >= duplicateThreshold) {
        similarities.push({
          confidence: calculateConfidence(pageVectors[i], pageVectors[j]),
          page1: pageVectors[i],
          page2: pageVectors[j],
          similarity,
        });
      }
    }
  }

  // Cluster similar products
  const clusters = clusterProducts(similarities, clusteringAlgorithm, minClusterSize);

  // Analyze clusters
  clusters.forEach((cluster) => {
    const analysis = analyzeCluster(cluster, pageVectors);
    duplicateClusters.push({
      confidence: analysis.confidence,
      clusterId: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      commonFeatures: analysis.commonFeatures,
      priceVariation: analysis.priceVariation,
      products: cluster.products,
      recommendations: analysis.recommendations,
    });
  });

  return {
    ...data,
    duplicateClusters,
    duplicateStats: {
      averageClusterSize:
        duplicateClusters.length > 0
          ? duplicateClusters.reduce((sum, c) => sum + c.products.length, 0) /
            duplicateClusters.length
          : 0,
      clusterCount: duplicateClusters.length,
      totalDuplicates: duplicateClusters.reduce((sum, c) => sum + c.products.length - 1, 0),
    },
  };
});

function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function calculateConfidence(page1: any, page2: any): number {
  // Calculate confidence based on feature matching
  let confidence = 0.5;

  // Brand match
  if (page1.features.brand === page2.features.brand) confidence += 0.2;

  // Similar price
  const priceDiff = Math.abs(page1.features.price - page2.features.price) / page1.features.price;
  if (priceDiff < 0.1) confidence += 0.2;

  // Image similarity (mock)
  confidence += 0.1;

  return Math.min(confidence, 1.0);
}

function clusterProducts(similarities: any[], algorithm: string, minSize: number): any[] {
  // Simple clustering implementation
  const clusters: any[] = [];
  const processed = new Set();

  similarities.forEach((sim) => {
    const key1 = sim.page1.pageId;
    const key2 = sim.page2.pageId;

    if (!processed.has(key1) && !processed.has(key2)) {
      // Create new cluster
      clusters.push({
        products: [sim.page1, sim.page2],
        similarities: [sim],
      });
      processed.add(key1);
      processed.add(key2);
    } else {
      // Add to existing cluster
      const cluster = clusters.find((c) =>
        c.products.some((p: any) => p.pageId === key1 || p.pageId === key2),
      );
      if (cluster) {
        if (!cluster.products.find((p: any) => p.pageId === key1)) {
          cluster.products.push(sim.page1);
          processed.add(key1);
        }
        if (!cluster.products.find((p: any) => p.pageId === key2)) {
          cluster.products.push(sim.page2);
          processed.add(key2);
        }
        cluster.similarities.push(sim);
      }
    }
  });

  return clusters.filter((c) => c.products.length >= minSize);
}

function analyzeCluster(cluster: any, allVectors: any[]): any {
  const products = cluster.products;

  // Calculate price variation
  const prices = products.map((p: any) => p.features.price);
  const avgPrice = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
  const priceVariation = Math.max(...prices) - Math.min(...prices);

  // Find common features
  const commonFeatures = {
    brand: products[0].features.brand,
    category: products[0].features.category,
    specifications: {},
  };

  // Generate recommendations
  const recommendations = [];
  if (priceVariation > avgPrice * 0.2) {
    recommendations.push({
      type: 'price_alignment',
      action: 'review_pricing_strategy',
      message: `Price variation of $${priceVariation.toFixed(2)} detected across merchants`,
    });
  }

  return {
    confidence:
      cluster.similarities.reduce((sum: number, s: any) => sum + s.confidence, 0) /
      cluster.similarities.length,
    commonFeatures,
    priceVariation,
    recommendations,
  };
}

// Step 5: Analyze merchant trends
export const analyzeMerchantTrendsStep = createStep('analyze-trends', async (data: any) => {
  const { analysisConfig, pageVectors } = data;
  const { trendWindow } = analysisConfig;

  // Group vectors by merchant
  const merchantVectors = new Map();
  pageVectors.forEach((vector: any) => {
    if (!merchantVectors.has(vector.merchantId)) {
      merchantVectors.set(vector.merchantId, []);
    }
    merchantVectors.get(vector.merchantId).push(vector);
  });

  // Analyze trends for each merchant
  const merchantTrends = [];
  for (const [merchantId, vectors] of merchantVectors.entries()) {
    const trend = analyzeMerchantTrend(merchantId, vectors, trendWindow);
    merchantTrends.push(trend);
  }

  return {
    ...data,
    merchantTrends,
    trendAnalysisComplete: true,
  };
});

function analyzeMerchantTrend(merchantId: string, vectors: any[], windowDays: number): any {
  // Calculate merchant-specific metrics
  const avgPrice = vectors.reduce((sum, v) => sum + v.features.price, 0) / vectors.length;
  const categories = new Set(vectors.flatMap((v) => v.features.category));
  const brands = new Set(vectors.map((v) => v.features.brand).filter((b) => b));

  // Calculate vector centroid
  const centroid = calculateCentroid(vectors.map((v) => v.vector.combined));

  // Analyze pricing trends
  const priceTrend = {
    average: avgPrice,
    max: Math.max(...(vectors as any).map((v: any) => v.features.price)),
    min: Math.min(...(vectors as any).map((v: any) => v.features.price)),
    volatility: calculatePriceVolatility(vectors),
  };

  // Product diversity
  const diversity = {
    brandCount: brands.size,
    categoryCount: categories.size,
    diversityScore: (categories.size * brands.size) / vectors.length,
    uniqueProducts: vectors.length,
  };

  return {
    vectorCentroid: centroid,
    insights: generateMerchantInsights(priceTrend, diversity),
    merchantId,
    metrics: {
      avgVectorQuality: vectors.reduce((sum, v) => sum + v.metadata.quality, 0) / vectors.length,
      diversity,
      priceTrend,
      totalProducts: vectors.length,
    },
    period: {
      end: new Date().toISOString(),
      start: new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

function calculateCentroid(vectors: number[][]): number[] {
  const dimensions = vectors[0].length;
  const centroid = new Array(dimensions).fill(0);

  vectors.forEach((vec) => {
    vec.forEach((val, idx) => {
      centroid[idx] += val;
    });
  });

  return centroid.map((val) => val / vectors.length);
}

function calculatePriceVolatility(vectors: any[]): number {
  const prices = vectors.map((v) => v.features.price);
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  return Math.sqrt(variance) / mean; // Coefficient of variation
}

function generateMerchantInsights(priceTrend: any, diversity: any): any[] {
  const insights = [];

  if (priceTrend.volatility > 0.3) {
    insights.push({
      type: 'high_price_volatility',
      impact: 'medium',
      message: 'High price volatility detected',
    });
  }

  if (diversity.diversityScore < 0.5) {
    insights.push({
      type: 'low_diversity',
      impact: 'low',
      message: 'Limited product diversity',
    });
  }

  return insights;
}

// Step 6: Store vectors and analysis
export const storeVectorsStep = compose(
  StepTemplates.database('store-vectors', 'Store page vectors and analysis results'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 7: Generate vectorization report
export const generateVectorizationReportStep = createStep('generate-report', async (data: any) => {
  const { crawlStats, duplicateClusters, merchantTrends, pageVectors, vectorStats } = data;

  const report = {
    crawling: {
      failedPages: crawlStats.failed,
      successRate: crawlStats.successRate,
      totalPages: crawlStats.success + crawlStats.failed,
    },
    duplicates: {
      topClusters: duplicateClusters.slice(0, 10).map((cluster: any) => ({
        avgPrice:
          cluster.products.reduce((sum: number, p: any) => sum + p.features.price, 0) /
          cluster.products.length,
        merchants: [...new Set(cluster.products.map((p: any) => p.merchantId))],
        priceVariation: cluster.priceVariation,
        size: cluster.products.length,
      })),
    },
    recommendations: generateVectorizationRecommendations(data),
    reportId: `vectorization_${Date.now()}`,
    summary: {
      clusterCount: duplicateClusters.length,
      duplicatesFound: data.duplicateStats?.totalDuplicates || 0,
      merchantsAnalyzed: data.merchants.length,
      pagesProcessed: pageVectors.length,
    },
    timestamp: new Date().toISOString(),
    trends: {
      byMerchant: merchantTrends.map((trend: any) => ({
        avgPrice: trend.metrics.priceTrend.average,
        diversityScore: trend.metrics.diversity.diversityScore,
        merchantId: trend.merchantId,
        priceVolatility: trend.metrics.priceTrend.volatility,
        productCount: trend.metrics.totalProducts,
      })),
    },
    vectorization: {
      dimensions: data.vectorizationConfig.dimensions,
      featuresIncluded: {
        price: data.vectorizationConfig.includePriceFeatures,
        structural: data.vectorizationConfig.includeStructuralFeatures,
        text: data.vectorizationConfig.includeTextFeatures,
        visual: data.vectorizationConfig.includeVisualFeatures,
      },
      model: data.vectorizationConfig.model,
    },
  };

  return {
    ...data,
    report,
    vectorizationComplete: true,
  };
});

function generateVectorizationRecommendations(data: any): any[] {
  const recommendations = [];

  // High duplicate rate
  const duplicateRate = (data.duplicateStats?.totalDuplicates || 0) / data.pageVectors.length;
  if (duplicateRate > 0.2) {
    recommendations.push({
      type: 'deduplication',
      action: 'consolidate_duplicate_listings',
      message: `${(duplicateRate * 100).toFixed(1)}% duplicate rate detected`,
      priority: 'high',
    });
  }

  // Poor crawl success rate
  if (data.crawlStats.successRate < 0.8) {
    recommendations.push({
      type: 'crawling',
      action: 'review_merchant_selectors',
      message: 'Low crawl success rate',
      priority: 'medium',
    });
  }

  // Enable visual features
  if (!data.vectorizationConfig.includeVisualFeatures) {
    recommendations.push({
      type: 'features',
      action: 'enable_visual_vectorization',
      message: 'Visual features disabled',
      potentialImprovement: '10-15% better matching',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const merchantPageVectorizationWorkflow = {
  id: 'merchant-page-vectorization',
  name: 'Merchant Page Vectorization',
  config: {
    concurrency: {
      max: 3, // Limit concurrent vectorization jobs
    },
    maxDuration: 7200000, // 2 hours
    schedule: {
      cron: '0 3 * * *', // Daily at 3 AM
      timezone: 'UTC',
    },
  },
  description: 'Vectorize merchant PDP pages to analyze trends and match duplicates',
  features: {
    duplicateDetection: true,
    merchantComparison: true,
    mlPowered: true,
    multiModalVectorization: true,
    trendAnalysis: true,
  },
  steps: [
    crawlMerchantPagesStep,
    extractPageFeaturesStep,
    generatePageVectorsStep,
    findDuplicateProductsStep,
    analyzeMerchantTrendsStep,
    storeVectorsStep,
    generateVectorizationReportStep,
  ],
  version: '1.0.0',
};
