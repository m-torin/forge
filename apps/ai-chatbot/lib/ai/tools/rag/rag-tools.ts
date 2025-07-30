/**
 * RAG Tools for AI Chatbot
 *
 * Feature flag driven RAG functionality supporting disabled, mock, and production modes
 */

import { env } from '#/root/env';
import { getRagMode, type FeatureFlagContext } from '@/lib/feature-flags';
import { logError, logInfo } from '@repo/observability';
import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';

// Legacy compatibility function
export function isRAGEnabled(): boolean {
  return getRagMode() !== 'disabled';
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
      return createProductionRAGTools({ session, _context: context });
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

// Create production RAG tools using @repo/ai
function createProductionRAGTools({
  session,
  _context,
}: {
  session: Session;
  _context?: FeatureFlagContext;
}) {
  try {
    // Use dynamic import to avoid build issues if @repo/ai is not available
    const createAISDKRagFromEnv = require('@repo/ai/server/rag').createAISDKRagFromEnv;

    if (!createAISDKRagFromEnv) {
      throw new Error('@repo/ai RAG not available');
    }

    const ragInstance = createAISDKRagFromEnv({
      namespace: `user_${session.user.id}`,
      useUpstashEmbedding: false, // Use OpenAI embeddings by default
    });

    if (!ragInstance) {
      throw new Error('Failed to create RAG instance - check Upstash configuration');
    }

    logInfo('Created production RAG tools', {
      operation: 'production_rag_created',
      metadata: {
        userId: session.user.id,
        namespace: `user_${session.user.id}`,
      },
    });

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
        execute: async ({ content, metadata }) => {
          try {
            const result = await ragInstance.addContent(content, metadata);
            return {
              success: true,
              message: `Added resource: ${metadata?.title || 'Untitled'}`,
              resourceId: result,
            };
          } catch (error) {
            logError('Failed to add resource to production RAG', error);
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
        execute: async ({ question, topK = 5 }) => {
          try {
            const results = await ragInstance.search(question, topK);
            return results.map((result: any) => ({
              content: result.content,
              score: result.score,
              metadata: result.metadata,
            }));
          } catch (error) {
            logError('Failed to search production RAG', error);
            return [];
          }
        },
      }),

      queryWithContext: tool({
        description:
          'ask a question and get an AI-generated answer based on your knowledge base using production RAG',
        parameters: z.object({
          question: z.string().describe('the question to ask'),
          provider: z
            .enum(['openai', 'anthropic'])
            .optional()
            .default('openai')
            .describe('AI provider to use'),
        }),
        execute: async ({ question, provider = 'openai' }) => {
          try {
            const answer = await ragInstance.query(question, {
              provider,
              model: provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022',
            });
            return {
              success: true,
              answer,
              provider,
            };
          } catch (error) {
            logError('Failed to query production RAG with context', error);
            return {
              success: false,
              error: 'Failed to generate contextual answer',
            };
          }
        },
      }),
    };
  } catch (error) {
    logError('Failed to create production RAG tools, falling back to mock', {
      error,
      userId: session.user.id,
    });

    // Fallback to mock tools if production RAG fails
    return {
      ...createMockRAGTools({ session }),
      _isProductionFallback: true,
    };
  }
}
