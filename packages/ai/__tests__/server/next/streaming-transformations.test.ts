/**
 * Tests for Next.js streaming transformations
 * Testing the streaming utilities for Next.js integration
 */

import {
  createStreamingDocumentHandler,
  streamObjectGeneration,
  StreamProcessor,
  streamTextGeneration,
  type StreamObjectConfig,
  type StreamTextConfig,
} from '#/server/core/next/streaming-transformations';
import type { LanguageModel } from 'ai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

// Mock DataStreamWriter - matches UIMessageStreamWriter interface
class MockDataStreamWriter {
  private data: any[] = [];

  write(data: any) {
    this.data.push(data);
  }

  getData() {
    return this.data;
  }

  clear() {
    this.data = [];
  }
}

// Mock language model
const createMockModel = (): LanguageModel =>
  ({
    id: 'test-model',
    provider: 'test',
    specificationVersion: 'v2',
  }) as any;

describe('next.js Streaming Transformations', () => {
  let mockDataStream: MockDataStreamWriter;
  let mockModel: LanguageModel;

  beforeEach(() => {
    mockDataStream = new MockDataStreamWriter();
    mockModel = createMockModel();
    vi.clearAllMocks();
  });

  describe('streamTextGeneration', () => {
    test('should stream text with default settings', async () => {
      const config: StreamTextConfig = {
        model: mockModel,
        prompt: 'Test prompt',
      };

      const result = await streamTextGeneration(config, mockDataStream as any);

      expect(result).toBe('Mock streamed text');
      expect(mockDataStream.getData()).toHaveLength(3); // Mock, streamed, text
      expect(mockDataStream.getData()[0]).toStrictEqual({
        type: 'text-delta',
        delta: 'Mock ',
      });
    });

    test('should stream text with smoothing enabled', async () => {
      const config: StreamTextConfig = {
        model: mockModel,
        prompt: 'Test prompt',
        enableSmoothing: true,
        chunkingStrategy: 'word',
      };

      const result = await streamTextGeneration(config, mockDataStream as any);

      expect(result).toBe('Mock streamed text');
    });

    test('should stream text with system prompt', async () => {
      const config: StreamTextConfig = {
        model: mockModel,
        system: 'You are a helpful assistant',
        prompt: 'Test prompt',
      };

      const result = await streamTextGeneration(config, mockDataStream as any);

      expect(result).toBe('Mock streamed text');
    });

    test('should handle text delta callbacks', async () => {
      const onTextDelta = vi.fn();
      const onComplete = vi.fn();

      const config: StreamTextConfig = {
        model: mockModel,
        prompt: 'Test prompt',
      };

      const result = await streamTextGeneration(config, mockDataStream as any, {
        onTextDelta,
        onComplete,
      });

      expect(onTextDelta).toHaveBeenCalledTimes(3);
      expect(onTextDelta).toHaveBeenCalledWith('Mock ');
      expect(onTextDelta).toHaveBeenCalledWith('streamed ');
      expect(onTextDelta).toHaveBeenCalledWith('text');
      expect(onComplete).toHaveBeenCalledWith('Mock streamed text');
    });

    test('should handle errors', async () => {
      const onError = vi.fn();
      const config: StreamTextConfig = {
        model: mockModel,
        prompt: 'Test prompt',
      };

      // Mock streamText to throw error
      const { streamText } = await import('ai');
      (streamText as any).mockImplementationOnce(() => {
        throw new Error('Stream error');
      });

      await expect(
        streamTextGeneration(config, mockDataStream as any, { onError }),
      ).rejects.toThrow('Stream error');

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('streamObjectGeneration', () => {
    const schema = z.object({
      code: z.string(),
      language: z.string(),
    });

    test('should stream object with code field', async () => {
      const config: StreamObjectConfig<typeof schema> = {
        model: mockModel,
        prompt: 'Generate code',
        schema,
      };

      const result = await streamObjectGeneration(config, mockDataStream as any);

      // The mock returns key: 'value' by default
      expect(result).toBe('');
      expect(mockDataStream.getData()).toHaveLength(0);
    });

    test('should stream object with text field', async () => {
      const textSchema = z.object({
        text: z.string(),
      });

      const config: StreamObjectConfig<typeof textSchema> = {
        model: mockModel,
        prompt: 'Generate text',
        schema: textSchema,
      };

      const result = await streamObjectGeneration(config, mockDataStream as any);

      // The updated mock now returns an object with 'text' field that should be captured
      expect(result).toBe('Hello JSON');
      expect(mockDataStream.getData()).toHaveLength(1);
      expect(mockDataStream.getData()[0]).toStrictEqual({
        type: 'text-delta',
        delta: 'Hello JSON',
      });
    });

    test('should handle object delta callbacks', async () => {
      const onObjectDelta = vi.fn();
      const onComplete = vi.fn();

      const config: StreamObjectConfig<typeof schema> = {
        model: mockModel,
        prompt: 'Generate code',
        schema,
      };

      const result = await streamObjectGeneration(config, mockDataStream as any, {
        onObjectDelta,
        onComplete,
      });

      expect(onObjectDelta).toHaveBeenCalledWith({
        key: 'value',
        text: 'Hello JSON',
      });
      expect(onComplete).toHaveBeenCalledWith('Hello JSON');
    });
  });

  describe('streamProcessor', () => {
    let processor: StreamProcessor;

    beforeEach(() => {
      processor = new StreamProcessor(mockDataStream as any);
    });

    test('should process text deltas', () => {
      processor.processTextDelta('Hello ');
      processor.processTextDelta('world!');

      expect(processor.getContent()).toBe('Hello world!');
      expect(mockDataStream.getData()).toHaveLength(2);
      expect(mockDataStream.getData()[0]).toStrictEqual({
        type: 'text-delta',
        delta: 'Hello ',
      });
    });

    test('should process code deltas', () => {
      processor.processCodeDelta('const x = 42;');

      expect(processor.getContent()).toBe('const x = 42;');
      expect(mockDataStream.getData()[0]).toStrictEqual({
        type: 'data-code-delta',
        data: 'const x = 42;',
      });
    });

    test('should handle callbacks', () => {
      const onTextDelta = vi.fn();
      const onObjectDelta = vi.fn();
      const onComplete = vi.fn();

      const processorWithHandlers = new StreamProcessor(mockDataStream as any, {
        onTextDelta,
        onObjectDelta,
        onComplete,
      });

      processorWithHandlers.processTextDelta('Test');
      processorWithHandlers.processObjectDelta({ key: 'value' });
      const result = processorWithHandlers.complete();

      expect(onTextDelta).toHaveBeenCalledWith('Test');
      expect(onObjectDelta).toHaveBeenCalledWith({ key: 'value' });
      expect(onComplete).toHaveBeenCalledWith('Test');
      expect(result).toBe('Test');
    });

    test('should handle errors', () => {
      const onError = vi.fn();
      const processorWithError = new StreamProcessor(mockDataStream as any, { onError });

      const error = new Error('Processing error');
      processorWithError.error(error);

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('createStreamingDocumentHandler', () => {
    test('should create document handler with correct kind', () => {
      const handler = createStreamingDocumentHandler({
        kind: 'code',
        onCreateDocument: async () => 'created',
        onUpdateDocument: async () => 'updated',
      });

      expect(handler.kind).toBe('code');
      expect(handler.createDocument).toBeDefined();
      expect(handler.updateDocument).toBeDefined();
    });

    test('should handle document creation', async () => {
      const onCreateDocument = vi.fn().mockResolvedValue('Document created');

      const handler = createStreamingDocumentHandler({
        kind: 'document',
        onCreateDocument,
        onUpdateDocument: async () => 'updated',
      });

      const result = await handler.createDocument('Test Title', mockDataStream as any, mockModel);

      expect(result).toBe('Document created');
      expect(onCreateDocument).toHaveBeenCalledWith({
        title: 'Test Title',
        processor: expect.any(StreamProcessor),
        model: mockModel,
      });
    });

    test('should handle document updates', async () => {
      const onUpdateDocument = vi.fn().mockResolvedValue('Document updated');

      const handler = createStreamingDocumentHandler({
        kind: 'document',
        onCreateDocument: async () => 'created',
        onUpdateDocument,
      });

      const result = await handler.updateDocument(
        'Original content',
        'Update description',
        mockDataStream as any,
        mockModel,
      );

      expect(result).toBe('Document updated');
      expect(onUpdateDocument).toHaveBeenCalledWith({
        content: 'Original content',
        description: 'Update description',
        processor: expect.any(StreamProcessor),
        model: mockModel,
      });
    });

    test('should pass handlers to processor', async () => {
      const onTextDelta = vi.fn();
      const onComplete = vi.fn();

      const handler = createStreamingDocumentHandler({
        kind: 'test',
        onCreateDocument: async ({ processor }) => {
          processor.processTextDelta('Test content');
          return processor.complete();
        },
        onUpdateDocument: async () => 'updated',
      });

      const result = await handler.createDocument('Title', mockDataStream as any, mockModel, {
        onTextDelta,
        onComplete,
      });

      expect(result).toBe('Test content');
      expect(onTextDelta).toHaveBeenCalledWith('Test content');
      expect(onComplete).toHaveBeenCalledWith('Test content');
    });
  });
});
