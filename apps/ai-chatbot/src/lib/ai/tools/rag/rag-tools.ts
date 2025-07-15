/**
 * Enhanced RAG Tools for AI Chatbot
 *
 * Feature flag driven RAG functionality with comprehensive AI SDK v5 integration
 * Supports hybrid search, advanced tools, conversation memory, and production configs
 */

import { getRagMode, type FeatureFlagContext } from '#/lib/feature-flags';
import { env } from '#/root/env';
import type { HybridSearchResult } from '@repo/ai/server/rag/hybrid-search';
import { logError, logInfo } from '@repo/observability';
import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod/v4';
import { createAdvancedToolsSuite, type AdvancedToolsConfig } from '../advanced-tools';
import { createComprehensiveRAGClient, type ComprehensiveRAGConfig } from '../rag-client';

// Legacy compatibility function
export function isRAGEnabled(): boolean {
  return getRagMode() !== 'disabled';
}

// Enhanced RAG modes
export type RAGCapabilityLevel = 'basic' | 'enhanced' | 'comprehensive';

export function getRAGCapabilityLevel(): RAGCapabilityLevel {
  const ragMode = getRagMode();
  if (ragMode === 'disabled') return 'basic';
  if (ragMode === 'mock') return 'basic';

  // Check if enhanced features are available
  const hasEnhancedConfig = !!(env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN);
  return hasEnhancedConfig ? 'comprehensive' : 'enhanced';
}

// Create RAG tools based on feature flag configuration
export function createChatbotRAGTools({
  session,
  context = {},
}: {
  session: Session;
  context?: FeatureFlagContext;
}) {
  const ragMode = getRagMode(context);

  logInfo('Creating RAG tools', {
    operation: 'rag_tools_creation',
    metadata: {
      ragMode,
      userId: session.user.id,
      hasVectorConfig: !!(env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN),
    },
  });

  switch (ragMode) {
    case 'disabled':
      return {};
    case 'mock':
      return createMockRAGTools({ session });
    case 'enabled':
      return createProductionRAGTools({ session, context });
    default:
      logError('Unknown RAG mode, falling back to empty tools', { ragMode });
      return {};
  }
}

// Create mock RAG tools (current implementation)
function createMockRAGTools({ session }: { session: Session }) {
  return {
    addResource: tool({
      description: `add a resource to your knowledge base.
        If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      parameters: z.object({
        content: z.string().describe('the content or resource to add to the knowledge base'),
        metadata: z
          .object({
            title: z.string().optional().describe('Optional title for the resource'),
            source: z.string().optional().describe('Optional source information'),
            category: z.string().optional().describe('Optional category classification'),
          })
          .optional()
          .describe('Optional metadata for the content'),
      }),
      execute: async ({ content: _content, metadata }) => {
        try {
          // Simple implementation - in a real app this would store in vector DB
          return {
            success: true,
            message: `Added resource: ${metadata?.title || 'Untitled'}`,
            resourceId: `resource_${Date.now()}`,
          };
        } catch (error) {
          logError('Failed to add resource', error);
          return {
            success: false,
            error: 'Failed to add resource to knowledge base',
          };
        }
      },
    }),

    getInformation: tool({
      description: 'get information from your knowledge base to answer questions.',
      parameters: z.object({
        question: z.string().describe('the users question'),
        topK: z.number().min(1).max(20).default(5).describe('number of results to return'),
      }),
      execute: async ({ question, topK: _topK = 5 }) => {
        try {
          // Simple implementation - in a real app this would query vector DB
          return [
            {
              content: `Mock search result for: ${question}`,
              score: 0.95,
              metadata: {
                title: 'Sample Knowledge',
                source: 'user_added',
                addedAt: new Date().toISOString(),
              },
            },
          ];
        } catch (error) {
          logError('Failed to search knowledge base', error);
          return [];
        }
      },
    }),

    getRecentResources: tool({
      description: 'get recently added resources from your knowledge base',
      parameters: z.object({
        limit: z
          .number()
          .min(1)
          .max(50)
          .default(10)
          .describe('number of recent resources to return'),
      }),
      execute: async ({ limit = 10 }) => {
        const _limit = limit; // Use the limit parameter
        try {
          // Simple implementation - in a real app this would query database
          return {
            success: true,
            resources: [
              {
                id: 'resource_example',
                title: 'Recent Resource',
                content: 'Example recent content',
                addedAt: new Date().toISOString(),
                userId: session.user.id,
              },
            ],
            total: 1,
          };
        } catch (error) {
          logError('Failed to get recent resources', error);
          return {
            success: false,
            error: 'Failed to retrieve recent resources',
          };
        }
      },
    }),
  };
}

// Create comprehensive production RAG tools with AI SDK v5 features
function createProductionRAGTools({
  session,
  context,
}: {
  session: Session;
  context?: FeatureFlagContext;
}) {
  try {
    logInfo('Creating comprehensive RAG tools', {
      operation: 'comprehensive_rag_creation',
      userId: session.user.id,
      capabilityLevel: getRAGCapabilityLevel(),
    });

    // Enhanced configuration based on context
    const ragConfig: ComprehensiveRAGConfig = {
      vectorUrl: env.UPSTASH_VECTOR_REST_URL || '',
      vectorToken: env.UPSTASH_VECTOR_REST_TOKEN || '',
      namespace: `user_${session.user.id}`,
      enableSourceTracking: true,
      enableBatchProcessing: true,
      enableConversationMemory: true,
      productionPreset: context?.environment === 'development' ? 'development' : 'production',
      maxContextLength: 4000,
      memoryRetentionDays: 30,
    };

    // Create comprehensive RAG client (async initialization handled in tool execution)
    const createRAGClient = () => createComprehensiveRAGClient(ragConfig);

    const comprehensiveTools = {
      // Enhanced resource management
      addResource: tool({
        description: `Add a resource to your knowledge base with enhanced metadata processing.
          Supports automatic categorization and relationship detection.`,
        parameters: z.object({
          content: z.string().describe('the content or resource to add to the knowledge base'),
          metadata: z
            .object({
              title: z.string().optional().describe('Optional title for the resource'),
              source: z.string().optional().describe('Optional source information'),
              category: z.string().optional().describe('Optional category classification'),
              tags: z
                .array(z.string())
                .optional()
                .describe('Optional tags for better organization'),
              priority: z
                .enum(['low', 'medium', 'high'])
                .optional()
                .describe('Content priority level'),
            })
            .optional()
            .describe('Enhanced metadata for the content'),
        }),
        execute: async ({ content, metadata }) => {
          try {
            const ragClient = await createRAGClient();
            const result = await ragClient.addDocument(content, {
              ...metadata,
              userId: session.user.id,
              addedAt: new Date().toISOString(),
            });

            return {
              success: true,
              message: `Enhanced resource added: ${metadata?.title || 'Untitled'}`,
              resourceId: result.id,
              metadata: {
                hasSourceTracking: true,
                processingTime: Date.now(),
              },
            };
          } catch (error) {
            logError('Failed to add enhanced resource', error);
            return {
              success: false,
              error: 'Failed to add resource to knowledge base',
            };
          }
        },
      }),

      // Hybrid search capability
      hybridSearch: tool({
        description:
          'Perform hybrid search combining vector similarity and keyword matching for better results.',
        parameters: z.object({
          question: z.string().describe('the search query or question'),
          topK: z.number().min(1).max(50).default(10).describe('number of results to return'),
          searchMode: z
            .enum(['balanced', 'semantic', 'precise', 'comprehensive'])
            .default('balanced')
            .describe('search strategy'),
          boostFields: z
            .array(z.string())
            .optional()
            .describe('fields to boost in search (title, tags, etc.)'),
          filters: z.record(z.any()).optional().describe('metadata filters to apply'),
        }),
        execute: async ({ question, topK = 10, searchMode = 'balanced', boostFields, filters }) => {
          try {
            const ragClient = await createRAGClient();
            const results = await ragClient.hybridQuery(question, {
              topK,
              boostFields,
              filters,
            });

            return results.map((result: HybridSearchResult) => ({
              content: result.content,
              vectorScore: result.vectorScore,
              keywordScore: result.keywordScore,
              hybridScore: result.hybridScore,
              keywordMatches: result.keywordMatches,
              rank: result.rank,
              rankingMethod: result.rankingMethod,
              metadata: result.metadata,
            }));
          } catch (error) {
            logError('Hybrid search failed', error);
            return [];
          }
        },
      }),

      // Enhanced information retrieval
      getInformation: tool({
        description:
          'Get enhanced information from your knowledge base with advanced context processing.',
        parameters: z.object({
          question: z.string().describe('the users question'),
          topK: z.number().min(1).max(20).default(5).describe('number of results to return'),
          threshold: z.number().min(0).max(1).default(0.7).describe('relevance threshold'),
          includeMetadata: z.boolean().default(true).describe('include source metadata'),
          contextWindow: z.number().optional().describe('limit context length per result'),
        }),
        execute: async ({
          question,
          topK = 5,
          threshold = 0.7,
          includeMetadata = true,
          contextWindow,
        }) => {
          try {
            const ragClient = await createRAGClient();
            const results = await ragClient.enhancedSearch(question, {
              topK,
              threshold,
              includeMetadata,
              contextWindow,
            });

            return results;
          } catch (error) {
            logError('Enhanced information retrieval failed', error);
            return [];
          }
        },
      }),

      // Multi-step reasoning
      multiStepAnalysis: tool({
        description: 'Perform multi-step reasoning and analysis across your knowledge base.',
        parameters: z.object({
          mainQuestion: z.string().describe('the main question or analysis topic'),
          subQueries: z.array(z.string()).describe('related sub-questions to explore'),
          synthesizeResults: z
            .boolean()
            .default(true)
            .describe('combine results into unified insights'),
          maxContextPerQuery: z
            .number()
            .min(1)
            .max(10)
            .default(3)
            .describe('max context items per sub-query'),
        }),
        execute: async ({
          mainQuestion,
          subQueries,
          synthesizeResults = true,
          maxContextPerQuery = 3,
        }) => {
          try {
            const ragClient = await createRAGClient();
            const result = await ragClient.multiStepReasoning(mainQuestion, subQueries, {
              synthesizeResults,
              maxContextPerQuery,
            });

            return result;
          } catch (error) {
            logError('Multi-step analysis failed', error);
            return {
              mainQuestion,
              queriesProcessed: 0,
              contextItemsFound: 0,
              error: 'Analysis failed',
            };
          }
        },
      }),

      // Context summarization
      contextSummary: tool({
        description:
          'Generate comprehensive summaries of knowledge base content on specific topics.',
        parameters: z.object({
          topic: z.string().describe('the topic to summarize'),
          focusAreas: z.array(z.string()).optional().describe('specific areas to focus on'),
          maxSources: z.number().min(1).max(50).default(15).describe('maximum sources to include'),
          includeSourceList: z.boolean().default(true).describe('include list of sources used'),
        }),
        execute: async ({ topic, focusAreas = [], maxSources = 15, includeSourceList = true }) => {
          try {
            const ragClient = await createRAGClient();
            const result = await ragClient.contextSummarization(topic, {
              focusAreas,
              maxSources,
              includeSourceList,
            });

            return result;
          } catch (error) {
            logError('Context summarization failed', error);
            return {
              topic,
              focusAreas,
              contentSummary: [],
              sources: [],
              totalContentItems: 0,
              averageRelevance: 0,
              error: 'Summarization failed',
            };
          }
        },
      }),

      // Batch document processing
      batchProcess: tool({
        description: 'Process multiple documents in batches for efficient knowledge base updates.',
        parameters: z.object({
          documents: z
            .array(
              z.object({
                content: z.string(),
                title: z.string().optional(),
                metadata: z.record(z.any()).optional(),
              }),
            )
            .describe('documents to process'),
          chunkSize: z.number().min(1).max(20).default(5).describe('processing batch size'),
          generateEmbeddings: z
            .boolean()
            .default(true)
            .describe('generate embeddings for documents'),
        }),
        execute: async ({ documents, chunkSize = 5, generateEmbeddings = true }) => {
          try {
            const ragClient = await createRAGClient();
            const result = await ragClient.batchAddDocuments(documents, {
              chunkSize,
              generateEmbeddings,
            });

            return result;
          } catch (error) {
            logError('Batch processing failed', error);
            return {
              processed: 0,
              failed: documents.length,
              errors: ['Batch processing failed'],
              embeddings: [],
            };
          }
        },
      }),

      // Conversation memory management
      conversationMemory: tool({
        description: 'Manage conversation memory and context for better continuity.',
        parameters: z.object({
          action: z.enum(['add', 'get', 'search']).describe('memory operation'),
          conversationId: z.string().describe('conversation identifier'),
          messages: z.array(z.any()).optional().describe('messages to add to memory'),
          context: z.record(z.any()).optional().describe('additional context'),
          searchQuery: z.string().optional().describe('query to search memory'),
        }),
        execute: async ({ action, conversationId, messages, context, searchQuery }) => {
          try {
            const ragClient = await createRAGClient();

            switch (action) {
              case 'add':
                if (!messages) throw new Error('Messages required for add operation');
                return await ragClient.addConversationContext(conversationId, messages, context);

              case 'get':
                return await ragClient.getConversationMemory(conversationId);

              case 'search':
                if (!searchQuery) throw new Error('Search query required for search operation');
                // Use enhanced search within conversation context
                return await ragClient.enhancedSearch(searchQuery, { topK: 10 });

              default:
                throw new Error(`Unknown memory action: ${action}`);
            }
          } catch (error) {
            logError('Conversation memory operation failed', error);
            return {
              success: false,
              error: 'Memory operation failed',
            };
          }
        },
      }),

      // System analytics and stats
      getAnalytics: tool({
        description: 'Get comprehensive analytics and statistics about your knowledge base.',
        parameters: z.object({
          includePerformanceMetrics: z
            .boolean()
            .default(true)
            .describe('include performance metrics'),
          timeRange: z
            .enum(['hour', 'day', 'week', 'month'])
            .default('day')
            .describe('analytics time range'),
        }),
        execute: async ({ includePerformanceMetrics = true, timeRange = 'day' }) => {
          try {
            const ragClient = await createRAGClient();
            const stats = await ragClient.getStats();

            return {
              ...stats,
              timeRange,
              analyticsEnabled: includePerformanceMetrics,
              generatedAt: new Date().toISOString(),
              userId: session.user.id,
            };
          } catch (error) {
            logError('Analytics retrieval failed', error);
            return {
              error: 'Analytics not available',
              timeRange,
              generatedAt: new Date().toISOString(),
            };
          }
        },
      }),
    };

    // Add advanced tools suite
    const advancedToolsConfig: AdvancedToolsConfig = {
      userId: session.user.id,
      session,
      ragConfig,
      enableAdvancedAnalysis: true,
      enableWorkflows: true,
      enableCollaboration: true,
    };

    const advancedTools = createAdvancedToolsSuite(advancedToolsConfig);

    // Combine all tools
    return {
      ...comprehensiveTools,
      ...advancedTools,
    };
  } catch (error) {
    logError('Failed to create comprehensive RAG tools, falling back to basic', {
      error,
      userId: session.user.id,
    });

    // Fallback to mock tools if comprehensive RAG fails
    return {
      ...createMockRAGTools({ session }),
      _isComprehensiveFallback: true,
      _error: error instanceof Error ? error.message : String(error),
    };
  }
}
