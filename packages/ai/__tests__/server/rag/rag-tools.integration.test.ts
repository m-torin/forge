/**
 * Integration Tests for RAG Tools
 * Tests the complete RAG toolset with real data processing
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import type { RAGDatabaseBridge } from '../../../src/server/rag/database-bridge';
import { createHybridSearch } from '../../../src/server/rag/hybrid-search';
import {
  createRAGToolset,
  type RAGToolConfig,
  type RAGToolResults,
} from '../../../src/server/rag/rag-tools';

// Mock RAG Database Bridge with realistic behavior
const createMockVectorStore = (): RAGDatabaseBridge => {
  const documents = new Map<string, { content: string; metadata?: any }>();

  return {
    queryDocuments: vi.fn().mockImplementation(async (query: string, options?: any) => {
      const results = Array.from(documents.entries())
        .map(([id, doc]) => ({
          id,
          content: doc.content,
          score: Math.random() * 0.5 + 0.5, // Random score between 0.5-1.0
          metadata: doc.metadata,
        }))
        .filter(result => {
          // Simple keyword matching for mock
          const queryWords = query.toLowerCase().split(' ');
          const contentWords = result.content.toLowerCase();
          return queryWords.some(word => contentWords.includes(word));
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, options?.topK || 5);

      return results;
    }),

    addDocument: vi.fn().mockImplementation(async (content: string, metadata?: any) => {
      const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      documents.set(id, { content, metadata });
      return id;
    }),

    deleteDocument: vi.fn().mockImplementation(async (id: string) => {
      documents.delete(id);
      return true;
    }),

    updateDocument: vi.fn(),
    getStats: vi.fn().mockResolvedValue({ totalDocuments: documents.size, dimension: 1536 }),
  };
};

// Test data for realistic scenarios
const sampleDocuments = [
  {
    content: `Machine Learning Fundamentals: Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming. Key concepts include supervised learning, unsupervised learning, and reinforcement learning. Popular algorithms include linear regression, decision trees, neural networks, and support vector machines.`,
    metadata: {
      title: 'ML Fundamentals',
      category: 'education',
      tags: ['machine learning', 'AI', 'algorithms'],
      difficulty: 'beginner',
      url: 'https://example.com/ml-fundamentals',
    },
  },
  {
    content: `Deep Learning Architecture: Deep learning uses neural networks with multiple hidden layers to process complex data. Convolutional Neural Networks (CNNs) excel at image processing, Recurrent Neural Networks (RNNs) handle sequential data, and Transformers revolutionized natural language processing. Training requires large datasets and significant computational resources.`,
    metadata: {
      title: 'Deep Learning Architecture',
      category: 'technical',
      tags: ['deep learning', 'CNN', 'RNN', 'transformers'],
      difficulty: 'advanced',
      url: 'https://example.com/deep-learning',
    },
  },
  {
    content: `Natural Language Processing Pipeline: NLP involves preprocessing text through tokenization, removing stop words, and stemming. Feature extraction can use bag-of-words, TF-IDF, or modern embedding techniques. Applications include sentiment analysis, machine translation, text summarization, and question answering systems.`,
    metadata: {
      title: 'NLP Pipeline',
      category: 'linguistics',
      tags: ['NLP', 'tokenization', 'embeddings', 'sentiment analysis'],
      difficulty: 'intermediate',
      url: 'https://example.com/nlp-pipeline',
    },
  },
  {
    content: `Data Science Workflow: Data science projects follow a structured workflow: problem definition, data collection, exploratory data analysis, feature engineering, model selection, training, evaluation, and deployment. Tools like Python, R, Jupyter notebooks, and cloud platforms facilitate this process.`,
    metadata: {
      title: 'Data Science Workflow',
      category: 'methodology',
      tags: ['data science', 'workflow', 'Python', 'R'],
      difficulty: 'intermediate',
      url: 'https://example.com/data-science-workflow',
    },
  },
  {
    content: `Computer Vision Applications: Computer vision enables machines to interpret visual information. Applications include object detection, image classification, facial recognition, medical imaging analysis, autonomous vehicles, and augmented reality. Modern approaches use convolutional neural networks and transfer learning.`,
    metadata: {
      title: 'Computer Vision Applications',
      category: 'applications',
      tags: ['computer vision', 'object detection', 'CNN', 'transfer learning'],
      difficulty: 'advanced',
      url: 'https://example.com/computer-vision',
    },
  },
];

describe('rAG Tools Integration', () => {
  let vectorStore: RAGDatabaseBridge;
  let config: RAGToolConfig;
  let tools: ReturnType<typeof createRAGToolset>;

  beforeEach(async () => {
    vectorStore = createMockVectorStore();

    config = {
      vectorStore,
      enableSourceTracking: true,
      enableBatchProcessing: true,
      maxContextLength: 2000,
      defaultTopK: 5,
      defaultThreshold: 0.7,
    };

    tools = createRAGToolset(config);

    // Add sample documents to the vector store
    for (const doc of sampleDocuments) {
      await vectorStore.addDocument(doc.content, doc.metadata);
    }
  });

  describe('knowledge Search Tool', () => {
    test('should search knowledge base with source tracking', async () => {
      const result = await tools.knowledgeSearch.execute({
        question: 'What is machine learning?',
        topK: 3,
        threshold: 0.5,
        includeMetadata: true,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

      // Check result structure
      const firstResult = result[0];
      expect(firstResult).toHaveProperty('content');
      expect(firstResult).toHaveProperty('score');
      expect(firstResult.score).toBeGreaterThan(0);
      expect(firstResult.score).toBeLessThanOrEqual(1);

      // Should include source metadata when tracking is enabled
      const hasSourceMetadata = firstResult.source !== undefined;

      if (hasSourceMetadata) {
        expect(firstResult.source).toHaveProperty('title');
        expect(firstResult.source).toHaveProperty('provider');
      }
    });

    test('should apply context window limiting', async () => {
      const result = await tools.knowledgeSearch.execute({
        question: 'Explain deep learning neural networks',
        topK: 5,
        contextWindow: 100, // Limit to 100 characters
      });

      expect(result).toBeInstanceOf(Array);

      result.forEach(item => {
        expect(item.content.length).toBeLessThanOrEqual(103); // 100 + "..." = 103
      });
    });

    test('should handle empty results gracefully', async () => {
      const result = await tools.knowledgeSearch.execute({
        question: 'nonexistent topic xyz123',
        topK: 5,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });
  });

  describe('batch Document Processing Tool', () => {
    test('should process multiple documents in batches', async () => {
      const documents = [
        {
          content: 'Artificial Intelligence overview and applications in modern technology.',
          title: 'AI Overview',
          metadata: { category: 'overview', source: 'test' },
        },
        {
          content: 'Machine Learning algorithms and their practical implementations.',
          title: 'ML Algorithms',
          metadata: { category: 'technical', source: 'test' },
        },
        {
          content: 'Data Science methodology and best practices for analysis.',
          title: 'Data Science Best Practices',
          metadata: { category: 'methodology', source: 'test' },
        },
      ];

      const result = await tools.batchDocumentProcessor.execute({
        documents,
        chunkSize: 2,
        generateEmbeddings: true,
      });

      expect(result).toMatchObject({
        processed: expect.any(Number),
        failed: expect.any(Number),
        errors: expect.any(Array),
        embeddings: expect.any(Array),
      });

      expect(result.processed + result.failed).toBe(documents.length);
      expect(result.embeddings).toHaveLength(documents.length);

      // Check that documents were added to vector store
      expect(vectorStore.addDocument).toHaveBeenCalledTimes(documents.length);
    });

    test('should handle batch processing errors gracefully', async () => {
      // Mock addDocument to fail for some documents
      vi.mocked(vectorStore.addDocument).mockImplementation(async (content: string) => {
        if (content.includes('error')) {
          throw new Error('Simulated processing error');
        }
        return `doc_${Date.now()}`;
      });

      const documents = [
        { content: 'Good document content', title: 'Good Doc' },
        { content: 'This should cause an error document', title: 'Error Doc' },
        { content: 'Another good document', title: 'Good Doc 2' },
      ];

      const result = await tools.batchDocumentProcessor.execute({
        documents,
        chunkSize: 1,
      });

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.processed).toBeLessThan(documents.length);
    });

    test('should respect chunk size configuration', async () => {
      const documents = Array.from({ length: 10 }, (_, i) => ({
        content: `Document ${i} content for testing batch processing`,
        title: `Document ${i}`,
      }));

      const result = await tools.batchDocumentProcessor.execute({
        documents,
        chunkSize: 3,
      });

      expect(result.processed + result.failed).toBe(10);

      // Verify addDocument was called for each document
      expect(vectorStore.addDocument).toHaveBeenCalledTimes(10);
    });
  });

  describe('multi-Step Reasoning Tool', () => {
    test('should perform multi-step reasoning with context accumulation', async () => {
      const result = await tools.multiStepReasoning.execute({
        mainQuestion: 'How do machine learning and deep learning compare?',
        subQueries: [
          'What is machine learning?',
          'What is deep learning?',
          'What are the differences between ML and deep learning?',
        ],
        synthesizeResults: true,
        maxContextPerQuery: 2,
      });

      expect(result).toMatchObject({
        mainQuestion: 'How do machine learning and deep learning compare?',
        queriesProcessed: 3,
        contextItemsFound: expect.any(Number),
      });

      const hasSynthesizedResults = result.synthesizedResults !== undefined;

      if (hasSynthesizedResults) {
        expect(result.synthesizedResults).toBeInstanceOf(Array);
        expect(result.synthesizedResults.length).toBeGreaterThan(0);

        result.synthesizedResults.forEach(item => {
          expect(item).toHaveProperty('content');
          expect(item).toHaveProperty('score');
          expect(item).toHaveProperty('relevantQueries');
          expect(item.relevantQueries).toBeInstanceOf(Array);
        });

        expect(result).toHaveProperty('totalSources');
      }
    });

    test('should return detailed results when synthesis is disabled', async () => {
      const result = await tools.multiStepReasoning.execute({
        mainQuestion: 'What are the applications of AI?',
        subQueries: ['Machine learning applications', 'Computer vision applications'],
        synthesizeResults: false,
      });

      expect(result).toMatchObject({
        mainQuestion: 'What are the applications of AI?',
        detailedResults: expect.any(Array),
        totalQueries: 2,
        contextItemsFound: expect.any(Number),
      });

      const hasDetailedResults = result.detailedResults !== undefined;

      if (hasDetailedResults) {
        expect(result.detailedResults).toHaveLength(2);

        result.detailedResults.forEach(queryResult => {
          expect(queryResult).toHaveProperty('query');
          expect(queryResult).toHaveProperty('results');
          expect(queryResult.results).toBeInstanceOf(Array);
        });
      }
    });

    test('should handle query failures gracefully', async () => {
      // Mock queryDocuments to fail for specific queries
      vi.mocked(vectorStore.queryDocuments).mockImplementation(async (query: string) => {
        if (query.includes('fail')) {
          throw new Error('Query failed');
        }
        return [
          {
            id: 'test',
            content: 'Test content',
            score: 0.8,
            metadata: { title: 'Test' },
          },
        ];
      });

      const result = await tools.multiStepReasoning.execute({
        mainQuestion: 'Test question',
        subQueries: ['Good query', 'This should fail query', 'Another good query'],
        synthesizeResults: true,
      });

      // Should still process successful queries
      expect(result.queriesProcessed).toBe(3);
      expect(result.contextItemsFound).toBeGreaterThan(0);
    });
  });

  describe('context Summarization Tool', () => {
    test('should summarize content with source attribution', async () => {
      const result = await tools.contextSummarization.execute({
        topic: 'artificial intelligence applications',
        focusAreas: ['machine learning', 'computer vision'],
        maxSources: 5,
        includeSourceList: true,
      });

      expect(result).toMatchObject({
        topic: 'artificial intelligence applications',
        focusAreas: ['machine learning', 'computer vision'],
        contentSummary: expect.any(Array),
        sources: expect.any(Array),
        totalContentItems: expect.any(Number),
        averageRelevance: expect.any(Number),
      });

      result.contentSummary.forEach(item => {
        expect(item).toHaveProperty('excerpt');
        expect(item).toHaveProperty('relevanceScore');
        expect(item).toHaveProperty('searchQuery');
        expect(item.excerpt.length).toBeGreaterThan(0);
        expect(item.relevanceScore).toBeGreaterThan(0);
      });

      const hasSources = result.sources.length > 0;

      if (hasSources) {
        result.sources.forEach(source => {
          expect(typeof source).toBe('string');
          expect(source.length).toBeGreaterThan(0);
        });
      }
    });

    test('should respect maxSources limit', async () => {
      const result = await tools.contextSummarization.execute({
        topic: 'machine learning',
        maxSources: 3,
        includeSourceList: true,
      });

      expect(result.totalContentItems).toBeLessThanOrEqual(3);
      expect(result.contentSummary.length).toBeLessThanOrEqual(3);
    });

    test('should handle empty results gracefully', async () => {
      const result = await tools.contextSummarization.execute({
        topic: 'nonexistent topic xyz123',
        maxSources: 5,
        includeSourceList: true,
      });

      expect(result).toMatchObject({
        topic: 'nonexistent topic xyz123',
        contentSummary: [],
        sources: [],
        totalContentItems: 0,
        averageRelevance: expect.any(Number),
      });
    });
  });

  describe('tool Integration and Error Handling', () => {
    test('should handle vector store failures gracefully', async () => {
      // Mock vector store to fail
      vi.mocked(vectorStore.queryDocuments).mockRejectedValue(
        new Error('Vector store unavailable'),
      );

      const result = await tools.knowledgeSearch.execute({
        question: 'test query',
        topK: 5,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    test('should maintain type safety across all tools', () => {
      // Type checking - should compile without errors
      type SearchResult = RAGToolResults['knowledgeSearch'];
      type BatchResult = RAGToolResults['batchDocumentProcessor'];
      type ReasoningResult = RAGToolResults['multiStepReasoning'];
      type SummaryResult = RAGToolResults['contextSummarization'];

      const mockSearchResult: SearchResult = [
        {
          content: 'test',
          score: 0.8,
          metadata: { title: 'test' },
          source: { title: 'test', provider: 'test' },
        },
      ];

      const mockBatchResult: BatchResult = {
        processed: 1,
        failed: 0,
        errors: [],
        embeddings: [[0.1, 0.2, 0.3]],
      };

      const mockReasoningResult: ReasoningResult = {
        mainQuestion: 'test',
        queriesProcessed: 1,
        contextItemsFound: 1,
      };

      const mockSummaryResult: SummaryResult = {
        topic: 'test',
        focusAreas: [],
        contentSummary: [],
        sources: [],
        totalContentItems: 0,
        averageRelevance: 0,
      };

      expect(mockSearchResult).toBeDefined();
      expect(mockBatchResult).toBeDefined();
      expect(mockReasoningResult).toBeDefined();
      expect(mockSummaryResult).toBeDefined();
    });

    test('should work with hybrid search integration', async () => {
      const hybridSearch = createHybridSearch(vectorStore, {
        vectorWeight: 0.6,
        keywordWeight: 0.4,
      });

      // This demonstrates how RAG tools can work alongside hybrid search
      const [toolResult, hybridResult] = await Promise.all([
        tools.knowledgeSearch.execute({
          question: 'machine learning algorithms',
          topK: 3,
        }),
        hybridSearch.search('machine learning algorithms'),
      ]);

      expect(toolResult).toBeInstanceOf(Array);
      expect(hybridResult).toBeInstanceOf(Array);

      // Both should return relevant results
      const hasBothResults = toolResult.length > 0 && hybridResult.length > 0;

      if (hasBothResults) {
        expect(toolResult[0].content).toBeTruthy();
        expect(hybridResult[0].content).toBeTruthy();
      }
    });
  });

  describe('performance and Concurrency', () => {
    test('should handle concurrent tool executions', async () => {
      const concurrentPromises = [
        tools.knowledgeSearch.execute({
          question: 'machine learning',
          topK: 3,
        }),
        tools.contextSummarization.execute({
          topic: 'deep learning',
          maxSources: 3,
        }),
        tools.multiStepReasoning.execute({
          mainQuestion: 'AI applications',
          subQueries: ['ML apps', 'CV apps'],
          synthesizeResults: false,
        }),
      ];

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const executionTime = Date.now() - startTime;

      expect(results).toHaveLength(3);
      expect(results[0]).toBeInstanceOf(Array); // knowledge search
      expect(results[1]).toHaveProperty('topic'); // summarization
      expect(results[2]).toHaveProperty('mainQuestion'); // reasoning

      // Should complete concurrently in reasonable time
      expect(executionTime).toBeLessThan(5000);
    });

    test('should handle large batch processing efficiently', async () => {
      const largeBatch = Array.from({ length: 50 }, (_, i) => ({
        content: `Document ${i} with content about machine learning and artificial intelligence applications`,
        title: `Document ${i}`,
        metadata: { index: i, category: 'test' },
      }));

      const startTime = Date.now();
      const result = await tools.batchDocumentProcessor.execute({
        documents: largeBatch,
        chunkSize: 10,
        generateEmbeddings: false, // Skip embeddings for performance
      });
      const executionTime = Date.now() - startTime;

      expect(result.processed + result.failed).toBe(50);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});
