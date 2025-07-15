import { logError, logWarn } from '@repo/observability/server/next';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import type { Document, DocumentLoader, LoaderOptions } from './types';

/**
 * Text file loader for common text formats
 */
export class TextFileLoader implements DocumentLoader {
  private supportedExtensions = ['.txt', '.md', '.json', '.csv', '.log'];

  supports(source: string): boolean {
    const ext = extname(source).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  async load(source: string, options: LoaderOptions = {}): Promise<Document[]> {
    try {
      const encoding = options.encoding ?? 'utf8';
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file loading is required for document loader
      const content = await readFile(source, encoding);

      // Check file size if maxSize is specified
      if (options.maxSize && content.length > options.maxSize) {
        throw new Error(`File ${source} exceeds maximum size of ${options.maxSize} characters`);
      }

      const document: Document = {
        id: this.generateId(source),
        content,
        metadata: {
          source,
          fileType: extname(source),
          size: content.length,
          loadedAt: new Date().toISOString(),
        },
        source,
      };

      return [document];
    } catch (error: any) {
      throw new Error(`Failed to load file ${source}: ${error.message}`);
    }
  }

  private generateId(source: string): string {
    const timestamp = Date.now();
    const basename = source.split('/').pop() ?? 'unknown';
    return `${basename}_${timestamp}`;
  }
}

/**
 * Web content loader for URLs
 */
export class WebLoader implements DocumentLoader {
  supports(source: string): boolean {
    return source.startsWith('http://') || source.startsWith('https://');
  }

  async load(source: string, options: LoaderOptions = {}): Promise<Document[]> {
    try {
      const response = await fetch(source);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();

      // Check size if maxSize is specified
      if (options.maxSize && content.length > options.maxSize) {
        throw new Error(
          `Content from ${source} exceeds maximum size of ${options.maxSize} characters`,
        );
      }

      const document: Document = {
        id: this.generateId(source),
        content,
        metadata: {
          source,
          url: source,
          size: content.length,
          contentType: response.headers.get('content-type') ?? 'unknown',
          loadedAt: new Date().toISOString(),
        },
        source,
      };

      return [document];
    } catch (error: any) {
      throw new Error(`Failed to load URL ${source}: ${error.message}`);
    }
  }

  private generateId(source: string): string {
    const timestamp = Date.now();
    const url = new URL(source);
    const hostname = url.hostname.replace(/\./g, '_');
    const pathname = url.pathname.replace(/[^a-zA-Z0-9]/g, '_');
    return `${hostname}${pathname}_${timestamp}`;
  }
}

/**
 * Multi-format document loader that delegates to specific loaders
 */
export class DocumentLoaderManager {
  private loaders: DocumentLoader[] = [new TextFileLoader(), new WebLoader()];

  /**
   * Add a custom loader
   */
  addLoader(loader: DocumentLoader): void {
    this.loaders.unshift(loader); // Add to front for priority
  }

  /**
   * Load documents from various sources
   */
  async load(sources: string | string[], options?: LoaderOptions): Promise<Document[]> {
    const sourceList = Array.isArray(sources) ? sources : [sources];
    const documents: Document[] = [];

    for (const source of sourceList) {
      const loader = this.findLoader(source);
      if (!loader) {
        logWarn(`No loader found for source: ${source}`, {
          operation: 'document_loading',
          metadata: { source },
        });
        continue;
      }

      try {
        const docs = await loader.load(source, options);
        documents.push(...docs);
      } catch (error: any) {
        logError(`Error loading ${source}`, {
          operation: 'document_loading',
          metadata: { source },
          error: error instanceof Error ? error : new Error(String(error)),
        });
        // Continue with other sources
      }
    }

    return documents;
  }

  /**
   * Load and chunk documents in one step
   */
  async loadAndChunk(
    sources: string | string[],
    chunkingOptions?: import('./types').ChunkingOptions,
    loaderOptions?: LoaderOptions,
  ): Promise<import('./types').DocumentChunk[]> {
    const { createTextChunker } = await import('./chunking');

    const documents = await this.load(sources, loaderOptions);
    const chunker = createTextChunker(chunkingOptions);

    return chunker.chunkDocuments(documents);
  }

  private findLoader(source: string): DocumentLoader | null {
    return this.loaders.find(loader => loader.supports(source)) ?? null;
  }
}

/**
 * Create a document loader manager
 */
export function createDocumentLoader(): DocumentLoaderManager {
  return new DocumentLoaderManager();
}

/**
 * Convenience function to load documents from sources
 */
export async function loadDocuments(
  sources: string | string[],
  options?: LoaderOptions,
): Promise<Document[]> {
  const loader = createDocumentLoader();
  return loader.load(sources, options);
}

/**
 * Convenience function to load and chunk documents
 */
export async function loadAndChunkDocuments(
  sources: string | string[],
  chunkingOptions?: import('./types').ChunkingOptions,
  loaderOptions?: LoaderOptions,
): Promise<import('./types').DocumentChunk[]> {
  const loader = createDocumentLoader();
  return loader.loadAndChunk(sources, chunkingOptions, loaderOptions);
}
