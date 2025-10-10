/**
 * AI SDK v5 Stream Testing Utilities
 * Helpers for testing streaming functionality with simulateReadableStream
 * Using official AI SDK v5 streaming patterns
 */

import type { StreamObjectResult, StreamTextResult, UIMessage } from "ai";
import { simulateReadableStream } from "ai/test";
import { expect } from "vitest";

/**
 * Assert that a textStream produces expected text parts
 */
export async function assertTextStream(
  result: StreamTextResult<any, any>,
  expectedParts: string[],
): Promise<void> {
  const actualParts: string[] = [];
  for await (const part of result.textStream) {
    actualParts.push(part);
  }
  expect(actualParts).toEqual(expectedParts);
}

/**
 * Assert that textStream aggregates to expected full text
 */
export async function assertFullText(
  result: StreamTextResult<any, any>,
  expectedText: string,
): Promise<void> {
  const parts: string[] = [];
  for await (const part of result.textStream) {
    parts.push(part);
  }
  expect(parts.join("")).toBe(expectedText);
}

/**
 * Assert fullStream chunk types and order
 */
export async function assertFullStreamChunks(
  result: StreamTextResult<any, any>,
  expectedChunkTypes: string[],
): Promise<void> {
  const actualChunkTypes: string[] = [];
  for await (const chunk of result.fullStream) {
    actualChunkTypes.push(chunk.type);
  }
  expect(actualChunkTypes).toEqual(expectedChunkTypes);
}

/**
 * Collect all fullStream chunks for detailed assertions
 */
export async function collectFullStreamChunks(
  result: StreamTextResult<any, any>,
): Promise<any[]> {
  const chunks: any[] = [];
  for await (const chunk of result.fullStream) {
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Assert that fullStream contains specific chunk types
 */
export async function assertStreamContainsChunkTypes(
  result: StreamTextResult<any, any>,
  requiredTypes: string[],
): Promise<void> {
  const chunks = await collectFullStreamChunks(result);
  const actualTypes = chunks.map((chunk) => chunk.type);

  for (const requiredType of requiredTypes) {
    expect(actualTypes).toContain(requiredType);
  }
}

/**
 * Assert toUIMessageStream produces expected message parts
 */
export async function assertUIMessageStream(
  result: StreamTextResult<any, any>,
  options?: { sendSources?: boolean },
): Promise<any[]> {
  const messageParts: any[] = [];
  const uiStream = result.toUIMessageStream(options);

  for await (const part of uiStream) {
    messageParts.push(part);
  }

  return messageParts;
}

/**
 * Assert toUIMessageStream includes sources when enabled
 */
export async function assertUIMessageStreamWithSources(
  result: StreamTextResult<any, any>,
  expectedSourceCount: number,
): Promise<void> {
  const messageParts = await assertUIMessageStream(result, {
    sendSources: true,
  });
  const sourceParts = messageParts.filter((part) => part.type === "source");
  expect(sourceParts).toHaveLength(expectedSourceCount);
}

/**
 * Assert that streaming object produces expected partial objects
 */
export async function assertStreamObject(
  result: StreamObjectResult<any, any, any>,
  expectedFinalObject: any,
): Promise<void> {
  const partialObjects: any[] = [];
  for await (const chunk of result.fullStream) {
    if (chunk.type === "object") {
      partialObjects.push(chunk.object);
    }
  }

  // Should have at least one partial object
  expect(partialObjects.length).toBeGreaterThan(0);

  // Final object should match expected
  const finalObject = await result.object;
  expect(finalObject).toEqual(expectedFinalObject);
}

/**
 * Create a mock readable stream with text deltas
 */
export function createMockTextStream(
  textParts: string[],
  options?: { initialDelayInMs?: number; chunkDelayInMs?: number },
) {
  const { initialDelayInMs = 0, chunkDelayInMs = 0 } = options || {};

  return simulateReadableStream({
    initialDelayInMs,
    chunkDelayInMs,
    chunks: [
      { type: "text-start", id: "text-1" },
      ...textParts.map((delta) => ({
        type: "text-delta" as const,
        id: "text-1",
        delta,
      })),
      { type: "text-end", id: "text-1" },
      {
        type: "finish" as const,
        finishReason: "stop" as const,
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      },
    ],
  });
}

/**
 * Create a mock readable stream for object streaming
 */
export function createMockObjectStream(
  jsonString: string,
  options?: { initialDelayInMs?: number; chunkDelayInMs?: number },
) {
  const { initialDelayInMs = 0, chunkDelayInMs = 0 } = options || {};
  const jsonChunks = jsonString.match(/.{1,3}/g) || [jsonString];

  return simulateReadableStream({
    initialDelayInMs,
    chunkDelayInMs,
    chunks: [
      { type: "text-start", id: "text-1" },
      ...jsonChunks.map((delta) => ({
        type: "text-delta" as const,
        id: "text-1",
        delta,
      })),
      { type: "text-end", id: "text-1" },
      {
        type: "finish" as const,
        finishReason: "stop" as const,
        usage: { inputTokens: 10, outputTokens: 15, totalTokens: 25 },
      },
    ],
  });
}

/**
 * Create a mock UI message stream for testing
 */
export function createMockUIMessageStream(
  messages: Partial<UIMessage>[],
  options?: { initialDelayInMs?: number; chunkDelayInMs?: number },
) {
  const { initialDelayInMs = 0, chunkDelayInMs = 0 } = options || {};

  const chunks = [
    `data: {"type":"start","messageId":"msg-test"}\n\n`,
    ...messages.flatMap((msg) => [
      `data: {"type":"text-start","id":"text-1"}\n\n`,
      `data: {"type":"text-delta","id":"text-1","delta":"${(msg as any).content || ""}"}\n\n`,
      `data: {"type":"text-end","id":"text-1"}\n\n`,
    ]),
    `data: {"type":"finish"}\n\n`,
    `data: [DONE]\n\n`,
  ];

  return simulateReadableStream({
    initialDelayInMs,
    chunkDelayInMs,
    chunks,
  });
}

/**
 * Test helper for error scenarios in streams
 */
export async function assertStreamError(
  streamPromise: Promise<any>,
  expectedErrorType: new (...args: any[]) => Error,
  expectedErrorMessage?: string,
): Promise<void> {
  await expect(streamPromise).rejects.toThrow(expectedErrorType);

  if (expectedErrorMessage) {
    await expect(streamPromise).rejects.toThrow(expectedErrorMessage);
  }
}

/**
 * Measure stream timing for performance tests
 */
export async function measureStreamTiming<T>(
  streamGenerator: () => AsyncIterable<T>,
): Promise<{ duration: number; chunkCount: number }> {
  const start = performance.now();
  let chunkCount = 0;

  for await (const _ of streamGenerator()) {
    chunkCount++;
  }

  const duration = performance.now() - start;
  return { duration, chunkCount };
}

/**
 * Assert stream performance is within expected bounds
 */
export async function assertStreamPerformance<T>(
  streamGenerator: () => AsyncIterable<T>,
  maxDurationMs: number,
  minChunkCount = 1,
): Promise<void> {
  const { duration, chunkCount } = await measureStreamTiming(streamGenerator);

  expect(duration).toBeLessThan(maxDurationMs);
  expect(chunkCount).toBeGreaterThanOrEqual(minChunkCount);
}

/**
 * Wait for stream to complete and return final result
 */
export async function waitForStreamCompletion<T>(
  result: StreamTextResult<T, any>,
): Promise<{ text: string; finishReason: string; usage: any }> {
  // Consume the stream to ensure completion
  const text = await result.text;
  const finishReason = await result.finishReason;
  const usage = await result.usage;

  return { text, finishReason, usage };
}
