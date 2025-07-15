'use server';

import { ConversationMemoryManager } from '@repo/ai/server/rag/conversation-memory';
import { createRAGDatabaseBridge } from '@repo/ai/server/rag/database-bridge';
import type { EnhancedRAGToolConfig } from '@repo/ai/server/rag/enhanced-tools';
import { createEnhancedRAGToolset } from '@repo/ai/server/rag/enhanced-tools';
import type { HybridSearchConfig } from '@repo/ai/server/rag/hybrid-search';
import { createHybridSearch, hybridSearchPresets } from '@repo/ai/server/rag/hybrid-search';
import { logError, logInfo } from '@repo/observability';

/**
 * Comprehensive RAG Client with AI SDK v5 integration
 * Supports hybrid search, advanced tools, conversation memory, and production configs
 */

export interface ComprehensiveRAGConfig {
  vectorUrl: string;
  vectorToken: string;
  namespace?: string;
  // Hybrid search configuration
  hybridSearchConfig?: Partial<HybridSearchConfig>;
  // Enhanced tools configuration
  enableSourceTracking?: boolean;
  enableBatchProcessing?: boolean;
  maxContextLength?: number;
  // Conversation memory
  enableConversationMemory?: boolean;
  memoryRetentionDays?: number;
  // Production preset
  productionPreset?: 'enterprise' | 'production' | 'development' | 'economy' | 'realtime';
}

export class ComprehensiveRAGClient {
  private vectorStore: any;
  private hybridSearch: any;
  private enhancedTools: any;
  private conversationMemory?: ConversationMemoryManager;
  private config: ComprehensiveRAGConfig;

  constructor(config: ComprehensiveRAGConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      logInfo('Initializing comprehensive RAG client', {
        operation: 'rag_client_init',
        namespace: this.config.namespace,
        preset: this.config.productionPreset,
      });

      // Initialize vector store
      this.vectorStore = createRAGDatabaseBridge({
        vectorUrl: this.config.vectorUrl,
        vectorToken: this.config.vectorToken,
        namespace: this.config.namespace,
      });

      // Initialize hybrid search with preset or custom config
      const hybridConfig = this.config.productionPreset
        ? this.getPresetHybridConfig(this.config.productionPreset)
        : this.config.hybridSearchConfig || hybridSearchPresets.balanced;

      this.hybridSearch = createHybridSearch(this.vectorStore, hybridConfig);

      // Initialize enhanced tools
      const toolConfig: EnhancedRAGToolConfig = {
        vectorStore: this.vectorStore,
        enableSourceTracking: this.config.enableSourceTracking ?? true,
        enableBatchProcessing: this.config.enableBatchProcessing ?? true,
        maxContextLength: this.config.maxContextLength ?? 2000,
        defaultTopK: 5,
        defaultThreshold: 0.7,
      };

      this.enhancedTools = createEnhancedRAGToolset(toolConfig);

      // Initialize conversation memory if enabled
      if (this.config.enableConversationMemory) {
        this.conversationMemory = new ConversationMemoryManager({
          vectorStore: this.vectorStore,
          retentionDays: this.config.memoryRetentionDays ?? 30,
          maxMemoryItems: 1000,
        });
      }

      logInfo('Comprehensive RAG client initialized successfully', {
        operation: 'rag_client_initialized',
        hasHybridSearch: !!this.hybridSearch,
        hasEnhancedTools: !!this.enhancedTools,
        hasConversationMemory: !!this.conversationMemory,
      });

      return this;
    } catch (error) {
      logError('Failed to initialize comprehensive RAG client', error);
      throw error;
    }
  }

  // Hybrid search capabilities
  async hybridQuery(
    query: string,
    options: {
      topK?: number;
      filters?: Record<string, any>;
      boostFields?: string[];
      customWeights?: { vector: number; keyword: number };
    } = {},
  ) {
    try {
      const results = await this.hybridSearch.search(query, {
        filters: options.filters,
        boostFields: options.boostFields,
        customWeights: options.customWeights,
      });

      return results.slice(0, options.topK || 5);
    } catch (error) {
      logError('Hybrid search failed', error);
      throw error;
    }
  }

  // Enhanced vector operations
  async addDocument(content: string, metadata?: any) {
    try {
      const result = await this.vectorStore.addDocument(content, {
        ...metadata,
        timestamp: new Date().toISOString(),
        addedBy: this.config.namespace,
      });

      return { success: true, id: result };
    } catch (error) {
      logError('Failed to add document', error);
      throw error;
    }
  }

  async batchAddDocuments(
    documents: Array<{ content: string; metadata?: any }>,
    options: {
      chunkSize?: number;
      generateEmbeddings?: boolean;
    } = {},
  ) {
    try {
      const result = await this.enhancedTools.batchDocumentProcessor.execute({
        documents: documents.map(doc => ({
          content: doc.content,
          title: doc.metadata?.title || 'Untitled',
          metadata: doc.metadata,
        })),
        chunkSize: options.chunkSize || 5,
        generateEmbeddings: options.generateEmbeddings ?? true,
      });

      return result;
    } catch (error) {
      logError('Batch document processing failed', error);
      throw error;
    }
  }

  // Advanced search and reasoning
  async enhancedSearch(
    question: string,
    options: {
      topK?: number;
      threshold?: number;
      includeMetadata?: boolean;
      contextWindow?: number;
    } = {},
  ) {
    try {
      const result = await this.enhancedTools.enhancedKnowledgeSearch.execute({
        question,
        topK: options.topK || 5,
        threshold: options.threshold || 0.7,
        includeMetadata: options.includeMetadata ?? true,
        contextWindow: options.contextWindow,
      });

      return result;
    } catch (error) {
      logError('Enhanced search failed', error);
      throw error;
    }
  }

  async multiStepReasoning(
    mainQuestion: string,
    subQueries: string[],
    options: {
      synthesizeResults?: boolean;
      maxContextPerQuery?: number;
    } = {},
  ) {
    try {
      const result = await this.enhancedTools.multiStepReasoning.execute({
        mainQuestion,
        subQueries,
        synthesizeResults: options.synthesizeResults ?? true,
        maxContextPerQuery: options.maxContextPerQuery || 3,
      });

      return result;
    } catch (error) {
      logError('Multi-step reasoning failed', error);
      throw error;
    }
  }

  async contextSummarization(
    topic: string,
    options: {
      focusAreas?: string[];
      maxSources?: number;
      includeSourceList?: boolean;
    } = {},
  ) {
    try {
      const result = await this.enhancedTools.contextSummarization.execute({
        topic,
        focusAreas: options.focusAreas || [],
        maxSources: options.maxSources || 10,
        includeSourceList: options.includeSourceList ?? true,
      });

      return result;
    } catch (error) {
      logError('Context summarization failed', error);
      throw error;
    }
  }

  // Conversation memory operations
  async addConversationContext(conversationId: string, messages: any[], context?: any) {
    if (!this.conversationMemory) {
      throw new Error('Conversation memory not enabled');
    }

    try {
      await this.conversationMemory.addConversation(conversationId, messages, context);
      return { success: true };
    } catch (error) {
      logError('Failed to add conversation context', error);
      throw error;
    }
  }

  async getConversationMemory(conversationId: string) {
    if (!this.conversationMemory) {
      return null;
    }

    try {
      return await this.conversationMemory.getConversationContext(conversationId);
    } catch (error) {
      logError('Failed to get conversation memory', error);
      return null;
    }
  }

  // Statistics and analytics
  async getStats() {
    try {
      const vectorStats = await this.vectorStore.getStats();
      return {
        ...vectorStats,
        hasHybridSearch: !!this.hybridSearch,
        hasEnhancedTools: !!this.enhancedTools,
        hasConversationMemory: !!this.conversationMemory,
        preset: this.config.productionPreset || 'custom',
      };
    } catch (error) {
      logError('Failed to get RAG stats', error);
      throw error;
    }
  }

  // Legacy compatibility methods
  async upsert(data: Array<{ id: string; content: string; metadata?: any }>) {
    const results = [];
    for (const item of data) {
      try {
        const result = await this.addDocument(item.content, {
          ...item.metadata,
          originalId: item.id,
        });
        results.push(result.id);
      } catch (error) {
        logError(`Failed to upsert document ${item.id}`, error);
      }
    }
    return { success: true, count: results.length, ids: results };
  }

  async query(queryText: string, options: { topK?: number } = {}) {
    try {
      const results = await this.vectorStore.queryDocuments(queryText, {
        topK: options.topK || 5,
        includeContent: true,
      });

      return results.map((result: any) => ({
        id: String(result.id),
        score: result.score || 0,
        content: String(result.content || ''),
        metadata: result.metadata,
      }));
    } catch (error) {
      logError('Basic query failed', error);
      throw error;
    }
  }

  async delete(ids: string[]) {
    try {
      for (const id of ids) {
        await this.vectorStore.deleteDocument(id);
      }
      return { success: true };
    } catch (error) {
      logError('Failed to delete documents', error);
      throw error;
    }
  }

  private getPresetHybridConfig(preset: string): HybridSearchConfig {
    switch (preset) {
      case 'enterprise':
        return hybridSearchPresets.comprehensive;
      case 'production':
        return hybridSearchPresets.balanced;
      case 'development':
        return hybridSearchPresets.semantic;
      case 'economy':
        return hybridSearchPresets.precise;
      case 'realtime':
        return {
          ...hybridSearchPresets.balanced,
          vectorTopK: 10,
          keywordTopK: 10,
          finalTopK: 5,
        };
      default:
        return hybridSearchPresets.balanced;
    }
  }
}

// Factory function for backward compatibility
export async function createRAGClient(config: {
  vectorUrl: string;
  vectorToken: string;
  namespace?: string;
}) {
  const comprehensiveConfig: ComprehensiveRAGConfig = {
    ...config,
    enableSourceTracking: true,
    enableBatchProcessing: true,
    enableConversationMemory: false, // Keep disabled for backward compatibility
    productionPreset: 'production',
  };

  const client = new ComprehensiveRAGClient(comprehensiveConfig);
  return await client.initialize();
}

// Factory function for creating comprehensive RAG client
export async function createComprehensiveRAGClient(config: ComprehensiveRAGConfig) {
  const client = new ComprehensiveRAGClient(config);
  return await client.initialize();
}
