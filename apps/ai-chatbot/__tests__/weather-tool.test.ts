import { getWeather } from '#/lib/ai/tools/utilities/get-weather';
import { describe, expect, test, vi } from 'vitest';

// Mock the AI package weather tool
vi.mock('@repo/ai/server/next', () => ({
  getWeather: vi.fn(),
}));

describe('weather Tool Migration', () => {
  test('should export getWeather from AI package', () => {
    expect(getWeather).toBeDefined();
  });

  test('should be a function', () => {
    expect(typeof getWeather).toBe('function');
  });

  test('should have the same interface as the original tool', () => {
    // The tool should have the expected structure
    expect(getWeather).toHaveProperty('description');
    expect(getWeather).toHaveProperty('inputSchema');
    expect(getWeather).toHaveProperty('execute');
  });
});
