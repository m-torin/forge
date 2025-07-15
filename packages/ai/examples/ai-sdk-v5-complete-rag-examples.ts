/**
 * Complete AI SDK v5 RAG Examples
 * Demonstrates all enhanced RAG features aligned with AI SDK v5 patterns
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  batchProcessDocuments,
  createCommonMCPServers,
  // Advanced tools
  createEnhancedRAGToolset,

  // MCP integration
  createMCPRAGIntegration,
  createProductionRAG,
  // Infrastructure
  createRAGDatabaseBridge,
  generateEmbeddings,
  streamMultiStepRAG,
  // Enhanced streaming
  streamRAGWithSources,
} from '../src/server/rag';

/**
 * Example 1: Batch Embedding Processing (AI SDK v5 Pattern)
 */
export async function example1_BatchEmbeddings() {
  console.log('🔄 Example 1: Batch Embedding Processing');

  const documents = [
    'AI SDK v5 introduces new streaming capabilities',
    'RAG systems combine retrieval with generation',
    'Vector databases enable semantic search',
  ];

  // Generate embeddings in batch (AI SDK v5 embedMany pattern)
  const embeddings = await generateEmbeddings(documents);

  console.log(`Generated ${embeddings.length} embeddings`);
  console.log(`First embedding dimension: ${embeddings[0].length}`);

  // Batch process documents with automatic chunking
  const result = await batchProcessDocuments(
    documents.map((content, index) => ({
      id: `doc_${index}`,
      content,
      metadata: { source: 'ai_sdk_docs', index },
    })),
    {
      chunkSize: 5,
    },
  );

  console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
}

/**
 * Example 2: Streaming RAG with Source Metadata (AI SDK v5 Pattern)
 */
export async function example2_StreamingWithSources() {
  console.log('📡 Example 2: Streaming RAG with Source Metadata');

  const vectorStore = createRAGDatabaseBridge({
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
  });

  const config = {
    vectorStore,
    languageModel: openai('gpt-4o'),
    enableSourceTracking: true,
  };

  // Stream with source accumulation (AI SDK v5 pattern)
  const streamResult = await streamRAGWithSources(
    'What are the benefits of using AI SDK v5?',
    config,
    {
      onSourcesUpdate: sources => {
        console.log(
          '📚 Sources found:',
          sources.map(s => s.title || s.url),
        );
      },
    },
  );

  console.log('🔗 Streaming with sources:', {
    sourcesCount: streamResult.sources.length,
    averageRelevance: streamResult.contextMetadata.averageRelevance,
  });

  // Stream the response
  for await (const chunk of streamResult.textStream) {
    process.stdout.write(chunk);
  }
}

/**
 * Example 3: Multi-Step RAG with Tool Calling (AI SDK v5 Pattern)
 */
export async function example3_MultiStepRAG() {
  console.log('🔧 Example 3: Multi-Step RAG with Tool Calling');

  const vectorStore = createRAGDatabaseBridge({
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
  });

  const enhancedTools = createEnhancedRAGToolset({
    vectorStore,
    enableSourceTracking: true,
    enableBatchProcessing: true,
  });

  const config = {
    vectorStore,
    languageModel: openai('gpt-4o'),
    maxSteps: 3,
    tools: enhancedTools,
  };

  // Multi-step reasoning with context accumulation
  const streamResult = await streamMultiStepRAG(
    'Compare the performance characteristics of different embedding models',
    config,
    {
      onStep: (step, action, context) => {
        console.log(`Step ${step}: ${action} - Context items: ${context?.length || 0}`);
      },
    },
  );

  console.log('🎯 Multi-step RAG:', {
    sourcesFound: streamResult.sources.length,
    stepsExecuted: streamResult.steps,
  });
}

/**
 * Example 4: Enhanced RAG Tools (AI SDK v5 Pattern)
 */
export async function example4_EnhancedTools() {
  console.log('🛠️ Example 4: Enhanced RAG Tools');

  const vectorStore = createRAGDatabaseBridge({
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
  });

  const tools = createEnhancedRAGToolset({
    vectorStore,
    enableSourceTracking: true,
    enableBatchProcessing: true,
    maxContextLength: 2000,
  });

  // Use enhanced knowledge search
  const searchResult = await tools.enhancedKnowledgeSearch.execute({
    question: 'How does RAG improve AI responses?',
    topK: 5,
    threshold: 0.8,
    includeMetadata: true,
  });

  console.log('🔍 Enhanced search results:', {
    resultsCount: searchResult.length,
    hasSourceMetadata: searchResult.some(r => r.source),
  });

  // Multi-step reasoning
  const reasoningResult = await tools.multiStepReasoning.execute({
    mainQuestion: 'What are the trade-offs between different RAG approaches?',
    subQueries: [
      'What is simple RAG?',
      'What is advanced RAG?',
      'What are the performance implications?',
    ],
    synthesizeResults: true,
  });

  console.log('🧠 Multi-step reasoning:', {
    mainQuestion: reasoningResult.mainQuestion,
    synthesizedResults: reasoningResult.synthesizedResults?.length || 0,
    contextItemsFound: reasoningResult.contextItemsFound,
  });
}

/**
 * Example 5: MCP Integration (AI SDK v5 Pattern)
 */
export async function example5_MCPIntegration() {
  console.log('🔌 Example 5: MCP Integration');

  const vectorStore = createRAGDatabaseBridge({
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
  });

  const mcpRAG = createMCPRAGIntegration({
    vectorStore,
    mcpServers: createCommonMCPServers(),
    enableContextSharing: true,
  });

  await mcpRAG.initialize();

  // Create RAG-enhanced MCP tools
  const enhancedWebSearch = mcpRAG.createRAGEnhancedTool('webSearch');
  const _contextSharing = mcpRAG.createContextSharingTool();

  console.log('🌐 MCP tools available:', mcpRAG.getAvailableTools());
  console.log('🔗 Server status:', mcpRAG.getServerStatus());

  // Use enhanced web search with RAG context
  const searchResult = await enhancedWebSearch.execute({
    query: 'latest AI SDK developments',
    maxResults: 3,
    includeRAGContext: true,
    maxRAGResults: 2,
  });

  console.log('🔍 MCP + RAG search:', {
    hasToolResult: !!searchResult.toolResult,
    hasRAGContext: !!searchResult.ragContext,
    contextUsed: searchResult.contextUsed,
  });

  await mcpRAG.cleanup();
}

/**
 * Example 6: Complete AI SDK v5 Chat Integration
 */
export async function example6_CompleteIntegration() {
  console.log('💬 Example 6: Complete AI SDK v5 Chat Integration');

  // Create production-ready RAG system
  const ragSystem = createProductionRAG({
    databaseConfig: {
      vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
      vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
    },
    languageModel: openai('gpt-4o'),
    topK: 5,
    similarityThreshold: 0.7,
  });

  // Create enhanced tools
  const enhancedTools = createEnhancedRAGToolset({
    vectorStore: ragSystem.vectorStore,
    enableSourceTracking: true,
    enableBatchProcessing: true,
  });

  // Stream chat with all enhancements
  const messages = [
    { role: 'user', content: 'What are the latest improvements in AI SDK v5 for RAG systems?' },
  ];

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      // Core RAG tools
      ...enhancedTools,

      // Quick access functions
      quickSearch: enhancedTools.enhancedKnowledgeSearch,
      deepAnalysis: enhancedTools.multiStepReasoning,
      summarizeContext: enhancedTools.contextSummarization,
    },
    maxSteps: 5,
    system: `You are an AI assistant with access to a comprehensive knowledge base about AI SDK v5 and RAG systems.

Use your tools to:
1. Search for relevant information
2. Perform multi-step reasoning for complex questions
3. Summarize context from multiple sources
4. Provide detailed, well-sourced responses

Always cite your sources and explain your reasoning process.`,
  });

  console.log('🎯 Complete integration started');

  // Process the stream
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  // Get final results
  const finalResult = await result;
  console.log('\n📊 Final stats:', {
    toolCalls: finalResult.toolCalls?.length || 0,
    tokensUsed: finalResult.usage?.totalTokens,
    steps: finalResult.steps?.length || 0,
  });

  // Show system health
  console.log('💚 System health:', ragSystem.getHealthStatus());
  console.log('📈 System metrics:', ragSystem.getMetrics());
}

/**
 * Example 7: Type-Safe Tool Results (AI SDK v5 Pattern)
 */
export async function example7_TypeSafeResults() {
  console.log('🔒 Example 7: Type-Safe Tool Results');

  const vectorStore = createRAGDatabaseBridge({
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL || 'fallback-url',
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN || 'fallback-token',
  });

  const tools = createEnhancedRAGToolset({
    vectorStore,
    enableSourceTracking: true,
  });

  // Type-safe tool execution with proper result typing
  const searchResults = await tools.enhancedKnowledgeSearch.execute({
    question: 'What is vector similarity search?',
    topK: 3,
  });

  // TypeScript knows the exact structure
  searchResults.forEach((result, index) => {
    console.log(`Result ${index + 1}:`);
    console.log(`  Content: ${result.content.substring(0, 100)}...`);
    console.log(`  Score: ${result.score.toFixed(3)}`);
    console.log(`  Source: ${result.source?.title || 'Unknown'}`);
  });

  const summaryResult = await tools.contextSummarization.execute({
    topic: 'AI SDK v5 features',
    focusAreas: ['streaming', 'tools', 'performance'],
    maxSources: 5,
  });

  // Type-safe access to summary results
  console.log('📝 Summary:', {
    topic: summaryResult.topic,
    contentItems: summaryResult.totalContentItems,
    averageRelevance: summaryResult.averageRelevance.toFixed(3),
    sources: summaryResult.sources.slice(0, 3),
  });
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running All AI SDK v5 RAG Examples');

  const examples = [
    example1_BatchEmbeddings,
    example2_StreamingWithSources,
    example3_MultiStepRAG,
    example4_EnhancedTools,
    example5_MCPIntegration,
    example6_CompleteIntegration,
    example7_TypeSafeResults,
  ];

  for (let i = 0; i < examples.length; i++) {
    try {
      await examples[i]();
      console.log(`
✅ Example ${i + 1} completed
`);
    } catch (error) {
      console.error(
        `
❌ Example ${i + 1} failed:`,
        error,
      );
    }
  }

  console.log('🎉 All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
