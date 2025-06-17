/**
 * Product Matching & Deduplication Workflow
 * Identify the same product across different merchants using ML and fuzzy matching
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

// Type definitions for workflow context
interface StepContext {
  input: any;
  metadata?: any;
}

// Input schemas
const ProductMatchingInput = z.object({
  deduplicationConfig: z.object({
    createCanonical: z.boolean().default(true),
    qualityFactors: z
      .array(
        z.enum([
          'completeness',
          'image-quality',
          'description-length',
          'merchant-rating',
          'price-competitiveness',
        ]),
      )
      .default(['completeness', 'merchant-rating']),
    strategy: z.enum(['keep-best', 'keep-first', 'keep-cheapest', 'merge']).default('keep-best'),
  }),
  matchingConfig: z.object({
    algorithms: z
      .array(
        z.enum([
          'exact-identifier',
          'fuzzy-title',
          'ml-similarity',
          'image-matching',
          'attribute-matching',
          'hybrid',
        ]),
      )
      .default(['hybrid']),
    thresholds: z.object({
      highConfidence: z.number().default(0.9),
      lowConfidence: z.number().default(0.5),
      mediumConfidence: z.number().default(0.7),
      exactMatch: z.number().default(1.0),
    }),
    weights: z.object({
      identifiers: z.number().default(0.3),
      attributes: z.number().default(0.1),
      brand: z.number().default(0.2),
      images: z.number().default(0.1),
      title: z.number().default(0.3),
    }),
  }),
  mlConfig: z.object({
    batchSize: z.number().default(100),
    embeddingDimensions: z.number().default(384),
    model: z.enum(['bert', 'sentence-transformers', 'custom']).default('sentence-transformers'),
    useML: z.boolean().default(true),
  }),
  mode: z.enum(['batch', 'realtime', 'incremental', 'full-rescan']).default('incremental'),
  products: z
    .array(
      z.object({
        id: z.string(),
        identifiers: z
          .object({
            ean: z.string().optional(),
            gtin: z.string().optional(),
            isbn: z.string().optional(),
            mpn: z.string().optional(),
            sku: z.string().optional(),
            upc: z.string().optional(),
          })
          .optional(),
        attributes: z.record(z.any()),
        brand: z.string().optional(),
        category: z.array(z.string()),
        description: z.string().optional(),
        images: z.array(z.string()),
        merchantId: z.string(),
        price: z.number(),
        title: z.string(),
      }),
    )
    .optional(),
});

// Match result schema
const ProductMatch = z.object({
  confidence: z.number(),
  canonicalProduct: z
    .object({
      id: z.string(),
      identifiers: z.record(z.string()),
      attributes: z.record(z.any()),
      brand: z.string(),
      category: z.array(z.string()),
      images: z.array(z.string()),
      merchants: z.array(
        z.object({
          availability: z.string(),
          merchantId: z.string(),
          price: z.number(),
          productId: z.string(),
        }),
      ),
      title: z.string(),
    })
    .optional(),
  matchId: z.string(),
  matchType: z.enum(['exact', 'high', 'medium', 'low']),
  products: z.array(
    z.object({
      matchedFields: z.array(z.string()),
      merchantId: z.string(),
      productId: z.string(),
      score: z.number(),
    }),
  ),
});

// Step factory for ML matching
const mlMatchingFactory = createWorkflowStep(
  {
    name: 'ML Product Matcher',
    category: 'ml',
    tags: ['matching', 'embeddings', 'similarity'],
    version: '1.0.0',
  },
  async (context: StepContext) => {
    const { batchSize, model, products } = context.input;

    // Generate embeddings for products
    const embeddings = await generateProductEmbeddings(products, model);

    // Find similar products using embeddings
    const matches = await findSimilarProducts(embeddings, batchSize);

    return matches;
  },
);

// Mock ML functions
async function generateProductEmbeddings(products: any[], model: string): Promise<any[]> {
  // Simulate embedding generation
  await new Promise((resolve) => setTimeout(resolve, products.length * 10));

  return products.map((product) => ({
    embedding: generateMockEmbedding(product, 384),
    metadata: {
      brand: product.brand,
      merchantId: product.merchantId,
      title: product.title,
    },
    productId: product.id,
  }));
}

function generateMockEmbedding(product: any, dimensions: number): number[] {
  // Generate consistent mock embeddings based on product data
  const seed = product.title + (product.brand || '') + (product.identifiers?.upc || '');
  const hash = seed.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  const embedding = [];
  for (let i = 0; i < dimensions; i++) {
    embedding.push(Math.sin(hash + i) * Math.cos(hash - i));
  }

  return embedding;
}

async function findSimilarProducts(embeddings: any[], batchSize: number): Promise<any[]> {
  const matches = [];

  // Compare all embeddings pairwise
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const similarity = calculateCosineSimilarity(
        embeddings[i].embedding,
        embeddings[j].embedding,
      );

      if (similarity > 0.7) {
        matches.push({
          product1: embeddings[i],
          product2: embeddings[j],
          similarity,
        });
      }
    }
  }

  return matches;
}

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

// Step 1: Collect products for matching
const productMatchingWorkflow = compose(
  createStep('product-data-collection', async (input: z.infer<typeof ProductMatchingInput>) => {
    // Product data collection logic
    const products = await fetchAllProducts();
    return {
      products,
      totalProducts: products.length,
    };
  }),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepMonitoring(step),
);

// Mock data fetching
async function fetchAllProducts(): Promise<any[]> {
  return Array.from({ length: 1000 }, (_, i) => generateMockProduct(i));
}

async function fetchRecentProducts(): Promise<any[]> {
  return Array.from({ length: 100 }, (_, i) => generateMockProduct(i));
}

async function fetchBatchProducts(): Promise<any[]> {
  return Array.from({ length: 50 }, (_, i) => generateMockProduct(i));
}

function generateMockProduct(index: number): any {
  const brands = ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony'];
  const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'];

  // Create some intentional duplicates
  const baseIndex = index % 20; // This creates groups of similar products

  return {
    id: `prod_${index}`,
    identifiers: {
      gtin: index % 3 === 0 ? `GTIN-${baseIndex}` : undefined,
      sku: `SKU-${index}`,
      upc: index % 5 === 0 ? `UPC-${baseIndex}` : undefined, // Some products share UPC
    },
    attributes: {
      color: ['Red', 'Blue', 'Green'][index % 3],
      size: ['S', 'M', 'L', 'XL'][index % 4],
    },
    brand: brands[baseIndex % brands.length],
    category: [categories[baseIndex % categories.length]],
    description: `Description for product ${baseIndex}`,
    images: [`https://example.com/img/${baseIndex}.jpg`],
    merchantId: `merchant_${index % 10}`,
    price: 50 + (index % 100),
    title: `Product ${baseIndex} - ${brands[baseIndex % brands.length]}`,
  };
}

// Step 2: Apply exact matching rules
export const applyExactMatchingStep = createStep('exact-matching', async (data: any) => {
  const { matchingConfig, productsByCategory } = data;
  const exactMatches: any[] = [];

  if (
    !matchingConfig.algorithms.includes('exact-identifier') &&
    !matchingConfig.algorithms.includes('hybrid')
  ) {
    return {
      ...data,
      exactMatches: [],
      exactMatchingSkipped: true,
    };
  }

  // Process each category separately
  for (const categoryGroup of productsByCategory) {
    const { products } = categoryGroup;
    const identifierMap = new Map();

    // Build maps for each identifier type
    products.forEach((product: any) => {
      const identifiers = product.identifiers || {};

      // Check each identifier type
      Object.entries(identifiers).forEach(([type, value]) => {
        if (value) {
          const key = `${type}:${value}`;
          if (!identifierMap.has(key)) {
            identifierMap.set(key, []);
          }
          identifierMap.get(key).push(product);
        }
      });
    });

    // Find products with matching identifiers
    identifierMap.forEach((matchingProducts, identifierKey) => {
      if (matchingProducts.length > 1) {
        exactMatches.push({
          confidence: 1.0,
          identifier: identifierKey,
          matchId: `exact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          matchMethod: 'identifier',
          matchType: 'exact',
          products: matchingProducts.map((p: any) => ({
            matchedFields: [identifierKey.split(':')[0]],
            merchantId: p.merchantId,
            productId: p.id,
            score: 1.0,
          })),
        });
      }
    });
  }

  return {
    ...data,
    exactMatchCount: exactMatches.length,
    exactMatches,
    exactMatchingComplete: true,
  };
});

// Step 3: Apply fuzzy matching
export const applyFuzzyMatchingStep = createStep('fuzzy-matching', async (data: any) => {
  const { exactMatches, matchingConfig, productsByCategory } = data;
  const fuzzyMatches = [];

  if (
    !matchingConfig.algorithms.includes('fuzzy-title') &&
    !matchingConfig.algorithms.includes('hybrid')
  ) {
    return {
      ...data,
      fuzzyMatches: [],
      fuzzyMatchingSkipped: true,
    };
  }

  // Get products already matched exactly
  const exactMatchedIds = new Set();
  exactMatches.forEach((match: any) => {
    match.products.forEach((p: any) => exactMatchedIds.add(p.productId));
  });

  // Process each category
  for (const categoryGroup of productsByCategory) {
    const { products } = categoryGroup;

    // Filter out already matched products
    const unmatchedProducts = products.filter((p: any) => !exactMatchedIds.has(p.id));

    // Compare products pairwise
    for (let i = 0; i < unmatchedProducts.length; i++) {
      for (let j = i + 1; j < unmatchedProducts.length; j++) {
        const similarity = calculateProductSimilarity(
          unmatchedProducts[i],
          unmatchedProducts[j],
          matchingConfig.weights,
        );

        if (similarity >= matchingConfig.thresholds.lowConfidence) {
          const matchType =
            similarity >= matchingConfig.thresholds.highConfidence
              ? 'high'
              : similarity >= matchingConfig.thresholds.mediumConfidence
                ? 'medium'
                : 'low';

          fuzzyMatches.push({
            confidence: similarity,
            matchId: `fuzzy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            matchMethod: 'fuzzy',
            matchType,
            products: [
              {
                matchedFields: getMatchedFields(unmatchedProducts[i], unmatchedProducts[j]),
                merchantId: unmatchedProducts[i].merchantId,
                productId: unmatchedProducts[i].id,
                score: similarity,
              },
              {
                matchedFields: getMatchedFields(unmatchedProducts[i], unmatchedProducts[j]),
                merchantId: unmatchedProducts[j].merchantId,
                productId: unmatchedProducts[j].id,
                score: similarity,
              },
            ],
          });
        }
      }
    }
  }

  return {
    ...data,
    fuzzyMatchCount: fuzzyMatches.length,
    fuzzyMatches,
    fuzzyMatchingComplete: true,
  };
});

function calculateProductSimilarity(product1: any, product2: any, weights: any): number {
  let totalScore = 0;
  let totalWeight = 0;

  // Title similarity
  if (weights.title > 0) {
    const titleSim = calculateStringSimilarity(product1.title, product2.title);
    totalScore += titleSim * weights.title;
    totalWeight += weights.title;
  }

  // Brand similarity
  if (weights.brand > 0 && product1.brand && product2.brand) {
    const brandSim = product1.brand.toLowerCase() === product2.brand.toLowerCase() ? 1 : 0;
    totalScore += brandSim * weights.brand;
    totalWeight += weights.brand;
  }

  // Attribute similarity
  if (weights.attributes > 0) {
    const attrSim = calculateAttributeSimilarity(product1.attributes, product2.attributes);
    totalScore += attrSim * weights.attributes;
    totalWeight += weights.attributes;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple Jaccard similarity on word tokens
  const tokens1 = new Set(str1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

function calculateAttributeSimilarity(attrs1: any, attrs2: any): number {
  const keys1 = Object.keys(attrs1);
  const keys2 = Object.keys(attrs2);
  const allKeys = new Set([...keys1, ...keys2]);

  let matches = 0;
  allKeys.forEach((key) => {
    if (attrs1[key] && attrs2[key] && attrs1[key] === attrs2[key]) {
      matches++;
    }
  });

  return allKeys.size > 0 ? matches / allKeys.size : 0;
}

function getMatchedFields(product1: any, product2: any): string[] {
  const matchedFields = [];

  if (
    product1.title &&
    product2.title &&
    calculateStringSimilarity(product1.title, product2.title) > 0.5
  ) {
    matchedFields.push('title');
  }

  if (
    product1.brand &&
    product2.brand &&
    product1.brand.toLowerCase() === product2.brand.toLowerCase()
  ) {
    matchedFields.push('brand');
  }

  if (product1.category[0] === product2.category[0]) {
    matchedFields.push('category');
  }

  return matchedFields;
}

// Step 4: Apply ML-based matching
export const applyMLMatchingStep = compose(
  createStep('ml-matching', async (data: any) => {
    const { exactMatches, fuzzyMatches, matchingConfig, mlConfig, productsByCategory } = data;

    if (
      !mlConfig.useML ||
      (!matchingConfig.algorithms.includes('ml-similarity') &&
        !matchingConfig.algorithms.includes('hybrid'))
    ) {
      return {
        ...data,
        mlMatches: [],
        mlMatchingSkipped: true,
      };
    }

    // Get products not yet matched with high confidence
    const highConfidenceIds = new Set();
    [...exactMatches, ...fuzzyMatches].forEach((match: any) => {
      if (match.confidence >= matchingConfig.thresholds.highConfidence) {
        match.products.forEach((p: any) => highConfidenceIds.add(p.productId));
      }
    });

    const mlMatches: any[] = [];

    // Process each category with ML
    for (const categoryGroup of productsByCategory) {
      const { products } = categoryGroup;

      // Filter products for ML matching
      const productsForML = products.filter((p: any) => !highConfidenceIds.has(p.id));

      if (productsForML.length < 2) continue;

      // Use ML matching factory
      const mlResults = await mlMatchingFactory.handler({
        input: {
          batchSize: mlConfig.batchSize,
          model: mlConfig.model,
          products: productsForML,
        },
      });

      // Convert ML results to match format
      mlResults.forEach((result: any) => {
        const confidence = result.similarity;
        const matchType =
          confidence >= matchingConfig.thresholds.highConfidence
            ? 'high'
            : confidence >= matchingConfig.thresholds.mediumConfidence
              ? 'medium'
              : 'low';

        mlMatches.push({
          confidence,
          embeddingSimilarity: result.similarity,
          matchId: `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          matchMethod: 'ml',
          matchType,
          products: [
            {
              matchedFields: ['ml_embedding'],
              merchantId: result.product1.metadata.merchantId,
              productId: result.product1.productId,
              score: confidence,
            },
            {
              matchedFields: ['ml_embedding'],
              merchantId: result.product2.metadata.merchantId,
              productId: result.product2.productId,
              score: confidence,
            },
          ],
        });
      });
    }

    return {
      ...data,
      mlMatchCount: mlMatches.length,
      mlMatches,
      mlMatchingComplete: true,
    };
  }),
  (step: any) => withStepTimeout(step, 300000), // 5 minutes for ML
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 5,
      resetTimeout: 60000,
    }),
);

// Step 5: Apply image-based matching
export const applyImageMatchingStep = createStep('image-matching', async (data: any) => {
  const { matchingConfig, productsByCategory } = data;

  if (
    !matchingConfig.algorithms.includes('image-matching') &&
    !matchingConfig.algorithms.includes('hybrid')
  ) {
    return {
      ...data,
      imageMatches: [],
      imageMatchingSkipped: true,
    };
  }

  const imageMatches = [];

  // Process products with images
  for (const categoryGroup of productsByCategory) {
    const { products } = categoryGroup;

    const productsWithImages = products.filter((p: any) => p.images && p.images.length > 0);

    // Compare image hashes
    for (let i = 0; i < productsWithImages.length; i++) {
      for (let j = i + 1; j < productsWithImages.length; j++) {
        const imageSimilarity = await compareProductImages(
          productsWithImages[i].images,
          productsWithImages[j].images,
        );

        if (imageSimilarity >= matchingConfig.thresholds.mediumConfidence) {
          imageMatches.push({
            confidence: imageSimilarity,
            matchId: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            matchMethod: 'image',
            matchType:
              imageSimilarity >= matchingConfig.thresholds.highConfidence ? 'high' : 'medium',
            products: [
              {
                matchedFields: ['images'],
                merchantId: productsWithImages[i].merchantId,
                productId: productsWithImages[i].id,
                score: imageSimilarity,
              },
              {
                matchedFields: ['images'],
                merchantId: productsWithImages[j].merchantId,
                productId: productsWithImages[j].id,
                score: imageSimilarity,
              },
            ],
          });
        }
      }
    }
  }

  return {
    ...data,
    imageMatchCount: imageMatches.length,
    imageMatches,
    imageMatchingComplete: true,
  };
});

async function compareProductImages(images1: string[], images2: string[]): Promise<number> {
  // Simulate image comparison using perceptual hashing
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Check if images share the same URL (simple case)
  const sharedImages = images1.filter((img1) => images2.includes(img1));
  if (sharedImages.length > 0) {
    return 1.0;
  }

  // Simulate perceptual hash comparison
  return Math.random() * 0.3 + 0.5; // Random similarity between 0.5 and 0.8
}

// Step 6: Consolidate matches
export const consolidateMatchesStep = createStep('consolidate-matches', async (data: any) => {
  const { exactMatches, fuzzyMatches, imageMatches, mlMatches } = data;

  // Combine all matches
  const allMatches = [
    ...(exactMatches || []),
    ...(fuzzyMatches || []),
    ...(mlMatches || []),
    ...(imageMatches || []),
  ];

  // Build a graph of connected products
  const productGraph = new Map();

  allMatches.forEach((match) => {
    match.products.forEach((product: any) => {
      if (!productGraph.has(product.productId)) {
        productGraph.set(product.productId, new Set());
      }

      // Add connections to other products in the match
      match.products.forEach((otherProduct: any) => {
        if (product.productId !== otherProduct.productId) {
          productGraph.get(product.productId).add({
            confidence: match.confidence,
            method: match.matchMethod,
            productId: otherProduct.productId,
          });
        }
      });
    });
  });

  // Find connected components (clusters of matching products)
  const visited = new Set<string>();
  const productClusters: any[] = [];

  productGraph.forEach((connections, productId) => {
    if (!visited.has(productId)) {
      const cluster = exploreCluster(productId, productGraph, visited);
      if (cluster.size > 1) {
        productClusters.push({
          clusterId: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          products: Array.from(cluster),
          size: cluster.size,
        });
      }
    }
  });

  return {
    ...data,
    consolidatedMatches: productClusters,
    consolidationComplete: true,
    totalClusters: productClusters.length,
    totalMatchedProducts: productClusters.reduce((sum, cluster) => sum + cluster.size, 0),
  };
});

function exploreCluster(
  startProduct: string,
  graph: Map<string, Set<string>>,
  visited: Set<string>,
): Set<string> {
  const cluster = new Set<string>();
  const stack = [startProduct];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;

    visited.add(current);
    cluster.add(current);

    const neighbors = graph.get(current) || new Set<string>();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return cluster;
}

// Step 7: Create canonical products
export const createCanonicalProductsStep = createStep('create-canonical', async (data: any) => {
  const { consolidatedMatches, deduplicationConfig, productsToMatch } = data;

  if (!deduplicationConfig.createCanonical) {
    return {
      ...data,
      canonicalCreationSkipped: true,
      canonicalProducts: [],
    };
  }

  const canonicalProducts = [];
  const productMap = new Map(productsToMatch.map((p: any) => [p.id, p]));

  for (const cluster of consolidatedMatches) {
    // Get all products in the cluster
    const clusterProducts = cluster.products
      .map((pid: string) => productMap.get(pid))
      .filter(Boolean);

    // Select the best product as base for canonical
    const baseProduct = selectBestProduct(clusterProducts, deduplicationConfig);

    // Create canonical product
    const canonical = {
      id: `canonical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      identifiers: mergeIdentifiers(clusterProducts),
      attributes: mergeAttributes(clusterProducts),
      brand: baseProduct.brand || extractCommonBrand(clusterProducts),
      category: baseProduct.category,
      description: selectBestDescription(clusterProducts),
      images: mergeImages(clusterProducts),
      merchants: clusterProducts.map((p: any) => ({
        availability: p.availability || 'in_stock',
        merchantId: p.merchantId,
        price: p.price,
        productId: p.id,
      })),
      metadata: {
        clusterSize: cluster.size,
        createdAt: new Date().toISOString(),
        qualityScore: calculateCanonicalQuality(clusterProducts),
        sourceProducts: cluster.products,
      },
      title: baseProduct.title,
    };

    canonicalProducts.push(canonical);
  }

  return {
    ...data,
    canonicalCount: canonicalProducts.length,
    canonicalCreationComplete: true,
    canonicalProducts,
  };
});

function selectBestProduct(products: any[], config: any): any {
  // Score each product based on quality factors
  const scoredProducts = products.map((product) => {
    let score = 0;

    if (config.qualityFactors.includes('completeness')) {
      score += calculateCompleteness(product) * 0.3;
    }

    if (config.qualityFactors.includes('description-length')) {
      score += (Math.min(product.description?.length || 0, 1000) / 1000) * 0.2;
    }

    if (config.qualityFactors.includes('merchant-rating')) {
      score += 0.5; // Mock merchant rating
    }

    return { product, score };
  });

  // Sort by score and return the best
  scoredProducts.sort((a: any, b: any) => b.score - a.score);
  return scoredProducts[0].product;
}

function calculateCompleteness(product: any): number {
  const fields = ['title', 'description', 'brand', 'images', 'identifiers'];
  const filledFields = fields.filter((field) => {
    const value = product[field];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });

  return filledFields.length / fields.length;
}

function extractCommonBrand(products: any[]): string | undefined {
  const brands = products.map((p) => p.brand).filter(Boolean);
  if (brands.length === 0) return undefined;

  // Find most common brand
  const brandCounts = new Map();
  brands.forEach((brand) => {
    brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
  });

  const sortedBrands = Array.from(brandCounts.entries()).sort((a: any, b: any) => b[1] - a[1]);
  return sortedBrands[0][0];
}

function selectBestDescription(products: any[]): string {
  const descriptions = products
    .map((p) => p.description)
    .filter(Boolean)
    .sort((a: any, b: any) => b.length - a.length);

  return descriptions[0] || '';
}

function mergeIdentifiers(products: any[]): Record<string, string> {
  const merged: Record<string, string> = {};

  products.forEach((product) => {
    if (product.identifiers) {
      Object.entries(product.identifiers).forEach(([key, value]) => {
        if (value && !merged[key]) {
          merged[key] = value as string;
        }
      });
    }
  });

  return merged;
}

function mergeAttributes(products: any[]): Record<string, any> {
  const merged: Record<string, any> = {};
  const attributeCounts: Record<string, Map<any, number>> = {};

  // Count occurrences of each attribute value
  products.forEach((product) => {
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, value]) => {
        if (!attributeCounts[key]) {
          attributeCounts[key] = new Map();
        }
        attributeCounts[key].set(value, (attributeCounts[key].get(value) || 0) + 1);
      });
    }
  });

  // Select most common value for each attribute
  Object.entries(attributeCounts).forEach(([key, valueCounts]) => {
    const sortedValues = Array.from(valueCounts.entries()).sort((a: any, b: any) => b[1] - a[1]);
    merged[key] = sortedValues[0][0];
  });

  return merged;
}

function mergeImages(products: any[]): string[] {
  const imageSet = new Set<string>();
  const images: string[] = [];

  products.forEach((product) => {
    if (product.images) {
      product.images.forEach((img: string) => {
        if (!imageSet.has(img)) {
          imageSet.add(img);
          images.push(img);
        }
      });
    }
  });

  return images;
}

function calculateCanonicalQuality(products: any[]): number {
  // Calculate quality based on various factors
  const hasIdentifiers = products.some(
    (p) => p.identifiers && Object.keys(p.identifiers).length > 0,
  );
  const avgDescriptionLength =
    products.reduce((sum, p) => sum + (p.description?.length || 0), 0) / products.length;
  const hasImages = products.some((p) => p.images && p.images.length > 0);
  const merchantCount = new Set(products.map((p) => p.merchantId)).size;

  let score = 0;
  if (hasIdentifiers) score += 0.3;
  if (avgDescriptionLength > 100) score += 0.2;
  if (hasImages) score += 0.2;
  if (merchantCount > 1) score += 0.3;

  return Math.min(score, 1.0);
}

// Step 8: Handle variants
export const handleProductVariantsStep = createStep('handle-variants', async (data: any) => {
  const { canonicalProducts } = data;

  // Group canonical products that might be variants of each other
  const variantGroups = [];
  const processed = new Set();

  for (let i = 0; i < canonicalProducts.length; i++) {
    if (processed.has(i)) continue;

    const baseProduct = canonicalProducts[i];
    const variants = [baseProduct];

    for (let j = i + 1; j < canonicalProducts.length; j++) {
      if (processed.has(j)) continue;

      if (areProductVariants(baseProduct, canonicalProducts[j])) {
        variants.push(canonicalProducts[j]);
        processed.add(j);
      }
    }

    if (variants.length > 1) {
      variantGroups.push({
        baseProduct: baseProduct.id,
        groupId: `variant_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        variants: variants.map((v) => ({
          canonicalId: v.id,
          variantAttributes: extractVariantAttributes(baseProduct, v),
        })),
      });
    }
  }

  return {
    ...data,
    variantGroupCount: variantGroups.length,
    variantGroups,
    variantHandlingComplete: true,
  };
});

function areProductVariants(product1: any, product2: any): boolean {
  // Check if products are variants (same brand and similar title)
  if (product1.brand !== product2.brand) return false;

  const title1 = product1.title.toLowerCase();
  const title2 = product2.title.toLowerCase();

  // Remove common variant indicators
  const baseTitle1 = title1
    .replace(/\b(small|medium|large|xl|xxl|red|blue|green|black|white|\d+gb|\d+ml)\b/g, '')
    .trim();
  const baseTitle2 = title2
    .replace(/\b(small|medium|large|xl|xxl|red|blue|green|black|white|\d+gb|\d+ml)\b/g, '')
    .trim();

  // Check similarity of base titles
  const similarity = calculateStringSimilarity(baseTitle1, baseTitle2);

  return similarity > 0.8;
}

function extractVariantAttributes(baseProduct: any, variantProduct: any): Record<string, any> {
  const variantAttrs: Record<string, any> = {};

  // Find differing attributes
  Object.keys(variantProduct.attributes).forEach((key) => {
    if (variantProduct.attributes[key] !== baseProduct.attributes[key]) {
      variantAttrs[key] = variantProduct.attributes[key];
    }
  });

  return variantAttrs;
}

// Step 9: Store matching results
export const storeMatchingResultsStep = compose(
  StepTemplates.database('store-matches', 'Store product matches and canonical products'),
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 5,
      resetTimeout: 60000,
    }),
);

// Step 10: Generate matching report
export const generateMatchingReportStep = createStep('generate-report', async (data: any) => {
  const {
    canonicalCount,
    exactMatchCount,
    fuzzyMatchCount,
    imageMatchCount,
    mlMatchCount,
    totalClusters,
    totalProducts,
    variantGroupCount,
  } = data;

  const report = {
    clusters: {
      averageSize:
        data.consolidatedMatches?.reduce((sum: number, c: any) => sum + c.size, 0) /
          totalClusters || 0,
      largestCluster: Math.max(...(data.consolidatedMatches?.map((c: any) => c.size) || [0])),
      total: totalClusters,
    },
    matchingMethods: {
      exact: {
        enabled: !data.exactMatchingSkipped,
        matches: exactMatchCount || 0,
      },
      fuzzy: {
        enabled: !data.fuzzyMatchingSkipped,
        matches: fuzzyMatchCount || 0,
      },
      image: {
        enabled: !data.imageMatchingSkipped,
        matches: imageMatchCount || 0,
      },
      ml: {
        enabled: !data.mlMatchingSkipped,
        matches: mlMatchCount || 0,
      },
    },
    performance: {
      productsPerSecond:
        totalProducts / ((Date.now() - new Date(data.matchingStarted).getTime()) / 1000),
      totalDuration: Date.now() - new Date(data.matchingStarted).getTime(),
    },
    quality: {
      averageQualityScore:
        data.canonicalProducts?.reduce((sum: number, p: any) => sum + p.metadata.qualityScore, 0) /
          canonicalCount || 0,
      canonicalProductsCreated: canonicalCount,
    },
    recommendations: generateMatchingRecommendations(data),
    reportId: `matching_${Date.now()}`,
    summary: {
      deduplicationRate: (totalProducts - canonicalCount) / totalProducts,
      duplicatesFound: totalProducts - canonicalCount,
      productsAnalyzed: totalProducts,
      uniqueProducts: canonicalCount,
      variantGroups: variantGroupCount,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    matchingComplete: true,
    report,
  };
});

function generateMatchingRecommendations(data: any): any[] {
  const recommendations = [];

  // Low exact match rate
  if (data.exactMatchCount < data.totalProducts * 0.1) {
    recommendations.push({
      type: 'improve_identifiers',
      action: 'work_with_merchants_to_provide_identifiers',
      message: 'Few products have common identifiers (UPC, GTIN, etc.)',
      priority: 'high',
    });
  }

  // High duplicate rate
  const deduplicationRate = (data.totalProducts - data.canonicalCount) / data.totalProducts;
  if (deduplicationRate > 0.3) {
    recommendations.push({
      type: 'high_duplication',
      action: 'review_merchant_feed_quality',
      message: `${(deduplicationRate * 100).toFixed(1)}% of products are duplicates`,
      priority: 'medium',
    });
  }

  // ML matching disabled
  if (data.mlMatchingSkipped) {
    recommendations.push({
      type: 'enable_ml',
      action: 'enable_ml_matching_for_better_results',
      message: 'ML matching is disabled',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const productMatchingDeduplicationWorkflow = {
  id: 'product-matching-deduplication',
  name: 'Product Matching & Deduplication',
  config: {
    concurrency: {
      max: 5, // Limit concurrent matching jobs
    },
    maxDuration: 7200000, // 2 hours
    schedule: {
      cron: '0 4 * * *', // Daily at 4 AM
      timezone: 'UTC',
    },
  },
  description: 'Identify the same product across different merchants using ML and fuzzy matching',
  features: {
    exactMatching: true,
    fuzzyMatching: true,
    imageMatching: true,
    mlMatching: true,
    variantDetection: true,
  },
  steps: [
    productMatchingWorkflow,
    applyExactMatchingStep,
    applyFuzzyMatchingStep,
    applyMLMatchingStep,
    applyImageMatchingStep,
    consolidateMatchesStep,
    createCanonicalProductsStep,
    handleProductVariantsStep,
    storeMatchingResultsStep,
    generateMatchingReportStep,
  ],
  version: '1.0.0',
};
