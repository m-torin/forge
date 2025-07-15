/**
 * Upstash Vector + AI SDK Integration Examples
 *
 * This file demonstrates various ways to use the enhanced Upstash Vector
 * integration with the AI SDK for building RAG applications.
 */

import { createUpstashAIVectorFromEnv } from '../server/vector/ai-sdk-integration';

/**
 * Example 1: Basic Vector Store Usage
 *
 * Simple example of using Upstash Vector for document storage and retrieval
 */
export async function basicVectorStoreExample() {
  const vectorStore = createUpstashAIVectorFromEnv();

  if (!vectorStore) {
    throw new Error(
      'Upstash Vector not configured. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN',
    );
  }

  // Add documents with embeddings
  await vectorStore.upsertWithEmbedding([
    {
      id: 'doc-1',
      content: 'React is a JavaScript library for building user interfaces.',
      metadata: { category: 'frontend', framework: 'react' },
    },
    {
      id: 'doc-2',
      content: 'Next.js is a React framework for production.',
      metadata: { category: 'frontend', framework: 'nextjs' },
    },
  ]);

  // Query the vector store
  const results = await vectorStore.queryWithEmbedding('What is React?', {
    topK: 3,
  });

  console.log('Search Results:', results);
  return results;
}

/**
 * Example 2: Environment-based Vector Setup
 *
 * Quick setup using environment variables
 */
export async function environmentVectorExample() {
  // Automatically uses UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN
  const vectorStore = createUpstashAIVectorFromEnv({
    namespace: 'my-app',
    embeddingModel: 'text-embedding-3-small',
  });

  if (!vectorStore) {
    throw new Error('Upstash Vector not configured');
  }

  // Add some content
  await vectorStore.upsertWithEmbedding([
    {
      id: 'content-1',
      content: 'Next.js is a React framework for building full-stack web applications.',
      metadata: { category: 'web-development', framework: 'nextjs' },
    },
  ]);

  // Query the knowledge base
  const results = await vectorStore.queryWithEmbedding('What is Next.js?');
  return results;
}

/**
 * Example 3: Document Processing with Auto-chunking
 *
 * Add large documents that get automatically chunked
 */
export async function documentProcessingExample() {
  const vectorStore = createUpstashAIVectorFromEnv();
  if (!vectorStore) throw new Error('Upstash Vector not configured');

  // Add a large document - it will be automatically chunked
  const longDocument = `
    React is a JavaScript library for building user interfaces.
    It was created by Facebook and is now maintained by Meta.

    React uses a component-based architecture where you build
    encapsulated components that manage their own state.

    Key features of React include:
    - Virtual DOM for efficient updates
    - JSX syntax for writing components
    - Hooks for state management and side effects
    - Component lifecycle methods
    - Unidirectional data flow

    React can be used for web applications, mobile apps with React Native,
    and even desktop applications with Electron.
  `;

  await vectorStore.addDocument({
    id: 'react-overview',
    content: longDocument,
    metadata: {
      category: 'documentation',
      technology: 'react',
      author: 'technical-team',
    },
  });

  // Search will find relevant chunks
  const results = await vectorStore.queryWithEmbedding('What are the key features of React?');
  return results;
}

/**
 * Example 4: Upstash Hosted Embeddings
 *
 * Using Upstash's hosted embedding models instead of OpenAI
 */
export async function upstashHostedEmbeddingsExample() {
  const vectorStore = createUpstashAIVectorFromEnv({
    embeddingModel: 'text-embedding-3-small',
  });

  if (!vectorStore) throw new Error('Upstash Vector not configured');

  // This will use Upstash's embedding service instead of OpenAI
  await vectorStore.upsertWithUpstashEmbedding([
    {
      id: 'upstash-info',
      content: 'Upstash provides serverless Redis and Vector databases with per-request pricing.',
      metadata: { service: 'upstash', category: 'database' },
    },
  ]);

  const results = await vectorStore.queryWithUpstashEmbedding('What does Upstash provide?');
  return results;
}

/**
 * Example 5: Direct Vector Store Usage
 *
 * Lower-level access to the vector store for custom operations
 */
export async function directVectorStoreExample() {
  const vectorStore = createUpstashAIVectorFromEnv({
    namespace: 'custom-app',
    embeddingModel: 'text-embedding-3-small',
  });

  if (!vectorStore) throw new Error('Upstash Vector not configured');

  // Add documents with custom embeddings
  await vectorStore.upsertWithEmbedding([
    {
      id: 'doc-1',
      content: 'Artificial Intelligence is transforming software development.',
      metadata: { category: 'ai', importance: 'high' },
    },
    {
      id: 'doc-2',
      content: 'Machine Learning models require large datasets for training.',
      metadata: { category: 'ml', importance: 'medium' },
    },
  ]);

  // Query with filters
  const results = await vectorStore.queryWithEmbedding('How is AI changing development?', {
    topK: 3,
    filter: { category: 'ai' }, // Only return AI-related content
  });

  return results;
}

/**
 * Example 6: Multi-tenant RAG with Namespaces
 *
 * Separate knowledge bases for different users/tenants
 */
export async function multiTenantExample() {
  // Create separate vector stores for different tenants
  const tenant1Store = createUpstashAIVectorFromEnv({ namespace: 'tenant-1' });
  const tenant2Store = createUpstashAIVectorFromEnv({ namespace: 'tenant-2' });

  if (!tenant1Store || !tenant2Store) {
    throw new Error('Upstash Vector not configured');
  }

  // Add tenant-specific content
  await tenant1Store.upsertWithEmbedding([
    {
      id: 'tenant1-doc',
      content: 'Tenant 1 specific information and policies.',
      metadata: { tenant: 'tenant-1', type: 'policy' },
    },
  ]);

  await tenant2Store.upsertWithEmbedding([
    {
      id: 'tenant2-doc',
      content: 'Tenant 2 specific information and policies.',
      metadata: { tenant: 'tenant-2', type: 'policy' },
    },
  ]);

  // Query each tenant's knowledge base
  const tenant1Results = await tenant1Store.queryWithEmbedding('What are the policies?');
  const tenant2Results = await tenant2Store.queryWithEmbedding('What are the policies?');

  return {
    tenant1: tenant1Results,
    tenant2: tenant2Results,
  };
}

/**
 * Example 7: Error Handling and Validation
 *
 * Proper error handling for vector operations
 */
export async function errorHandlingExample() {
  try {
    const vectorStore = createUpstashAIVectorFromEnv();

    if (!vectorStore) {
      throw new Error('Upstash Vector not configured');
    }

    // Add content with validation
    const content = 'This is test content for error handling.';
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    await vectorStore.upsertWithEmbedding([
      {
        id: 'test-doc',
        content,
        metadata: { test: true, timestamp: new Date().toISOString() },
      },
    ]);

    // Query with error handling
    const results = await vectorStore.queryWithEmbedding('test content');

    if (results.length === 0) {
      console.log('No results found');
    }

    return results;
  } catch (error) {
    console.error('Vector operation failed:', error);
    throw error;
  }
}
