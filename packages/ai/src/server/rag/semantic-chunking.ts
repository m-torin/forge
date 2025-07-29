/**
 * Semantic Chunking for RAG Documents
 * Advanced document chunking that preserves semantic meaning
 */

import type { EmbeddingModel } from 'ai';
import { embedMany } from 'ai';
import { trackRAGOperation } from './telemetry';

export interface SemanticChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  semanticScore: number;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    documentId: string;
    title?: string;
    [key: string]: any;
  };
}

export interface SemanticChunkingOptions {
  /** Target chunk size in characters */
  targetChunkSize?: number;
  /** Minimum chunk size */
  minChunkSize?: number;
  /** Maximum chunk size */
  maxChunkSize?: number;
  /** Similarity threshold for semantic boundaries */
  semanticThreshold?: number;
  /** Overlap between chunks */
  overlapSize?: number;
  /** Preserve paragraph boundaries */
  preserveParagraphs?: boolean;
  /** Preserve sentence boundaries */
  preserveSentences?: boolean;
}

export interface DocumentChunkingResult {
  chunks: SemanticChunk[];
  processingTime: number;
  averageChunkSize: number;
  semanticCoherence: number;
}

/**
 * Semantic Document Chunker
 * Uses embeddings to identify semantic boundaries for better chunking
 */
export class SemanticChunker {
  private embeddingModel: EmbeddingModel<string>;
  private options: Required<SemanticChunkingOptions>;

  constructor(embeddingModel: EmbeddingModel<string>, options: SemanticChunkingOptions = {}) {
    this.embeddingModel = embeddingModel;
    this.options = {
      targetChunkSize: options.targetChunkSize ?? 800,
      minChunkSize: options.minChunkSize ?? 200,
      maxChunkSize: options.maxChunkSize ?? 1200,
      semanticThreshold: options.semanticThreshold ?? 0.75,
      overlapSize: options.overlapSize ?? 100,
      preserveParagraphs: options.preserveParagraphs ?? true,
      preserveSentences: options.preserveSentences ?? true,
    };
  }

  /**
   * Chunk a document using semantic analysis
   */
  async chunkDocument(
    documentId: string,
    content: string,
    title?: string,
    metadata?: Record<string, any>,
  ): Promise<DocumentChunkingResult> {
    return trackRAGOperation('semantic_chunking', async tracker => {
      tracker.setDocumentProcessing(1, 0); // Will update chunk count later

      const startTime = Date.now();

      // Step 1: Split into sentences while preserving structure
      const sentences = this.extractSentences(content);

      if (sentences.length === 0) {
        const singleChunk: SemanticChunk = {
          id: `${documentId}_chunk_0`,
          content: content.trim(),
          startIndex: 0,
          endIndex: content.length,
          semanticScore: 1.0,
          metadata: {
            chunkIndex: 0,
            totalChunks: 1,
            documentId,
            title,
            ...metadata,
          },
        };

        const result: DocumentChunkingResult = {
          chunks: [singleChunk],
          processingTime: Date.now() - startTime,
          averageChunkSize: content.length,
          semanticCoherence: 1.0,
        };

        tracker.setDocumentProcessing(1, 1, 1);
        return result;
      }

      // Step 2: Create initial chunks based on size constraints
      const initialChunks = this.createInitialChunks(sentences);

      // Step 3: Generate embeddings for semantic analysis
      const chunkTexts = initialChunks.map(chunk => chunk.text);
      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: chunkTexts,
      });

      // Step 4: Analyze semantic boundaries and merge/split as needed
      const optimizedChunks = await this.optimizeChunks(initialChunks, embeddings);

      // Step 5: Create final semantic chunks with metadata
      const semanticChunks: SemanticChunk[] = optimizedChunks.map((chunk, index) => ({
        id: `${documentId}_chunk_${index}`,
        content: chunk.text,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        semanticScore: chunk.semanticScore,
        metadata: {
          chunkIndex: index,
          totalChunks: optimizedChunks.length,
          documentId,
          title,
          ...metadata,
        },
      }));

      const processingTime = Date.now() - startTime;
      const averageChunkSize =
        semanticChunks.reduce((sum, chunk) => sum + chunk.content.length, 0) /
        semanticChunks.length;
      const semanticCoherence =
        semanticChunks.reduce((sum, chunk) => sum + chunk.semanticScore, 0) / semanticChunks.length;

      const result: DocumentChunkingResult = {
        chunks: semanticChunks,
        processingTime,
        averageChunkSize,
        semanticCoherence,
      };

      tracker.setDocumentProcessing(1, semanticChunks.length, semanticChunks.length);
      return result;
    });
  }

  /**
   * Extract sentences from text while preserving structure
   */
  private extractSentences(
    text: string,
  ): Array<{ text: string; startIndex: number; endIndex: number }> {
    const sentences: Array<{ text: string; startIndex: number; endIndex: number }> = [];

    // Enhanced sentence splitting that handles edge cases
    const sentenceRegex = /[.!?]+(?=\s+[A-Z]|$)/g;
    let lastIndex = 0;
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const endIndex = match.index + match[0].length;
      const sentence = text.slice(lastIndex, endIndex).trim();

      if (sentence.length > 10) {
        // Filter out very short sentences
        sentences.push({
          text: sentence,
          startIndex: lastIndex,
          endIndex,
        });
      }

      lastIndex = endIndex;
    }

    // Handle remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText.length > 10) {
        sentences.push({
          text: remainingText,
          startIndex: lastIndex,
          endIndex: text.length,
        });
      }
    }

    return sentences;
  }

  /**
   * Create initial chunks based on size constraints
   */
  private createInitialChunks(
    sentences: Array<{ text: string; startIndex: number; endIndex: number }>,
  ) {
    const chunks: Array<{
      text: string;
      startIndex: number;
      endIndex: number;
      sentences: number[];
    }> = [];
    let currentChunk = '';
    let currentStartIndex = 0;
    let currentSentences: number[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence.text;

      if (potentialChunk.length <= this.options.maxChunkSize || currentChunk.length === 0) {
        if (currentChunk.length === 0) {
          currentStartIndex = sentence.startIndex;
        }
        currentChunk = potentialChunk;
        currentSentences.push(i);
      } else {
        // Save current chunk if it meets minimum size
        if (currentChunk.length >= this.options.minChunkSize) {
          chunks.push({
            text: currentChunk,
            startIndex: currentStartIndex,
            endIndex: sentences[currentSentences[currentSentences.length - 1]].endIndex,
            sentences: [...currentSentences],
          });
        }

        // Start new chunk
        currentChunk = sentence.text;
        currentStartIndex = sentence.startIndex;
        currentSentences = [i];
      }
    }

    // Add final chunk
    if (currentChunk.length >= this.options.minChunkSize) {
      chunks.push({
        text: currentChunk,
        startIndex: currentStartIndex,
        endIndex: sentences[currentSentences[currentSentences.length - 1]].endIndex,
        sentences: currentSentences,
      });
    }

    return chunks;
  }

  /**
   * Optimize chunks using semantic similarity analysis
   */
  private async optimizeChunks(
    initialChunks: Array<{
      text: string;
      startIndex: number;
      endIndex: number;
      sentences: number[];
    }>,
    embeddings: number[][],
  ) {
    const optimizedChunks = initialChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
      semanticScore: 1.0, // Will be calculated
    }));

    // Calculate semantic coherence scores
    for (let i = 0; i < optimizedChunks.length; i++) {
      let coherenceScore = 1.0;

      if (i > 0) {
        // Compare with previous chunk
        const similarity = this.cosineSimilarity(
          optimizedChunks[i].embedding,
          optimizedChunks[i - 1].embedding,
        );
        coherenceScore = Math.min(coherenceScore, similarity);
      }

      if (i < optimizedChunks.length - 1) {
        // Compare with next chunk
        const similarity = this.cosineSimilarity(
          optimizedChunks[i].embedding,
          optimizedChunks[i + 1].embedding,
        );
        coherenceScore = Math.min(coherenceScore, similarity);
      }

      optimizedChunks[i].semanticScore = coherenceScore;
    }

    // TODO: Implement advanced optimization (merging highly similar adjacent chunks, splitting low-coherence chunks)
    // For now, return chunks with semantic scores

    return optimizedChunks;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

/**
 * Factory function for creating semantic chunkers
 */
export function createSemanticChunker(
  embeddingModel: EmbeddingModel<string>,
  options?: SemanticChunkingOptions,
): SemanticChunker {
  return new SemanticChunker(embeddingModel, options);
}

/**
 * Convenience function for quick semantic chunking
 */
export async function semanticChunk(
  embeddingModel: EmbeddingModel<string>,
  documentId: string,
  content: string,
  options?: SemanticChunkingOptions & { title?: string; metadata?: Record<string, any> },
): Promise<SemanticChunk[]> {
  const chunker = createSemanticChunker(embeddingModel, options);
  const result = await chunker.chunkDocument(
    documentId,
    content,
    options?.title,
    options?.metadata,
  );
  return result.chunks;
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Basic semantic chunking
   */
  basic: `
import { openai } from '@ai-sdk/openai';
import { createSemanticChunker } from './semantic-chunking';

const embeddingModel = openai.embedding('text-embedding-3-small');
const chunker = createSemanticChunker(embeddingModel, {
  targetChunkSize: 800,
  semanticThreshold: 0.8,
});

const result = await chunker.chunkDocument(
  'doc1',
  documentContent,
  'My Document Title',
);

console.log(\`Created \${result.chunks.length} chunks with \${result.semanticCoherence.toFixed(2)} coherence\`);
  `,

  /**
   * Advanced chunking with custom options
   */
  advanced: `
const chunker = createSemanticChunker(embeddingModel, {
  targetChunkSize: 600,
  minChunkSize: 150,
  maxChunkSize: 1000,
  semanticThreshold: 0.85,
  overlapSize: 50,
  preserveParagraphs: true,
  preserveSentences: true,
});

const result = await chunker.chunkDocument('advanced_doc', content, 'Technical Manual');
  `,

  /**
   * Quick chunking
   */
  quick: `
import { semanticChunk } from './semantic-chunking';

const chunks = await semanticChunk(
  embeddingModel,
  'quick_doc',
  content,
  {
    targetChunkSize: 500,
    title: 'Quick Document',
    metadata: { category: 'documentation' },
  }
);
  `,
};
