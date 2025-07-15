import type { CoreMessage, LanguageModelV1StreamPart } from 'ai';
import {
  compareMessages,
  createReasoningResponse,
  createTextDelta,
  createTextResponse,
  createToolCallResponse,
} from './message-comparison';

export interface TestPromptResponse {
  prompt: CoreMessage;
  response: LanguageModelV1StreamPart[];
  reasoningResponse?: LanguageModelV1StreamPart[];
}

export interface MockProviderConfig {
  responses: TestPromptResponse[];
  defaultResponse?: LanguageModelV1StreamPart[];
  enableReasoning?: boolean;
}

/**
 * Creates a mock response handler that matches prompts to predefined responses
 */
export function createMockResponseHandler(
  config: MockProviderConfig,
): (prompt: CoreMessage[], isReasoningEnabled?: boolean) => LanguageModelV1StreamPart[] {
  const { responses, defaultResponse, enableReasoning = false } = config;

  return (prompt: CoreMessage[], isReasoningEnabled = enableReasoning) => {
    const recentMessage = prompt.at(-1);

    if (!recentMessage) {
      throw new Error('No recent message found!');
    }

    // Find matching response
    for (const testResponse of responses) {
      if (compareMessages(recentMessage, testResponse.prompt)) {
        if (isReasoningEnabled && testResponse.reasoningResponse) {
          return testResponse.reasoningResponse;
        }
        return testResponse.response;
      }
    }

    // Return default response or unknown prompt response
    return defaultResponse || [createTextDelta('Unknown test prompt!')];
  };
}

/**
 * Creates standard test prompts for common scenarios
 */
export function createStandardTestPrompts(): TestPromptResponse[] {
  return [
    {
      prompt: {
        role: 'user',
        content: [{ type: 'text', text: 'Why is the sky blue?' }],
      },
      response: createTextResponse("It's just blue duh!"),
      reasoningResponse: createReasoningResponse(
        'The sky is blue because of rayleigh scattering!',
        "It's just blue duh!",
      ),
    },
    {
      prompt: {
        role: 'user',
        content: [{ type: 'text', text: 'Why is grass green?' }],
      },
      response: createTextResponse("It's just green duh!"),
      reasoningResponse: createReasoningResponse(
        'Grass is green because of chlorophyll absorption!',
        "It's just green duh!",
      ),
    },
    {
      prompt: {
        role: 'user',
        content: [{ type: 'text', text: 'Thank you!' }],
      },
      response: createTextResponse("You're welcome!"),
    },
    {
      prompt: {
        role: 'user',
        content: [{ type: 'text', text: 'Tell me about Next.js' }],
      },
      response: createTextResponse('With Next.js, you can ship fast!'),
    },
    {
      prompt: {
        role: 'user',
        content: [{ type: 'text', text: "What's the weather like?" }],
      },
      response: createToolCallResponse('getWeather', {
        latitude: 37.7749,
        longitude: -122.4194,
      }),
    },
    {
      prompt: {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call_456',
            toolName: 'getWeather',
            result: { temperature: 17 },
          },
        ],
      },
      response: createTextResponse('The current temperature in San Francisco is 17°C.'),
    },
  ];
}

/**
 * Creates a mock provider with standard test responses
 */
export function createStandardMockProvider(
  enableReasoning = false,
): (prompt: CoreMessage[], isReasoningEnabled?: boolean) => LanguageModelV1StreamPart[] {
  return createMockResponseHandler({
    responses: createStandardTestPrompts(),
    enableReasoning,
    defaultResponse: [createTextDelta('Unknown test prompt!')],
  });
}
