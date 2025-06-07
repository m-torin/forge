/**
 * Universal Registry Workflow
 * Support product registry operations for the universal catalog in apps/web
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createWorkflowStep,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
} from '@repo/orchestration';

// Input schemas
const UniversalRegistryInput = z.object({
  operation: z.enum(['sync', 'merge', 'deduplicate', 'enrich', 'validate']),
  options: z.object({
    enrichmentProviders: z.array(z.string()).optional(),
    validationRules: z
      .array(
        z.object({
          field: z.string(),
          params: z.any().optional(),
          rule: z.enum(['required', 'unique', 'format', 'range']),
        }),
      )
      .optional(),
    batchSize: z.number().default(1000),
    deduplicationStrategy: z.enum(['exact', 'fuzzy', 'ml']).default('fuzzy'),
  }),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['api', 'file', 'database', 'scraper']),
      config: z.object({
        credentials: z
          .object({
            apiKey: z.string().optional(),
            auth: z.string().optional(),
          })
          .optional(),
        endpoint: z.string().optional(),
        mapping: z.record(z.string()).optional(), // Field mappings
      }),
    }),
  ),
  target: z.object({
    namespace: z.string().default('global'),
    registryId: z.string().default('universal-registry'),
    version: z.string().default('v1'),
  }),
});

// Product schema for universal registry
const UniversalProductSchema = z.object({
  // Core identifiers
  id: z.string(),
  gtin: z.string().optional(), // Global Trade Item Number
  mpn: z.string().optional(), // Manufacturer Part Number
  sku: z.string(),

  brand: z.string(),
  category: z.array(z.string()),
  description: z.string(),
  // Basic information
  title: z.string(),

  // Pricing
  price: z.object({
    amount: z.number(),
    currency: z.string(),
    originalAmount: z.number().optional(),
  }),

  // Inventory
  availability: z.enum(['in_stock', 'out_of_stock', 'preorder', 'discontinued']),
  inventory: z.number().optional(),

  // Media
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      isPrimary: z.boolean().default(false),
    }),
  ),

  // Attributes
  attributes: z.record(z.any()),

  // Metadata
  source: z.object({
    id: z.string(),
    name: z.string(),
    lastUpdated: z.string(),
  }),

  // Registry metadata
  registryMetadata: z.object({
    validationStatus: z.enum(['valid', 'invalid', 'pending']).optional(),
    mergedFrom: z.array(z.string()).optional(),
    qualityScore: z.number().min(0).max(1).optional(),
    version: z.string(),
  }),
});

// Reusable product normalizer
const productNormalizerFactory = createWorkflowStep(
  {
    name: 'Product Normalizer',
    category: 'transformation',
    tags: ['normalization', 'registry'],
    version: '1.0.0',
  },
  async (context) => {
    const { product, sourceMapping } = context.input;

    // Apply field mappings
    const normalized: any = {};
    Object.entries(sourceMapping || {}).forEach(([sourceField, targetField]) => {
      if (product[sourceField] !== undefined) {
        normalized[targetField as string] = product[sourceField];
      }
    });

    // Ensure required fields
    normalized.id = normalized.id || product.id || `gen_${Date.now()}`;
    normalized.title = normalized.title || product.name || product.title || 'Unknown Product';
    normalized.brand = normalized.brand || product.manufacturer || product.brand || 'Unknown';

    // Normalize price
    if (product.price) {
      normalized.price = {
        amount: typeof product.price === 'number' ? product.price : product.price.amount,
        currency: product.currency || product.price.currency || 'USD',
      };
    }

    // Normalize categories
    if (product.category) {
      normalized.category = Array.isArray(product.category)
        ? product.category
        : product.category.split(/[,>/]/).map((c: string) => c.trim());
    }

    return {
      output: normalized,
      success: true,
    };
  },
);

// Step 1: Fetch products from sources
export const fetchProductsStep = compose(
  createStep('fetch-products', async (input: z.infer<typeof UniversalRegistryInput>) => {
    const { options, sources } = input;
    const fetchedProducts = [];

    for (const source of sources) {
      let products = [];

      switch (source.type) {
        case 'api':
          // Simulate API fetch
          products = await fetchFromAPI(source);
          break;
        case 'file':
          // Simulate file processing
          products = await fetchFromFile(source);
          break;
        case 'database':
          // Simulate database query
          products = await fetchFromDatabase(source);
          break;
        case 'scraper':
          // Simulate web scraping
          products = await fetchFromScraper(source);
          break;
      }

      fetchedProducts.push({
        count: products.length,
        fetchedAt: new Date().toISOString(),
        products,
        sourceId: source.id,
        sourceName: source.name,
      });
    }

    return {
      ...input,
      fetchedProducts,
      totalProducts: fetchedProducts.reduce((sum, s) => sum + s.count, 0),
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
  (step) =>
    withStepMonitoring(step, {
, 'sourceCount'],
      enableDetailedLogging: true,
    }),
);

// Mock fetch functions
async function fetchFromAPI(source: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Array.from({ length: 100 }, (_, i) => ({
    id: `${source.id}_${i}`,
    name: `Product ${i} from ${source.name}`,
    brand: `Brand ${Math.floor(Math.random() * 10)}`,
    category: `Category ${Math.floor(Math.random() * 5)}`,
    price: Math.floor(Math.random() * 1000) + 10,
  }));
}

async function fetchFromFile(source: any): Promise<any[]> {
  return fetchFromAPI(source); // Simplified
}

async function fetchFromDatabase(source: any): Promise<any[]> {
  return fetchFromAPI(source); // Simplified
}

async function fetchFromScraper(source: any): Promise<any[]> {
  return fetchFromAPI(source); // Simplified
}

// Step 2: Normalize products
export const normalizeProductsStep = createStep('normalize-products', async (data: any) => {
  const { fetchedProducts, sources } = data;
  const normalizedProducts = [];

  const normalizer = productNormalizerFactory;

  for (const sourceData of fetchedProducts) {
    const source = sources.find((s: any) => s.id === sourceData.sourceId);
    const normalized = [];

    for (const product of sourceData.products) {
      const result = await normalizer.execute({
        executionId: `norm_${Date.now()}`,
        input: {
          product,
          sourceMapping: source?.config.mapping || {},
        },
        workflowId: 'universal-registry',
      });

      if (result.success) {
        normalized.push({
          ...result.output,
          registryMetadata: {
            validationStatus: 'pending',
            version: data.target.version,
          },
          source: {
            id: sourceData.sourceId,
            name: sourceData.sourceName,
            lastUpdated: sourceData.fetchedAt,
          },
        });
      }
    }

    normalizedProducts.push({
      failedCount: sourceData.products.length - normalized.length,
      normalizedCount: normalized.length,
      products: normalized,
      sourceId: sourceData.sourceId,
    });
  }

  return {
    ...data,
    normalizedProducts,
    totalNormalized: normalizedProducts.reduce((sum, s) => sum + s.normalizedCount, 0),
  };
});

// Step 3: Deduplicate products
export const deduplicateProductsStep = createStep('deduplicate-products', async (data: any) => {
  const { normalizedProducts, options } = data;
  const { deduplicationStrategy } = options;

  // Combine all products
  const allProducts = normalizedProducts.flatMap((s: any) => s.products);
  const deduplicationResults = {
    duplicates: [] as any[],
    mergedProducts: [] as any[],
    unique: [] as any[],
  };

  // Build deduplication index
  const seen = new Map<string, any[]>();

  for (const product of allProducts) {
    let key: string;

    switch (deduplicationStrategy) {
      case 'exact':
        // Use SKU or GTIN for exact matching
        key = product.sku || product.gtin || product.id;
        break;

      case 'fuzzy':
        // Use normalized title + brand for fuzzy matching
        key = `${product.brand.toLowerCase()}_${product.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        break;

      case 'ml':
        // Simulate ML-based deduplication using multiple features
        const features = [
          product.brand.toLowerCase(),
          product.title.toLowerCase().substring(0, 20),
          Math.floor(product.price?.amount / 10) * 10, // Price bucket
        ].join('_');
        key = features;
        break;

      default:
        key = product.id;
    }

    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(product);
  }

  // Process duplicates
  for (const [key, products] of seen.entries()) {
    if (products.length === 1) {
      deduplicationResults.unique.push(products[0]);
    } else {
      // Merge duplicate products
      const merged = mergeProducts(products);
      deduplicationResults.mergedProducts.push(merged);
      deduplicationResults.duplicates.push({
        key,
        mergedId: merged.id,
        products,
      });
    }
  }

  return {
    ...data,
    deduplicationResults,
    deduplicationStats: {
      deduplicationRate:
        ((allProducts.length -
          deduplicationResults.unique.length -
          deduplicationResults.mergedProducts.length) /
          allProducts.length) *
        100,
      duplicateSets: deduplicationResults.duplicates.length,
      merged: deduplicationResults.mergedProducts.length,
      totalProcessed: allProducts.length,
      unique: deduplicationResults.unique.length,
    },
  };
});

// Helper function to merge duplicate products
function mergeProducts(products: any[]): any {
  // Sort by source priority or timestamp
  const sorted = products.sort(
    (a, b) => new Date(b.source.lastUpdated).getTime() - new Date(a.source.lastUpdated).getTime(),
  );

  const primary = sorted[0];
  const merged = {
    ...primary,
    registryMetadata: {
      ...primary.registryMetadata,
      mergedFrom: products.map((p) => p.id),
      qualityScore: calculateQualityScore(products),
    },
  };

  // Merge additional data from other sources
  products.forEach((product) => {
    // Merge images
    if (product.images) {
      merged.images = [...new Set([...merged.images, ...product.images])];
    }

    // Merge attributes
    merged.attributes = { ...merged.attributes, ...product.attributes };
  });

  return merged;
}

function calculateQualityScore(products: any[]): number {
  // Simple quality score based on data completeness
  const scores = products.map((p) => {
    let score = 0;
    if (p.description) score += 0.2;
    if (p.images?.length > 0) score += 0.2;
    if (p.gtin) score += 0.2;
    if (p.mpn) score += 0.1;
    if (p.attributes && Object.keys(p.attributes).length > 5) score += 0.3;
    return score;
  });

  return Math.max(...scores);
}

// Step 4: Enrich products
export const enrichProductsStep = StepTemplates.conditional(
  'enrich-products',
  'Enrich products with additional data',
  {
,
    trueStep: createStep('perform-enrichment', async (data: any) => {
      const { deduplicationResults, options } = data;
      const products = [...deduplicationResults.unique, ...deduplicationResults.mergedProducts];
      const enrichedProducts = [];

      for (const product of products) {
        let enriched = { ...product };

        // Apply each enrichment provider
        for (const provider of options.enrichmentProviders || []) {
          switch (provider) {
            case 'image-analysis':
              enriched = await enrichWithImageAnalysis(enriched);
              break;
            case 'category-mapping':
              enriched = await enrichWithCategoryMapping(enriched);
              break;
            case 'pricing-intelligence':
              enriched = await enrichWithPricingIntelligence(enriched);
              break;
            case 'seo-metadata':
              enriched = await enrichWithSEOMetadata(enriched);
              break;
          }
        }

        enrichedProducts.push(enriched);
      }

      return {
        ...data,
        enrichedProducts,
        enrichmentComplete: true,
      };
    }),
  },
);

// Mock enrichment functions
async function enrichWithImageAnalysis(product: any): Promise<any> {
  return {
    ...product,
    attributes: {
      ...product.attributes,
      imageQuality: Math.random() > 0.5 ? 'high' : 'medium',
      primaryColor: ['red', 'blue', 'green', 'black', 'white'][Math.floor(Math.random() * 5)],
    },
  };
}

async function enrichWithCategoryMapping(product: any): Promise<any> {
  const taxonomyMap: Record<string, string[]> = {
    Clothing: ['Apparel', 'Fashion', 'Clothing & Accessories'],
    Electronics: ['Electronics', 'Technology', 'Gadgets'],
  };

  const primaryCategory = product.category[0];
  const mappedCategories = taxonomyMap[primaryCategory] || product.category;

  return {
    ...product,
    attributes: {
      ...product.attributes,
      googleProductCategory: mappedCategories.join(' > '),
    },
    category: mappedCategories,
  };
}

async function enrichWithPricingIntelligence(product: any): Promise<any> {
  const marketPrice = product.price.amount * (0.9 + Math.random() * 0.2);

  return {
    ...product,
    attributes: {
      ...product.attributes,
      marketPrice,
      priceCompetitiveness: marketPrice > product.price.amount ? 'below-market' : 'above-market',
    },
  };
}

async function enrichWithSEOMetadata(product: any): Promise<any> {
  return {
    ...product,
    attributes: {
      ...product.attributes,
      seoDescription: `Buy ${product.title} by ${product.brand}. ${product.description?.substring(0, 150)}...`,
      seoKeywords: [...product.category, product.brand, product.title.split(' ')].flat(),
      seoTitle: `${product.title} - ${product.brand} | Best Price`,
    },
  };
}

// Step 5: Validate products
export const validateProductsStep = createStep('validate-products', async (data: any) => {
  const { deduplicationResults, enrichedProducts, options } = data;
  const products = enrichedProducts || [
    ...deduplicationResults.unique,
    ...deduplicationResults.mergedProducts,
  ];
  const validationResults = {
    invalid: [] as any[],
    valid: [] as any[],
    warnings: [] as any[],
  };

  const rules = options.validationRules || [
    { field: 'title', rule: 'required' },
    { field: 'price.amount', params: { max: 1000000, min: 0 }, rule: 'range' },
    { field: 'images', rule: 'required' },
  ];

  for (const product of products) {
    const errors = [];
    const warnings = [];

    // Apply validation rules
    for (const rule of rules) {
      const fieldValue = rule.field.split('.').reduce((obj, key) => obj?.[key], product);

      switch (rule.rule) {
        case 'required':
          if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            errors.push(`${rule.field} is required`);
          }
          break;

        case 'unique':
          // Would check against existing registry
          break;

        case 'format':
          if (rule.params?.pattern && !new RegExp(rule.params.pattern).test(fieldValue)) {
            errors.push(`${rule.field} has invalid format`);
          }
          break;

        case 'range':
          if (typeof fieldValue === 'number') {
            if (rule.params?.min !== undefined && fieldValue < rule.params.min) {
              errors.push(`${rule.field} is below minimum value ${rule.params.min}`);
            }
            if (rule.params?.max !== undefined && fieldValue > rule.params.max) {
              errors.push(`${rule.field} exceeds maximum value ${rule.params.max}`);
            }
          }
          break;
      }
    }

    // Additional quality checks
    if (!product.description || product.description.length < 50) {
      warnings.push('Description is too short');
    }

    if (!product.gtin && !product.mpn) {
      warnings.push('Missing GTIN and MPN identifiers');
    }

    // Update validation status
    const validatedProduct = {
      ...product,
      registryMetadata: {
        ...product.registryMetadata,
        validationErrors: errors,
        validationStatus: errors.length === 0 ? 'valid' : 'invalid',
        validationWarnings: warnings,
      },
    };

    if (errors.length === 0) {
      validationResults.valid.push(validatedProduct);
    } else {
      validationResults.invalid.push(validatedProduct);
    }

    if (warnings.length > 0) {
      validationResults.warnings.push({
        productId: product.id,
        warnings,
      });
    }
  }

  return {
    ...data,
    validationResults,
    validationStats: {
      invalid: validationResults.invalid.length,
      valid: validationResults.valid.length,
      validationRate: (validationResults.valid.length / products.length) * 100,
      total: products.length,
      withWarnings: validationResults.warnings.length,
    },
  };
});

// Step 6: Store in universal registry
export const storeInRegistryStep = compose(
  StepTemplates.database('store-registry', 'Store products in universal registry database'),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
);

// Step 7: Update registry indexes
export const updateIndexesStep = createStep('update-indexes', async (data: any) => {
  const { validationResults, target } = data;
  const validProducts = validationResults.valid;

  // Create various indexes for fast querying
  const indexes = {
    byBrand: new Map<string, string[]>(),
    byCategory: new Map<string, string[]>(),
    byPriceRange: new Map<string, string[]>(),
    searchIndex: [] as any[],
  };

  validProducts.forEach((product: any) => {
    // Brand index
    if (!indexes.byBrand.has(product.brand)) {
      indexes.byBrand.set(product.brand, []);
    }
    indexes.byBrand.get(product.brand)!.push(product.id);

    // Category index
    product.category.forEach((cat: string) => {
      if (!indexes.byCategory.has(cat)) {
        indexes.byCategory.set(cat, []);
      }
      indexes.byCategory.get(cat)!.push(product.id);
    });

    // Price range index
    const priceRange = getPriceRange(product.price.amount);
    if (!indexes.byPriceRange.has(priceRange)) {
      indexes.byPriceRange.set(priceRange, []);
    }
    indexes.byPriceRange.get(priceRange)!.push(product.id);

    // Search index
    indexes.searchIndex.push({
      id: product.id,
      boost: product.registryMetadata.qualityScore || 0.5,
      searchText: [product.title, product.brand, product.description, ...product.category]
        .join(' ')
        .toLowerCase(),
    });
  });

  return {
    ...data,
    indexes: {
      brandCount: indexes.byBrand.size,
      categoryCount: indexes.byCategory.size,
      priceRangeCount: indexes.byPriceRange.size,
      searchIndexSize: indexes.searchIndex.length,
    },
    indexingComplete: true,
  };
});

function getPriceRange(price: number): string {
  if (price < 10) return 'under-10';
  if (price < 50) return '10-50';
  if (price < 100) return '50-100';
  if (price < 500) return '100-500';
  if (price < 1000) return '500-1000';
  return 'over-1000';
}

// Step 8: Generate registry report
export const generateRegistryReportStep = createStep('generate-report', async (data: any) => {
  const { validationStats, deduplicationStats, indexes, operation, sources } = data;

  const report = {
    operation,
    quality: {
      validation: validationStats,
      deduplication: deduplicationStats,
      indexing: indexes,
    },
    recommendations: [],
    sources: data.fetchedProducts.map((s: any) => ({
      id: s.sourceId,
      name: s.sourceName,
      fetchTime: s.fetchedAt,
      productsProcessed: s.count,
    })),
    summary: {
      deduplicationRate: deduplicationStats?.deduplicationRate || 0,
      failedProducts: validationStats.invalid,
      overallSuccessRate: (validationStats.valid / data.totalProducts) * 100,
      sourcesProcessed: sources.length,
      successfulProducts: validationStats.valid,
      totalProducts: data.totalProducts,
    },
  };

  // Generate recommendations
  if (validationStats.validationRate < 90) {
    report.recommendations.push({
      type: 'data-quality',
      message: 'Low validation rate detected. Review source data mappings.',
      priority: 'high',
    });
  }

  if (deduplicationStats?.deduplicationRate > 20) {
    report.recommendations.push({
      type: 'deduplication',
      message: 'High duplication rate. Consider improving source data quality.',
      priority: 'medium',
    });
  }

  return {
    ...data,
    registryOperationComplete: true,
    report,
  };
});

// Main workflow definition
export const universalRegistryWorkflow = {
  id: 'universal-registry',
  name: 'Universal Registry',
  config: {
    concurrency: {
      max: 5,
    },
    maxDuration: 3600000, // 1 hour
  },
  description: 'Support product registry operations for the universal catalog',
  features: {
    validation: true,
    deduplication: true,
    enrichment: true,
    indexing: true,
    multiSourceIntegration: true,
  },
  steps: [
    fetchProductsStep,
    normalizeProductsStep,
    deduplicateProductsStep,
    enrichProductsStep,
    validateProductsStep,
    storeInRegistryStep,
    updateIndexesStep,
    generateRegistryReportStep,
  ],
  version: '1.0.0',
};
