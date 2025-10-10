/**
 * Basic chat example demonstrating the new AI SDK patterns
 */

import { logDebug } from '@repo/observability';
import type { UIMessage } from 'ai';
import { stepCountIs } from 'ai';
import { Chat } from '../generation';
import { TEMPS } from '../providers/shared';

// Example: Server-side chat completion
export async function basicChatExample() {
  const messages: UIMessage[] = [
    {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello, how can you help me?' }],
    },
  ];

  // Simple chat completion
  const result = await Chat.create(messages);
  logDebug('Response:', result.message);

  // Chat with streaming
  const streamResult = await Chat.stream(messages);
  return streamResult.toUIMessageStreamResponse?.();
}

// Example: Chat with tools
export async function chatWithToolsExample() {
  const messages: UIMessage[] = [
    {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'What is the weather like?' }],
    },
  ];

  const tools = {
    getWeather: {
      description: 'Get current weather for a location',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name' },
        },
        required: ['location'],
      },
    },
  };

  const result = await Chat.withTools(messages, tools);
  return result.toUIMessageStreamResponse?.();
}

// Example: Multi-step reasoning
export async function multiStepExample() {
  const messages: UIMessage[] = [
    {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Plan a 3-day trip to San Francisco' }],
    },
  ];

  const result = await Chat.multiStep(messages, {
    stopWhen: stepCountIs(5),
    temperature: TEMPS.BALANCED,
  });

  return result.toUIMessageStreamResponse?.();
}
