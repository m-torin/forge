/**
 * RAG Evaluation and Metrics for AI SDK v5
 * Comprehensive evaluation framework for RAG system performance
 */

import { logInfo } from '@repo/observability/server/next';
import { generateEmbedding } from './ai-sdk-rag';

/**
 * Evaluation result for a single query
 */
export interface RAGEvaluationResult {
  queryId: string;
  query: string;
  retrievedDocs: Array<{
    id: string;
    content: string;
    score: number;
    relevant?: boolean;
    rank: number;
  }>;
  generatedAnswer: string;
  groundTruthAnswer?: string;
  metrics: {
    // Retrieval metrics
    precision: number;
    recall: number;
    f1Score: number;
    map: number; // Mean Average Precision
    ndcg: number; // Normalized Discounted Cumulative Gain
    mrr: number; // Mean Reciprocal Rank

    // Generation metrics
    bleuScore?: number;
    rougeScore?: number;
    semanticSimilarity?: number;

    // Combined metrics
    ragasScore?: number;
    contextRelevance: number;
    answerRelevance: number;
    faithfulness: number;
  };
  timestamp: number;
}

/**
 * Evaluation dataset entry
 */
export interface EvaluationDataEntry {
  queryId: string;
  query: string;
  groundTruthAnswer: string;
  relevantDocIds: string[];
  context?: string;
  expectedSources?: string[];
}

/**
 * Evaluation configuration
 */
export interface EvaluationConfig {
  // Metrics to compute
  computeRetrievalMetrics?: boolean;
  computeGenerationMetrics?: boolean;
  computeSemanticSimilarity?: boolean;

  // Thresholds
  relevanceThreshold?: number;
  semanticThreshold?: number;

  // Top-K evaluations
  topKValues?: number[];

  // Advanced metrics
  enableRAGAS?: boolean;
  enableCustomMetrics?: boolean;
}

/**
 * RAG evaluation framework
 */
export class RAGEvaluationFramework {
  private config: Required<EvaluationConfig>;

  constructor(config: EvaluationConfig = {}) {
    this.config = {
      computeRetrievalMetrics: true,
      computeGenerationMetrics: true,
      computeSemanticSimilarity: true,
      relevanceThreshold: 0.7,
      semanticThreshold: 0.8,
      topKValues: [1, 3, 5, 10],
      enableRAGAS: true,
      enableCustomMetrics: false,
      ...config,
    };
  }

  /**
   * Evaluate RAG system performance on a dataset
   */
  async evaluateDataset(
    dataset: EvaluationDataEntry[],
    ragFunction: (query: string) => Promise<{
      retrievedDocs: Array<{ id: string; content: string; score: number }>;
      generatedAnswer: string;
    }>,
  ): Promise<{
    results: RAGEvaluationResult[];
    aggregatedMetrics: {
      meanPrecision: number;
      meanRecall: number;
      meanF1: number;
      meanMAP: number;
      meanNDCG: number;
      meanMRR: number;
      meanSemanticSimilarity?: number;
      meanContextRelevance: number;
      meanAnswerRelevance: number;
      meanFaithfulness: number;
    };
  }> {
    logInfo('Starting RAG evaluation', {
      operation: 'rag_evaluation_start',
      datasetSize: dataset.length,
      topKValues: this.config.topKValues,
    });

    const results: RAGEvaluationResult[] = [];

    for (const entry of dataset) {
      try {
        const result = await this.evaluateSingleQuery(entry, ragFunction);
        results.push(result);
      } catch (error) {
        logInfo('Failed to evaluate query', {
          operation: 'rag_evaluation_query_failed',
          queryId: entry.queryId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const aggregatedMetrics = this.aggregateMetrics(results);

    logInfo('RAG evaluation completed', {
      operation: 'rag_evaluation_completed',
      evaluatedQueries: results.length,
      meanPrecision: aggregatedMetrics.meanPrecision,
      meanRecall: aggregatedMetrics.meanRecall,
      meanF1: aggregatedMetrics.meanF1,
    });

    return { results, aggregatedMetrics };
  }

  /**
   * Evaluate a single query
   */
  async evaluateSingleQuery(
    entry: EvaluationDataEntry,
    ragFunction: (query: string) => Promise<{
      retrievedDocs: Array<{ id: string; content: string; score: number }>;
      generatedAnswer: string;
    }>,
  ): Promise<RAGEvaluationResult> {
    const startTime = Date.now();

    // Get RAG results
    const ragResult = await ragFunction(entry.query);

    // Mark retrieved docs as relevant/irrelevant
    const retrievedDocsWithRelevance = ragResult.retrievedDocs.map((doc, index) => ({
      ...doc,
      relevant: entry.relevantDocIds.includes(doc.id),
      rank: index + 1,
    }));

    // Compute metrics
    const metrics = await this.computeMetrics(
      entry,
      retrievedDocsWithRelevance,
      ragResult.generatedAnswer,
    );

    const result: RAGEvaluationResult = {
      queryId: entry.queryId,
      query: entry.query,
      retrievedDocs: retrievedDocsWithRelevance,
      generatedAnswer: ragResult.generatedAnswer,
      groundTruthAnswer: entry.groundTruthAnswer,
      metrics,
      timestamp: Date.now(),
    };

    const evaluationTime = Date.now() - startTime;
    logInfo('Single query evaluation completed', {
      operation: 'rag_evaluation_single_query',
      queryId: entry.queryId,
      evaluationTime,
      precision: metrics.precision,
      recall: metrics.recall,
    });

    return result;
  }

  /**
   * Compute all metrics for a query result
   */
  private async computeMetrics(
    entry: EvaluationDataEntry,
    retrievedDocs: Array<{
      id: string;
      content: string;
      score: number;
      relevant?: boolean;
      rank: number;
    }>,
    generatedAnswer: string,
  ): Promise<RAGEvaluationResult['metrics']> {
    const metrics: RAGEvaluationResult['metrics'] = {
      precision: 0,
      recall: 0,
      f1Score: 0,
      map: 0,
      ndcg: 0,
      mrr: 0,
      contextRelevance: 0,
      answerRelevance: 0,
      faithfulness: 0,
    };

    // Retrieval metrics
    if (this.config.computeRetrievalMetrics) {
      const retrievalMetrics = this.computeRetrievalMetrics(retrievedDocs, entry.relevantDocIds);
      Object.assign(metrics, retrievalMetrics);
    }

    // Generation metrics
    if (this.config.computeGenerationMetrics && entry.groundTruthAnswer) {
      const generationMetrics = await this.computeGenerationMetrics(
        generatedAnswer,
        entry.groundTruthAnswer,
      );
      Object.assign(metrics, generationMetrics);
    }

    // RAGAS metrics
    if (this.config.enableRAGAS) {
      const ragasMetrics = await this.computeRAGASMetrics(
        entry.query,
        retrievedDocs,
        generatedAnswer,
        entry.groundTruthAnswer,
      );
      Object.assign(metrics, ragasMetrics);
    }

    return metrics;
  }

  /**
   * Compute retrieval metrics (precision, recall, F1, MAP, NDCG, MRR)
   */
  private computeRetrievalMetrics(
    retrievedDocs: Array<{ relevant?: boolean; rank: number }>,
    relevantDocIds: string[],
  ): Partial<RAGEvaluationResult['metrics']> {
    const totalRelevant = relevantDocIds.length;
    const retrievedRelevant = retrievedDocs.filter(doc => doc.relevant).length;
    const totalRetrieved = retrievedDocs.length;

    // Basic metrics
    const precision = totalRetrieved > 0 ? retrievedRelevant / totalRetrieved : 0;
    const recall = totalRelevant > 0 ? retrievedRelevant / totalRelevant : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    // Mean Average Precision (MAP)
    let map = 0;
    let relevantFound = 0;
    for (let i = 0; i < retrievedDocs.length; i++) {
      if (retrievedDocs[i].relevant) {
        relevantFound++;
        map += relevantFound / (i + 1);
      }
    }
    map = totalRelevant > 0 ? map / totalRelevant : 0;

    // Normalized Discounted Cumulative Gain (NDCG)
    const dcg = retrievedDocs.reduce((sum, doc, index) => {
      const relevance = doc.relevant ? 1 : 0;
      return sum + relevance / Math.log2(index + 2);
    }, 0);

    const idealOrder = Array(Math.min(totalRelevant, retrievedDocs.length))
      .fill(1)
      .concat(Array(Math.max(0, retrievedDocs.length - totalRelevant)).fill(0));
    const idcg = idealOrder.reduce((sum, relevance, index) => {
      return sum + relevance / Math.log2(index + 2);
    }, 0);

    const ndcg = idcg > 0 ? dcg / idcg : 0;

    // Mean Reciprocal Rank (MRR)
    const firstRelevantIndex = retrievedDocs.findIndex(doc => doc.relevant);
    const mrr = firstRelevantIndex >= 0 ? 1 / (firstRelevantIndex + 1) : 0;

    return { precision, recall, f1Score, map, ndcg, mrr };
  }

  /**
   * Compute generation metrics (BLEU, ROUGE, semantic similarity)
   */
  private async computeGenerationMetrics(
    generatedAnswer: string,
    groundTruthAnswer: string,
  ): Promise<Partial<RAGEvaluationResult['metrics']>> {
    const metrics: Partial<RAGEvaluationResult['metrics']> = {};

    // BLEU Score (simplified implementation)
    metrics.bleuScore = this.calculateBLEU(generatedAnswer, groundTruthAnswer);

    // ROUGE Score (simplified implementation)
    metrics.rougeScore = this.calculateROUGE(generatedAnswer, groundTruthAnswer);

    // Semantic similarity using embeddings
    if (this.config.computeSemanticSimilarity) {
      try {
        const [genEmbedding, truthEmbedding] = await Promise.all([
          generateEmbedding(generatedAnswer),
          generateEmbedding(groundTruthAnswer),
        ]);
        metrics.semanticSimilarity = this.cosineSimilarity(genEmbedding, truthEmbedding);
      } catch (error) {
        logInfo('Failed to compute semantic similarity', {
          operation: 'rag_evaluation_semantic_similarity_failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return metrics;
  }

  /**
   * Compute RAGAS metrics (context relevance, answer relevance, faithfulness)
   */
  private async computeRAGASMetrics(
    query: string,
    retrievedDocs: Array<{ content: string; relevant?: boolean }>,
    generatedAnswer: string,
    groundTruthAnswer?: string,
  ): Promise<Partial<RAGEvaluationResult['metrics']>> {
    // Context Relevance: How relevant is the retrieved context to the query?
    const contextRelevance = await this.computeContextRelevance(query, retrievedDocs);

    // Answer Relevance: How relevant is the generated answer to the query?
    const answerRelevance = await this.computeAnswerRelevance(query, generatedAnswer);

    // Faithfulness: How faithful is the generated answer to the retrieved context?
    const faithfulness = await this.computeFaithfulness(retrievedDocs, generatedAnswer);

    // Combined RAGAS score (harmonic mean)
    const ragasScore = groundTruthAnswer
      ? (3 * contextRelevance * answerRelevance * faithfulness) /
        (contextRelevance * answerRelevance +
          contextRelevance * faithfulness +
          answerRelevance * faithfulness)
      : undefined;

    return {
      contextRelevance,
      answerRelevance,
      faithfulness,
      ragasScore,
    };
  }

  /**
   * Compute context relevance using semantic similarity
   */
  private async computeContextRelevance(
    query: string,
    retrievedDocs: Array<{ content: string }>,
  ): Promise<number> {
    if (retrievedDocs.length === 0) return 0;

    try {
      const queryEmbedding = await generateEmbedding(query);
      const contextText = retrievedDocs.map(doc => doc.content).join(' ');
      const contextEmbedding = await generateEmbedding(contextText);

      return this.cosineSimilarity(queryEmbedding, contextEmbedding);
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Compute answer relevance using semantic similarity
   */
  private async computeAnswerRelevance(query: string, generatedAnswer: string): Promise<number> {
    try {
      const [queryEmbedding, answerEmbedding] = await Promise.all([
        generateEmbedding(query),
        generateEmbedding(generatedAnswer),
      ]);

      return this.cosineSimilarity(queryEmbedding, answerEmbedding);
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Compute faithfulness (simplified implementation)
   */
  private async computeFaithfulness(
    retrievedDocs: Array<{ content: string }>,
    generatedAnswer: string,
  ): Promise<number> {
    if (retrievedDocs.length === 0) return 0;

    // Simplified: check how much of the answer can be found in the context
    const contextText = retrievedDocs
      .map(doc => doc.content)
      .join(' ')
      .toLowerCase();
    const answerSentences = generatedAnswer.toLowerCase().split(/[.!?]+/);

    let supportedSentences = 0;

    for (const sentence of answerSentences) {
      if (sentence.trim().length < 10) continue;

      const words = sentence.trim().split(/\s+/);
      let supportedWords = 0;

      for (const word of words) {
        if (word.length > 3 && contextText.includes(word)) {
          supportedWords++;
        }
      }

      if (supportedWords / words.length > 0.5) {
        supportedSentences++;
      }
    }

    return answerSentences.length > 0 ? supportedSentences / answerSentences.length : 0;
  }

  /**
   * Calculate BLEU score (simplified implementation)
   */
  private calculateBLEU(generated: string, reference: string): number {
    const genTokens = generated.toLowerCase().split(/\s+/);
    const refTokens = reference.toLowerCase().split(/\s+/);

    if (genTokens.length === 0) return 0;

    // Unigram precision
    let matches = 0;
    const refTokenCount = new Map<string, number>();

    refTokens.forEach(token => {
      refTokenCount.set(token, (refTokenCount.get(token) || 0) + 1);
    });

    genTokens.forEach(token => {
      const count = refTokenCount.get(token) || 0;
      if (count > 0) {
        matches++;
        refTokenCount.set(token, count - 1);
      }
    });

    const precision = matches / genTokens.length;

    // Brevity penalty
    const bp =
      genTokens.length >= refTokens.length ? 1 : Math.exp(1 - refTokens.length / genTokens.length);

    return bp * precision;
  }

  /**
   * Calculate ROUGE score (simplified ROUGE-1 implementation)
   */
  private calculateROUGE(generated: string, reference: string): number {
    const genTokens = new Set(generated.toLowerCase().split(/\s+/));
    const refTokens = new Set(reference.toLowerCase().split(/\s+/));

    if (refTokens.size === 0) return 0;

    let overlap = 0;
    refTokens.forEach(token => {
      if (genTokens.has(token)) {
        overlap++;
      }
    });

    return overlap / refTokens.size; // ROUGE-1 recall
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Aggregate metrics across all evaluation results
   */
  private aggregateMetrics(results: RAGEvaluationResult[]): {
    meanPrecision: number;
    meanRecall: number;
    meanF1: number;
    meanMAP: number;
    meanNDCG: number;
    meanMRR: number;
    meanSemanticSimilarity?: number;
    meanContextRelevance: number;
    meanAnswerRelevance: number;
    meanFaithfulness: number;
  } {
    if (results.length === 0) {
      return {
        meanPrecision: 0,
        meanRecall: 0,
        meanF1: 0,
        meanMAP: 0,
        meanNDCG: 0,
        meanMRR: 0,
        meanContextRelevance: 0,
        meanAnswerRelevance: 0,
        meanFaithfulness: 0,
      };
    }

    const sum = results.reduce(
      (acc, result) => ({
        precision: acc.precision + result.metrics.precision,
        recall: acc.recall + result.metrics.recall,
        f1Score: acc.f1Score + result.metrics.f1Score,
        map: acc.map + result.metrics.map,
        ndcg: acc.ndcg + result.metrics.ndcg,
        mrr: acc.mrr + result.metrics.mrr,
        semanticSimilarity: acc.semanticSimilarity + (result.metrics.semanticSimilarity || 0),
        contextRelevance: acc.contextRelevance + result.metrics.contextRelevance,
        answerRelevance: acc.answerRelevance + result.metrics.answerRelevance,
        faithfulness: acc.faithfulness + result.metrics.faithfulness,
      }),
      {
        precision: 0,
        recall: 0,
        f1Score: 0,
        map: 0,
        ndcg: 0,
        mrr: 0,
        semanticSimilarity: 0,
        contextRelevance: 0,
        answerRelevance: 0,
        faithfulness: 0,
      },
    );

    const count = results.length;
    const semanticSimilarityCount = results.filter(
      r => r.metrics.semanticSimilarity !== undefined,
    ).length;

    return {
      meanPrecision: sum.precision / count,
      meanRecall: sum.recall / count,
      meanF1: sum.f1Score / count,
      meanMAP: sum.map / count,
      meanNDCG: sum.ndcg / count,
      meanMRR: sum.mrr / count,
      meanSemanticSimilarity:
        semanticSimilarityCount > 0 ? sum.semanticSimilarity / semanticSimilarityCount : undefined,
      meanContextRelevance: sum.contextRelevance / count,
      meanAnswerRelevance: sum.answerRelevance / count,
      meanFaithfulness: sum.faithfulness / count,
    };
  }
}

/**
 * Factory function for creating evaluation framework
 */
export function createRAGEvaluationFramework(config?: EvaluationConfig): RAGEvaluationFramework {
  return new RAGEvaluationFramework(config);
}

/**
 * Utility function to create evaluation dataset from CSV or JSON
 */
export function createEvaluationDataset(
  data: Array<{
    query: string;
    groundTruthAnswer: string;
    relevantDocIds: string[];
    context?: string;
  }>,
): EvaluationDataEntry[] {
  return data.map((entry, index) => ({
    queryId: `eval_${index}`,
    query: entry.query,
    groundTruthAnswer: entry.groundTruthAnswer,
    relevantDocIds: entry.relevantDocIds,
    context: entry.context,
  }));
}

/**
 * Utility function to export evaluation results
 */
export function exportEvaluationResults(
  results: RAGEvaluationResult[],
  format: 'json' | 'csv' = 'json',
): string {
  if (format === 'csv') {
    const headers = [
      'queryId',
      'query',
      'precision',
      'recall',
      'f1Score',
      'map',
      'ndcg',
      'mrr',
      'semanticSimilarity',
      'contextRelevance',
      'answerRelevance',
      'faithfulness',
    ];

    const rows = results.map(result => [
      result.queryId,
      `"${result.query.replace(/"/g, '""')}"`,
      result.metrics.precision.toFixed(4),
      result.metrics.recall.toFixed(4),
      result.metrics.f1Score.toFixed(4),
      result.metrics.map.toFixed(4),
      result.metrics.ndcg.toFixed(4),
      result.metrics.mrr.toFixed(4),
      (result.metrics.semanticSimilarity || 0).toFixed(4),
      result.metrics.contextRelevance.toFixed(4),
      result.metrics.answerRelevance.toFixed(4),
      result.metrics.faithfulness.toFixed(4),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  return JSON.stringify(results, null, 2);
}
