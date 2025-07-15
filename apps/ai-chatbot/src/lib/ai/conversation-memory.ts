'use server';

import { env } from '#/root/env';
import { ConversationMemoryManager } from '@repo/ai/server/rag/conversation-memory';
import { createRAGDatabaseBridge } from '@repo/ai/server/rag/database-bridge';
import { logError, logInfo } from '@repo/observability';
import type { Message } from 'ai';

/**
 * Conversation Memory Integration for AI Chatbot
 * Provides persistent conversation context and memory management
 */

export interface ChatbotConversationContext {
  conversationId: string;
  userId: string;
  sessionId?: string;
  metadata?: {
    title?: string;
    tags?: string[];
    category?: string;
    language?: string;
    model?: string;
  };
}

export interface ConversationSummary {
  conversationId: string;
  summary: string;
  keyTopics: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  messageCount: number;
  lastUpdated: string;
}

export class ChatbotConversationMemory {
  private memoryManager: ConversationMemoryManager | null = null;
  private vectorStore: any = null;
  private initialized = false;

  constructor(private userId: string) {}

  /**
   * Initialize conversation memory system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logInfo('Initializing conversation memory', {
        operation: 'conversation_memory_init',
        userId: this.userId,
      });

      // Create vector store for memory storage
      this.vectorStore = createRAGDatabaseBridge({
        vectorUrl: env.UPSTASH_VECTOR_REST_URL || '',
        vectorToken: env.UPSTASH_VECTOR_REST_TOKEN || '',
        namespace: `memory_${this.userId}`,
      });

      // Initialize memory manager
      this.memoryManager = new ConversationMemoryManager({
        vectorStore: this.vectorStore,
        retentionDays: 30,
        maxMemoryItems: 1000,
        summarizationThreshold: 20, // Summarize after 20 messages
        entityExtractionEnabled: true,
        sentimentAnalysisEnabled: true,
      });

      this.initialized = true;

      logInfo('Conversation memory initialized successfully', {
        operation: 'conversation_memory_initialized',
        userId: this.userId,
      });
    } catch (error) {
      logError('Failed to initialize conversation memory', { error, userId: this.userId });
      throw error;
    }
  }

  /**
   * Add conversation messages to memory
   */
  async addConversation(
    context: ChatbotConversationContext,
    messages: Message[],
    additionalContext?: Record<string, any>,
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      logInfo('Adding conversation to memory', {
        operation: 'add_conversation_memory',
        conversationId: context.conversationId,
        messageCount: messages.length,
        userId: this.userId,
      });

      // Prepare context for memory storage
      const memoryContext = {
        ...additionalContext,
        userId: context.userId,
        sessionId: context.sessionId,
        metadata: context.metadata,
        timestamp: new Date().toISOString(),
      };

      await this.memoryManager!.addConversation(context.conversationId, messages, memoryContext);

      logInfo('Conversation added to memory successfully', {
        operation: 'conversation_memory_added',
        conversationId: context.conversationId,
        userId: this.userId,
      });
    } catch (error) {
      logError('Failed to add conversation to memory', {
        error,
        conversationId: context.conversationId,
        userId: this.userId,
      });
      throw error;
    }
  }

  /**
   * Retrieve conversation context from memory
   */
  async getConversationContext(conversationId: string): Promise<{
    messages: Message[];
    context: Record<string, any>;
    summary?: string;
    entities?: string[];
  } | null> {
    await this.ensureInitialized();

    try {
      const memoryContext = await this.memoryManager!.getConversationContext(conversationId);

      if (!memoryContext) {
        return null;
      }

      return {
        messages: memoryContext.messages,
        context: memoryContext.context,
        summary: memoryContext.summary,
        entities: memoryContext.entities,
      };
    } catch (error) {
      logError('Failed to retrieve conversation context', {
        error,
        conversationId,
        userId: this.userId,
      });
      return null;
    }
  }

  /**
   * Search conversation history
   */
  async searchConversations(
    query: string,
    options: {
      limit?: number;
      timeRange?: 'day' | 'week' | 'month' | 'all';
      includeContext?: boolean;
    } = {},
  ): Promise<
    Array<{
      conversationId: string;
      relevantMessages: Message[];
      summary?: string;
      score: number;
      timestamp: string;
    }>
  > {
    await this.ensureInitialized();

    try {
      const { limit = 10, timeRange = 'month', includeContext = false } = options;

      logInfo('Searching conversation history', {
        operation: 'search_conversation_memory',
        query: query.substring(0, 100),
        limit,
        timeRange,
        userId: this.userId,
      });

      // Calculate time filter
      const timeFilters = this.getTimeFilter(timeRange);

      // Search using vector store
      const searchResults = await this.vectorStore.queryDocuments(query, {
        topK: limit,
        threshold: 0.6,
        includeContent: true,
        filters: {
          userId: this.userId,
          ...timeFilters,
        },
      });

      const results = await Promise.all(
        searchResults.map(async (result: any) => {
          const conversationId = result.metadata?.conversationId;
          if (!conversationId) return null;

          const context = includeContext ? await this.getConversationContext(conversationId) : null;

          return {
            conversationId,
            relevantMessages: context?.messages || [],
            summary: context?.summary,
            score: result.score,
            timestamp: result.metadata?.timestamp || new Date().toISOString(),
          };
        }),
      );

      return results.filter(Boolean) as any[];
    } catch (error) {
      logError('Failed to search conversation history', {
        error,
        query: query.substring(0, 100),
        userId: this.userId,
      });
      return [];
    }
  }

  /**
   * Get conversation summaries
   */
  async getConversationSummaries(
    options: {
      limit?: number;
      timeRange?: 'day' | 'week' | 'month' | 'all';
      sortBy?: 'recent' | 'relevant' | 'active';
    } = {},
  ): Promise<ConversationSummary[]> {
    await this.ensureInitialized();

    try {
      const { limit = 20, timeRange = 'month', sortBy = 'recent' } = options;

      logInfo('Retrieving conversation summaries', {
        operation: 'get_conversation_summaries',
        limit,
        timeRange,
        sortBy,
        userId: this.userId,
      });

      // Get summaries from memory manager
      const summaries = await this.memoryManager!.getConversationSummaries({
        userId: this.userId,
        limit,
        timeRange,
        sortBy,
      });

      return summaries.map((summary: any) => ({
        conversationId: summary.conversationId,
        summary: summary.summary,
        keyTopics: summary.keyTopics || [],
        entities: summary.entities || [],
        sentiment: summary.sentiment || 'neutral',
        messageCount: summary.messageCount || 0,
        lastUpdated: summary.lastUpdated || new Date().toISOString(),
      }));
    } catch (error) {
      logError('Failed to get conversation summaries', {
        error,
        userId: this.userId,
      });
      return [];
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    memoryUsage: number;
    oldestConversation?: string;
    newestConversation?: string;
    averageConversationLength: number;
    topTopics: Array<{ topic: string; count: number }>;
    sentimentDistribution: { positive: number; neutral: number; negative: number };
  }> {
    await this.ensureInitialized();

    try {
      const stats = await this.memoryManager!.getMemoryStatistics();

      return {
        totalConversations: stats.totalConversations || 0,
        totalMessages: stats.totalMessages || 0,
        memoryUsage: stats.memoryUsage || 0,
        oldestConversation: stats.oldestConversation,
        newestConversation: stats.newestConversation,
        averageConversationLength: stats.averageConversationLength || 0,
        topTopics: stats.topTopics || [],
        sentimentDistribution: stats.sentimentDistribution || {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
      };
    } catch (error) {
      logError('Failed to get memory statistics', {
        error,
        userId: this.userId,
      });
      return {
        totalConversations: 0,
        totalMessages: 0,
        memoryUsage: 0,
        averageConversationLength: 0,
        topTopics: [],
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      };
    }
  }

  /**
   * Optimize memory usage
   */
  async optimizeMemory(
    options: {
      removeOldConversations?: boolean;
      maxRetentionDays?: number;
      compactSummaries?: boolean;
    } = {},
  ): Promise<{
    conversationsRemoved: number;
    memoryFreed: number;
    optimizationsApplied: string[];
  }> {
    await this.ensureInitialized();

    try {
      logInfo('Starting memory optimization', {
        operation: 'optimize_memory',
        options,
        userId: this.userId,
      });

      const result = await this.memoryManager!.optimizeMemory({
        userId: this.userId,
        ...options,
      });

      logInfo('Memory optimization completed', {
        operation: 'memory_optimized',
        result,
        userId: this.userId,
      });

      return result;
    } catch (error) {
      logError('Failed to optimize memory', {
        error,
        userId: this.userId,
      });
      return {
        conversationsRemoved: 0,
        memoryFreed: 0,
        optimizationsApplied: [],
      };
    }
  }

  /**
   * Delete specific conversation from memory
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      await this.memoryManager!.deleteConversation(conversationId);

      logInfo('Conversation deleted from memory', {
        operation: 'conversation_deleted',
        conversationId,
        userId: this.userId,
      });

      return true;
    } catch (error) {
      logError('Failed to delete conversation from memory', {
        error,
        conversationId,
        userId: this.userId,
      });
      return false;
    }
  }

  /**
   * Export conversation data
   */
  async exportConversations(options: {
    format: 'json' | 'csv' | 'markdown';
    timeRange?: 'day' | 'week' | 'month' | 'all';
    includeMetadata?: boolean;
  }): Promise<string> {
    await this.ensureInitialized();

    try {
      const { format, timeRange = 'all', includeMetadata = true } = options;

      logInfo('Exporting conversation data', {
        operation: 'export_conversations',
        format,
        timeRange,
        userId: this.userId,
      });

      // Get all conversations in time range
      const summaries = await this.getConversationSummaries({
        timeRange,
        limit: 1000,
      });

      // Export in requested format
      switch (format) {
        case 'json':
          return JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              userId: this.userId,
              timeRange,
              conversations: summaries,
            },
            null,
            2,
          );

        case 'csv':
          return this.exportToCSV(summaries, includeMetadata);

        case 'markdown':
          return this.exportToMarkdown(summaries, includeMetadata);

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logError('Failed to export conversations', {
        error,
        userId: this.userId,
      });
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private getTimeFilter(timeRange: string): Record<string, any> {
    const now = new Date();
    const filters: Record<string, any> = {};

    switch (timeRange) {
      case 'day':
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filters.timestamp_gte = dayAgo.toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filters.timestamp_gte = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filters.timestamp_gte = monthAgo.toISOString();
        break;
      case 'all':
      default:
        // No time filter
        break;
    }

    return filters;
  }

  private exportToCSV(summaries: ConversationSummary[], includeMetadata: boolean): string {
    let headers = [
      'conversationId',
      'summary',
      'keyTopics',
      'entities',
      'sentiment',
      'messageCount',
      'lastUpdated',
    ];

    let csv = headers.join(',') + '\n';

    summaries.forEach(summary => {
      const row = [
        `"${summary.conversationId}"`,
        `"${summary.summary.replace(/"/g, '""')}"`,
        `"${summary.keyTopics.join('; ')}"`,
        `"${summary.entities.join('; ')}"`,
        summary.sentiment,
        summary.messageCount.toString(),
        summary.lastUpdated,
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private exportToMarkdown(summaries: ConversationSummary[], includeMetadata: boolean): string {
    let markdown = `# Conversation Export

`;
    markdown += `**User ID:** ${this.userId}
`;
    markdown += `**Exported At:** ${new Date().toISOString()}
`;
    markdown += `**Total Conversations:** ${summaries.length}

`;

    summaries.forEach((summary, index) => {
      markdown += `## Conversation ${index + 1}

`;
      markdown += `**ID:** ${summary.conversationId}
`;
      markdown += `**Summary:** ${summary.summary}
`;
      markdown += `**Key Topics:** ${summary.keyTopics.join(', ')}
`;
      markdown += `**Entities:** ${summary.entities.join(', ')}
`;
      markdown += `**Sentiment:** ${summary.sentiment}
`;
      markdown += `**Messages:** ${summary.messageCount}
`;
      markdown += `**Last Updated:** ${summary.lastUpdated}

`;
      markdown += '---\n\n';
    });

    return markdown;
  }
}

/**
 * Factory function for creating conversation memory instance
 */
export async function createConversationMemory(userId: string): Promise<ChatbotConversationMemory> {
  const memory = new ChatbotConversationMemory(userId);
  await memory.initialize();
  return memory;
}

/**
 * Utility function to check if conversation memory is available
 */
export function isConversationMemoryEnabled(): boolean {
  return !!(env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN);
}
