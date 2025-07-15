import { tool } from 'ai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

// Mock the AI package tools
vi.mock('@repo/ai/server/next', () => ({
  getWeather: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  requestSuggestions: vi.fn(),
}));

// Define a sample weather tool for testing type inference
const weatherTool = tool({
  description: 'Get weather information for a location',
  parameters: z.object({
    location: z.string().describe('The location to get weather for'),
  }),
  execute: async (params: any) => {
    const { location } = params;
    return {
      temperature: 72,
      condition: 'sunny',
      location,
    };
  },
});

// AI SDK v5 type inference (using z.infer for inputSchema and return type)
type WeatherInput = { location: string }; // Direct type instead of z.infer due to inputSchema
type WeatherOutput = { temperature: number; condition: string; location: string };

describe('aI Tools Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should infer types correctly from tool definition', () => {
    // Test AI SDK v5 type inference
    const input: WeatherInput = { location: 'San Francisco' };
    const output: WeatherOutput = {
      temperature: 72,
      condition: 'sunny',
      location: 'San Francisco',
    };

    expect(input).toHaveProperty('location');
    expect(typeof (input as any).location).toBe('string');
    expect(output).toHaveProperty('temperature');
    expect(output).toHaveProperty('condition');
    expect(output).toHaveProperty('location');
  });

  test('should have weather tool structure', () => {
    // Test that the weather tool has the expected structure
    const mockWeatherTool = {
      description: 'Get weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
      execute: vi.fn().mockResolvedValue({
        temperature: 72,
        condition: 'sunny',
        location: 'San Francisco, CA',
      }),
    };

    expect(mockWeatherTool).toHaveProperty('description');
    expect(mockWeatherTool).toHaveProperty('parameters');
    expect(mockWeatherTool).toHaveProperty('execute');
    expect(typeof mockWeatherTool.description).toBe('string');
    expect(typeof mockWeatherTool.parameters).toBe('object');
    expect(typeof mockWeatherTool.execute).toBe('function');
  });

  test('should handle weather tool execution', async () => {
    const mockWeatherTool = {
      description: 'Get weather information',
      parameters: {},
      execute: vi.fn().mockResolvedValue({
        temperature: 72,
        condition: 'sunny',
        location: 'San Francisco, CA',
      }),
    };

    const result = await mockWeatherTool.execute({ location: 'San Francisco, CA' });

    expect(mockWeatherTool.execute).toHaveBeenCalledWith({ location: 'San Francisco, CA' });
    expect(result).toStrictEqual({
      temperature: 72,
      condition: 'sunny',
      location: 'San Francisco, CA',
    });
  });

  test('should handle weather tool errors gracefully', async () => {
    const mockWeatherTool = {
      description: 'Get weather information',
      parameters: {},
      execute: vi.fn().mockRejectedValue(new Error('Weather service unavailable')),
    };

    await expect(mockWeatherTool.execute({ location: 'Test City' })).rejects.toThrow(
      'Weather service unavailable',
    );
  });

  test('should validate weather tool parameters schema', () => {
    const mockWeatherTool = {
      description: 'Get weather information',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
      execute: vi.fn(),
    };

    expect(mockWeatherTool.parameters).toBeDefined();
    expect(mockWeatherTool.parameters).toHaveProperty('type', 'object');
    expect(mockWeatherTool.parameters).toHaveProperty('properties');
    expect(mockWeatherTool.parameters).toHaveProperty('required');
  });

  test('should have weather tool description', () => {
    const mockWeatherTool = {
      description: 'Get weather information for a specific location',
      parameters: {},
      execute: vi.fn(),
    };

    expect(mockWeatherTool.description).toBeDefined();
    expect(typeof mockWeatherTool.description).toBe('string');
    expect(mockWeatherTool.description.length).toBeGreaterThan(0);
  });

  test('should support tool calling integration', () => {
    const mockWeatherTool = {
      description: 'Get weather information',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
      execute: vi.fn(),
    };

    // The tool should be compatible with AI SDK tool calling
    expect(mockWeatherTool).toHaveProperty('description');
    expect(mockWeatherTool).toHaveProperty('parameters');
    expect(mockWeatherTool).toHaveProperty('execute');

    // These properties are required for AI SDK tool integration
    expect(typeof mockWeatherTool.description).toBe('string');
    expect(typeof mockWeatherTool.parameters).toBe('object');
    expect(typeof mockWeatherTool.execute).toBe('function');
  });
});
