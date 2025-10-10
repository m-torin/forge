/**
 * Example demonstrating AI SDK v5 tool usage patterns
 * Shows how to use official tool() implementations with AI models
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { databaseQueryTool, sendEmailTool, trackEventTool, webSearchTool } from '../standard';

async function basicToolUsageExample() {
  // Tools are used with generateText or other AI functions
  const result = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    tools: {
      webSearch: webSearchTool,
      trackEvent: trackEventTool,
    },
    toolChoice: 'auto',
    prompt:
      'Search for the latest developments in AI and track this search event for user demo-123',
  });

  console.log('AI response:', result.text);
  console.log('Tool calls:', result.toolCalls);

  return result;
}

// Different models with different tool sets
async function multiModelExample() {
  const results = await Promise.allSettled([
    // Fast model for simple operations
    generateText({
      model: openai('gpt-4o-mini'),
      tools: {
        webSearch: webSearchTool,
      },
      toolChoice: 'required',
      prompt: 'Search for latest tech news',
    }),

    // More capable model for complex operations
    generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: {
        webSearch: webSearchTool,
        database: databaseQueryTool,
        email: sendEmailTool,
      },
      toolChoice: 'auto',
      prompt:
        'Search for market trends, analyze user data, and send a summary email to admin@example.com',
    }),
  ]);

  return results.map((result, index) => ({
    modelIndex: index,
    status: result.status,
    data:
      result.status === 'fulfilled'
        ? {
            text: result.value.text,
            toolCalls: result.value.toolCalls,
          }
        : result.reason,
  }));
}

// Text generation with tools
async function textGenerationWithToolsExample() {
  const result = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    tools: {
      webSearch: webSearchTool,
      trackEvent: trackEventTool,
    },
    toolChoice: 'auto',
    prompt: 'Search for AI news and track this interaction',
  });

  return {
    text: result.text,
    toolCalls: result.toolCalls,
    usage: result.usage,
  };
}

export { basicToolUsageExample, multiModelExample, textGenerationWithToolsExample };
