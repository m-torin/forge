import { describe, expect, vi } from 'vitest';

// Mock dependencies for examples
vi.mock('ai', () => ({
  tool: vi.fn(),
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock('@upstash/vector', () => ({
  Index: vi.fn(),
}));

describe('examples Module Imports', () => {
  test('should import example files', async () => {
    const modules = [() => import('#/examples/upstash-rag-examples')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });
});
