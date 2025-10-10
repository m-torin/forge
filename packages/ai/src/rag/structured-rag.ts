/**
 * Structured RAG Implementation with generateObject Support
 * Provides schema-based responses using AI SDK v5 generateObject patterns
 */

import { logInfo } from '@repo/observability/server/next';
import { generateObject, stepCountIs, streamObject, streamText, type LanguageModel } from 'ai';
import { z } from 'zod/v3';
import {
  RAGDatabaseBridge,
  createRAGDatabaseBridge,
  type RAGDatabaseConfig,
} from './database-bridge';
import { initializeRAGDegradation } from './graceful-degradation';
import { initializeRAGHealthMonitoring } from './health-monitoring';
import { createRAGMessageProcessor, type MessageProcessingConfig } from './message-processing';
import { ragRetry } from './retry-strategies';
import { trackRAGOperation } from './telemetry';

/**
 * Configuration for structured RAG operations
 */
export interface StructuredRAGConfig {
  vectorStore?: RAGDatabaseBridge;
  databaseConfig?: RAGDatabaseConfig;
  languageModel: LanguageModel;
  topK?: number;
  useUpstashEmbedding?: boolean;
  similarityThreshold?: number;
  systemPrompt?: string;
  messageProcessing?: {
    contextInjectionStrategy?: 'system' | 'user' | 'assistant';
    maxContextLength?: number;
  };
}

/**
 * Base response schema for all structured RAG responses
 */
export const baseRAGResponseSchema = z.object({
  answer: z.string().describe("The main answer to the user's question"),
  confidence: z.number().min(0).max(1).describe('Confidence score from 0 to 1'),
  sources: z
    .array(
      z.object({
        title: z.string().optional(),
        content: z.string(),
        relevance: z.number().min(0).max(1),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    )
    .describe('Sources used to generate the answer'),
  reasoningText: z.string().optional().describe('Explanation of how the answer was derived'),
});

export type BaseRAGResponse = z.infer<typeof baseRAGResponseSchema>;

/**
 * Pre-defined schemas for common use cases
 */
export const ragSchemas = {
  // Simple Q&A response
  qa: baseRAGResponseSchema,

  // Detailed analysis response
  analysis: baseRAGResponseSchema.extend({
    keyPoints: z.array(z.string()).describe('Key points extracted from the sources'),
    recommendations: z.array(z.string()).optional().describe('Actionable recommendations'),
    limitations: z.string().optional().describe('Limitations or caveats of the analysis'),
  }),

  // Comparison response
  comparison: baseRAGResponseSchema.extend({
    comparison: z.object({
      similarities: z.array(z.string()).describe('Common aspects between compared items'),
      differences: z
        .array(
          z.object({
            aspect: z.string(),
            itemA: z.string(),
            itemB: z.string(),
          }),
        )
        .describe('Key differences between compared items'),
      conclusion: z.string().describe('Overall comparison conclusion'),
    }),
  }),

  // Summary response
  summary: baseRAGResponseSchema.extend({
    summary: z.object({
      mainPoints: z.array(z.string()).describe('Main points from the content'),
      details: z
        .array(
          z.object({
            point: z.string(),
            elaboration: z.string(),
          }),
        )
        .describe('Detailed elaboration of main points'),
      conclusion: z.string().describe('Overall conclusion or takeaway'),
    }),
  }),

  // Fact extraction response
  facts: z.object({
    facts: z
      .array(
        z.object({
          statement: z.string().describe('The factual statement'),
          confidence: z.number().min(0).max(1).describe('Confidence in this fact'),
          source: z.string().optional().describe('Source of this fact'),
          category: z.string().optional().describe('Category or type of fact'),
        }),
      )
      .describe('Extracted facts from the sources'),
    totalSources: z.number().describe('Total number of sources analyzed'),
    reliability: z
      .enum(['high', 'medium', 'low'])
      .describe('Overall reliability of extracted facts'),
  }),
};

/**
 * Structured RAG Service
 */
export class StructuredRAGService {
  private vectorStore: RAGDatabaseBridge;
  private messageProcessor: ReturnType<typeof createRAGMessageProcessor>;

  constructor(private config: StructuredRAGConfig) {
    // Initialize vector store - either use provided one or create from config
    this.vectorStore =
      config.vectorStore ||
      createRAGDatabaseBridge({
        ...config.databaseConfig,
        useUpstashEmbedding: config.useUpstashEmbedding,
      });

    // Initialize health monitoring and degradation management
    initializeRAGHealthMonitoring(this.vectorStore);
    initializeRAGDegradation(this.vectorStore);

    // Initialize message processor with compatible configuration
    const messageConfig: MessageProcessingConfig = {
      vectorStore: this.vectorStore,
      topK: config.topK,
      useUpstashEmbedding: config.useUpstashEmbedding,
      similarityThreshold: config.similarityThreshold,
      contextInjectionStrategy: config.messageProcessing?.contextInjectionStrategy ?? 'system',
      maxContextLength: config.messageProcessing?.maxContextLength,
    };

    this.messageProcessor = createRAGMessageProcessor(messageConfig);
  }

  /**
   * Generate structured response using a predefined schema
   */
  async generateStructured<T extends z.ZodType>(
    query: string,
    schema: T,
    options?: {
      systemPrompt?: string;
      maxRetries?: number;
      temperature?: number;
    },
  ): Promise<z.infer<T>> {
    return trackRAGOperation('structured_rag_generate', async tracker => {
      tracker.setQuery(query, this.config.useUpstashEmbedding ? 'upstash_hosted' : 'embedding');

      // 1. Retrieve relevant context
      const searchResults = await this.retrieveContext(query);
      tracker.setSearchResults(searchResults);

      if (searchResults.length === 0) {
        // Return a "no information found" response that matches the schema
        throw new Error('No relevant information found in the knowledge base');
      }

      // 2. Format context for the LLM
      const contextText = this.formatContext(searchResults);

      // 3. Generate structured response
      const systemPrompt =
        options?.systemPrompt || this.config.systemPrompt || this.getDefaultSystemPrompt();

      const result = await generateObject({
        model: this.config.languageModel,
        schema,
        prompt: `${systemPrompt}

Context:
${contextText}

User Question: ${query}`,
        temperature: options?.temperature ?? 0.1,
      });

      logInfo('Structured RAG generation completed', {
        operation: 'structured_rag_generate',
        query: query.substring(0, 100),
        contextsUsed: searchResults.length,
        tokensUsed: result.usage?.totalTokens,
      });

      return result.object as z.infer<T>;
    });
  }

  /**
   * Stream structured response generation
   */
  async streamStructured<T extends z.ZodType>(
    query: string,
    schema: T,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      onPartialObject?: (partialObject: Partial<z.infer<T>>) => void;
    },
  ): Promise<any> {
    return trackRAGOperation('structured_rag_stream', async tracker => {
      tracker.setQuery(query, this.config.useUpstashEmbedding ? 'upstash_hosted' : 'embedding');

      // 1. Retrieve relevant context
      const searchResults = await this.retrieveContext(query);
      tracker.setSearchResults(searchResults);

      if (searchResults.length === 0) {
        throw new Error('No relevant information found in the knowledge base');
      }

      // 2. Format context for the LLM
      const contextText = this.formatContext(searchResults);

      // 3. Stream structured response
      const systemPrompt =
        options?.systemPrompt || this.config.systemPrompt || this.getDefaultSystemPrompt();

      const result = streamObject({
        model: this.config.languageModel,
        schema,
        prompt: `${systemPrompt}

Context:
${contextText}

User Question: ${query}`,
        temperature: options?.temperature ?? 0.1,
      });

      return result;
    });
  }

  /**
   * Generate Q&A style response
   */
  async generateQA(query: string): Promise<z.infer<typeof ragSchemas.qa>> {
    return this.generateStructured(query, ragSchemas.qa, {
      systemPrompt: `You are a helpful assistant that answers questions based on provided context.
      Always cite your sources and provide a confidence score.
      If the context doesn't contain enough information, be honest about limitations.`,
    });
  }

  /**
   * Generate detailed analysis response
   */
  async generateAnalysis(query: string): Promise<z.infer<typeof ragSchemas.analysis>> {
    return this.generateStructured(query, ragSchemas.analysis, {
      systemPrompt: `You are an expert analyst. Provide detailed analysis based on the provided context.
      Extract key points, provide recommendations where appropriate, and note any limitations.
      Structure your response to be actionable and insightful.`,
    });
  }

  /**
   * Generate comparison response
   */
  async generateComparison(query: string): Promise<z.infer<typeof ragSchemas.comparison>> {
    return this.generateStructured(query, ragSchemas.comparison, {
      systemPrompt: `You are a comparison expert. Analyze the provided context to compare different items, concepts, or approaches.
      Identify both similarities and key differences. Provide a balanced conclusion.`,
    });
  }

  /**
   * Generate summary response
   */
  async generateSummary(query: string): Promise<z.infer<typeof ragSchemas.summary>> {
    return this.generateStructured(query, ragSchemas.summary, {
      systemPrompt: `You are a summarization expert. Create comprehensive summaries from the provided context.
      Identify main points and provide detailed elaboration. Conclude with key takeaways.`,
    });
  }

  /**
   * Extract facts from sources
   */
  async extractFacts(query: string): Promise<z.infer<typeof ragSchemas.facts>> {
    return this.generateStructured(query, ragSchemas.facts, {
      systemPrompt: `You are a fact extraction expert. Extract verifiable facts from the provided context.
      Assess confidence levels and categorize facts appropriately. Focus on accuracy and reliability.`,
    });
  }

  /**
   * Generate structured response from conversation messages
   */
  async generateStructuredFromMessages<T extends z.ZodType>(
    messages: any[],
    schema: T,
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
      temperature?: number;
      maxRetries?: number;
    },
  ): Promise<z.infer<T>> {
    return trackRAGOperation('structured_rag_from_messages', async tracker => {
      // Process messages with RAG context
      const processedResult = await this.messageProcessor.processMessages(messages, {
        systemPrompt: options?.systemPrompt,
        preserveSystemMessages: options?.preserveSystemMessages,
      });

      tracker.setSearchResults(
        Array(processedResult.contextSources).fill({
          score: processedResult.averageRelevance || 0.8,
        }),
      );

      if (!processedResult.contextUsed) {
        throw new Error('No relevant context found for the conversation');
      }

      // Generate structured response using the enhanced messages
      const result = await generateObject({
        model: this.config.languageModel,
        messages: processedResult.messages,
        schema,
        temperature: options?.temperature ?? 0.1,
      });

      logInfo('Structured RAG from messages completed', {
        operation: 'structured_rag_from_messages',
        contextSources: processedResult.contextSources,
        tokensUsed: result.usage?.totalTokens,
        processingTime: processedResult.processingTime,
      });

      return result.object as z.infer<T>;
    });
  }

  /**
   * Stream structured response from conversation messages
   */
  async streamStructuredFromMessages<T extends z.ZodType>(
    messages: any[],
    schema: T,
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
      temperature?: number;
      onPartialObject?: (partialObject: Partial<z.infer<T>>) => void;
    },
  ): Promise<any> {
    return trackRAGOperation('structured_rag_stream_from_messages', async tracker => {
      // Process messages with RAG context
      const processedResult = await this.messageProcessor.processMessages(messages, {
        systemPrompt: options?.systemPrompt,
        preserveSystemMessages: options?.preserveSystemMessages,
      });

      tracker.setSearchResults(
        Array(processedResult.contextSources).fill({
          score: processedResult.averageRelevance || 0.8,
        }),
      );

      if (!processedResult.contextUsed) {
        throw new Error('No relevant context found for the conversation');
      }

      // Stream structured response using the enhanced messages
      const result = streamObject({
        model: this.config.languageModel,
        messages: processedResult.messages,
        schema,
        temperature: options?.temperature ?? 0.1,
      });

      return result;
    });
  }

  /**
   * Stream text response with RAG context (non-structured)
   */
  async streamTextWithRAG(
    messages: any[],
    options?: {
      systemPrompt?: string;
      preserveSystemMessages?: boolean;
      temperature?: number;
      maxOutputTokens?: number;
      onFinish?: (result: any) => void;
    },
  ) {
    return trackRAGOperation('text_rag_stream_from_messages', async tracker => {
      // Process messages with RAG context
      const processedResult = await this.messageProcessor.processMessages(messages, {
        systemPrompt: options?.systemPrompt,
        preserveSystemMessages: options?.preserveSystemMessages,
      });

      tracker.setSearchResults(
        Array(processedResult.contextSources).fill({
          score: processedResult.averageRelevance || 0.8,
        }),
      );

      // Stream text response using the enhanced messages
      const result = streamText({
        model: this.config.languageModel,
        messages: processedResult.messages,
        temperature: options?.temperature ?? 0.1,
        stopWhen: stepCountIs(1),
      });

      return result;
    });
  }

  /**
   * Enhanced conversation processing with multimodal support
   */
  async processConversationWithMultimodal(
    messages: any[],
    options?: {
      maxHistoryLength?: number;
      extractImageDescriptions?: boolean;
      systemPrompt?: string;
    },
  ) {
    // First, extract multimodal content and create searchable text
    const processedMessages = messages.map(message => {
      if (message.role === 'user' && Array.isArray(message.content)) {
        const multimodalInfo = this.messageProcessor.extractMultimodalContent(message);

        // If there are images and we want to extract descriptions
        if (multimodalInfo.hasImages && options?.extractImageDescriptions) {
          // Add image context to the searchable text
          // This would typically involve image analysis, but for now we'll note the presence
          return {
            ...message,
            _searchableText: multimodalInfo.text + ' [Contains image content]',
          };
        }

        return {
          ...message,
          _searchableText: multimodalInfo.text,
        };
      }

      return message;
    });

    // Process with enhanced context awareness
    return this.messageProcessor.processConversationHistory(processedMessages, {
      maxHistoryLength: options?.maxHistoryLength ?? 10,
    });
  }

  /**
   * Retrieve relevant context from vector store
   * Enhanced with retry and circuit breaker protection
   */
  private async retrieveContext(query: string) {
    return await ragRetry.vector(async () => {
      const searchResults = await this.vectorStore.queryDocuments(query, {
        topK: this.config.topK ?? 5,
        threshold: this.config.similarityThreshold ?? 0.7,
        includeContent: true,
      });

      return searchResults;
    });
  }

  /**
   * Format context for LLM consumption
   */
  private formatContext(
    searchResults: Array<{ id: string | number; content?: string; score: number; metadata?: any }>,
  ) {
    return searchResults
      .map((result, index) => {
        const source = result.metadata?.title || result.metadata?.source || `Source ${index + 1}`;
        const relevance = (result.score * 100).toFixed(1);
        const content = result.content || result.metadata?.content || '';
        return `[Source: ${source} | Doc ID: ${result.id} | Relevance: ${relevance}%]
${content}`;
      })
      .join('\n');
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `You are a knowledgeable assistant that provides accurate, structured responses based on provided context.

Guidelines:
1. Only use information from the provided context
2. If context is insufficient, indicate this clearly
3. Provide confidence scores based on the quality and quantity of supporting evidence
4. Always cite your sources appropriately
5. Be precise and factual in your responses
6. Structure your response according to the required schema`;
  }
}

/**
 * Factory function to create structured RAG service
 */
export function createStructuredRAG(config: StructuredRAGConfig): StructuredRAGService {
  return new StructuredRAGService(config);
}

/**
 * Convenience function for quick structured RAG queries
 */
export async function quickStructuredRAG<T extends z.ZodType>(
  query: string,
  schema: T,
  config: StructuredRAGConfig,
  options?: {
    systemPrompt?: string;
    temperature?: number;
  },
): Promise<z.infer<T>> {
  const service = createStructuredRAG(config);
  return service.generateStructured(query, schema, options);
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Basic Q&A structured response
   */
  basicQA: `
import { createStructuredRAG, ragSchemas } from './structured-rag';
import { UpstashAIVector } from '../vector/ai-sdk-integration';
import { openai } from '@ai-sdk/openai';

const vectorStore = new UpstashAIVector({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const ragService = createStructuredRAG({
  vectorStore,
  languageModel: openai('gpt-4o'),
  topK: 3,
  similarityThreshold: 0.8,
});

const response = await ragService.generateQA('What are the benefits of TypeScript?');
console.log(response.answer);
console.log(\`Confidence: \${response.confidence}\`);
console.log(\`Sources: \${response.sources.length}\`);
  `,

  /**
   * Custom schema example
   */
  customSchema: `
import { z } from "zod/v3";

const productInfoSchema = z.object({
  productName: z.string(),
  features: z.array(z.string()),
  pricing: z.object({
    currency: z.string(),
    amount: z.number(),
    billing: z.enum(['monthly', 'yearly', 'one-time']),
  }).optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  recommendation: z.enum(['highly_recommended', 'recommended', 'not_recommended']),
  reasoning: z.string(),
});

const productInfo = await ragService.generateStructured(
  'Tell me about the pricing and features of our premium plan',
  productInfoSchema
);
  `,

  /**
   * Streaming example
   */
  streaming: `
const stream = await ragService.streamStructured(
  'Analyze the market trends for 2024',
  ragSchemas.analysis,
  {
    onPartialObject: (partial) => {
      console.log('Partial response:', partial);
      // Update UI with partial response
    }
  }
);

for await (const partialObject of stream.partialObjectStream) {
  console.log('Streaming partial:', partialObject);
}

const finalResult = await stream.object;
console.log('Final result:', finalResult);
  `,

  /**
   * Message-based structured RAG
   */
  messageBasedStructured: `
const conversationMessages = [
  { role: 'user', content: 'Tell me about React hooks' },
  { role: 'assistant', content: 'React hooks are functions that...' },
  { role: 'user', content: 'Can you provide a detailed analysis of their performance implications?' }
];

const analysis = await ragService.generateStructuredFromMessages(
  conversationMessages,
  ragSchemas.analysis,
  {
    systemPrompt: 'You are a React expert. Provide detailed technical analysis.',
    preserveSystemMessages: true,
  }
);

console.log('Analysis:', analysis.answer);
console.log('Key Points:', analysis.keyPoints);
console.log('Recommendations:', analysis.recommendations);
  `,

  /**
   * Streaming from messages
   */
  streamingFromMessages: `
const stream = await ragService.streamStructuredFromMessages(
  conversationMessages,
  ragSchemas.comparison,
  {
    onPartialObject: (partial) => {
      // Real-time updates as the comparison is being generated
      if (partial.comparison?.similarities) {
        console.log('Similarities found:', partial.comparison.similarities);
      }
    }
  }
);

// Get the final result
const comparison = await stream.object;
  `,

  /**
   * Text streaming with RAG context
   */
  textStreaming: `
const textStream = await ragService.streamTextWithRAG(
  [{ role: 'user', content: 'Explain the benefits and drawbacks of microservices' }],
  {
    temperature: 0.1,
    maxOutputTokens: 1000,
    onFinish: (result) => {
      console.log('Streaming finished:', result.usage);
    }
  }
);

// Stream the text response
for await (const chunk of textStream.textStream) {
  process.stdout.write(chunk);
}
  `,

  /**
   * Multimodal conversation processing
   */
  multimodalConversation: `
const multimodalMessages = [
  {
    role: 'user',
    content: [
      { type: 'text', text: 'What can you tell me about this architecture diagram?' },
      { type: 'image', image: 'data:image/jpeg;base64,...' }
    ]
  }
];

const processedResult = await ragService.processConversationWithMultimodal(
  multimodalMessages,
  {
    extractImageDescriptions: true,
    systemPrompt: 'You are an architecture expert. Analyze both text and visual content.',
  }
);

// The messages now include RAG context relevant to the text content
const response = await ragService.streamTextWithRAG(processedResult.messages);
  `,
};
