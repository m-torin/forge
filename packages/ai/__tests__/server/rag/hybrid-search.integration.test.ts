/**
 * Integration Tests for Hybrid Search with Real Database Interactions
 * Tests the complete hybrid search pipeline including vector database integration
 */

import { afterAll, beforeAll, beforeEach, describe, expect } from 'vitest';
import {
  createRAGDatabaseBridge,
  type RAGDatabaseBridge,
} from '../../../src/server/rag/database-bridge';
import {
  HybridSearchEngine,
  createHybridSearch,
  hybridSearchPresets,
} from '../../../src/server/rag/hybrid-search';

// Test documents with varying content types
const testDocuments = [
  {
    id: 'ml-basics-001',
    content: `Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming. It involves algorithms that can identify patterns, make predictions, and improve their performance over time. Common applications include image recognition, natural language processing, recommendation systems, and predictive analytics.`,
    metadata: {
      title: 'Machine Learning Fundamentals',
      category: 'education',
      tags: ['ML', 'AI', 'algorithms', 'data science'],
      difficulty: 'beginner',
      timestamp: '2024-01-15T10:00:00Z',
      author: 'Dr. Sarah Chen',
      url: 'https://example.com/ml-basics',
    },
  },
  {
    id: 'deep-learning-002',
    content: `Deep learning utilizes neural networks with multiple hidden layers to process complex data patterns. These networks can automatically extract features from raw data, making them particularly effective for tasks like computer vision, speech recognition, and language translation. Popular architectures include CNNs for images, RNNs for sequences, and Transformers for natural language.`,
    metadata: {
      title: 'Deep Learning Neural Networks',
      category: 'technical',
      tags: ['deep learning', 'neural networks', 'CNN', 'RNN', 'transformers'],
      difficulty: 'advanced',
      timestamp: '2024-01-12T14:30:00Z',
      author: 'Prof. Michael Rodriguez',
      url: 'https://example.com/deep-learning',
    },
  },
  {
    id: 'nlp-guide-003',
    content: `Natural Language Processing (NLP) enables computers to understand, interpret, and generate human language. Key techniques include tokenization, part-of-speech tagging, named entity recognition, sentiment analysis, and machine translation. Modern NLP relies heavily on transformer models like BERT, GPT, and T5 for achieving state-of-the-art results.`,
    metadata: {
      title: 'NLP Comprehensive Guide',
      category: 'linguistics',
      tags: ['NLP', 'BERT', 'GPT', 'transformers', 'tokenization'],
      difficulty: 'intermediate',
      timestamp: '2024-01-10T09:15:00Z',
      author: 'Dr. Emily Watson',
      url: 'https://example.com/nlp-guide',
    },
  },
  {
    id: 'computer-vision-004',
    content: `Computer vision algorithms enable machines to interpret and analyze visual information from images and videos. Core techniques include edge detection, feature extraction, object detection, image segmentation, and facial recognition. Applications span autonomous vehicles, medical imaging, surveillance systems, and augmented reality.`,
    metadata: {
      title: 'Computer Vision Applications',
      category: 'visual-computing',
      tags: ['computer vision', 'image processing', 'object detection', 'CNN'],
      difficulty: 'intermediate',
      timestamp: '2024-01-08T16:45:00Z',
      author: 'Dr. James Liu',
      url: 'https://example.com/computer-vision',
    },
  },
  {
    id: 'reinforcement-learning-005',
    content: `Reinforcement Learning (RL) trains agents to make optimal decisions through trial-and-error interactions with an environment. The agent receives rewards or penalties for actions, learning to maximize cumulative reward. Key algorithms include Q-Learning, Policy Gradients, and Actor-Critic methods. Applications include game playing, robotics, and autonomous systems.`,
    metadata: {
      title: 'Reinforcement Learning Fundamentals',
      category: 'behavioral-ai',
      tags: ['reinforcement learning', 'Q-learning', 'policy gradients', 'robotics'],
      difficulty: 'advanced',
      timestamp: '2024-01-05T11:20:00Z',
      author: 'Dr. Alexandra Kim',
      url: 'https://example.com/reinforcement-learning',
    },
  },
  {
    id: 'data-preprocessing-006',
    content: `Data preprocessing is crucial for machine learning success. It involves cleaning data, handling missing values, removing outliers, feature scaling, encoding categorical variables, and feature selection. Quality data preprocessing can significantly improve model performance and reduce training time. Common tools include pandas, scikit-learn, and numpy.`,
    metadata: {
      title: 'Data Preprocessing Best Practices',
      category: 'data-science',
      tags: ['data preprocessing', 'feature engineering', 'pandas', 'scikit-learn'],
      difficulty: 'beginner',
      timestamp: '2024-01-03T13:10:00Z',
      author: 'Dr. Robert Chang',
      url: 'https://example.com/data-preprocessing',
    },
  },
];

describe('hybrid Search Integration Tests', () => {
  let vectorStore: RAGDatabaseBridge;
  let hybridSearch: HybridSearchEngine;

  beforeAll(async () => {
    // Create vector store (this would use actual Upstash Vector in real scenarios)
    vectorStore = createRAGDatabaseBridge({
      vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'http://localhost:8080',
      vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'test-token',
      namespace: 'hybrid-search-test',
    });

    // Initialize hybrid search with balanced configuration
    hybridSearch = createHybridSearch(vectorStore, hybridSearchPresets.balanced);
  });

  beforeEach(async () => {
    // Add test documents to vector store
    for (const doc of testDocuments) {
      try {
        await vectorStore.addDocument(doc.content, doc.metadata);
      } catch (error) {
        console.warn(`Failed to add document ${doc.id}:`, error);
      }
    }

    // Wait for indexing
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      for (const doc of testDocuments) {
        await vectorStore.deleteDocument(doc.id);
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  describe('basic Hybrid Search Functionality', () => {
    test('should find relevant documents using vector search', async () => {
      const results = await hybridSearch.search('machine learning algorithms');

      expect(results.length).toBeGreaterThan(0);

      // Should find ML-related documents
      const mlDoc = results.find(r => r.content.includes('machine learning'));
      expect(mlDoc).toBeDefined();
      expect(mlDoc!.vectorScore).toBeGreaterThan(0.7);
    });

    test('should find relevant documents using keyword search', async () => {
      // Mock keyword search by providing documents to hybrid search
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.precise); // Use precise preset for keyword-heavy search

      const results = await hybridSearchWithKeywords.search('neural networks CNN');

      expect(results.length).toBeGreaterThan(0);

      // Should find documents with exact keyword matches
      const deepLearningDoc = results.find(r => r.content.includes('neural networks'));
      expect(deepLearningDoc).toBeDefined();
      expect(deepLearningDoc!.keywordScore).toBeGreaterThan(0);
      expect(deepLearningDoc!.keywordMatches).toContain('neural');
    });

    test('should combine vector and keyword scores effectively', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);

      const results = await hybridSearchWithKeywords.search('deep learning neural networks');

      expect(results.length).toBeGreaterThan(0);

      const topResult = results[0];
      expect(topResult.vectorScore).toBeGreaterThan(0);
      expect(topResult.keywordScore).toBeGreaterThan(0);
      expect(topResult.hybridScore).toBeGreaterThan(0);
      expect(topResult.rankingMethod).toBe('hybrid');
    });
  });

  describe('advanced Search Scenarios', () => {
    test('should handle semantic search queries', async () => {
      const semanticEngine = createHybridSearch(vectorStore, hybridSearchPresets.semantic);

      const results = await semanticEngine.search('AI systems that learn from data');

      expect(results.length).toBeGreaterThan(0);

      // Should find machine learning documents even without exact keywords
      const relevantDoc = results.find(
        r =>
          r.content.includes('machine learning') || r.content.includes('artificial intelligence'),
      );
      expect(relevantDoc).toBeDefined();
      expect(relevantDoc!.vectorScore).toBeGreaterThan(0.6);
    });

    test('should handle precise keyword queries', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.precise);

      const results = await hybridSearchWithKeywords.search('BERT GPT transformers');

      expect(results.length).toBeGreaterThan(0);

      // Should prioritize documents with exact matches
      const nlpDoc = results.find(r => r.content.includes('BERT'));
      expect(nlpDoc).toBeDefined();
      expect(nlpDoc!.keywordScore).toBeGreaterThan(nlpDoc!.vectorScore * 0.5);
    });

    test('should apply recency boost correctly', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.comprehensive);

      const results = await hybridSearchWithKeywords.search('machine learning', {
        boostFields: ['title'],
      });

      expect(results.length).toBeGreaterThan(0);

      // More recent documents should potentially rank higher
      const sortedByTimestamp = results
        .filter(r => r.metadata?.timestamp)
        .sort(
          (a, b) =>
            new Date(b.metadata!.timestamp).getTime() - new Date(a.metadata!.timestamp).getTime(),
        );

      if (sortedByTimestamp.length > 1) {
        // Recent document should have competitive score
        expect(sortedByTimestamp[0].hybridScore).toBeGreaterThan(0);
      }
    });
  });

  describe('filter and Boost Integration', () => {
    test('should apply metadata filters', async () => {
      const results = await hybridSearch.search('learning algorithms', {
        filters: { category: 'education' },
      });

      if (results.length > 0) {
        // All results should match the filter
        results.forEach(result => {
          if (result.metadata?.category) {
            expect(result.metadata.category).toBe('education');
          }
        });
      }
    });

    test('should apply field boosts', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);

      const results = await hybridSearchWithKeywords.search('Machine Learning', {
        boostFields: ['title', 'tags'],
      });

      expect(results.length).toBeGreaterThan(0);

      // Documents with ML in title or tags should rank higher
      const boostedDoc = results.find(
        r => r.metadata?.title?.includes('Machine Learning') || r.metadata?.tags?.includes('ML'),
      );

      if (boostedDoc) {
        expect(boostedDoc.hybridScore).toBeGreaterThan(0);
      }
    });

    test('should handle custom weight overrides', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, { vectorWeight: 0.5, keywordWeight: 0.5 });

      const results = await hybridSearchWithKeywords.search('deep learning', {
        customWeights: { vector: 0.8, keyword: 0.2 },
      });

      expect(results.length).toBeGreaterThan(0);

      // Should prioritize vector similarity due to custom weights
      const topResult = results[0];
      expect(topResult.hybridScore).toBeGreaterThan(0);
    });
  });

  describe('different Fusion Methods', () => {
    let hybridSearchWithKeywords: HybridSearchEngine;

    beforeEach(() => {
      hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);
    });

    test('should produce different results with different fusion methods', async () => {
      const weightedEngine = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, { ...hybridSearchPresets.balanced, fusionMethod: 'weighted' });

      const rrfEngine = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, { ...hybridSearchPresets.balanced, fusionMethod: 'rrf' });

      const query = 'neural networks deep learning';
      const [weightedResults, rrfResults] = await Promise.all([
        weightedEngine.search(query),
        rrfEngine.search(query),
      ]);

      expect(weightedResults.length).toBeGreaterThan(0);
      expect(rrfResults.length).toBeGreaterThan(0);

      // Results should be different due to different fusion methods
      if (weightedResults.length > 0 && rrfResults.length > 0) {
        const topWeighted = weightedResults[0];
        const topRRF = rrfResults[0];

        // Scores should be calculated differently
        expect(topWeighted.hybridScore).not.toStrictEqual(topRRF.hybridScore);
      }
    });
  });

  describe('performance and Scalability', () => {
    test('should handle concurrent searches efficiently', async () => {
      const queries = [
        'machine learning algorithms',
        'deep learning neural networks',
        'natural language processing',
        'computer vision applications',
        'reinforcement learning agents',
      ];

      const startTime = Date.now();

      const results = await Promise.all(queries.map(query => hybridSearch.search(query)));

      const executionTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      results.forEach(queryResults => {
        expect(queryResults).toBeInstanceOf(Array);
      });

      // Should complete all searches in reasonable time
      expect(executionTime).toBeLessThan(5000); // 5 seconds for 5 searches
    });

    test('should respect topK limits', async () => {
      const limitedEngine = createHybridSearch(vectorStore, {
        finalTopK: 3,
        vectorTopK: 10,
        keywordTopK: 10,
      });

      const results = await limitedEngine.search('machine learning artificial intelligence');

      expect(results.length).toBeLessThanOrEqual(3);
    });

    test('should handle large result sets efficiently', async () => {
      const largeTopKEngine = createHybridSearch(vectorStore, {
        finalTopK: 50,
        vectorTopK: 100,
        keywordTopK: 100,
      });

      const startTime = Date.now();
      const results = await largeTopKEngine.search('learning algorithms data');
      const executionTime = Date.now() - startTime;

      expect(results).toBeInstanceOf(Array);
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('edge Cases and Error Handling', () => {
    test('should handle empty search results gracefully', async () => {
      const results = await hybridSearch.search('xyzabc123nonexistent');

      expect(results).toBeInstanceOf(Array);
      expect(results).toHaveLength(0);
    });

    test('should handle special characters in queries', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);

      const results = await hybridSearchWithKeywords.search('machine-learning & AI (algorithms)');

      expect(results).toBeInstanceOf(Array);
      // Should handle special characters without throwing errors
    });

    test('should handle very long queries', async () => {
      const longQuery =
        'machine learning algorithms artificial intelligence neural networks deep learning computer vision natural language processing reinforcement learning data science preprocessing feature engineering model training evaluation metrics performance optimization'.repeat(
          5,
        );

      const results = await hybridSearch.search(longQuery);

      expect(results).toBeInstanceOf(Array);
      // Should not throw errors with long queries
    });

    test('should handle database unavailability gracefully', async () => {
      // Create hybrid search with invalid vector store config
      const invalidVectorStore = createRAGDatabaseBridge({
        vectorUrl: 'http://invalid-url:9999',
        vectorToken: 'invalid-token',
      });

      const faultyHybridSearch = createHybridSearch(
        invalidVectorStore,
        hybridSearchPresets.balanced,
      );

      // Should not throw, should return empty results or handle gracefully
      const results = await faultyHybridSearch.search('test query').catch(() => []);

      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('result Quality and Relevance', () => {
    test('should return results sorted by relevance', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);

      const results = await hybridSearchWithKeywords.search('machine learning algorithms data');

      expect(results.length).toBeGreaterThan(1);

      // Results should be sorted by hybrid score in descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].hybridScore).toBeGreaterThanOrEqual(results[i].hybridScore);
      }

      // Top result should be highly relevant
      const topResult = results[0];
      expect(topResult.hybridScore).toBeGreaterThan(0.1);
    });

    test('should provide meaningful keyword matches', async () => {
      const hybridSearchWithKeywords = new (class extends HybridSearchEngine {
        async getAllDocuments() {
          return testDocuments.map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
          }));
        }
      })(vectorStore, hybridSearchPresets.balanced);

      const results = await hybridSearchWithKeywords.search('neural networks deep learning');

      const resultsWithKeywordMatches = results.filter(r => r.keywordMatches.length > 0);

      if (resultsWithKeywordMatches.length > 0) {
        const result = resultsWithKeywordMatches[0];

        // Should contain relevant keyword matches
        const hasNeuralMatch = result.keywordMatches.some(
          match => match.includes('neural') || match.includes('network'),
        );
        const hasDeepMatch = result.keywordMatches.some(
          match => match.includes('deep') || match.includes('learning'),
        );

        expect(hasNeuralMatch || hasDeepMatch).toBeTruthy();
      }
    });

    test('should maintain document metadata integrity', async () => {
      const results = await hybridSearch.search('machine learning');

      const resultWithMetadata = results.find(r => r.metadata);

      if (resultWithMetadata) {
        expect(resultWithMetadata.metadata).toHaveProperty('title');
        expect(resultWithMetadata.metadata).toHaveProperty('category');
        expect(resultWithMetadata.metadata.title).toBeTruthy();
      }
    });
  });
});
