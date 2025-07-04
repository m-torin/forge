/**
 * Product Enrichment Pipeline Workflow
 * Enhance product data with additional information from multiple sources
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
const ProductEnrichmentInput = z.object({
  validation: z.object({
    brandWhitelist: z.array(z.string()).optional(),
    minDescriptionLength: z.number().default(100),
    minSpecifications: z.number().default(5),
    requireImages: z.boolean().default(true),
  }),
  enrichmentConfig: z.object({
    aiConfig: z.object({
      provider: z.enum(['openai', 'anthropic', 'gemini']).default('openai'),
      maxTokens: z.number().default(2000),
      model: z.string().default('gpt-4'),
      temperature: z.number().min(0).max(1).default(0.7),
    }),
    languages: z.array(z.string()).default(['en']),
    qualityThreshold: z.number().min(0).max(1).default(0.8),
    reviewSources: z.array(z.enum(['amazon', 'trustpilot', 'google', 'internal'])).optional(),
    sources: z
      .array(
        z.enum([
          'reviews',
          'specifications',
          'ai-description',
          'category-classification',
          'brand-verification',
          'seo-metadata',
          'structured-data',
          'related-products',
          'price-history',
          'sustainability',
        ]),
      )
      .default(['reviews', 'specifications', 'ai-description']),
  }),
  mode: z.enum(['full', 'incremental', 'specific']).default('incremental'),
  products: z
    .array(
      z.object({
        brand: z.string(),
        category: z.array(z.string()),
        currentData: z
          .object({
            description: z.string().optional(),
            images: z.array(z.string()).optional(),
            reviews: z.array(z.any()).optional(),
            specifications: z.record(z.any()).optional(),
          })
          .optional(),
        productId: z.string(),
        title: z.string(),
      }),
    )
    .optional(),
});

// Enrichment result schema
const EnrichmentResult = z.object({
  enrichedData: z.object({
    brand: z.object({
      name: z.string(),
      country: z.string().optional(),
      established: z.number().optional(),
      verified: z.boolean(),
      website: z.string().optional(),
    }),
    categories: z.object({
      confidence: z.number(),
      primary: z.string(),
      secondary: z.array(z.string()),
      tags: z.array(z.string()),
    }),
    description: z.object({
      benefits: z.array(z.string()),
      enhanced: z.string(),
      features: z.array(z.string()),
      original: z.string().optional(),
      useCases: z.array(z.string()),
    }),
    relatedProducts: z.array(
      z.object({
        type: z.enum(['similar', 'complementary', 'upgrade', 'alternative']),
        productId: z.string(),
        similarity: z.number(),
      }),
    ),
    reviews: z.object({
      highlights: z.array(
        z.object({
          aspect: z.string(),
          mentions: z.number(),
          quotes: z.array(z.string()),
          sentiment: z.enum(['positive', 'negative', 'neutral']),
        }),
      ),
      summary: z.object({
        averageRating: z.number(),
        distribution: z.record(z.number()),
        sentiment: z.object({
          negative: z.number(),
          neutral: z.number(),
          positive: z.number(),
        }),
        totalReviews: z.number(),
      }),
      topReviews: z.array(
        z.object({
          content: z.string(),
          date: z.string(),
          helpful: z.number(),
          rating: z.number(),
          title: z.string(),
          verified: z.boolean(),
        }),
      ),
    }),
    seo: z.object({
      canonicalUrl: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
      structuredData: z.any(),
      title: z.string(),
    }),
    specifications: z.record(
      z.object({
        source: z.string(),
        unit: z.string().optional(),
        value: z.string(),
        verified: z.boolean(),
      }),
    ),
    sustainability: z
      .object({
        certifications: z.array(z.string()),
        ecoScore: z.number().optional(),
        materials: z.array(z.string()),
        recyclable: z.boolean(),
      })
      .optional(),
  }),
  metadata: z.object({
    enrichedAt: z.string(),
    processingTime: z.number(),
    sources: z.array(z.string()),
  }),
  productId: z.string(),
  quality: z.object({
    accuracy: z.number(),
    completeness: z.number(),
    issues: z.array(z.string()),
    score: z.number(),
  }),
});

// Step factory for AI content generation
const aiContentGeneratorFactory = createWorkflowStep(
  {
    name: 'AI Content Generator',
    category: 'ai',
    tags: ['content', 'generation', 'nlp'],
    version: '1.0.0',
  },
  async (context) => {
    const { type, aiConfig, product } = context.input;

    // Simulate AI content generation
    const content = await generateAIContent(product, aiConfig, type);

    return {
      content,
      generatedAt: new Date().toISOString(),
      model: aiConfig.model,
      productId: product.productId,
    };
  },
);

// Mock AI content generation
async function generateAIContent(product: any, aiConfig: any, type: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  switch (type) {
    case 'description':
      return {
        benefits: [
          'Saves time and effort',
          'Enhances productivity',
          'Provides excellent value',
          'Backed by warranty',
        ],
        enhanced: `Experience the exceptional quality of ${product.brand} ${product.title}. This premium product combines innovative design with superior functionality, making it the perfect choice for discerning customers. Crafted with attention to detail and built to last, it delivers outstanding performance in every use.`,
        features: [
          'Premium quality construction',
          'Innovative design elements',
          'Superior performance metrics',
          'Long-lasting durability',
          'User-friendly interface',
        ],
        useCases: ['Daily professional use', 'Home applications', 'Gift for enthusiasts'],
      };

    case 'seo':
      return {
        description: `Shop ${product.brand} ${product.title} at the best price. Compare prices from top retailers, read verified reviews, and find the perfect ${product.category[0]} for your needs.`,
        keywords: [
          product.brand.toLowerCase(),
          product.title.toLowerCase(),
          ...product.category.map((c: string) => c.toLowerCase()),
          'best price',
          'reviews',
          'compare',
        ],
        title: `${product.title} | ${product.brand} - Best Price & Reviews`,
      };

    default:
      return {};
  }
}

// Step 1: Fetch products to enrich
export const fetchProductsToEnrichStep = compose(
  createStepWithValidation(
    'fetch-products',
    async (input: z.infer<typeof ProductEnrichmentInput>) => {
      const { mode, products } = input;

      let productsToEnrich = products || [];

      if (mode === 'incremental' && !products) {
        // Fetch recently added or updated products
        productsToEnrich = await fetchRecentProducts();
      } else if (mode === 'full' && !products) {
        // Fetch all products (with pagination in production)
        productsToEnrich = await fetchAllProducts();
      }

      return {
        ...input,
        enrichmentStarted: new Date().toISOString(),
        products: productsToEnrich,
        totalProducts: productsToEnrich.length,
      };
    },
    (input) => true,
    (output) => output.products.length > 0,
  ),
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepMonitoring(step),
);

// Mock functions
async function fetchRecentProducts(): Promise<any[]> {
  return Array.from({ length: 50 }, (_, i) => ({
    brand: ['Nike', 'Adidas', 'Apple', 'Samsung'][Math.floor(Math.random() * 4)],
    category: [['Electronics', 'Clothing', 'Home', 'Sports'][Math.floor(Math.random() * 4)]],
    currentData: {
      description: i % 3 === 0 ? `Basic description for product ${i}` : undefined,
      specifications: i % 2 === 0 ? { color: 'Black', size: 'Medium' } : undefined,
    },
    productId: `prod_${i}`,
    title: `Product ${i}`,
  }));
}

async function fetchAllProducts(): Promise<any[]> {
  return fetchRecentProducts(); // Simplified for demo
}

// Step 2: Collect reviews from multiple sources
export const collectReviewsStep = compose(
  createStep('collect-reviews', async (data: any) => {
    const { enrichmentConfig, products } = data;
    const { reviewSources = ['amazon', 'google'] } = enrichmentConfig;

    const reviewData = new Map();

    for (const product of products) {
      const reviews = {
        aggregated: {
          highlights: [] as any[],
          summary: {
            averageRating: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            sentiment: { negative: 0, neutral: 0, positive: 0 },
            totalReviews: 0,
          },
          topReviews: [] as any[],
        },
        bySource: {} as Record<string, any>,
      };

      // Collect from each source
      for (const source of reviewSources) {
        const sourceReviews = await fetchReviewsFromSource(product, source);
        reviews.bySource[source] = sourceReviews;

        // Aggregate data
        (reviews.aggregated.summary as any).totalReviews += sourceReviews.count;
        (reviews.aggregated.summary as any).averageRating =
          ((reviews.aggregated.summary as any).averageRating *
            ((reviews.aggregated.summary as any).totalReviews - sourceReviews.count) +
            sourceReviews.averageRating * sourceReviews.count) /
          (reviews.aggregated.summary as any).totalReviews;
      }

      // Extract highlights using NLP
      reviews.aggregated.highlights = extractReviewHighlights(reviews.bySource);
      reviews.aggregated.topReviews = selectTopReviews(reviews.bySource);

      reviewData.set(product.productId, reviews.aggregated);
    }

    return {
      ...data,
      reviewData: Array.from(reviewData.entries()).map(([productId, reviews]) => ({
        productId,
        reviews,
      })),
      reviewsCollected: true,
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
      // trackingMetrics: ['defaultMetric'],
    }),
);

// Mock review fetching
async function fetchReviewsFromSource(product: any, source: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const count = Math.floor(Math.random() * 500) + 50;
  const avgRating = 3.5 + Math.random() * 1.5;

  return {
    averageRating: avgRating,
    count,
    reviews: Array.from({ length: 5 }, (_, i) => ({
      content: `This is a sample review content for ${product.title}. It provides detailed feedback about the product.`,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: Math.floor(Math.random() * 100),
      rating: 5 - i,
      title: `Review ${i + 1} for ${product.title}`,
      verified: Math.random() > 0.3,
    })),
    source,
  };
}

function extractReviewHighlights(reviewsBySource: any): any[] {
  // Simulate NLP analysis of reviews
  const aspects = ['quality', 'price', 'shipping', 'durability', 'design'];

  return aspects.map((aspect) => ({
    aspect,
    mentions: Math.floor(Math.random() * 50) + 10,
    quotes: [`Great ${aspect}, highly recommend!`, `The ${aspect} exceeded my expectations.`],
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
  }));
}

function selectTopReviews(reviewsBySource: any): any[] {
  const allReviews: any[] = [];
  Object.values(reviewsBySource).forEach((source: any) => {
    allReviews.push(...source.reviews);
  });

  return allReviews.sort((a: any, b: any) => b.helpful - a.helpful).slice(0, 5);
}

// Step 3: Extract and validate specifications
export const extractSpecificationsStep = createStep('extract-specifications', async (data: any) => {
  const { products } = data;
  const specificationData = [];

  for (const product of products) {
    const specs = await extractProductSpecifications(product);

    // Validate and normalize specifications
    const validatedSpecs: Record<string, any> = {};
    Object.entries(specs).forEach(([key, value]: [string, any]) => {
      const normalized = normalizeSpecification(key, value);
      if (normalized) {
        validatedSpecs[normalized.key] = {
          source: normalized.source,
          unit: normalized.unit,
          value: normalized.value,
          verified: normalized.verified,
        };
      }
    });

    specificationData.push({
      productId: product.productId,
      specCount: Object.keys(validatedSpecs).length,
      specifications: validatedSpecs,
    });
  }

  return {
    ...data,
    specificationData,
    specificationsExtracted: true,
  };
});

async function extractProductSpecifications(product: any): Promise<any> {
  // Simulate specification extraction
  const commonSpecs = {
    color: 'Black',
    dimensions: '10x20x5cm',
    manufacturer: product.brand,
    material: 'Premium plastic',
    model: `${product.brand}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    warranty: '2 years',
    weight: '500g',
  };

  // Add category-specific specs
  if (product.category.includes('Electronics')) {
    Object.assign(commonSpecs, {
      battery: '5000mAh',
      compatibility: 'iOS/Android',
      connectivity: 'Bluetooth 5.0',
    });
  }

  return commonSpecs;
}

function normalizeSpecification(key: string, value: any): any {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Extract unit if present
  const unitMatch = value.toString().match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
  if (unitMatch) {
    return {
      key: normalizedKey,
      source: 'manufacturer',
      unit: unitMatch[2],
      value: unitMatch[1],
      verified: true,
    };
  }

  return {
    key: normalizedKey,
    source: 'extracted',
    unit: null,
    value: value.toString(),
    verified: false,
  };
}

// Step 4: Generate AI-enhanced descriptions
export const generateAIDescriptionsStep = compose(
  createStep('generate-descriptions', async (data: any) => {
    const { enrichmentConfig, products } = data;
    const { aiConfig, sources } = enrichmentConfig;

    if (!sources.includes('ai-description') && !sources.includes('all')) {
      return {
        ...data,
        aiDescriptionsSkipped: true,
      };
    }

    const descriptions = [];

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const batchPromises = batch.map(async (product: any) => {
        const result = await aiContentGeneratorFactory.handler({
          input: {
            type: 'description',
            aiConfig,
            product,
          },
        });

        return {
          description: result.content,
          productId: product.productId,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      descriptions.push(...batchResults);
    }

    return {
      ...data,
      aiDescriptions: descriptions,
      descriptionsGenerated: true,
    };
  }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 300000,
      threshold: 0.5,
      // timeout: 60000,
      // trackingMetrics: ['defaultMetric'],
    }),
);

// Step 5: Classify categories with ML
export const classifyCategoriesStep = createStep('classify-categories', async (data: any) => {
  const { products } = data;
  const categoryData = [];

  for (const product of products) {
    // Simulate ML category classification
    const classification = await classifyProductCategory(product);

    categoryData.push({
      categories: classification,
      productId: product.productId,
    });
  }

  return {
    ...data,
    categoriesClassified: true,
    categoryData,
  };
});

async function classifyProductCategory(product: any): Promise<any> {
  // Simulate ML classification
  const primaryCategories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors'];
  const primary = primaryCategories[Math.floor(Math.random() * primaryCategories.length)];

  const secondaryMap: Record<string, string[]> = {
    Clothing: ["Men's", "Women's", 'Kids', 'Accessories'],
    Electronics: ['Smartphones', 'Laptops', 'Audio', 'Gaming'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden'],
    'Sports & Outdoors': ['Fitness', 'Camping', 'Team Sports', 'Water Sports'],
  };

  const tags = ['bestseller', 'new-arrival', 'eco-friendly', 'premium', 'budget-friendly'];

  return {
    confidence: 0.85 + Math.random() * 0.15,
    primary,
    secondary: secondaryMap[primary].slice(0, 2),
    tags: tags.filter(() => Math.random() > 0.7),
  };
}

// Step 6: Verify and enrich brand information
export const verifyBrandInformationStep = createStep('verify-brand', async (data: any) => {
  const { validation, products } = data;
  const brandData = [];

  for (const product of products) {
    const brandInfo = await verifyBrand(product.brand, validation.brandWhitelist);

    brandData.push({
      brand: brandInfo,
      productId: product.productId,
    });
  }

  return {
    ...data,
    brandData,
    brandsVerified: true,
  };
});

async function verifyBrand(brandName: string, whitelist?: string[]): Promise<any> {
  // Simulate brand verification
  const verified = !whitelist || whitelist.includes(brandName);

  return {
    name: brandName,
    country: ['USA', 'Germany', 'Japan', 'Italy'][Math.floor(Math.random() * 4)],
    established: verified ? 1900 + Math.floor(Math.random() * 120) : null,
    verified,
    website: verified ? `https://www.${brandName.toLowerCase()}.com` : null,
  };
}

// Step 7: Generate SEO metadata and structured data
export const generateSEOMetadataStep = compose(
  createStep('generate-seo', async (data: any) => {
    const { aiDescriptions, enrichmentConfig, products } = data;
    const seoData = [];

    for (const product of products) {
      const description = aiDescriptions?.find((d: any) => d.productId === product.productId);

      // Generate SEO content
      const seoContent = await aiContentGeneratorFactory.handler({
        input: {
          type: 'seo',
          aiConfig: enrichmentConfig.aiConfig,
          product: {
            ...product,
            enhancedDescription: description?.description,
          },
        },
      });

      // Generate structured data
      const structuredData = generateStructuredData(product, seoContent.content);

      seoData.push({
        productId: product.productId,
        seo: {
          ...seoContent.content,
          canonicalUrl: `/products/${product.productId}`,
          structuredData,
        },
      });
    }

    return {
      ...data,
      seoData,
      seoGenerated: true,
    };
  }),
  (step: any) => withStepTimeout(step, 120000),
);

function generateStructuredData(product: any, seoContent: any): any {
  return {
    name: product.title,
    '@type': 'Product',
    '@context': 'https://schema.org',
    brand: {
      name: product.brand,
      '@type': 'Brand',
    },
    category: product.category[0],
    description: seoContent.description,
    image: product.currentData?.images?.[0] || 'https://via.placeholder.com/500',
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
    },
  };
}

// Step 8: Find related products
export const findRelatedProductsStep = createStep('find-related', async (data: any) => {
  const { products } = data;
  const relatedData = [];

  for (const product of products) {
    const related = await findRelatedProducts(product, products);

    relatedData.push({
      productId: product.productId,
      relatedProducts: related,
    });
  }

  return {
    ...data,
    relatedData,
    relatedProductsFound: true,
  };
});

async function findRelatedProducts(product: any, allProducts: any[]): Promise<any[]> {
  // Simulate finding related products
  const related = [];

  // Similar products (same category)
  const similar = allProducts
    .filter((p) => p.productId !== product.productId && p.category[0] === product.category[0])
    .slice(0, 3)
    .map((p) => ({
      type: 'similar',
      productId: p.productId,
      similarity: 0.8 + Math.random() * 0.2,
    }));

  // Complementary products
  const complementary = allProducts
    .filter((p) => p.productId !== product.productId && p.brand === product.brand)
    .slice(0, 2)
    .map((p) => ({
      type: 'complementary',
      productId: p.productId,
      similarity: 0.7 + Math.random() * 0.2,
    }));

  related.push(...similar, ...complementary);

  return related;
}

// Step 9: Assess sustainability (optional)
export const assessSustainabilityStep = createStep('assess-sustainability', async (data: any) => {
  const { enrichmentConfig, products } = data;

  if (!enrichmentConfig.sources.includes('sustainability')) {
    return {
      ...data,
      sustainabilitySkipped: true,
    };
  }

  const sustainabilityData = [];

  for (const product of products) {
    const sustainability = await assessProductSustainability(product);

    sustainabilityData.push({
      productId: product.productId,
      sustainability,
    });
  }

  return {
    ...data,
    sustainabilityAssessed: true,
    sustainabilityData,
  };
});

async function assessProductSustainability(product: any): Promise<any> {
  // Simulate sustainability assessment
  return {
    certifications: Math.random() > 0.5 ? ['FSC', 'Energy Star'] : [],
    ecoScore: Math.floor(Math.random() * 100),
    materials: ['Recycled plastic', 'Organic cotton'],
    recyclable: Math.random() > 0.3,
  };
}

// Step 10: Compile and validate enriched data
export const compileEnrichedDataStep = createStep('compile-data', async (data: any) => {
  const {
    validation,
    aiDescriptions,
    brandData,
    categoryData,
    products,
    relatedData,
    reviewData,
    seoData,
    specificationData,
    sustainabilityData,
  } = data;

  const enrichedProducts = [];

  for (const product of products) {
    // Compile all enrichment data
    const enriched: any = {
      enrichedData: {
        brand: brandData?.find((b: any) => b.productId === product.productId)?.brand || {},
        categories:
          categoryData?.find((c: any) => c.productId === product.productId)?.categories || {},
        description:
          aiDescriptions?.find((d: any) => d.productId === product.productId)?.description || {},
        relatedProducts:
          relatedData?.find((r: any) => r.productId === product.productId)?.relatedProducts || [],
        reviews: reviewData?.find((r: any) => r.productId === product.productId)?.reviews || {},
        seo: seoData?.find((s: any) => s.productId === product.productId)?.seo || {},
        specifications:
          specificationData?.find((s: any) => s.productId === product.productId)?.specifications ||
          {},
      },
      metadata: {
        enrichedAt: new Date().toISOString(),
        processingTime: Math.random() * 5000,
        sources: ['reviews', 'specifications', 'ai', 'brand-verification'],
      },
      productId: product.productId,
    };

    // Add sustainability if available
    if (sustainabilityData) {
      const sustainability = sustainabilityData.find((s: any) => s.productId === product.productId);
      if (sustainability) {
        enriched.enrichedData.sustainability = sustainability.sustainability;
      }
    }

    // Calculate quality score
    enriched.quality = calculateQualityScore(enriched, validation);

    enrichedProducts.push(enriched);
  }

  return {
    ...data,
    compilationComplete: true,
    enrichedProducts,
  };
});

function calculateQualityScore(enrichedProduct: any, validation: any): any {
  const issues: any[] = [];
  let completeness = 0;
  const accuracy = 0.9; // Assume high accuracy for demo

  // Check completeness
  const checks = {
    hasBrand: enrichedProduct.enrichedData.brand?.verified,
    hasDescription:
      enrichedProduct.enrichedData.description?.enhanced?.length >= validation.minDescriptionLength,
    hasImages: !validation.requireImages || enrichedProduct.enrichedData.images?.length > 0,
    hasReviews: enrichedProduct.enrichedData.reviews?.summary?.totalReviews > 0,
    hasSEO: !!enrichedProduct.enrichedData.seo?.title,
    hasSpecifications:
      Object.keys(enrichedProduct.enrichedData.specifications).length >=
      validation.minSpecifications,
  };

  Object.entries(checks).forEach(([check, passed]) => {
    if (passed) {
      completeness += 1 / Object.keys(checks).length;
    } else {
      issues.push(`Missing or incomplete ${check.replace('has', '').toLowerCase()}`);
    }
  });

  const score = completeness * 0.7 + accuracy * 0.3;

  return {
    accuracy,
    completeness,
    issues,
    score,
  };
}

// Step 11: Store enriched data
export const storeEnrichedDataStep = compose(
  StepTemplates.database('store-enriched', 'Store enriched product data in database'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 12: Generate enrichment report
export const generateEnrichmentReportStep = createStep('generate-report', async (data: any) => {
  const { enrichedProducts, enrichmentConfig, totalProducts } = data;

  const report = {
    enrichmentSources: {
      aiDescriptions: data.descriptionsGenerated ? 'completed' : 'skipped',
      brandVerification: data.brandsVerified ? 'completed' : 'skipped',
      categories: data.categoriesClassified ? 'completed' : 'skipped',
      reviews: data.reviewsCollected ? 'completed' : 'skipped',
      seo: data.seoGenerated ? 'completed' : 'skipped',
      specifications: data.specificationsExtracted ? 'completed' : 'skipped',
      sustainability: data.sustainabilityAssessed ? 'completed' : 'skipped',
    },
    performance: {
      averagePerProduct: (Date.now() - new Date(data.enrichmentStarted).getTime()) / totalProducts,
      totalProcessingTime: Date.now() - new Date(data.enrichmentStarted).getTime(),
    },
    quality: {
      averageCompleteness:
        enrichedProducts.reduce((sum: number, p: any) => sum + p.quality.completeness, 0) /
        enrichedProducts.length,
      averageScore:
        enrichedProducts.reduce((sum: number, p: any) => sum + p.quality.score, 0) /
        enrichedProducts.length,
      commonIssues: getCommonIssues(enrichedProducts),
    },
    recommendations: generateEnrichmentRecommendations(data),
    reportId: `enrichment_${Date.now()}`,
    summary: {
      failedEnrichment: enrichedProducts.filter((p: any) => p.quality.score <= 0.4).length,
      partiallyEnriched: enrichedProducts.filter(
        (p: any) => p.quality.score > 0.4 && p.quality.score <= 0.7,
      ).length,
      successfullyEnriched: enrichedProducts.filter((p: any) => p.quality.score > 0.7).length,
      totalProducts: totalProducts,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    enrichmentComplete: true,
    report,
  };
});

function getCommonIssues(enrichedProducts: any[]): any[] {
  const issueCount = new Map();

  enrichedProducts.forEach((product) => {
    product.quality.issues.forEach((issue: string) => {
      issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
    });
  });

  return Array.from(issueCount.entries())
    .map(([issue, count]) => ({
      count,
      issue,
      percentage: (count / enrichedProducts.length) * 100,
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);
}

function generateEnrichmentRecommendations(data: any): any[] {
  const recommendations = [];

  if (data.report?.quality?.averageCompleteness < 0.8) {
    recommendations.push({
      type: 'completeness',
      message: 'Average completeness below 80%. Review data sources and validation rules.',
      priority: 'high',
    });
  }

  if (!data.reviewsCollected) {
    recommendations.push({
      type: 'missing-source',
      message: 'Review collection was skipped. Enable to improve product credibility.',
      priority: 'medium',
    });
  }

  if (data.aiDescriptions && data.enrichmentConfig.aiConfig.model !== 'gpt-4') {
    recommendations.push({
      type: 'optimization',
      message: 'Consider using GPT-4 for higher quality AI-generated content.',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const productEnrichmentPipelineWorkflow = {
  id: 'product-enrichment-pipeline',
  name: 'Product Enrichment Pipeline',
  config: {
    concurrency: {
      max: 3, // Limit concurrent enrichment jobs
    },
    maxDuration: 7200000, // 2 hours
    schedule: {
      cron: '0 2 * * *', // Daily at 2 AM
      timezone: 'UTC',
    },
  },
  description: 'Enhance product data with reviews, AI descriptions, and additional metadata',
  features: {
    aiContentGeneration: true,
    multiSourceEnrichment: true,
    reviewAggregation: true,
    seoOptimization: true,
    sustainabilityTracking: true,
  },
  steps: [
    fetchProductsToEnrichStep,
    collectReviewsStep,
    extractSpecificationsStep,
    generateAIDescriptionsStep,
    classifyCategoriesStep,
    verifyBrandInformationStep,
    generateSEOMetadataStep,
    findRelatedProductsStep,
    assessSustainabilityStep,
    compileEnrichedDataStep,
    storeEnrichedDataStep,
    generateEnrichmentReportStep,
  ],
  version: '1.0.0',
};
