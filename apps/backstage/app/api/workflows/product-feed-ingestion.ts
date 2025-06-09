/**
 * Product Feed Ingestion & Normalization Workflow
 * Ingest and normalize product feeds from multiple merchants in various formats
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
const ProductFeedIngestionInput = z.object({
  feedSource: z.object({
    credentials: z
      .object({
        username: z.string().optional(),
        apiKey: z.string().optional(),
        ftpHost: z.string().optional(),
        ftpPort: z.number().optional(),
        password: z.string().optional(),
      })
      .optional(),
    feedType: z.enum(['xml', 'csv', 'json', 'api', 'ftp']),
    feedUrl: z.string().url().optional(),
    format: z.enum(['google-shopping', 'facebook', 'amazon', 'custom']).default('custom'),
    merchantId: z.string(),
    merchantName: z.string(),
    schedule: z.object({
      frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).default('daily'),
      preferredTime: z.string().optional(),
      timezone: z.string().default('UTC'),
    }),
  }),
  ingestionConfig: z.object({
    validation: z.object({
      optional: z.array(z.string()).default(['description', 'image_link', 'brand']),
      required: z.array(z.string()).default(['id', 'title', 'price', 'link']),
      strict: z.boolean().default(false),
    }),
    batchSize: z.number().default(1000),
    mapping: z.record(z.string()).optional(), // source field -> target field
    mode: z.enum(['full', 'incremental', 'delta']).default('incremental'),
    transformations: z
      .array(
        z.object({
          type: z.enum(['trim', 'lowercase', 'uppercase', 'regex', 'custom']),
          field: z.string(),
          params: z.any(),
        }),
      )
      .optional(),
  }),
  normalizationConfig: z.object({
    categoryMapping: z.boolean().default(true),
    deduplication: z.boolean().default(true),
    imageOptimization: z.boolean().default(true),
    languageDetection: z.boolean().default(true),
    priceNormalization: z.boolean().default(true),
    targetSchema: z.enum(['universal', 'google', 'custom']).default('universal'),
  }),
  qualityConfig: z.object({
    autoCorrect: z.boolean().default(true),
    enrichment: z.boolean().default(true),
    minQualityScore: z.number().min(0).max(1).default(0.7),
    rejectOnError: z.boolean().default(false),
  }),
});

// Product schema after normalization
const NormalizedProduct = z.object({
  // Core identifiers
  id: z.string(),
  canonicalId: z.string().optional(),
  merchantId: z.string(),
  merchantProductId: z.string(),

  brand: z.string().optional(),
  category: z.array(z.string()),
  description: z.string(),
  productType: z.string().optional(),
  // Basic product info
  title: z.string(),

  // Pricing
  price: z.object({
    amount: z.number(),
    currency: z.string(),
    originalPrice: z.number().optional(),
    salePrice: z.number().optional(),
  }),

  // Availability
  availability: z.enum(['in_stock', 'out_of_stock', 'preorder', 'limited']),
  inventory: z.number().optional(),

  // Media
  images: z.array(
    z.object({
      width: z.number().optional(),
      type: z.enum(['main', 'additional', 'thumbnail']),
      url: z.string(),
      height: z.number().optional(),
    }),
  ),

  mobileUrl: z.string().url().optional(),
  // Links
  productUrl: z.string().url(),

  // Attributes
  attributes: z.record(z.any()),
  variants: z
    .array(
      z.object({
        id: z.string(),
        attributes: z.record(z.any()),
        availability: z.string().optional(),
        price: z.number().optional(),
      }),
    )
    .optional(),

  // Metadata
  metadata: z.object({
    validationIssues: z.array(z.string()),
    feedSource: z.string(),
    lastUpdated: z.string().datetime(),
    qualityScore: z.number(),
  }),
});

// Step factory for feed parsing
const feedParserFactory = createWorkflowStep(
  {
    name: 'Feed Parser',
    category: 'ingestion',
    tags: ['parser', 'xml', 'csv', 'json'],
    version: '1.0.0',
  },
  async (context) => {
    const { feedData, feedType, format } = context.input;

    switch (feedType) {
      case 'xml':
        return parseXMLFeed(feedData, format);
      case 'csv':
        return parseCSVFeed(feedData, format);
      case 'json':
        return parseJSONFeed(feedData, format);
      default:
        throw new Error(`Unsupported feed type: ${feedType}`);
    }
  },
);

// Mock feed parsing functions
async function parseXMLFeed(data: string, format: string): Promise<any[]> {
  // Simulate XML parsing
  await new Promise((resolve) => setTimeout(resolve, 100));

  return Array.from({ length: 100 }, (_, i) => ({
    id: `prod_${i}`,
    availability: Math.random() > 0.1 ? 'in stock' : 'out of stock',
    brand: ['Brand A', 'Brand B', 'Brand C'][Math.floor(Math.random() * 3)],
    description: `Description for product ${i}`,
    google_product_category: '123 > 456 > 789',
    image_link: `https://merchant.com/images/product_${i}.jpg`,
    link: `https://merchant.com/products/${i}`,
    price: `${(Math.random() * 1000 + 10).toFixed(2)} USD`,
    title: `Product ${i}`,
  }));
}

async function parseCSVFeed(data: string, format: string): Promise<any[]> {
  // Simulate CSV parsing
  await new Promise((resolve) => setTimeout(resolve, 50));
  return parseXMLFeed(data, format); // Same structure for demo
}

async function parseJSONFeed(data: string, format: string): Promise<any[]> {
  // Simulate JSON parsing
  await new Promise((resolve) => setTimeout(resolve, 20));
  return parseXMLFeed(data, format); // Same structure for demo
}

// Step 1: Fetch product feed
export const fetchProductFeedStep = compose(
  createStepWithValidation(
    'fetch-feed',
    async (input: z.infer<typeof ProductFeedIngestionInput>) => {
      const { feedSource } = input;

      let feedData = '';
      let feedMetadata = {
        contentType: '',
        encoding: 'utf-8',
        fetchedAt: new Date().toISOString(),
        size: 0,
      };

      // Fetch based on feed type
      switch (feedSource.feedType) {
        case 'api':
          const apiResponse = await fetchFromAPI(feedSource);
          feedData = apiResponse.data;
          feedMetadata = { ...feedMetadata, ...apiResponse.metadata };
          break;

        case 'ftp':
          const ftpResponse = await fetchFromFTP(feedSource);
          feedData = ftpResponse.data;
          feedMetadata = { ...feedMetadata, ...ftpResponse.metadata };
          break;

        default:
          const httpResponse = await fetchFromHTTP(feedSource.feedUrl!);
          feedData = httpResponse.data;
          feedMetadata = { ...feedMetadata, ...httpResponse.metadata };
      }

      return {
        ...input,
        feedData,
        feedMetadata,
        fetchComplete: true,
      };
    },
    (input) => !!input.feedSource.merchantId,
    (output) => output.feedData.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

// Mock fetch functions
async function fetchFromAPI(feedSource: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    data: JSON.stringify(
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Product ${i}`,
      })),
    ),
    metadata: {
      contentType: 'application/json',
      size: 1024 * 100,
    },
  };
}

async function fetchFromFTP(feedSource: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    data: 'CSV data...',
    metadata: {
      contentType: 'text/csv',
      size: 1024 * 500,
    },
  };
}

async function fetchFromHTTP(url: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    data: '<?xml version="1.0"?><products>...</products>',
    metadata: {
      contentType: 'application/xml',
      size: 1024 * 200,
    },
  };
}

// Step 2: Parse feed data
export const parseFeedDataStep = compose(
  createStep('parse-feed', async (data: any) => {
    const { feedData, feedMetadata, feedSource } = data;

    // Parse using appropriate parser
    const parsedProducts = await feedParserFactory.handler({
      input: {
        feedData,
        feedType: feedSource.feedType,
        format: feedSource.format,
      },
    });

    // Apply custom mapping if provided
    let mappedProducts = parsedProducts;
    if (data.ingestionConfig.mapping) {
      mappedProducts = parsedProducts.map((product: any) => {
        const mapped: any = {};
        Object.entries(data.ingestionConfig.mapping).forEach(([target, source]) => {
          mapped[target] = product[source as string];
        });
        return { ...product, ...mapped };
      });
    }

    return {
      ...data,
      parsedProducts: mappedProducts,
      parseStats: {
        format: feedSource.format,
        parseTime: Date.now(),
        total: mappedProducts.length,
      },
    };
  }),
  (step) =>
    withStepMonitoring(step, {
      enableDetailedLogging: true,
      metricsToTrack: ['parseTime'],
    }),
);

// Step 3: Validate products
export const validateProductsStep = createStep('validate-products', async (data: any) => {
  const { ingestionConfig, parsedProducts } = data;
  const { validation } = ingestionConfig;

  const validProducts = [];
  const invalidProducts = [];
  const validationIssues = new Map();

  for (const product of parsedProducts) {
    const issues = [];

    // Check required fields
    for (const field of validation.required) {
      if (!product[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Validate field formats
    if (product.price && typeof product.price === 'string') {
      const priceMatch = product.price.match(/(\d+\.?\d*)\s*(\w+)/);
      if (!priceMatch) {
        issues.push('Invalid price format');
      }
    }

    if (product.link && !isValidUrl(product.link)) {
      issues.push('Invalid product URL');
    }

    if (product.image_link && !isValidUrl(product.image_link)) {
      issues.push('Invalid image URL');
    }

    // Store validation results
    if (issues.length === 0 || (!validation.strict && issues.length < validation.required.length)) {
      validProducts.push({
        ...product,
        _validationScore: 1 - issues.length / validation.required.length,
      });
    } else {
      invalidProducts.push({
        ...product,
        _validationErrors: issues,
      });
    }

    if (issues.length > 0) {
      validationIssues.set(product.id, issues);
    }
  }

  return {
    ...data,
    invalidProducts,
    validationStats: {
      invalid: invalidProducts.length,
      valid: validProducts.length,
      validationRate: validProducts.length / parsedProducts.length,
      commonIssues: getCommonValidationIssues(validationIssues),
      total: parsedProducts.length,
    },
    validProducts,
  };
});

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getCommonValidationIssues(issues: Map<string, string[]>): any[] {
  const issueCounts = new Map();

  issues.forEach((productIssues) => {
    productIssues.forEach((issue) => {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
    });
  });

  return Array.from(issueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ count, issue }));
}

// Step 4: Transform and enrich products
export const transformProductsStep = createStep('transform-products', async (data: any) => {
  const { validProducts, ingestionConfig, qualityConfig } = data;
  const transformedProducts = [];

  for (const product of validProducts) {
    let transformed = { ...product };

    // Apply transformations
    if (ingestionConfig.transformations) {
      for (const transformation of ingestionConfig.transformations) {
        transformed = applyTransformation(transformed, transformation);
      }
    }

    // Auto-correct common issues
    if (qualityConfig.autoCorrect) {
      transformed = autoCorrectProduct(transformed);
    }

    // Enrich product data
    if (qualityConfig.enrichment) {
      transformed = await enrichProduct(transformed);
    }

    transformedProducts.push(transformed);
  }

  return {
    ...data,
    transformationComplete: true,
    transformedProducts,
  };
});

function applyTransformation(product: any, transformation: any): any {
  const { type, field, params } = transformation;

  if (!product[field]) return product;

  switch (type) {
    case 'trim':
      product[field] = product[field].trim();
      break;
    case 'lowercase':
      product[field] = product[field].toLowerCase();
      break;
    case 'uppercase':
      product[field] = product[field].toUpperCase();
      break;
    case 'regex':
      product[field] = product[field].replace(
        new RegExp(params.pattern, params.flags),
        params.replacement,
      );
      break;
  }

  return product;
}

function autoCorrectProduct(product: any): any {
  // Fix common issues
  if (product.title) {
    product.title = product.title
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^(.)/g, (match: string) => match.toUpperCase());
  }

  if (product.brand) {
    product.brand = product.brand.trim();
  }

  return product;
}

async function enrichProduct(product: any): Promise<any> {
  // Simulate enrichment
  await new Promise((resolve) => setTimeout(resolve, 10));

  return {
    ...product,
    _enriched: {
      categoryPath: generateCategoryPath(product.google_product_category),
      estimatedShipping: Math.floor(Math.random() * 7) + 1,
      popularityScore: Math.random(),
    },
  };
}

function generateCategoryPath(googleCategory: string): string[] {
  if (!googleCategory) return ['Uncategorized'];
  return googleCategory.split('>').map((c) => c.trim());
}

// Step 5: Normalize to universal schema
export const normalizeProductsStep = createStep('normalize-products', async (data: any) => {
  const { feedSource, normalizationConfig, transformedProducts } = data;
  const normalizedProducts = [];

  for (const product of transformedProducts) {
    const normalized = await normalizeProduct(product, feedSource, normalizationConfig);
    normalizedProducts.push(normalized);
  }

  return {
    ...data,
    normalizationComplete: true,
    normalizedProducts,
  };
});

async function normalizeProduct(product: any, feedSource: any, config: any): Promise<any> {
  // Parse price
  let priceAmount = 0;
  let currency = 'USD';

  if (product.price) {
    const priceMatch = product.price.match(/(\d+\.?\d*)\s*(\w+)/);
    if (priceMatch) {
      priceAmount = parseFloat(priceMatch[1]);
      currency = priceMatch[2];
    }
  }

  // Normalize availability
  const availability = normalizeAvailability(product.availability);

  // Process images
  const images = [];
  if (product.image_link) {
    images.push({
      type: 'main',
      url: product.image_link,
    });
  }
  if (product.additional_image_link) {
    const additionalImages = Array.isArray(product.additional_image_link)
      ? product.additional_image_link
      : [product.additional_image_link];

    additionalImages.forEach((url: string) => {
      images.push({
        type: 'additional',
        url,
      });
    });
  }

  // Calculate quality score
  const qualityScore = calculateQualityScore(product);

  return {
    id: `${feedSource.merchantId}_${product.id}`,
    attributes: extractAttributes(product),
    availability,
    brand: product.brand,
    category: product._enriched?.categoryPath || [],
    description: product.description || '',
    images,
    inventory: product.inventory_level ? parseInt(product.inventory_level) : undefined,
    merchantId: feedSource.merchantId,
    merchantProductId: product.id,
    metadata: {
      validationIssues: product._validationErrors || [],
      feedSource: feedSource.merchantName,
      lastUpdated: new Date().toISOString(),
      qualityScore,
    },
    mobileUrl: product.mobile_link,
    price: {
      amount: priceAmount,
      currency,
      salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
    },
    productType: product.product_type,
    productUrl: product.link,
    title: product.title || 'Untitled Product',
    variants: extractVariants(product),
  };
}

function normalizeAvailability(availability: string): string {
  const normalized = availability?.toLowerCase() || '';

  if (normalized.includes('in stock') || normalized.includes('available')) {
    return 'in_stock';
  } else if (normalized.includes('out of stock') || normalized.includes('unavailable')) {
    return 'out_of_stock';
  } else if (normalized.includes('preorder') || normalized.includes('pre-order')) {
    return 'preorder';
  } else if (normalized.includes('limited')) {
    return 'limited';
  }

  return 'out_of_stock';
}

function calculateQualityScore(product: any): number {
  let score = 0;
  let factors = 0;

  // Title quality
  if (product.title && product.title.length > 10) {
    score += 0.2;
  }
  factors += 0.2;

  // Description quality
  if (product.description && product.description.length > 50) {
    score += 0.2;
  }
  factors += 0.2;

  // Image presence
  if (product.image_link) {
    score += 0.2;
  }
  factors += 0.2;

  // Brand presence
  if (product.brand) {
    score += 0.1;
  }
  factors += 0.1;

  // Price validity
  if (product.price && !isNaN(parseFloat(product.price))) {
    score += 0.1;
  }
  factors += 0.1;

  // Category presence
  if (product.google_product_category || product.product_type) {
    score += 0.1;
  }
  factors += 0.1;

  // Additional attributes
  const attributeCount = Object.keys(product).filter((k) => !k.startsWith('_')).length;
  if (attributeCount > 10) {
    score += 0.1;
  }
  factors += 0.1;

  return score / factors;
}

function extractAttributes(product: any): Record<string, any> {
  const standardFields = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'brand',
    'availability',
    'google_product_category',
    '_validationScore',
    '_validationErrors',
    '_enriched',
  ];

  const attributes: Record<string, any> = {};

  Object.entries(product).forEach(([key, value]) => {
    if (!standardFields.includes(key) && !key.startsWith('_')) {
      attributes[key] = value;
    }
  });

  return attributes;
}

function extractVariants(product: any): any[] {
  // Check for variant attributes
  const variants = [];

  if (product.item_group_id) {
    // This product is part of a variant group
    const variant = {
      id: product.id,
      attributes: {
        color: product.color,
        material: product.material,
        pattern: product.pattern,
        size: product.size,
      },
      availability: product.availability,
      price: product.price ? parseFloat(product.price) : undefined,
    };

    // Remove undefined attributes
    Object.keys(variant.attributes).forEach((key) => {
      if (!variant.attributes[key as any]) {
        delete variant.attributes[key as any];
      }
    });

    if (Object.keys(variant.attributes).length > 0) {
      variants.push(variant);
    }
  }

  return variants;
}

// Step 6: Deduplicate products
export const deduplicateProductsStep = createStep('deduplicate-products', async (data: any) => {
  const { normalizationConfig, normalizedProducts } = data;

  if (!normalizationConfig.deduplication) {
    return {
      ...data,
      deduplicationSkipped: true,
      uniqueProducts: normalizedProducts,
    };
  }

  const uniqueProducts: any[] = [];
  const duplicates = [];
  const productMap = new Map();

  for (const product of normalizedProducts) {
    // Generate deduplication key
    const dedupKey = generateDeduplicationKey(product);

    if (productMap.has(dedupKey)) {
      const existing = productMap.get(dedupKey);
      // Keep the one with higher quality score
      if (product.metadata.qualityScore > existing.metadata.qualityScore) {
        duplicates.push(existing);
        productMap.set(dedupKey, product);
      } else {
        duplicates.push(product);
      }
    } else {
      productMap.set(dedupKey, product);
    }
  }

  // Convert map to array
  productMap.forEach((product) => uniqueProducts.push(product));

  return {
    ...data,
    deduplicationStats: {
      deduplicationRate: duplicates.length / normalizedProducts.length,
      duplicates: duplicates.length,
      original: normalizedProducts.length,
      unique: uniqueProducts.length,
    },
    duplicates,
    uniqueProducts,
  };
});

function generateDeduplicationKey(product: any): string {
  // Use combination of brand, title, and key attributes
  const keyParts = [
    product.brand?.toLowerCase() || '',
    product.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
  ];

  // Add key attributes if present
  if (product.attributes.mpn) {
    keyParts.push(product.attributes.mpn);
  }
  if (product.attributes.gtin) {
    keyParts.push(product.attributes.gtin);
  }

  return keyParts.join('_');
}

// Step 7: Map categories
export const mapCategoriesStep = createStep('map-categories', async (data: any) => {
  const { normalizationConfig, uniqueProducts } = data;

  if (!normalizationConfig.categoryMapping) {
    return {
      ...data,
      categorizedProducts: uniqueProducts,
      categoryMappingSkipped: true,
    };
  }

  const categorizedProducts = [];
  const categoryStats = new Map();

  for (const product of uniqueProducts) {
    const mappedProduct = {
      ...product,
      category: await mapProductCategory(product),
    };

    categorizedProducts.push(mappedProduct);

    // Track category statistics
    const categoryPath = mappedProduct.category.join(' > ');
    categoryStats.set(categoryPath, (categoryStats.get(categoryPath) || 0) + 1);
  }

  return {
    ...data,
    categorizedProducts,
    categoryMappingComplete: true,
    categoryStats: Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([category, count]) => ({ category, count })),
  };
});

async function mapProductCategory(product: any): Promise<string[]> {
  // Simulate category mapping
  await new Promise((resolve) => setTimeout(resolve, 5));

  // Use existing category if available
  if (product.category && product.category.length > 0) {
    return product.category;
  }

  // Map based on product type or title
  const title = product.title.toLowerCase();

  if (title.includes('laptop') || title.includes('computer')) {
    return ['Electronics', 'Computers', 'Laptops'];
  } else if (title.includes('phone') || title.includes('mobile')) {
    return ['Electronics', 'Mobile Phones'];
  } else if (title.includes('shirt') || title.includes('dress')) {
    return ['Clothing', 'Apparel'];
  } else if (title.includes('shoe') || title.includes('sneaker')) {
    return ['Clothing', 'Footwear'];
  }

  return ['Other'];
}

// Step 8: Process images
export const processProductImagesStep = createStep('process-images', async (data: any) => {
  const { categorizedProducts, normalizationConfig } = data;

  if (!normalizationConfig.imageOptimization) {
    return {
      ...data,
      imageProcessingSkipped: true,
      processedProducts: categorizedProducts,
    };
  }

  const processedProducts = [];
  let totalImages = 0;
  let optimizedImages = 0;

  for (const product of categorizedProducts) {
    const processedImages = [];

    for (const image of product.images) {
      totalImages++;
      const processed = await processImage(image);
      if (processed.optimized) {
        optimizedImages++;
      }
      processedImages.push(processed);
    }

    processedProducts.push({
      ...product,
      images: processedImages,
    });
  }

  return {
    ...data,
    imageProcessingStats: {
      optimizationRate: totalImages > 0 ? optimizedImages / totalImages : 0,
      optimized: optimizedImages,
      total: totalImages,
    },
    processedProducts,
  };
});

async function processImage(image: any): Promise<any> {
  // Simulate image processing
  await new Promise((resolve) => setTimeout(resolve, 20));

  // Check if image needs optimization
  const needsOptimization = Math.random() > 0.3;

  return {
    ...image,
    cdnUrl: needsOptimization
      ? `https://cdn.example.com/optimized/${image.url.split('/').pop()}`
      : image.url,
    dimensions: {
      width: 800 + Math.floor(Math.random() * 1200),
      height: 600 + Math.floor(Math.random() * 900),
    },
    optimized: needsOptimization,
  };
}

// Step 9: Store in database
export const storeNormalizedProductsStep = compose(
  createStep('store-products', async (data: any) => {
    const { feedSource, processedProducts } = data;

    // Batch insert products
    const batchSize = 100;
    const storedProducts = [];
    const errors = [];

    for (let i = 0; i < processedProducts.length; i += batchSize) {
      const batch = processedProducts.slice(i, i + batchSize);

      try {
        const stored = await storeProductBatch(batch, feedSource);
        storedProducts.push(...stored);
      } catch (error) {
        errors.push({
          batch: i / batchSize,
          error: (error as Error).message,
          products: batch.map((p: any) => p.id),
        });
      }
    }

    return {
      ...data,
      storageErrors: errors,
      storageStats: {
        failed: errors.length * batchSize,
        stored: storedProducts.length,
        successRate: storedProducts.length / processedProducts.length,
        total: processedProducts.length,
      },
      storedProducts,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 5,
      maxQueued: 20,
    }),
);

async function storeProductBatch(products: any[], feedSource: any): Promise<any[]> {
  // Simulate database storage
  await new Promise((resolve) => setTimeout(resolve, 200));

  return products.map((product) => ({
    ...product,
    _stored: {
      timestamp: new Date().toISOString(),
      version: 1,
    },
  }));
}

// Step 10: Generate ingestion report
export const generateIngestionReportStep = createStep('generate-report', async (data: any) => {
  const {
    validationStats,
    categoryStats,
    deduplicationStats,
    feedSource,
    imageProcessingStats,
    parseStats,
    storageStats,
  } = data;

  const report = {
    issues: {
      validation: validationStats.commonIssues || [],
      storage: data.storageErrors || [],
    },
    merchant: {
      id: feedSource.merchantId,
      name: feedSource.merchantName,
      feedType: feedSource.feedType,
      format: feedSource.format,
    },
    recommendations: generateIngestionRecommendations(data),
    reportId: `ingestion_${feedSource.merchantId}_${Date.now()}`,
    stages: {
      validation: validationStats,
      categoryMapping: {
        complete: data.categoryMappingComplete || false,
        topCategories: categoryStats?.slice(0, 5) || [],
      },
      deduplication: deduplicationStats || { skipped: true },
      imageProcessing: imageProcessingStats || { skipped: true },
      parsing: {
        duration: Date.now() - parseStats.parseTime,
        total: parseStats.total,
      },
      storage: storageStats,
    },
    summary: {
      validProducts: validationStats.valid,
      qualityScore: calculateOverallQuality(data),
      storedProducts: storageStats.stored,
      successRate: storageStats.successRate,
      totalProducts: parseStats.total,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    ingestionComplete: true,
    report,
  };
});

function calculateOverallQuality(data: any): number {
  const factors = [
    data.validationStats.validationRate,
    1 - (data.deduplicationStats?.deduplicationRate || 0),
    data.imageProcessingStats?.optimizationRate || 1,
    data.storageStats.successRate,
  ];

  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
}

function generateIngestionRecommendations(data: any): any[] {
  const recommendations = [];

  // Low validation rate
  if (data.validationStats.validationRate < 0.8) {
    recommendations.push({
      type: 'low_validation_rate',
      action: 'review_feed_format',
      message: `Only ${(data.validationStats.validationRate * 100).toFixed(1)}% of products passed validation`,
      priority: 'high',
    });
  }

  // High duplication
  if (data.deduplicationStats?.deduplicationRate > 0.2) {
    recommendations.push({
      type: 'high_duplication',
      action: 'check_feed_configuration',
      message: `${(data.deduplicationStats.deduplicationRate * 100).toFixed(1)}% duplicate products detected`,
      priority: 'medium',
    });
  }

  // Missing categories
  const uncategorized = data.categoryStats?.find((c: any) => c.category === 'Other');
  if (uncategorized && uncategorized.count > data.parseStats.total * 0.2) {
    recommendations.push({
      type: 'poor_categorization',
      action: 'improve_category_mapping',
      message: 'Many products lack proper categorization',
      priority: 'medium',
    });
  }

  return recommendations;
}

// Main workflow definition
export const productFeedIngestionWorkflow = {
  id: 'product-feed-ingestion',
  name: 'Product Feed Ingestion & Normalization',
  config: {
    concurrency: {
      max: 10, // Multiple merchant feeds
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 */6 * * *', // Every 6 hours
      timezone: 'UTC',
    },
  },
  description: 'Ingest and normalize product feeds from multiple merchants',
  features: {
    categoryMapping: true,
    deduplication: true,
    incrementalUpdates: true,
    multiFormat: true,
    qualityControl: true,
  },
  steps: [
    fetchProductFeedStep,
    parseFeedDataStep,
    validateProductsStep,
    transformProductsStep,
    normalizeProductsStep,
    deduplicateProductsStep,
    mapCategoriesStep,
    processProductImagesStep,
    storeNormalizedProductsStep,
    generateIngestionReportStep,
  ],
  version: '1.0.0',
};
