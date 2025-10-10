/**
 * RAG Testing Utilities
 * Provides comprehensive testing tools for RAG implementations
 */

import { z } from 'zod/v3';
import { RAGMessageProcessor } from './message-processing';
import { validateRAGResponse } from './schema-validation';
import { StructuredRAGService } from './structured-rag';
// vector types placeholder - module not available
const UpstashAIVector = null;

/**
 * Mock vector store for testing
 */
export class MockVectorStore {
  private documents: Map<string, { content: string; embedding: number[]; metadata?: any }> =
    new Map();
  private queryResults: Array<{ content: string; score: number; metadata?: any }> = [];

  /**
   * Add a document to the mock store
   */
  addDocument(id: string, content: string, metadata?: any) {
    // Generate a simple mock embedding (all 1s for simplicity)
    const embedding = new Array(1536).fill(0.1);
    this.documents.set(id, { content, embedding, metadata });
    return Promise.resolve({ success: true });
  }

  /**
   * Set mock query results for testing
   */
  setMockQueryResults(results: Array<{ content: string; score: number; metadata?: any }>) {
    this.queryResults = results;
  }

  /**
   * Mock query method
   */
  async queryWithEmbedding(query: string, options?: { topK?: number }) {
    const topK = options?.topK ?? 5;
    return this.queryResults.slice(0, topK);
  }

  /**
   * Mock Upstash embedding query
   */
  async queryWithUpstashEmbedding(query: string, options?: { topK?: number }) {
    return this.queryWithEmbedding(query, options);
  }

  /**
   * Get stored documents for verification
   */
  getStoredDocuments() {
    return Array.from(this.documents.entries()).map(([id, doc]) => ({ id, ...doc }));
  }

  /**
   * Clear all stored data
   */
  clear() {
    this.documents.clear();
    this.queryResults = [];
  }
}

/**
 * Mock language model for testing
 */
export class MockLanguageModel {
  private mockResponses: Map<string, any> = new Map();
  private callHistory: Array<{ prompt: string; response: any; timestamp: number }> = [];

  /**
   * Set a mock response for a specific prompt pattern
   */
  setMockResponse(promptPattern: string | RegExp, response: any) {
    const key = promptPattern instanceof RegExp ? promptPattern.source : promptPattern;
    this.mockResponses.set(key, response);
  }

  /**
   * Simulate model execution
   */
  async execute(prompt: string): Promise<any> {
    const timestamp = Date.now();

    // Find matching mock response
    for (const [pattern, response] of this.mockResponses.entries()) {
      // Use string includes for safer pattern matching in tests
      if (prompt.toLowerCase().includes(pattern.toLowerCase())) {
        this.callHistory.push({ prompt, response, timestamp });
        return response;
      }
    }

    // Default response if no pattern matches
    const defaultResponse = {
      answer: 'Mock response for testing',
      confidence: 0.8,
      sources: [],
      reasoningText: 'This is a mock response generated for testing purposes',
    };

    this.callHistory.push({ prompt, response: defaultResponse, timestamp });
    return defaultResponse;
  }

  /**
   * Get call history for verification
   */
  getCallHistory() {
    return [...this.callHistory];
  }

  /**
   * Clear call history
   */
  clearHistory() {
    this.callHistory = [];
  }
}

/**
 * RAG test fixture builder
 */
export class RAGTestFixture {
  private vectorStore = new MockVectorStore();
  private languageModel = new MockLanguageModel();
  private testDocuments: Array<{ id: string; content: string; metadata?: any }> = [];

  /**
   * Add test documents to the fixture
   */
  withDocuments(documents: Array<{ id: string; content: string; metadata?: any }>) {
    this.testDocuments = documents;

    // Add documents to mock vector store
    for (const doc of documents) {
      this.vectorStore.addDocument(doc.id, doc.content, doc.metadata);
    }

    return this;
  }

  /**
   * Set expected query results
   */
  withQueryResults(results: Array<{ content: string; score: number; metadata?: any }>) {
    this.vectorStore.setMockQueryResults(results);
    return this;
  }

  /**
   * Set mock language model responses
   */
  withMockResponses(responses: Record<string, any>) {
    for (const [pattern, response] of Object.entries(responses)) {
      this.languageModel.setMockResponse(pattern, response);
    }
    return this;
  }

  /**
   * Build a structured RAG service for testing
   */
  buildStructuredRAG() {
    return new StructuredRAGService({
      vectorStore: this.vectorStore as any,
      languageModel: this.languageModel as any,
      topK: 3,
      similarityThreshold: 0.7,
    });
  }

  /**
   * Build a message processor for testing
   */
  buildMessageProcessor() {
    return new RAGMessageProcessor({
      vectorStore: this.vectorStore as any,
      topK: 3,
      similarityThreshold: 0.7,
    });
  }

  /**
   * Get the mock vector store for assertions
   */
  getVectorStore() {
    return this.vectorStore;
  }

  /**
   * Get the mock language model for assertions
   */
  getLanguageModel() {
    return this.languageModel;
  }

  /**
   * Reset all mocks
   */
  reset() {
    this.vectorStore.clear();
    this.languageModel.clearHistory();
    this.testDocuments = [];
  }
}

/**
 * RAG quality testing utilities
 */
export class RAGQualityTester {
  /**
   * Test retrieval accuracy against known relevant documents
   */
  static async testRetrievalAccuracy(
    vectorStore: typeof UpstashAIVector | MockVectorStore,
    testCases: Array<{
      query: string;
      expectedDocumentIds: string[];
      description?: string;
    }>,
  ) {
    const results = [];

    for (const testCase of testCases) {
      const retrievalResults =
        (await vectorStore?.queryWithEmbedding(testCase.query, { topK: 10 })) || [];
      const retrievedIds = retrievalResults
        .map((r: any) => r.metadata?.id || r.metadata?.documentId)
        .filter(Boolean);

      const accuracy = this.calculateRetrievalAccuracy(testCase.expectedDocumentIds, retrievedIds);

      results.push({
        query: testCase.query,
        description: testCase.description,
        expectedIds: testCase.expectedDocumentIds,
        retrievedIds,
        accuracy,
        precision: this.calculatePrecision(testCase.expectedDocumentIds, retrievedIds),
        recall: this.calculateRecall(testCase.expectedDocumentIds, retrievedIds),
      });
    }

    return results;
  }

  /**
   * Test response quality against expected criteria
   */
  static async testResponseQuality<T extends z.ZodType>(
    ragService: StructuredRAGService,
    testCases: Array<{
      query: string;
      schema: T;
      expectedCriteria: {
        minConfidence?: number;
        requiredKeywords?: string[];
        minSources?: number;
        maxResponseTime?: number;
      };
      description?: string;
    }>,
  ) {
    const results = [];

    for (const testCase of testCases) {
      const startTime = Date.now();

      try {
        const response = await ragService.generateStructured(testCase.query, testCase.schema);
        const responseTime = Date.now() - startTime;

        const validation = await validateRAGResponse(response, testCase.schema, 'qa', undefined, {
          query: testCase.query,
          schemaName: 'test-schema',
        });

        const qualityChecks = this.checkResponseQuality(
          response,
          testCase.expectedCriteria,
          responseTime,
        );

        results.push({
          query: testCase.query,
          description: testCase.description,
          response,
          responseTime,
          validation,
          qualityChecks,
          passed: validation.isValid && qualityChecks.allPassed,
        });
      } catch (error) {
        results.push({
          query: testCase.query,
          description: testCase.description,
          error: error instanceof Error ? error.message : 'Unknown error',
          passed: false,
        });
      }
    }

    return results;
  }

  /**
   * Benchmark RAG performance
   */
  static async benchmarkPerformance(
    ragService: StructuredRAGService,
    queries: string[],
    iterations = 3,
  ) {
    const results = {
      totalQueries: queries.length,
      totalIterations: iterations,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      successRate: 0,
      detailedResults: [] as any[],
    };

    let totalTime = 0;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      for (const query of queries) {
        const startTime = Date.now();

        try {
          await ragService.generateQA(query);
          const responseTime = Date.now() - startTime;

          totalTime += responseTime;
          successCount++;

          results.minResponseTime = Math.min(results.minResponseTime, responseTime);
          results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);

          results.detailedResults.push({
            iteration: i + 1,
            query,
            responseTime,
            success: true,
          });
        } catch (error) {
          results.detailedResults.push({
            iteration: i + 1,
            query,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          });
        }
      }
    }

    const totalAttempts = queries.length * iterations;
    results.averageResponseTime = totalTime / successCount;
    results.successRate = successCount / totalAttempts;

    return results;
  }

  /**
   * Calculate retrieval accuracy metrics
   */
  private static calculateRetrievalAccuracy(expected: string[], retrieved: string[]): number {
    if (expected.length === 0) return 1.0;

    const intersection = expected.filter(id => retrieved.includes(id));
    return intersection.length / expected.length;
  }

  private static calculatePrecision(expected: string[], retrieved: string[]): number {
    if (retrieved.length === 0) return 0;

    const intersection = expected.filter(id => retrieved.includes(id));
    return intersection.length / retrieved.length;
  }

  private static calculateRecall(expected: string[], retrieved: string[]): number {
    if (expected.length === 0) return 1.0;

    const intersection = expected.filter(id => retrieved.includes(id));
    return intersection.length / expected.length;
  }

  /**
   * Check response quality against criteria
   */
  private static checkResponseQuality(
    response: any,
    criteria: {
      minConfidence?: number;
      requiredKeywords?: string[];
      minSources?: number;
      maxResponseTime?: number;
    },
    responseTime: number,
  ) {
    const checks = {
      confidence: true,
      keywords: true,
      sources: true,
      responseTime: true,
      allPassed: true,
      details: [] as string[],
    };

    // Check confidence
    if (criteria.minConfidence && response.confidence < criteria.minConfidence) {
      checks.confidence = false;
      checks.details.push(
        `Confidence ${response.confidence} below required ${criteria.minConfidence}`,
      );
    }

    // Check keywords
    if (criteria.requiredKeywords) {
      const responseText = JSON.stringify(response).toLowerCase();
      const missingKeywords = criteria.requiredKeywords.filter(
        keyword => !responseText.includes(keyword.toLowerCase()),
      );

      if (missingKeywords.length > 0) {
        checks.keywords = false;
        checks.details.push(`Missing keywords: ${missingKeywords.join(', ')}`);
      }
    }

    // Check sources
    if (
      criteria.minSources &&
      (!response.sources || response.sources.length < criteria.minSources)
    ) {
      checks.sources = false;
      checks.details.push(
        `Source count ${response.sources?.length || 0} below required ${criteria.minSources}`,
      );
    }

    // Check response time
    if (criteria.maxResponseTime && responseTime > criteria.maxResponseTime) {
      checks.responseTime = false;
      checks.details.push(
        `Response time ${responseTime}ms above limit ${criteria.maxResponseTime}ms`,
      );
    }

    checks.allPassed =
      checks.confidence && checks.keywords && checks.sources && checks.responseTime;

    return checks;
  }
}

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Generate test documents about various topics
   */
  generateTestDocuments(count = 10): Array<{ id: string; content: string; metadata: any }> {
    const topics = [
      'TypeScript programming language features and benefits',
      'React hooks usage patterns and best practices',
      'Node.js performance optimization techniques',
      'Database indexing strategies for scalability',
      'Microservices architecture design principles',
      'GraphQL API development and testing',
      'Docker containerization best practices',
      'Kubernetes orchestration fundamentals',
      'Machine learning model deployment strategies',
      'Web security vulnerabilities and prevention',
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `doc_${i + 1}`,
      content:
        `This document discusses ${topics[i % topics.length]}. ` +
        `It provides detailed information about implementation details, ` +
        `common pitfalls, and recommended approaches. The content includes ` +
        `practical examples and real-world use cases that developers encounter ` +
        `in their daily work. This comprehensive guide helps understand the ` +
        `underlying concepts and provides actionable insights for implementation.`,
      metadata: {
        title: `Document ${i + 1}: ${topics[i % topics.length]}`,
        category: 'technical',
        difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
        timestamp: new Date().toISOString(),
      },
    }));
  },

  /**
   * Generate test queries for different types of questions
   */
  generateTestQueries(): Array<{ query: string; type: string; expectedTopics: string[] }> {
    return [
      {
        query: 'What are the benefits of using TypeScript?',
        type: 'factual',
        expectedTopics: ['typescript', 'programming', 'benefits'],
      },
      {
        query: 'How do I optimize React hooks performance?',
        type: 'how-to',
        expectedTopics: ['react', 'hooks', 'performance'],
      },
      {
        query: 'Compare GraphQL and REST APIs',
        type: 'comparison',
        expectedTopics: ['graphql', 'rest', 'api'],
      },
      {
        query: 'Explain microservices architecture patterns',
        type: 'explanation',
        expectedTopics: ['microservices', 'architecture', 'patterns'],
      },
    ];
  },

  /**
   * Generate expected responses for validation testing
   */
  generateExpectedResponses() {
    return {
      'typescript benefits': {
        answer:
          'TypeScript provides static type checking, improved IDE support, and better code maintainability',
        confidence: 0.9,
        sources: [{ content: 'TypeScript adds static type definitions...', relevance: 0.95 }],
      },
      'react hooks performance': {
        answer: 'Use useMemo, useCallback, and React.memo to optimize React hooks performance',
        confidence: 0.85,
        keyPoints: ['useMemo', 'useCallback', 'React.memo', 'dependency arrays'],
      },
    };
  },
};

/**
 * Usage examples for testing
 */
export const examples = {
  /**
   * Basic test setup
   */
  basicTest: `
import { RAGTestFixture, RAGQualityTester, testDataGenerators } from './test-utils';

describe('RAG System Tests', () => {
  let fixture: RAGTestFixture;

  beforeEach(() => {
    fixture = new RAGTestFixture()
      .withDocuments(testDataGenerators.generateTestDocuments(5))
      .withQueryResults([
        { content: 'TypeScript provides static typing...', score: 0.9, metadata: { id: 'doc_1' } },
        { content: 'Benefits include better IDE support...', score: 0.8, metadata: { id: 'doc_2' } },
      ])
      .withMockResponses({
        'typescript': {
          answer: 'TypeScript is a typed superset of JavaScript',
          confidence: 0.9,
          sources: [],
        },
      });
  });

  afterEach(() => {
    fixture.reset();
  });

  test('should generate structured Q&A response', async () => {
    const ragService = fixture.buildStructuredRAG();
    
    const response = await ragService.generateQA('What is TypeScript?');
    
    expect(response.answer).toContain('TypeScript');
    expect(response.confidence).toBeGreaterThan(0.7);
    expect(fixture.getLanguageModel().getCallHistory()).toHaveLength(1);
  });
});
  `,

  /**
   * Quality testing example
   */
  qualityTest: `
const qualityResults = await RAGQualityTester.testResponseQuality(
  ragService,
  [
    {
      query: 'What are the benefits of TypeScript?',
      schema: ragSchemas.qa,
      expectedCriteria: {
        minConfidence: 0.8,
        requiredKeywords: ['typescript', 'benefits'],
        minSources: 2,
        maxResponseTime: 5000,
      },
      description: 'TypeScript benefits question',
    },
  ]
);

qualityResults.forEach(result => {
  console.log(\`Query: \${result.query}\`);
  console.log(\`Passed: \${result.passed}\`);
  console.log(\`Quality Score: \${result.validation?.qualityScore}\`);
});
  `,

  /**
   * Performance benchmarking
   */
  performanceBench: `
const benchmark = await RAGQualityTester.benchmarkPerformance(
  ragService,
  ['What is TypeScript?', 'How do React hooks work?', 'Explain microservices'],
  3 // iterations
);

console.log(\`Average Response Time: \${benchmark.averageResponseTime}ms\`);
console.log(\`Success Rate: \${(benchmark.successRate * 100).toFixed(1)}%\`);
console.log(\`Min/Max Response Time: \${benchmark.minResponseTime}ms / \${benchmark.maxResponseTime}ms\`);
  `,
};
