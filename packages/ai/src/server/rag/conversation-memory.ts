/**
 * Conversation Memory and Context Persistence for AI SDK v5 RAG
 * Maintains conversation history and contextual understanding across sessions
 */

import { logInfo } from '@repo/observability/server/next';
import { generateEmbedding } from './ai-sdk-rag';
import type { RAGDatabaseBridge } from './database-bridge';

/**
 * Conversation message with metadata
 */
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    ragContextUsed?: boolean;
    sourcesUsed?: string[];
    confidence?: number;
    toolCalls?: any[];
  };
}

/**
 * Conversation thread
 */
export interface ConversationThread {
  id: string;
  userId?: string;
  title?: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

/**
 * Context summary for efficient retrieval
 */
export interface ContextSummary {
  id: string;
  conversationId: string;
  summary: string;
  topics: string[];
  keyEntities: string[];
  embedding?: number[];
  messageRange: {
    start: number;
    end: number;
  };
  createdAt: number;
}

/**
 * Memory configuration
 */
export interface ConversationMemoryConfig {
  // Storage
  vectorStore?: RAGDatabaseBridge;

  // Conversation management
  maxMessagesInMemory?: number;
  maxConversationAge?: number; // milliseconds
  summaryInterval?: number; // messages

  // Context retrieval
  contextTopK?: number;
  contextThreshold?: number;
  maxContextLength?: number;

  // Entity extraction
  enableEntityExtraction?: boolean;
  enableTopicExtraction?: boolean;

  // Embeddings
  embedConversations?: boolean;
  embedSummaries?: boolean;
}

/**
 * Conversation memory manager
 */
export class ConversationMemoryManager {
  private conversations = new Map<string, ConversationThread>();
  private summaries = new Map<string, ContextSummary[]>();
  private config: Required<ConversationMemoryConfig>;

  constructor(config: ConversationMemoryConfig = {}) {
    this.config = {
      vectorStore: config.vectorStore!,
      maxMessagesInMemory: 100,
      maxConversationAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      summaryInterval: 10,
      contextTopK: 5,
      contextThreshold: 0.7,
      maxContextLength: 2000,
      enableEntityExtraction: true,
      enableTopicExtraction: true,
      embedConversations: true,
      embedSummaries: true,
      ...config,
    };
  }

  /**
   * Create or get existing conversation
   */
  async getOrCreateConversation(
    conversationId: string,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<ConversationThread> {
    if (this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }

    // Try to load from persistent storage
    let conversation = await this.loadConversation(conversationId);

    if (!conversation) {
      conversation = {
        id: conversationId,
        userId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata,
      };
    }

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>,
  ): Promise<ConversationMessage> {
    const conversation = await this.getOrCreateConversation(conversationId);

    const fullMessage: ConversationMessage = {
      ...message,
      id: `${conversationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    conversation.messages.push(fullMessage);
    conversation.updatedAt = Date.now();

    // Check if we need to create a summary
    if (conversation.messages.length % this.config.summaryInterval === 0) {
      await this.createContextSummary(conversationId);
    }

    // Trim old messages if needed
    if (conversation.messages.length > this.config.maxMessagesInMemory) {
      await this.trimConversation(conversationId);
    }

    // Save to persistent storage
    await this.saveConversation(conversation);

    logInfo('Message added to conversation', {
      operation: 'conversation_memory_add_message',
      conversationId,
      messageRole: message.role,
      messagesCount: conversation.messages.length,
    });

    return fullMessage;
  }

  /**
   * Get relevant context for a query
   */
  async getRelevantContext(
    conversationId: string,
    query: string,
    options?: {
      includeCurrentConversation?: boolean;
      includeSummaries?: boolean;
      includeRelatedConversations?: boolean;
    },
  ): Promise<{
    conversationContext: ConversationMessage[];
    summaryContext: ContextSummary[];
    relatedContext: ConversationMessage[];
    totalContextLength: number;
  }> {
    const opts = {
      includeCurrentConversation: true,
      includeSummaries: true,
      includeRelatedConversations: false,
      ...options,
    };

    const context = {
      conversationContext: [] as ConversationMessage[],
      summaryContext: [] as ContextSummary[],
      relatedContext: [] as ConversationMessage[],
      totalContextLength: 0,
    };

    // Get current conversation context
    if (opts.includeCurrentConversation) {
      const conversation = await this.getOrCreateConversation(conversationId);
      context.conversationContext = this.selectRelevantMessages(conversation.messages, query);
    }

    // Get summary context
    if (opts.includeSummaries) {
      context.summaryContext = await this.getRelevantSummaries(conversationId, query);
    }

    // Get related conversations context
    if (opts.includeRelatedConversations) {
      context.relatedContext = await this.getRelatedConversationContext(conversationId, query);
    }

    // Calculate total context length
    context.totalContextLength =
      context.conversationContext.reduce((sum, msg) => sum + msg.content.length, 0) +
      context.summaryContext.reduce((sum, summary) => sum + summary.summary.length, 0) +
      context.relatedContext.reduce((sum, msg) => sum + msg.content.length, 0);

    // Trim if too long
    if (context.totalContextLength > this.config.maxContextLength) {
      context.conversationContext = this.trimContextByPriority(
        context.conversationContext,
        context.summaryContext,
        context.relatedContext,
        this.config.maxContextLength,
      ).conversationContext;
    }

    logInfo('Retrieved conversation context', {
      operation: 'conversation_memory_get_context',
      conversationId,
      query: query.substring(0, 100),
      conversationMessages: context.conversationContext.length,
      summaries: context.summaryContext.length,
      relatedMessages: context.relatedContext.length,
      totalLength: context.totalContextLength,
    });

    return context;
  }

  /**
   * Create context summary for conversation segment
   */
  async createContextSummary(conversationId: string): Promise<ContextSummary | null> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.messages.length < this.config.summaryInterval) {
      return null;
    }

    const existingSummaries = this.summaries.get(conversationId) || [];
    const lastSummaryEnd =
      existingSummaries.length > 0
        ? Math.max(...existingSummaries.map(s => s.messageRange.end))
        : 0;

    const messagesToSummarize = conversation.messages.slice(lastSummaryEnd);
    if (messagesToSummarize.length < this.config.summaryInterval) {
      return null;
    }

    const summaryText = this.generateSummaryText(messagesToSummarize);
    const topics = this.config.enableTopicExtraction ? this.extractTopics(messagesToSummarize) : [];
    const entities = this.config.enableEntityExtraction
      ? this.extractEntities(messagesToSummarize)
      : [];

    const summary: ContextSummary = {
      id: `${conversationId}_summary_${Date.now()}`,
      conversationId,
      summary: summaryText,
      topics,
      keyEntities: entities,
      messageRange: {
        start: lastSummaryEnd,
        end: conversation.messages.length,
      },
      createdAt: Date.now(),
    };

    // Generate embedding for the summary
    if (this.config.embedSummaries) {
      try {
        summary.embedding = await generateEmbedding(summaryText);
      } catch (error) {
        logInfo('Failed to generate embedding for summary', {
          operation: 'conversation_memory_summary_embedding_failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Store the summary
    const conversationSummaries = this.summaries.get(conversationId) || [];
    conversationSummaries.push(summary);
    this.summaries.set(conversationId, conversationSummaries);

    // Save to persistent storage
    await this.saveSummary(summary);

    logInfo('Created conversation summary', {
      operation: 'conversation_memory_create_summary',
      conversationId,
      summaryId: summary.id,
      messagesCount: messagesToSummarize.length,
      topics: topics.length,
      entities: entities.length,
    });

    return summary;
  }

  /**
   * Select relevant messages from conversation
   */
  private selectRelevantMessages(
    messages: ConversationMessage[],
    query: string,
  ): ConversationMessage[] {
    // Simple relevance scoring based on keyword overlap
    const queryTerms = query.toLowerCase().split(/\s+/);
    const scoredMessages = messages.map(message => {
      const content = message.content.toLowerCase();
      const score = queryTerms.reduce((acc, term) => {
        return acc + (content.includes(term) ? 1 : 0);
      }, 0);

      return { message, score };
    });

    // Sort by score and recency, take top messages
    return scoredMessages
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.message.timestamp - a.message.timestamp;
      })
      .slice(0, this.config.contextTopK)
      .map(item => item.message);
  }

  /**
   * Get relevant summaries using vector search
   */
  private async getRelevantSummaries(
    conversationId: string,
    query: string,
  ): Promise<ContextSummary[]> {
    const summaries = this.summaries.get(conversationId) || [];
    if (summaries.length === 0 || !this.config.embedSummaries) {
      return [];
    }

    try {
      const queryEmbedding = await generateEmbedding(query);
      const scoredSummaries = summaries
        .filter(summary => summary.embedding)
        .map(summary => ({
          summary,
          score: this.cosineSimilarity(queryEmbedding, summary.embedding!),
        }))
        .filter(item => item.score >= this.config.contextThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.contextTopK);

      return scoredSummaries.map(item => item.summary);
    } catch (error) {
      logInfo('Failed to get relevant summaries', {
        operation: 'conversation_memory_get_summaries_failed',
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get related conversation context from other conversations
   */
  private async getRelatedConversationContext(
    conversationId: string,
    query: string,
  ): Promise<ConversationMessage[]> {
    // This is a simplified implementation
    // In production, you might use vector search across all conversations
    return [];
  }

  /**
   * Trim context by priority
   */
  private trimContextByPriority(
    conversationContext: ConversationMessage[],
    summaryContext: ContextSummary[],
    relatedContext: ConversationMessage[],
    maxLength: number,
  ): {
    conversationContext: ConversationMessage[];
    summaryContext: ContextSummary[];
    relatedContext: ConversationMessage[];
  } {
    // Priority: recent conversation > summaries > related context
    let currentLength = 0;
    const result = {
      conversationContext: [] as ConversationMessage[],
      summaryContext: [] as ContextSummary[],
      relatedContext: [] as ConversationMessage[],
    };

    // Add conversation context first (most recent first)
    const sortedConversation = [...conversationContext].sort((a, b) => b.timestamp - a.timestamp);

    for (const message of sortedConversation) {
      if (currentLength + message.content.length <= maxLength) {
        result.conversationContext.push(message);
        currentLength += message.content.length;
      }
    }

    // Add summaries if space remains
    for (const summary of summaryContext) {
      if (currentLength + summary.summary.length <= maxLength) {
        result.summaryContext.push(summary);
        currentLength += summary.summary.length;
      }
    }

    // Add related context if space remains
    for (const message of relatedContext) {
      if (currentLength + message.content.length <= maxLength) {
        result.relatedContext.push(message);
        currentLength += message.content.length;
      }
    }

    return result;
  }

  /**
   * Generate summary text from messages
   */
  private generateSummaryText(messages: ConversationMessage[]): string {
    // Simple summarization - in production, you might use an LLM
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    const topics = new Set<string>();
    const keyPoints: string[] = [];

    // Extract key topics from user messages
    userMessages.forEach(message => {
      const sentences = message.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (sentence.trim().length > 20) {
          topics.add(sentence.trim().substring(0, 100));
        }
      });
    });

    // Extract key points from assistant messages
    assistantMessages.forEach(message => {
      const sentences = message.content.split(/[.!?]+/);
      sentences.slice(0, 2).forEach(sentence => {
        if (sentence.trim().length > 20) {
          keyPoints.push(sentence.trim());
        }
      });
    });

    const summary = [
      `Conversation covered: ${Array.from(topics).slice(0, 3).join(', ')}`,
      ...keyPoints.slice(0, 3),
    ].join('. ');

    return summary + '.';
  }

  /**
   * Extract topics from messages (simplified)
   */
  private extractTopics(messages: ConversationMessage[]): string[] {
    const text = messages.map(m => m.content).join(' ');
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];

    // Count word frequencies
    const frequencies = new Map<string, number>();
    words.forEach(word => {
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });

    // Return top frequent words as topics
    return Array.from(frequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }

  /**
   * Extract entities from messages (simplified)
   */
  private extractEntities(messages: ConversationMessage[]): string[] {
    const text = messages.map(m => m.content).join(' ');

    // Simple entity extraction - look for capitalized words (safe regex)
    const words = text.split(/\s+/);
    const entities = words.filter(word => /^[A-Z][a-z]+$/.test(word) && word.length <= 30);

    return Array.from(new Set(entities)).slice(0, 10);
  }

  /**
   * Trim conversation to keep memory usage manageable
   */
  private async trimConversation(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const keepMessages = this.config.maxMessagesInMemory * 0.8; // Keep 80% when trimming
    const messagesToRemove = conversation.messages.length - keepMessages;

    if (messagesToRemove > 0) {
      // Remove oldest messages, but keep some context
      conversation.messages = conversation.messages.slice(messagesToRemove);
      conversation.updatedAt = Date.now();

      logInfo('Trimmed conversation messages', {
        operation: 'conversation_memory_trim',
        conversationId,
        removedMessages: messagesToRemove,
        remainingMessages: conversation.messages.length,
      });
    }
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
   * Clean up old conversations
   */
  async cleanup(): Promise<void> {
    const cutoffTime = Date.now() - this.config.maxConversationAge;
    const conversationsToRemove: string[] = [];

    this.conversations.forEach((conversation, id) => {
      if (conversation.updatedAt < cutoffTime) {
        conversationsToRemove.push(id);
      }
    });

    for (const id of conversationsToRemove) {
      this.conversations.delete(id);
      this.summaries.delete(id);
    }

    if (conversationsToRemove.length > 0) {
      logInfo('Cleaned up old conversations', {
        operation: 'conversation_memory_cleanup',
        removedConversations: conversationsToRemove.length,
      });
    }
  }

  /**
   * Persistent storage methods (placeholder implementations)
   */
  private async loadConversation(conversationId: string): Promise<ConversationThread | null> {
    // Implementation depends on your storage backend
    return null;
  }

  private async saveConversation(conversation: ConversationThread): Promise<void> {
    // Implementation depends on your storage backend
  }

  private async saveSummary(summary: ContextSummary): Promise<void> {
    // Implementation depends on your storage backend
  }

  /**
   * Get conversation statistics
   */
  getStats(): {
    activeConversations: number;
    totalMessages: number;
    totalSummaries: number;
    memoryUsage: string;
  } {
    const totalMessages = Array.from(this.conversations.values()).reduce(
      (sum, conv) => sum + conv.messages.length,
      0,
    );

    const totalSummaries = Array.from(this.summaries.values()).reduce(
      (sum, summaries) => sum + summaries.length,
      0,
    );

    return {
      activeConversations: this.conversations.size,
      totalMessages,
      totalSummaries,
      memoryUsage: `${Math.round(JSON.stringify([...this.conversations.values()]).length / 1024)}KB`,
    };
  }
}

/**
 * Factory function for creating conversation memory manager
 */
export function createConversationMemory(
  config?: ConversationMemoryConfig,
): ConversationMemoryManager {
  return new ConversationMemoryManager(config);
}

/**
 * Utility function to format context for LLM consumption
 */
export function formatConversationContext(context: {
  conversationContext: ConversationMessage[];
  summaryContext: ContextSummary[];
  relatedContext: ConversationMessage[];
}): string {
  const parts: string[] = [];

  // Add conversation history
  if (context.conversationContext.length > 0) {
    parts.push('## Recent Conversation');
    context.conversationContext.forEach(message => {
      parts.push(`**${message.role}**: ${message.content}`);
    });
  }

  // Add summaries
  if (context.summaryContext.length > 0) {
    parts.push('## Context Summaries');
    context.summaryContext.forEach((summary, index) => {
      parts.push(`**Summary ${index + 1}**: ${summary.summary}`);
      if (summary.topics.length > 0) {
        parts.push(`Topics: ${summary.topics.join(', ')}`);
      }
    });
  }

  // Add related context
  if (context.relatedContext.length > 0) {
    parts.push('## Related Context');
    context.relatedContext.forEach(message => {
      parts.push(`**${message.role}**: ${message.content.substring(0, 200)}...`);
    });
  }

  return parts.join('\n');
}
