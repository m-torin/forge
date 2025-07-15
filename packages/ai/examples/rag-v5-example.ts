/**
 * AI SDK v5 RAG Example
 *
 * This example demonstrates the updated RAG implementation following
 * Vercel AI SDK v5 best practices with correct tool naming and system prompts.
 */

import { createAISDKRagFromEnv } from '../src/server/rag/ai-sdk-rag';

async function demonstrateV5RagPatterns() {
  console.log('🚀 AI SDK v5 RAG Example');

  // Create RAG instance
  const rag = createAISDKRagFromEnv();

  if (!rag) {
    console.log('❌ RAG not configured. Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN');
    return;
  }

  try {
    console.log('1. Adding resources (follows addResource pattern)...');

    // Add sample resources
    await rag.addContent(
      'Next.js is a React framework that enables functionality such as server-side rendering and generating static websites.',
    );

    await rag.addContent(
      'Vercel AI SDK v5 provides tools for building AI-powered applications with React, Next.js, Vue, Svelte, and more.',
    );

    console.log('✅ Resources added to knowledge base');

    console.log(`
2. Querying with getInformation pattern...`);

    // Query the knowledge base (uses getInformation internally)
    const answer = await rag.query('What is Next.js?');
    console.log('📝 Answer:', answer);

    console.log(`
3. Testing new system prompt behavior...`);

    // Test with question that has no relevant information
    const unknownAnswer = await rag.query('What is the capital of Mars?');
    console.log('❓ Unknown topic response:', unknownAnswer);

    console.log(`
✅ AI SDK v5 RAG patterns working correctly!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Example of creating a chat handler with v5 patterns
export function createV5RagChatExample() {
  console.log(`
🔧 Example chat handler configuration:`);
  console.log(`
import { createRAGChatHandler } from '@repo/ai/server/rag/ai-sdk-rag';
import { createUpstashAIVectorWithRegistry } from '@repo/ai/server/vector/ai-sdk-integration';
import { openai } from '@ai-sdk/openai';

// Option 1: Simple configuration (string model name)
const handler = createRAGChatHandler({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  model: 'gpt-4o',
  provider: 'openai',
  // Uses AI SDK v5 best practice system prompt:
  // "You are a helpful assistant. Check your knowledge base before answering any questions..."
});

// Option 2: Provider registry pattern (EmbeddingModel instance)
const vectorStore = createUpstashAIVectorWithRegistry({
  vectorUrl: process.env.UPSTASH_VECTOR_REST_URL!,
  vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  embeddingModel: openai.embedding('text-embedding-3-small'),
  namespace: 'my-app',
});

// The handler now uses:
// - addResource tool (instead of addToKnowledgeBase)
// - getInformation tool (instead of searchKnowledgeBase)
// - "Sorry, I don't know" fallback response
// - text-embedding-3-small model (latest)
// - Enhanced error handling with logging
  `);
}

// Run example if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await demonstrateV5RagPatterns();
      await createV5RagChatExample();
    } catch (error) {
      console.error('Example failed:', error);
    }
  })();
}

export { createV5RagChatExample, demonstrateV5RagPatterns };
