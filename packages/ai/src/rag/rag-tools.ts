/**
 * RAG-Aware AI SDK v5 Tools
 * Tools that can dynamically retrieve context from vector stores during execution
 */

import { logInfo, logWarn } from "@repo/observability/server/next";
import { tool } from "ai";
import { z } from "zod/v3";
import type { RAGDatabaseBridge } from "./database-bridge";
import { recordRAGOperation } from "./health-monitoring";
import { ragRetry } from "./retry-strategies";

/**
 * Configuration for RAG-aware tools
 */
export interface RAGToolConfig {
  vectorStore: RAGDatabaseBridge;
  defaultTopK?: number;
  defaultThreshold?: number;
  enableContextSummary?: boolean;
  maxContextLength?: number;
  enableSourceTracking?: boolean;
  enableBatchProcessing?: boolean;
}

/**
 * Create a knowledge search tool that retrieves relevant context
 */
export function createKnowledgeSearchTool(config: RAGToolConfig) {
  return tool({
    description:
      "Search the knowledge base for relevant information based on a query",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The search query to find relevant information"),
      topK: z
        .number()
        .optional()
        .default(config.defaultTopK || 5)
        .describe("Number of results to return"),
      threshold: z
        .number()
        .optional()
        .default(config.defaultThreshold || 0.7)
        .describe("Minimum relevance score (0-1)"),
      includeContext: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to include the full context in results"),
    }),
    execute: async ({ query, topK, threshold, includeContext }) => {
      const startTime = Date.now();

      try {
        logInfo("Executing knowledge search tool", {
          operation: "rag_tool_knowledge_search",
          query: query.substring(0, 100),
          topK,
          threshold,
        });

        const results = await ragRetry.vector(
          async () =>
            await config.vectorStore.queryDocuments(query, {
              topK,
              threshold,
              includeContent: includeContext,
            }),
        );

        const responseTime = Date.now() - startTime;
        recordRAGOperation("vector_query", true, responseTime, {
          resultsFound: results.length,
          avgRelevance:
            results.reduce((sum, r) => sum + r.score, 0) / results.length,
        });

        if (results.length === 0) {
          return {
            success: false,
            message: "No relevant information found in the knowledge base",
            query,
            results: [],
            searchTime: responseTime,
          };
        }

        // Format results for tool response
        const formattedResults = results.map((result, index) => ({
          id: result.id,
          relevanceScore: Math.round(result.score * 100) / 100,
          title: result.metadata?.title || `Document ${index + 1}`,
          summary: config.enableContextSummary
            ? result.content?.substring(0, 200) + "..."
            : undefined,
          fullContent: includeContext ? result.content : undefined,
          metadata: result.metadata,
        }));

        return {
          success: true,
          message: `Found ${results.length} relevant documents`,
          query,
          results: formattedResults,
          searchTime: responseTime,
          totalRelevance: results.reduce((sum, r) => sum + r.score, 0),
          averageRelevance:
            results.reduce((sum, r) => sum + r.score, 0) / results.length,
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        recordRAGOperation("vector_query", false, responseTime);

        logWarn("Knowledge search tool failed", {
          operation: "rag_tool_knowledge_search_error",
          error: error instanceof Error ? error.message : String(error),
          query: query.substring(0, 100),
        });

        return {
          success: false,
          message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          query,
          results: [],
          searchTime: responseTime,
        };
      }
    },
  });
}

/**
 * Create a contextual answer tool that retrieves context then generates answers
 */
export function createContextualAnswerTool(config: RAGToolConfig) {
  return tool({
    description:
      "Answer questions using relevant context from the knowledge base",
    inputSchema: z.object({
      question: z.string().describe("The question to answer"),
      topK: z
        .number()
        .optional()
        .default(config.defaultTopK || 3)
        .describe("Number of context sources to use"),
      threshold: z
        .number()
        .optional()
        .default(config.defaultThreshold || 0.8)
        .describe("Minimum relevance score for context"),
      answerStyle: z
        .enum(["detailed", "concise", "bullet_points"])
        .optional()
        .default("detailed")
        .describe("Style of the answer"),
    }),
    execute: async ({ question, topK, threshold, answerStyle }) => {
      const startTime = Date.now();

      try {
        logInfo("Executing contextual answer tool", {
          operation: "rag_tool_contextual_answer",
          question: question.substring(0, 100),
          topK,
          threshold,
          answerStyle,
        });

        // First, search for relevant context
        const contextResults = await ragRetry.vector(
          async () =>
            await config.vectorStore.queryDocuments(question, {
              topK,
              threshold,
              includeContent: true,
            }),
        );

        if (contextResults.length === 0) {
          return {
            success: false,
            answer:
              "I don't have relevant information in my knowledge base to answer this question.",
            question,
            sources: [],
            confidence: 0,
            searchTime: Date.now() - startTime,
          };
        }

        // Format context for answer generation
        const contextText = contextResults
          .map((result, index) => {
            const source =
              result.metadata?.title ||
              result.metadata?.source ||
              `Source ${index + 1}`;
            return `[${source} - Relevance: ${(result.score * 100).toFixed(1)}%]
${result.content}`;
          })
          .join("\n\n---\n");

        // Prepare structured response based on available context
        const sources = contextResults.map((result) => ({
          id: result.id,
          title: result.metadata?.title || "Untitled Document",
          relevanceScore: Math.round(result.score * 100) / 100,
          metadata: result.metadata,
        }));

        const averageRelevance =
          contextResults.reduce((sum, r) => sum + r.score, 0) /
          contextResults.length;
        const responseTime = Date.now() - startTime;

        recordRAGOperation("vector_query", true, responseTime, {
          resultsFound: contextResults.length,
          avgRelevance: averageRelevance,
        });

        // Return structured context that the LLM can use to formulate an answer
        return {
          success: true,
          contextRetrieved: true,
          question,
          relevantContext: contextText,
          sources,
          confidence: averageRelevance,
          answerStyle,
          searchTime: responseTime,
          instruction: `Please answer the following question using ONLY the provided context. Format your answer in ${answerStyle} style.`,
          guidelines: [
            "Only use information from the provided context",
            "If the context doesn't contain enough information, state this clearly",
            "Cite your sources by referencing the source names provided",
            "Be accurate and don't make assumptions beyond the given context",
          ],
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        recordRAGOperation("vector_query", false, responseTime);

        logWarn("Contextual answer tool failed", {
          operation: "rag_tool_contextual_answer_error",
          error: error instanceof Error ? error.message : String(error),
          question: question.substring(0, 100),
        });

        return {
          success: false,
          answer: `Unable to retrieve context: ${error instanceof Error ? error.message : "Unknown error"}`,
          question,
          sources: [],
          confidence: 0,
          searchTime: responseTime,
        };
      }
    },
  });
}

/**
 * Create a document similarity tool that finds related documents
 */
export function createDocumentSimilarityTool(config: RAGToolConfig) {
  return tool({
    description: "Find documents similar to a given document or content",
    inputSchema: z.object({
      content: z.string().describe("The content to find similar documents for"),
      topK: z
        .number()
        .optional()
        .default(config.defaultTopK || 5)
        .describe("Number of similar documents to return"),
      threshold: z
        .number()
        .optional()
        .default(config.defaultThreshold || 0.6)
        .describe("Minimum similarity score"),
      includeContent: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include full document content"),
    }),
    execute: async ({ content, topK, threshold, includeContent }) => {
      const startTime = Date.now();

      try {
        logInfo("Executing document similarity tool", {
          operation: "rag_tool_document_similarity",
          contentLength: content.length,
          topK,
          threshold,
        });

        const results = await ragRetry.vector(
          async () =>
            await config.vectorStore.queryDocuments(content, {
              topK,
              threshold,
              includeContent,
            }),
        );

        const responseTime = Date.now() - startTime;
        recordRAGOperation("vector_query", true, responseTime, {
          resultsFound: results.length,
          avgRelevance:
            results.length > 0
              ? results.reduce((sum, r) => sum + r.score, 0) / results.length
              : 0,
        });

        const similarDocuments = results.map((result, index) => ({
          id: result.id,
          similarityScore: Math.round(result.score * 100) / 100,
          title: result.metadata?.title || `Document ${index + 1}`,
          summary: result.content?.substring(0, 300) + "...",
          fullContent: includeContent ? result.content : undefined,
          metadata: result.metadata,
        }));

        return {
          success: true,
          message: `Found ${results.length} similar documents`,
          inputContentLength: content.length,
          similarDocuments,
          searchTime: responseTime,
          averageSimilarity:
            results.length > 0
              ? results.reduce((sum, r) => sum + r.score, 0) / results.length
              : 0,
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        recordRAGOperation("vector_query", false, responseTime);

        logWarn("Document similarity tool failed", {
          operation: "rag_tool_document_similarity_error",
          error: error instanceof Error ? error.message : String(error),
          contentLength: content.length,
        });

        return {
          success: false,
          message: `Similarity search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          inputContentLength: content.length,
          similarDocuments: [],
          searchTime: responseTime,
        };
      }
    },
  });
}

/**
 * Create a knowledge base statistics tool
 */
export function createKnowledgeStatssTool(config: RAGToolConfig) {
  return tool({
    description: "Get statistics and information about the knowledge base",
    inputSchema: z.object({
      includeNamespaces: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include namespace information"),
      includeHealth: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include health status"),
    }),
    execute: async ({ includeNamespaces, includeHealth }) => {
      const startTime = Date.now();

      try {
        logInfo("Executing knowledge base stats tool", {
          operation: "rag_tool_kb_stats",
          includeNamespaces,
          includeHealth,
        });

        const storeInfo = await config.vectorStore.getStoreInfo();

        let namespaces: string[] = [];
        if (includeNamespaces) {
          try {
            namespaces = await config.vectorStore.listNamespaces();
          } catch (error) {
            logWarn("Failed to get namespaces", { error });
          }
        }

        const responseTime = Date.now() - startTime;

        return {
          success: true,
          storeInfo: {
            vectorCount: storeInfo.vectorCount,
            dimensionCount: storeInfo.dimensionCount,
            similarity: storeInfo.similarity,
            embeddingModel: storeInfo.embeddingModel,
            currentNamespace: storeInfo.namespace,
          },
          namespaces: includeNamespaces ? namespaces : undefined,
          statistics: {
            totalNamespaces: namespaces.length,
            queryTime: responseTime,
            isHealthy: includeHealth,
          },
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;

        logWarn("Knowledge base stats tool failed", {
          operation: "rag_tool_kb_stats_error",
          error: error instanceof Error ? error.message : String(error),
        });

        return {
          success: false,
          message: `Failed to get knowledge base stats: ${error instanceof Error ? error.message : "Unknown error"}`,
          queryTime: responseTime,
        };
      }
    },
  });
}

/**
 * Create a complete set of RAG tools
 */
export function createRAGToolset(config: RAGToolConfig) {
  return {
    knowledgeSearch: createKnowledgeSearchTool(config),
    contextualAnswer: createContextualAnswerTool(config),
    documentSimilarity: createDocumentSimilarityTool(config),
    knowledgeStats: createKnowledgeStatssTool(config),
    // Add missing tools that are expected by examples
    addResource: createAddResourceTool(config),
    getInformation: createGetInformationTool(config),
    batchDocumentProcessor: createBatchDocumentProcessorTool(config),
    multiStepReasoning: createMultiStepReasoningTool(config),
    contextSummarization: createContextSummarizationTool(config),
  };
}

/**
 * Create RAG tools with default configuration
 */
export function createDefaultRAGTools(vectorStore: RAGDatabaseBridge) {
  const config: RAGToolConfig = {
    vectorStore,
    defaultTopK: 5,
    defaultThreshold: 0.7,
    enableContextSummary: true,
    maxContextLength: 4000,
  };

  return createRAGToolset(config);
}

/**
 * Usage examples
 */
export const ragToolExamples = {
  /**
   * Basic tool usage with streamText
   */
  basic: `
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createDefaultRAGTools } from './rag-tools';
import { createRAGDatabaseBridge } from './database-bridge';

const vectorStore = createRAGDatabaseBridge({
  embeddingModel: 'text-embedding-3-small',
  namespace: 'my-docs',
});

const ragTools = createDefaultRAGTools(vectorStore);

const result = streamText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'user', content: 'Search for information about TypeScript generics' }
  ],
  tools: {
    searchKnowledge: ragTools.knowledgeSearch,
    getAnswer: ragTools.contextualAnswer,
  },
});
  `,

  /**
   * Advanced tool usage with custom configuration
   */
  advanced: `
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const customTools = createRAGToolset({
  vectorStore,
  defaultTopK: 7,
  defaultThreshold: 0.85,
  enableContextSummary: true,
  maxContextLength: 6000,
});

const result = await generateText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: 'Find documents similar to this React component and explain the patterns used'
    }
  ],
  tools: {
    search: customTools.knowledgeSearch,
    findSimilar: customTools.documentSimilarity,
    getStats: customTools.knowledgeStats,
  },
  maxSteps: 3,
});
  `,

  /**
   * Using tools in a conversation flow
   */
  conversation: `
// The tools can be used in multi-turn conversations
const conversation = [
  { role: 'user', content: 'What do you know about React hooks?' },
  // Tool will search for React hooks information
  { role: 'assistant', content: 'Let me search for information about React hooks...' },
  // Tool response with context
  { role: 'tool', content: '{"success": true, "results": [...]}' },
  // AI uses the context to provide informed answer
  { role: 'assistant', content: 'Based on the documentation, React hooks are...' },
  { role: 'user', content: 'Can you find similar patterns in other frameworks?' },
  // Tool searches for similar patterns
];
  `,
};

/**
 * Create addResource tool based on AI SDK v5 patterns
 */
function createAddResourceTool(config: RAGToolConfig) {
  return tool({
    description:
      "Add a resource to your knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.",
    inputSchema: z.object({
      content: z
        .string()
        .describe("The content or resource to add to the knowledge base"),
    }),
    execute: async ({ content }) => {
      // Store in vector database
      const resourceId = `resource_${Date.now()}`;
      await config.vectorStore.addDocuments([
        {
          id: resourceId,
          content,
          metadata: { addedAt: new Date().toISOString() },
        },
      ]);
      return `Resource successfully created and embedded.`;
    },
  });
}

/**
 * Create getInformation tool based on AI SDK v5 patterns
 */
function createGetInformationTool(config: RAGToolConfig) {
  return tool({
    description:
      "Get information from your knowledge base to answer questions.",
    inputSchema: z.object({
      question: z.string().describe("The users question"),
    }),
    execute: async ({ question }) => {
      const results = await config.vectorStore.queryDocuments(question, {
        topK: config.defaultTopK || 4,
        threshold: config.defaultThreshold || 0.5,
      });
      return results;
    },
  });
}

/**
 * Create batch document processor tool
 */
function createBatchDocumentProcessorTool(config: RAGToolConfig) {
  return tool({
    description:
      "Process multiple documents in batch for embedding and storage.",
    inputSchema: z.object({
      documents: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          metadata: z.record(z.string(), z.any()).optional(),
        }),
      ),
    }),
    execute: async ({ documents }) => {
      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const doc of documents) {
        try {
          await config.vectorStore.addDocuments([doc]);
          processed++;
        } catch (error) {
          failed++;
          errors.push(`Failed to process ${doc.id}: ${error}`);
        }
      }

      return {
        processed,
        failed,
        errors,
        total: documents.length,
      };
    },
  });
}

/**
 * Create multi-step reasoning tool
 */
function createMultiStepReasoningTool(config: RAGToolConfig) {
  return tool({
    description: "Perform multi-step reasoning over the knowledge base.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The complex query requiring multi-step reasoning"),
      steps: z.number().default(3).describe("Number of reasoning steps"),
    }),
    execute: async ({ query, steps }) => {
      const results = [];
      let currentQuery = query;

      for (let i = 0; i < steps; i++) {
        const stepResults = await config.vectorStore.queryDocuments(
          currentQuery,
          {
            topK: config.defaultTopK || 3,
            threshold: config.defaultThreshold || 0.5,
          },
        );
        results.push({
          step: i + 1,
          query: currentQuery,
          results: stepResults,
        });
        // Update query for next step based on results
        if (stepResults.length > 0) {
          currentQuery = `Based on: ${stepResults[0].content}. Follow up: ${query}`;
        }
      }

      return {
        originalQuery: query,
        steps: results,
        totalSteps: steps,
      };
    },
  });
}

/**
 * Create context summarization tool
 */
function createContextSummarizationTool(config: RAGToolConfig) {
  return tool({
    description:
      "Summarize and contextualize information from the knowledge base.",
    inputSchema: z.object({
      query: z.string().describe("The query to find and summarize context for"),
      maxLength: z.number().default(500).describe("Maximum length of summary"),
    }),
    execute: async ({ query, maxLength }) => {
      const results = await config.vectorStore.queryDocuments(query, {
        topK: config.defaultTopK || 5,
        threshold: config.defaultThreshold || 0.4,
      });

      if (results.length === 0) {
        return {
          query,
          summary: "No relevant context found.",
          sources: 0,
        };
      }

      // Combine and truncate content
      const combinedContent = results.map((r: any) => r.content).join(" ");
      const summary =
        combinedContent.length > maxLength
          ? combinedContent.substring(0, maxLength) + "..."
          : combinedContent;

      return {
        query,
        summary,
        sources: results.length,
        relevanceScores: results.map((r: any) => r.score || 0),
      };
    },
  });
}
