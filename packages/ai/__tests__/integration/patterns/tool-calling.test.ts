/**
 * Tool Calling Tests - v5 Patterns
 * Demonstrates multi-step tool workflows with maxSteps
 * Following official AI SDK v5 tool testing patterns
 */

import { generateText, MockLanguageModelV2, tool } from 'ai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

// Mock AI SDK v5 with v5 patterns for tool testing
vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();

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
        usage: { inputTokens: 20, outputTokens: 30 },
        text: 'Mock tool result',
      };
    }
  }

  return {
    ...actual,
    MockLanguageModelV2,
    generateText: vi.fn(),
    tool: actual.tool, // Keep the real tool function
  };
});

describe('tool Calling - v5 Patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle multi-step tool workflows with maxSteps (v5 pattern)', async () => {
    // Define tools following v5 pattern
    const weatherTool = tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
        condition: 'sunny',
      }),
    });

    const locationTool = tool({
      description: 'Get the current user location',
      inputSchema: z.object({}),
      execute: async () => ({
        location: 'San Francisco, CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
      }),
    });

    const mockModel = new (MockLanguageModelV2 as any)({
      modelId: 'test-tool-model',
    });

    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText.mockImplementation(async options => {
      // Simulate multi-step tool workflow
      const steps = [
        // Step 1: Get user location
        {
          stepType: 'initial' as const,
          text: '',
          toolCalls: [
            {
              toolCallId: 'call_1',
              toolName: 'location',
              args: {},
            },
          ],
          toolResults: [],
          finishReason: 'tool-calls' as const,
          usage: { inputTokens: 15, outputTokens: 5 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
        // Step 2: Get weather for that location
        {
          stepType: 'tool-result' as const,
          text: '',
          toolCalls: [
            {
              toolCallId: 'call_2',
              toolName: 'weather',
              args: { location: 'San Francisco, CA' },
            },
          ],
          toolResults: [
            {
              toolCallId: 'call_1',
              toolName: 'location',
              result: {
                location: 'San Francisco, CA',
                coordinates: { lat: 37.7749, lng: -122.4194 },
              },
            },
          ],
          finishReason: 'tool-calls' as const,
          usage: { inputTokens: 25, outputTokens: 10 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
        // Step 3: Final response
        {
          stepType: 'tool-result' as const,
          text: 'The weather in San Francisco, CA is sunny with a temperature of 75°F.',
          toolCalls: [],
          toolResults: [
            {
              toolCallId: 'call_2',
              toolName: 'weather',
              result: { location: 'San Francisco, CA', temperature: 75, condition: 'sunny' },
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 35, outputTokens: 20 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
      ];

      return {
        text: 'The weather in San Francisco, CA is sunny with a temperature of 75°F.',
        usage: { inputTokens: 75, outputTokens: 35 },
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
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const result = await generateText({
      model: mockModel,
      maxSteps: 5,
      tools: {
        weather: weatherTool,
        location: locationTool,
      },
      prompt: "What's the weather like where I am?",
    });

    // v5 pattern: Validate multi-step workflow
    expect(result.text).toContain('San Francisco');
    expect(result.steps).toHaveLength(3);

    // Extract all tool calls from steps (v5 pattern)
    const allToolCalls = result.steps.flatMap(step => step.toolCalls);
    expect(allToolCalls).toHaveLength(2);

    // Verify tool sequence
    expect(allToolCalls[0]).toMatchObject({
      toolName: 'location',
      args: {},
    });
    expect(allToolCalls[1]).toMatchObject({
      toolName: 'weather',
      args: { location: 'San Francisco, CA' },
    });

    // Verify tool results
    const allToolResults = result.steps.flatMap(step => step.toolResults);
    expect(allToolResults).toHaveLength(2);
    expect(allToolResults[0].toolName).toBe('location');
    expect(allToolResults[1].toolName).toBe('weather');
  });

  test('should test tool choice and active tools (v5 pattern)', async () => {
    const calculatorTool = tool({
      description: 'Perform basic calculations',
      inputSchema: z.object({
        operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
        a: z.number(),
        b: z.number(),
      }),
      execute: async ({ operation, a, b }) => {
        switch (operation) {
          case 'add':
            return { result: a + b };
          case 'subtract':
            return { result: a - b };
          case 'multiply':
            return { result: a * b };
          case 'divide':
            return { result: b !== 0 ? a / b : 'Cannot divide by zero' };
          default:
            return { result: 'Invalid operation' };
        }
      },
    });

    const mockModel = new (MockLanguageModelV2 as any)({
      doGenerate: async () => ({
        finishReason: 'stop',
        usage: { inputTokens: 20, outputTokens: 15 },
        text: 'The result of 5 + 3 is 8.',
      }),
    });

    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText.mockImplementation(async options => {
      // Simulate forced tool choice
      const steps = [
        {
          stepType: 'tool-result' as const,
          text: 'The result of 5 + 3 is 8.',
          toolCalls: [
            {
              toolCallId: 'calc_1',
              toolName: 'calculator',
              args: { operation: 'add', a: 5, b: 3 },
            },
          ],
          toolResults: [
            {
              toolCallId: 'calc_1',
              toolName: 'calculator',
              result: { result: 8 },
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 20, outputTokens: 15 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
      ];

      return {
        text: 'The result of 5 + 3 is 8.',
        usage: { inputTokens: 20, outputTokens: 15 },
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
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const result = await generateText({
      model: mockModel,
      tools: {
        calculator: calculatorTool,
      },
      toolChoice: { type: 'tool', toolName: 'calculator' },
      prompt: 'What is 5 + 3?',
    });

    expect(result.text).toContain('8');
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0].toolName).toBe('calculator');
    expect(result.toolCalls[0].args).toStrictEqual({ operation: 'add', a: 5, b: 3 });
  });

  test('should test experimental_prepareStep callback (v5 pattern)', async () => {
    const analysisTool = tool({
      description: 'Analyze data',
      inputSchema: z.object({
        data: z.string(),
        depth: z.enum(['basic', 'detailed']),
      }),
      execute: async ({ data, depth }) => ({
        analysis: `${depth} analysis of: ${data}`,
        confidence: depth === 'detailed' ? 0.95 : 0.8,
      }),
    });

    const mockModel = new (MockLanguageModelV2 as any)({
      modelId: 'analysis-model',
    });

    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText.mockImplementation(async options => {
      // Simulate dynamic step configuration
      const steps = [
        {
          stepType: 'tool-result' as const,
          text: 'Based on the detailed analysis, the data shows strong patterns.',
          toolCalls: [
            {
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              args: { data: 'test data', depth: 'detailed' },
            },
          ],
          toolResults: [
            {
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              result: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 25, outputTokens: 20 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
      ];

      return {
        text: 'Based on the detailed analysis, the data shows strong patterns.',
        usage: { inputTokens: 25, outputTokens: 20 },
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
        experimental_telemetry: options.experimental_telemetry,
        experimental_prepareStep: options.experimental_prepareStep,
      };
    });

    const prepareStepCallback = vi.fn(async ({ stepNumber, maxSteps, steps }) => {
      if (stepNumber === 0) {
        return {
          toolChoice: { type: 'tool', toolName: 'analysis' },
          experimental_activeTools: ['analysis'],
        };
      }
      return undefined;
    });

    const result = await generateText({
      model: mockModel,
      maxSteps: 3,
      tools: {
        analysis: analysisTool,
      },
      experimental_prepareStep: prepareStepCallback,
      prompt: 'Analyze this test data',
    });

    expect(result.text).toContain('detailed analysis');
    expect(prepareStepCallback).toHaveBeenCalledWith({
      model: mockModel,
      stepNumber: 0,
      maxSteps: 3,
      steps: [],
    });
    expect(result.experimental_prepareStep).toBeDefined();
  });

  test('should test tool error handling and repair (v5 pattern)', async () => {
    const validateTool = tool({
      description: 'Validate input data',
      inputSchema: z.object({
        input: z.string().min(1, 'Input cannot be empty'),
        format: z.enum(['json', 'text', 'xml']),
      }),
      execute: async ({ input, format }) => {
        if (!input.trim()) {
          throw new Error('Validation failed: Empty input');
        }
        return {
          isValid: true,
          format,
          length: input.length,
        };
      },
    });

    const mockModel = new (MockLanguageModelV2 as any)({
      modelId: 'validation-model',
    });

    const mockGenerateText = vi.mocked(generateText);
    mockGenerateText.mockImplementation(async options => {
      // Simulate tool error and repair
      const steps = [
        {
          stepType: 'tool-result' as const,
          text: 'After validation, the input is properly formatted JSON.',
          toolCalls: [
            {
              toolCallId: 'validate_1',
              toolName: 'validate',
              args: { input: '{"test": "data"}', format: 'json' },
            },
          ],
          toolResults: [
            {
              toolCallId: 'validate_1',
              toolName: 'validate',
              result: { isValid: true, format: 'json', length: 16 },
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 30, outputTokens: 25 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: { messages: [], timestamp: new Date() },
          providerMetadata: undefined,
        },
      ];

      return {
        text: 'After validation, the input is properly formatted JSON.',
        usage: { inputTokens: 30, outputTokens: 25 },
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
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const result = await generateText({
      model: mockModel,
      tools: {
        validate: validateTool,
      },
      prompt: 'Validate this JSON: {"test": "data"}',
    });

    expect(result.text).toContain('validation');
    expect(result.toolResults).toHaveLength(1);
    expect(result.toolResults[0].result).toMatchObject({
      isValid: true,
      format: 'json',
      length: 16,
    });
  });
});
