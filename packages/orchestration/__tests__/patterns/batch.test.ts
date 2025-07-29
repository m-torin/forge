import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { resetCombinedUpstashMocks, setupCombinedUpstashMocks } from '@repo/qa';
import {
  type BatchContext,
  type BatchItem,
  type BatchResult,
  createBatchProcessor,
} from '../../src/shared/patterns/batch';

describe('batch Processing', () => {
  let mocks: ReturnType<typeof setupCombinedUpstashMocks>;

  beforeEach(() => {
    mocks = setupCombinedUpstashMocks();
  });

  afterEach(() => {
    resetCombinedUpstashMocks(mocks);
  });

  describe('batch Processor Creation', () => {
    test('should create batch processor with basic configuration', () => {
      interface DataRecord {
        id: string;
        value: number;
      }

      const processor = createBatchProcessor<DataRecord, number>({
        name: 'number-processor',
        processBatch: async (batch: any) => {
          return batch.map((item: any) => ({
            id: item.id,
            result: item.data.value * 2,
            success: true,
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
        onComplete,
        onProgress,
        processBatch: async (batch: any) => {
          return batch.map((item: any) => ({
            id: item.id,
            result: item.data,
            success: true,
          }));
        },
      });

      expect(processor.onProgress).toBe(onProgress);
      expect(processor.onComplete).toBe(onComplete);
    });
  });

  describe('batch Processing Execution', () => {
    test('should process simple batch successfully', async () => {
      interface SimpleData {
        id: number;
        name: string;
      }

      const processor = createBatchProcessor<SimpleData, string>({
        name: 'simple-processor',
        processBatch: async (batch: any) => {
          return batch.map((item: any) => ({
            id: item.id,
            result: `Processed: ${item.data.name}`,
            success: true,
          }));
        },
      });

      const items: BatchItem<SimpleData>[] = [
        { id: 'item1', addedAt: new Date(), data: { id: 1, name: 'Alice' } },
        { id: 'item2', addedAt: new Date(), data: { id: 2, name: 'Bob' } },
        { id: 'item3', addedAt: new Date(), data: { id: 3, name: 'Charlie' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 3,
        updateProgress: vi.fn(),
        workflowId: 'workflow_test',
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0]).toStrictEqual({
        id: 'item1',
        result: 'Processed: Alice',
        success: true,
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
        processBatch: async (batch: any) => {
          return batch.map((item: any) => {
            if (item.data.shouldFail) {
              return {
                id: item.id,
                error: `Processing failed for item ${item.data.id}`,
                success: false,
              };
            }
            return {
              id: item.id,
              result: `Success: ${item.data.id}`,
              success: true,
            };
          });
        },
      });

      const items: BatchItem<ErrorData>[] = [
        { id: 'item1', addedAt: new Date(), data: { id: 1, shouldFail: false } },
        { id: 'item2', addedAt: new Date(), data: { id: 2, shouldFail: true } },
        { id: 'item3', addedAt: new Date(), data: { id: 3, shouldFail: false } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 3,
        updateProgress: vi.fn(),
        workflowId: 'workflow_test',
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBeTruthy();
      expect(results[1].success).toBeFalsy();
      expect(results[1].error).toBe('Processing failed for item 2');
      expect(results[2].success).toBeTruthy();
    });

    test('should call progress callbacks', async () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();

      const processor = createBatchProcessor({
        name: 'progress-test',
        onComplete,
        onProgress,
        processBatch: async (batch: BatchItem[], context?: BatchContext) => {
          // Simulate progress updates
          for (let i = 0; i < batch.length; i++) {
            await context?.updateProgress({
              batchId: context?.batchId || '',
              percentage: ((i + 1) / batch.length) * 100,
              processed: i + 1,
              total: batch.length,
            });
          }

          return batch.map((item: any) => ({
            id: item.id,
            result: item.data,
            success: true,
          }));
        },
      });

      const items: BatchItem<any>[] = [
        { id: 'item1', addedAt: new Date(), data: { value: 1 } },
        { id: 'item2', addedAt: new Date(), data: { value: 2 } },
      ];

      const mockContext: BatchContext = {
        batchId: 'batch_123',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 2,
        updateProgress: vi.fn(),
        workflowId: 'workflow_test',
      };

      await processor.processBatch(items, mockContext);

      // Progress should be updated for each item
      expect(mockContext.updateProgress).toHaveBeenCalledTimes(2);
      expect(mockContext.updateProgress).toHaveBeenCalledWith({
        batchId: 'batch_123',
        percentage: 50,
        processed: 1,
        total: 2,
      });
      expect(mockContext.updateProgress).toHaveBeenCalledWith({
        batchId: 'batch_123',
        percentage: 100,
        processed: 2,
        total: 2,
      });
    });
  });

  describe('large Dataset Processing', () => {
    test('should handle large batches with chunking', async () => {
      interface LargeData {
        id: number;
        value: string;
      }

      const processor = createBatchProcessor<LargeData, string>({
        name: 'large-processor',
        processBatch: async (batch: BatchItem[], context?: BatchContext) => {
          // Simulate processing large batch in chunks
          const chunkSize = 100;
          const results: BatchResult<string>[] = [];

          for (let i = 0; i < batch.length; i += chunkSize) {
            const chunk = batch.slice(i, i + chunkSize);

            // Process chunk
            const chunkResults = chunk.map((item: any) => ({
              id: item.id,
              result: `Processed ${item.data.value}`,
              success: true,
            }));

            results.push(...chunkResults);

            // Update progress
            await context?.updateProgress({
              batchId: context?.batchId,
              percentage: (Math.min(i + chunkSize, batch.length) / batch.length) * 100,
              processed: Math.min(i + chunkSize, batch.length),
              total: batch.length,
            });
          }

          return results;
        },
      });

      // Create large dataset
      const items: BatchItem<LargeData>[] = Array.from({ length: 1000 }, (_, i: any) => ({
        id: `item_${i}`,
        addedAt: new Date(),
        data: { id: i, value: `value_${i}` },
      }));

      const mockContext: BatchContext = {
        batchId: 'large_batch_123',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 1000,
        updateProgress: vi.fn(),
        workflowId: 'large_workflow',
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

      let processedItems = 0;
      const processor = createBatchProcessor<StreamData, number>({
        name: 'stream-processor',
        processBatch: async (batch: BatchItem[], context?: BatchContext) => {
          // Simulate memory-efficient processing
          const results: BatchResult<number>[] = [];

          for (const item of batch) {
            // Process one item at a time to manage memory
            try {
              const result = item.data.size * 2;
              results.push({
                id: item.id,
                result,
                success: true,
              });
              processedItems++;

              // Emit progress for each item
              await context?.events.emit('item.processed', {
                itemId: item.id,
                processedItems,
                totalCount: context?.totalCount,
              });
            } catch (error: any) {
              results.push({
                id: item.id,
                error:
                  error instanceof Error
                    ? (error as Error).message || 'Unknown error'
                    : 'Processing failed',
                success: false,
              });
            }
          }

          return results;
        },
      });

      const items: BatchItem<StreamData>[] = Array.from({ length: 50 }, (_, i: any) => ({
        id: `stream_${i}`,
        addedAt: new Date(),
        data: { id: `stream_${i}`, size: i + 1 },
      }));

      const mockContext: BatchContext = {
        batchId: 'stream_batch',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 50,
        updateProgress: vi.fn(),
        workflowId: 'stream_workflow',
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(50);
      expect(results.every((r: any) => r.success)).toBeTruthy();
      expect(mockContext.events.emit).toHaveBeenCalledTimes(50);
      expect(processedItems).toBe(50);
    });
  });

  describe('error Handling and Resilience', () => {
    test('should handle partial batch failures', async () => {
      interface FailureData {
        id: number;
        operation: 'error' | 'fail' | 'pass';
      }

      const processor = createBatchProcessor<FailureData, string>({
        name: 'failure-processor',
        processBatch: async (batch: any) => {
          return batch.map((item: any) => {
            switch (item.data.operation) {
              case 'fail':
                return {
                  id: item.id,
                  error: `Business logic failure for ${item.data.id}`,
                  success: false,
                };
              case 'pass':
                return {
                  id: item.id,
                  result: `Success: ${item.data.id}`,
                  success: true,
                };
              case 'error':
                throw new Error(`System error for ${item.data.id}`);
              default:
                return {
                  id: item.id,
                  error: 'Unknown operation',
                  success: false,
                };
            }
          });
        },
      });

      const items: BatchItem<FailureData>[] = [
        { id: 'item1', addedAt: new Date(), data: { id: 1, operation: 'pass' } },
        { id: 'item2', addedAt: new Date(), data: { id: 2, operation: 'fail' } },
        { id: 'item3', addedAt: new Date(), data: { id: 3, operation: 'pass' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'failure_batch',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 3,
        updateProgress: vi.fn(),
        workflowId: 'failure_workflow',
      };

      const results = await processor.processBatch(items, mockContext);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBeTruthy();
      expect(results[1].success).toBeFalsy();
      expect(results[1].error).toBe('Business logic failure for 2');
      expect(results[2].success).toBeTruthy();
    });

    test('should handle processor-level errors', async () => {
      const processor = createBatchProcessor({
        name: 'error-processor',
        processBatch: async () => {
          throw new Error('Processor-level error');
        },
      });

      const items: BatchItem<any>[] = [{ id: 'item1', addedAt: new Date(), data: { value: 1 } }];

      const mockContext: BatchContext = {
        batchId: 'error_batch',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 1,
        updateProgress: vi.fn(),
        workflowId: 'error_workflow',
      };

      await expect(processor.processBatch(items, mockContext)).rejects.toThrow(
        'Processor-level error',
      );
    });
  });

  describe('complex Batch Scenarios', () => {
    test('should handle data transformation pipeline', async () => {
      interface RawData {
        category: string;
        id: string;
        rawValue: string;
      }

      interface ProcessedData {
        category: string;
        id: string;
        normalizedValue: number;
        processedAt: Date;
      }

      const transformationProcessor = createBatchProcessor<RawData, ProcessedData>({
        name: 'data-transformation',
        onComplete: async (summary: any, context?: BatchContext) => {
          await context?.events.emit('transformation.complete', {
            batchId: context?.batchId,
            duration: summary.duration,
            failed: summary.failed,
            successful: summary.successful,
            totalProcessed: summary.totalProcessed,
          });
        },
        onProgress: async (progress: any, context?: BatchContext) => {
          await context?.events.emit('transformation.progress', {
            batchId: context?.batchId,
            percentage: progress.percentage,
            processed: progress.processed,
            total: progress.total,
          });
        },
        processBatch: async (batch: BatchItem[], context?: BatchContext) => {
          const results: BatchResult<ProcessedData>[] = [];

          for (const item of batch) {
            try {
              // Simulate data validation
              if (!item.data.rawValue || !item.data.category) {
                results.push({
                  id: item.id,
                  error: 'Missing required fields',
                  success: false,
                });
                continue;
              }

              // Simulate data transformation
              const normalizedValue = parseFloat(item.data.rawValue);
              if (isNaN(normalizedValue)) {
                results.push({
                  id: item.id,
                  error: 'Invalid numeric value',
                  success: false,
                });
                continue;
              }

              // Simulate processing delay
              await new Promise((resolve: any) => setTimeout(resolve, 10));

              const processed: ProcessedData = {
                id: item.data.id,
                category: item.data.category.toLowerCase(),
                normalizedValue,
                processedAt: new Date(),
              };

              results.push({
                id: item.id,
                result: processed,
                success: true,
              });

              // Emit processing event
              await context?.events.emit('data.transformed', {
                category: processed.category,
                originalId: item.data.id,
                value: processed.normalizedValue,
              });
            } catch (error: any) {
              results.push({
                id: item.id,
                error:
                  error instanceof Error
                    ? (error as Error).message || 'Unknown error'
                    : 'Processing failed',
                success: false,
              });
            }
          }

          return results;
        },
      });

      const rawData: BatchItem<RawData>[] = [
        {
          id: 'raw1',
          addedAt: new Date(),
          data: { id: 'data1', category: 'SALES', rawValue: '123.45' },
        },
        {
          id: 'raw2',
          addedAt: new Date(),
          data: { id: 'data2', category: 'MARKETING', rawValue: 'invalid' },
        },
        {
          id: 'raw3',
          addedAt: new Date(),
          data: { id: 'data3', category: 'SUPPORT', rawValue: '67.89' },
        },
        { id: 'raw4', addedAt: new Date(), data: { id: 'data4', category: 'SALES', rawValue: '' } },
      ];

      const mockContext: BatchContext = {
        batchId: 'transform_batch',
        events: { emit: vi.fn() },
        processedItems: 0,
        totalCount: 4,
        updateProgress: vi.fn(),
        workflowId: 'etl_pipeline',
      };

      const results = await transformationProcessor.processBatch(rawData, mockContext);

      expect(results).toHaveLength(4);

      // Check successful transformations
      expect(results[0].success).toBeTruthy();
      expect((results[0].result as ProcessedData).normalizedValue).toBe(123.45);
      expect((results[0].result as ProcessedData).category).toBe('sales');

      // Check validation failures
      expect(results[1].success).toBeFalsy();
      expect(results[1].error).toBe('Invalid numeric value');

      expect(results[3].success).toBeFalsy();
      expect(results[3].error).toBe('Missing required fields');

      // Verify events were emitted
      expect(mockContext.events.emit).toHaveBeenCalledWith('data.transformed', expect.any(Object));
    });
  });
});
