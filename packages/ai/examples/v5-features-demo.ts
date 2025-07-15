/**
 * AI SDK v5 Features Demonstration
 * Shows off the new v5 capabilities we've implemented
 */

import { openai } from '@ai-sdk/openai';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Import our new v5 features
import {
  CommonSchemas,
  createCachingMiddleware,
  createLoggingMiddleware,
  createStructuredGenerator,
  enhancedEmbedding,
  models,
  registry,
} from '../src/server';

/**
 * Demo 1: Structured Data Generation
 */
async function demoStructuredGeneration() {
  console.log('🏗️ Demo 1: Structured Data Generation');

  const generator = createStructuredGenerator({
    model: openai('gpt-4o'),
    temperature: 0.7,
  });

  // Generate a recipe
  const recipeResult = await generator.generateObject({
    schema: CommonSchemas.recipe,
    prompt: 'Create a recipe for chocolate chip cookies',
  });

  console.log('Generated Recipe:', recipeResult.object);

  // Generate an array of products
  const productsResult = await generator.generateArray({
    schema: CommonSchemas.product,
    prompt: 'Create 3 different smartphone products',
    count: 3,
  });

  console.log('Generated Products:', productsResult.object);
}

/**
 * Demo 2: Enhanced Embeddings with Parallel Processing
 */
async function demoEnhancedEmbeddings() {
  console.log('🧠 Demo 2: Enhanced Embeddings');

  const documents = [
    'The quick brown fox jumps over the lazy dog',
    'Artificial intelligence is transforming technology',
    'Machine learning models require large datasets',
    'Natural language processing enables AI to understand text',
    'Deep learning uses neural networks with multiple layers',
  ];

  // Semantic search with parallel processing
  const searchResults = await enhancedEmbedding.search('AI and machine learning', documents, {
    topK: 3,
    maxParallelCalls: 3, // Process embeddings in parallel
  });

  console.log('Search Results:');
  searchResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.document} (similarity: ${result.similarity.toFixed(3)})`);
  });

  // Document clustering
  const clusters = await enhancedEmbedding.cluster(documents, {
    threshold: 0.7,
    maxParallelCalls: 2,
  });

  console.log(`
Document Clusters:`);
  clusters.forEach((cluster, i) => {
    console.log(`  Cluster ${i + 1}:`);
    cluster.documents.forEach(doc => {
      console.log(`    - ${doc.text}`);
    });
  });
}

/**
 * Demo 3: Advanced Middleware (Logging + Caching)
 */
async function demoAdvancedMiddleware() {
  console.log('🛠️ Demo 3: Advanced Middleware');

  const { wrapLanguageModel } = await import('ai');

  // Create a model with logging and caching middleware
  const enhancedModel = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: [
      createLoggingMiddleware({
        logLevel: 'info',
        logPrompts: true,
        logResponses: true,
        logMetrics: true,
      }),
      createCachingMiddleware({
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
      }),
    ],
  });

  // First call (will be cached)
  console.log('Making first API call (will be cached)...');
  const result1 = await enhancedModel.doGenerate({
    inputFormat: 'prompt',
    mode: { type: 'regular' },
    prompt: 'Explain quantum computing in one sentence.',
  });

  console.log('Result 1:', result1.text);

  // Second call with same prompt (should hit cache)
  console.log('Making second API call (should hit cache)...');
  const result2 = await enhancedModel.doGenerate({
    inputFormat: 'prompt',
    mode: { type: 'regular' },
    prompt: 'Explain quantum computing in one sentence.',
  });

  console.log('Result 2:', result2.text);
  console.log('Results are identical:', result1.text === result2.text);
}

/**
 * Demo 4: V5 Tool Definitions with inputSchema
 */
async function demoV5Tools() {
  console.log('🔧 Demo 4: V5 Tool Definitions');

  // Define tools using v5 parameters syntax
  const weatherTool = tool({
    description: 'Get weather information for a location',
    inputSchema: z.object({
      location: z.string().describe('The location to get weather for'),
      units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
    }),
    execute: async ({ location, units }) => {
      return {
        location,
        temperature: Math.round(Math.random() * 30 + 10),
        units,
        condition: 'Sunny',
      };
    },
  });

  const calculatorTool = tool({
    description: 'Perform basic mathematical calculations',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ operation, a, b }) => {
      switch (operation) {
        case 'add':
          return a + b;
        case 'subtract':
          return a - b;
        case 'multiply':
          return a * b;
        case 'divide':
          return b !== 0 ? a / b : 'Cannot divide by zero';
        default:
          return 'Unknown operation';
      }
    },
  });

  // Use tools with generateText
  const { generateText } = await import('ai');

  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: 'What is the weather in San Francisco and what is 15 + 27?',
    tools: {
      getWeather: weatherTool,
      calculate: calculatorTool,
    },
    maxSteps: 3,
  });

  console.log('Tool Usage Result:', result.text);
  console.log('Tool Calls Made:', result.toolCalls?.length || 0);
}

/**
 * Demo 5: Provider Registry
 */
async function demoProviderRegistry() {
  console.log('🌐 Demo 5: Provider Registry');

  // Access models through the registry
  const gpt4 = registry.languageModel('openai:gpt-4o');
  const claude = registry.languageModel('anthropic:sonnet');
  const embedding = registry.textEmbeddingModel('openai:text-embedding-3-small');

  console.log('Available models:');
  console.log('- GPT-4:', gpt4.modelId);
  console.log('- Claude:', claude.modelId);
  console.log('- Embedding:', embedding.modelId);

  // Use helper functions
  const bestModel = models.language.best();
  const fastModel = models.language.fast();

  console.log('Model helpers:');
  console.log('- Best model:', bestModel.modelId);
  console.log('- Fast model:', fastModel.modelId);
}

/**
 * Run all demos
 */
async function runAllDemos() {
  console.log('🚀 AI SDK v5 Features Demo');
  console.log('='.repeat(50));

  try {
    await demoStructuredGeneration();
    console.log('\n' + '='.repeat(50));

    await demoEnhancedEmbeddings();
    console.log('\n' + '='.repeat(50));

    await demoAdvancedMiddleware();
    console.log('\n' + '='.repeat(50));

    await demoV5Tools();
    console.log('\n' + '='.repeat(50));

    await demoProviderRegistry();
    console.log('\n' + '='.repeat(50));

    console.log('\n✅ All demos completed successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for external usage
export {
  demoAdvancedMiddleware,
  demoEnhancedEmbeddings,
  demoProviderRegistry,
  demoStructuredGeneration,
  demoV5Tools,
  runAllDemos,
};

// Run demos if called directly
if (require.main === module) {
  runAllDemos();
}
