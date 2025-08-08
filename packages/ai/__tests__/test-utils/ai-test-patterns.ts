/**
 * AI Test Patterns - Vercel AI SDK v5 Utilities
 * Shared testing utilities following analytics package conventions
 * Enhanced with official Vercel AI SDK v5 testing patterns
 */

import { vi } from 'vitest';
import { z } from 'zod/v4';

/**
 * Vercel AI SDK v5 MockLanguageModelV2 Factory
 * Creates standardized mock models following official Vercel AI SDK v5 patterns
 */
export class MockLanguageModelV2Factory {
  /**
   * Create a basic mock model with Vercel AI SDK v5 patterns
   */
  static createBasic(
    config: {
      modelId?: string;
      responses?: string[];
      usage?: { inputTokens: number; outputTokens: number };
      finishReason?: 'stop' | 'length' | 'content-filter' | 'tool-calls';
    } = {},
  ) {
    const {
      modelId = 'mock-basic-model',
      responses = ['Mock response'],
      usage = { inputTokens: 10, outputTokens: 20 },
      finishReason = 'stop',
    } = config;

    return class MockLanguageModelV2 {
      modelId = modelId;
      provider = 'mock';

      async doGenerate() {
        return {
          finishReason,
          usage,
          text: responses[0] || 'Mock response',
        };
      }

      async doStream() {
        return {
          stream: {
            [Symbol.asyncIterator]: async function* () {
              for (const response of responses) {
                for (const word of response.split(' ')) {
                  yield { type: 'text', text: word + ' ' };
                }
              }
              yield { type: 'finish', finishReason, usage };
            },
          },
        };
      }
    };
  }

  /**
   * Create a telemetry-enabled mock model
   */
  static createWithTelemetry(
    config: {
      modelId?: string;
      responses?: string[];
      telemetryHandler?: (data: any) => void;
    } = {},
  ) {
    const {
      modelId = 'mock-telemetry-model',
      responses = ['Telemetry response'],
      telemetryHandler = vi.fn(),
    } = config;

    return class TelemetryMockLanguageModelV2 {
      modelId = modelId;
      provider = 'mock';

      async doGenerate(params: any) {
        // Simulate telemetry collection
        if (params.experimental_telemetry?.isEnabled) {
          telemetryHandler({
            modelId: this.modelId,
            prompt: params.prompt,
            metadata: params.experimental_telemetry.metadata,
            timestamp: new Date().toISOString(),
          });
        }

        return {
          finishReason: 'stop',
          usage: { inputTokens: 15, outputTokens: 25 },
          text: responses[0] || 'Telemetry response',
        };
      }

      async doStream(params: any) {
        if (params.experimental_telemetry?.isEnabled) {
          telemetryHandler({
            modelId: this.modelId,
            operation: 'stream',
            metadata: params.experimental_telemetry.metadata,
          });
        }

        return {
          stream: {
            [Symbol.asyncIterator]: async function* () {
              for (const response of responses) {
                yield { type: 'text', text: response };
              }
              yield {
                type: 'finish',
                finishReason: 'stop',
                usage: { inputTokens: 15, outputTokens: 25 },
              };
            },
          },
        };
      }
    };
  }

  /**
   * Create a tool-capable mock model
   */
  static createWithTools(
    config: {
      modelId?: string;
      toolResults?: Record<string, any>;
      maxSteps?: number;
    } = {},
  ) {
    const { modelId = 'mock-tool-model', toolResults = {}, maxSteps = 3 } = config;

    return class ToolMockLanguageModelV2 {
      modelId = modelId;
      provider = 'mock';

      async doGenerate(params: any) {
        // Simulate multi-step tool execution
        const steps = [];
        let currentStep = 0;

        while (currentStep < maxSteps && params.tools) {
          const toolNames = Object.keys(params.tools);
          if (toolNames.length === 0) break;

          const toolName = toolNames[0]; // Use first tool for simplicity
          const toolCallId = `call_${currentStep + 1}`;

          // Create tool call step
          steps.push({
            stepType: currentStep === 0 ? 'initial' : 'tool-result',
            text: currentStep === maxSteps - 1 ? 'Final tool result' : '',
            toolCalls: [
              {
                toolCallId,
                toolName,
                args: toolResults[toolName]?.args || {},
              },
            ],
            toolResults:
              currentStep > 0
                ? [
                    {
                      toolCallId: `call_${currentStep}`,
                      toolName,
                      result: toolResults[toolName]?.result || { success: true },
                    },
                  ]
                : [],
            finishReason: currentStep === maxSteps - 1 ? 'stop' : 'tool-calls',
            usage: { inputTokens: 10 + currentStep * 5, outputTokens: 15 + currentStep * 3 },
            warnings: [],
            logprobs: undefined,
            request: { body: '' },
            response: { messages: [], timestamp: new Date() },
            providerOptions: undefined,
          });

          currentStep++;
        }

        return {
          finishReason: 'stop',
          usage: { inputTokens: 30, outputTokens: 45 },
          text: 'Tool execution completed',
          steps: [],
          toolCalls: steps.flatMap(step => step.toolCalls),
          toolResults: steps.flatMap(step => step.toolResults),
        };
      }

      async doStream() {
        return {
          stream: {
            [Symbol.asyncIterator]: async function* () {
              yield { type: 'text', text: 'Tool ' };
              yield { type: 'text', text: 'execution ' };
              yield { type: 'text', text: 'streaming' };
              yield {
                type: 'finish',
                finishReason: 'stop',
                usage: { inputTokens: 20, outputTokens: 30 },
              };
            },
          },
        };
      }
    };
  }
}

/**
 * Vercel AI SDK v5 simulateReadableStream Factory
 * Creates predictable streams for testing following official Vercel AI SDK v5 patterns
 */
export class StreamSimulationFactory {
  /**
   * Create a basic text stream
   */
  static createTextStream(
    chunks: string[],
    options: {
      initialDelayInMs?: number;
      chunkDelayInMs?: number;
    } = {},
  ) {
    const { initialDelayInMs = 0, chunkDelayInMs = 0 } = options;

    return new ReadableStream({
      async start(controller) {
        if (initialDelayInMs > 0) {
          await new Promise(resolve => setTimeout(resolve, initialDelayInMs));
        }

        for (const chunk of chunks) {
          if (chunkDelayInMs > 0) {
            await new Promise(resolve => setTimeout(resolve, chunkDelayInMs));
          }
          controller.enqueue({ type: 'text', text: chunk });
        }

        controller.enqueue({
          type: 'finish',
          finishReason: 'stop',
          usage: { inputTokens: chunks.length * 2, outputTokens: chunks.length * 3 },
        });

        controller.close();
      },
    });
  }

  /**
   * Create a data stream protocol stream
   */
  static createDataProtocolStream(
    data: string[],
    options: {
      includeMetadata?: boolean;
      finishReason?: string;
    } = {},
  ) {
    const { includeMetadata = true, finishReason = 'stop' } = options;

    const chunks = [
      ...data.map(
        item => `0:"${item}"
`,
      ),
      ...(includeMetadata
        ? [
            `e:{"finishReason":"${finishReason}","usage":{"promptTokens":20,"completionTokens":50}}
`,
            `d:{"finishReason":"${finishReason}","usage":{"promptTokens":20,"completionTokens":50}}
`,
          ]
        : []),
    ];

    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });
  }

  /**
   * Create an object streaming simulation
   */
  static createObjectStream(objectChunks: string[], schema?: z.ZodSchema) {
    return new ReadableStream({
      start(controller) {
        for (const chunk of objectChunks) {
          controller.enqueue({ type: 'text', text: chunk });
        }

        controller.enqueue({
          type: 'finish',
          finishReason: 'stop',
          usage: { inputTokens: 15, outputTokens: 25 },
        });

        controller.close();
      },
    });
  }
}

/**
 * AI SDK Function Mockers
 * Provides consistent mocking patterns for all AI SDK functions
 */
export class AISDKMocker {
  /**
   * Mock generateText with Vercel AI SDK v5 patterns
   */
  static mockGenerateText(mockModel: any) {
    return vi.fn(async (options: any) => {
      // Ensure mockModel has doGenerate method or provide default
      const result = mockModel?.doGenerate
        ? await mockModel.doGenerate(options)
        : {
            content: [{ type: 'text', text: 'Mock response' }],
            finishReason: 'stop',
            usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
            warnings: [],
          };

      // Extract text from content array (v5 format)
      const text =
        result.content?.find((c: any) => c.type === 'text')?.text || result.text || 'Mock response';

      return {
        // v5 required fields
        content: result.content || [{ type: 'text', text }],
        text,
        reasoning: result.reasoning || [],
        reasoningText: result.reasoningText,
        files: result.files || [],
        sources: result.sources || [],
        toolCalls: result.toolCalls || [],
        toolResults: result.toolResults || [],
        staticToolCalls: result.staticToolCalls || [],
        dynamicToolCalls: result.dynamicToolCalls || [],
        staticToolResults: result.staticToolResults || [],
        dynamicToolResults: result.dynamicToolResults || [],
        finishReason: result.finishReason || 'stop',
        usage: result.usage || { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        totalUsage: result.totalUsage || { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        warnings: result.warnings || [],
        request: { body: JSON.stringify(options) },
        response: {
          id: 'mock-response-id',
          modelId: mockModel?.modelId || 'mock-model',
          timestamp: new Date(),
          messages: [],
        },
        providerMetadata: result.providerMetadata,
        steps: result.steps || [],
        experimental_output: result.experimental_output,
        experimental_telemetry: options.experimental_telemetry,
      };
    });
  }

  /**
   * Mock streamText with Vercel AI SDK v5 patterns
   */
  static mockStreamText(mockModel: any) {
    return vi.fn(async (options: any) => {
      const { stream } = await mockModel.doStream(options);
      let fullText = '';
      const chunks: string[] = [];

      for await (const chunk of stream as any) {
        if (chunk.type === 'text') {
          chunks.push(chunk.text);
          fullText += chunk.text;
        }
      }

      return {
        textStream: (async function* () {
          for (const chunk of chunks) {
            yield chunk;
          }
        })(),
        text: fullText,
        usage: { inputTokens: 15, outputTokens: 25 },
        finishReason: 'stop',
        warnings: [],
        rawCall: { rawPrompt: options.prompt, rawSettings: {} },
        request: { body: JSON.stringify(options) },
        response: {
          id: 'mock-response-id',
          modelId: mockModel?.modelId || 'mock-model',
          messages: [],
          timestamp: new Date(),
        },
        toolCalls: [],
        toolResults: [],
        steps: [],
        experimental_telemetry: options.experimental_telemetry,
        providerOptions: undefined,
      };
    });
  }

  /**
   * Mock generateObject with Vercel AI SDK v5 patterns
   */
  static mockGenerateObject(mockModel: any) {
    return vi.fn(async (options: any) => {
      const result = await mockModel.doGenerate(options);
      const parsedObject = JSON.parse(result.text);

      return {
        object: parsedObject,
        usage: result.usage,
        finishReason: result.finishReason,
        warnings: [],
        rawCall: { rawPrompt: options.prompt, rawSettings: {} },
        request: { body: JSON.stringify(options) },
        response: {
          id: 'mock-response-id',
          modelId: mockModel?.modelId || 'mock-model',
          messages: [],
          timestamp: new Date(),
        },
        logprobs: undefined,
        providerOptions: undefined,
        experimental_telemetry: options.experimental_telemetry,
      };
    });
  }
}

/**
 * Test Assertion Helpers
 * Common assertion patterns for AI SDK testing
 */
export class AITestAssertions {
  /**
   * Assert telemetry data structure
   */
  static assertTelemetryData(result: any, expectedMetadata: Record<string, any>) {
    if (!result.experimental_telemetry) {
      throw new Error('experimental_telemetry is not defined');
    }
    if (!result.experimental_telemetry.isEnabled) {
      throw new Error('experimental_telemetry.isEnabled is not truthy');
    }

    for (const [key, value] of Object.entries(expectedMetadata)) {
      if (result.experimental_telemetry.metadata[key] !== value) {
        throw new Error(
          `Expected metadata[${key}] to be ${value}, got ${result.experimental_telemetry.metadata[key]}`,
        );
      }
    }
  }

  /**
   * Assert tool call structure
   */
  static assertToolCalls(result: any, expectedCalls: Array<{ toolName: string; args?: any }>) {
    if (!result.toolCalls || result.toolCalls.length !== expectedCalls.length) {
      throw new Error(
        `Expected ${expectedCalls.length} tool calls, got ${result.toolCalls?.length || 0}`,
      );
    }

    expectedCalls.forEach((expected, index) => {
      if (result.toolCalls[index].toolName !== expected.toolName) {
        throw new Error(
          `Expected tool call ${index} to have name ${expected.toolName}, got ${result.toolCalls[index].toolName}`,
        );
      }
      if (
        expected.args &&
        JSON.stringify(result.toolCalls[index].args) !== JSON.stringify(expected.args)
      ) {
        throw new Error(
          `Expected tool call ${index} args to match ${JSON.stringify(expected.args)}, got ${JSON.stringify(result.toolCalls[index].args)}`,
        );
      }
    });
  }

  /**
   * Assert streaming behavior
   */
  static async assertStreamChunks(stream: AsyncIterable<string>, expectedChunks: string[]) {
    const actualChunks: string[] = [];

    for await (const chunk of stream) {
      actualChunks.push(chunk);
    }

    if (JSON.stringify(actualChunks) !== JSON.stringify(expectedChunks)) {
      throw new Error(
        `Expected chunks ${JSON.stringify(expectedChunks)}, got ${JSON.stringify(actualChunks)}`,
      );
    }
  }

  /**
   * Assert usage metrics
   */
  static assertUsageMetrics(
    result: any,
    expectedUsage: { inputTokens: number; outputTokens: number },
  ) {
    if (!result.usage) {
      throw new Error('result.usage is not defined');
    }
    if (result.usage.inputTokens !== expectedUsage.inputTokens) {
      throw new Error(
        `Expected inputTokens to be ${expectedUsage.inputTokens}, got ${result.usage.inputTokens}`,
      );
    }
    if (result.usage.outputTokens !== expectedUsage.outputTokens) {
      throw new Error(
        `Expected outputTokens to be ${expectedUsage.outputTokens}, got ${result.usage.outputTokens}`,
      );
    }
  }
}

/**
 * Vercel AI SDK v5 Test Patterns
 * Common test patterns following official Vercel AI SDK v5 documentation
 */
export const VercelAISDKTestPatterns = {
  /**
   * Basic text generation test pattern
   */
  async basicTextGeneration(mockModel: any, prompt: string = 'Test prompt') {
    const { generateText } = await import('ai');
    const mockGenerateText = AISDKMocker.mockGenerateText(mockModel);

    // Replace the actual function with our mock
    vi.mocked(generateText).mockImplementation(mockGenerateText);

    const result = await generateText({
      model: mockModel,
      prompt,
    });

    return result;
  },

  /**
   * Telemetry testing pattern
   */
  async telemetryTesting(mockModel: any, metadata: Record<string, any>) {
    const { generateText } = await import('ai');
    const mockGenerateText = AISDKMocker.mockGenerateText(mockModel);

    vi.mocked(generateText).mockImplementation(mockGenerateText);

    const result = await generateText({
      model: mockModel,
      prompt: 'Telemetry test',
      experimental_telemetry: {
        isEnabled: true,
        metadata,
      },
    });

    AITestAssertions.assertTelemetryData(result, metadata);
    return result;
  },

  /**
   * Multi-step tool testing pattern
   */
  async multiStepToolTesting(mockModel: any, tools: Record<string, any>, maxSteps: number = 3) {
    const { generateText } = await import('ai');
    const mockGenerateText = AISDKMocker.mockGenerateText(mockModel);

    vi.mocked(generateText).mockImplementation(mockGenerateText);

    const result = await generateText({
      model: mockModel,
      tools,
      prompt: 'Multi-step tool test',
    });

    if (!result.steps) {
      throw new Error('result.steps is not defined');
    }
    if (result.steps.length <= 0) {
      throw new Error('result.steps.length should be greater than 0');
    }
    return result;
  },
};
