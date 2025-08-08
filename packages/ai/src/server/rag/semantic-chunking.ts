/**
 * Advanced Chunking Strategies for AI SDK v5 RAG
 * Enhanced document chunking with semantic awareness and overlapping strategies
 */

import { logInfo } from '@repo/observability/server/next';
import { generateEmbeddings } from './ai-sdk-rag';

/**
 * Chunking strategy types
 */
export type ChunkingStrategy =
  | 'fixed_size'
  | 'sentence_based'
  | 'paragraph_based'
  | 'semantic_similarity'
  | 'sliding_window'
  | 'hierarchical';

/**
 * Chunking configuration
 */
export interface ChunkingConfig {
  strategy: ChunkingStrategy;
  chunkSize?: number;
  chunkOverlap?: number;
  minChunkSize?: number;
  maxChunkSize?: number;
  preserveContext?: boolean;
  semanticThreshold?: number;
  separators?: string[];
}

/**
 * Chunk result with metadata
 */
export interface ChunkResult {
  content: string;
  index: number;
  startPosition: number;
  endPosition: number;
  wordCount: number;
  metadata: {
    strategy: ChunkingStrategy;
    parentDocument?: string;
    section?: string;
    overlap?: {
      previous?: string;
      next?: string;
    };
    semanticScore?: number;
  };
}

/**
 * Semantic document chunker with multiple strategies
 */
export class SemanticDocumentChunker {
  constructor(private config: ChunkingConfig) {}

  /**
   * Chunk document using specified strategy
   */
  async chunkDocument(
    content: string,
    documentId?: string,
    metadata?: Record<string, any>,
  ): Promise<ChunkResult[]> {
    logInfo('Starting document chunking', {
      operation: 'advanced_chunking',
      strategy: this.config.strategy,
      contentLength: content.length,
      documentId,
    });

    let chunks: ChunkResult[];

    switch (this.config.strategy) {
      case 'fixed_size':
        chunks = this.fixedSizeChunking(content);
        break;
      case 'sentence_based':
        chunks = this.sentenceBasedChunking(content);
        break;
      case 'paragraph_based':
        chunks = this.paragraphBasedChunking(content);
        break;
      case 'semantic_similarity':
        chunks = await this.semanticSimilarityChunking(content);
        break;
      case 'sliding_window':
        chunks = this.slidingWindowChunking(content);
        break;
      case 'hierarchical':
        chunks = this.hierarchicalChunking(content);
        break;
      default:
        throw new Error(`Unknown chunking strategy: ${this.config.strategy}`);
    }

    // Add document metadata to all chunks
    chunks.forEach(chunk => {
      chunk.metadata.parentDocument = documentId;
      if (metadata) {
        chunk.metadata = { ...chunk.metadata, ...metadata };
      }
    });

    logInfo('Document chunking completed', {
      operation: 'advanced_chunking_completed',
      strategy: this.config.strategy,
      chunksCreated: chunks.length,
      avgChunkSize: chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length,
    });

    return chunks;
  }

  /**
   * Fixed size chunking with overlap
   */
  private fixedSizeChunking(content: string): ChunkResult[] {
    const chunkSize = this.config.chunkSize || 1000;
    const overlap = this.config.chunkOverlap || 200;
    const chunks: ChunkResult[] = [];

    let startPos = 0;
    let index = 0;

    while (startPos < content.length) {
      const endPos = Math.min(startPos + chunkSize, content.length);
      let chunkContent = content.slice(startPos, endPos);

      // Try to break at word boundaries
      if (endPos < content.length && this.config.preserveContext) {
        const lastSpaceIndex = chunkContent.lastIndexOf(' ');
        if (lastSpaceIndex > chunkSize * 0.8) {
          chunkContent = chunkContent.slice(0, lastSpaceIndex);
        }
      }

      const chunk: ChunkResult = {
        content: chunkContent.trim(),
        index,
        startPosition: startPos,
        endPosition: startPos + chunkContent.length,
        wordCount: chunkContent.split(/\s+/).length,
        metadata: {
          strategy: 'fixed_size',
          overlap: this.getOverlapInfo(chunks, index, chunkContent),
        },
      };

      chunks.push(chunk);
      startPos += chunkSize - overlap;
      index++;
    }

    return chunks;
  }

  /**
   * Sentence-based chunking
   */
  private sentenceBasedChunking(content: string): ChunkResult[] {
    const sentences = this.splitIntoSentences(content);
    const targetSize = this.config.chunkSize || 1000;
    const chunks: ChunkResult[] = [];

    let currentChunk = '';
    let currentStart = 0;
    let index = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

      if (potentialChunk.length > targetSize && currentChunk.length > 0) {
        // Create chunk from current sentences
        const chunk: ChunkResult = {
          content: currentChunk.trim(),
          index,
          startPosition: currentStart,
          endPosition: currentStart + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).length,
          metadata: {
            strategy: 'sentence_based',
            overlap: this.getOverlapInfo(chunks, index, currentChunk),
          },
        };

        chunks.push(chunk);
        currentChunk = sentence;
        currentStart = chunk.endPosition;
        index++;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index,
        startPosition: currentStart,
        endPosition: currentStart + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).length,
        metadata: {
          strategy: 'sentence_based',
        },
      });
    }

    return chunks;
  }

  /**
   * Paragraph-based chunking
   */
  private paragraphBasedChunking(content: string): ChunkResult[] {
    const paragraphs = content.split(/\s*\n\s*/).filter(p => p.trim().length > 0);
    const targetSize = this.config.chunkSize || 1000;
    const chunks: ChunkResult[] = [];

    let currentChunk = '';
    let currentStart = 0;
    let index = 0;

    for (const paragraph of paragraphs) {
      const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;

      if (potentialChunk.length > targetSize && currentChunk.length > 0) {
        // Create chunk from current paragraphs
        const chunk: ChunkResult = {
          content: currentChunk.trim(),
          index,
          startPosition: currentStart,
          endPosition: currentStart + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).length,
          metadata: {
            strategy: 'paragraph_based',
            overlap: this.getOverlapInfo(chunks, index, currentChunk),
          },
        };

        chunks.push(chunk);
        currentChunk = paragraph;
        currentStart = chunk.endPosition;
        index++;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index,
        startPosition: currentStart,
        endPosition: currentStart + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).length,
        metadata: {
          strategy: 'paragraph_based',
        },
      });
    }

    return chunks;
  }

  /**
   * Semantic similarity-based chunking
   */
  private async semanticSimilarityChunking(content: string): Promise<ChunkResult[]> {
    const sentences = this.splitIntoSentences(content);
    const threshold = this.config.semanticThreshold || 0.8;

    // Generate embeddings for all sentences
    const embeddings = await generateEmbeddings(sentences);

    const chunks: ChunkResult[] = [];
    let currentChunk = sentences[0];
    let currentStart = 0;
    let index = 0;

    for (let i = 1; i < sentences.length; i++) {
      const similarity = this.cosineSimilarity(embeddings[i - 1], embeddings[i]);

      if (similarity < threshold || currentChunk.length > (this.config.maxChunkSize || 2000)) {
        // Create chunk
        const chunk: ChunkResult = {
          content: currentChunk.trim(),
          index,
          startPosition: currentStart,
          endPosition: currentStart + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).length,
          metadata: {
            strategy: 'semantic_similarity',
            semanticScore: similarity,
            overlap: this.getOverlapInfo(chunks, index, currentChunk),
          },
        };

        chunks.push(chunk);
        currentChunk = sentences[i];
        currentStart = chunk.endPosition;
        index++;
      } else {
        currentChunk += ' ' + sentences[i];
      }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index,
        startPosition: currentStart,
        endPosition: currentStart + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).length,
        metadata: {
          strategy: 'semantic_similarity',
        },
      });
    }

    return chunks;
  }

  /**
   * Sliding window chunking
   */
  private slidingWindowChunking(content: string): ChunkResult[] {
    const chunkSize = this.config.chunkSize || 1000;
    const stepSize = this.config.chunkOverlap || 500;
    const chunks: ChunkResult[] = [];

    let startPos = 0;
    let index = 0;

    while (startPos < content.length) {
      const endPos = Math.min(startPos + chunkSize, content.length);
      let chunkContent = content.slice(startPos, endPos);

      // Try to break at word boundaries
      if (endPos < content.length && this.config.preserveContext) {
        const lastSpaceIndex = chunkContent.lastIndexOf(' ');
        if (lastSpaceIndex > chunkSize * 0.8) {
          chunkContent = chunkContent.slice(0, lastSpaceIndex);
        }
      }

      const chunk: ChunkResult = {
        content: chunkContent.trim(),
        index,
        startPosition: startPos,
        endPosition: startPos + chunkContent.length,
        wordCount: chunkContent.split(/\s+/).length,
        metadata: {
          strategy: 'sliding_window',
          overlap: this.getOverlapInfo(chunks, index, chunkContent),
        },
      };

      chunks.push(chunk);
      startPos += stepSize;
      index++;

      // Avoid infinite loop
      if (stepSize === 0) break;
    }

    return chunks;
  }

  /**
   * Hierarchical chunking (sections -> paragraphs -> sentences)
   */
  private hierarchicalChunking(content: string): ChunkResult[] {
    const sections = this.extractSections(content);
    const chunks: ChunkResult[] = [];
    let globalIndex = 0;

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      const paragraphs = section.content.split(/\n\s*/).filter(p => p.trim().length > 0);

      for (const paragraph of paragraphs) {
        if (paragraph.length > (this.config.maxChunkSize || 1500)) {
          // Further split large paragraphs
          const sentences = this.splitIntoSentences(paragraph);
          const sentenceChunks = this.groupSentences(sentences, this.config.chunkSize || 800);

          for (const sentenceChunk of sentenceChunks) {
            chunks.push({
              content: sentenceChunk.trim(),
              index: globalIndex++,
              startPosition: 0, // Would need more complex position tracking
              endPosition: sentenceChunk.length,
              wordCount: sentenceChunk.split(/\s+/).length,
              metadata: {
                strategy: 'hierarchical',
                section: section.title || `Section ${sectionIndex + 1}`,
              },
            });
          }
        } else {
          chunks.push({
            content: paragraph.trim(),
            index: globalIndex++,
            startPosition: 0,
            endPosition: paragraph.length,
            wordCount: paragraph.split(/\s+/).length,
            metadata: {
              strategy: 'hierarchical',
              section: section.title || `Section ${sectionIndex + 1}`,
            },
          });
        }
      }
    }

    return chunks;
  }

  /**
   * Helper: Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  }

  /**
   * Helper: Calculate cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Helper: Get overlap information
   */
  private getOverlapInfo(
    chunks: ChunkResult[],
    _currentIndex: number,
    _currentContent: string,
  ): { previous?: string; next?: string } | undefined {
    if (!this.config.chunkOverlap) return undefined;

    const overlap: { previous?: string; next?: string } = {};

    if (chunks.length > 0) {
      const previousChunk = chunks[chunks.length - 1];
      const overlapSize = Math.min(this.config.chunkOverlap, previousChunk.content.length);
      overlap.previous = previousChunk.content.slice(-overlapSize);
    }

    return overlap;
  }

  /**
   * Helper: Extract sections from content (basic implementation)
   */
  private extractSections(content: string): Array<{ title?: string; content: string }> {
    const lines = content.split('\n');
    const sections: Array<{ title?: string; content: string }> = [];
    let currentSection = { title: undefined as string | undefined, content: '' };

    for (const line of lines) {
      if (line.match(/^#{1,6}\s+/) || line.match(/^[A-Z][^.]*:?\s*$/)) {
        // Looks like a heading
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = { title: line.trim(), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : [{ content }];
  }

  /**
   * Helper: Group sentences into chunks
   */
  private groupSentences(sentences: string[], targetSize: number): string[] {
    const groups: string[] = [];
    let currentGroup = '';

    for (const sentence of sentences) {
      const potentialGroup = currentGroup + (currentGroup ? ' ' : '') + sentence;

      if (potentialGroup.length > targetSize && currentGroup.length > 0) {
        groups.push(currentGroup.trim());
        currentGroup = sentence;
      } else {
        currentGroup = potentialGroup;
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup.trim());
    }

    return groups;
  }
}

/**
 * Factory function for creating chunkers with different strategies
 */
export function createDocumentChunker(config: ChunkingConfig): SemanticDocumentChunker {
  return new SemanticDocumentChunker(config);
}

/**
 * Utility function for chunking multiple documents
 */
export async function chunkDocuments(
  documents: Array<{ content: string; id?: string; metadata?: Record<string, any> }>,
  config: ChunkingConfig,
): Promise<Array<ChunkResult & { documentId?: string }>> {
  const chunker = createDocumentChunker(config);
  const allChunks: Array<ChunkResult & { documentId?: string }> = [];

  for (const doc of documents) {
    const chunks = await chunker.chunkDocument(doc.content, doc.id, doc.metadata);

    chunks.forEach(chunk => {
      allChunks.push({
        ...chunk,
        documentId: doc.id,
      });
    });
  }

  return allChunks;
}

/**
 * Preset chunking configurations
 */
export const chunkingPresets: Record<string, ChunkingConfig> = {
  // Good for general text documents
  balanced: {
    strategy: 'sentence_based',
    chunkSize: 800,
    chunkOverlap: 100,
    preserveContext: true,
  },

  // Good for code documentation
  technical: {
    strategy: 'paragraph_based',
    chunkSize: 1200,
    chunkOverlap: 150,
    preserveContext: true,
    separators: ['\n\n', "\n'''", '\n---'],
  },

  // Good for academic papers
  academic: {
    strategy: 'hierarchical',
    chunkSize: 1000,
    chunkOverlap: 200,
    maxChunkSize: 2000,
    preserveContext: true,
  },

  // Good for conversational content
  conversational: {
    strategy: 'semantic_similarity',
    chunkSize: 600,
    semanticThreshold: 0.75,
    maxChunkSize: 1200,
    preserveContext: true,
  },

  // Good for large documents with sliding context
  comprehensive: {
    strategy: 'sliding_window',
    chunkSize: 1000,
    chunkOverlap: 300,
    preserveContext: true,
  },
};
