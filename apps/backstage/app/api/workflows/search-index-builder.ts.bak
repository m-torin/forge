/**
 * Search Index Builder Workflow
 * Build and maintain search indices for fast product discovery
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
const SearchIndexBuilderInput = z.object({
  indexConfig: z.object({
    analyzers: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          filters: z.array(z.string()),
          tokenizer: z.string(),
        }),
      )
      .optional(),
    engine: z
      .enum(['elasticsearch', 'algolia', 'typesense', 'meilisearch'])
      .default('elasticsearch'),
    mappings: z.object({
      dynamic: z.boolean().default(false),
      properties: z.record(z.any()).optional(),
    }),
    settings: z.object({
      maxResultWindow: z.number().default(10000),
      refreshInterval: z.string().default('1s'),
      replicas: z.number().default(1),
      shards: z.number().default(5),
    }),
  }),
  indices: z
    .array(z.enum(['products', 'categories', 'brands', 'merchants', 'reviews', 'universal']))
    .default(['products']),
  mode: z.enum(['full', 'incremental', 'delta', 'repair']).default('incremental'),
  processingConfig: z.object({
    validation: z.boolean().default(true),
    batchSize: z.number().default(1000),
    deduplication: z.boolean().default(true),
    errorThreshold: z.number().default(0.05),
    parallelism: z.number().default(4),
  }),
  searchFeatures: z.object({
    autocomplete: z.boolean().default(true),
    facets: z.boolean().default(true),
    geoSearch: z.boolean().default(false),
    personalizedRanking: z.boolean().default(false),
    semanticSearch: z.boolean().default(false),
    spellcheck: z.boolean().default(true),
    synonyms: z.boolean().default(true),
  }),
  source: z.object({
    type: z.enum(['database', 'api', 'file', 'stream']).default('database'),
    connectionString: z.string().optional(),
    filters: z.record(z.any()).optional(),
    lastSync: z.string().datetime().optional(),
    query: z.string().optional(),
  }),
});

// Document schema for indexing
const SearchDocument = z.object({
  id: z.string(),
  type: z.string(),
  document: z.object({
    attributes: z.record(z.any()),
    boost: z.number().default(1.0),
    brand: z.string().optional(),
    category: z.array(z.string()),
    description: z.string().optional(),
    keywords: z.array(z.string()),
    price: z.number().optional(),
    searchableText: z.string(),
    title: z.string(),
  }),
  metadata: z.object({
    language: z.string().default('en'),
    lastModified: z.string(),
    quality: z.number(),
    source: z.string(),
  }),
  timestamp: z.string(),
  vectors: z
    .object({
      combined: z.array(z.number()).optional(),
      description: z.array(z.number()).optional(),
      title: z.array(z.number()).optional(),
    })
    .optional(),
});

// Step factory for document processing
const documentProcessorFactory = createWorkflowStep(
  {
    name: 'Document Processor',
    category: 'search',
    tags: ['indexing', 'nlp', 'preprocessing'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, documents, features } = context.input;
    const processedDocs = [];

    for (const doc of documents) {
      const processed = await processDocument(doc, config, features);
      processedDocs.push(processed);
    }

    return processedDocs;
  },
);

// Mock document processing
async function processDocument(doc: any, config: any, features: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Generate searchable text
  const searchableText = [
    doc.title,
    doc.description,
    ...(doc.category || []),
    doc.brand,
    ...Object.values(doc.attributes || {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Extract keywords
  const keywords = extractKeywords(searchableText);

  // Generate vectors if semantic search is enabled
  let vectors = undefined;
  if (features.semanticSearch) {
    vectors = {
      combined: generateMockVector(searchableText, 384),
      description: doc.description ? generateMockVector(doc.description, 384) : undefined,
      title: generateMockVector(doc.title, 384),
    };
  }

  return {
    id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: doc.type || 'product',
    document: {
      ...doc,
      boost: calculateBoost(doc),
      keywords,
      searchableText,
    },
    metadata: {
      language: detectLanguage(searchableText),
      lastModified: new Date().toISOString(),
      quality: 0.8 + Math.random() * 0.2,
      source: config.source?.type || 'unknown',
    },
    timestamp: new Date().toISOString(),
    vectors,
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.split(/\s+/);
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

  return Array.from(
    new Set(words.filter((word) => word.length > 3 && !stopwords.has(word)).slice(0, 20)),
  );
}

function generateMockVector(text: string, dimensions: number): number[] {
  // Generate mock embedding vector
  const vector = [];
  for (let i = 0; i < dimensions; i++) {
    // Use text hash for consistency
    const hash = text.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
    vector.push(Math.sin(hash + i) * Math.cos(hash - i));
  }
  return vector;
}

function calculateBoost(doc: any): number {
  let boost = 1.0;

  // Boost popular items
  if (doc.popularity > 1000) boost += 0.2;
  if (doc.rating > 4.5) boost += 0.1;
  if (doc.inStock) boost += 0.1;

  return Math.min(boost, 2.0);
}

function detectLanguage(text: string): string {
  // Mock language detection
  return 'en';
}

// Step 1: Fetch data to index
export const fetchDataToIndexStep = compose(
  createStepWithValidation(
    'fetch-data',
    async (input: z.infer<typeof SearchIndexBuilderInput>) => {
      const { indices, mode, source } = input;

      let dataToIndex = [];
      let totalRecords = 0;

      // Fetch data based on mode and source
      switch (mode) {
        case 'full':
          dataToIndex = await fetchAllData(source, indices);
          break;
        case 'incremental':
          dataToIndex = await fetchIncrementalData(source, indices, source.lastSync);
          break;
        case 'delta':
          dataToIndex = await fetchDeltaData(source, indices);
          break;
        case 'repair':
          dataToIndex = await fetchDataForRepair(source, indices);
          break;
      }

      totalRecords = dataToIndex.length;

      // Group by index type
      const groupedData = new Map();
      for (const item of dataToIndex) {
        const indexType = item.type || 'products';
        if (!groupedData.has(indexType)) {
          groupedData.set(indexType, []);
        }
        groupedData.get(indexType).push(item);
      }

      return {
        ...input,
        dataToIndex: Array.from(groupedData.entries()).map(([type, data]) => ({
          count: data.length,
          documents: data,
          indexType: type,
        })),
        indexingStarted: new Date().toISOString(),
        totalRecords,
      };
    },
    (input) => input.indices.length > 0,
    (output) => output.totalRecords > 0,
  ),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes
  (step) =>
    withStepMonitoring(step, {
, 'indexTypes'],
      enableDetailedLogging: true,
    }),
);

// Mock data fetching functions
async function fetchAllData(source: any, indices: string[]): Promise<any[]> {
  // Simulate fetching all data
  const data = [];

  if (indices.includes('products')) {
    data.push(...generateMockProducts(10000));
  }

  if (indices.includes('categories')) {
    data.push(...generateMockCategories(100));
  }

  if (indices.includes('brands')) {
    data.push(...generateMockBrands(500));
  }

  return data;
}

async function fetchIncrementalData(
  source: any,
  indices: string[],
  lastSync?: string,
): Promise<any[]> {
  // Simulate fetching only new/updated data
  const cutoff = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const data = await fetchAllData(source, indices);

  // Filter to recent items (mock)
  return data.slice(0, Math.floor(data.length * 0.1));
}

async function fetchDeltaData(source: any, indices: string[]): Promise<any[]> {
  // Simulate fetching changed data
  return fetchIncrementalData(source, indices);
}

async function fetchDataForRepair(source: any, indices: string[]): Promise<any[]> {
  // Simulate fetching data that needs repair
  const data = await fetchAllData(source, indices);

  // Return subset that needs repair (mock)
  return data.filter(() => Math.random() < 0.05);
}

function generateMockProducts(count: number): any[] {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
  const brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE'];

  return Array.from({ length: count }, (_, i) => ({
    id: `prod_${i}`,
    type: 'products',
    attributes: {
      color: ['Red', 'Blue', 'Green', 'Black', 'White'][Math.floor(Math.random() * 5)],
      material: ['Cotton', 'Polyester', 'Leather', 'Metal', 'Plastic'][
        Math.floor(Math.random() * 5)
      ],
      size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
    },
    brand: brands[Math.floor(Math.random() * brands.length)],
    category: [categories[Math.floor(Math.random() * categories.length)]],
    description: `This is a detailed description for product ${i}. It contains various features and benefits.`,
    inStock: Math.random() > 0.1,
    lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    popularity: Math.floor(Math.random() * 5000),
    price: Math.floor(Math.random() * 1000) + 10,
    rating: 3 + Math.random() * 2,
    title: `Product ${i}`,
  }));
}

function generateMockCategories(count: number): any[] {
  const parentCategories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'];

  return Array.from({ length: count }, (_, i) => ({
    id: `cat_${i}`,
    type: 'categories',
    description: `Category description ${i}`,
    level: i > 20 ? 2 : 1,
    parent: i > 20 ? parentCategories[Math.floor(Math.random() * parentCategories.length)] : null,
    productCount: Math.floor(Math.random() * 1000),
    title: `Category ${i}`,
  }));
}

function generateMockBrands(count: number): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `brand_${i}`,
    type: 'brands',
    country: ['USA', 'Germany', 'Japan', 'Italy', 'France'][Math.floor(Math.random() * 5)],
    description: `Premium brand offering quality products`,
    established: 1900 + Math.floor(Math.random() * 120),
    productCount: Math.floor(Math.random() * 500),
    title: `Brand ${i}`,
  }));
}

// Step 2: Process and enrich documents
export const processDocumentsStep = compose(
  createStep('process-documents', async (data: any) => {
    const { dataToIndex, processingConfig, searchFeatures } = data;
    const processedIndices = [];

    for (const indexData of dataToIndex) {
      const { documents, indexType } = indexData;

      // Process documents in batches
      const processedDocs = [];
      const errors = [];

      for (let i = 0; i < documents.length; i += processingConfig.batchSize) {
        const batch = documents.slice(i, i + processingConfig.batchSize);

        try {
          const batchResults = await documentProcessorFactory.handler({
            input: {
              config: processingConfig,
              documents: batch,
              features: searchFeatures,
            },
          });

          processedDocs.push(...batchResults);
        } catch (error) {
          errors.push({
            batch: i / processingConfig.batchSize,
            documentIds: batch.map((d: any) => d.id),
            (error as Error): (error as Error).message,
          });
        }

        // Log progress
        console.log(
          `Processed ${Math.min(i + processingConfig.batchSize, documents.length)}/${documents.length} documents for ${indexType}`,
        );
      }

      processedIndices.push({
        errorCount: errors.length,
        errors: errors.slice(0, 10), // Keep first 10 errors
        indexType,
        processedDocuments: processedDocs,
        processingStats: {
          failed: documents.length - processedDocs.length,
          successful: processedDocs.length,
          successRate: processedDocs.length / documents.length,
          total: documents.length,
        },
      });
    }

    return {
      ...data,
      processedIndices,
      processingComplete: true,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 10,
      maxQueued: 50,
    }),
);

// Step 3: Build search features
export const buildSearchFeaturesStep = createStep('build-features', async (data: any) => {
  const { processedIndices, searchFeatures } = data;
  const featuresBuilt = new Map();

  for (const indexData of processedIndices) {
    const features: any = {
      indexType: indexData.indexType,
    };

    if (searchFeatures.autocomplete) {
      features.autocomplete = await buildAutocompleteData(indexData.processedDocuments);
    }

    if (searchFeatures.facets) {
      features.facets = buildFacets(indexData.processedDocuments);
    }

    if (searchFeatures.synonyms) {
      features.synonyms = await buildSynonyms(indexData.processedDocuments);
    }

    if (searchFeatures.spellcheck) {
      features.spellcheck = buildSpellcheckDictionary(indexData.processedDocuments);
    }

    featuresBuilt.set(indexData.indexType, features);
  }

  return {
    ...data,
    featuresBuilt: true,
    searchFeatures: Array.from(featuresBuilt.values()),
  };
});

async function buildAutocompleteData(documents: any[]): Promise<any> {
  // Extract common prefixes and phrases
  const phrases = new Map();

  documents.forEach((doc) => {
    const title = doc.document.title.toLowerCase();
    const words = title.split(/\s+/);

    // Generate n-grams
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    }
  });

  // Sort by frequency and return top suggestions
  const suggestions = Array.from(phrases.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1000)
    .map(([phrase, count]) => ({ count, phrase, weight: Math.log(count + 1) }));

  return {
    prefixTree: buildPrefixTree(suggestions.map((s) => s.phrase)),
    suggestions,
  };
}

function buildPrefixTree(phrases: string[]): any {
  const tree: any = {};

  phrases.forEach((phrase) => {
    let node = tree;
    for (const char of phrase) {
      if (!node[char]) {
        node[char] = {};
      }
      node = node[char];
    }
    node.$ = true; // End of phrase marker
  });

  return tree;
}

function buildFacets(documents: any[]): any {
  const facets = {
    attributes: new Map(),
    brand: new Map(),
    category: new Map(),
    price: {
      max: -Infinity,
      min: Infinity,
      ranges: [],
    },
  };

  documents.forEach((doc) => {
    // Category facets
    doc.document.category?.forEach((cat: string) => {
      facets.category.set(cat, (facets.category.get(cat) || 0) + 1);
    });

    // Brand facets
    if (doc.document.brand) {
      facets.brand.set(doc.document.brand, (facets.brand.get(doc.document.brand) || 0) + 1);
    }

    // Price facets
    if (doc.document.price) {
      facets.price.min = Math.min(facets.price.min, doc.document.price);
      facets.price.max = Math.max(facets.price.max, doc.document.price);
    }

    // Attribute facets
    Object.entries(doc.document.attributes || {}).forEach(([key, value]) => {
      if (!facets.attributes.has(key)) {
        facets.attributes.set(key, new Map());
      }
      facets.attributes
        .get(key)
        .set(value as string, (facets.attributes.get(key).get(value as string) || 0) + 1);
    });
  });

  // Generate price ranges
  const priceRange = facets.price.max - facets.price.min;
  const rangeSize = Math.ceil(priceRange / 5);

  for (let i = 0; i < 5; i++) {
    const min = facets.price.min + i * rangeSize;
    const max = Math.min(facets.price.min + (i + 1) * rangeSize, facets.price.max);
    facets.price.ranges.push({ label: (`$${min as any)} - $${max}`, max, min });
  }

  return {
    attributes: Array.from(facets.attributes.entries()).map(([attr, values]) => ({
      attribute: attr,
      values: (Array.from(values.entries()).map(([value as any), count]) => ({ count, value })),
    })),
    brand: Array.from(facets.brand.entries()).map(([name, count]) => ({ name, count })),
    category: Array.from(facets.category.entries()).map(([name, count]) => ({ name, count })),
    price: facets.price,
  };
}

async function buildSynonyms(documents: any[]): Promise<any> {
  // Build synonym dictionary from product data
  const synonymGroups = [
    // Common e-commerce synonyms
    ['laptop', 'notebook', 'computer'],
    ['phone', 'smartphone', 'mobile', 'cellphone'],
    ['tv', 'television', 'display', 'monitor'],
    ['shirt', 'tshirt', 't-shirt', 'tee'],
    ['shoe', 'shoes', 'footwear', 'sneakers'],
  ];

  // Extract brand synonyms
  const brandSynonyms = new Map();
  documents.forEach((doc) => {
    if (doc.document.brand) {
      const brand = doc.document.brand.toLowerCase();
      const variations = [brand, brand.replace(/\s+/g, ''), brand.replace(/\s+/g, '-')];
      brandSynonyms.set(brand, variations);
    }
  });

  return {
    brands: Array.from(brandSynonyms.entries()),
    groups: synonymGroups,
    total: synonymGroups.length + brandSynonyms.size,
  };
}

function buildSpellcheckDictionary(documents: any[]): any {
  // Build frequency-based dictionary
  const wordFrequency = new Map();

  documents.forEach((doc) => {
    const text = doc.document.searchableText;
    const words = text.split(/\s+/);

    words.forEach((word: any) => {
      if (word.length > 3) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });
  });

  // Keep words with frequency > 5
  const dictionary = Array.from(wordFrequency.entries())
    .filter(([_, count]) => count > 5)
    .map(([word]) => word)
    .sort();

  // Generate common misspellings
  const misspellings = new Map();
  dictionary.slice(0, 100).forEach((word) => {
    const variations = generateMisspellings(word);
    variations.forEach((v) => misspellings.set(v, word));
  });

  return {
    dictionary,
    dictionarySize: dictionary.length,
    misspellings: Array.from(misspellings.entries()),
  };
}

function generateMisspellings(word: string): string[] {
  const misspellings = [];

  // Character transposition
  for (let i = 0; i < word.length - 1; i++) {
    const chars = word.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    misspellings.push(chars.join(''));
  }

  // Missing character
  for (let i = 0; i < word.length; i++) {
    misspellings.push(word.slice(0, i) + word.slice(i + 1));
  }

  return misspellings;
}

// Step 4: Create or update indices
export const createOrUpdateIndicesStep = compose(
  createStep('create-indices', async (data: any) => {
    const { indexConfig, processedIndices } = data;
    const indexResults = [];

    for (const indexData of processedIndices) {
      const result = await createOrUpdateIndex(indexData.indexType, indexConfig);
      indexResults.push(result);
    }

    return {
      ...data,
      indexResults,
      indicesCreated: true,
    };
  }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

async function createOrUpdateIndex(indexType: string, config: any): Promise<any> {
  // Simulate index creation/update
  await new Promise((resolve) => setTimeout(resolve, 500));

  const indexName = `${indexType}_${Date.now()}`;

  return {
    aliases: [`${indexType}_current`, `${indexType}_search`],
    createdAt: new Date().toISOString(),
    indexName,
    indexType,
    mappings: generateMappings(indexType, config),
    settings: {
      numberOfReplicas: config.settings.replicas,
      numberOfShards: config.settings.shards,
      refreshInterval: config.settings.refreshInterval,
    },
    status: 'created',
  };
}

function generateMappings(indexType: string, config: any): any {
  const baseMapping = {
    dynamic: config.mappings.dynamic,
    properties: {
      id: { type: 'keyword' },
      type: { type: 'keyword' },
      document: {
        properties: {
          boost: { type: 'float' },
          brand: { type: 'keyword' },
          category: { type: 'keyword' },
          description: { type: 'text', analyzer: 'standard' },
          keywords: { type: 'keyword' },
          price: { type: 'float' },
          searchableText: { type: 'text', analyzer: 'standard' },
          title: {
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' },
            },
          },
        },
      },
      metadata: {
        properties: {
          language: { type: 'keyword' },
          lastModified: { type: 'date' },
          quality: { type: 'float' },
          source: { type: 'keyword' },
        },
      },
      timestamp: { type: 'date' },
    },
  };

  // Add vector fields if semantic search is enabled
  if (config.features?.semanticSearch) {
    baseMapping.properties.vectors = {
      properties: {
        combined: { type: 'dense_vector', dims: 384 },
        description: { type: 'dense_vector', dims: 384 },
        title: { type: 'dense_vector', dims: 384 },
      },
    };
  }

  return baseMapping;
}

// Step 5: Bulk index documents
export const bulkIndexDocumentsStep = compose(
  createStep('bulk-index', async (data: any) => {
    const { indexResults, processedIndices, processingConfig } = data;
    const indexingResults = [];

    for (let i = 0; i < processedIndices.length; i++) {
      const documents = processedIndices[i].processedDocuments;
      const index = indexResults[i];

      const result = await bulkIndexToSearchEngine(documents, index, processingConfig);

      indexingResults.push(result);
    }

    return {
      ...data,
      documentsIndexed: true,
      indexingResults,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 5,
      maxQueued: 20,
    }),
  (step) =>
    withStepMonitoring(step, {
, 'indexingRate'],
      enableDetailedLogging: true,
    }),
);

async function bulkIndexToSearchEngine(documents: any[], index: any, config: any): Promise<any> {
  const results = {
    errors: [],
    failed: 0,
    indexed: 0,
    indexName: index.indexName,
    performance: {
      docsPerSecond: 0,
      endTime: 0,
      startTime: Date.now(),
    },
    totalDocuments: documents.length,
  };

  // Index in batches
  for (let i = 0; i < documents.length; i += config.batchSize) {
    const batch = documents.slice(i, i + config.batchSize);

    try {
      // Simulate bulk indexing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Random failures for simulation
      const failedInBatch = Math.floor(Math.random() * 3);
      results.indexed += batch.length - failedInBatch;
      results.failed += failedInBatch;

      if (failedInBatch > 0) {
        results.errors.push({
          batch: Math.floor(i / config.batchSize),
          count: failedInBatch,
          reason: 'Document validation failed',
        });
      }

      console.log(`Indexed ${results.indexed}/${documents.length} documents`);
    } catch (error) {
      results.failed += batch.length;
      results.errors.push({
        batch: Math.floor(i / config.batchSize),
        count: batch.length,
        reason: (error as Error).message,
      });
    }
  }

  results.performance.endTime = Date.now();
  results.performance.docsPerSecond =
    results.indexed / ((results.performance.endTime - results.performance.startTime) / 1000);

  return results;
}

// Step 6: Validate index quality
export const validateIndexQualityStep = createStep('validate-quality', async (data: any) => {
  const { indexingResults, searchFeatures } = data;
  const validationResults = [];

  for (const indexResult of indexingResults) {
    const validation = await validateIndex(indexResult, searchFeatures);
    validationResults.push(validation);
  }

  return {
    ...data,
    validationComplete: true,
    validationResults,
  };
});

async function validateIndex(indexResult: any, features: any): Promise<any> {
  // Simulate index validation
  await new Promise((resolve) => setTimeout(resolve, 200));

  const tests = {
    documentCount: {
      actual: indexResult.indexed,
      expected: indexResult.totalDocuments,
      passed: indexResult.indexed >= indexResult.totalDocuments * 0.95,
    },
    features: {
      autocomplete: features.autocomplete ? testAutocomplete() : null,
      facets: features.facets ? testFacets() : null,
      spellcheck: features.spellcheck ? testSpellcheck() : null,
    },
    performance: {
      avgQueryTime: 15 + Math.random() * 10,
      maxQueryTime: 50 + Math.random() * 50,
      passed: true,
    },
    searchability: {
      passed: true,
      queries: ['test', 'product', 'brand'],
      results: [100, 500, 200],
    },
  };

  const allPassed = Object.values(tests)
    .filter((t) => typeof t === 'object' && t.passed !== undefined)
    .every((t) => t.passed);

  return {
    indexName: indexResult.indexName,
    recommendations: generateQualityRecommendations(tests),
    score: calculateQualityScore(tests),
    status: allPassed ? 'healthy' : 'degraded',
    tests,
  };
}

function testAutocomplete(): any {
  return {
    avgSuggestions: 8.5,
    passed: true,
    successful: 9,
    tested: 10,
  };
}

function testFacets(): any {
  return {
    avgValues: 25,
    coverage: 0.95,
    facetCount: 15,
    passed: true,
  };
}

function testSpellcheck(): any {
  return {
    correctionAccuracy: 0.92,
    dictionarySize: 5000,
    passed: true,
  };
}

function calculateQualityScore(tests: any): number {
  let score = 0;
  let weight = 0;

  if (tests.documentCount.passed) {
    score += 0.3;
  }
  weight += 0.3;

  if (tests.searchability.passed) {
    score += 0.4;
  }
  weight += 0.4;

  if (tests.performance.passed) {
    score += 0.3;
  }
  weight += 0.3;

  return (score / weight) * 100;
}

function generateQualityRecommendations(tests: any): string[] {
  const recommendations = [];

  if (!tests.documentCount.passed) {
    recommendations.push('Index missing significant number of documents. Check import errors.');
  }

  if (tests.performance.avgQueryTime > 20) {
    recommendations.push('Query performance below optimal. Consider index optimization.');
  }

  if (tests.features.autocomplete && tests.features.autocomplete.avgSuggestions < 5) {
    recommendations.push('Low autocomplete suggestions. Enrich autocomplete dictionary.');
  }

  return recommendations;
}

// Step 7: Switch to new index
export const switchToNewIndexStep = compose(
  createStep('switch-index', async (data: any) => {
    const { validationResults, indexResults, mode } = data;
    const switchResults = [];

    for (let i = 0; i < indexResults.length; i++) {
      const index = indexResults[i];
      const validation = validationResults[i];

      if (validation.status === 'healthy' || mode === 'repair') {
        const result = await switchIndex(index, validation);
        switchResults.push(result);
      } else {
        switchResults.push({
          validation,
          indexType: index.indexType,
          reason: 'Validation failed',
          switched: false,
        });
      }
    }

    return {
      ...data,
      switchComplete: true,
      switchResults,
    };
  }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

async function switchIndex(index: any, validation: any): Promise<any> {
  // Simulate index switching
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    validation: {
      score: validation.score,
      status: validation.status,
    },
    aliases: index.aliases,
    indexType: index.indexType,
    newIndex: index.indexName,
    oldIndex: `${index.indexType}_old`,
    switched: true,
    switchedAt: new Date().toISOString(),
  };
}

// Step 8: Warm up cache
export const warmUpCacheStep = createStep('warm-cache', async (data: any) => {
  const { searchFeatures, switchResults } = data;
  const cacheResults = [];

  for (const switchResult of switchResults) {
    if (switchResult.switched) {
      const warmup = await warmUpSearchCache(switchResult, searchFeatures);
      cacheResults.push(warmup);
    }
  }

  return {
    ...data,
    cacheResults,
    cacheWarmedUp: true,
  };
});

async function warmUpSearchCache(switchResult: any, features: any): Promise<any> {
  // Simulate cache warming
  const queries = [
    // Popular queries
    'laptop',
    'phone',
    'shoes',
    'shirt',
    'electronics',
    // Category queries
    'electronics category:laptop',
    'clothing brand:nike',
    // Faceted queries
    'laptop price:[500 TO 1000]',
    'phone brand:apple',
  ];

  const results = [];
  for (const query of queries) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    results.push({
      cached: true,
      query,
      responseTime: 5 + Math.random() * 10,
    });
  }

  return {
    avgResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
    cacheHitRate: 0,
    indexType: switchResult.indexType,
    queriesWarmed: queries.length,
  };
}

// Step 9: Clean up old indices
export const cleanupOldIndicesStep = createStep('cleanup-indices', async (data: any) => {
  const { mode, switchResults } = data;
  const cleanupResults = [];

  if (mode === 'full' || mode === 'incremental') {
    for (const switchResult of switchResults) {
      if (switchResult.switched) {
        const cleanup = await cleanupOldIndex(switchResult);
        cleanupResults.push(cleanup);
      }
    }
  }

  return {
    ...data,
    cleanupComplete: true,
    cleanupResults,
  };
});

async function cleanupOldIndex(switchResult: any): Promise<any> {
  // Simulate cleanup
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    deletedAt: new Date().toISOString(),
    deletedIndex: switchResult.oldIndex,
    freedSpace: Math.floor(Math.random() * 1000) + 100, // MB
    indexType: switchResult.indexType,
  };
}

// Step 10: Generate indexing report
export const generateIndexingReportStep = createStep('generate-report', async (data: any) => {
  const {
    validationResults,
    indexingResults,
    processedIndices,
    searchFeatures,
    switchResults,
    totalRecords,
  } = data;

  const report = {
    features: {
      autocomplete: searchFeatures.find((f: any) => f.autocomplete)?.autocomplete,
      enabled: Object.entries(data.searchFeatures)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature),
      facets: searchFeatures.find((f: any) => f.facets)?.facets,
    },
    indices: processedIndices.map((idx: any, i: number) => ({
      type: idx.indexType,
      documents: idx.processedDocuments.length,
      indexed: indexingResults[i].indexed,
      quality: validationResults[i].score,
      status: validationResults[i].status,
      switched: switchResults[i].switched,
    })),
    performance: {
      avgIndexingRate: calculateAvgIndexingRate(indexingResults),
      avgQueryTime:
        validationResults.reduce(
          (sum: number, v: any) => sum + (v.tests.performance?.avgQueryTime || 0),
          0,
        ) / validationResults.length,
      totalTime: Date.now() - new Date(data.indexingStarted).getTime(),
    },
    recommendations: generateIndexingRecommendations(data),
    reportId: `search_index_${Date.now()}`,
    summary: {
      documentsIndexed: indexingResults.reduce((sum: number, r: any) => sum + r.indexed, 0),
      failedDocuments: indexingResults.reduce((sum: number, r: any) => sum + r.failed, 0),
      indicesBuilt: processedIndices.length,
      mode: data.mode,
      switchedIndices: switchResults.filter((r: any) => r.switched).length,
      totalRecords,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    indexingComplete: true,
    report,
  };
});

function calculateAvgIndexingRate(results: any[]): number {
  const totalDocs = results.reduce((sum, r) => sum + r.indexed, 0);
  const totalTime =
    results.reduce((sum, r) => sum + (r.performance.endTime - r.performance.startTime), 0) / 1000;

  return totalDocs / totalTime;
}

function generateIndexingRecommendations(data: any): any[] {
  const recommendations = [];

  // High failure rate
  const failureRate =
    data.indexingResults.reduce((sum: number, r: any) => sum + r.failed, 0) / data.totalRecords;

  if (failureRate > 0.05) {
    recommendations.push({
      type: 'high_failure_rate',
      action: 'review_document_validation',
      message: `${(failureRate * 100).toFixed(1)}% of documents failed to index`,
      priority: 'high',
    });
  }

  // Slow indexing
  const avgRate = calculateAvgIndexingRate(data.indexingResults);
  if (avgRate < 1000) {
    recommendations.push({
      type: 'slow_indexing',
      action: 'increase_batch_size_or_parallelism',
      message: `Indexing rate of ${avgRate.toFixed(0)} docs/sec is below optimal`,
      priority: 'medium',
    });
  }

  // Enable semantic search
  if (!data.searchFeatures.semanticSearch) {
    recommendations.push({
      type: 'feature_enhancement',
      action: 'enable_semantic_search_for_better_relevance',
      message: 'Semantic search is disabled',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const searchIndexBuilderWorkflow = {
  id: 'search-index-builder',
  name: 'Search Index Builder',
  config: {
    concurrency: {
      max: 3, // Limit concurrent indexing jobs
    },
    maxDuration: 7200000, // 2 hours
    schedule: {
      cron: '0 3 * * *', // Daily at 3 AM
      timezone: 'UTC',
    },
  },
  description: 'Build and maintain search indices for fast product discovery',
  features: {
    autocomplete: true,
    facetedSearch: true,
    incrementalIndexing: true,
    multiEngine: true,
    semanticSearch: true,
  },
  steps: [
    fetchDataToIndexStep,
    processDocumentsStep,
    buildSearchFeaturesStep,
    createOrUpdateIndicesStep,
    bulkIndexDocumentsStep,
    validateIndexQualityStep,
    switchToNewIndexStep,
    warmUpCacheStep,
    cleanupOldIndicesStep,
    generateIndexingReportStep,
  ],
  version: '1.0.0',
};
