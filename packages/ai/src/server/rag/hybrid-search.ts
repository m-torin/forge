/**
 * Hybrid Search for AI SDK v5 RAG
 * Combines vector similarity search with keyword/lexical search for better results
 */

import { logInfo } from '@repo/observability/server/next';
import type { RAGDatabaseBridge } from './database-bridge';
import { ragRetry } from './retry-strategies';

/**
 * Search result with combined scoring
 */
export interface HybridSearchResult {
  id: string | number;
  content: string;
  metadata?: Record<string, any>;

  // Scoring breakdown
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;

  // Match information
  keywordMatches: string[];
  vectorSimilarity: number;

  // Ranking information
  rank: number;
  rankingMethod: 'vector' | 'keyword' | 'hybrid';
}

/**
 * Hybrid search configuration
 */
export interface HybridSearchConfig {
  // Weighting (should sum to 1.0)
  vectorWeight?: number;
  keywordWeight?: number;

  // Search parameters
  vectorTopK?: number;
  keywordTopK?: number;
  finalTopK?: number;

  // Thresholds
  vectorThreshold?: number;
  keywordThreshold?: number;

  // Keyword search options
  caseSensitive?: boolean;
  stemming?: boolean;
  fuzzyMatch?: boolean;
  phraseBoost?: number;

  // Fusion method
  fusionMethod?: 'rrf' | 'weighted' | 'max' | 'product';

  // Boost factors
  titleBoost?: number;
  recencyBoost?: boolean;
  lengthPenalty?: boolean;
}

/**
 * Hybrid search engine combining vector and keyword search
 */
export class HybridSearchEngine {
  private config: Required<HybridSearchConfig>;

  constructor(
    private vectorStore: RAGDatabaseBridge,
    config: HybridSearchConfig = {},
  ) {
    // Set defaults
    this.config = {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      vectorTopK: 20,
      keywordTopK: 20,
      finalTopK: 10,
      vectorThreshold: 0.0,
      keywordThreshold: 0.0,
      caseSensitive: false,
      stemming: true,
      fuzzyMatch: false,
      phraseBoost: 1.2,
      fusionMethod: 'rrf',
      titleBoost: 1.5,
      recencyBoost: false,
      lengthPenalty: false,
      ...config,
    };

    // Validate weights
    const totalWeight = this.config.vectorWeight + this.config.keywordWeight;
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error(`Search weights must sum to 1.0, got ${totalWeight}`);
    }
  }

  /**
   * Perform hybrid search combining vector and keyword results
   */
  async search(
    query: string,
    options?: {
      filters?: Record<string, any>;
      boostFields?: string[];
      customWeights?: { vector: number; keyword: number };
    },
  ): Promise<HybridSearchResult[]> {
    const startTime = Date.now();

    logInfo('Starting hybrid search', {
      operation: 'hybrid_search',
      query: query.substring(0, 100),
      fusionMethod: this.config.fusionMethod,
      vectorWeight: this.config.vectorWeight,
      keywordWeight: this.config.keywordWeight,
    });

    try {
      // Execute both searches in parallel
      const [vectorResults, keywordResults] = await Promise.all([
        this.performVectorSearch(query, options?.filters),
        this.performKeywordSearch(query, options?.filters),
      ]);

      // Fuse the results
      const keywordResultsWithMatches = keywordResults.map(result => ({
        ...result,
        matches: [],
      }));

      const hybridResults = this.fuseResults(
        vectorResults,
        keywordResultsWithMatches,
        query,
        options?.customWeights,
      );

      // Apply additional ranking factors
      const rankedResults = this.applyRankingFactors(hybridResults, options?.boostFields);

      // Sort and limit final results
      const finalResults = rankedResults
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, this.config.finalTopK)
        .map((result, index) => ({
          ...result,
          rank: index + 1,
        }));

      const searchTime = Date.now() - startTime;
      logInfo('Hybrid search completed', {
        operation: 'hybrid_search_completed',
        query: query.substring(0, 100),
        vectorResults: vectorResults.length,
        keywordResults: keywordResults.length,
        finalResults: finalResults.length,
        searchTime,
      });

      return finalResults;
    } catch (error) {
      const searchTime = Date.now() - startTime;
      logInfo('Hybrid search failed', {
        operation: 'hybrid_search_failed',
        query: query.substring(0, 100),
        error: error instanceof Error ? error.message : String(error),
        searchTime,
      });
      throw error;
    }
  }

  /**
   * Perform vector similarity search
   */
  private async performVectorSearch(
    query: string,
    filters?: Record<string, any>,
  ): Promise<Array<{ id: string | number; content: string; score: number; metadata?: any }>> {
    try {
      const results = await ragRetry.vector(
        async () =>
          await this.vectorStore.queryDocuments(query, {
            topK: this.config.vectorTopK,
            threshold: this.config.vectorThreshold,
            includeContent: true,
          }),
      );

      return results.map(result => ({
        id: result.id,
        content: result.content || '',
        score: result.score,
        metadata: result.metadata,
      }));
    } catch (error) {
      logInfo('Vector search failed in hybrid search', {
        operation: 'hybrid_vector_search_failed',
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Perform keyword/lexical search
   */
  private async performKeywordSearch(
    query: string,
    filters?: Record<string, any>,
  ): Promise<Array<{ id: string | number; content: string; score: number; metadata?: any }>> {
    try {
      // This is a simplified keyword search implementation
      // In production, you might use Elasticsearch, PostgreSQL full-text search, etc.
      const allDocuments = await this.getAllDocuments(filters);
      const keywordResults = this.scoreKeywordMatches(query, allDocuments);

      return keywordResults
        .filter(result => result.score >= this.config.keywordThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.keywordTopK);
    } catch (error) {
      logInfo('Keyword search failed in hybrid search', {
        operation: 'hybrid_keyword_search_failed',
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get all documents for keyword search
   */
  private async getAllDocuments(
    filters?: Record<string, any>,
  ): Promise<Array<{ id: string | number; content: string; metadata?: any }>> {
    try {
      // Use the database bridge to get all documents for keyword search
      const documents = await this.vectorStore.listAllDocuments({
        limit: this.config.keywordTopK * 2, // Get more documents for better keyword search
        filters,
      });

      return documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata,
      }));
    } catch (error) {
      logInfo('Failed to get all documents for keyword search', {
        operation: 'hybrid_get_all_documents_failed',
        error: error instanceof Error ? error.message : String(error),
      });

      // Return empty array on error to prevent hybrid search from failing
      return [];
    }
  }

  /**
   * Score documents based on keyword matches
   */
  private scoreKeywordMatches(
    query: string,
    documents: Array<{ id: string | number; content: string; metadata?: any }>,
  ): Array<{
    id: string | number;
    content: string;
    score: number;
    metadata?: any;
    matches: string[];
  }> {
    const queryTerms = this.tokenizeQuery(query);
    const results: Array<{
      id: string | number;
      content: string;
      score: number;
      metadata?: any;
      matches: string[];
    }> = [];

    for (const doc of documents) {
      const score = this.calculateKeywordScore(queryTerms, doc.content, doc.metadata);
      const matches = this.findMatches(queryTerms, doc.content);

      if (score > 0) {
        results.push({
          id: doc.id,
          content: doc.content,
          score,
          metadata: doc.metadata,
          matches,
        });
      }
    }

    return results;
  }

  /**
   * Tokenize query into search terms
   */
  private tokenizeQuery(query: string): string[] {
    let terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);

    // Apply stemming if enabled
    if (this.config.stemming) {
      terms = terms.map(term => this.stem(term));
    }

    return terms;
  }

  /**
   * Calculate keyword-based score for a document
   */
  private calculateKeywordScore(queryTerms: string[], content: string, metadata?: any): number {
    const normalizedContent = this.config.caseSensitive ? content : content.toLowerCase();
    const words = normalizedContent.split(/\s+/);

    let score = 0;
    const termFrequencies = new Map<string, number>();

    // Calculate term frequencies
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      const stemmedWord = this.config.stemming ? this.stem(cleanWord) : cleanWord;
      termFrequencies.set(stemmedWord, (termFrequencies.get(stemmedWord) || 0) + 1);
    }

    // Score based on term matches
    for (const term of queryTerms) {
      const tf = termFrequencies.get(term) || 0;
      if (tf > 0) {
        // TF-IDF-like scoring
        score += Math.log(1 + tf) * this.getTermWeight(term);
      }
    }

    // Phrase matching bonus
    if (this.config.phraseBoost > 1) {
      const phraseMatches = this.countPhraseMatches(queryTerms, normalizedContent);
      score *= 1 + phraseMatches * (this.config.phraseBoost - 1);
    }

    // Title boost
    if (this.config.titleBoost > 1 && metadata?.title) {
      const titleMatches = this.countMatches(queryTerms, metadata.title.toLowerCase());
      score *= 1 + titleMatches * (this.config.titleBoost - 1);
    }

    // Length normalization
    if (this.config.lengthPenalty) {
      score = score / Math.log(1 + words.length);
    }

    return score;
  }

  /**
   * Find matching terms in content
   */
  private findMatches(queryTerms: string[], content: string): string[] {
    const normalizedContent = this.config.caseSensitive ? content : content.toLowerCase();
    const matches: string[] = [];

    for (const term of queryTerms) {
      if (normalizedContent.includes(term)) {
        matches.push(term);
      }
    }

    return matches;
  }

  /**
   * Simple stemmer (basic implementation)
   */
  private stem(word: string): string {
    // Very basic stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's'];

    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }

    return word;
  }

  /**
   * Get term weight (inverse document frequency approximation)
   */
  private getTermWeight(term: string): number {
    // Simplified: common words get lower weights
    const commonWords = new Set([
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ]);
    return commonWords.has(term) ? 0.5 : 1.0;
  }

  /**
   * Count phrase matches in content
   */
  private countPhraseMatches(queryTerms: string[], content: string): number {
    if (queryTerms.length < 2) return 0;

    const phrase = queryTerms.join(' ');
    const matches = content.split(phrase).length - 1;
    return matches;
  }

  /**
   * Count individual term matches
   */
  private countMatches(queryTerms: string[], text: string): number {
    let matches = 0;
    for (const term of queryTerms) {
      if (text.includes(term)) {
        matches++;
      }
    }
    return matches;
  }

  /**
   * Fuse vector and keyword search results
   */
  private fuseResults(
    vectorResults: Array<{ id: string | number; content: string; score: number; metadata?: any }>,
    keywordResults: Array<{
      id: string | number;
      content: string;
      score: number;
      metadata?: any;
      matches: string[];
    }>,
    query: string,
    customWeights?: { vector: number; keyword: number },
  ): HybridSearchResult[] {
    const weights = customWeights || {
      vector: this.config.vectorWeight,
      keyword: this.config.keywordWeight,
    };

    // Create a map of all unique results
    const resultMap = new Map<string | number, HybridSearchResult>();

    // Process vector results
    vectorResults.forEach((result, index) => {
      const id = result.id;
      const vectorScore = result.score;
      const keywordMatches: string[] = [];

      resultMap.set(id, {
        id,
        content: result.content,
        metadata: result.metadata,
        vectorScore,
        keywordScore: 0,
        hybridScore: 0,
        keywordMatches,
        vectorSimilarity: vectorScore,
        rank: 0,
        rankingMethod: 'vector',
      });
    });

    // Process keyword results
    keywordResults.forEach((result, index) => {
      const id = result.id;
      const keywordScore = result.score;
      const keywordMatches = result.matches || [];

      if (resultMap.has(id)) {
        // Update existing result
        const existing = resultMap.get(id)!;
        existing.keywordScore = keywordScore;
        existing.keywordMatches = keywordMatches;
        existing.rankingMethod = 'hybrid';
      } else {
        // Add new result
        resultMap.set(id, {
          id,
          content: result.content,
          metadata: result.metadata,
          vectorScore: 0,
          keywordScore,
          hybridScore: 0,
          keywordMatches,
          vectorSimilarity: 0,
          rank: 0,
          rankingMethod: 'keyword',
        });
      }
    });

    // Calculate hybrid scores
    const results = Array.from(resultMap.values());

    results.forEach(result => {
      switch (this.config.fusionMethod) {
        case 'weighted':
          result.hybridScore =
            result.vectorScore * weights.vector + result.keywordScore * weights.keyword;
          break;

        case 'rrf': // Reciprocal Rank Fusion
          const vectorRank = this.getRank(result.id, vectorResults);
          const keywordRank = this.getRank(result.id, keywordResults);
          result.hybridScore = 1 / (60 + vectorRank) + 1 / (60 + keywordRank);
          break;

        case 'max':
          result.hybridScore = Math.max(
            result.vectorScore * weights.vector,
            result.keywordScore * weights.keyword,
          );
          break;

        case 'product':
          result.hybridScore = Math.sqrt(
            result.vectorScore * weights.vector * result.keywordScore * weights.keyword,
          );
          break;
      }
    });

    return results;
  }

  /**
   * Get rank of result in a result list
   */
  private getRank(
    id: string | number,
    results: Array<{ id: string | number; score: number }>,
  ): number {
    const index = results.findIndex(result => result.id === id);
    return index === -1 ? results.length + 1 : index + 1;
  }

  /**
   * Apply additional ranking factors
   */
  private applyRankingFactors(
    results: HybridSearchResult[],
    boostFields?: string[],
  ): HybridSearchResult[] {
    return results.map(result => {
      let boost = 1.0;

      // Recency boost
      if (this.config.recencyBoost && result.metadata?.timestamp) {
        const age = Date.now() - new Date(result.metadata.timestamp).getTime();
        const daysSinceEpoch = age / (1000 * 60 * 60 * 24);
        boost *= Math.exp(-daysSinceEpoch / 365); // Exponential decay over a year
      }

      // Custom field boosts
      if (boostFields && result.metadata) {
        for (const field of boostFields) {
          if (result.metadata[field]) {
            boost *= 1.2; // 20% boost per matching field
          }
        }
      }

      return {
        ...result,
        hybridScore: result.hybridScore * boost,
      };
    });
  }
}

/**
 * Factory function for creating hybrid search engine
 */
export function createHybridSearch(
  vectorStore: RAGDatabaseBridge,
  config?: HybridSearchConfig,
): HybridSearchEngine {
  return new HybridSearchEngine(vectorStore, config);
}

/**
 * Preset configurations for different use cases
 */
export const hybridSearchPresets: Record<string, HybridSearchConfig> = {
  // Balanced approach for general content
  balanced: {
    vectorWeight: 0.6,
    keywordWeight: 0.4,
    fusionMethod: 'rrf',
    phraseBoost: 1.3,
    titleBoost: 1.5,
  },

  // Vector-heavy for semantic understanding
  semantic: {
    vectorWeight: 0.8,
    keywordWeight: 0.2,
    fusionMethod: 'weighted',
    phraseBoost: 1.1,
    titleBoost: 1.3,
  },

  // Keyword-heavy for exact matches
  precise: {
    vectorWeight: 0.3,
    keywordWeight: 0.7,
    fusionMethod: 'weighted',
    phraseBoost: 1.5,
    titleBoost: 2.0,
    caseSensitive: false,
    stemming: true,
  },

  // Comprehensive search with all features
  comprehensive: {
    vectorWeight: 0.5,
    keywordWeight: 0.5,
    fusionMethod: 'rrf',
    phraseBoost: 1.4,
    titleBoost: 1.6,
    recencyBoost: true,
    lengthPenalty: true,
    fuzzyMatch: true,
  },
};
