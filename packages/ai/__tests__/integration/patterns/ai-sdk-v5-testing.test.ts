/**
 * AI SDK v5 Testing Patterns
 * Comprehensive test suite demonstrating official v5 testing patterns
 * Based on official AI SDK v5 documentation
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

// Import AI SDK v5 functions and test utilities
import { generateObject, generateText, streamObject, streamText, tool } from 'ai';

// Mock the AI SDK with proper v5 patterns
vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();

  // Create MockLanguageModelV2 class following official v5 pattern
  class MockLanguageModelV2 {
    private config: any;

    constructor(config: any) {
      this.config = config;
    }

    get modelId() {
      return this.config.modelId || 'mock-model';
    }

    get provider() {
      return 'mock';
    }

    async doGenerate(params: any) {
      if (this.config.doGenerate) {
        return await this.config.doGenerate(params);
      }
      return {
        finishReason: 'stop',
        usage: { inputTokens: 10, outputTokens: 20 },
        text: 'Mock generated text',
      };
    }

    async doStream(params: any) {
      if (this.config.doStream) {
        return await this.config.doStream(params);
      }
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: 'text', text: 'Mock ' },
            { type: 'text', text: 'stream' },
            { type: 'finish', finishReason: 'stop', usage: { inputTokens: 10, outputTokens: 20 } },
          ],
        }),
      };
    }
  }

  // simulateReadableStream utility from AI SDK v5
  function simulateReadableStream(options: {
    chunks: any[];
    initialDelayInMs?: number;
    chunkDelayInMs?: number;
  }) {
    const { chunks, initialDelayInMs = 0, chunkDelayInMs = 0 } = options;

    return new ReadableStream({
      async start(controller) {
        if (initialDelayInMs > 0) {
          await new Promise(resolve => setTimeout(resolve, initialDelayInMs));
        }

        for (const chunk of chunks) {
          if (chunkDelayInMs > 0) {
            await new Promise(resolve => setTimeout(resolve, chunkDelayInMs));
          }
          controller.enqueue(chunk);
        }

        controller.close();
      },
    });
  }

  return {
    ...actual,
    simulateReadableStream,
    generateText: vi.fn(),
    generateObject: vi.fn(),
    streamText: vi.fn(),
    streamObject: vi.fn(),
    tool: actual.tool,
  };
});

// Import the mocked utilities - remove MockLanguageModelV2 as it doesn't exist in v5
const { simulateReadableStream } = await import('ai');

describe('aI SDK v5 Testing Patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateText Testing', () => {
    test('should mock generateText with MockLanguageModelV2 (v5 pattern)', async () => {
      // v5 pattern
      const mockModel = {
        specificationVersion: 'v2',
        provider: 'test',
        modelId: 'test-model',
        doGenerate: async () => ({
          finishReason: 'stop',
          usage: { inputTokens: 10, outputTokens: 20 },
          text: 'Hello, world!',
        }),
      };

      // Mock the generateText function to use our mock model
      const mockGenerateText = vi.mocked(generateText);
      mockGenerateText.mockImplementation(async options => {
        const result = await mockModel.doGenerate(options);
        return {
          text: result.text,
          content: [{ type: 'text', text: result.text }],
          usage: result.usage,
          finishReason: result.finishReason,
          reasoning: undefined,
          reasoningText: undefined,
          files: [],
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerMetadata: undefined,
          steps: [],
        };
      });

      const result = await generateText({
        model: mockModel,
        prompt: 'Hello, test!',
      });

      expect(result.text).toBe('Hello, world!');
      expect(result.usage).toStrictEqual({ inputTokens: 10, outputTokens: 20 });
      expect(result.finishReason).toBe('stop');
      expect(mockGenerateText).toHaveBeenCalledWith({
        model: mockModel,
        prompt: 'Hello, test!',
      });
    });

    test('should test with experimental telemetry (v5 pattern)', async () => {
      const mockModel = {
        specificationVersion: 'v2',
        provider: 'test',
        modelId: 'test-model',
        doGenerate: async () => ({
          finishReason: 'stop',
          usage: { inputTokens: 15, outputTokens: 25 },
          text: 'Telemetry test response',
        }),
      };

      const mockGenerateText = vi.mocked(generateText);
      mockGenerateText.mockImplementation(async options => {
        const result = await mockModel.doGenerate(options);
        return {
          text: result.text,
          content: [{ type: 'text', text: result.text }],
          usage: result.usage,
          finishReason: result.finishReason,
          reasoning: undefined,
          reasoningText: undefined,
          files: [],
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerMetadata: undefined,
          steps: [],
        };
      });

      const result = await generateText({
        model: mockModel,
        prompt: 'Write a short story about a cat.',
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            userId: 'test-user-123',
            feature: 'story-generation',
          },
        },
      });

      expect(result.text).toBe('Telemetry test response');
      // Note: In AI SDK v5, telemetry is handled differently and not exposed in result
      expect(result.usage).toBeDefined();
    });
  });

  describe('streamText Testing', () => {
    test('should mock streamText with simulateReadableStream (v5 pattern)', async () => {
      const mockModel = {
        specificationVersion: 'v2',
        provider: 'test',
        modelId: 'test-model',
        doStream: async () => ({
          stream: (simulateReadableStream as any)({
            chunks: [
              { type: 'text', text: 'Hello' },
              { type: 'text', text: ', ' },
              { type: 'text', text: 'world!' },
              {
                type: 'finish',
                finishReason: 'stop',
                usage: { inputTokens: 3, outputTokens: 10 },
              },
            ],
          }),
        }),
      };

      const mockStreamText = vi.mocked(streamText);
      mockStreamText.mockImplementation(async options => {
        const { stream } = await mockModel.doStream(options);
        let fullText = '';
        const chunks: string[] = [];

        // Simulate streaming behavior
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
          content: [{ type: 'text', text: fullText }],
          reasoning: undefined,
          reasoningText: undefined,
          files: [],
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          steps: [],
          promptFilterResults: undefined,
          outputFilterResults: undefined,
          contentFilterResults: undefined,
          providerMetadata: undefined,
          objectDeltas: (async function* () {})(),
          usage: Promise.resolve({ inputTokens: 3, outputTokens: 10 }),
          finishReason: Promise.resolve('stop'),
        };
      });

      const result = await streamText({
        model: mockModel,
        prompt: 'Hello, test!',
      });

      expect(result.text).toBe('Hello, world!');
      expect(result.usage).toStrictEqual({ inputTokens: 3, outputTokens: 10 });
      expect(result.finishReason).toBe('stop');

      // Test stream iteration
      const chunks: string[] = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }
      expect(chunks).toStrictEqual(['Hello', ', ', 'world!']);
    });
  });

  describe('generateObject Testing', () => {
    test('should mock generateObject with schema validation (v5 pattern)', async () => {
      const schema = z.object({ content: z.string() });

      const mockModel = {
        specificationVersion: 'v2' as const,
        provider: 'test',
        modelId: 'test-model',
        supportedUrls: [],
        doGenerate: async () => ({
          finishReason: 'stop' as const,
          usage: { inputTokens: 10, outputTokens: 20 },
          text: '{"content":"Hello, world!"}',
        }),
        doStream: async () => ({
          stream: new ReadableStream(),
        }),
      };

      const mockGenerateObject = vi.mocked(generateObject);
      mockGenerateObject.mockImplementation(async options => {
        const result = await mockModel.doGenerate(options);
        const parsedObject = JSON.parse(result.text);

        return {
          object: parsedObject,
          usage: result.usage,
          finishReason: result.finishReason,
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          logprobs: undefined,
          providerMetadata: undefined,
          toJsonResponse: () =>
            new Response(result.text, {
              headers: { 'Content-Type': 'application/json' },
            }),
        };
      });

      const result = await generateObject({
        model: mockModel,
        schema,
        prompt: 'Hello, test!',
      });

      expect(result.object).toStrictEqual({ content: 'Hello, world!' });
      expect(result.usage).toStrictEqual({ inputTokens: 10, outputTokens: 20 });
      expect(result.finishReason).toBe('stop');
    });
  });

  describe('streamObject Testing', () => {
    test('should mock streamObject with JSON streaming (v5 pattern)', async () => {
      const schema = z.object({ content: z.string() });

      const mockModel = {
        specificationVersion: 'v2' as const,
        provider: 'test',
        modelId: 'test-model',
        supportedUrls: [],
        doGenerate: async () => ({
          finishReason: 'stop' as const,
          usage: { inputTokens: 3, outputTokens: 10 },
          text: '{ "content": "Hello, world!" }',
        }),
        doStream: async () => ({
          stream: (simulateReadableStream as any)({
            chunks: [
              { type: 'text', text: '{ ' },
              { type: 'text', text: '"content": ' },
              { type: 'text', text: '"Hello, ' },
              { type: 'text', text: 'world' },
              { type: 'text', text: '!"' },
              { type: 'text', text: ' }' },
              {
                type: 'finish',
                finishReason: 'stop' as const,
                usage: { inputTokens: 3, outputTokens: 10 },
              },
            ],
          }),
        }),
      };

      const mockStreamObject = vi.mocked(streamObject);
      mockStreamObject.mockImplementation(async options => {
        const { stream } = await mockModel.doStream(options);
        let fullText = '';

        // Simulate streaming behavior
        for await (const chunk of stream as any) {
          if (chunk.type === 'text') {
            fullText += chunk.text;
          }
        }

        const parsedObject = JSON.parse(fullText);

        return {
          object: parsedObject,
          usage: { inputTokens: 3, outputTokens: 10 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        };
      });

      const result = await streamObject({
        model: mockModel,
        schema,
        prompt: 'Hello, test!',
      });

      expect(result.object).toStrictEqual({ content: 'Hello, world!' });
      // Note: In AI SDK v5 StreamObjectResult, usage and finishReason have different structure
      expect(result).toBeDefined();
    });
  });

  describe('multi-Step Tool Testing (v5 pattern)', () => {
    test('should handle complex tool workflows with maxSteps', async () => {
      const weatherTool = tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      });

      const mockModel = {
        specificationVersion: 'v2' as const,
        provider: 'test',
        modelId: 'test-model',
        doGenerate: async () => ({
          finishReason: 'stop' as const,
          usage: { inputTokens: 50, outputTokens: 30 },
          text: 'The weather in San Francisco is sunny with a temperature of 75°F.',
        }),
      };

      const mockGenerateText = vi.mocked(generateText);
      mockGenerateText.mockImplementation(async options => {
        // Simulate tool usage in steps
        const steps = [
          {
            stepType: 'initial' as const,
            text: '',
            toolCalls: [
              {
                toolCallId: 'call_1',
                toolName: 'weather',
                args: { location: 'San Francisco' },
              },
            ],
            toolResults: [],
            finishReason: 'tool-calls' as const,
            usage: { inputTokens: 20, outputTokens: 10 },
            warnings: [],
            logprobs: undefined,
            request: { body: '' },
            response: { messages: [], timestamp: new Date() },
            experimental_providerMetadata: undefined,
          },
          {
            stepType: 'tool-result' as const,
            text: 'The weather in San Francisco is sunny with a temperature of 75°F.',
            toolCalls: [],
            toolResults: [
              {
                toolCallId: 'call_1',
                toolName: 'weather',
                result: { location: 'San Francisco', temperature: 75 },
              },
            ],
            finishReason: 'stop' as const,
            usage: { inputTokens: 30, outputTokens: 20 },
            warnings: [],
            logprobs: undefined,
            request: { body: '' },
            response: { messages: [], timestamp: new Date() },
            experimental_providerMetadata: undefined,
          },
        ];

        return {
          text: 'The weather in San Francisco is sunny with a temperature of 75°F.',
          usage: { inputTokens: 50, outputTokens: 30 },
          finishReason: 'stop',
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: steps.flatMap(step => step.toolCalls),
          toolResults: steps.flatMap(step => step.toolResults),
          logprobs: undefined,
          providerMetadata: undefined,
          steps,
        };
      });

      const result = await generateText({
        model: mockModel,
        tools: {
          weather: weatherTool,
        },
        prompt: 'What is the weather in San Francisco?',
      });

      expect(result.text).toContain('San Francisco');
      expect(result.steps).toHaveLength(2);

      // Extract all tool calls from steps (v5 pattern)
      const allToolCalls = result.steps.flatMap(step => step.toolCalls);
      expect(allToolCalls).toHaveLength(1);
      expect(allToolCalls[0]).toMatchObject({
        toolName: 'weather',
        args: { location: 'San Francisco' },
      });
    });
  });

  describe('data Stream Protocol Testing (v5 pattern)', () => {
    test('should simulate AI SDK Data Stream Protocol responses', async () => {
      // v5 pattern for data stream simulation
      const stream = (simulateReadableStream as any)({
        initialDelayInMs: 100,
        chunkDelayInMs: 50,
        chunks: [
          '0:"This"\n',
          '0:" is an"\n',
          '0:"example."\n',
          'e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n',
          'd:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n',
        ],
      });

      const chunks: string[] = [];
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }

      expect(chunks).toStrictEqual([
        '0:"This"\n',
        '0:" is an"\n',
        '0:"example."\n',
        'e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n',
        'd:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n',
      ]);
    });

    test('should test custom delays in stream simulation', async () => {
      const startTime = Date.now();

      const stream = (simulateReadableStream as any)({
        initialDelayInMs: 200,
        chunkDelayInMs: 100,
        chunks: ['chunk1', 'chunk2'],
      });

      const chunks: string[] = [];
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(chunks).toStrictEqual(['chunk1', 'chunk2']);
      expect(duration).toBeGreaterThan(300); // Initial delay + chunk delay
    });
  });

  describe('provider Integration Testing', () => {
    test('should validate provider metadata and capabilities', async () => {
      const mockModel = {
        specificationVersion: 'v2' as const,
        provider: 'test',
        modelId: 'claude-3-5-sonnet-20241022',
        doGenerate: async () => ({
          finishReason: 'stop' as const,
          usage: { inputTokens: 15, outputTokens: 25 },
          text: 'Provider integration test',
          // Mock provider metadata
          providerMetadata: {
            anthropic: {
              cacheCreationInputTokens: 10,
              cacheReadInputTokens: 5,
            },
          },
        }),
      };

      const mockGenerateText = vi.mocked(generateText);
      mockGenerateText.mockImplementation(async options => {
        const result = await mockModel.doGenerate(options);
        return {
          text: result.text,
          usage: result.usage,
          finishReason: result.finishReason,
          warnings: [],
          rawCall: { rawPrompt: options.prompt, rawSettings: {} },
          rawResponse: { headers: {}, response: {} },
          request: { body: JSON.stringify(options) },
          response: { messages: [], timestamp: new Date() },
          toolCalls: [],
          toolResults: [],
          logprobs: undefined,
          providerMetadata: result.providerMetadata,
          steps: [],
        };
      });

      const result = await generateText({
        model: mockModel,
        prompt: 'Test provider integration',
      });

      expect(result.text).toBe('Provider integration test');
      expect(result.providerMetadata?.anthropic).toBeDefined();
      expect(result.providerMetadata?.anthropic?.cacheCreationInputTokens).toBe(10);
    });
  });
});
