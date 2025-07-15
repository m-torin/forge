import type { ChunkingOptions, Document, DocumentChunk } from './types';

/**
 * Text chunking utility for processing large documents
 */
export class TextChunker {
  private options: Required<ChunkingOptions>;

  constructor(options: ChunkingOptions = {}) {
    this.options = {
      chunkSize: options.chunkSize ?? 1000,
      chunkOverlap: options.chunkOverlap ?? 200,
      separators: options.separators ?? ['\n\n', '\n', ' ', ''],
      keepSeparator: options.keepSeparator ?? false,
    };
  }

  /**
   * Chunk a single document into smaller pieces
   */
  chunkDocument(document: Document): DocumentChunk[] {
    const chunks = this.splitText(document.content);

    return chunks.map((chunk, index) => ({
      id: `${document.id}_chunk_${index}`,
      content: chunk.text,
      metadata: {
        ...document.metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
      source: document.source,
      chunkIndex: index,
      parentDocumentId: document.id,
      startPosition: chunk.start,
      endPosition: chunk.end,
    }));
  }

  /**
   * Chunk multiple documents
   */
  chunkDocuments(documents: Document[]): DocumentChunk[] {
    return documents.flatMap(doc => this.chunkDocument(doc));
  }

  /**
   * Split text using recursive character text splitting
   */
  private splitText(text: string): Array<{ text: string; start: number; end: number }> {
    if (text.length <= this.options.chunkSize) {
      return [{ text, start: 0, end: text.length }];
    }

    return this.recursiveSplit(text, this.options.separators, 0);
  }

  private recursiveSplit(
    text: string,
    separators: string[],
    startPos: number,
  ): Array<{ text: string; start: number; end: number }> {
    const separator = separators[0];
    const newSeparators = separators.slice(1);

    let splits: string[];
    if (separator === '') {
      splits = text.split('');
    } else {
      splits = text.split(separator);
    }

    // Add separator back if keeping it
    if (this.options.keepSeparator && separator !== '') {
      splits = splits
        .flatMap((split, i) => (i < splits.length - 1 ? [split, separator] : [split]))
        .filter(s => s !== '');
    }

    const chunks: Array<{ text: string; start: number; end: number }> = [];
    let currentPos = startPos;

    for (const split of splits) {
      if (split.length <= this.options.chunkSize) {
        chunks.push({
          text: split,
          start: currentPos,
          end: currentPos + split.length,
        });
        currentPos += split.length;
      } else if (newSeparators.length > 0) {
        // Recursively split with next separator
        const subChunks = this.recursiveSplit(split, newSeparators, currentPos);
        chunks.push(...subChunks);
        currentPos = subChunks[subChunks.length - 1]?.end ?? currentPos;
      } else {
        // Force split at character level
        const characterChunks = this.forceCharacterSplit(split, currentPos);
        chunks.push(...characterChunks);
        currentPos = characterChunks[characterChunks.length - 1]?.end ?? currentPos;
      }
    }

    // Merge chunks with overlap
    return this.mergeSplits(chunks);
  }

  private forceCharacterSplit(
    text: string,
    startPos: number,
  ): Array<{ text: string; start: number; end: number }> {
    const chunks: Array<{ text: string; start: number; end: number }> = [];
    let pos = 0;

    while (pos < text.length) {
      const chunkEnd = Math.min(pos + this.options.chunkSize, text.length);
      chunks.push({
        text: text.slice(pos, chunkEnd),
        start: startPos + pos,
        end: startPos + chunkEnd,
      });
      pos = chunkEnd;
    }

    return chunks;
  }

  private mergeSplits(
    chunks: Array<{ text: string; start: number; end: number }>,
  ): Array<{ text: string; start: number; end: number }> {
    if (chunks.length === 0) return [];

    const merged: Array<{ text: string; start: number; end: number }> = [];
    let currentChunk = chunks[0];

    for (let i = 1; i < chunks.length; i++) {
      const nextChunk = chunks[i];

      // If current chunk + next chunk + overlap <= chunk size, merge them
      if (currentChunk.text.length + nextChunk.text.length <= this.options.chunkSize) {
        currentChunk = {
          text: currentChunk.text + nextChunk.text,
          start: currentChunk.start,
          end: nextChunk.end,
        };
      } else {
        // Add current chunk and start new one with overlap
        merged.push(currentChunk);

        // Create overlap if possible
        const overlapStart = Math.max(0, currentChunk.text.length - this.options.chunkOverlap);
        const overlap = currentChunk.text.slice(overlapStart);

        currentChunk = {
          text: overlap + nextChunk.text,
          start: currentChunk.start + overlapStart,
          end: nextChunk.end,
        };
      }
    }

    merged.push(currentChunk);
    return merged;
  }
}

/**
 * Create a text chunker instance
 */
export function createTextChunker(options?: ChunkingOptions): TextChunker {
  return new TextChunker(options);
}

/**
 * Convenience function to chunk text directly
 */
export function chunkText(
  text: string,
  options?: ChunkingOptions & { documentId?: string },
): DocumentChunk[] {
  const chunker = new TextChunker(options);
  const document: Document = {
    id: options?.documentId ?? 'doc_' + Date.now(),
    content: text,
  };

  return chunker.chunkDocument(document);
}

/**
 * Semantic chunking that attempts to preserve meaning
 */
export class SemanticChunker extends TextChunker {
  constructor(options: ChunkingOptions = {}) {
    super({
      ...options,
      separators: options.separators ?? [
        '\n\n\n', // Triple newlines (major sections)
        '\n\n', // Double newlines (paragraphs)
        '\n', // Single newlines
        '. ', // Sentences
        '! ', // Exclamations
        '? ', // Questions
        '; ', // Semicolons
        ', ', // Commas
        ' ', // Spaces
        '', // Characters
      ],
      keepSeparator: true,
    });
  }
}

/**
 * Create a semantic chunker that preserves sentence and paragraph boundaries
 */
export function createSemanticChunker(options?: ChunkingOptions): SemanticChunker {
  return new SemanticChunker(options);
}
