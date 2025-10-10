/**
 * Tests for core streaming utilities
 * Testing StreamBuffer, StreamAggregator, and related functions
 */

import {
  StreamAggregator,
  StreamBuffer,
  createMultiplexedStream,
  writeToStream,
} from "#/server/streaming/streaming-transformations";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("streamBuffer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should flush by size limit", async () => {
    const writes: any[] = [];
    const mockWriter = {
      write: vi.fn((data: any) => writes.push(data)),
    } as any;
    const onFlush = vi.fn();

    const buffer = new StreamBuffer<{ value: number }>(mockWriter, {
      maxSize: 2,
      flushInterval: 1000,
      onFlush,
    });

    buffer.add({ value: 1 });
    buffer.add({ value: 2 }); // Should trigger flush by size

    expect(onFlush).toHaveBeenCalledWith([{ value: 1 }, { value: 2 }]);
    expect(mockWriter.write).toHaveBeenCalledWith();
  });

  test("should flush by time interval", async () => {
    const writes: any[] = [];
    const mockWriter = {
      write: vi.fn((data: any) => writes.push(data)),
    } as any;
    const onFlush = vi.fn();

    const buffer = new StreamBuffer<{ value: number }>(mockWriter, {
      maxSize: 10,
      flushInterval: 100,
      onFlush,
    });

    buffer.add({ value: 1 });

    // Should not flush yet
    expect(onFlush).not.toHaveBeenCalled();

    // Advance timer to trigger flush
    vi.advanceTimersByTime(100);

    expect(onFlush).toHaveBeenCalledWith([{ value: 1 }]);
  });

  test("should handle empty buffer flush gracefully", async () => {
    const mockWriter = { write: vi.fn() } as any;
    const onFlush = vi.fn();

    const buffer = new StreamBuffer<{ value: number }>(mockWriter, {
      maxSize: 2,
      flushInterval: 100,
      onFlush,
    });

    vi.advanceTimersByTime(100);

    // Should not call onFlush for empty buffer
    expect(onFlush).not.toHaveBeenCalled();
  });

  test("should support manual flush", async () => {
    const mockWriter = { write: vi.fn() } as any;
    const onFlush = vi.fn();

    const buffer = new StreamBuffer<{ value: number }>(mockWriter, {
      maxSize: 10,
      flushInterval: 1000,
      onFlush,
    });

    buffer.add({ value: 1 });
    buffer.flush();

    expect(onFlush).toHaveBeenCalledWith([{ value: 1 }]);
  });
});

describe("streamAggregator", () => {
  test("should aggregate multiple streams", async () => {
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue("a1");
        controller.enqueue("a2");
        controller.close();
      },
    });

    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue("b1");
        controller.close();
      },
    });

    const aggregator = new StreamAggregator();
    aggregator.add("stream1", stream1);
    aggregator.add("stream2", stream2);

    const results: Array<{ streamId: string; value: any }> = [];
    for await (const item of aggregator.aggregate()) {
      results.push(item);
    }

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some(
        (item) => item.streamId === "stream1" && item.value === "a1",
      ),
    ).toBeTruthy();
    expect(
      results.some(
        (item) => item.streamId === "stream2" && item.value === "b1",
      ),
    ).toBeTruthy();
  });

  test("should handle empty aggregator", async () => {
    const aggregator = new StreamAggregator();
    const results: Array<{ streamId: string; value: any }> = [];

    for await (const item of aggregator.aggregate()) {
      results.push(item);
    }

    expect(results).toHaveLength(0);
  });

  test("should handle stream errors gracefully", async () => {
    const errorStream = new ReadableStream({
      start(controller) {
        controller.error(new Error("Stream error"));
      },
    });

    const goodStream = new ReadableStream({
      start(controller) {
        controller.enqueue("good");
        controller.close();
      },
    });

    const aggregator = new StreamAggregator();
    aggregator.add("error", errorStream);
    aggregator.add("good", goodStream);

    const results: Array<{ streamId: string; value: any }> = [];

    // Should continue processing good streams despite errors
    try {
      for await (const item of aggregator.aggregate()) {
        results.push(item);
      }
    } catch (error) {
      // Expected for error stream
    }

    // Should still get results from good stream
    expect(results.some((item) => item.streamId === "good")).toBeTruthy();
  });
});

describe("createMultiplexedStream", () => {
  test("should create multiplexed stream from multiple sources", async () => {
    const sources = [
      new ReadableStream({
        start(controller) {
          controller.enqueue({ id: "source1", data: "data1" });
          controller.close();
        },
      }),
      new ReadableStream({
        start(controller) {
          controller.enqueue({ id: "source2", data: "data2" });
          controller.close();
        },
      }),
    ];

    const multiplexed = createMultiplexedStream(sources);
    const reader = multiplexed.getReader();
    const results: any[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        results.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.id === "source1")).toBeTruthy();
    expect(results.some((item) => item.id === "source2")).toBeTruthy();
  });

  test("should handle empty sources array", async () => {
    const multiplexed = createMultiplexedStream([]);
    const reader = multiplexed.getReader();

    const { done } = await reader.read();
    expect(done).toBeTruthy();

    reader.releaseLock();
  });
});

describe("writeToStream", () => {
  test("should write data to stream writer", async () => {
    const writes: any[] = [];
    const mockWriter = {
      write: vi.fn((data: any) => {
        writes.push(data);
        return Promise.resolve();
      }),
    } as any;

    const testData = { type: "test", content: "Hello" };
    await writeToStream(mockWriter, testData);

    expect(mockWriter.write).toHaveBeenCalledWith(testData);
    expect(writes).toContain(testData);
  });

  test("should handle write errors gracefully", async () => {
    const mockWriter = {
      write: vi.fn().mockRejectedValue(new Error("Write error")),
    } as any;

    const testData = { type: "test", content: "Hello" };

    // Should not throw, but handle error internally
    await expect(writeToStream(mockWriter, testData)).rejects.toThrow(
      "Write error",
    );
  });

  test("should handle undefined data", async () => {
    const mockWriter = {
      write: vi.fn(),
    } as any;

    await writeToStream(mockWriter, undefined);

    expect(mockWriter.write).toHaveBeenCalledWith(undefined);
  });
});
