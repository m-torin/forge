/**
 * AI SDK v5 Streaming RAG Tests
 * Tests streaming Retrieval-Augmented Generation patterns with proper usage tracking
 */

import { embed, embedMany, streamText } from "ai";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  createEmbeddingModel,
  createMultiStepToolModel,
  createStreamingTextModel,
  createStreamingToolModel,
} from "../../test-utils/models";
import {
  assertTextStream,
  assertUIMessageStreamWithSources,
  collectFullStreamChunks,
  waitForStreamCompletion,
} from "../../test-utils/streams";
import { createTelemetryConfig } from "../../test-utils/telemetry";

describe("streaming RAG", () => {
  describe("basic RAG Streaming", () => {
    test("should stream RAG responses with retrieved context", async () => {
      const embeddingModel = createEmbeddingModel(1536);
      const streamingModel = createStreamingTextModel([
        "Based on the retrieved context: ",
        "The AI SDK provides powerful tools for building AI applications. ",
        "This enables real-time streaming of responses.",
      ]);

      // Step 1: Generate query embedding
      const queryEmbedding = await embed({
        model: embeddingModel,
        value: "How to use AI SDK for streaming?",
      });

      expect(queryEmbedding.embedding).toHaveLength(1536);

      // Step 2: Retrieve similar documents (mock)
      const retrievedDocs = await mockVectorDB.query({
        vector: queryEmbedding.embedding,
        topK: 2,
        threshold: 0.8,
      });

      // Step 3: Stream response with context
      const context = retrievedDocs.map((doc: any) => doc.content).join("\n\n");
      const result = streamText({
        model: streamingModel,
        prompt: `Context: ${context}\n\nQuestion: How to use AI SDK for streaming?`,
      });

      await assertTextStream(result, [
        "Based on the retrieved context: ",
        "The AI SDK provides powerful tools for building AI applications. ",
        "This enables real-time streaming of responses.",
      ]);

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("AI SDK provides powerful tools");
      expect(completion.usage.totalTokens).toBeGreaterThan(0);
    });

    test("should handle RAG with source citations in streaming", async () => {
      const streamingModel = createStreamingToolModel(
        ["Based on retrieved sources: "],
        [
          {
            toolCallId: "cite-1",
            toolName: "addCitation",
            input: {
              sourceId: "doc-1",
              title: "AI SDK Guide",
              relevantText: "AI SDK provides powerful tools",
            },
          },
        ],
      );

      const result = streamText({
        model: streamingModel,
        prompt: "Answer with citations",
        tools: {
          addCitation: {
            description: "Add a citation to the response",
            inputSchema: z.object({
              sourceId: z.string(),
              title: z.string(),
              relevantText: z.string(),
              pageNumber: z.number().optional(),
            }),
            execute: async ({ sourceId, title, relevantText, pageNumber }) => {
              return {
                citation: {
                  id: sourceId,
                  title,
                  excerpt: relevantText,
                  page: pageNumber,
                  type: "document",
                },
                formatted: `[${title}](${sourceId})`,
              };
            },
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].toolName).toBe("addCitation");
      expect(toolCallChunks[0].input.sourceId).toBe("doc-1");
      expect(toolCallChunks[0].input.title).toBe("AI SDK Guide");

      // Test UI stream with sources
      await assertUIMessageStreamWithSources(result, 1);
    });

    test("should track usage across RAG pipeline steps", async () => {
      const embeddingModel = createEmbeddingModel(768);
      const streamingModel = createStreamingTextModel([
        "RAG response with tracking",
      ]);
      const telemetryConfig = createTelemetryConfig({
        metadata: { pipeline: "rag", step: "generation" },
      });

      // Step 1: Embedding - track usage
      const queryEmbedding = await embed({
        model: embeddingModel,
        value: "Test query for usage tracking",
        experimental_telemetry: telemetryConfig,
      });

      const embeddingUsage = queryEmbedding.usage;
      expect(embeddingUsage.inputTokens).toBeGreaterThan(0);

      // Step 2: Retrieval (mock with usage)
      const retrievalUsage = { searchTime: 50, documentsScanned: 1000 };

      // Step 3: Generation - track usage
      const result = streamText({
        model: streamingModel,
        prompt: "Generate with context",
        experimental_telemetry: {
          ...telemetryConfig,
          metadata: { ...telemetryConfig.metadata, step: "generation" },
        },
      });

      const completion = await waitForStreamCompletion(result);
      const generationUsage = completion.usage;

      // Aggregate pipeline usage
      const totalUsage = {
        embedding: embeddingUsage,
        retrieval: retrievalUsage,
        generation: generationUsage,
        total: {
          inputTokens: embeddingUsage.inputTokens + generationUsage.inputTokens,
          outputTokens: generationUsage.outputTokens,
          totalTokens: embeddingUsage.inputTokens + generationUsage.totalTokens,
        },
      };

      expect(totalUsage.total.totalTokens).toBeGreaterThan(
        generationUsage.totalTokens,
      );
      expect(totalUsage.embedding.inputTokens).toBeGreaterThan(0);
      expect(totalUsage.generation.outputTokens).toBeGreaterThan(0);
    });
  });

  describe("multi-Document RAG Streaming", () => {
    test("should handle multiple document retrieval and streaming", async () => {
      const embeddingModel = createEmbeddingModel();
      const streamingModel = createStreamingTextModel([
        "Analyzing multiple sources... ",
        "Source 1 discusses AI SDK tools. ",
        "Source 2 covers streaming patterns. ",
        "Combined insight: Use streaming for real-time AI responses.",
      ]);

      // Generate embeddings for multiple queries
      const queries = [
        "AI SDK tools",
        "streaming patterns",
        "real-time responses",
      ];

      const embeddings = await embedMany({
        model: embeddingModel,
        values: queries,
      });

      expect(embeddings.embeddings).toHaveLength(3);
      expect(embeddings.usage.inputTokens).toBeGreaterThan(0);

      // Mock multi-document retrieval
      const allRetrievedDocs = await Promise.all(
        embeddings.embeddings.map((embedding, index) =>
          mockVectorDB.query({
            vector: embedding,
            topK: 2,
            metadata: { query: queries[index] },
          }),
        ),
      );

      // Stream comprehensive response
      const allContext = allRetrievedDocs
        .flat()
        .map((doc: any) => `${doc.metadata.title}: ${doc.content}`)
        .join("\n\n");

      const result = streamText({
        model: streamingModel,
        prompt: `Multiple sources:\n${allContext}\n\nProvide a comprehensive answer.`,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("AI SDK tools");
      expect(completion.text).toContain("streaming patterns");
      expect(completion.text).toContain("real-time");
    });

    test("should handle document chunking and streaming", async () => {
      const largeDocument =
        "This is a very long document that needs to be chunked. ".repeat(100);
      const chunkSize = 200;
      const chunks = [];

      // Chunk the document
      for (let i = 0; i < largeDocument.length; i += chunkSize) {
        chunks.push({
          id: `chunk-${chunks.length}`,
          content: largeDocument.slice(i, i + chunkSize),
          metadata: {
            chunkIndex: chunks.length,
            totalLength: largeDocument.length,
            startOffset: i,
          },
        });
      }

      expect(chunks.length).toBeGreaterThan(10);

      // Process chunks with embeddings
      const embeddingModel = createEmbeddingModel(384);
      const chunkContents = chunks.map((chunk) => chunk.content);

      const chunkEmbeddings = await embedMany({
        model: embeddingModel,
        values: chunkContents.slice(0, 5), // Process first 5 chunks
      });

      expect(chunkEmbeddings.embeddings).toHaveLength(5);
      expect(chunkEmbeddings.usage.inputTokens).toBeGreaterThan(0);

      // Stream response using relevant chunks
      const streamingModel = createStreamingTextModel([
        "Processing document chunks... ",
        "Found relevant information across multiple sections. ",
        "Summary: The document contains repeated content about chunking.",
      ]);

      const result = streamText({
        model: streamingModel,
        prompt: "Summarize the chunked document",
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("chunks");
      expect(completion.text).toContain("document");
    });
  });

  describe("hybrid RAG Streaming", () => {
    test("should combine dense and sparse retrieval in streaming", async () => {
      // Dense retrieval (embedding similarity)
      const denseModel = createEmbeddingModel(1024);
      const denseQuery = await embed({
        model: denseModel,
        value: "machine learning algorithms",
      });

      const denseResults = await mockVectorDB.query({
        vector: denseQuery.embedding,
        topK: 3,
        type: "dense",
      });

      // Sparse retrieval (keyword matching - mock)
      const sparseResults = [
        {
          id: "sparse-1",
          score: 0.92,
          metadata: {
            title: "ML Algorithms",
            source: "textbook",
            keywords: ["machine", "learning"],
          },
          content:
            "Machine learning algorithms include supervised and unsupervised methods.",
        },
        {
          id: "sparse-2",
          score: 0.87,
          metadata: {
            title: "Deep Learning",
            source: "research",
            keywords: ["neural", "networks"],
          },
          content:
            "Deep learning uses neural networks for complex pattern recognition.",
        },
      ];

      // Combine and deduplicate results
      const combinedResults = [...denseResults, ...sparseResults]
        .reduce((acc: any[], doc: any) => {
          if (!acc.find((existing) => existing.id === doc.id)) {
            acc.push(doc);
          }
          return acc;
        }, [])
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      expect(combinedResults.length).toBeLessThanOrEqual(5);

      // Stream hybrid RAG response
      const streamingModel = createStreamingTextModel([
        "Combining dense and sparse retrieval: ",
        "Dense retrieval found semantic matches. ",
        "Sparse retrieval identified keyword matches. ",
        "Hybrid approach provides comprehensive coverage.",
      ]);

      const hybridContext = combinedResults
        .map((doc: any) => `[${doc.metadata.source}] ${doc.content}`)
        .join("\n\n");

      const result = streamText({
        model: streamingModel,
        prompt: `Hybrid context:\n${hybridContext}\n\nExplain machine learning algorithms.`,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("dense");
      expect(completion.text).toContain("sparse");
      expect(completion.text).toContain("hybrid");
    });
  });

  describe("conversational RAG Streaming", () => {
    test("should maintain conversation context in streaming RAG", async () => {
      const conversationHistory = [
        { role: "user", content: "What is the AI SDK?" },
        {
          role: "assistant",
          content: "The AI SDK is a toolkit for building AI applications.",
        },
        { role: "user", content: "How does streaming work?" },
      ];

      // Create contextual query from conversation
      const contextualQuery = conversationHistory
        .map((msg) => msg.content)
        .join(" ");

      const embeddingModel = createEmbeddingModel();
      const queryEmbedding = await embed({
        model: embeddingModel,
        value: contextualQuery,
      });

      // Retrieve contextual documents
      const contextualDocs = await mockVectorDB.query({
        vector: queryEmbedding.embedding,
        topK: 3,
        metadata: { conversational: true },
      });

      // Stream conversational response
      const streamingModel = createStreamingTextModel([
        "Based on our conversation and retrieved context: ",
        "Streaming in the AI SDK works by processing responses in real-time chunks. ",
        "This builds on what I mentioned about the AI SDK toolkit.",
      ]);

      const conversationContext = [
        ...conversationHistory.slice(-2), // Last 2 messages
        {
          role: "system",
          content: `Retrieved context: ${contextualDocs.map((doc: any) => doc.content).join(" ")}`,
        },
      ];

      const result = streamText({
        model: streamingModel,
        messages: conversationContext,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("streaming");
      expect(completion.text).toContain("AI SDK");
      expect(completion.text).toContain("conversation");
    });

    test("should handle follow-up questions in streaming RAG", async () => {
      const toolCalls = [
        {
          toolCallId: "search-1",
          toolName: "searchDocs",
          input: {
            query: "AI SDK streaming follow-up",
            contextFromPrevious: true,
          },
        },
      ];

      const streamingModel = createMultiStepToolModel(
        [
          "Let me search for more specific information... ",
          "Found additional details about streaming implementation.",
        ],
        toolCalls,
        1,
      );

      const result = streamText({
        model: streamingModel,
        prompt:
          "Can you provide more details about the streaming implementation?",
        tools: {
          searchDocs: {
            description: "Search documentation with conversation context",
            inputSchema: z.object({
              query: z.string(),
              contextFromPrevious: z.boolean().optional(),
              maxResults: z.number().optional().default(3),
            }),
            execute: async ({ query, contextFromPrevious, maxResults }) => {
              // Mock contextual search
              const searchResults = await mockVectorDB.query({
                query,
                topK: maxResults,
                includeContext: contextFromPrevious,
              });

              return {
                results: searchResults,
                query,
                foundResults: searchResults.length,
                contextual: contextFromPrevious,
              };
            },
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input.contextFromPrevious).toBeTruthy();
    });
  });

  describe("real-time RAG Streaming", () => {
    test("should handle real-time document updates during streaming", async () => {
      const embeddingModel = createEmbeddingModel();
      const streamingModel = createStreamingTextModel([
        "Checking for latest information... ",
        "Found recent updates to the documentation. ",
        "Incorporating real-time changes into response.",
      ]);

      // Simulate real-time document updates
      const realtimeUpdates = [
        {
          id: "update-1",
          timestamp: new Date().toISOString(),
          type: "document_updated",
          content: "AI SDK v5.0 now includes improved streaming capabilities.",
        },
        {
          id: "update-2",
          timestamp: new Date(Date.now() - 1000).toISOString(),
          type: "new_document",
          content: "New streaming best practices guide available.",
        },
      ];

      // Process updates and generate embeddings
      const updateContents = realtimeUpdates.map((update) => update.content);
      const updateEmbeddings = await embedMany({
        model: embeddingModel,
        values: updateContents,
      });

      expect(updateEmbeddings.embeddings).toHaveLength(2);

      // Stream response with real-time context
      const result = streamText({
        model: streamingModel,
        prompt: `Real-time context: ${updateContents.join(" ")}\n\nWhat's new with AI SDK streaming?`,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("real-time");
      expect(completion.text).toContain("updates");
      expect(completion.text).toContain("AI SDK");
    });

    test("should handle streaming with concurrent retrievals", async () => {
      const embeddingModel = createEmbeddingModel();

      // Simulate concurrent queries
      const concurrentQueries = [
        "AI SDK performance",
        "streaming optimization",
        "real-time processing",
      ];

      // Process queries concurrently
      const embeddingPromises = concurrentQueries.map((query) =>
        embed({ model: embeddingModel, value: query }),
      );

      const embeddings = await Promise.all(embeddingPromises);
      expect(embeddings).toHaveLength(3);

      // Concurrent retrievals
      const retrievalPromises = embeddings.map(({ embedding }, index) =>
        mockVectorDB.query({
          vector: embedding,
          topK: 2,
          metadata: { query: concurrentQueries[index] },
        }),
      );

      const retrievalResults = await Promise.all(retrievalPromises);
      const allDocs = retrievalResults.flat();

      expect(allDocs.length).toBeGreaterThan(0);

      // Stream consolidated response
      const streamingModel = createStreamingTextModel([
        "Processing concurrent retrievals... ",
        "Found information on performance, optimization, and processing. ",
        "Consolidated insights: AI SDK streaming provides efficient real-time processing.",
      ]);

      const consolidatedContext = allDocs
        .map((doc: any) => doc.content)
        .join(" ");

      const result = streamText({
        model: streamingModel,
        prompt: `Consolidated context: ${consolidatedContext}\n\nProvide comprehensive insights.`,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toContain("concurrent");
      expect(completion.text).toContain("consolidated");
      expect(completion.usage.totalTokens).toBeGreaterThan(0);
    });
  });
});
