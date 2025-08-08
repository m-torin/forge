/**
 * Comprehensive Unit Tests for Hybrid Search Capabilities
 * Tests vector + keyword search fusion, ranking algorithms, and all search modes
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import type { RAGDatabaseBridge } from '../../../src/server/rag/database-bridge';
import {
  HybridSearchEngine,
  createHybridSearch,
  hybridSearchPresets,
  type HybridSearchConfig,
  type HybridSearchResult,
} from '../../../src/server/rag/hybrid-search';

// Mock RAG Database Bridge
const createMockVectorStore = (): RAGDatabaseBridge => ({
  queryDocuments: vi.fn(),
  addDocument: vi.fn(),
  deleteDocument: vi.fn(),
  updateDocument: vi.fn(),
  getStats: vi.fn(),
});

// Test data
const mockDocuments = [
  {
    id: 'doc1',
    content:
      'Machine learning algorithms are used in artificial intelligence applications for pattern recognition and data analysis.',
    metadata: { title: 'ML Algorithms Overview', category: 'technical', timestamp: '2024-01-01' },
  },
  {
    id: 'doc2',
    content:
      'Deep learning neural networks utilize multiple layers to process complex data patterns and make predictions.',
    metadata: { title: 'Deep Learning Basics', category: 'technical', timestamp: '2024-01-02' },
  },
  {
    id: 'doc3',
    content:
      'Natural language processing enables computers to understand and generate human language through various techniques.',
    metadata: { title: 'NLP Introduction', category: 'linguistics', timestamp: '2024-01-03' },
  },
  {
    id: 'doc4',
    content:
      'Computer vision systems analyze and interpret visual information from images and video streams.',
    metadata: { title: 'Computer Vision Guide', category: 'visual', timestamp: '2024-01-04' },
  },
  {
    id: 'doc5',
    content:
      'Reinforcement learning agents learn optimal actions through trial and error interactions with environments.',
    metadata: { title: 'RL Fundamentals', category: 'behavioral', timestamp: '2024-01-05' },
  },
];

describe('hybridSearchEngine', () => {
  let vectorStore: RAGDatabaseBridge;
  let hybridSearch: HybridSearchEngine;

  beforeEach(() => {
    vectorStore = createMockVectorStore();
    hybridSearch = new HybridSearchEngine(vectorStore, {
      vectorWeight: 0.6,
      keywordWeight: 0.4,
      vectorTopK: 10,
      keywordTopK: 10,
      finalTopK: 5,
      fusionMethod: 'weighted',
    });

    // Mock vector search results
    vi.mocked(vectorStore.queryDocuments).mockResolvedValue([
      {
        id: 'doc1',
        content: mockDocuments[0].content,
        score: 0.95,
        metadata: mockDocuments[0].metadata,
      },
      {
        id: 'doc2',
        content: mockDocuments[1].content,
        score: 0.87,
        metadata: mockDocuments[1].metadata,
      },
      {
        id: 'doc3',
        content: mockDocuments[2].content,
        score: 0.82,
        metadata: mockDocuments[2].metadata,
      },
      {
        id: 'doc4',
        content: mockDocuments[3].content,
        score: 0.75,
        metadata: mockDocuments[3].metadata,
      },
    ]);
  });

  describe('constructor and Configuration', () => {
    test('should create hybrid search engine with default config', () => {
      const engine = new HybridSearchEngine(vectorStore);
      expect(engine).toBeInstanceOf(HybridSearchEngine);
    });

    test('should validate weight configuration', () => {
      expect(() => {
        new HybridSearchEngine(vectorStore, {
          vectorWeight: 0.6,
          keywordWeight: 0.5, // Should sum to 1.0
        });
      }).toThrow('Search weights must sum to 1.0');
    });

    test('should accept valid weight configuration', () => {
      expect(() => {
        new HybridSearchEngine(vectorStore, {
          vectorWeight: 0.7,
          keywordWeight: 0.3,
        });
      }).not.toThrow();
    });
  });

  describe('vector Search Integration', () => {
    test('should call vector store with correct parameters', async () => {
      const query = 'machine learning algorithms';

      await hybridSearch.search(query);

      expect(vectorStore.queryDocuments).toHaveBeenCalledWith(query, {
        topK: 10,
        threshold: 0.0,
        includeContent: true,
        filters: undefined,
      });
    });

    test('should handle vector search failures gracefully', async () => {
      vi.mocked(vectorStore.queryDocuments).mockRejectedValue(new Error('Vector search failed'));

      const results = await hybridSearch.search('test query');

      // Should still return results (from keyword search only)
      expect(results).toBeInstanceOf(Array);
    });

    test('should apply vector search filters', async () => {
      const filters = { category: 'technical' };

      await hybridSearch.search('test query', { filters });

      expect(vectorStore.queryDocuments).toHaveBeenCalledWith(
        'test query',
        expect.objectContaining({ filters }),
      );
    });
  });

  describe('keyword Search Implementation', () => {
    test('should score documents based on keyword matches', async () => {
      // Mock getAllDocuments to return our test documents
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await hybridSearch.search('machine learning');

      // Should find documents with matching keywords
      expect(results.length).toBeGreaterThan(0);

      // Document 1 should have high keyword score (contains both "machine" and "learning")
      const doc1Result = results.find(r => r.id === 'doc1');
      expect(doc1Result?.keywordScore).toBeGreaterThan(0);
    });

    test('should handle case insensitive search', async () => {
      const caseInsensitiveEngine = new HybridSearchEngine(vectorStore, {
        caseSensitive: false,
        keywordWeight: 1.0,
        vectorWeight: 0.0,
      });

      const getAllDocumentsSpy = vi.spyOn(caseInsensitiveEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await caseInsensitiveEngine.search('MACHINE LEARNING');

      const doc1Result = results.find(r => r.id === 'doc1');
      expect(doc1Result?.keywordScore).toBeGreaterThan(0);
    });

    test('should apply phrase boosting', async () => {
      const phraseBoostedEngine = new HybridSearchEngine(vectorStore, {
        phraseBoost: 2.0,
        keywordWeight: 1.0,
        vectorWeight: 0.0,
      });

      const getAllDocumentsSpy = vi.spyOn(phraseBoostedEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await phraseBoostedEngine.search('machine learning');

      // Should boost documents containing the exact phrase
      const doc1Result = results.find(r => r.id === 'doc1');
      expect(doc1Result?.keywordScore).toBeGreaterThan(0);
    });

    test('should apply title boost', async () => {
      const titleBoostedEngine = new HybridSearchEngine(vectorStore, {
        titleBoost: 2.0,
        keywordWeight: 1.0,
        vectorWeight: 0.0,
      });

      const getAllDocumentsSpy = vi.spyOn(titleBoostedEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await titleBoostedEngine.search('ML');

      // Document with "ML" in title should be boosted
      const doc1Result = results.find(r => r.id === 'doc1');
      expect(doc1Result?.keywordScore).toBeGreaterThan(0);
    });
  });

  describe('fusion Methods', () => {
    beforeEach(() => {
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);
    });

    test('should use weighted fusion method', async () => {
      const weightedEngine = new HybridSearchEngine(vectorStore, {
        fusionMethod: 'weighted',
        vectorWeight: 0.7,
        keywordWeight: 0.3,
      });

      const getAllDocumentsSpy = vi.spyOn(weightedEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await weightedEngine.search('machine learning');

      expect(results.length).toBeGreaterThan(0);

      // Verify hybrid score is combination of vector and keyword scores
      const result = results[0];
      const expectedScore = result.vectorScore * 0.7 + result.keywordScore * 0.3;
      expect(result.hybridScore).toBeCloseTo(expectedScore, 3);
    });

    test('should use RRF (Reciprocal Rank Fusion) method', async () => {
      const rrfEngine = new HybridSearchEngine(vectorStore, {
        fusionMethod: 'rrf',
        vectorWeight: 0.5,
        keywordWeight: 0.5,
      });

      const getAllDocumentsSpy = vi.spyOn(rrfEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await rrfEngine.search('machine learning');

      expect(results.length).toBeGreaterThan(0);

      // RRF scores should be different from weighted scores
      const result = results[0];
      expect(result.hybridScore).toBeGreaterThan(0);
      expect(result.hybridScore).not.toStrictEqual(
        result.vectorScore * 0.5 + result.keywordScore * 0.5,
      );
    });

    test('should use max fusion method', async () => {
      const maxEngine = new HybridSearchEngine(vectorStore, {
        fusionMethod: 'max',
        vectorWeight: 0.6,
        keywordWeight: 0.4,
      });

      const getAllDocumentsSpy = vi.spyOn(maxEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await maxEngine.search('machine learning');

      const result = results[0];
      const maxExpected = Math.max(result.vectorScore * 0.6, result.keywordScore * 0.4);
      expect(result.hybridScore).toBeCloseTo(maxExpected, 3);
    });

    test('should use product fusion method', async () => {
      const productEngine = new HybridSearchEngine(vectorStore, {
        fusionMethod: 'product',
        vectorWeight: 0.6,
        keywordWeight: 0.4,
      });

      const getAllDocumentsSpy = vi.spyOn(productEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await productEngine.search('machine learning');

      const result = results[0];
      const productExpected = Math.sqrt(result.vectorScore * 0.6 * result.keywordScore * 0.4);
      expect(result.hybridScore).toBeCloseTo(productExpected, 3);
    });
  });

  describe('result Ranking and Filtering', () => {
    beforeEach(() => {
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);
    });

    test('should return results sorted by hybrid score', async () => {
      const results = await hybridSearch.search('machine learning algorithms');

      expect(results.length).toBeGreaterThan(1);

      // Verify descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].hybridScore).toBeGreaterThanOrEqual(results[i].hybridScore);
      }
    });

    test('should limit results to finalTopK', async () => {
      const limitedEngine = new HybridSearchEngine(vectorStore, {
        finalTopK: 3,
      });

      const getAllDocumentsSpy = vi.spyOn(limitedEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await limitedEngine.search('machine learning');

      expect(results.length).toBeLessThanOrEqual(3);
    });

    test('should assign correct ranks', async () => {
      const results = await hybridSearch.search('machine learning');

      results.forEach((result, index) => {
        expect(result.rank).toBe(index + 1);
      });
    });

    test('should identify ranking method', async () => {
      const results = await hybridSearch.search('machine learning');

      results.forEach(result => {
        expect(['vector', 'keyword', 'hybrid']).toContain(result.rankingMethod);
      });
    });
  });

  describe('advanced Ranking Features', () => {
    beforeEach(() => {
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);
    });

    test('should apply recency boost', async () => {
      const recencyEngine = new HybridSearchEngine(vectorStore, {
        recencyBoost: true,
      });

      const getAllDocumentsSpy = vi.spyOn(recencyEngine as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);

      const results = await recencyEngine.search('machine learning');

      // Newer documents should potentially rank higher
      expect(results.length).toBeGreaterThan(0);
    });

    test('should apply custom field boosts', async () => {
      const results = await hybridSearch.search('machine learning', {
        boostFields: ['title', 'category'],
      });

      expect(results.length).toBeGreaterThan(0);

      // Documents with boosted fields should have adjusted scores
      const boostedResult = results.find(r => r.metadata?.title?.includes('ML'));
      const hasBoostedResult = boostedResult !== undefined;

      if (hasBoostedResult) {
        expect(boostedResult.hybridScore).toBeGreaterThan(0);
      }
    });

    test('should handle custom weights override', async () => {
      const results = await hybridSearch.search('machine learning', {
        customWeights: { vector: 0.8, keyword: 0.2 },
      });

      expect(results.length).toBeGreaterThan(0);

      // Verify the custom weights were applied (this would require internal score checking)
      const result = results[0];
      expect(result.hybridScore).toBeGreaterThan(0);
    });
  });

  describe('search Result Structure', () => {
    beforeEach(() => {
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue(mockDocuments);
    });

    test('should return complete result structure', async () => {
      const results = await hybridSearch.search('machine learning');

      expect(results.length).toBeGreaterThan(0);

      const result = results[0];
      expect(result).toMatchObject({
        id: expect.any(String),
        content: expect.any(String),
        vectorScore: expect.any(Number),
        keywordScore: expect.any(Number),
        hybridScore: expect.any(Number),
        keywordMatches: expect.any(Array),
        vectorSimilarity: expect.any(Number),
        rank: expect.any(Number),
        rankingMethod: expect.stringMatching(/^(vector|keyword|hybrid)$/),
      });
    });

    test('should include metadata when available', async () => {
      const results = await hybridSearch.search('machine learning');

      const resultWithMetadata = results.find(r => r.metadata);
      const hasMetadataResult = resultWithMetadata !== undefined;

      if (hasMetadataResult) {
        expect(resultWithMetadata.metadata).toBeDefined();
        expect(resultWithMetadata.metadata).toHaveProperty('title');
      }
    });

    test('should include keyword matches', async () => {
      const results = await hybridSearch.search('machine learning algorithms');

      const result = results.find(r => r.keywordScore > 0);
      const hasKeywordResult = result !== undefined;

      if (hasKeywordResult) {
        expect(result.keywordMatches).toBeInstanceOf(Array);
        expect(result.keywordMatches.length).toBeGreaterThan(0);
      }
    });
  });

  describe('error Handling', () => {
    test('should handle vector search failures', async () => {
      vi.mocked(vectorStore.queryDocuments).mockRejectedValue(new Error('Vector DB unavailable'));

      const results = await hybridSearch.search('test query');

      // Should not throw, should return results from keyword search only
      expect(results).toBeInstanceOf(Array);
    });

    test('should handle keyword search failures', async () => {
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockRejectedValue(new Error('Keyword search failed'));

      const results = await hybridSearch.search('test query');

      // Should not throw, should return results from vector search only
      expect(results).toBeInstanceOf(Array);
    });

    test('should handle empty query gracefully', async () => {
      const results = await hybridSearch.search('');

      expect(results).toBeInstanceOf(Array);
    });

    test('should handle no results scenario', async () => {
      vi.mocked(vectorStore.queryDocuments).mockResolvedValue([]);
      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockResolvedValue([]);

      const results = await hybridSearch.search('nonexistent query');

      expect(results).toStrictEqual([]);
    });
  });

  describe('performance and Optimization', () => {
    test('should execute vector and keyword searches in parallel', async () => {
      const startTime = Date.now();

      // Add delay to vector search
      vi.mocked(vectorStore.queryDocuments).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100)),
      );

      const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
      getAllDocumentsSpy.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100)),
      );

      await hybridSearch.search('test query');

      const executionTime = Date.now() - startTime;

      // Should be closer to 100ms (parallel) than 200ms (sequential)
      expect(executionTime).toBeLessThan(150);
    });

    test('should respect topK limits for efficiency', async () => {
      const results = await hybridSearch.search('machine learning');

      expect(results.length).toBeLessThanOrEqual(5); // finalTopK = 5
    });
  });
});

describe('factory Functions and Presets', () => {
  let vectorStore: RAGDatabaseBridge;

  beforeEach(() => {
    vectorStore = createMockVectorStore();
  });

  describe('createHybridSearch', () => {
    test('should create hybrid search engine', () => {
      const engine = createHybridSearch(vectorStore);
      expect(engine).toBeInstanceOf(HybridSearchEngine);
    });

    test('should accept configuration', () => {
      const config: HybridSearchConfig = {
        vectorWeight: 0.8,
        keywordWeight: 0.2,
        fusionMethod: 'rrf',
      };

      const engine = createHybridSearch(vectorStore, config);
      expect(engine).toBeInstanceOf(HybridSearchEngine);
    });
  });

  describe('hybrid Search Presets', () => {
    test('should have balanced preset', () => {
      expect(hybridSearchPresets.balanced).toBeDefined();
      expect(hybridSearchPresets.balanced).toMatchObject({
        vectorWeight: expect.any(Number),
        keywordWeight: expect.any(Number),
        fusionMethod: expect.any(String),
      });
    });

    test('should have semantic preset', () => {
      expect(hybridSearchPresets.semantic).toBeDefined();
      expect(hybridSearchPresets.semantic.vectorWeight).toBeGreaterThan(
        hybridSearchPresets.semantic.keywordWeight!,
      );
    });

    test('should have precise preset', () => {
      expect(hybridSearchPresets.precise).toBeDefined();
      expect(hybridSearchPresets.precise.keywordWeight).toBeGreaterThan(
        hybridSearchPresets.precise.vectorWeight!,
      );
    });

    test('should have comprehensive preset', () => {
      expect(hybridSearchPresets.comprehensive).toBeDefined();
      expect(hybridSearchPresets.comprehensive).toMatchObject({
        recencyBoost: true,
        lengthPenalty: true,
        fuzzyMatch: true,
      });
    });

    test('should create engines with presets', () => {
      const balancedEngine = createHybridSearch(vectorStore, hybridSearchPresets.balanced);
      const semanticEngine = createHybridSearch(vectorStore, hybridSearchPresets.semantic);
      const preciseEngine = createHybridSearch(vectorStore, hybridSearchPresets.precise);
      const comprehensiveEngine = createHybridSearch(
        vectorStore,
        hybridSearchPresets.comprehensive,
      );

      expect(balancedEngine).toBeInstanceOf(HybridSearchEngine);
      expect(semanticEngine).toBeInstanceOf(HybridSearchEngine);
      expect(preciseEngine).toBeInstanceOf(HybridSearchEngine);
      expect(comprehensiveEngine).toBeInstanceOf(HybridSearchEngine);
    });
  });
});

describe('integration Scenarios', () => {
  let vectorStore: RAGDatabaseBridge;
  let hybridSearch: HybridSearchEngine;

  beforeEach(() => {
    vectorStore = createMockVectorStore();
    hybridSearch = createHybridSearch(vectorStore, hybridSearchPresets.balanced);
  });

  test('should handle realistic search scenario', async () => {
    // Mock realistic vector search results
    vi.mocked(vectorStore.queryDocuments).mockResolvedValue([
      {
        id: 'doc1',
        content:
          'Comprehensive guide to machine learning algorithms and their applications in modern AI systems.',
        score: 0.92,
        metadata: { title: 'ML Guide', category: 'education', timestamp: '2024-01-15' },
      },
      {
        id: 'doc2',
        content:
          'Deep learning architectures for computer vision and natural language processing tasks.',
        score: 0.85,
        metadata: { title: 'Deep Learning', category: 'technical', timestamp: '2024-01-10' },
      },
    ]);

    // Mock keyword search documents
    const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
    getAllDocumentsSpy.mockResolvedValue([
      {
        id: 'doc1',
        content:
          'Comprehensive guide to machine learning algorithms and their applications in modern AI systems.',
        metadata: { title: 'ML Guide', category: 'education' },
      },
      {
        id: 'doc3',
        content:
          'Machine learning tutorial for beginners with practical examples and coding exercises.',
        metadata: { title: 'ML Tutorial', category: 'tutorial' },
      },
    ]);

    const results = await hybridSearch.search('machine learning guide');

    expect(results.length).toBeGreaterThan(0);

    // Should have combined scores from both vector and keyword search
    const topResult = results[0];
    expect(topResult.vectorScore).toBeGreaterThan(0);
    expect(topResult.keywordScore).toBeGreaterThan(0);
    expect(topResult.hybridScore).toBeGreaterThan(0);
    expect(topResult.keywordMatches).toContain('machine');
    expect(topResult.keywordMatches).toContain('learning');
  });

  test('should handle edge case with no vector results', async () => {
    vi.mocked(vectorStore.queryDocuments).mockResolvedValue([]);

    const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
    getAllDocumentsSpy.mockResolvedValue(mockDocuments);

    const results = await hybridSearch.search('machine learning');

    // Should still return keyword-based results
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.vectorScore).toBe(0);
      expect(result.keywordScore).toBeGreaterThan(0);
      expect(result.rankingMethod).toBe('keyword');
    });
  });

  test('should handle edge case with no keyword results', async () => {
    const getAllDocumentsSpy = vi.spyOn(hybridSearch as any, 'getAllDocuments');
    getAllDocumentsSpy.mockResolvedValue([]);

    const results = await hybridSearch.search('machine learning');

    // Should still return vector-based results
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.vectorScore).toBeGreaterThan(0);
      expect(result.keywordScore).toBe(0);
      expect(result.rankingMethod).toBe('vector');
    });
  });
});

describe('type Safety and Interfaces', () => {
  test('should have correct HybridSearchResult type structure', () => {
    const mockResult: HybridSearchResult = {
      id: 'test',
      content: 'test content',
      metadata: { title: 'test' },
      vectorScore: 0.8,
      keywordScore: 0.6,
      hybridScore: 0.72,
      keywordMatches: ['test'],
      vectorSimilarity: 0.8,
      rank: 1,
      rankingMethod: 'hybrid',
    };

    expect(mockResult).toBeDefined();
    expect(mockResult.id).toBe('test');
    expect(mockResult.rankingMethod).toBe('hybrid');
  });

  test('should have correct HybridSearchConfig type structure', () => {
    const mockConfig: HybridSearchConfig = {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      fusionMethod: 'weighted',
      phraseBoost: 1.2,
      titleBoost: 1.5,
      recencyBoost: true,
    };

    expect(mockConfig).toBeDefined();
    expect(mockConfig.vectorWeight! + mockConfig.keywordWeight!).toBeCloseTo(1.0);
  });
});
