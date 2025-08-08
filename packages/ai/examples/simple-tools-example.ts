/**
 * Simple Tools Example - New Simplified API
 *
 * This example shows how to use the new simplified tool system
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createTool, createTools, tools, toolsets } from '../src/server/tools';

// Example 1: Using preset toolsets (easiest)
async function example1_presetTools() {
  console.log('Example 1: Using preset toolsets');

  // Get standard tools with one line
  const standardTools = toolsets.standard();

  const result = streamText({
    model: openai('gpt-4'),
    tools: standardTools,
    prompt: "What's the weather in San Francisco?",
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 2: Creating custom tools (simple)
async function example2_customTools() {
  console.log('Example 2: Creating custom tools');

  // Create a custom tool
  const customTool = createTool.simple({
    description: 'Get user information',
    inputSchema: tools.schemas.id,
    execute: async ({ id }) => {
      return {
        id,
        name: 'John Doe',
        email: 'john@example.com',
      };
    },
  });

  // Combine with standard tools
  const myTools = createTools({
    getUser: customTool,
    ...toolsets.standard(),
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: 'Get user info for user123 and then check the weather',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 3: Progressive enhancement (tracking)
async function example3_withTracking() {
  console.log('Example 3: Tools with performance tracking');

  // Create tools with tracking enabled
  const trackedTools = createTools(
    {
      ...toolsets.standard(),
      ...toolsets.documents(),
    },
    { track: true },
  );

  // Use the tools
  const result = streamText({
    model: openai('gpt-4'),
    tools: trackedTools,
    prompt: 'Create a document about AI and then search for related content',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 4: RAG tools (vector store integration)
async function example4_ragTools() {
  console.log('Example 4: RAG tools with vector store');

  // Mock vector store for example
  const mockVectorStore = {
    upsert: async (data: any) => console.log('Upserting:', data),
    query: async (_params: any) => ({
      matches: [{ id: '1', score: 0.9, data: 'AI is transformative' }],
    }),
    update: async (data: any) => console.log('Updating:', data),
  };

  // Get RAG tools with one line
  const ragTools = toolsets.rag({
    vectorStore: mockVectorStore,
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: ragTools,
    prompt: 'Add this to knowledge base: AI SDK v5 is powerful. Then search for AI information.',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 5: Tool with context (database connection)
async function example5_withContext() {
  console.log('Example 5: Tools with context');

  // Mock database
  const db = {
    query: async (_sql: string) => ({ rows: [{ id: 1, name: 'Test' }] }),
  };

  // Create tool with context
  const dbTool = createTool.withContext(
    {
      description: 'Query database',
      inputSchema: tools.schemas.query,
      execute: async ({ query }, context) => {
        return await context.db.query(query);
      },
    },
    { db },
  );

  // Create collection with context tool
  const contextTools = createTools({
    queryDB: dbTool,
    ...toolsets.standard(),
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: contextTools,
    prompt: 'Query the database for users and check the weather',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 6: Combining multiple toolsets
async function example6_combineToolsets() {
  console.log('Example 6: Combining multiple toolsets');

  // Combine multiple preset toolsets
  const allTools = toolsets.combine(toolsets.standard(), toolsets.documents(), {
    customTool: createTool.simple({
      description: 'Custom business logic',
      inputSchema: tools.schemas.content,
      execute: async ({ content }) => ({ processed: content.toUpperCase() }),
    }),
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: allTools,
    prompt: 'Create a document, process some text, and calculate 2+2',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 7: Comprehensive features (all options)
async function example7_comprehensiveFeatures() {
  console.log('Example 7: Comprehensive features');

  // Create tools with all features
  const comprehensiveTools = createTools(
    {
      ...toolsets.standard(),
    },
    {
      track: true, // Enable performance tracking
      cache: {
        // Enable caching
        ttl: 3600000, // 1 hour
        maxSize: 100,
      },
      dynamic: true, // Enable dynamic loading
      context: {
        // Shared context
        apiKey: 'my-api-key',
        session: { userId: 'user123' },
      },
    },
  );

  const result = streamText({
    model: openai('gpt-4'),
    tools: comprehensiveTools,
    prompt: 'Use various tools to demonstrate capabilities',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Run examples
async function main() {
  // Comment/uncomment to run specific examples

  // await example1_presetTools();
  // await example2_customTools();
  // await example3_withTracking();
  // await example4_ragTools();
  // await example5_withContext();
  // await example6_combineToolsets();
  // await example7_comprehensiveFeatures();

  // Or run all examples
  for (const example of [
    example1_presetTools,
    example2_customTools,
    example3_withTracking,
    example4_ragTools,
    example5_withContext,
    example6_combineToolsets,
    example7_comprehensiveFeatures,
  ]) {
    await example();
    console.log(`
---
`);
  }
}

// Only run if executed directly
if (require.main === module) {
  (async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
    }
  })();
}

// Export for use in other examples
export { example1_presetTools as simpleExample };
