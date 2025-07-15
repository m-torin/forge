import { artifactModel, chatModel, reasoningModel, titleModel } from '#/lib/ai/models';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('test Models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chat Model', () => {
    test('should be defined', () => {
      expect(chatModel).toBeDefined();
    });

    test('should have doGenerate method', () => {
      expect(typeof chatModel.doGenerate).toBe('function');
    });

    test('should have doStream method', () => {
      expect(typeof chatModel.doStream).toBe('function');
    });

    test('should generate text response', async () => {
      const result = await chatModel.doGenerate({ prompt: 'Hello' as any });

      expect(result).toBeDefined();
      expect(result.finishReason).toBe('stop');
      expect(result.usage).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBeTruthy();
    });

    test('should stream text response', async () => {
      const result = await chatModel.doStream({ prompt: 'Hello' as any });

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
    });

    test('should emit v5 streaming lifecycle events', async () => {
      const result = await titleModel.doStream({ prompt: 'Generate title' as any });
      const chunks: any[] = [];

      // Collect all chunks from the stream
      const reader = result.stream.getReader();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          chunks.push(value);
        }
      }

      // Verify v5 streaming pattern: start -> delta -> end -> finish
      expect(chunks.length).toBeGreaterThan(0);

      // Check for text-start event
      const textStart = chunks.find(chunk => chunk.type === 'text-start');
      expect(textStart).toBeDefined();
      expect(textStart?.id).toBeDefined();

      // Check for text-delta events
      const textDeltas = chunks.filter(chunk => chunk.type === 'text-delta');
      expect(textDeltas.length).toBeGreaterThan(0);
      textDeltas.forEach(delta => {
        expect(delta.id).toBeDefined();
        expect(delta.delta).toBeDefined();
        expect(typeof delta.delta).toBe('string');
      });

      // Check for text-end event
      const textEnd = chunks.find(chunk => chunk.type === 'text-end');
      expect(textEnd).toBeDefined();
      expect(textEnd?.id).toBeDefined();

      // Check for finish event
      const finish = chunks.find(chunk => chunk.type === 'finish');
      expect(finish).toBeDefined();
      expect(finish?.finishReason).toBe('stop');
      expect(finish?.usage).toBeDefined();
    });
  });

  describe('reasoning Model', () => {
    test('should be defined', () => {
      expect(reasoningModel).toBeDefined();
    });

    test('should have doGenerate method', () => {
      expect(typeof reasoningModel.doGenerate).toBe('function');
    });

    test('should have doStream method', () => {
      expect(typeof reasoningModel.doStream).toBe('function');
    });

    test('should generate reasoning response', async () => {
      const result = await reasoningModel.doGenerate({ prompt: 'Solve this problem' as any });

      expect(result).toBeDefined();
      expect(result.finishReason).toBe('stop');
      expect(result.usage).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should stream reasoning response', async () => {
      const result = await reasoningModel.doStream({ prompt: 'Solve this problem' as any });

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
    });
  });

  describe('title Model', () => {
    test('should be defined', () => {
      expect(titleModel).toBeDefined();
    });

    test('should have doGenerate method', () => {
      expect(typeof titleModel.doGenerate).toBe('function');
    });

    test('should have doStream method', () => {
      expect(typeof titleModel.doStream).toBe('function');
    });

    test('should generate title response', async () => {
      const result = await titleModel.doGenerate({ prompt: 'Generate a title' as any });

      expect(result).toBeDefined();
      expect(result.finishReason).toBe('stop');
      expect(result.usage).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should stream title response', async () => {
      const result = await titleModel.doStream({ prompt: 'Generate a title' as any });

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
    });
  });

  describe('artifact Model', () => {
    test('should be defined', () => {
      expect(artifactModel).toBeDefined();
    });

    test('should have doGenerate method', () => {
      expect(typeof artifactModel.doGenerate).toBe('function');
    });

    test('should have doStream method', () => {
      expect(typeof artifactModel.doStream).toBe('function');
    });

    test('should generate artifact response', async () => {
      const result = await artifactModel.doGenerate({ prompt: 'Create a document' as any });

      expect(result).toBeDefined();
      expect(result.finishReason).toBe('stop');
      expect(result.usage).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should stream artifact response', async () => {
      const result = await artifactModel.doStream({ prompt: 'Create a document' as any });

      expect(result).toBeDefined();
      expect(result.stream).toBeDefined();
    });
  });

  describe('model Consistency', () => {
    test('all models should have consistent interface', () => {
      const models = [chatModel, reasoningModel, titleModel, artifactModel];

      models.forEach(model => {
        expect(model).toHaveProperty('doGenerate');
        expect(model).toHaveProperty('doStream');
        expect(typeof model.doGenerate).toBe('function');
        expect(typeof model.doStream).toBe('function');
      });
    });

    test('all models should return consistent response structure', async () => {
      const models = [chatModel, reasoningModel, titleModel, artifactModel];

      for (const model of models) {
        const result = await model.doGenerate({ prompt: 'Test' as any });

        expect(result).toHaveProperty('finishReason');
        expect(result).toHaveProperty('usage');
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('rawCall');
        expect(result).toHaveProperty('warnings');
      }
    });
  });
});
