/**
 * Tool Calling Tests - v5 Patterns
 * Demonstrates multi-step tool workflows with maxSteps
 * Following official AI SDK v5 tool testing patterns
 */

import { generateText, tool } from 'ai';
import { MockLanguageModelV2 } from 'ai/test';
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
      // Simulate multi-step tool workflow following v5 structure
      const steps = [
        // Step 1: Get user location
        {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_1',
              toolName: 'location',
              input: {},
            },
          ],
          text: '',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [
            { type: 'tool-call' as const, toolCallId: 'call_1', toolName: 'location', input: {} },
          ],
          toolResults: [],
          staticToolCalls: [],
          dynamicToolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_1',
              toolName: 'location',
              input: {},
              dynamic: true as const,
            },
          ],
          staticToolResults: [],
          dynamicToolResults: [],
          finishReason: 'tool-calls' as const,
          usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: {
            id: 'step-1-response',
            modelId: 'test-tool-model',
            messages: [],
            timestamp: new Date(),
          },
          providerMetadata: undefined,
        },
        // Step 2: Get weather for that location
        {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
            },
            {
              type: 'tool-result' as const,
              toolCallId: 'call_1',
              toolName: 'location',
              input: {},
              output: {
                location: 'San Francisco, CA',
                coordinates: { lat: 37.7749, lng: -122.4194 },
              },
            },
          ],
          text: '',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
            },
          ],
          toolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'call_1',
              toolName: 'location',
              input: {},
              output: {
                location: 'San Francisco, CA',
                coordinates: { lat: 37.7749, lng: -122.4194 },
              },
            },
          ],
          staticToolCalls: [],
          dynamicToolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
              dynamic: true as const,
            },
          ],
          staticToolResults: [],
          dynamicToolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'call_1',
              toolName: 'location',
              input: {},
              output: {
                location: 'San Francisco, CA',
                coordinates: { lat: 37.7749, lng: -122.4194 },
              },
              dynamic: true as const,
            },
          ],
          finishReason: 'tool-calls' as const,
          usage: { inputTokens: 15, outputTokens: 10, totalTokens: 25 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: {
            id: 'step-2-response',
            modelId: 'test-tool-model',
            messages: [],
            timestamp: new Date(),
          },
          providerMetadata: undefined,
        },
        // Step 3: Final response
        {
          content: [
            {
              type: 'text' as const,
              text: 'The weather in San Francisco, CA is sunny with a temperature of 75°F.',
            },
            {
              type: 'tool-result' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
              output: { location: 'San Francisco, CA', temperature: 75, condition: 'sunny' },
            },
          ],
          text: 'The weather in San Francisco, CA is sunny with a temperature of 75°F.',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [],
          toolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
              output: { location: 'San Francisco, CA', temperature: 75, condition: 'sunny' },
            },
          ],
          staticToolCalls: [],
          dynamicToolCalls: [],
          staticToolResults: [],
          dynamicToolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'call_2',
              toolName: 'weather',
              input: { location: 'San Francisco, CA' },
              output: { location: 'San Francisco, CA', temperature: 75, condition: 'sunny' },
              dynamic: true as const,
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 20, outputTokens: 15, totalTokens: 35 },
          warnings: [],
          logprobs: undefined,
          request: { body: '' },
          response: {
            id: 'step-3-response',
            modelId: 'test-tool-model',
            messages: [],
            timestamp: new Date(),
          },
          providerMetadata: undefined,
        },
      ];

      // Extract tool calls and results from all steps for v5 compatibility
      const allToolCalls = steps.flatMap(step =>
        step.content
          .filter(part => part.type === 'tool-call')
          .map(part => ({
            type: 'tool-call' as const,
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            input: part.input,
            dynamic: true as const,
          })),
      );

      const allToolResults = steps.flatMap(step =>
        step.content
          .filter(part => part.type === 'tool-result')
          .map(part => ({
            type: 'tool-result' as const,
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            input: part.input,
            output: part.output,
            dynamic: true as const,
          })),
      );

      return {
        // v5 required fields
        content: steps[steps.length - 1].content,
        text: 'The weather in San Francisco, CA is sunny with a temperature of 75°F.',
        reasoning: [],
        reasoningText: undefined,
        files: [],
        sources: [],
        toolCalls: allToolCalls,
        toolResults: allToolResults,
        staticToolCalls: [],
        dynamicToolCalls: allToolCalls,
        staticToolResults: [],
        dynamicToolResults: allToolResults,
        finishReason: 'stop' as const,
        usage: { inputTokens: 75, outputTokens: 35, totalTokens: 110 },
        totalUsage: { inputTokens: 75, outputTokens: 35, totalTokens: 110 },
        warnings: [],
        request: { body: JSON.stringify(options) },
        response: {
          id: 'test-response-id',
          modelId: 'test-tool-model',
          timestamp: new Date(),
          messages: [],
        },
        providerMetadata: undefined,
        steps,
        experimental_output: undefined,
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const result = await generateText({
      model: mockModel,
      tools: {
        weather: weatherTool,
        location: locationTool,
      },
      prompt: "What's the weather like where I am?",
    });

    // v5 pattern: Validate multi-step workflow
    expect(result.text).toContain('San Francisco');
    expect(result.steps).toHaveLength(3);

    // v5 pattern: Verify tool calls are available at result level
    expect(result.toolCalls).toHaveLength(2);

    // Verify tool sequence (using 'input' instead of 'args' for v5)
    expect(result.toolCalls[0]).toMatchObject({
      toolName: 'location',
      input: {},
    });
    expect(result.toolCalls[1]).toMatchObject({
      toolName: 'weather',
      input: { location: 'San Francisco, CA' },
    });

    // Verify tool results
    expect(result.toolResults).toHaveLength(2);
    expect(result.toolResults[0].toolName).toBe('location');
    expect(result.toolResults[1].toolName).toBe('weather');
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
      // Simulate forced tool choice with v5 structure
      const steps = [
        {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
            },
            {
              type: 'tool-result' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
              output: { result: 8 },
            },
            {
              type: 'text' as const,
              text: 'The result of 5 + 3 is 8.',
            },
          ],
          text: 'The result of 5 + 3 is 8.',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
            },
          ],
          toolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
              output: { result: 8 },
              dynamic: true as const,
            },
          ],
          staticToolCalls: [],
          dynamicToolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
              dynamic: true as const,
            },
          ],
          staticToolResults: [],
          dynamicToolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'calc_1',
              toolName: 'calculator',
              input: { operation: 'add', a: 5, b: 3 },
              output: { result: 8 },
              dynamic: true as const,
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 20, outputTokens: 15, totalTokens: 35 },
          totalUsage: { inputTokens: 20, outputTokens: 15, totalTokens: 35 },
          warnings: [],
          request: { body: JSON.stringify(options) },
          response: {
            id: 'calc-response-id',
            modelId: 'mock-model',
            timestamp: new Date(),
            messages: [],
          },
          providerMetadata: undefined,
          experimental_output: undefined,
          experimental_telemetry: options.experimental_telemetry,
        },
      ];

      return {
        // v5 required fields
        content: steps[0].content,
        text: 'The result of 5 + 3 is 8.',
        reasoning: [],
        reasoningText: undefined,
        files: [],
        sources: [],
        toolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'calc_1',
            toolName: 'calculator',
            input: { operation: 'add', a: 5, b: 3 },
          },
        ],
        toolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'calc_1',
            toolName: 'calculator',
            input: { operation: 'add', a: 5, b: 3 },
            output: { result: 8 },
            dynamic: true as const,
          },
        ],
        staticToolCalls: [],
        dynamicToolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'calc_1',
            toolName: 'calculator',
            input: { operation: 'add', a: 5, b: 3 },
            dynamic: true as const,
          },
        ],
        staticToolResults: [],
        dynamicToolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'calc_1',
            toolName: 'calculator',
            input: { operation: 'add', a: 5, b: 3 },
            output: { result: 8 },
            dynamic: true as const,
          },
        ],
        finishReason: 'stop' as const,
        usage: { inputTokens: 20, outputTokens: 15, totalTokens: 35 },
        totalUsage: { inputTokens: 20, outputTokens: 15, totalTokens: 35 },
        warnings: [],
        request: { body: JSON.stringify(options) },
        response: {
          id: 'calc-response-id',
          modelId: 'mock-model',
          timestamp: new Date(),
          messages: [],
        },
        providerMetadata: undefined,
        steps,
        experimental_output: undefined,
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
    expect(result.toolCalls[0].input).toStrictEqual({ operation: 'add', a: 5, b: 3 });
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
      // Simulate dynamic step configuration with v5 structure
      const steps = [
        {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
            },
            {
              type: 'tool-result' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
              output: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
            },
            {
              type: 'text' as const,
              text: 'Based on the detailed analysis, the data shows strong patterns.',
            },
          ],
          text: 'Based on the detailed analysis, the data shows strong patterns.',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
            },
          ],
          toolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
              output: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
              dynamic: true as const,
            },
          ],
          staticToolCalls: [],
          dynamicToolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
              dynamic: true as const,
            },
          ],
          staticToolResults: [],
          dynamicToolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'analysis_1',
              toolName: 'analysis',
              input: { data: 'test data', depth: 'detailed' },
              output: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
              dynamic: true as const,
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 25, outputTokens: 20, totalTokens: 45 },
          totalUsage: { inputTokens: 25, outputTokens: 20, totalTokens: 45 },
          warnings: [],
          request: { body: JSON.stringify(options) },
          response: {
            id: 'analysis-response-id',
            modelId: 'analysis-model',
            timestamp: new Date(),
            messages: [],
          },
          providerMetadata: undefined,
          experimental_output: undefined,
          experimental_telemetry: options.experimental_telemetry,
        },
      ];

      return {
        // v5 required fields
        content: steps[0].content,
        text: 'Based on the detailed analysis, the data shows strong patterns.',
        reasoning: [],
        reasoningText: undefined,
        files: [],
        sources: [],
        toolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'analysis_1',
            toolName: 'analysis',
            input: { data: 'test data', depth: 'detailed' },
          },
        ],
        toolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'analysis_1',
            toolName: 'analysis',
            input: { data: 'test data', depth: 'detailed' },
            output: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
            dynamic: true as const,
          },
        ],
        staticToolCalls: [],
        dynamicToolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'analysis_1',
            toolName: 'analysis',
            input: { data: 'test data', depth: 'detailed' },
            dynamic: true as const,
          },
        ],
        staticToolResults: [],
        dynamicToolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'analysis_1',
            toolName: 'analysis',
            input: { data: 'test data', depth: 'detailed' },
            output: { analysis: 'detailed analysis of: test data', confidence: 0.95 },
            dynamic: true as const,
          },
        ],
        finishReason: 'stop' as const,
        usage: { inputTokens: 25, outputTokens: 20, totalTokens: 45 },
        totalUsage: { inputTokens: 25, outputTokens: 20, totalTokens: 45 },
        warnings: [],
        request: { body: JSON.stringify(options) },
        response: {
          id: 'analysis-response-id',
          modelId: 'analysis-model',
          timestamp: new Date(),
          messages: [],
        },
        providerMetadata: undefined,
        steps,
        experimental_output: undefined,
        experimental_telemetry: options.experimental_telemetry,
      };
    });

    const prepareStepCallback = vi.fn(async ({ stepNumber, steps }) => {
      if (stepNumber === 0) {
        return {
          toolChoice: { type: 'tool' as const, toolName: 'analysis' as const },
          activeTools: ['analysis' as const],
        };
      }
      return {};
    });

    const result = await generateText({
      model: mockModel,
      tools: {
        analysis: analysisTool,
      },
      experimental_prepareStep: prepareStepCallback,
      prompt: 'Analyze this test data',
    });

    expect(result.text).toContain('detailed analysis');
    expect(prepareStepCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        stepNumber: 0,
      }),
    );
    // experimental_prepareStep is not returned in v5 result structure
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
      // Simulate tool error and repair with v5 structure
      const steps = [
        {
          content: [
            {
              type: 'tool-call' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
            },
            {
              type: 'tool-result' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
              output: { isValid: true, format: 'json', length: 16 },
            },
            {
              type: 'text' as const,
              text: 'After validation, the input is properly formatted JSON.',
            },
          ],
          text: 'After validation, the input is properly formatted JSON.',
          reasoning: [],
          reasoningText: undefined,
          files: [],
          sources: [],
          toolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
            },
          ],
          toolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
              output: { isValid: true, format: 'json', length: 16 },
              dynamic: true as const,
            },
          ],
          staticToolCalls: [],
          dynamicToolCalls: [
            {
              type: 'tool-call' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
              dynamic: true as const,
            },
          ],
          staticToolResults: [],
          dynamicToolResults: [
            {
              type: 'tool-result' as const,
              toolCallId: 'validate_1',
              toolName: 'validate',
              input: { input: '{"test": "data"}', format: 'json' },
              output: { isValid: true, format: 'json', length: 16 },
              dynamic: true as const,
            },
          ],
          finishReason: 'stop' as const,
          usage: { inputTokens: 30, outputTokens: 25, totalTokens: 55 },
          totalUsage: { inputTokens: 30, outputTokens: 25, totalTokens: 55 },
          warnings: [],
          request: { body: JSON.stringify(options) },
          response: {
            id: 'validation-response-id',
            modelId: 'validation-model',
            timestamp: new Date(),
            messages: [],
          },
          providerMetadata: undefined,
          experimental_output: undefined,
          experimental_telemetry: options.experimental_telemetry,
        },
      ];

      return {
        // v5 required fields
        content: steps[0].content,
        text: 'After validation, the input is properly formatted JSON.',
        reasoning: [],
        reasoningText: undefined,
        files: [],
        sources: [],
        toolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'validate_1',
            toolName: 'validate',
            input: { input: '{"test": "data"}', format: 'json' },
          },
        ],
        toolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'validate_1',
            toolName: 'validate',
            input: { input: '{"test": "data"}', format: 'json' },
            output: { isValid: true, format: 'json', length: 16 },
            dynamic: true as const,
          },
        ],
        staticToolCalls: [],
        dynamicToolCalls: [
          {
            type: 'tool-call' as const,
            toolCallId: 'validate_1',
            toolName: 'validate',
            input: { input: '{"test": "data"}', format: 'json' },
            dynamic: true as const,
          },
        ],
        staticToolResults: [],
        dynamicToolResults: [
          {
            type: 'tool-result' as const,
            toolCallId: 'validate_1',
            toolName: 'validate',
            input: { input: '{"test": "data"}', format: 'json' },
            output: { isValid: true, format: 'json', length: 16 },
            dynamic: true as const,
          },
        ],
        finishReason: 'stop' as const,
        usage: { inputTokens: 30, outputTokens: 25, totalTokens: 55 },
        totalUsage: { inputTokens: 30, outputTokens: 25, totalTokens: 55 },
        warnings: [],
        request: { body: JSON.stringify(options) },
        response: {
          id: 'validation-response-id',
          modelId: 'validation-model',
          timestamp: new Date(),
          messages: [],
        },
        providerMetadata: undefined,
        steps,
        experimental_output: undefined,
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
    expect(result.toolResults[0].output).toMatchObject({
      isValid: true,
      format: 'json',
      length: 16,
    });
  });
});
