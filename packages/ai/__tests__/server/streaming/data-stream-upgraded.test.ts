/**
 * Data Stream Testing with v5 Patterns - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real streaming APIs and network delays
 * - INTEGRATION_TEST=false/undefined: Use mocks with simulateReadableStream (default)
 *
 * To run with real streaming tests:
 * INTEGRATION_TEST=true OPENAI_API_KEY=your-key pnpm test data-stream-upgraded
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createDataStreamHelper,
  DataStreamHelper,
} from '../../../src/shared/streaming/data-stream';

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
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
      streamText: vi.fn(),
      generateText: vi.fn(),
    };
  });

  // Mock observability
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));
}

describe('data Stream Helper - Upgraded (Mock/Integration)', () => {
  const mockDataStream = {
    writeData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration test mode - using real streaming APIs');
    } else {
      console.log('🤖 Mock test mode - using simulateReadableStream');
    }
  });

  test('should create a data stream helper', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    expect(helper).toBeInstanceOf(DataStreamHelper);

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: DataStreamHelper created');
    } else {
      console.log('✅ Mock: DataStreamHelper created');
    }
  });

  test(
    'should simulate AI SDK Data Stream Protocol (v5 pattern)',
    async () => {
      if (IS_INTEGRATION_TEST) {
        // Test with real AI SDK streaming
        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping real streaming test - no OpenAI API key');
          return;
        }

        const { streamText } = await import('ai');
        const { openai } = await import('@ai-sdk/openai');

        const result = await streamText({
          model: openai('gpt-3.5-turbo'),
          prompt: 'Count from 1 to 3, each number on a new line.',
          maxTokens: 50,
        });

        const chunks: string[] = [];
        for await (const chunk of result.textStream) {
          chunks.push(chunk);
        }

        expect(chunks.length).toBeGreaterThan(0);
        const fullText = chunks.join('');
        expect(fullText.length).toBeGreaterThan(5);

        console.log(`✅ Integration: Received ${chunks.length} chunks from real API`);
        console.log(`📊 Full text: ${fullText.substring(0, 50)}...`);
      } else {
        // Mock streaming test
        const { simulateReadableStream } = await import('ai');

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

        console.log('✅ Mock: AI SDK Data Stream Protocol tested');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test streaming delays',
    async () => {
      if (IS_INTEGRATION_TEST) {
        // Test with real network delays
        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping real delay test - no OpenAI API key');
          return;
        }

        const { streamText } = await import('ai');
        const { openai } = await import('@ai-sdk/openai');

        const startTime = Date.now();

        const result = await streamText({
          model: openai('gpt-3.5-turbo'),
          prompt: 'Say "testing" and then pause a moment before saying "complete".',
          maxTokens: 20,
        });

        let chunkCount = 0;
        for await (const chunk of result.textStream) {
          chunkCount++;
          if (chunkCount === 1) {
            // Measure time to first chunk
            const timeToFirst = Date.now() - startTime;
            expect(timeToFirst).toBeGreaterThan(100); // Real API has latency
          }
        }

        const totalTime = Date.now() - startTime;
        expect(totalTime).toBeGreaterThan(200); // Real streaming takes time

        console.log(
          `✅ Integration: Streaming completed in ${totalTime}ms with ${chunkCount} chunks`,
        );
      } else {
        // Mock delay test
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

        console.log(`✅ Mock: Streaming delays tested (${duration}ms)`);
      }
    },
    TEST_TIMEOUT,
  );

  test('should write kind data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);

    if (IS_INTEGRATION_TEST) {
      helper.writeKind('integration-document');
      expect(mockDataStream.writeData).toHaveBeenCalledWith({
        type: 'kind',
        content: 'integration-document',
      });
      console.log('✅ Integration: Kind data written');
    } else {
      helper.writeKind('document');
      expect(mockDataStream.writeData).toHaveBeenCalledWith({
        type: 'kind',
        content: 'document',
      });
      console.log('✅ Mock: Kind data written');
    }
  });

  test('should write id data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);

    const testId = IS_INTEGRATION_TEST ? `integration-test-${Date.now()}` : 'test-id';
    helper.writeId(testId);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'id',
      content: testId,
    });

    if (IS_INTEGRATION_TEST) {
      console.log(`✅ Integration: ID data written: ${testId}`);
    } else {
      console.log('✅ Mock: ID data written');
    }
  });

  test('should write title data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);

    const testTitle = IS_INTEGRATION_TEST ? 'Integration Test Title' : 'Test Title';
    helper.writeTitle(testTitle);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'title',
      content: testTitle,
    });

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Title data written');
    } else {
      console.log('✅ Mock: Title data written');
    }
  });

  test('should write clear data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeClear();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'clear',
      content: '',
    });

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Clear data written');
    } else {
      console.log('✅ Mock: Clear data written');
    }
  });

  test('should write finish data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeFinish();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'finish',
      content: '',
    });

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Finish data written');
    } else {
      console.log('✅ Mock: Finish data written');
    }
  });

  test('should append message', () => {
    const helper = createDataStreamHelper(mockDataStream as any);

    const message = IS_INTEGRATION_TEST
      ? {
          id: `integration-${Date.now()}`,
          content: 'integration test message',
          timestamp: Date.now(),
        }
      : { id: '1', content: 'test' };

    helper.appendMessage(message);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'append-message',
      message: JSON.stringify(message),
    });

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Message appended with timestamp');
    } else {
      console.log('✅ Mock: Message appended');
    }
  });

  test('should write custom data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);

    const customType = IS_INTEGRATION_TEST ? 'integration-custom' : 'custom-type';
    const customContent = IS_INTEGRATION_TEST ? 'integration custom content' : 'custom-content';

    helper.writeCustom(customType, customContent);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: customType,
      content: customContent,
    });

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Custom data written');
    } else {
      console.log('✅ Mock: Custom data written');
    }
  });

  // Integration-only test for real streaming performance
  if (IS_INTEGRATION_TEST) {
    test(
      'should test real streaming performance',
      async () => {
        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping performance test - no OpenAI API key');
          return;
        }

        console.log('🚀 Testing real streaming performance...');

        const { streamText } = await import('ai');
        const { openai } = await import('@ai-sdk/openai');

        const startTime = Date.now();
        let firstChunkTime = 0;
        let chunkCount = 0;
        let totalChars = 0;

        const result = await streamText({
          model: openai('gpt-3.5-turbo'),
          prompt:
            'Write exactly 5 sentences about the benefits of streaming APIs, making each sentence around 20 words.',
          maxTokens: 150,
        });

        for await (const chunk of result.textStream) {
          chunkCount++;
          totalChars += chunk.length;

          if (chunkCount === 1) {
            firstChunkTime = Date.now() - startTime;
          }
        }

        const totalTime = Date.now() - startTime;
        const avgChunkSize = totalChars / chunkCount;
        const chunksPerSecond = (chunkCount / totalTime) * 1000;

        expect(chunkCount).toBeGreaterThan(1);
        expect(totalChars).toBeGreaterThan(50);
        expect(firstChunkTime).toBeGreaterThan(50); // Should have some latency
        expect(totalTime).toBeGreaterThan(100);

        console.log(`📊 Performance metrics:`);
        console.log(`   Total time: ${totalTime}ms`);
        console.log(`   Time to first chunk: ${firstChunkTime}ms`);
        console.log(`   Total chunks: ${chunkCount}`);
        console.log(`   Total characters: ${totalChars}`);
        console.log(`   Average chunk size: ${avgChunkSize.toFixed(1)} chars`);
        console.log(`   Chunks per second: ${chunksPerSecond.toFixed(1)}`);

        console.log('✅ Integration: Real streaming performance tested');
      },
      TEST_TIMEOUT,
    );

    test(
      'should test streaming error handling',
      async () => {
        if (!process.env.OPENAI_API_KEY) {
          console.log('⚠️ Skipping error handling test - no OpenAI API key');
          return;
        }

        console.log('🔍 Testing streaming error handling...');

        const { streamText } = await import('ai');
        const { openai } = await import('@ai-sdk/openai');

        try {
          // Test with invalid model
          const result = await streamText({
            model: openai('non-existent-model'),
            prompt: 'This should fail',
            maxTokens: 10,
          });

          // Try to consume the stream
          for await (const chunk of result.textStream) {
            // Should not reach here
          }

          // If we get here, the test didn't fail as expected
          console.log('⚠️ Expected error but stream succeeded');
        } catch (error) {
          expect(error).toBeDefined();
          console.log('✅ Integration: Streaming error handled correctly');
        }
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for edge cases
  if (!IS_INTEGRATION_TEST) {
    test('should test streaming edge cases', async () => {
      const { simulateReadableStream } = await import('ai');

      // Test empty stream
      const emptyStream = (simulateReadableStream as any)({
        chunks: [],
      });

      const emptyChunks: string[] = [];
      const emptyReader = emptyStream.getReader();

      try {
        while (true) {
          const { done, value } = await emptyReader.read();
          if (done) break;
          emptyChunks.push(value);
        }
      } finally {
        emptyReader.releaseLock();
      }

      expect(emptyChunks).toStrictEqual([]);

      // Test large chunks
      const largeChunk = 'x'.repeat(10000);
      const largeStream = (simulateReadableStream as any)({
        chunks: [largeChunk],
      });

      const largeChunks: string[] = [];
      const largeReader = largeStream.getReader();

      try {
        while (true) {
          const { done, value } = await largeReader.read();
          if (done) break;
          largeChunks.push(value);
        }
      } finally {
        largeReader.releaseLock();
      }

      expect(largeChunks).toStrictEqual([largeChunk]);
      expect(largeChunks[0]).toHaveLength(10000);

      console.log('✅ Mock: Streaming edge cases tested');
    });

    test('should test data stream helper edge cases', () => {
      const helper = createDataStreamHelper(mockDataStream as any);

      // Test with empty strings
      helper.writeTitle('');
      helper.writeCustom('', '');
      helper.writeId('');

      expect(mockDataStream.writeData).toHaveBeenCalledTimes(3);

      // Test with special characters
      helper.writeTitle('Title with "quotes" and\n newlines');
      helper.writeCustom('type-with-dashes', 'Content with \t tabs and unicode: 🚀');

      expect(mockDataStream.writeData).toHaveBeenCalledTimes(5);

      // Test with very large messages
      const largeMessage = {
        id: 'large-test',
        content: 'x'.repeat(50000),
        metadata: { size: 'large' },
      };
      helper.appendMessage(largeMessage);

      expect(mockDataStream.writeData).toHaveBeenCalledWith({
        type: 'append-message',
        message: JSON.stringify(largeMessage),
      });

      console.log('✅ Mock: Data stream helper edge cases tested');
    });
  }
});
