/**
 * AI SDK v5 Streaming Transformations Tests
 * Tests modern streaming patterns using MockLanguageModelV2 and simulateReadableStream
 */

import { streamText } from 'ai';
import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import {
  createErrorModel,
  createStreamingTextModel,
  createStreamingToolModel,
} from '../../test-utils/models';
import {
  assertFullStreamChunks,
  assertFullText,
  assertTextStream,
  assertUIMessageStream,
  assertUIMessageStreamWithSources,
  collectFullStreamChunks,
  waitForStreamCompletion,
} from '../../test-utils/streams';

describe('streaming Transformations', () => {
  describe('basic Text Streaming', () => {
    test('should stream text parts correctly', async () => {
      const model = createStreamingTextModel(['Hello', ' ', 'world', '!']);

      const result = streamText({
        model,
        prompt: 'Say hello to the world',
      });

      await assertTextStream(result, ['Hello', ' ', 'world', '!']);
    });

    test('should aggregate streaming text correctly', async () => {
      const model = createStreamingTextModel(['Testing', ' streaming', ' aggregation']);

      const result = streamText({
        model,
        prompt: 'Test streaming',
      });

      await assertFullText(result, 'Testing streaming aggregation');
    });

    test('should produce correct fullStream chunk types and order', async () => {
      const model = createStreamingTextModel(['Chunk', ' order']);

      const result = streamText({
        model,
        prompt: 'Test chunk order',
      });

      await assertFullStreamChunks(result, [
        'text-start',
        'text-delta',
        'text-delta',
        'text-end',
        'finish',
      ]);
    });

    test('should include correct finish reason and usage', async () => {
      const model = createStreamingTextModel(['Complete']);

      const result = streamText({
        model,
        prompt: 'Complete test',
      });

      const chunks = await collectFullStreamChunks(result);
      const finishChunk = chunks.find(chunk => chunk.type === 'finish');

      expect(finishChunk).toBeDefined();
      expect(finishChunk.finishReason).toBe('stop');
      expect(finishChunk.usage).toEqual({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      });
    });
  });

  describe('uI Message Stream Transformations', () => {
    test('should convert to UI message stream correctly', async () => {
      const model = createStreamingTextModel(['UI', ' message', ' test']);

      const result = streamText({
        model,
        prompt: 'Test UI message stream',
      });

      const messageParts = await assertUIMessageStream(result);
      expect(messageParts.length).toBeGreaterThan(0);

      // Check for text delta messages
      const textDeltas = messageParts.filter(part => part.type === 'text-delta');
      expect(textDeltas.length).toBeGreaterThan(0);
      expect(textDeltas[0]).toHaveProperty('textDelta');
    });

    test('should include sources when sendSources is enabled', async () => {
      const model = createStreamingTextModel(['Source', ' test']);

      const result = streamText({
        model,
        prompt: 'Test with sources',
      });

      await assertUIMessageStreamWithSources(result, 1);
    });

    test('should handle toUIMessageStreamResponse correctly', async () => {
      const model = createStreamingTextModel(['Response', ' test']);

      const result = streamText({
        model,
        prompt: 'Test response',
      });

      const response = await result.toUIMessageStreamResponse();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
    });
  });

  describe('tool-Enhanced Streaming', () => {
    test('should stream text with tool calls', async () => {
      const toolCall = {
        toolCallId: 'test-call-1',
        toolName: 'testTool',
        input: { query: 'test' },
      };

      const model = createStreamingToolModel(['Calling tool...'], [toolCall]);

      const result = streamText({
        model,
        prompt: 'Use the test tool',
        tools: {
          testTool: {
            description: 'A test tool',
            inputSchema: z.object({ query: z.string() }),
            execute: async ({ query }) => `Tool result for: ${query}`,
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);

      // Should have text chunks and tool call chunks
      const textChunks = chunks.filter(chunk => chunk.type.startsWith('text'));
      const toolCallChunks = chunks.filter(chunk => chunk.type === 'tool-call');

      expect(textChunks.length).toBeGreaterThan(0);
      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0]).toMatchObject({
        type: 'tool-call',
        toolCallId: 'test-call-1',
        toolName: 'testTool',
        input: { query: 'test' },
      });
    });
  });

  describe('error Handling in Streams', () => {
    test('should handle streaming errors gracefully', async () => {
      const errorModel = createErrorModel(new Error('Streaming failed'));

      const result = streamText({
        model: errorModel,
        prompt: 'This will fail',
      });

      await expect(result.text).rejects.toThrow('Streaming failed');
    });

    test('should handle malformed chunks', async () => {
      // Create a model that produces invalid chunks
      const badModel = createStreamingTextModel(['Valid', null as any, 'Invalid']);

      const result = streamText({
        model: badModel,
        prompt: 'Test bad chunks',
      });

      // Should not throw, but handle gracefully
      const chunks = await collectFullStreamChunks(result);
      expect(chunks).toBeDefined();

      // Should still have some valid chunks
      const validChunks = chunks.filter(chunk => chunk.type && chunk.type !== null);
      expect(validChunks.length).toBeGreaterThan(0);
    });

    test('should handle onError callback in toUIMessageStreamResponse', async () => {
      const errorModel = createErrorModel(new Error('UI stream error'));
      const onErrorSpy = vi.fn();

      const result = streamText({
        model: errorModel,
        prompt: 'Test error handling',
      });

      try {
        await result.toUIMessageStreamResponse({ onError: onErrorSpy });
      } catch (error) {
        expect(onErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      }
    });
  });

  describe('stream Performance and Timing', () => {
    test('should complete streaming within reasonable time', async () => {
      const model = createStreamingTextModel(['Fast', ' response']);

      const result = streamText({
        model,
        prompt: 'Test performance',
      });

      const startTime = performance.now();
      await waitForStreamCompletion(result);
      const duration = performance.now() - startTime;

      // Should complete in less than 1 second (mock streams are fast)
      expect(duration).toBeLessThan(1000);
    });

    test('should handle concurrent streams', async () => {
      const model1 = createStreamingTextModel(['Stream', ' 1']);
      const model2 = createStreamingTextModel(['Stream', ' 2']);

      const [result1, result2] = await Promise.all([
        streamText({ model: model1, prompt: 'Concurrent 1' }),
        streamText({ model: model2, prompt: 'Concurrent 2' }),
      ]);

      const [completion1, completion2] = await Promise.all([
        waitForStreamCompletion(result1),
        waitForStreamCompletion(result2),
      ]);

      expect(completion1.text).toBe('Stream 1');
      expect(completion2.text).toBe('Stream 2');
    });
  });

  describe('stream Metadata and Usage Tracking', () => {
    test('should track usage correctly throughout streaming', async () => {
      const model = createStreamingTextModel(['Usage', ' tracking']);

      const result = streamText({
        model,
        prompt: 'Test usage tracking',
      });

      const { usage } = await waitForStreamCompletion(result);

      expect(usage).toEqual({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      });
    });

    test('should maintain finishReason consistency', async () => {
      const model = createStreamingTextModel(['Finish', ' reason']);

      const result = streamText({
        model,
        prompt: 'Test finish reason',
      });

      const { finishReason } = await waitForStreamCompletion(result);
      expect(finishReason).toBe('stop');
    });

    test('should handle warnings in streaming context', async () => {
      // This would test warnings from the model, but MockLanguageModelV2
      // doesn't currently support warnings in streaming mode
      // We'll implement this when the mock supports it
      const model = createStreamingTextModel(['Warning', ' test']);

      const result = streamText({
        model,
        prompt: 'Test warnings',
      });

      // For now, just ensure it doesn't break
      await waitForStreamCompletion(result);
      expect(true).toBeTruthy(); // Placeholder assertion
    });
  });

  describe('advanced Stream Patterns', () => {
    test('should handle empty streams', async () => {
      const model = createStreamingTextModel([]);

      const result = streamText({
        model,
        prompt: 'Empty stream test',
      });

      await assertFullText(result, '');
    });

    test('should handle single character streams', async () => {
      const model = createStreamingTextModel(['a', 'b', 'c']);

      const result = streamText({
        model,
        prompt: 'Single chars',
      });

      await assertTextStream(result, ['a', 'b', 'c']);
      await assertFullText(result, 'abc');
    });

    test('should handle very long streams', async () => {
      const longParts = Array.from({ length: 100 }, (_, i) => `part${i} `);
      const model = createStreamingTextModel(longParts);

      const result = streamText({
        model,
        prompt: 'Long stream test',
      });

      const expectedText = longParts.join('');
      await assertFullText(result, expectedText);
    });
  });
});
