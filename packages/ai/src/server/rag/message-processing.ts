/**
 * Enhanced Message Processing for RAG with convertToCoreMessages Support
 * Provides better message handling and multimodal content support
 */

import { logInfo } from '@repo/observability/server/next';
import { convertToCoreMessages, type CoreSystemMessage, type ModelMessage } from 'ai';
import { RAGDatabaseBridge } from './database-bridge';
import { trackRAGOperation } from './telemetry';

/**
 * Configuration for message processing
 */
export interface MessageProcessingConfig {
  vectorStore: RAGDatabaseBridge;
  topK?: number;
  useUpstashEmbedding?: boolean;
  similarityThreshold?: number;
  maxContextLength?: number;
  contextInjectionStrategy?: 'system' | 'user' | 'assistant';
}

/**
 * Result of message processing with RAG enhancement
 */
export interface ProcessedMessageResult {
  messages: ModelMessage[];
  contextUsed: boolean;
  contextSources: number;
  averageRelevance?: number;
  processingTime: number;
}

/**
 * Enhanced message processor with RAG capabilities
 */
export class RAGMessageProcessor {
  constructor(private config: MessageProcessingConfig) {}

  /**
   * Process messages and inject RAG context using convertToCoreMessages
   */
  async processMessages(
    messages: any[],
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
      includeMetadata?: boolean;
    },
  ): Promise<ProcessedMessageResult> {
    return trackRAGOperation('message_processing', async tracker => {
      const startTime = Date.now();

      // Convert to core messages first
      const coreMessages = convertToCoreMessages(messages);
      tracker.setQuery('message_processing', 'embedding');

      // Extract the last user message for context retrieval
      const lastUserMessage = this.getLastUserMessage(coreMessages);

      if (!lastUserMessage) {
        logInfo('No user message found for RAG context', {
          operation: 'message_processing_skip',
          messageCount: coreMessages.length,
        });

        return {
          messages: coreMessages,
          contextUsed: false,
          contextSources: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Get text content from the user message (handle multimodal)
      const queryText = this.extractTextFromMessage(lastUserMessage);

      if (!queryText) {
        return {
          messages: coreMessages,
          contextUsed: false,
          contextSources: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Retrieve relevant context
      const searchResults = await this.retrieveContext(queryText);
      tracker.setSearchResults(searchResults);

      if (searchResults.length === 0) {
        logInfo('No relevant context found for message processing', {
          operation: 'message_processing_no_context',
          query: queryText.substring(0, 100),
        });

        return {
          messages: coreMessages,
          contextUsed: false,
          contextSources: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Convert search results to expected format for context injection
      const contextResults = searchResults.map(result => ({
        content: result.content || result.metadata?.content || '',
        score: result.score,
        metadata: result.metadata,
        id: result.id,
      }));

      // Inject context into messages
      const enhancedMessages = await this.injectContext(coreMessages, contextResults, options);

      const averageRelevance =
        searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length;

      logInfo('Message processing completed with RAG context', {
        operation: 'message_processing_success',
        contextSources: searchResults.length,
        averageRelevance,
        processingTime: Date.now() - startTime,
      });

      return {
        messages: enhancedMessages,
        contextUsed: true,
        contextSources: searchResults.length,
        averageRelevance,
        processingTime: Date.now() - startTime,
      };
    });
  }

  /**
   * Process conversation history with context awareness
   */
  async processConversationHistory(
    messages: any[],
    options?: {
      maxHistoryLength?: number;
      contextWindow?: number;
      summarizeOldMessages?: boolean;
    },
  ): Promise<ProcessedMessageResult> {
    const maxHistory = options?.maxHistoryLength ?? 10;
    const _contextWindow = options?.contextWindow ?? 3;

    // Keep recent messages and potentially summarize older ones
    const recentMessages = messages.slice(-maxHistory);

    // Process the recent messages for RAG context
    return this.processMessages(recentMessages, {
      systemPrompt:
        'You are continuing a conversation. Use the provided context to maintain consistency.',
    });
  }

  /**
   * Extract multimodal content and create searchable text
   */
  extractMultimodalContent(message: ModelMessage): {
    text: string;
    hasImages: boolean;
    hasOtherContent: boolean;
  } {
    if (message.role === 'system') {
      return {
        text: message.content,
        hasImages: false,
        hasOtherContent: false,
      };
    }

    if (typeof message.content === 'string') {
      return {
        text: message.content,
        hasImages: false,
        hasOtherContent: false,
      };
    }

    if (Array.isArray(message.content)) {
      let text = '';
      let hasImages = false;
      let hasOtherContent = false;

      for (const part of message.content) {
        if (part.type === 'text') {
          text += part.text + ' ';
        } else if (part.type === 'image') {
          hasImages = true;
          // For images, we might want to add description if available
          text += '[Image content] ';
        } else {
          hasOtherContent = true;
          // Handle other content types as needed
        }
      }

      return {
        text: text.trim(),
        hasImages,
        hasOtherContent,
      };
    }

    return {
      text: '',
      hasImages: false,
      hasOtherContent: false,
    };
  }

  /**
   * Create enhanced system message with context
   */
  createContextualSystemMessage(
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    baseSystemPrompt?: string,
  ): CoreSystemMessage {
    const contextText = this.formatContextForSystem(searchResults);
    const basePrompt = baseSystemPrompt || this.getDefaultSystemPrompt();

    return {
      role: 'system',
      content: `${basePrompt}

CONTEXT INFORMATION:
The following information has been retrieved from the knowledge base and may be relevant to the user's questions:

${contextText}

Instructions:
- Use this context information to provide accurate and relevant responses
- Cite sources when referencing specific information from the context
- If the context doesn't contain relevant information for a question, rely on your general knowledge but mention the limitation
- Maintain the conversational flow while incorporating relevant context`,
    };
  }

  /**
   * Get the last user message from core messages
   */
  private getLastUserMessage(messages: ModelMessage[]): ModelMessage | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  }

  /**
   * Extract text content from a message (handling multimodal content)
   */
  private extractTextFromMessage(message: ModelMessage): string | null {
    if (message.role === 'system') {
      return message.content;
    }

    if (typeof message.content === 'string') {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      const textParts = message.content
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join(' ');

      return textParts || null;
    }

    return null;
  }

  /**
   * Retrieve relevant context from vector store
   */
  private async retrieveContext(query: string) {
    const searchResults = await this.config.vectorStore.queryDocuments(query, {
      topK: this.config.topK ?? 5,
      threshold: this.config.similarityThreshold ?? 0.7,
      includeContent: true,
    });

    return searchResults;
  }

  /**
   * Inject context into messages based on strategy
   */
  private async injectContext(
    messages: ModelMessage[],
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
      includeMetadata?: boolean;
    },
  ): Promise<ModelMessage[]> {
    const strategy = this.config.contextInjectionStrategy ?? 'system';

    switch (strategy) {
      case 'system':
        return this.injectAsSystemMessage(messages, searchResults, options);

      case 'user':
        return this.injectAsUserContext(messages, searchResults, options);

      case 'assistant':
        return this.injectAsAssistantContext(messages, searchResults, options);

      default:
        return this.injectAsSystemMessage(messages, searchResults, options);
    }
  }

  /**
   * Inject context as system message
   */
  private injectAsSystemMessage(
    messages: ModelMessage[],
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
    },
  ): ModelMessage[] {
    const contextualSystemMessage = this.createContextualSystemMessage(
      searchResults,
      options?.systemPrompt,
    );

    // Remove existing system messages if not preserving
    const filteredMessages = options?.preserveSystemMessages
      ? messages
      : messages.filter(m => m.role !== 'system');

    return [contextualSystemMessage, ...filteredMessages];
  }

  /**
   * Inject context into the last user message
   */
  private injectAsUserContext(
    messages: ModelMessage[],
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    options?: { includeMetadata?: boolean },
  ): ModelMessage[] {
    const contextText = this.formatContextForUser(searchResults, options?.includeMetadata);
    const enhancedMessages = [...messages];

    // Find and enhance the last user message
    for (let i = enhancedMessages.length - 1; i >= 0; i--) {
      if (enhancedMessages[i].role === 'user') {
        const originalMessage = enhancedMessages[i];

        if (typeof originalMessage.content === 'string') {
          enhancedMessages[i] = {
            ...originalMessage,
            content: `Context:
${contextText}

Question: ${originalMessage.content}`,
          } as ModelMessage;
        } else if (Array.isArray(originalMessage.content)) {
          enhancedMessages[i] = {
            ...originalMessage,
            content: [
              {
                type: 'text',
                text: `Context:
${contextText}

Question:`,
              },
              ...(originalMessage.content as any[]),
            ],
          } as ModelMessage;
        }
        break;
      }
    }

    return enhancedMessages;
  }

  /**
   * Inject context as assistant message (less common)
   */
  private injectAsAssistantContext(
    messages: ModelMessage[],
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    _options?: { includeMetadata?: boolean },
  ): ModelMessage[] {
    const contextText = this.formatContextForAssistant(searchResults);

    const contextMessage: ModelMessage = {
      role: 'assistant',
      content: `I have access to the following relevant information that may help answer your question:

${contextText}`,
    } as ModelMessage;

    return [...messages, contextMessage];
  }

  /**
   * Format context for system message
   */
  private formatContextForSystem(
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
  ): string {
    return searchResults
      .map((result, index) => {
        const source = result.metadata?.title || result.metadata?.source || `Document ${index + 1}`;
        const relevance = (result.score * 100).toFixed(1);
        const docId = result.id ? ` - Doc ID: ${result.id}` : '';
        return `[${source}${docId} - Relevance: ${relevance}%]\n${result.content}`;
      })
      .join('\n\n');
  }

  /**
   * Format context for user message
   */
  private formatContextForUser(
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
    includeMetadata?: boolean,
  ): string {
    return searchResults
      .map((result, index) => {
        if (includeMetadata) {
          const source = result.metadata?.title || `Source ${index + 1}`;
          const docId = result.id ? ` - Doc ID: ${result.id}` : '';
          return `[${source}${docId}]\n${result.content}`;
        }
        return result.content;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Format context for assistant message
   */
  private formatContextForAssistant(
    searchResults: Array<{ content: string; score: number; metadata?: any; id?: string | number }>,
  ): string {
    return searchResults
      .map((result, index) => {
        const source = result.metadata?.title || result.metadata?.source || `Source ${index + 1}`;
        const docId = result.id ? ` (Doc ID: ${result.id})` : '';
        return `${index + 1}. From "${source}"${docId}:\n${result.content}`;
      })
      .join('\n\n');
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `You are a helpful AI assistant with access to a knowledge base. Use the provided context information to give accurate and relevant responses to user questions.`;
  }
}

/**
 * Factory function to create RAG message processor
 */
export function createRAGMessageProcessor(config: MessageProcessingConfig): RAGMessageProcessor {
  return new RAGMessageProcessor(config);
}

/**
 * Convenience function for quick message processing
 */
export async function processMessagesWithRAG(
  messages: any[],
  config: MessageProcessingConfig,
  options?: {
    systemPrompt?: string;
    preserveSystemMessages?: boolean;
  },
): Promise<ProcessedMessageResult> {
  const processor = createRAGMessageProcessor(config);
  return processor.processMessages(messages, options);
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Basic message processing with RAG
   */
  basic: `
import { createRAGMessageProcessor } from './message-processing';
import { UpstashAIVector } from '../vector/ai-sdk-integration';

const vectorStore = new UpstashAIVector({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const processor = createRAGMessageProcessor({
  vectorStore,
  topK: 3,
  contextInjectionStrategy: 'system',
});

const messages = [
  { role: 'user', content: 'What are the benefits of TypeScript?' }
];

const result = await processor.processMessages(messages);
console.log(\`Context used: \${result.contextUsed}\`);
console.log(\`Sources: \${result.contextSources}\`);

// Use the enhanced messages with any AI SDK function
const response = await generateText({
  model: openai('gpt-4o'),
  messages: result.messages,
});
  `,

  /**
   * Multimodal content handling
   */
  multimodal: `
const messages = [
  {
    role: 'user',
    content: [
      { type: 'text', text: 'Analyze this image and tell me about the architecture' },
      { type: 'image', image: imageUrl }
    ]
  }
];

const result = await processor.processMessages(messages);

// The processor will extract text content for RAG while preserving multimodal structure
  `,

  /**
   * Conversation history processing
   */
  conversation: `
const conversationMessages = [
  { role: 'user', content: 'Tell me about React hooks' },
  { role: 'assistant', content: 'React hooks are functions that let you...' },
  { role: 'user', content: 'How do I optimize performance with them?' }
];

const result = await processor.processConversationHistory(conversationMessages, {
  maxHistoryLength: 5,
  contextWindow: 2,
});
  `,
};
