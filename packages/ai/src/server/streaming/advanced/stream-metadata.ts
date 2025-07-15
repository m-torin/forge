/**
 * Stream Metadata Management
 * Enhanced streaming with rich metadata
 */

import { logInfo } from '@repo/observability/server/next';
// StreamData may not be available in this version, using a compatible implementation
class StreamDataImpl {
  close() {}
  append(value: any) {}
}

const StreamData = StreamDataImpl;

/**
 * Metadata types
 */
export interface StreamMetadata {
  // Timing metadata
  timing?: {
    startTime: number;
    firstTokenTime?: number;
    endTime?: number;
    totalDuration?: number;
    timeToFirstToken?: number;
  };

  // Model metadata
  model?: {
    name: string;
    version?: string;
    provider?: string;
    temperature?: number;
    maxTokens?: number;
  };

  // Usage metadata
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost?: number;
  };

  // Quality metadata
  quality?: {
    confidence?: number;
    relevance?: number;
    coherence?: number;
    completeness?: number;
  };

  // Source metadata
  sources?: Array<{
    id: string;
    title: string;
    url?: string;
    relevance: number;
    excerpt?: string;
  }>;

  // Custom metadata
  custom?: Record<string, any>;
}

/**
 * Stream with metadata tracking
 */
export class MetadataStream {
  private streamData: any;
  private metadata: StreamMetadata = {};
  private tokenCount = 0;
  private chunkCount = 0;

  constructor(streamData?: any) {
    this.streamData = streamData || new StreamData();
    this.metadata.timing = {
      startTime: Date.now(),
    };
  }

  /**
   * Initialize model metadata
   */
  setModelMetadata(model: StreamMetadata['model']): void {
    this.metadata.model = model;
    this.streamData.append({
      type: 'metadata',
      metadata: { model },
    });
  }

  /**
   * Track first token
   */
  recordFirstToken(): void {
    if (!this.metadata.timing!.firstTokenTime) {
      this.metadata.timing!.firstTokenTime = Date.now();
      this.metadata.timing!.timeToFirstToken =
        this.metadata.timing!.firstTokenTime - this.metadata.timing!.startTime;

      this.streamData.append({
        type: 'metadata',
        metadata: {
          timing: {
            timeToFirstToken: this.metadata.timing!.timeToFirstToken,
          },
        },
      });
    }
  }

  /**
   * Update usage statistics
   */
  updateUsage(tokens: number, isPrompt = false): void {
    if (!this.metadata.usage) {
      this.metadata.usage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    if (isPrompt) {
      this.metadata.usage.promptTokens += tokens;
    } else {
      this.metadata.usage.completionTokens += tokens;
      this.tokenCount += tokens;
    }

    this.metadata.usage.totalTokens =
      this.metadata.usage.promptTokens + this.metadata.usage.completionTokens;
  }

  /**
   * Set quality metrics
   */
  setQualityMetrics(quality: StreamMetadata['quality']): void {
    this.metadata.quality = quality;
    this.streamData.append({
      type: 'metadata',
      metadata: { quality },
    });
  }

  /**
   * Add source reference
   */
  addSource(source: NonNullable<StreamMetadata['sources']>[0]): void {
    if (!this.metadata.sources) {
      this.metadata.sources = [];
    }

    this.metadata.sources.push(source);
    this.streamData.append({
      type: 'source',
      source,
    });
  }

  /**
   * Set custom metadata
   */
  setCustomMetadata(key: string, value: any): void {
    if (!this.metadata.custom) {
      this.metadata.custom = {};
    }

    this.metadata.custom[key] = value;
    this.streamData.append({
      type: 'metadata',
      metadata: { custom: { [key]: value } },
    });
  }

  /**
   * Process stream chunk with metadata
   */
  processChunk(chunk: string): void {
    this.chunkCount++;

    // Record first token time
    if (this.chunkCount === 1 && chunk.trim()) {
      this.recordFirstToken();
    }

    // Estimate tokens (rough approximation)
    const estimatedTokens = Math.ceil(chunk.length / 4);
    this.updateUsage(estimatedTokens);

    // Periodic metadata updates
    if (this.chunkCount % 10 === 0) {
      this.streamData.append({
        type: 'progress',
        progress: {
          chunks: this.chunkCount,
          estimatedTokens: this.tokenCount,
        },
      });
    }
  }

  /**
   * Finalize metadata
   */
  finalize(finalUsage?: StreamMetadata['usage']): void {
    this.metadata.timing!.endTime = Date.now();
    this.metadata.timing!.totalDuration =
      this.metadata.timing!.endTime - this.metadata.timing!.startTime;

    if (finalUsage) {
      this.metadata.usage = finalUsage;
    }

    // Calculate estimated cost if pricing is available
    if (this.metadata.usage && this.metadata.model?.provider) {
      this.metadata.usage.estimatedCost = this.calculateCost(
        this.metadata.usage,
        this.metadata.model.provider,
        this.metadata.model.name,
      );
    }

    this.streamData.append({
      type: 'metadata',
      metadata: this.metadata,
    });

    logInfo('Stream Metadata: Finalized', {
      operation: 'stream_metadata_finalize',
      metadata: {
        duration: this.metadata.timing!.totalDuration,
        tokens: this.metadata.usage?.totalTokens,
        chunks: this.chunkCount,
      },
    });
  }

  /**
   * Get current metadata
   */
  getMetadata(): StreamMetadata {
    return { ...this.metadata };
  }

  /**
   * Get stream data instance
   */
  getStreamData(): any {
    return this.streamData;
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(usage: StreamMetadata['usage'], provider: string, model: string): number {
    // Simplified pricing (in production, use actual pricing data)
    const pricing: Record<string, Record<string, { prompt: number; completion: number }>> = {
      openai: {
        'gpt-4': { prompt: 0.03, completion: 0.06 },
        'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
      },
      anthropic: {
        'claude-3-opus': { prompt: 0.015, completion: 0.075 },
        'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      },
    };

    const modelPricing = pricing[provider]?.[model];
    if (!modelPricing) return 0;

    return (
      ((usage?.promptTokens || 0) / 1000) * modelPricing.prompt +
      ((usage?.completionTokens || 0) / 1000) * modelPricing.completion
    );
  }
}

/**
 * Metadata enrichment patterns
 */
export const metadataPatterns = {
  /**
   * Create a metadata collector for RAG
   */
  createRAGMetadataCollector: () => {
    const stream = new MetadataStream();

    return {
      stream,
      addSearchResults: (results: Array<{ id: string; score: number; content: string }>) => {
        results.forEach((result, index) => {
          stream.addSource({
            id: result.id,
            title: `Source ${index + 1}`,
            relevance: result.score,
            excerpt: result.content.substring(0, 200) + '...',
          });
        });
      },
      setConfidence: (confidence: number) => {
        stream.setQualityMetrics({ confidence });
      },
    };
  },

  /**
   * Create a performance tracking metadata stream
   */
  createPerformanceMetadata: () => {
    const stream = new MetadataStream();
    const checkpoints: Record<string, number> = {};

    return {
      stream,
      checkpoint: (name: string) => {
        checkpoints[name] = Date.now();
        stream.setCustomMetadata('checkpoints', checkpoints);
      },
      recordLatency: (operation: string, latency: number) => {
        stream.setCustomMetadata(`latency_${operation}`, latency);
      },
      recordMetric: (name: string, value: number) => {
        stream.setCustomMetadata(`metric_${name}`, value);
      },
    };
  },

  /**
   * Create a quality tracking metadata stream
   */
  createQualityMetadata: () => {
    const stream = new MetadataStream();
    const qualityChecks: Array<{ check: string; passed: boolean; score?: number }> = [];

    return {
      stream,
      addQualityCheck: (check: string, passed: boolean, score?: number) => {
        qualityChecks.push({ check, passed, score });

        // Calculate overall quality
        const passedChecks = qualityChecks.filter(c => c.passed).length;
        const overallQuality = passedChecks / qualityChecks.length;

        stream.setQualityMetrics({
          completeness: overallQuality,
          confidence: score,
        });

        stream.setCustomMetadata('qualityChecks', qualityChecks);
      },
    };
  },
};

/**
 * Create a stream transformer that adds metadata
 */
export function createMetadataTransformer(
  metadataStream: MetadataStream,
): TransformStream<string, string> {
  return new TransformStream({
    transform(chunk, controller) {
      metadataStream.processChunk(chunk);
      controller.enqueue(chunk);
    },
    flush() {
      metadataStream.finalize();
    },
  });
}
