/**
 * Comprehensive test coverage for batch processing patterns
 * Tests BatchManager, decorators, and utility functions
 */

import { beforeEach, describe, expect, vi } from "vitest";

// Import after mocking
import {
  Batch,
  BatchManager,
  createBatchProcessor,
  createSimpleBatchProcessor,
  withBatch,
} from "../../src/shared/patterns/batch";

// Mock dependencies
vi.mock("p-queue", () => {
  const mockQueue = vi.fn().mockImplementation((options) => ({
    add: vi.fn().mockImplementation(async (fn) => {
      return fn();
    }),
    clear: vi.fn(),
    onIdle: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    size: 0,
    pending: 0,
    ...options,
  }));

  return {
    default: mockQueue,
  };
});

vi.mock("@repo/observability/server/next", () => ({
  createServerObservability: vi.fn().mockResolvedValue({
    log: vi.fn(),
  }),
}));

describe("batch Processing Patterns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("batchManager", () => {
    describe("constructor and configuration", () => {
      test("should create BatchManager with default options", () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result1", "result2"]),
        };

        const manager = new BatchManager(processor);

        expect(manager).toBeDefined();
        expect(manager.getBatchSize()).toBe(0);
        expect(manager.isProcessing()).toBeFalsy();
      });

      test("should create BatchManager with custom options", () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const options = {
          maxBatchSize: 5,
          maxWaitTime: 2000,
          minBatchSize: 2,
          concurrency: 3,
          errorHandling: "continue" as const,
          preserveOrder: false,
        };

        const manager = new BatchManager(processor, options);

        expect(manager).toBeDefined();
        expect(manager.getBatchSize()).toBe(0);
      });
    });

    describe("add and addMany", () => {
      test("should add single item to batch", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["processed"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 2 });

        const promise = manager.add("test-data");
        expect(manager.getBatchSize()).toBe(1);

        // Don't trigger processing yet since batch isn't full
        expect(processor.processBatch).not.toHaveBeenCalled();

        // Add second item to trigger processing
        const promise2 = manager.add("test-data-2");
        expect(manager.getBatchSize()).toBe(2);

        // Advance timers to trigger batch processing
        vi.runAllTimers();

        const result1 = await promise;
        const result2 = await promise2;

        expect(result1).toBe("processed");
        expect(result2).toBe("processed");
        expect(processor.processBatch).toHaveBeenCalledWith([
          "test-data",
          "test-data-2",
        ]);
      });

      test("should add multiple items using addMany", async () => {
        const processor = {
          processBatch: vi
            .fn()
            .mockResolvedValue(["result1", "result2", "result3"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 5 });

        const promise = manager.addMany(["item1", "item2", "item3"]);
        expect(manager.getBatchSize()).toBe(3);

        // Advance timers to trigger batch processing
        vi.runAllTimers();

        const results = await promise;

        expect(results).toStrictEqual(["result1", "result2", "result3"]);
        expect(processor.processBatch).toHaveBeenCalledWith([
          "item1",
          "item2",
          "item3",
        ]);
      });

      test("should trigger processing when batch reaches maxBatchSize", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result1", "result2"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 2 });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2"); // This should trigger processing

        expect(manager.getBatchSize()).toBe(2);

        // Processing should be triggered automatically
        vi.runAllTimers();

        const [result1, result2] = await Promise.all([promise1, promise2]);

        expect(result1).toBe("result1");
        expect(result2).toBe("result2");
        expect(processor.processBatch).toHaveBeenCalledWith(["item1", "item2"]);
      });

      test("should process batch after maxWaitTime", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, {
          maxBatchSize: 10,
          maxWaitTime: 1000,
        });

        const promise = manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        // Fast-forward time to trigger timeout
        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result).toBe("result");
        expect(processor.processBatch).toHaveBeenCalledWith(["item"]);
      });

      test("should respect minBatchSize", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, {
          maxBatchSize: 10,
          maxWaitTime: 1000,
          minBatchSize: 3,
        });

        const promise = manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        // Fast-forward time - should not process yet due to minBatchSize
        vi.advanceTimersByTime(1000);

        // Batch should not be processed yet
        expect(processor.processBatch).not.toHaveBeenCalled();

        // Add more items to reach minBatchSize
        await manager.add("item2");
        await manager.add("item3");

        // Now it should process
        vi.advanceTimersByTime(1000);

        const result = await promise;
        expect(result).toBe("result");
        expect(processor.processBatch).toHaveBeenCalledWith();
      });
    });

    describe("error handling", () => {
      test("should handle fail-fast error strategy", async () => {
        const processor = {
          processBatch: vi.fn().mockRejectedValue(new Error("Batch failed")),
        };

        const manager = new BatchManager(processor, {
          errorHandling: "fail-fast",
          maxBatchSize: 2,
        });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2");

        vi.runAllTimers();

        await expect(promise1).rejects.toThrow("Batch failed");
        await expect(promise2).rejects.toThrow("Batch failed");
      });

      test("should handle continue error strategy with individual processor", async () => {
        const processor = {
          processBatch: vi.fn().mockRejectedValue(new Error("Batch failed")),
          processItem: vi
            .fn()
            .mockResolvedValueOnce("item1-processed")
            .mockRejectedValueOnce(new Error("Item2 failed")),
        };

        const manager = new BatchManager(processor, {
          errorHandling: "continue",
          maxBatchSize: 2,
        });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2");

        vi.runAllTimers();

        const result1 = await promise1;
        expect(result1).toBe("item1-processed");

        await expect(promise2).rejects.toThrow("Item2 failed");
        expect(processor.processItem).toHaveBeenCalledTimes(2);
      });

      test("should handle collect-errors strategy", async () => {
        const processor = {
          processBatch: vi.fn().mockRejectedValue(new Error("Batch failed")),
          processItem: vi
            .fn()
            .mockResolvedValueOnce("item1-processed")
            .mockRejectedValueOnce(new Error("Item2 failed")),
        };

        const manager = new BatchManager(processor, {
          errorHandling: "collect-errors",
          maxBatchSize: 2,
        });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2");

        vi.runAllTimers();

        const result1 = await promise1;
        expect(result1).toBe("item1-processed");

        await expect(promise2).rejects.toThrow("Item2 failed");
        expect(processor.processItem).toHaveBeenCalledTimes(2);
      });

      test("should handle error when no individual processor available", async () => {
        const processor = {
          processBatch: vi.fn().mockRejectedValue(new Error("Batch failed")),
        };

        const manager = new BatchManager(processor, {
          errorHandling: "continue",
          maxBatchSize: 2,
        });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2");

        vi.runAllTimers();

        await expect(promise1).rejects.toThrow("Batch failed");
        await expect(promise2).rejects.toThrow("Batch failed");
      });
    });

    describe("batch management operations", () => {
      test("should flush batch immediately", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 10 });

        const promise = manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        await manager.flush();

        const result = await promise;
        expect(result).toBe("result");
        expect(processor.processBatch).toHaveBeenCalledWith(["item"]);
      });

      test("should clear batch and reject pending items", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 10 });

        const promise = manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        manager.clear();

        expect(manager.getBatchSize()).toBe(0);
        await expect(promise).rejects.toThrow("Batch was cleared");
      });

      test("should wait for idle", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 1 });

        const promise = manager.add("item");
        vi.runAllTimers();

        await manager.waitForIdle();
        await promise;

        expect(processor.processBatch).toHaveBeenCalledWith();
      });

      test("should shutdown properly", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 10 });

        const promise = manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        await manager.shutdown();

        expect(manager.getBatchSize()).toBe(0);
        await expect(promise).rejects.toThrow("Batch was cleared");
      });

      test("should reject new items after shutdown", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor);

        await manager.shutdown();

        await expect(manager.add("item")).rejects.toThrow(
          "BatchManager is shutting down",
        );
      });

      test("should cleanup properly", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const manager = new BatchManager(processor, { maxBatchSize: 10 });

        manager.add("item");
        expect(manager.getBatchSize()).toBe(1);

        await manager.cleanup();

        expect(manager.getBatchSize()).toBe(0);
      });
    });

    describe("processing behavior", () => {
      test("should preserve order when configured", async () => {
        const processor = {
          processBatch: vi.fn().mockImplementation(async (items) => {
            // Return results in same order as input
            return items.map((item, index) => `${item}-${index}`);
          }),
        };

        const manager = new BatchManager(processor, {
          maxBatchSize: 3,
          preserveOrder: true,
        });

        const promise1 = manager.add("first");
        const promise2 = manager.add("second");
        const promise3 = manager.add("third");

        vi.runAllTimers();

        const [result1, result2, result3] = await Promise.all([
          promise1,
          promise2,
          promise3,
        ]);

        expect(result1).toBe("first-0");
        expect(result2).toBe("second-1");
        expect(result3).toBe("third-2");
      });

      test("should handle incorrect number of results", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["single-result"]), // Wrong count
        };

        const manager = new BatchManager(processor, { maxBatchSize: 2 });

        const promise1 = manager.add("item1");
        const promise2 = manager.add("item2");

        vi.runAllTimers();

        await expect(promise1).rejects.toThrow(
          "Batch processing returned incorrect number of results",
        );
        await expect(promise2).rejects.toThrow(
          "Batch processing returned incorrect number of results",
        );
      });
    });
  });

  describe("batch Decorator", () => {
    test("should create batch decorator", () => {
      const decorator = Batch({ maxBatchSize: 5 });

      expect(typeof decorator).toBe("function");
    });

    test("should decorate method with batch processing", async () => {
      class TestService {
        @Batch({ maxBatchSize: 2 })
        async processItems(items: string[]): Promise<string[]> {
          return items.map((item) => `processed-${item}`);
        }
      }

      const service = new TestService();

      // Call the decorated method - it should now accept single items
      const promise1 = (service as any).processItems("item1", "id1");
      const promise2 = (service as any).processItems("item2", "id2");

      vi.runAllTimers();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("processed-item1");
      expect(result2).toBe("processed-item2");
    });

    test("should handle cleanup on destroy", async () => {
      class TestService {
        @Batch({ maxBatchSize: 2 })
        async processItems(items: string[]): Promise<string[]> {
          return items.map((item) => `processed-${item}`);
        }

        async destroy() {
          // Original destroy method
        }
      }

      const service = new TestService();
      const originalDestroy = service.destroy;

      // Call decorated method to create manager
      (service as any).processItems("item1");

      // Destroy should now cleanup batch managers
      await service.destroy();

      expect(service.destroy).not.toBe(originalDestroy);
    });
  });

  describe("utility Functions", () => {
    describe("createBatchProcessor", () => {
      test("should create batch processor with all callbacks", () => {
        const onProgress = vi.fn();
        const onComplete = vi.fn();
        const processBatch = vi.fn().mockResolvedValue([]);

        const processor = createBatchProcessor({
          name: "test-processor",
          onProgress,
          onComplete,
          processBatch,
        });

        expect(processor.name).toBe("test-processor");
        expect(processor.onProgress).toBe(onProgress);
        expect(processor.onComplete).toBe(onComplete);
        expect(processor.processBatch).toBe(processBatch);
      });
    });

    describe("createSimpleBatchProcessor", () => {
      test("should create simple batch processor", () => {
        const batchFn = vi.fn().mockResolvedValue(["result1", "result2"]);
        const itemFn = vi.fn().mockResolvedValue("single-result");

        const processor = createSimpleBatchProcessor(batchFn, itemFn);

        expect(processor.processBatch).toBe(batchFn);
        expect(processor.processItem).toBe(itemFn);
      });

      test("should create processor without item function", () => {
        const batchFn = vi.fn().mockResolvedValue(["result"]);

        const processor = createSimpleBatchProcessor(batchFn);

        expect(processor.processBatch).toBe(batchFn);
        expect(processor.processItem).toBeUndefined();
      });
    });

    describe("withBatch", () => {
      test("should create batch function wrapper", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["processed"]),
        };

        const batchFn = withBatch(processor, { maxBatchSize: 1 });

        const result = await batchFn("test-item");

        expect(result).toBe("processed");
        expect(processor.processBatch).toHaveBeenCalledWith(["test-item"]);
      });

      test("should handle custom item IDs", async () => {
        const processor = {
          processBatch: vi.fn().mockResolvedValue(["result"]),
        };

        const batchFn = withBatch(processor, { maxBatchSize: 1 });

        const result = await batchFn("test-item", "custom-id");

        expect(result).toBe("result");
      });
    });
  });

  describe("integration Tests", () => {
    test("should handle complex batch processing scenario", async () => {
      interface DataItem {
        id: string;
        value: number;
      }

      const processor = {
        processBatch: vi.fn().mockImplementation(async (items: DataItem[]) => {
          return items.map((item) => ({
            id: item.id,
            processedValue: item.value * 2,
            timestamp: Date.now(),
          }));
        }),
        processItem: vi.fn().mockImplementation(async (item: DataItem) => {
          return {
            id: item.id,
            processedValue: item.value * 2,
            timestamp: Date.now(),
          };
        }),
      };

      const manager = new BatchManager(processor, {
        maxBatchSize: 3,
        maxWaitTime: 1000,
        errorHandling: "continue",
        preserveOrder: true,
      });

      const items: DataItem[] = [
        { id: "item1", value: 10 },
        { id: "item2", value: 20 },
        { id: "item3", value: 30 },
        { id: "item4", value: 40 },
      ];

      const promises = items.map((item) => manager.add(item));

      vi.runAllTimers();

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0].processedValue).toBe(20);
      expect(results[1].processedValue).toBe(40);
      expect(results[2].processedValue).toBe(60);
      expect(results[3].processedValue).toBe(80);

      // Should have called batch processor twice (3 items + 1 item)
      expect(processor.processBatch).toHaveBeenCalledTimes(2);
    });

    test("should handle mixed success and failure scenarios", async () => {
      const processor = {
        processBatch: vi.fn().mockImplementation(async (items: string[]) => {
          return items.map((item, index) => {
            if (item.includes("fail")) {
              throw new Error(`Processing failed for ${item}`);
            }
            return `processed-${item}`;
          });
        }),
        processItem: vi.fn().mockImplementation(async (item: string) => {
          if (item.includes("fail")) {
            throw new Error(`Individual processing failed for ${item}`);
          }
          return `individually-processed-${item}`;
        }),
      };

      const manager = new BatchManager(processor, {
        maxBatchSize: 3,
        errorHandling: "continue",
      });

      const promise1 = manager.add("success1");
      const promise2 = manager.add("fail-item");
      const promise3 = manager.add("success2");

      vi.runAllTimers();

      const result1 = await promise1;
      const result3 = await promise3;

      expect(result1).toBe("individually-processed-success1");
      expect(result3).toBe("individually-processed-success2");

      await expect(promise2).rejects.toThrow(
        "Individual processing failed for fail-item",
      );
    });

    test("should handle concurrent batch operations", async () => {
      const processor = {
        processBatch: vi.fn().mockImplementation(async (items: string[]) => {
          // Simulate processing delay
          await new Promise((resolve) => setTimeout(resolve, 10));
          return items.map((item) => `batch-${item}`);
        }),
      };

      const manager = new BatchManager(processor, {
        maxBatchSize: 2,
        concurrency: 2,
      });

      // Add items in rapid succession
      const promises = Array.from({ length: 8 }, (_, i) =>
        manager.add(`item-${i}`),
      );

      vi.runAllTimers();

      const results = await Promise.all(promises);

      expect(results).toHaveLength(8);
      results.forEach((result, index) => {
        expect(result).toBe(`batch-item-${index}`);
      });

      // Should have processed in batches
      expect(processor.processBatch).toHaveBeenCalledTimes(4);
    });
  });

  describe("error Handling and Edge Cases", () => {
    test("should handle processing lock correctly", async () => {
      const processor = {
        processBatch: vi.fn().mockImplementation(async (items) => {
          // Simulate slow processing
          await new Promise((resolve) => setTimeout(resolve, 100));
          return items.map((item) => `processed-${item}`);
        }),
      };

      const manager = new BatchManager(processor, { maxBatchSize: 1 });

      // Add multiple items quickly
      const promise1 = manager.add("item1");
      const promise2 = manager.add("item2");

      vi.runAllTimers();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("processed-item1");
      expect(result2).toBe("processed-item2");
    });

    test("should handle cleanup during processing", async () => {
      const processor = {
        processBatch: vi.fn().mockResolvedValue(["result"]),
      };

      const manager = new BatchManager(processor, { maxBatchSize: 10 });

      manager.add("item");

      // Start cleanup while item is in batch
      await manager.cleanup();

      expect(manager.getBatchSize()).toBe(0);
    });

    test("should handle timer cleanup properly", async () => {
      const processor = {
        processBatch: vi.fn().mockResolvedValue(["result"]),
      };

      const manager = new BatchManager(processor, {
        maxBatchSize: 10,
        maxWaitTime: 5000,
      });

      manager.add("item");

      // Clear before timer expires
      manager.clear();

      // Advance time
      vi.advanceTimersByTime(6000);

      // Should not have processed
      expect(processor.processBatch).not.toHaveBeenCalled();
    });

    test("should handle processing errors during cleanup", async () => {
      const processor = {
        processBatch: vi.fn().mockRejectedValue(new Error("Cleanup error")),
      };

      const manager = new BatchManager(processor, { maxBatchSize: 10 });

      manager.add("item");

      // Cleanup should handle errors gracefully
      await expect(manager.cleanup()).resolves.not.toThrow();
    });
  });
});
