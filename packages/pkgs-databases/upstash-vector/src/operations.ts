/**
 * Domain-specific Upstash Vector operations
 * Higher-level abstractions for semantic search and AI applications
 */

import type { AIProvider, SimilarityResult, UpstashVectorClient, VectorResult } from './types';

/**
 * Content similarity operations
 */
export class ContentSimilarityOperations {
  constructor(private client: UpstashVectorClient) {}

  /**
   * Index content with automatic chunking and embedding
   */
  async indexContent(
    content: {
      id: string;
      title: string;
      body: string;
      url?: string;
      category?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    },
    options: {
      provider?: AIProvider;
      chunkSize?: number;
      chunkOverlap?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<{ chunksCreated: number }>> {
    try {
      const fullText = `${content.title}\n\n${content.body}`;

      const chunks = this.client.chunkDocument(fullText, {
        documentId: content.id,
        chunkSize: options.chunkSize || 1000,
        chunkOverlap: options.chunkOverlap || 200,
        metadata: {
          title: content.title,
          url: content.url,
          category: content.category,
          tags: content.tags || [],
          ...content.metadata,
        },
      });

      await this.client.indexDocument(chunks, {
        documentId: content.id,
        provider: options.provider || 'openai',
        namespace: options.namespace,
      });

      return {
        success: true,
        data: { chunksCreated: chunks.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Find similar content based on text query
   */
  async findSimilarContent(
    query: string,
    options: {
      topK?: number;
      threshold?: number;
      categories?: string[];
      excludeIds?: string[];
      provider?: AIProvider;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      let filter = '';
      const conditions = [];

      if (options.categories?.length) {
        const categoryConditions = options.categories.map(cat => `category == "${cat}"`);
        conditions.push(`(${categoryConditions.join(' OR ')})`);
      }

      if (options.excludeIds?.length) {
        const excludeConditions = options.excludeIds.map(id => `documentId != "${id}"`);
        conditions.push(excludeConditions.join(' AND '));
      }

      if (conditions.length > 0) {
        filter = conditions.join(' AND ');
      }

      const results = await this.client.semanticSearch(query, {
        topK: options.topK || 10,
        filter,
        namespace: options.namespace,
        threshold: options.threshold,
      });

      // Filter by threshold if specified
      const filtered = options.threshold
        ? results.filter(result => result.score >= options.threshold!)
        : results;

      return { success: true, data: filtered };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get content recommendations based on user's reading history
   */
  async getRecommendations(
    userHistory: Array<{ contentId: string; rating?: number; timestamp: Date }>,
    options: {
      topK?: number;
      diversityFactor?: number;
      recencyWeight?: number;
      excludeRead?: boolean;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      // Create a preference vector from user history
      const preferenceVector = await this.buildPreferenceVector(userHistory, {
        recencyWeight: options.recencyWeight || 0.3,
      });

      let filter = '';
      if (options.excludeRead) {
        const readIds = userHistory.map(h => h.contentId);
        filter = readIds.map(id => `documentId != "${id}"`).join(' AND ');
      }

      const results = await this.client.similaritySearch(preferenceVector, {
        topK: Math.min((options.topK || 10) * 3, 50), // Get more for diversity
        filter,
        namespace: options.namespace,
      });

      // Apply diversity if requested
      const finalResults =
        options.diversityFactor && options.diversityFactor > 0
          ? this.applyDiversityFilter(results, options.diversityFactor)
          : results;

      return {
        success: true,
        data: finalResults.slice(0, options.topK || 10),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Detect duplicate or near-duplicate content
   */
  async findDuplicates(
    contentId: string,
    options: {
      threshold?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      // Get the original content's vector
      const originalChunks = await this.client.fetch([contentId], options.namespace);

      if (originalChunks.length === 0) {
        return { success: false, error: 'Content not found' };
      }

      const originalVector = originalChunks[0].vector;
      const threshold = options.threshold || 0.9;

      const results = await this.client.similaritySearch(originalVector, {
        topK: 20,
        filter: `documentId != "${contentId}"`, // Exclude self
        namespace: options.namespace,
        threshold,
      });

      const duplicates = results.filter(result => result.score >= threshold);

      return { success: true, data: duplicates };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Build user preference vector from history
   */
  private async buildPreferenceVector(
    history: Array<{ contentId: string; rating?: number; timestamp: Date }>,
    options: { recencyWeight: number },
  ): Promise<number[]> {
    const vectors: Array<{ vector: number[]; weight: number }> = [];
    const now = Date.now();

    for (const item of history) {
      try {
        const chunks = await this.client.fetch([item.contentId]);
        if (chunks.length === 0) continue;

        // Calculate weight based on rating and recency
        const ratingWeight = item.rating ? item.rating / 5 : 1; // Normalize rating
        const daysSince = (now - item.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.exp(-daysSince * options.recencyWeight);

        vectors.push({
          vector: chunks[0].vector,
          weight: ratingWeight * recencyWeight,
        });
      } catch (error) {
        console.warn(`Failed to fetch vector for content ${item.contentId}:`, error);
      }
    }

    if (vectors.length === 0) {
      throw new Error('No valid vectors found in user history');
    }

    // Calculate weighted average
    const dimensions = vectors[0].vector.length;
    const result = new Array(dimensions).fill(0);
    let totalWeight = 0;

    for (const { vector, weight } of vectors) {
      totalWeight += weight;
      for (let i = 0; i < dimensions; i++) {
        result[i] += vector[i] * weight;
      }
    }

    // Normalize
    for (let i = 0; i < dimensions; i++) {
      result[i] /= totalWeight;
    }

    return result;
  }

  /**
   * Apply diversity filter to results
   */
  private applyDiversityFilter(
    results: SimilarityResult[],
    diversityFactor: number,
  ): SimilarityResult[] {
    const diversified: SimilarityResult[] = [];
    const usedCategories = new Set<string>();
    const maxPerCategory = Math.max(1, Math.floor(results.length * diversityFactor));

    // First pass: select best from each category
    for (const result of results) {
      const category = result.metadata?.category || 'uncategorized';
      const categoryCount = diversified.filter(r => r.metadata?.category === category).length;

      if (categoryCount < maxPerCategory) {
        diversified.push(result);
        usedCategories.add(category);
      }

      if (diversified.length >= results.length) break;
    }

    // Second pass: fill remaining slots with best scores
    const remaining = results.filter(r => !diversified.includes(r));
    diversified.push(...remaining.slice(0, results.length - diversified.length));

    return diversified;
  }
}

/**
 * Code similarity operations
 */
export class CodeSimilarityOperations {
  constructor(private client: UpstashVectorClient) {}

  /**
   * Index code files with metadata
   */
  async indexCode(
    codeData: {
      id: string;
      filename: string;
      content: string;
      language: string;
      repository?: string;
      author?: string;
      lastModified?: Date;
    },
    options: {
      provider?: AIProvider;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<{ chunksCreated: number }>> {
    try {
      const chunks = this.client.chunkDocument(codeData.content, {
        documentId: codeData.id,
        chunkSize: 2000, // Larger chunks for code
        chunkOverlap: 500,
        metadata: {
          filename: codeData.filename,
          language: codeData.language,
          repository: codeData.repository,
          author: codeData.author,
          lastModified: codeData.lastModified?.toISOString(),
          type: 'code',
        },
      });

      await this.client.indexDocument(chunks, {
        documentId: codeData.id,
        provider: options.provider || 'openai',
        namespace: options.namespace || 'code',
      });

      return {
        success: true,
        data: { chunksCreated: chunks.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Find similar code snippets
   */
  async findSimilarCode(
    query: string,
    options: {
      languages?: string[];
      repositories?: string[];
      topK?: number;
      threshold?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      let filter = 'type == "code"';

      if (options.languages?.length) {
        const langFilter = options.languages.map(lang => `language == "${lang}"`).join(' OR ');
        filter += ` AND (${langFilter})`;
      }

      if (options.repositories?.length) {
        const repoFilter = options.repositories.map(repo => `repository == "${repo}"`).join(' OR ');
        filter += ` AND (${repoFilter})`;
      }

      const results = await this.client.semanticSearch(query, {
        topK: options.topK || 10,
        filter,
        namespace: options.namespace || 'code',
        threshold: options.threshold,
      });

      return { success: true, data: results };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Detect code clones and duplicates
   */
  async detectClones(
    codeId: string,
    options: {
      threshold?: number;
      includeExactDuplicates?: boolean;
      namespace?: string;
    } = {},
  ): Promise<
    VectorResult<{
      exactDuplicates: SimilarityResult[];
      nearDuplicates: SimilarityResult[];
    }>
  > {
    try {
      const originalChunks = await this.client.fetch([codeId], options.namespace || 'code');

      if (originalChunks.length === 0) {
        return { success: false, error: 'Code not found' };
      }

      const results = await this.client.similaritySearch(originalChunks[0].vector, {
        topK: 50,
        filter: `documentId != "${codeId}" AND type == "code"`,
        namespace: options.namespace || 'code',
      });

      const exactThreshold = 0.98;
      const nearThreshold = options.threshold || 0.85;

      const exactDuplicates = results.filter(r => r.score >= exactThreshold);
      const nearDuplicates = results.filter(
        r => r.score >= nearThreshold && r.score < exactThreshold,
      );

      return {
        success: true,
        data: {
          exactDuplicates: options.includeExactDuplicates !== false ? exactDuplicates : [],
          nearDuplicates,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get code recommendations based on current context
   */
  async getCodeSuggestions(
    currentCode: string,
    context: {
      language: string;
      repository?: string;
      filename?: string;
    },
    options: {
      topK?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      // Generate embedding for current code
      const embedding = await this.client.generateEmbedding(currentCode);

      let filter = `type == "code" AND language == "${context.language}"`;

      if (context.repository) {
        filter += ` AND repository == "${context.repository}"`;
      }

      const results = await this.client.similaritySearch(embedding.embeddings[0], {
        topK: options.topK || 5,
        filter,
        namespace: options.namespace || 'code',
      });

      return { success: true, data: results };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

/**
 * E-commerce product similarity operations
 */
export class ProductSimilarityOperations {
  constructor(private client: UpstashVectorClient) {}

  /**
   * Index product with comprehensive attributes
   */
  async indexProduct(
    product: {
      id: string;
      title: string;
      description: string;
      category: string;
      brand?: string;
      price?: number;
      features?: string[];
      tags?: string[];
      imageUrls?: string[];
      specifications?: Record<string, any>;
    },
    options: {
      provider?: AIProvider;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<{ chunksCreated: number }>> {
    try {
      // Create rich text representation
      const richText = this.buildProductText(product);

      const chunks = this.client.chunkDocument(richText, {
        documentId: product.id,
        chunkSize: 800,
        chunkOverlap: 150,
        metadata: {
          title: product.title,
          category: product.category,
          brand: product.brand,
          price: product.price,
          features: product.features || [],
          tags: product.tags || [],
          specifications: product.specifications || {},
          type: 'product',
        },
      });

      await this.client.indexDocument(chunks, {
        documentId: product.id,
        provider: options.provider || 'openai',
        namespace: options.namespace || 'products',
      });

      return {
        success: true,
        data: { chunksCreated: chunks.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Find similar products
   */
  async findSimilarProducts(
    query: string | { productId: string },
    options: {
      categories?: string[];
      brands?: string[];
      priceRange?: { min: number; max: number };
      topK?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      let searchVector: number[];

      if (typeof query === 'string') {
        const embedding = await this.client.generateEmbedding(query);
        searchVector = embedding.embeddings[0];
      } else {
        const productChunks = await this.client.fetch(
          [query.productId],
          options.namespace || 'products',
        );
        if (productChunks.length === 0) {
          return { success: false, error: 'Product not found' };
        }
        searchVector = productChunks[0].vector;
      }

      let filter = 'type == "product"';

      if (options.categories?.length) {
        const categoryFilter = options.categories.map(cat => `category == "${cat}"`).join(' OR ');
        filter += ` AND (${categoryFilter})`;
      }

      if (options.brands?.length) {
        const brandFilter = options.brands.map(brand => `brand == "${brand}"`).join(' OR ');
        filter += ` AND (${brandFilter})`;
      }

      if (options.priceRange) {
        filter += ` AND price >= ${options.priceRange.min} AND price <= ${options.priceRange.max}`;
      }

      // Exclude the original product if searching by productId
      if (typeof query === 'object') {
        filter += ` AND documentId != "${query.productId}"`;
      }

      const results = await this.client.similaritySearch(searchVector, {
        topK: options.topK || 10,
        filter,
        namespace: options.namespace || 'products',
      });

      return { success: true, data: results };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get personalized product recommendations
   */
  async getPersonalizedRecommendations(
    userProfile: {
      purchaseHistory?: string[]; // Product IDs
      browsingHistory?: string[]; // Product IDs
      preferences?: {
        categories?: string[];
        brands?: string[];
        priceRange?: { min: number; max: number };
      };
    },
    options: {
      topK?: number;
      diversityFactor?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<SimilarityResult[]>> {
    try {
      // Build preference vector from user history
      const preferenceVector = await this.buildUserPreferenceVector(
        userProfile,
        options.namespace || 'products',
      );

      let filter = 'type == "product"';

      // Apply user preferences
      if (userProfile.preferences?.categories?.length) {
        const categoryFilter = userProfile.preferences.categories
          .map(cat => `category == "${cat}"`)
          .join(' OR ');
        filter += ` AND (${categoryFilter})`;
      }

      if (userProfile.preferences?.priceRange) {
        const { min, max } = userProfile.preferences.priceRange;
        filter += ` AND price >= ${min} AND price <= ${max}`;
      }

      // Exclude already purchased items
      const excludeIds = [
        ...(userProfile.purchaseHistory || []),
        ...(userProfile.browsingHistory || []).slice(-10), // Only recent browsing
      ];

      if (excludeIds.length > 0) {
        const excludeFilter = excludeIds.map(id => `documentId != "${id}"`).join(' AND ');
        filter += ` AND ${excludeFilter}`;
      }

      const results = await this.client.similaritySearch(preferenceVector, {
        topK: Math.min((options.topK || 10) * 2, 50), // Get more for diversity
        filter,
        namespace: options.namespace || 'products',
      });

      // Apply diversity if requested
      const finalResults =
        options.diversityFactor && options.diversityFactor > 0
          ? this.applyProductDiversity(results, options.diversityFactor)
          : results;

      return {
        success: true,
        data: finalResults.slice(0, options.topK || 10),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Build rich text representation of product
   */
  private buildProductText(product: {
    title: string;
    description: string;
    category: string;
    brand?: string;
    features?: string[];
    tags?: string[];
    specifications?: Record<string, any>;
  }): string {
    let text = `${product.title}\n\n${product.description}\n\n`;

    text += `Category: ${product.category}\n`;

    if (product.brand) {
      text += `Brand: ${product.brand}\n`;
    }

    if (product.features?.length) {
      text += `Features: ${product.features.join(', ')}\n`;
    }

    if (product.tags?.length) {
      text += `Tags: ${product.tags.join(', ')}\n`;
    }

    if (product.specifications) {
      text += `Specifications:\n`;
      for (const [key, value] of Object.entries(product.specifications)) {
        text += `- ${key}: ${value}\n`;
      }
    }

    return text;
  }

  /**
   * Build user preference vector from history
   */
  private async buildUserPreferenceVector(
    userProfile: {
      purchaseHistory?: string[];
      browsingHistory?: string[];
    },
    namespace: string,
  ): Promise<number[]> {
    const vectors: Array<{ vector: number[]; weight: number }> = [];

    // Purchase history has higher weight
    if (userProfile.purchaseHistory?.length) {
      for (const productId of userProfile.purchaseHistory.slice(-20)) {
        // Last 20 purchases
        try {
          const chunks = await this.client.fetch([productId], namespace);
          if (chunks.length > 0) {
            vectors.push({ vector: chunks[0].vector, weight: 3.0 });
          }
        } catch (error) {
          console.warn(`Failed to fetch vector for purchased product ${productId}:`, error);
        }
      }
    }

    // Browsing history has lower weight
    if (userProfile.browsingHistory?.length) {
      for (const productId of userProfile.browsingHistory.slice(-30)) {
        // Last 30 viewed
        try {
          const chunks = await this.client.fetch([productId], namespace);
          if (chunks.length > 0) {
            vectors.push({ vector: chunks[0].vector, weight: 1.0 });
          }
        } catch (error) {
          console.warn(`Failed to fetch vector for browsed product ${productId}:`, error);
        }
      }
    }

    if (vectors.length === 0) {
      throw new Error('No valid vectors found in user profile');
    }

    // Calculate weighted average
    const dimensions = vectors[0].vector.length;
    const result = new Array(dimensions).fill(0);
    let totalWeight = 0;

    for (const { vector, weight } of vectors) {
      totalWeight += weight;
      for (let i = 0; i < dimensions; i++) {
        result[i] += vector[i] * weight;
      }
    }

    // Normalize
    for (let i = 0; i < dimensions; i++) {
      result[i] /= totalWeight;
    }

    return result;
  }

  /**
   * Apply diversity to product recommendations
   */
  private applyProductDiversity(
    results: SimilarityResult[],
    diversityFactor: number,
  ): SimilarityResult[] {
    const diversified: SimilarityResult[] = [];
    const usedCategories = new Map<string, number>();
    const maxPerCategory = Math.max(1, Math.floor(results.length * diversityFactor));

    for (const result of results) {
      const category = result.metadata?.category || 'uncategorized';
      const categoryCount = usedCategories.get(category) || 0;

      if (categoryCount < maxPerCategory) {
        diversified.push(result);
        usedCategories.set(category, categoryCount + 1);
      }

      if (diversified.length >= results.length) break;
    }

    return diversified;
  }
}

/**
 * Search and analytics operations
 */
export class SearchAnalyticsOperations {
  constructor(private client: UpstashVectorClient) {}

  /**
   * Track search queries and results
   */
  async trackSearch(data: {
    query: string;
    results: SimilarityResult[];
    userId?: string;
    sessionId?: string;
    clickedResults?: string[];
    namespace?: string;
  }): Promise<VectorResult<void>> {
    try {
      // Store search analytics (in a real implementation, this might go to a separate analytics store)
      const searchData = {
        query: data.query,
        resultCount: data.results.length,
        topScore: data.results[0]?.score || 0,
        userId: data.userId,
        sessionId: data.sessionId,
        clickedResults: data.clickedResults || [],
        timestamp: new Date().toISOString(),
        namespace: data.namespace,
      };

      // In a real implementation, you'd store this in a separate analytics system
      console.log('Search tracked:', searchData);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularQueries(
    options: {
      timeRange?: { from: Date; to: Date };
      limit?: number;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<Array<{ query: string; frequency: number }>>> {
    try {
      // This would typically query an analytics database
      // For now, return mock data
      const mockQueries = [
        { query: 'machine learning', frequency: 45 },
        { query: 'react components', frequency: 32 },
        { query: 'database optimization', frequency: 28 },
        { query: 'api design', frequency: 21 },
        { query: 'user authentication', frequency: 19 },
      ];

      return {
        success: true,
        data: mockQueries.slice(0, options.limit || 10),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Analyze search quality and suggest improvements
   */
  async analyzeSearchQuality(
    options: {
      timeRange?: { from: Date; to: Date };
      namespace?: string;
    } = {},
  ): Promise<
    VectorResult<{
      averageScore: number;
      zeroResultQueries: number;
      lowScoreQueries: number;
      suggestions: string[];
    }>
  > {
    try {
      // Mock analytics data
      const analysis = {
        averageScore: 0.72,
        zeroResultQueries: 5,
        lowScoreQueries: 12,
        suggestions: [
          'Consider expanding the knowledge base with more content',
          'Review queries with zero results for missing content areas',
          'Implement query expansion for better matching',
          'Add synonyms and alternative terms to improve recall',
        ],
      };

      return { success: true, data: analysis };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

/**
 * Combined operations factory
 */
export function createVectorOperations(client: UpstashVectorClient) {
  return {
    content: new ContentSimilarityOperations(client),
    code: new CodeSimilarityOperations(client),
    products: new ProductSimilarityOperations(client),
    analytics: new SearchAnalyticsOperations(client),
  };
}

/**
 * Utility functions for vector operations
 */
export const vectorOperationUtils = {
  /**
   * Calculate semantic similarity between two texts
   */
  async calculateSimilarity(
    client: UpstashVectorClient,
    text1: string,
    text2: string,
    provider: AIProvider = 'openai',
  ): Promise<VectorResult<number>> {
    try {
      const [embedding1, embedding2] = await Promise.all([
        client.generateEmbedding(text1, provider),
        client.generateEmbedding(text2, provider),
      ]);

      const similarity = this.cosineSimilarity(embedding1.embeddings[0], embedding2.embeddings[0]);

      return { success: true, data: similarity };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  },

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  /**
   * Batch process documents with progress tracking
   */
  async batchProcessDocuments<T>(
    items: T[],
    processor: (item: T, index: number) => Promise<void>,
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
      onError?: (error: Error, item: T, index: number) => void;
    } = {},
  ): Promise<VectorResult<void>> {
    const { batchSize = 10, onProgress, onError } = options;
    let completed = 0;

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map((item, batchIndex) =>
          processor(item, i + batchIndex).catch(error => {
            if (onError) {
              onError(error as Error, item, i + batchIndex);
            } else {
              throw error;
            }
          }),
        );

        await Promise.all(batchPromises);
        completed += batch.length;

        if (onProgress) {
          onProgress(completed, items.length);
        }
      }

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  },
};
