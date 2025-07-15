/**
 * RAG Performance Benchmarking and Evaluation Example
 * Comprehensive testing suite for RAG system performance and accuracy
 */

import { openai } from '@ai-sdk/openai';
import {
  createEvaluationDataset,
  createHybridSearch,
  createProductionRAG,
  createRAGEvaluationFramework,
  defaultBenchmarkConfig,
  getProductionConfig,
  type BenchmarkConfig,
} from '../index';

/**
 * Performance metrics tracking
 */
interface PerformanceMetrics {
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per second
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * Accuracy metrics tracking
 */
interface AccuracyMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  semanticSimilarity: number;
  answerRelevance: number;
  contextRelevance: number;
  faithfulness: number;
}

/**
 * Complete benchmark result
 */
interface BenchmarkResult {
  config: string;
  performance: PerformanceMetrics;
  accuracy: AccuracyMetrics;
  testDetails: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    duration: number;
    concurrency: number;
  };
  resourceUsage: {
    peakMemoryMB: number;
    averageCpuPercent: number;
    networkRequestsMade: number;
  };
}

/**
 * Comprehensive RAG benchmarking suite
 */
export class RAGBenchmarkSuite {
  private configurations: Map<string, any> = new Map();
  private results: Map<string, BenchmarkResult> = new Map();

  constructor() {
    // Initialize different configurations to test
    this.configurations.set('production', getProductionConfig('production'));
    this.configurations.set('enterprise', getProductionConfig('enterprise'));
    this.configurations.set('economy', getProductionConfig('economy'));
    this.configurations.set('realtime', getProductionConfig('realtime'));
  }

  /**
   * Run comprehensive benchmark across all configurations
   */
  async runCompleteBenchmark(
    customConfig?: Partial<BenchmarkConfig>,
  ): Promise<Map<string, BenchmarkResult>> {
    const config = { ...defaultBenchmarkConfig, ...customConfig };

    console.log('Starting comprehensive RAG benchmark...');
    console.log(`Configurations: ${Array.from(this.configurations.keys()).join(', ')}`);
    console.log(`Test parameters:`, config);

    for (const [configName, ragConfig] of this.configurations) {
      console.log(`
🧪 Benchmarking configuration: ${configName}`);

      try {
        const result = await this.benchmarkConfiguration(configName, ragConfig, config);
        this.results.set(configName, result);

        console.log(
          `✅ ${configName}: ${result.performance.averageResponseTime.toFixed(0)}ms avg, ${result.accuracy.f1Score.toFixed(3)} F1`,
        );
      } catch (error) {
        console.error(`❌ ${configName} failed:`, error);
      }
    }

    return this.results;
  }

  /**
   * Benchmark a specific configuration
   */
  private async benchmarkConfiguration(
    configName: string,
    ragConfig: any,
    benchmarkConfig: BenchmarkConfig,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();

    // Initialize RAG system with the configuration
    const ragSystem = createProductionRAG({
      languageModel: openai('gpt-4o'),
      databaseConfig: {
        namespace: `benchmark-${configName}`,
        useUpstashEmbedding: false,
      },
      ...ragConfig,
    });

    // Create hybrid search for testing
    const hybridSearch = createHybridSearch(ragSystem.vectorStore, ragConfig.hybridSearch);

    // Prepare test data
    await this.prepareTestData(ragSystem);

    // Run warmup
    console.log(`  🔥 Running ${benchmarkConfig.warmupRuns} warmup queries...`);
    await this.runWarmup(ragSystem, benchmarkConfig);

    // Run performance tests
    console.log(`  ⚡ Running performance tests...`);
    const performanceMetrics = await this.measurePerformance(
      ragSystem,
      hybridSearch,
      benchmarkConfig,
    );

    // Run accuracy tests
    console.log(`  🎯 Running accuracy tests...`);
    const accuracyMetrics = await this.measureAccuracy(ragSystem, hybridSearch, benchmarkConfig);

    // Measure resource usage
    const resourceUsage = await this.measureResourceUsage();

    const totalDuration = Date.now() - startTime;

    return {
      config: configName,
      performance: performanceMetrics,
      accuracy: accuracyMetrics,
      testDetails: {
        totalQueries: benchmarkConfig.iterations,
        successfulQueries:
          benchmarkConfig.iterations -
          Math.floor(benchmarkConfig.iterations * performanceMetrics.errorRate),
        failedQueries: Math.floor(benchmarkConfig.iterations * performanceMetrics.errorRate),
        duration: totalDuration,
        concurrency: benchmarkConfig.concurrency,
      },
      resourceUsage,
    };
  }

  /**
   * Prepare test data for benchmarking
   */
  private async prepareTestData(ragSystem: any) {
    const testDocuments = [
      {
        content:
          'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming.',
        title: 'Machine Learning Basics',
        metadata: { category: 'education', difficulty: 'beginner' },
      },
      {
        content:
          'Deep learning utilizes neural networks with multiple hidden layers to process complex data patterns and make predictions.',
        title: 'Deep Learning Overview',
        metadata: { category: 'technical', difficulty: 'advanced' },
      },
      {
        content:
          'Natural language processing enables computers to understand, interpret, and generate human language through various computational techniques.',
        title: 'NLP Fundamentals',
        metadata: { category: 'linguistics', difficulty: 'intermediate' },
      },
      // Add more test documents...
    ];

    // Add documents to the vector store
    await ragSystem.vectorStore.addDocuments(testDocuments);
  }

  /**
   * Run warmup queries to stabilize performance
   */
  private async runWarmup(ragSystem: any, config: BenchmarkConfig) {
    const warmupQueries = config.testQueries.slice(
      0,
      Math.min(config.warmupRuns, config.testQueries.length),
    );

    for (const query of warmupQueries) {
      try {
        await ragSystem.service.generateQA(query);
      } catch (error) {
        // Ignore warmup errors
      }
    }
  }

  /**
   * Measure performance metrics
   */
  private async measurePerformance(
    ragSystem: any,
    hybridSearch: any,
    config: BenchmarkConfig,
  ): Promise<PerformanceMetrics> {
    const responseTimes: number[] = [];
    let errorCount = 0;
    const startTime = Date.now();

    // Create batches for concurrent testing
    const batches = this.createBatches(config.testQueries, config.iterations, config.concurrency);

    for (const batch of batches) {
      const batchPromises = batch.map(async query => {
        const queryStart = Date.now();
        try {
          // Test different operations
          const operations = [
            () => ragSystem.vectorStore.queryDocuments(query, { topK: 5 }),
            () => hybridSearch.search(query),
            () => ragSystem.service.generateQA(query),
          ];

          // Run random operation
          const operation = operations[Math.floor(Math.random() * operations.length)];
          await operation();

          const responseTime = Date.now() - queryStart;
          responseTimes.push(responseTime);
        } catch (error) {
          errorCount++;
          responseTimes.push(Date.now() - queryStart); // Include failed request time
        }
      });

      await Promise.all(batchPromises);
    }

    const totalDuration = Date.now() - startTime;
    const sortedTimes = responseTimes.sort((a, b) => a - b);

    return {
      averageResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      throughput: (responseTimes.length / totalDuration) * 1000, // requests per second
      errorRate: errorCount / responseTimes.length,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: 0, // Would require additional monitoring
    };
  }

  /**
   * Measure accuracy metrics using evaluation framework
   */
  private async measureAccuracy(
    ragSystem: any,
    hybridSearch: any,
    config: BenchmarkConfig,
  ): Promise<AccuracyMetrics> {
    if (!config.evaluateAccuracy) {
      return {
        precision: 0,
        recall: 0,
        f1Score: 0,
        semanticSimilarity: 0,
        answerRelevance: 0,
        contextRelevance: 0,
        faithfulness: 0,
      };
    }

    // Create evaluation framework
    const evaluator = createRAGEvaluationFramework({
      computeRetrievalMetrics: true,
      computeGenerationMetrics: true,
      enableRAGAS: true,
    });

    // Create evaluation dataset
    const evaluationData = createEvaluationDataset([
      {
        query: 'What is machine learning?',
        groundTruthAnswer:
          'Machine learning is a subset of artificial intelligence that enables computers to learn from data.',
        relevantDocIds: ['ml-basics'],
      },
      {
        query: 'How do neural networks work?',
        groundTruthAnswer:
          'Neural networks process information through interconnected nodes that simulate brain neurons.',
        relevantDocIds: ['neural-networks'],
      },
      // Add more evaluation cases...
    ]);

    // Run evaluation
    const evaluationResults = await evaluator.evaluateDataset(evaluationData, async query => {
      const searchResults = await hybridSearch.search(query);
      const answer = await ragSystem.service.generateQA(query);

      return {
        retrievedDocs: searchResults,
        generatedAnswer: answer,
      };
    });

    return {
      precision: evaluationResults.aggregatedMetrics.meanPrecision,
      recall: evaluationResults.aggregatedMetrics.meanRecall,
      f1Score: evaluationResults.aggregatedMetrics.meanF1,
      semanticSimilarity: evaluationResults.aggregatedMetrics.meanSemanticSimilarity || 0,
      answerRelevance: evaluationResults.aggregatedMetrics.meanAnswerRelevance,
      contextRelevance: evaluationResults.aggregatedMetrics.meanContextRelevance,
      faithfulness: evaluationResults.aggregatedMetrics.meanFaithfulness,
    };
  }

  /**
   * Measure resource usage
   */
  private async measureResourceUsage() {
    const memUsage = process.memoryUsage();

    return {
      peakMemoryMB: memUsage.heapUsed / 1024 / 1024,
      averageCpuPercent: 0, // Would require system monitoring
      networkRequestsMade: 0, // Would require request counting
    };
  }

  /**
   * Create batches for concurrent testing
   */
  private createBatches(queries: string[], iterations: number, concurrency: number): string[][] {
    const batches: string[][] = [];
    const totalQueries: string[] = [];

    // Repeat queries to reach desired iterations
    for (let i = 0; i < iterations; i++) {
      totalQueries.push(queries[i % queries.length]);
    }

    // Create batches for concurrent execution
    for (let i = 0; i < totalQueries.length; i += concurrency) {
      batches.push(totalQueries.slice(i, i + concurrency));
    }

    return batches;
  }

  /**
   * Generate benchmark report
   */
  generateReport(): string {
    let report = '# RAG Benchmark Report\n\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Performance comparison
    report += '## Performance Comparison\n\n';
    report +=
      '| Configuration | Avg Response (ms) | P95 (ms) | Throughput (req/s) | Error Rate |\n';
    report += '|---------------|-------------------|----------|-------------------|------------|\n';

    for (const [config, result] of this.results) {
      report += `| ${config} | ${result.performance.averageResponseTime.toFixed(0)} | ${result.performance.p95ResponseTime.toFixed(0)} | ${result.performance.throughput.toFixed(2)} | ${(result.performance.errorRate * 100).toFixed(2)}% |\n`;
    }

    // Accuracy comparison
    report += '\n## Accuracy Comparison\n\n';
    report += '| Configuration | Precision | Recall | F1 Score | Faithfulness |\n';
    report += '|---------------|-----------|--------|----------|-------------|\n';

    for (const [config, result] of this.results) {
      report += `| ${config} | ${result.accuracy.precision.toFixed(3)} | ${result.accuracy.recall.toFixed(3)} | ${result.accuracy.f1Score.toFixed(3)} | ${result.accuracy.faithfulness.toFixed(3)} |\n`;
    }

    // Recommendations
    report += '\n## Recommendations\n\n';
    const bestPerformance = this.getBestConfiguration('performance');
    const bestAccuracy = this.getBestConfiguration('accuracy');

    report += `- **Best Performance**: ${bestPerformance} (${this.results.get(bestPerformance)?.performance.averageResponseTime.toFixed(0)}ms avg)\n`;
    report += `- **Best Accuracy**: ${bestAccuracy} (${this.results.get(bestAccuracy)?.accuracy.f1Score.toFixed(3)} F1)\n`;
    report += `- **Best Balance**: Consider the configuration that meets your performance requirements while maintaining acceptable accuracy\n`;

    return report;
  }

  /**
   * Get best configuration for a specific metric
   */
  private getBestConfiguration(metric: 'performance' | 'accuracy'): string {
    let bestConfig = '';
    let bestValue = metric === 'performance' ? Infinity : -Infinity;

    for (const [config, result] of this.results) {
      const value =
        metric === 'performance' ? result.performance.averageResponseTime : result.accuracy.f1Score;

      if (metric === 'performance' && value < bestValue) {
        bestValue = value;
        bestConfig = config;
      } else if (metric === 'accuracy' && value > bestValue) {
        bestValue = value;
        bestConfig = config;
      }
    }

    return bestConfig;
  }

  /**
   * Export results to JSON
   */
  exportResults(filename?: string): string {
    const resultsObject = Object.fromEntries(this.results);
    const json = JSON.stringify(resultsObject, null, 2);

    if (filename) {
      require('fs').writeFileSync(filename, json);
    }

    return json;
  }
}

/**
 * Example usage
 */
export async function runBenchmarkExample() {
  const benchmark = new RAGBenchmarkSuite();

  // Run comprehensive benchmark
  const results = await benchmark.runCompleteBenchmark({
    iterations: 50,
    concurrency: 3,
    warmupRuns: 5,
    evaluateAccuracy: true,
    evaluateSpeed: true,
  });

  // Generate and display report
  const report = benchmark.generateReport();
  console.log(report);

  // Export results
  const jsonResults = benchmark.exportResults('benchmark-results.json');

  return {
    results,
    report,
    jsonResults,
  };
}

/**
 * Quick performance test for development
 */
export async function quickPerformanceTest(ragSystem: any) {
  const testQueries = [
    'What is machine learning?',
    'How do neural networks work?',
    'Explain natural language processing',
  ];

  console.log('Running quick performance test...');

  const results = [];
  for (const query of testQueries) {
    const start = Date.now();
    try {
      await ragSystem.service.generateQA(query);
      const duration = Date.now() - start;
      results.push({ query, duration, success: true });
      console.log(`✅ "${query}": ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      results.push({ query, duration, success: false, error });
      console.log(`❌ "${query}": ${duration}ms (failed)`);
    }
  }

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const successRate = results.filter(r => r.success).length / results.length;

  console.log(
    `
Summary: ${avgDuration.toFixed(0)}ms average, ${(successRate * 100).toFixed(0)}% success rate`,
  );

  return results;
}
