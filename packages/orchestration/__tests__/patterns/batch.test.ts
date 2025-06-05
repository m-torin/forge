import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBatchProcessor } from '../../src/shared/patterns/batch';
import { setupUpstashMocks, resetUpstashMocks } from '../utils/upstash-mocks';
import type { BatchItem, BatchResult, BatchContext } from '../../src/shared/types/index';

describe('Batch Processing', () => {
  let mocks: ReturnType<typeof setupUpstashMocks>;

  beforeEach(() => {
    mocks = setupUpstashMocks();
  });

  afterEach(() => {
    resetUpstashMocks(mocks);
  });

  describe('Batch Processor Creation', () => {
    test('should create batch processor with basic configuration', () => {
      interface DataRecord {
        id: string;
        value: number;
      }

      const processor = createBatchProcessor<DataRecord, number>({
        name: 'number-processor',
        processBatch: async (batch) => {
          return batch.map((item) => ({
            id: item.id,
            success: true,
            result: item.data.value * 2,
          }));
        },
      });

      expect(processor.name).toBe('number-processor');
      expect(processor.processBatch).toBeInstanceOf(Function);
    });

    test('should create processor with progress tracking', () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      const processor = createBatchProcessor({
        name: 'progress-processor',
        processBatch: async (batch) => {
          return batch.map((item) => ({
            id: item.id,
            success: true,
            result: item.data,
          }));
        },
        onProgress,
        onComplete,
      });

      expect(processor.onProgress).toBe(onProgress);
      expect(processor.onComplete).toBe(onComplete);
    });
  });

  describe('Batch Processing Execution', () => {
    test('should process simple batch successfully', async () => {
      interface SimpleData {
        id: number;
        name: string;
      }

      const processor = createBatchProcessor<SimpleData, string>({
        name: 'simple-processor',
        processBatch: async (batch) => {
          return batch.map((item) => ({
            id: item.id,
            success: true,
            result: `Processed: ${item.data.name}`,
          }));
        },
      });

      const items: BatchItem<SimpleData>[] = [
        { id: 'item1', data: { id: 1, name: 'Alice' } },
        { id: 'item2', data: { id: 2, name: 'Bob' } },
        { id: 'item3', data: { id: 3, name: 'Charlie' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        workflowId: 'workflow_test',
        processedCount: 0,
        totalCount: 3,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        id: 'item1',
        success: true,
        result: 'Processed: Alice',
      });
      expect(results[1].result).toBe('Processed: Bob');
      expect(results[2].result).toBe('Processed: Charlie');
    });

    test('should handle batch processing errors', async () => {
      interface ErrorData {
        id: number;
        shouldFail: boolean;
      }

      const processor = createBatchProcessor<ErrorData, string>({
        name: 'error-processor',
        processBatch: async (batch) => {
          return batch.map((item) => {
            if (item.data.shouldFail) {
              return {
                id: item.id,
                success: false,
                error: `Processing failed for item ${item.data.id}`,
              };
            }
            return {
              id: item.id,
              success: true,
              result: `Success: ${item.data.id}`,
            };
          });
        },
      });

      const items: BatchItem<ErrorData>[] = [
        { id: 'item1', data: { id: 1, shouldFail: false } },
        { id: 'item2', data: { id: 2, shouldFail: true } },
        { id: 'item3', data: { id: 3, shouldFail: false } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        workflowId: 'workflow_test',
        processedCount: 0,
        totalCount: 3,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Processing failed for item 2');
      expect(results[2].success).toBe(true);
    });

    test('should call progress callbacks', async () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      const processor = createBatchProcessor({
        name: 'progress-test',
        processBatch: async (batch, context) => {
          // Simulate progress updates
          for (let i = 0; i < batch.length; i++) {
            await context.updateProgress({
              processed: i + 1,
              total: batch.length,
              percentage: ((i + 1) / batch.length) * 100,
              batchId: context.batchId,
            });
          }

          return batch.map((item) => ({
            id: item.id,
            success: true,
            result: item.data,
          }));
        },
        onProgress,
        onComplete,
      });

      const items: BatchItem<any>[] = [
        { id: 'item1', data: { value: 1 } },
        { id: 'item2', data: { value: 2 } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        workflowId: 'workflow_test',
        processedCount: 0,
        totalCount: 2,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      await processor.processBatch(items, mockContext);

      // Progress should be updated for each item
      expect(mockContext.updateProgress).toHaveBeenCalledTimes(2);
      expect(mockContext.updateProgress).toHaveBeenCalledWith({
        processed: 1,
        total: 2,
        percentage: 50,
        batchId: 'batch_123',
      });
      expect(mockContext.updateProgress).toHaveBeenCalledWith({
        processed: 2,
        total: 2,
        percentage: 100,
        batchId: 'batch_123',
      });
    });
  });

  describe('Large Dataset Processing', () => {
    test('should handle large batches with chunking', async () => {
      interface LargeData {
        id: number;
        value: string;
      }

      const processor = createBatchProcessor<LargeData, string>({
        name: 'large-processor',
        processBatch: async (batch, context) => {
          // Simulate processing large batch in chunks
          const chunkSize = 100;
          const results: BatchResult<string>[] = [];

          for (let i = 0; i < batch.length; i += chunkSize) {
            const chunk = batch.slice(i, i + chunkSize);

            // Process chunk
            const chunkResults = chunk.map((item) => ({
              id: item.id,
              success: true,
              result: `Processed ${item.data.value}`,
            }));

            results.push(...chunkResults);

            // Update progress
            await context.updateProgress({
              processed: Math.min(i + chunkSize, batch.length),
              total: batch.length,
              percentage: (Math.min(i + chunkSize, batch.length) / batch.length) * 100,
              batchId: context.batchId,
            });
          }

          return results;
        },
      });

      // Create large dataset
      const items: BatchItem<LargeData>[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `item_${i}`,
        data: { id: i, value: `value_${i}` },
      }));

      const mockContext: BatchContext = {
        batchId: 'large_batch_123',
        workflowId: 'large_workflow',
        processedCount: 0,
        totalCount: 1000,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(1000);
      expect(results[0].result).toBe('Processed value_0');
      expect(results[999].result).toBe('Processed value_999');

      // Progress should be updated multiple times for chunks
      expect(mockContext.updateProgress).toHaveBeenCalledTimes(10); // 1000 / 100 chunks
    });

    test('should handle memory-efficient streaming', async () => {
      interface StreamData {
        id: string;
        size: number;
      }

      let processedCount = 0;
      const processor = createBatchProcessor<StreamData, number>({
        name: 'stream-processor',
        processBatch: async (batch, context) => {
          // Simulate memory-efficient processing
          const results: BatchResult<number>[] = [];

          for (const item of batch) {
            // Process one item at a time to manage memory
            try {
              const result = item.data.size * 2;
              results.push({
                id: item.id,
                success: true,
                result,
              });
              processedCount++;

              // Emit progress for each item
              await context.events.emit('item.processed', {
                itemId: item.id,
                processedCount,
                totalCount: context.totalCount,
              });
            } catch (error) {
              results.push({
                id: item.id,
                success: false,
                error: error instanceof Error ? error.message : 'Processing failed',
              });
            }
          }

          return results;
        },
      });

      const items: BatchItem<StreamData>[] = Array.from({ length: 50 }, (_, i) => ({
        id: `stream_${i}`,
        data: { id: `stream_${i}`, size: i + 1 },
      }));

      const mockContext: BatchContext = {
        batchId: 'stream_batch',
        workflowId: 'stream_workflow',
        processedCount: 0,
        totalCount: 50,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(50);
      expect(results.every((r) => r.success)).toBe(true);
      expect(mockContext.events.emit).toHaveBeenCalledTimes(50);
      expect(processedCount).toBe(50);
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle partial batch failures', async () => {
      interface FailureData {
        id: number;
        operation: 'pass' | 'fail' | 'error';
      }

      const processor = createBatchProcessor<FailureData, string>({
        name: 'failure-processor',
        processBatch: async (batch) => {
          return batch.map((item) => {
            switch (item.data.operation) {
              case 'pass':
                return {
                  id: item.id,
                  success: true,
                  result: `Success: ${item.data.id}`,
                };
              case 'fail':
                return {
                  id: item.id,
                  success: false,
                  error: `Business logic failure for ${item.data.id}`,
                };
              case 'error':
                throw new Error(`System error for ${item.data.id}`);
              default:
                return {
                  id: item.id,
                  success: false,
                  error: 'Unknown operation',
                };
            }
          });
        },
      });

      const items: BatchItem<FailureData>[] = [
        { id: 'item1', data: { id: 1, operation: 'pass' } },
        { id: 'item2', data: { id: 2, operation: 'fail' } },
        { id: 'item3', data: { id: 3, operation: 'pass' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'failure_batch',
        workflowId: 'failure_workflow',
        processedCount: 0,
        totalCount: 3,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Business logic failure for 2');
      expect(results[2].success).toBe(true);
    });

    test('should handle processor-level errors', async () => {
      const processor = createBatchProcessor({
        name: 'error-processor',
        processBatch: async () => {
          throw new Error('Processor-level error');
        },
      });

      const items: BatchItem<any>[] = [{ id: 'item1', data: { value: 1 } }];

      const mockContext: BatchContext = {
        batchId: 'error_batch',
        workflowId: 'error_workflow',
        processedCount: 0,
        totalCount: 1,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      await expect(processor.processBatch(items, mockContext)).rejects.toThrow(
        'Processor-level error',
      );
    });
  });

  describe('Complex Batch Scenarios', () => {
    test('should handle data transformation pipeline', async () => {
      interface RawData {
        id: string;
        rawValue: string;
        category: string;
      }

      interface ProcessedData {
        id: string;
        normalizedValue: number;
        category: string;
        processedAt: Date;
      }

      const transformationProcessor = createBatchProcessor<RawData, ProcessedData>({
        name: 'data-transformation',
        processBatch: async (batch, context) => {
          const results: BatchResult<ProcessedData>[] = [];

          for (const item of batch) {
            try {
              // Simulate data validation
              if (!item.data.rawValue || !item.data.category) {
                results.push({
                  id: item.id,
                  success: false,
                  error: 'Missing required fields',
                });
                continue;
              }

              // Simulate data transformation
              const normalizedValue = parseFloat(item.data.rawValue);
              if (isNaN(normalizedValue)) {
                results.push({
                  id: item.id,
                  success: false,
                  error: 'Invalid numeric value',
                });
                continue;
              }

              // Simulate processing delay
              await new Promise((resolve) => setTimeout(resolve, 10));

              const processed: ProcessedData = {
                id: item.data.id,
                normalizedValue,
                category: item.data.category.toLowerCase(),
                processedAt: new Date(),
              };

              results.push({
                id: item.id,
                success: true,
                result: processed,
              });

              // Emit processing event
              await context.events.emit('data.transformed', {
                originalId: item.data.id,
                category: processed.category,
                value: processed.normalizedValue,
              });
            } catch (error) {
              results.push({
                id: item.id,
                success: false,
                error: error instanceof Error ? error.message : 'Processing failed',
              });
            }
          }

          return results;
        },
        onProgress: async (progress, context) => {
          await context.events.emit('transformation.progress', {
            batchId: context.batchId,
            processed: progress.processed,
            total: progress.total,
            percentage: progress.percentage,
          });
        },
        onComplete: async (summary, context) => {
          await context.events.emit('transformation.complete', {
            batchId: context.batchId,
            totalProcessed: summary.totalProcessed,
            successful: summary.successful,
            failed: summary.failed,
            duration: summary.duration,
          });
        },
      });

      const rawData: BatchItem<RawData>[] = [
        { id: 'raw1', data: { id: 'data1', rawValue: '123.45', category: 'SALES' } },
        { id: 'raw2', data: { id: 'data2', rawValue: 'invalid', category: 'MARKETING' } },
        { id: 'raw3', data: { id: 'data3', rawValue: '67.89', category: 'SUPPORT' } },
        { id: 'raw4', data: { id: 'data4', rawValue: '', category: 'SALES' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'transform_batch',
        workflowId: 'etl_pipeline',
        processedCount: 0,
        totalCount: 4,
        events: { emit: vi.fn() },
        updateProgress: vi.fn(),
      };

      const results = await transformationProcessor.processBatch(rawData, mockContext);

      expect(results).toHaveLength(4);

      // Check successful transformations
      expect(results[0].success).toBe(true);
      expect((results[0].result as ProcessedData).normalizedValue).toBe(123.45);
      expect((results[0].result as ProcessedData).category).toBe('sales');

      // Check validation failures
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Invalid numeric value');

      expect(results[3].success).toBe(false);
      expect(results[3].error).toBe('Missing required fields');

      // Verify events were emitted
      expect(mockContext.events.emit).toHaveBeenCalledWith('data.transformed', expect.any(Object));
    });
  });
});
