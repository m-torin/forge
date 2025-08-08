/**
 * Pure Anthropic AI SDK Examples
 * Demonstrates correct AI SDK patterns without custom abstractions
 * Following official Vercel AI SDK documentation exactly
 */

import { generateText, streamText } from 'ai';
import {
  analyzeSentiment,
  createAnthropicModel,
  createAnthropicProvider,
  createAnthropicWithReasoning,
  createBashTool,
  createTextEditorTool,
  extractEntities,
  moderateContent,
} from '../src/server-next';

/**
 * Example 1: Basic Anthropic Usage (Pure AI SDK)
 */
export async function basicAnthropicExample() {
  console.log('🤖 Basic Anthropic Example');

  // Pure AI SDK pattern - no custom wrappers
  const model = createAnthropicModel({ model: 'claude-3-haiku-20240307' });

  const result = await generateText({
    model,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  console.log('📝 Response:', result.text);
  return result;
}

/**
 * Example 2: Reasoning Support (Pure AI SDK Pattern)
 */
export async function reasoningExample() {
  console.log('🧠 Reasoning Example');

  // Pure AI SDK pattern for reasoning
  const {
    text,
    reasoningText,
    reasoningText: reasoning,
  } = await generateText({
    model: createAnthropicModel({ model: 'claude-4-sonnet-20250514' }),
    prompt: 'How many people will live in the world in 2040?',
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 12000 },
      },
    },
  });

  console.log('📝 Response:', text);
  console.log('🧠 Reasoning:', reasoning);
  console.log('📊 Reasoning Details:', reasoningDetails);

  return { text, reasoningText, reasoningText };
}

/**
 * Example 3: Cache Control (Pure AI SDK Pattern)
 */
export async function cacheControlExample() {
  console.log('💾 Cache Control Example');

  const errorMessage = 'ReferenceError: Cannot access "users" before initialization at line 42';

  const result = await generateText({
    model: createAnthropicModel({ model: 'claude-3-5-sonnet-20240620' }),
    messages: [
      {
        role: 'user',

        parts: [
          { type: 'text', text: 'You are a JavaScript expert.' },
          {
            type: 'text',
            text: `Error message: ${errorMessage}`,
            providerOptions: {
              anthropic: { cacheControl: { type: 'ephemeral' } },
            },
          },
          { type: 'text', text: 'Explain the error message.' },
        ],
      },
    ],
  });

  console.log('📝 Response:', result.text);
  console.log('💾 Cache Metadata:', result.providerOptions?.anthropic);

  return result;
}

/**
 * Example 4: Computer Tools (Pure AI SDK Pattern)
 */
export async function computerToolsExample() {
  console.log('🖥️ Computer Tools Example');

  // Create tools using pure AI SDK patterns
  const bashTool = createBashTool(async ({ command }) => {
    // Simulate command execution
    return `[Simulated] Executed: ${command}`;
  });

  const textEditorTool = createTextEditorTool(async ({ command, path, file_text }) => {
    if (command === 'create') {
      return `[Simulated] Created file ${path} with content: ${file_text}`;
    }
    return `[Simulated] Executed ${command} on ${path}`;
  });

  const result = await generateText({
    model: createAnthropicModel({ model: 'claude-3-5-sonnet-20241022' }),
    prompt:
      "Create a new file called example.txt, write 'Hello World' to it, and run 'cat example.txt' in the terminal",
    tools: {
      bash: bashTool,
      str_replace_editor: textEditorTool, // Note: specific name required by AI SDK
    },
  });

  console.log('📝 Response:', result.text);
  console.log('🔧 Tool Calls:', result.toolCalls);

  return result;
}

/**
 * Example 5: Structured Output (Pure AI SDK Pattern)
 */
export async function structuredOutputExample() {
  console.log('📋 Structured Output Example');

  // Using the utility functions (which use pure AI SDK internally)
  const sentiment = await analyzeSentiment('I love this new AI technology!');
  console.log('😊 Sentiment:', sentiment);

  const moderation = await moderateContent('This is a normal message about technology.');
  console.log('🛡️ Moderation:', moderation);

  const entities = await extractEntities(
    'Apple Inc. was founded by Steve Jobs in Cupertino, California in 1976.',
  );
  console.log('🏷️ Entities:', entities);

  return { sentiment, moderation, entities };
}

/**
 * Example 6: Custom Provider Instance (Pure AI SDK Pattern)
 */
export async function customProviderExample() {
  console.log('⚙️ Custom Provider Example');

  // Create custom provider with settings
  const customProvider = createAnthropicProvider({
    baseURL: 'https://api.anthropic.com/v1',
    apiKey: process.env.ANTHROPIC_API_KEY,
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  });

  const model = customProvider('claude-3-haiku-20240307');

  const result = await generateText({
    model,
    prompt: 'Explain quantum computing in simple terms.',
  });

  console.log('📝 Response:', result.text);
  return result;
}

/**
 * Example 7: Streaming with Reasoning (Pure AI SDK Pattern)
 */
export async function streamingWithReasoningExample() {
  console.log('🌊 Streaming with Reasoning Example');

  const stream = streamText({
    model: createAnthropicModel({ model: 'claude-3-5-sonnet-20241022' }),
    prompt: 'Solve this math problem step by step: What is 15% of 240?',
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 5000 },
      },
    },
  });

  console.log('🌊 Streaming response:');
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }

  // Get final result with reasoning
  const finalResult = await stream;
  console.log('\n🧠 Final Reasoning:', finalResult.reasoningText);

  return finalResult;
}

/**
 * Example 8: Using Helper for Reasoning (Pure AI SDK Pattern)
 */
export async function reasoningHelperExample() {
  console.log('🛠️ Reasoning Helper Example');

  // Use the helper function
  const reasoningModel = createAnthropicWithReasoning('claude-3-5-sonnet-20241022', 8000);

  const result = await reasoningModel.generateWithReasoning(
    'Design a simple algorithm to find the shortest path between two points in a graph.',
  );

  console.log('📝 Response:', result.text);
  console.log('🧠 Reasoning:', result.reasoningText);

  return result;
}

/**
 * Run all examples
 */
export async function runAllAnthropicExamples() {
  try {
    await basicAnthropicExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await reasoningExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await cacheControlExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await computerToolsExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await structuredOutputExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await customProviderExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await streamingWithReasoningExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await reasoningHelperExample();
  } catch (error) {
    console.error('❌ Error running Anthropic examples:', error);
  }
}

// Export examples for testing
export const examples = {
  basic: basicAnthropicExample,
  reasoningText: reasoningExample,
  cacheControl: cacheControlExample,
  computerTools: computerToolsExample,
  structuredOutput: structuredOutputExample,
  customProvider: customProviderExample,
  streamingWithReasoning: streamingWithReasoningExample,
  reasoningHelper: reasoningHelperExample,
  all: runAllAnthropicExamples,
};
