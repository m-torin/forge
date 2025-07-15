/**
 * Comprehensive Upstash Vector AI SDK Integration Example
 * Demonstrates all implemented features from phases 1, 2, 3.1, 3.2, and 5.2
 */

import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';

// Import our enhanced AI SDK integrations
import {
  // Phase 5.2: Analytics
  createAnalyticsVectorDB,
  createBulkTools,
  createMetadataTools,
  createNamespaceTools,
  createRAGWorkflow,
  createRangeTools,
  // Phase 1: Core Tools
  createVectorTools,
  quickRAG,
  // Phase 2: Advanced Features
  streamTextWithVectorContext,
} from '../src/server';

// Initialize Upstash Vector
const vectorDB = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL || 'https://example.upstash.io',
  token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'token',
});

// Wrap with analytics (with type assertion for compatibility)
const analyticsDB = createAnalyticsVectorDB(vectorDB as any);

/**
 * Example 1: Basic Vector Tools Usage
 */
async function basicVectorToolsExample() {
  console.log('🔧 Basic Vector Tools Example');

  const tools = createVectorTools({
    vectorDB: analyticsDB,
    embeddingModel: 'text-embedding-3-small',
    defaultTopK: 5,
    similarityThreshold: 0.7,
  });

  // Add a document
  const addResult = await tools.addToVectorStore.execute(
    {
      id: 'doc-1',
      content: 'This is a sample document about AI and machine learning.',
      metadata: { category: 'technology', author: 'AI Expert' },
      chunk: false,
    },
    { toolCallId: 'test-call', messages: [] },
  );

  console.log('Added document:', addResult);

  // Search for similar content
  const searchResult = await tools.searchVectorContext.execute(
    {
      query: 'What is the capital of France?',
      topK: 3,
      includeScores: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Search results:', searchResult);
}

/**
 * Example 2: Namespace Management
 */
async function namespaceManagementExample() {
  console.log('🏢 Namespace Management Example');

  const namespaceTools = createNamespaceTools({
    vectorDB: analyticsDB,
    defaultNamespace: 'default',
    maxNamespaces: 10,
  });

  // Create a new namespace for a tenant
  const createResult = await namespaceTools.createNamespace.execute(
    {
      namespace: 'tenant-acme',
      description: 'ACME Corp knowledge base',
      metadata: { tenant: 'acme', created: new Date().toISOString() },
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Created namespace:', createResult);

  // List all namespaces
  const listResult = await namespaceTools.listNamespaces.execute(
    {
      includeStats: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Available namespaces:', listResult);
}

/**
 * Example 3: Bulk Operations
 */
async function bulkOperationsExample() {
  console.log('📦 Bulk Operations Example');

  const bulkTools = createBulkTools({
    vectorDB: analyticsDB,
    embeddingModel: 'text-embedding-3-small',
    defaultBatchSize: 50,
    maxConcurrency: 3,
  });

  // Bulk upsert documents
  const documents = [
    { id: 'doc1', content: 'Machine learning is a subset of artificial intelligence.' },
    { id: 'doc2', content: 'Neural networks are inspired by biological neural networks.' },
    { id: 'doc3', content: 'Deep learning uses multiple layers of neural networks.' },
  ];

  const bulkResult = await bulkTools.bulkUpsert.execute(
    {
      vectors: documents,
      generateEmbeddings: true,
      namespace: 'ml-docs',
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Bulk upsert result:', bulkResult);

  // Bulk query multiple questions
  const queries = [
    { content: 'What is machine learning?', topK: 2 },
    { content: 'How do neural networks work?', topK: 2 },
  ];

  const queryResult = await bulkTools.bulkQuery.execute(
    {
      queries,
      namespace: 'ml-docs',
      aggregateResults: false,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Bulk query results:', queryResult);
}

/**
 * Example 4: Range/Pagination Operations
 */
async function rangePaginationExample() {
  console.log('📄 Range/Pagination Example');

  const rangeTools = createRangeTools({
    vectorDB: analyticsDB,
    defaultPageSize: 10,
    enableCaching: true,
  });

  // Create a pagination session
  const sessionResult = await rangeTools.createPaginationSession.execute(
    {
      sessionId: 'browse-session-1',
      pageSize: 5,
      namespace: 'ml-docs',
      includeVectors: false,
      includeMetadata: true,
      includeData: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Created pagination session:', sessionResult);

  // Get first page
  const firstPage = await rangeTools.getNextPage.execute(
    {
      sessionId: 'browse-session-1',
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('First page:', firstPage);

  // Export vectors
  const exportResult = await rangeTools.exportVectors.execute(
    {
      namespace: 'ml-docs',
      format: 'json',
      maxVectors: 100,
      includeVectors: false,
      includeMetadata: true,
      includeData: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Export metadata:', exportResult.metadata);
}

/**
 * Example 5: Metadata Management
 */
async function metadataManagementExample() {
  console.log('🏷️ Metadata Management Example');

  const metadataTools = createMetadataTools({
    vectorDB: analyticsDB,
    defaultNamespace: 'ml-docs',
  });

  // Update metadata for a specific vector
  const updateResult = await metadataTools.updateMetadata.execute(
    {
      vectorId: 'doc1',
      metadata: { tags: ['AI', 'ML'], difficulty: 'beginner' },
      mergeMode: 'merge',
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Updated metadata:', updateResult);

  // Query by metadata
  const queryResult = await metadataTools.queryByMetadata.execute(
    {
      filter: { tags: { $in: ['AI'] } },
      limit: 5,
      includeVectors: false,
      includeMetadata: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Metadata query results:', queryResult);

  // Get metadata statistics
  const statsResult = await metadataTools.getMetadataStats.execute(
    {
      sampleSize: 100,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Metadata stats:', statsResult);
}

/**
 * Example 6: Complete RAG Workflow
 */
async function ragWorkflowExample() {
  console.log('🤖 RAG Workflow Example');

  const ragWorkflow = createRAGWorkflow({
    vectorDB: analyticsDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4o',
    provider: 'openai',
    namespace: 'ml-docs',
    topK: 3,
    similarityThreshold: 0.7,
  });

  // Add some documents to the knowledge base
  await ragWorkflow.addDocuments([
    {
      id: 'rag-doc-1',
      content:
        'Retrieval-Augmented Generation (RAG) combines retrieval and generation for better AI responses.',
      metadata: { topic: 'RAG', source: 'documentation' },
    },
    {
      id: 'rag-doc-2',
      content:
        'Vector databases store high-dimensional vectors for similarity search in AI applications.',
      metadata: { topic: 'Vector DB', source: 'documentation' },
    },
  ]);

  // Query the RAG system
  const ragResponse = await ragWorkflow.query('What is RAG and how does it work?');
  console.log('RAG Response:', ragResponse);

  // Stream a RAG response
  console.log('Streaming RAG response:');
  for await (const chunk of ragWorkflow.streamChat('How do vector databases help with RAG?')) {
    if (chunk.type === 'answer') {
      process.stdout.write(chunk.data);
    } else if (chunk.type === 'done') {
      console.log(
        `
Sources:`,
        chunk.data.sources,
      );
    }
  }
}

/**
 * Example 7: Streaming with Vector Context
 */
async function streamingWithContextExample() {
  console.log('🌊 Streaming with Vector Context Example');

  const result = await streamTextWithVectorContext({
    model: openai('gpt-4o'),
    messages: [{ role: 'user', content: 'Tell me about machine learning' }],
    vectorConfig: {
      vectorDB: analyticsDB,
      embeddingModel: 'text-embedding-3-small',
      autoEnrichContext: true,
      contextTopK: 3,
      namespace: 'ml-docs',
    },
    onVectorContext: context => {
      console.log('Retrieved context:', context.length, 'documents');
    },
  });

  console.log('Streaming response with vector context:');
  for await (const delta of result.textStream) {
    process.stdout.write(delta);
  }
  console.log('');
}

/**
 * Example 8: Combined Tool Suite
 */
async function combinedToolSuiteExample() {
  console.log('🔧 Combined Tool Suite Example');

  // Use new simplified API - combine all vector tools
  const allTools = {
    ...createVectorTools({
      vectorDB: analyticsDB,
      embeddingModel: 'text-embedding-3-small',
      defaultTopK: 5,
      similarityThreshold: 0.7,
    }),
    ...createNamespaceTools({
      vectorDB: analyticsDB,
      defaultNamespace: 'combined-demo',
    }),
    ...createMetadataTools({
      vectorDB: analyticsDB,
    }),
    ...createRangeTools({
      vectorDB: analyticsDB,
      defaultTopK: 5,
    }),
    ...createBulkTools({
      vectorDB: analyticsDB,
      defaultBatchSize: 100,
      maxConcurrency: 3,
    }),
  };

  // Now you have access to all tools in one object
  console.log('Available tools:', Object.keys(allTools));

  // Use multiple tools together
  await allTools.createNamespace.execute(
    {
      namespace: 'combined-demo',
      description: 'Demo namespace for combined tools',
    },
    { toolCallId: 'example-call', messages: [] },
  );

  await allTools.bulkUpsert.execute(
    {
      vectors: [{ id: 'combined-1', content: 'This is a test document for combined tools demo.' }],
      generateEmbeddings: true,
      namespace: 'combined-demo',
    },
    { toolCallId: 'example-call', messages: [] },
  );

  const searchResult = await allTools.searchVectorContext.execute(
    {
      query: 'test document',
      includeScores: true,
    },
    { toolCallId: 'example-call', messages: [] },
  );

  console.log('Combined tools search result:', searchResult);
}

/**
 * Example 9: Analytics and Monitoring
 */
async function analyticsExample() {
  console.log('📊 Analytics and Monitoring Example');

  const analytics = analyticsDB.getAnalytics();

  // Get current metrics
  const metrics = analytics.getMetrics('hour');
  console.log('Hourly metrics:', JSON.stringify(metrics, null, 2));

  // Get usage statistics
  const usageStats = analytics.getUsageStats();
  console.log('Usage statistics:', JSON.stringify(usageStats, null, 2));
}

/**
 * Example 10: Quick RAG Helper
 */
async function quickRagExample() {
  console.log('⚡ Quick RAG Example');

  // Quick one-shot RAG query
  const quickResponse = await quickRAG(
    analyticsDB,
    'What are the benefits of using vector databases?',
    {
      namespace: 'ml-docs',
      topK: 3,
      embeddingModel: 'text-embedding-3-small',
      chatModel: 'gpt-4o',
    },
  );

  console.log('Quick RAG response:', quickResponse);
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('🚀 Starting Comprehensive Upstash Vector AI SDK Examples\n');

  try {
    // Phase 1: Foundation & Core Tools
    await basicVectorToolsExample();
    console.log('\n---\n');

    await namespaceManagementExample();
    console.log('\n---\n');

    // Phase 2: Advanced Operations
    await bulkOperationsExample();
    console.log('\n---\n');

    await rangePaginationExample();
    console.log('\n---\n');

    await metadataManagementExample();
    console.log('\n---\n');

    // Phase 3.1 & 3.2: Workflows and Streaming
    await ragWorkflowExample();
    console.log('\n---\n');

    await streamingWithContextExample();
    console.log('\n---\n');

    // Combined features
    await combinedToolSuiteExample();
    console.log('\n---\n');

    await quickRagExample();
    console.log('\n---\n');

    // Phase 5.2: Analytics
    await analyticsExample();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  analyticsExample,
  basicVectorToolsExample,
  bulkOperationsExample,
  combinedToolSuiteExample,
  metadataManagementExample,
  namespaceManagementExample,
  quickRagExample,
  ragWorkflowExample,
  rangePaginationExample,
  streamingWithContextExample,
};
