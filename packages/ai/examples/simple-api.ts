/**
 * Simplified Tools API Example
 *
 * Shows the cleaner way to work with AI tools
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  getMetrics,
  presets,
  ragTools,
  schemas,
  tool,
  tools,
} from '../src/server/tools/simple-tools';

// Missing imports for the example
import { z } from 'zod/v4';

// Example 1: Simplest usage - just get preset tools
async function example1_presets() {
  console.log('Example 1: Using presets');

  // One line to get all standard tools
  const myTools = tools('standard');

  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: "What's the weather in San Francisco and calculate 2+2?",
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 2: Creating a custom tool
async function example2_customTool() {
  console.log('Example 2: Custom tool');

  // Simple tool creation
  const greetingTool = tool({
    description: 'Generate a greeting',
    inputSchema: schemas.query, // Reuse common schemas
    execute: async ({ query: name }) => {
      return { greeting: `Hello, ${name}!` };
    },
  });

  // Combine with presets
  const myTools = tools({
    ...presets.standard,
    greeting: greetingTool,
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: 'Greet John and check the weather in NYC',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 3: Using options (tracking)
async function example3_withTracking() {
  console.log('Example 3: With performance tracking');

  // Enable tracking with options
  const myTools = tools({
    preset: 'standard',
    custom: {
      slowTool: tool({
        description: 'A slow operation',
        inputSchema: z.object({ delay: z.number() }),
        execute: async ({ delay }) => {
          await new Promise(resolve => setTimeout(resolve, delay));
          return { completed: true };
        },
      }),
    },
    options: { track: true },
  });

  // Use the tools
  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: 'Run the slow tool with 100ms delay and calculate 5*5',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  // Check performance metrics
  const metrics = getMetrics();
  console.log('Performance metrics:', metrics);
}

// Example 4: RAG tools
async function example4_ragTools() {
  console.log('Example 4: RAG tools');

  // Mock vector store
  const mockVectorStore = {
    upsert: async (data: any) => console.log('Upserting:', data),
    query: async (_params: any) => ({
      matches: [{ id: '1', score: 0.9, data: 'AI is powerful' }],
    }),
  };

  // Get RAG tools for your vector store
  const myTools = tools({
    ...ragTools(mockVectorStore),
    ...presets.standard,
  });

  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: 'Add "AI SDK v5 is amazing" to knowledge base, then search for AI',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 5: Tool with context
async function example5_toolWithContext() {
  console.log('Example 5: Tool with context');

  // Mock database
  const db = {
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  };

  // Create tool with context
  const userTool = tool({
    description: 'Get user by ID',
    inputSchema: schemas.id,
    execute: async ({ id }, context) => {
      const user = context.db.users.find((u: any) => u.id === parseInt(id));
      return user || { error: 'User not found' };
    },
    context: { db },
  });

  const myTools = tools({ getUser: userTool });

  const result = streamText({
    model: openai('gpt-4'),
    tools: myTools,
    prompt: 'Get user with ID 1',
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

// Example 6: Minimal code for common cases
async function example6_minimal() {
  console.log('Example 6: Minimal code');

  // Just standard tools
  streamText({
    model: openai('gpt-4'),
    tools: tools('standard'),
    prompt: 'Search for AI news',
  });

  // Just custom tools
  streamText({
    model: openai('gpt-4'),
    tools: tools({
      ping: tool({
        description: 'Ping test',
        inputSchema: z.object({}),
        execute: async () => ({ pong: true }),
      }),
    }),
    prompt: 'Run ping test',
  });

  // Mix and match
  streamText({
    model: openai('gpt-4'),
    tools: {
      ...presets.standard,
      ...presets.documents,
      custom: tool({
        description: 'Custom tool',
        inputSchema: z.object({ input: z.string() }),
        execute: async ({ input }) => ({ output: input.toUpperCase() }),
      }),
    },
    prompt: 'Create a document about AI and convert "hello" to uppercase',
  });
}

// Run examples
async function main() {
  const examples = [
    example1_presets,
    example2_customTool,
    example3_withTracking,
    example4_ragTools,
    example5_toolWithContext,
    example6_minimal,
  ];

  for (const example of examples) {
    await example();
    console.log('---');
  }
}

if (require.main === module) {
  (async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
    }
  })();
}
