/**
 * AI SDK v5 Agent Memory and State Management
 * Advanced memory systems for persistent agent state and conversation history
 */

import { logError, logInfo } from '@repo/observability/server/next';
import type { ModelMessage } from 'ai';

/**
 * Memory entry types for different kinds of stored information
 */
export type MemoryEntryType =
  | 'conversation'
  | 'task'
  | 'knowledge'
  | 'preference'
  | 'context'
  | 'tool_result'
  | 'decision'
  | 'observation';

/**
 * Individual memory entry
 */
export interface MemoryEntry {
  id: string;
  type: MemoryEntryType;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  importance: number; // 0-1 scale
  tags: string[];
  associatedMessages?: string[];
  expiresAt?: number;
}

/**
 * Memory search result
 */
export interface MemorySearchResult {
  entry: MemoryEntry;
  relevanceScore: number;
  contextMatch: boolean;
}

/**
 * Agent memory configuration
 */
export interface AgentMemoryConfig {
  maxEntries: number;
  retentionDays: number;
  compressionThreshold: number;
  indexingEnabled: boolean;
  persistenceEnabled: boolean;
  searchEnabled: boolean;
}

/**
 * Agent state snapshot
 */
export interface AgentStateSnapshot {
  agentId: string;
  sessionId: string;
  timestamp: number;
  conversationHistory: ModelMessage[];
  memoryEntries: MemoryEntry[];
  variables: Record<string, any>;
  context: Record<string, any>;
  metrics: Record<string, number>;
}

/**
 * Memory consolidation strategy
 */
export type MemoryConsolidationStrategy =
  | 'importance_based'
  | 'recency_based'
  | 'semantic_clustering'
  | 'frequency_based'
  | 'hybrid';

/**
 * Advanced memory manager for agents
 */
export class AgentMemoryManager {
  private memories = new Map<string, MemoryEntry>();
  private conversationHistory: ModelMessage[] = [];
  private agentVariables = new Map<string, any>();
  private contextStack: Record<string, any>[] = [];
  private config: AgentMemoryConfig;

  constructor(
    private agentId: string,
    config: Partial<AgentMemoryConfig> = {},
  ) {
    this.config = {
      maxEntries: 1000,
      retentionDays: 30,
      compressionThreshold: 500,
      indexingEnabled: true,
      persistenceEnabled: false,
      searchEnabled: true,
      ...config,
    };

    logInfo('Agent Memory Manager: Initialized', {
      operation: 'agent_memory_init',
      metadata: { agentId, config: this.config },
    });
  }

  /**
   * Add a memory entry
   */
  addMemory(
    type: MemoryEntryType,
    content: string,
    metadata: Record<string, any> = {},
    importance: number = 0.5,
    tags: string[] = [],
  ): string {
    const id = this.generateMemoryId();
    const timestamp = Date.now();

    const entry: MemoryEntry = {
      id,
      type,
      content,
      metadata,
      timestamp,
      importance: Math.max(0, Math.min(1, importance)),
      tags,
    };

    this.memories.set(id, entry);

    this.cleanupOldMemories();

    logInfo('Agent Memory Manager: Memory added', {
      operation: 'agent_memory_add',
      metadata: { agentId: this.agentId, memoryId: id, type, importance },
    });

    return id;
  }

  /**
   * Add conversation message to history
   */
  addMessage(message: ModelMessage): void {
    this.conversationHistory.push(message);

    // Create memory entry for important messages
    if (this.shouldMemorizeMessage(message)) {
      const importance = this.calculateMessageImportance(message);
      const tags = this.extractMessageTags(message);

      this.addMemory(
        'conversation',
        this.serializeMessage(message),
        { role: message.role, messageIndex: this.conversationHistory.length - 1 },
        importance,
        tags,
      );
    }

    // Limit conversation history size
    if (this.conversationHistory.length > this.config.compressionThreshold) {
      this.compressConversationHistory();
    }
  }

  /**
   * Get conversation history with optional filtering
   */
  getConversationHistory(limit?: number, includeMemorized: boolean = false): ModelMessage[] {
    let history = [...this.conversationHistory];

    if (includeMemorized) {
      // Add relevant memorized conversations
      const memorizedMessages = this.searchMemories('conversation', '', 5);
      const historicalMessages = memorizedMessages
        .map(result => this.deserializeMessage(result.entry.content))
        .filter(msg => msg !== null);

      history = [...historicalMessages, ...history];
    }

    return limit ? history.slice(-limit) : history;
  }

  /**
   * Search memories by type and content
   */
  searchMemories(
    type?: MemoryEntryType,
    query: string = '',
    limit: number = 10,
  ): MemorySearchResult[] {
    if (!this.config.searchEnabled) {
      return [];
    }

    const entries = Array.from(this.memories.values());
    const filtered = type ? entries.filter(e => e.type === type) : entries;

    if (!query) {
      return filtered
        .sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp)
        .slice(0, limit)
        .map(entry => ({ entry, relevanceScore: entry.importance, contextMatch: false }));
    }

    // Simple text-based search (can be enhanced with semantic search)
    const queryLower = query.toLowerCase();
    const results = filtered
      .map(entry => {
        const contentScore = this.calculateTextSimilarity(entry.content.toLowerCase(), queryLower);
        const tagScore = entry.tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 0.3 : 0;
        const metadataScore = JSON.stringify(entry.metadata).toLowerCase().includes(queryLower)
          ? 0.2
          : 0;

        const relevanceScore = (contentScore + tagScore + metadataScore) * entry.importance;

        return {
          entry,
          relevanceScore,
          contextMatch: contentScore > 0.3,
        };
      })
      .filter(result => result.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return results;
  }

  /**
   * Get relevant context for current conversation
   */
  getRelevantContext(currentPrompt: string, contextSize: number = 5): MemoryEntry[] {
    const results = this.searchMemories(undefined, currentPrompt, contextSize * 2);

    // Filter for high-relevance and diverse types
    const contextEntries: MemoryEntry[] = [];
    const seenTypes = new Set<MemoryEntryType>();

    for (const result of results) {
      if (contextEntries.length >= contextSize) break;

      // Prioritize diverse memory types and high relevance
      if (result.relevanceScore > 0.4 || !seenTypes.has(result.entry.type)) {
        contextEntries.push(result.entry);
        seenTypes.add(result.entry.type);
      }
    }

    return contextEntries;
  }

  /**
   * Set agent variable
   */
  setVariable(key: string, value: any): void {
    this.agentVariables.set(key, value);

    // Create memory entry for important variables
    if (this.isImportantVariable(key, value)) {
      this.addMemory(
        'preference',
        `${key}: ${JSON.stringify(value)}`,
        { variableKey: key, variableType: typeof value },
        0.6,
        ['variable', key],
      );
    }
  }

  /**
   * Get agent variable
   */
  getVariable(key: string): any {
    return this.agentVariables.get(key);
  }

  /**
   * Push context onto stack
   */
  pushContext(context: Record<string, any>): void {
    this.contextStack.push(context);

    // Add context memory
    this.addMemory(
      'context',
      JSON.stringify(context),
      { contextLevel: this.contextStack.length },
      0.4,
      ['context', `level_${this.contextStack.length}`],
    );
  }

  /**
   * Pop context from stack
   */
  popContext(): Record<string, any> | undefined {
    return this.contextStack.pop();
  }

  /**
   * Get current context
   */
  getCurrentContext(): Record<string, any> {
    return this.contextStack[this.contextStack.length - 1] || {};
  }

  /**
   * Create state snapshot
   */
  createSnapshot(sessionId: string): AgentStateSnapshot {
    return {
      agentId: this.agentId,
      sessionId,
      timestamp: Date.now(),
      conversationHistory: [...this.conversationHistory],
      memoryEntries: Array.from(this.memories.values()),
      variables: Object.fromEntries(this.agentVariables),
      context: this.getCurrentContext(),
      metrics: this.getMemoryMetrics(),
    };
  }

  /**
   * Restore from state snapshot
   */
  restoreFromSnapshot(snapshot: AgentStateSnapshot): void {
    this.conversationHistory = [...snapshot.conversationHistory];
    this.memories.clear();

    snapshot.memoryEntries.forEach(entry => {
      this.memories.set(entry.id, entry);
    });

    this.agentVariables.clear();
    Object.entries(snapshot.variables).forEach(([key, value]) => {
      this.agentVariables.set(key, value);
    });

    logInfo('Agent Memory Manager: Restored from snapshot', {
      operation: 'agent_memory_restore',
      metadata: {
        agentId: this.agentId,
        sessionId: snapshot.sessionId,
        memoriesCount: snapshot.memoryEntries.length,
        messagesCount: snapshot.conversationHistory.length,
      },
    });
  }

  /**
   * Consolidate memories using specified strategy
   */
  consolidateMemories(strategy: MemoryConsolidationStrategy = 'importance_based'): void {
    const entries = Array.from(this.memories.values());

    if (entries.length <= this.config.maxEntries * 0.8) {
      return; // No need to consolidate yet
    }

    let toRemove: string[] = [];

    switch (strategy) {
      case 'importance_based':
        toRemove = entries
          .sort((a, b) => a.importance - b.importance)
          .slice(0, Math.floor(entries.length * 0.3))
          .map(e => e.id);
        break;

      case 'recency_based':
        const cutoffTime = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
        toRemove = entries.filter(e => e.timestamp < cutoffTime).map(e => e.id);
        break;

      case 'frequency_based':
        // Remove memories that haven't been accessed recently
        toRemove = entries
          .filter(
            e =>
              !e.metadata.lastAccessed ||
              Date.now() - e.metadata.lastAccessed > 7 * 24 * 60 * 60 * 1000,
          )
          .sort((a, b) => a.importance - b.importance)
          .slice(0, Math.floor(entries.length * 0.2))
          .map(e => e.id);
        break;

      default:
        // Hybrid approach
        toRemove = entries
          .filter(e => e.importance < 0.3 && Date.now() - e.timestamp > 7 * 24 * 60 * 60 * 1000)
          .map(e => e.id);
    }

    // Remove selected memories
    toRemove.forEach(id => this.memories.delete(id));

    logInfo('Agent Memory Manager: Consolidated memories', {
      operation: 'agent_memory_consolidate',
      metadata: {
        agentId: this.agentId,
        strategy,
        removedCount: toRemove.length,
        remainingCount: this.memories.size,
      },
    });
  }

  /**
   * Get memory metrics
   */
  getMemoryMetrics(): Record<string, number> {
    const entries = Array.from(this.memories.values());
    const typeDistribution: Record<string, number> = {};

    entries.forEach(entry => {
      typeDistribution[entry.type] = (typeDistribution[entry.type] || 0) + 1;
    });

    return {
      totalMemories: entries.length,
      conversationLength: this.conversationHistory.length,
      averageImportance: entries.reduce((sum, e) => sum + e.importance, 0) / entries.length || 0,
      variablesCount: this.agentVariables.size,
      contextDepth: this.contextStack.length,
      ...typeDistribution,
    };
  }

  /**
   * Clear all memories
   */
  clearMemories(): void {
    this.memories.clear();
    this.conversationHistory = [];
    this.agentVariables.clear();
    this.contextStack = [];

    logInfo('Agent Memory Manager: All memories cleared', {
      operation: 'agent_memory_clear',
      metadata: { agentId: this.agentId },
    });
  }

  // Private helper methods

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private shouldMemorizeMessage(message: ModelMessage): boolean {
    // Memorize important messages based on content and role
    if (message.role === 'system') return true;
    if (
      message.role === 'user' &&
      typeof message.content === 'string' &&
      message.content.length > 50
    )
      return true;
    if (message.role === 'assistant' && this.hasToolCalls(message)) return true;

    return false;
  }

  private hasToolCalls(message: ModelMessage): boolean {
    if (typeof message.content === 'string') return false;

    return (
      Array.isArray(message.content) && message.content.some(part => part.type === 'tool-call')
    );
  }

  private calculateMessageImportance(message: ModelMessage): number {
    let importance = 0.5;

    if (message.role === 'system') importance += 0.3;
    if (message.role === 'user') importance += 0.2;
    if (this.hasToolCalls(message)) importance += 0.3;

    const content =
      typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

    // Increase importance for longer, more detailed messages
    if (content.length > 200) importance += 0.1;
    if (content.length > 500) importance += 0.1;

    return Math.min(1, importance);
  }

  private extractMessageTags(message: ModelMessage): string[] {
    const tags = [message.role];

    // Add tool-related tags as strings (not as role types)
    if (this.hasToolCalls(message)) {
      // Just track this as metadata, don't add to role-based tags
    }

    return tags;
  }

  private serializeMessage(message: ModelMessage): string {
    return JSON.stringify(message);
  }

  private deserializeMessage(content: string): ModelMessage | null {
    try {
      return JSON.parse(content) as ModelMessage;
    } catch {
      return null;
    }
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity (can be enhanced with embeddings)
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private isImportantVariable(key: string, value: any): boolean {
    // Consider certain variables as important enough to memorize
    const importantKeys = ['user_preference', 'goal', 'constraint', 'configuration'];
    return (
      importantKeys.some(k => key.toLowerCase().includes(k)) ||
      (typeof value === 'object' && value !== null)
    );
  }

  private compressConversationHistory(): void {
    // Keep recent messages and important/tool-related messages
    const recentMessages = this.conversationHistory.slice(-50);
    const importantMessages = this.conversationHistory
      .slice(0, -50)
      .filter(msg => this.shouldMemorizeMessage(msg));

    this.conversationHistory = [...importantMessages, ...recentMessages];

    logInfo('Agent Memory Manager: Conversation history compressed', {
      operation: 'agent_memory_compress',
      metadata: {
        agentId: this.agentId,
        newLength: this.conversationHistory.length,
      },
    });
  }

  private cleanupOldMemories(): void {
    if (this.memories.size <= this.config.maxEntries) return;

    // Remove oldest, least important memories
    const entries = Array.from(this.memories.entries());
    const toRemove = entries
      .sort(
        ([, a], [, b]) =>
          a.importance +
          (Date.now() - a.timestamp) / 1000000 -
          (b.importance + (Date.now() - b.timestamp) / 1000000),
      )
      .slice(0, Math.floor(this.memories.size * 0.1))
      .map(([id]) => id);

    toRemove.forEach(id => this.memories.delete(id));
  }
}

/**
 * Memory-aware agent wrapper that enhances agents with persistent memory
 */
export function createMemoryAwareAgent<T extends { id: string }>(
  agent: T,
  memoryConfig: Partial<AgentMemoryConfig> = {},
): T & { memory: AgentMemoryManager } {
  const memory = new AgentMemoryManager(agent.id, memoryConfig);

  return {
    ...agent,
    memory,
  };
}

/**
 * Utility functions for memory management
 */
export const memoryUtils = {
  /**
   * Create optimized memory config for different agent types
   */
  createMemoryConfig: (
    agentType: 'chat' | 'research' | 'task' | 'longRunning',
  ): AgentMemoryConfig => {
    const configs = {
      chat: {
        maxEntries: 500,
        retentionDays: 7,
        compressionThreshold: 100,
        indexingEnabled: true,
        persistenceEnabled: false,
        searchEnabled: true,
      },
      research: {
        maxEntries: 2000,
        retentionDays: 30,
        compressionThreshold: 200,
        indexingEnabled: true,
        persistenceEnabled: true,
        searchEnabled: true,
      },
      task: {
        maxEntries: 1000,
        retentionDays: 14,
        compressionThreshold: 150,
        indexingEnabled: true,
        persistenceEnabled: true,
        searchEnabled: true,
      },
      longRunning: {
        maxEntries: 5000,
        retentionDays: 90,
        compressionThreshold: 500,
        indexingEnabled: true,
        persistenceEnabled: true,
        searchEnabled: true,
      },
    };

    return configs[agentType];
  },

  /**
   * Merge memory snapshots
   */
  mergeSnapshots: (snapshots: AgentStateSnapshot[]): AgentStateSnapshot | null => {
    if (snapshots.length === 0) return null;
    if (snapshots.length === 1) return snapshots[0];

    const latest = snapshots.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );

    // Merge memories from all snapshots
    const allMemories = new Map<string, MemoryEntry>();
    snapshots.forEach(snapshot => {
      snapshot.memoryEntries.forEach(entry => {
        allMemories.set(entry.id, entry);
      });
    });

    return {
      ...latest,
      memoryEntries: Array.from(allMemories.values()),
    };
  },

  /**
   * Export memory for persistence
   */
  exportMemory: (manager: AgentMemoryManager): string => {
    const snapshot = manager.createSnapshot('export');
    return JSON.stringify(snapshot, null, 2);
  },

  /**
   * Import memory from persistence
   */
  importMemory: (manager: AgentMemoryManager, data: string): boolean => {
    try {
      const snapshot = JSON.parse(data) as AgentStateSnapshot;
      manager.restoreFromSnapshot(snapshot);
      return true;
    } catch (error) {
      logError('Memory import failed', {
        operation: 'memory_import_error',
        error: error as Error,
      });
      return false;
    }
  },
} as const;
