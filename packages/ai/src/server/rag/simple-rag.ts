import type { RAGConfig, RAGResponse } from './types';
import { createRAGPipeline } from './pipeline';
import { loadAndChunkDocuments } from '../document/loaders';

/**
 * Simple RAG API with zero-config setup
 * Perfect for quick prototyping and simple use cases
 */
export class SimpleRAG {
  private pipeline: any;
  private initialized = false;

  constructor(config?: Partial<RAGConfig>) {
    this.pipeline = createRAGPipeline(config);
  }

  /**
   * Add documents from various sources (files, URLs, text)
   */
  async addDocuments(
    sources: string | string[] | Array<{ content: string; id?: string; metadata?: any }>,
  ): Promise<void> {
    let documents: Array<{ id: string; content: string; metadata?: any; source?: string }>;

    if (typeof sources === 'string') {
      // Single source (file path or URL)
      const loaded = await loadAndChunkDocuments([sources]);
      documents = loaded.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata,
        source: chunk.source,
      }));
    } else if (Array.isArray(sources) && typeof sources[0] === 'string') {
      // Array of sources (file paths or URLs)
      const loaded = await loadAndChunkDocuments(sources as string[]);
      documents = loaded.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata,
        source: chunk.source,
      }));
    } else {
      // Array of document objects
      const docObjects = sources as Array<{ content: string; id?: string; metadata?: any }>;
      documents = docObjects.map((doc, index) => ({
        id: doc.id ?? `doc_${Date.now()}_${index}`,
        content: doc.content,
        metadata: doc.metadata,
      }));
    }

    await this.pipeline.addDocuments(documents);
    this.initialized = true;
  }

  /**
   * Add text content directly
   */
  async addText(text: string, metadata?: Record<string, any>): Promise<void> {
    const document = {
      id: `text_${Date.now()}`,
      content: text,
      metadata,
    };

    await this.pipeline.addDocuments([document]);
    this.initialized = true;
  }

  /**
   * Query the RAG system
   */
  async query(question: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('No documents added yet. Call addDocuments() or addText() first.');
    }

    const response = await this.pipeline.query(question);
    return response.text;
  }

  /**
   * Query with full response details
   */
  async queryDetailed(question: string): Promise<RAGResponse> {
    if (!this.initialized) {
      throw new Error('No documents added yet. Call addDocuments() or addText() first.');
    }

    return this.pipeline.query(question);
  }

  /**
   * Get statistics about the knowledge base
   */
  async getStats(): Promise<{ totalDocuments: number; dimension: number }> {
    return this.pipeline.getStats();
  }

  /**
   * Remove documents by ID
   */
  async removeDocuments(ids: string[]): Promise<void> {
    await this.pipeline.removeDocuments(ids);
  }
}

/**
 * Create a simple RAG instance with minimal configuration
 */
export function createSimpleRAG(config?: Partial<RAGConfig>): SimpleRAG {
  return new SimpleRAG(config);
}

/**
 * Quick start function - create RAG system and add documents in one call
 */
export async function quickRAG(
  sources: string | string[] | Array<{ content: string; id?: string; metadata?: any }>,
  config?: Partial<RAGConfig>,
): Promise<SimpleRAG> {
  const rag = createSimpleRAG(config);
  await rag.addDocuments(sources);
  return rag;
}

/**
 * One-shot RAG query - for when you just want to ask one question
 */
export async function ragQuery(
  question: string,
  sources: string | string[] | Array<{ content: string; id?: string; metadata?: any }>,
  config?: Partial<RAGConfig>,
): Promise<string> {
  const rag = await quickRAG(sources, config);
  return rag.query(question);
}

/**
 * Example usage patterns
 */
export const examples = {
  /**
   * Basic text RAG
   */
  basic: async () => {
    const rag = createSimpleRAG();
    await rag.addText("Paris is the capital of France. It's known for the Eiffel Tower.");
    const answer = await rag.query('What is Paris known for?');
    return answer;
  },

  /**
   * File-based RAG
   */
  files: async (filePaths: string[]) => {
    const rag = createSimpleRAG();
    await rag.addDocuments(filePaths);
    const answer = await rag.query('Summarize the main points from these documents.');
    return answer;
  },

  /**
   * Web-based RAG
   */
  web: async (urls: string[]) => {
    const rag = createSimpleRAG();
    await rag.addDocuments(urls);
    const answer = await rag.query('What are the key insights from these web pages?');
    return answer;
  },

  /**
   * One-shot query
   */
  oneShot: async (question: string, content: string) => {
    return ragQuery(question, [{ content }]);
  },
};
