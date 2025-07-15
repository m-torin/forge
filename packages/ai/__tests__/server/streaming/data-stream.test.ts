/**
 * Data Stream Testing with v5 Patterns
 * Uses simulateReadableStream for predictable streaming tests
 * Following official AI SDK v5 data stream protocol testing
 */

import { createDataStreamHelper, DataStreamHelper } from '#/shared/streaming/data-stream';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock AI SDK v5 with v5 simulateReadableStream pattern
vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();

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
  };
});

describe('data Stream Helper - v5 Patterns', () => {
  const mockDataStream = {
    writeData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a data stream helper', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    expect(helper).toBeInstanceOf(DataStreamHelper);
  });

  test('should simulate AI SDK Data Stream Protocol (v5 pattern)', async () => {
    const { simulateReadableStream } = await import('ai');

    // v5 pattern for data stream protocol testing
    const stream = (simulateReadableStream as any)({
      chunks: [
        '0:"Hello"\n',
        '0:" world"\n',
        '0:"!"\n',
        'e:{"finishReason":"stop","usage":{"promptTokens":5,"completionTokens":10}}\n',
        'd:{"finishReason":"stop","usage":{"promptTokens":5,"completionTokens":10}}\n',
      ],
    });

    const chunks: string[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    expect(chunks).toStrictEqual([
      '0:"Hello"\n',
      '0:" world"\n',
      '0:"!"\n',
      'e:{"finishReason":"stop","usage":{"promptTokens":5,"completionTokens":10}}\n',
      'd:{"finishReason":"stop","usage":{"promptTokens":5,"completionTokens":10}}\n',
    ]);
  });

  test('should test streaming delays (v5 pattern)', async () => {
    const { simulateReadableStream } = await import('ai');
    const startTime = Date.now();

    const stream = (simulateReadableStream as any)({
      initialDelayInMs: 100,
      chunkDelayInMs: 50,
      chunks: ['chunk1', 'chunk2'],
    });

    const chunks: string[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(chunks).toStrictEqual(['chunk1', 'chunk2']);
    expect(duration).toBeGreaterThan(150); // Initial delay + chunk delay
  });

  test('should write kind data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeKind('document');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'kind',
      content: 'document',
    });
  });

  test('should write id data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeId('test-id');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'id',
      content: 'test-id',
    });
  });

  test('should write title data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeTitle('Test Title');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'title',
      content: 'Test Title',
    });
  });

  test('should write clear data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeClear();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'clear',
      content: '',
    });
  });

  test('should write finish data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeFinish();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'finish',
      content: '',
    });
  });

  test('should append message', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    const message = { id: '1', content: 'test' };
    helper.appendMessage(message);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'append-message',
      message: JSON.stringify(message),
    });
  });

  test('should write custom data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeCustom('custom-type', 'custom-content');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'custom-type',
      content: 'custom-content',
    });
  });
});
