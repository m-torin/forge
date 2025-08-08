/**
 * Streaming Backpressure and Interruption Tests
 * Testing streaming interruption, resumption, backpressure handling, and flow control
 */

import { afterEach, beforeEach, describe, expect } from 'vitest';
import {
  BackpressureController,
  type StreamItem,
} from '../../../src/server/streaming/backpressure';
import {
  BufferOptimizationEngine,
  QoSFlowController,
} from '../../../src/server/streaming/buffer-optimization';

describe('backpressureController Advanced Features', () => {
  let controller: BackpressureController;

  beforeEach(() => {
    controller = new BackpressureController({
      maxBufferSize: 100,
      watermarks: {
        low: 25,
        high: 75,
      },
      retryConfig: {
        maxRetries: 3,
        baseDelay: 100,
        maxDelay: 1000,
      },
      memoryManagement: {
        enableMemoryTracking: true,
        maxMemoryMB: 50,
        gcThreshold: 0.8,
        cleanupInterval: 5000,
      },
    });
  });

  afterEach(() => {
    controller.destroy();
  });

  describe('stream Interruption and Resumption', () => {
    test('should handle stream interruption gracefully', async () => {
      const streamId = 'interruption-test-stream';

      // Start streaming with buffered items
      const items: StreamItem[] = [
        { id: '1', data: 'item1', timestamp: Date.now(), priority: 1 },
        { id: '2', data: 'item2', timestamp: Date.now(), priority: 1 },
        { id: '3', data: 'item3', timestamp: Date.now(), priority: 1 },
      ];

      controller.addToBuffer(streamId, items[0]);
      controller.addToBuffer(streamId, items[1]);
      controller.addToBuffer(streamId, items[2]);

      expect(controller.getBufferSize(streamId)).toBe(3);

      // Interrupt the stream
      const interruptResult = controller.interruptStream(streamId, {
        reason: 'user_requested',
        preserveBuffer: true,
        graceful: true,
      });

      expect(interruptResult.success).toBeTruthy();
      expect(interruptResult.bufferPreserved).toBeTruthy();
      expect(controller.isStreamActive(streamId)).toBeFalsy();
      expect(controller.getBufferSize(streamId)).toBe(3); // Buffer preserved
    });

    test('should resume interrupted streams with preserved state', async () => {
      const streamId = 'resumption-test-stream';

      // Setup initial stream state
      const items: StreamItem[] = [
        { id: '1', data: 'item1', timestamp: Date.now(), priority: 1 },
        { id: '2', data: 'item2', timestamp: Date.now(), priority: 2 },
      ];

      controller.addToBuffer(streamId, items[0]);
      controller.addToBuffer(streamId, items[1]);

      // Interrupt with state preservation
      controller.interruptStream(streamId, {
        reason: 'network_error',
        preserveBuffer: true,
        saveState: true,
      });

      // Resume stream
      const resumeResult = controller.resumeStream(streamId, {
        restoreState: true,
        validateIntegrity: true,
      });

      expect(resumeResult.success).toBeTruthy();
      expect(resumeResult.stateRestored).toBeTruthy();
      expect(controller.isStreamActive(streamId)).toBeTruthy();
      expect(controller.getBufferSize(streamId)).toBe(2);

      // Verify items are in correct order
      const nextItem = controller.getNextItem(streamId);
      expect(nextItem?.id).toBe('2'); // Higher priority item should come first
    });

    test('should handle partial stream corruption during interruption', async () => {
      const streamId = 'corruption-test-stream';

      // Add items with potential corruption markers
      const corruptedItem: StreamItem = {
        id: 'corrupt',
        data: null, // Corrupted data
        timestamp: Date.now(),
        priority: 1,
        metadata: { corrupted: true },
      };

      const validItem: StreamItem = {
        id: 'valid',
        data: 'valid-data',
        timestamp: Date.now(),
        priority: 1,
      };

      controller.addToBuffer(streamId, validItem);
      controller.addToBuffer(streamId, corruptedItem);

      // Interrupt and validate integrity
      controller.interruptStream(streamId, {
        reason: 'data_corruption',
        validateIntegrity: true,
        cleanupCorrupted: true,
      });

      const resumeResult = controller.resumeStream(streamId, {
        validateIntegrity: true,
        skipCorrupted: true,
      });

      expect(resumeResult.success).toBeTruthy();
      expect(resumeResult.corruptedItemsSkipped).toBe(1);
      expect(controller.getBufferSize(streamId)).toBe(1); // Only valid item remains
    });
  });

  describe('memory Management and Cleanup', () => {
    test('should trigger automatic garbage collection on memory pressure', async () => {
      const memoryController = new BackpressureController({
        maxBufferSize: 1000,
        memoryManagement: {
          enableMemoryTracking: true,
          maxMemoryMB: 10, // Small limit for testing
          gcThreshold: 0.7,
          aggressiveCleanup: true,
        },
      });

      const streamId = 'memory-pressure-stream';

      // Add memory-intensive items
      const largeItems: StreamItem[] = [];
      for (let i = 0; i < 50; i++) {
        largeItems.push({
          id: `large-${i}`,
          data: 'x'.repeat(1024 * 200), // 200KB per item
          timestamp: Date.now() - i * 1000, // Older items first
          priority: 1,
        });
      }

      // Add items until memory pressure triggers
      let addedCount = 0;
      for (const item of largeItems) {
        const result = memoryController.addToBuffer(streamId, item);
        if (result.memoryPressure) {
          break;
        }
        addedCount++;
      }

      expect(addedCount).toBeLessThan(largeItems.length);
      expect(memoryController.getMemoryUsage().pressureLevel).toBeGreaterThan(0.7);

      // Verify cleanup occurred
      const finalBufferSize = memoryController.getBufferSize(streamId);
      expect(finalBufferSize).toBeLessThan(addedCount);

      memoryController.destroy();
    });

    test('should perform periodic cleanup of expired items', async () => {
      const cleanupController = new BackpressureController({
        maxBufferSize: 100,
        memoryManagement: {
          enableMemoryTracking: true,
          cleanupInterval: 100, // Fast cleanup for testing
          itemTTL: 200, // 200ms TTL
        },
      });

      const streamId = 'cleanup-test-stream';

      // Add items that will expire
      const expirableItems: StreamItem[] = [
        { id: '1', data: 'old-item-1', timestamp: Date.now() - 300, priority: 1 }, // Already expired
        { id: '2', data: 'old-item-2', timestamp: Date.now() - 250, priority: 1 }, // Already expired
        { id: '3', data: 'new-item', timestamp: Date.now(), priority: 1 }, // Fresh
      ];

      expirableItems.forEach(item => {
        cleanupController.addToBuffer(streamId, item);
      });

      expect(cleanupController.getBufferSize(streamId)).toBe(3);

      // Wait for cleanup cycle
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should have cleaned up expired items
      expect(cleanupController.getBufferSize(streamId)).toBe(1);

      const remainingItem = cleanupController.getNextItem(streamId);
      expect(remainingItem?.id).toBe('3');

      cleanupController.destroy();
    });
  });

  describe('backpressure Detection and Response', () => {
    test('should detect backpressure conditions accurately', async () => {
      const streamId = 'backpressure-detection-stream';

      // Fill buffer to trigger backpressure
      for (let i = 0; i < 80; i++) {
        // Above high watermark (75)
        controller.addToBuffer(streamId, {
          id: `item-${i}`,
          data: `data-${i}`,
          timestamp: Date.now(),
          priority: 1,
        });
      }

      const pressureInfo = controller.getBackpressureInfo(streamId);
      expect(pressureInfo.isBackpressured).toBeTruthy();
      expect(pressureInfo.level).toBeGreaterThan(0.75);
      expect(pressureInfo.recommendation).toBeDefined();
    });

    test('should apply adaptive throttling based on backpressure', async () => {
      const streamId = 'throttling-test-stream';

      // Simulate high backpressure scenario
      for (let i = 0; i < 90; i++) {
        controller.addToBuffer(streamId, {
          id: `throttle-item-${i}`,
          data: `data-${i}`,
          timestamp: Date.now(),
          priority: 1,
        });
      }

      // Try to add more items - should be throttled
      const throttledResult = controller.addToBuffer(streamId, {
        id: 'throttled-item',
        data: 'throttled-data',
        timestamp: Date.now(),
        priority: 1,
      });

      expect(throttledResult.throttled).toBeTruthy();
      expect(throttledResult.throttleDelay).toBeGreaterThan(0);
    });

    test('should handle burst traffic with flow control', async () => {
      const burstController = new BackpressureController({
        maxBufferSize: 50,
        flowControl: {
          enableTokenBucket: true,
          tokensPerSecond: 10,
          bucketSize: 20,
          burstHandling: 'queue',
        },
      });

      const streamId = 'burst-test-stream';

      // Generate burst traffic
      const burstItems: StreamItem[] = [];
      for (let i = 0; i < 30; i++) {
        burstItems.push({
          id: `burst-${i}`,
          data: `burst-data-${i}`,
          timestamp: Date.now(),
          priority: 1,
        });
      }

      let acceptedCount = 0;
      let queuedCount = 0;

      for (const item of burstItems) {
        const result = burstController.addToBuffer(streamId, item);
        if (result.success) {
          acceptedCount++;
        } else if (result.queued) {
          queuedCount++;
        }
      }

      expect(acceptedCount).toBeLessThanOrEqual(20); // Limited by bucket size
      expect(queuedCount).toBeGreaterThan(0);

      burstController.destroy();
    });
  });

  describe('priority-based Processing', () => {
    test('should process high-priority items first during backpressure', async () => {
      const streamId = 'priority-test-stream';

      // Add mixed priority items
      const mixedItems: StreamItem[] = [
        { id: 'low-1', data: 'low-priority-1', timestamp: Date.now(), priority: 1 },
        { id: 'high-1', data: 'high-priority-1', timestamp: Date.now(), priority: 3 },
        { id: 'low-2', data: 'low-priority-2', timestamp: Date.now(), priority: 1 },
        { id: 'high-2', data: 'high-priority-2', timestamp: Date.now(), priority: 3 },
        { id: 'medium-1', data: 'medium-priority-1', timestamp: Date.now(), priority: 2 },
      ];

      mixedItems.forEach(item => controller.addToBuffer(streamId, item));

      // Process items and verify priority order
      const processedOrder: string[] = [];
      while (controller.getBufferSize(streamId) > 0) {
        const item = controller.getNextItem(streamId);
        if (item) {
          processedOrder.push(item.id);
        }
      }

      // High priority items should be processed first
      expect(processedOrder[0]).toMatch(/^high-/);
      expect(processedOrder[1]).toMatch(/^high-/);
      expect(processedOrder[2]).toMatch(/^medium-/);
    });

    test('should support dynamic priority adjustment', async () => {
      const streamId = 'dynamic-priority-stream';

      // Add item with initial priority
      const item: StreamItem = {
        id: 'dynamic-item',
        data: 'dynamic-data',
        timestamp: Date.now(),
        priority: 1,
      };

      controller.addToBuffer(streamId, item);

      // Adjust priority dynamically
      const adjustResult = controller.adjustItemPriority(streamId, 'dynamic-item', 3);
      expect(adjustResult.success).toBeTruthy();

      // Add lower priority item
      controller.addToBuffer(streamId, {
        id: 'low-item',
        data: 'low-data',
        timestamp: Date.now(),
        priority: 2,
      });

      // The dynamically adjusted item should be processed first
      const firstItem = controller.getNextItem(streamId);
      expect(firstItem?.id).toBe('dynamic-item');
    });
  });

  describe('error Recovery and Resilience', () => {
    test('should recover from stream corruption gracefully', async () => {
      const resilientController = new BackpressureController({
        maxBufferSize: 100,
        errorRecovery: {
          enableAutoRecovery: true,
          maxRecoveryAttempts: 3,
          recoveryDelay: 100,
          corruptionTolerance: 0.2, // Allow 20% corruption
        },
      });

      const streamId = 'recovery-test-stream';

      // Add mix of valid and corrupted items
      const items: StreamItem[] = [
        { id: 'valid-1', data: 'valid-data-1', timestamp: Date.now(), priority: 1 },
        { id: 'corrupt-1', data: null as any, timestamp: Date.now(), priority: 1 }, // Corrupted
        { id: 'valid-2', data: 'valid-data-2', timestamp: Date.now(), priority: 1 },
        { id: 'corrupt-2', data: undefined as any, timestamp: Date.now(), priority: 1 }, // Corrupted
        { id: 'valid-3', data: 'valid-data-3', timestamp: Date.now(), priority: 1 },
      ];

      items.forEach(item => resilientController.addToBuffer(streamId, item));

      // Trigger corruption detection and recovery
      const recoveryResult = resilientController.performCorruptionRecovery(streamId);

      expect(recoveryResult.success).toBeTruthy();
      expect(recoveryResult.corruptedItemsRemoved).toBe(2);
      expect(resilientController.getBufferSize(streamId)).toBe(3); // Only valid items remain

      resilientController.destroy();
    });

    test('should handle network interruption scenarios', async () => {
      const networkController = new BackpressureController({
        maxBufferSize: 100,
        networkResilience: {
          enableNetworkRecovery: true,
          reconnectAttempts: 3,
          reconnectDelay: 100,
          offlineBuffering: true,
        },
      });

      const streamId = 'network-test-stream';

      // Simulate items being added during network issues
      const offlineItems: StreamItem[] = [
        { id: 'offline-1', data: 'offline-data-1', timestamp: Date.now(), priority: 1 },
        { id: 'offline-2', data: 'offline-data-2', timestamp: Date.now(), priority: 1 },
      ];

      // Simulate network disconnection
      networkController.simulateNetworkDisconnection(streamId);

      // Add items while offline - should be buffered
      offlineItems.forEach(item => {
        const result = networkController.addToBuffer(streamId, item);
        expect(result.bufferedOffline).toBeTruthy();
      });

      // Simulate network reconnection
      const reconnectResult = networkController.simulateNetworkReconnection(streamId);
      expect(reconnectResult.success).toBeTruthy();
      expect(reconnectResult.itemsRestored).toBe(2);

      networkController.destroy();
    });
  });
});

describe('buffer Optimization Integration', () => {
  let optimizationEngine: BufferOptimizationEngine;
  let flowController: QoSFlowController;

  beforeEach(() => {
    optimizationEngine = new BufferOptimizationEngine({
      enableDynamicSizing: true,
      performanceTargets: {
        targetLatency: 100,
        targetThroughput: 1000,
        memoryLimit: 50 * 1024 * 1024,
      },
      optimizationInterval: 100,
      learningConfig: {
        enableMachineLearning: true,
        adaptationRate: 0.1,
        historySize: 100,
      },
    });

    flowController = new QoSFlowController({
      enableQoS: true,
      qosConfig: {
        priorities: [
          { name: 'critical', weight: 4, maxLatency: 50 },
          { name: 'high', weight: 3, maxLatency: 100 },
          { name: 'normal', weight: 2, maxLatency: 200 },
          { name: 'low', weight: 1, maxLatency: 500 },
        ],
      },
      trafficShaping: {
        enableShaping: true,
        maxBandwidth: 10000,
        burstSize: 2000,
      },
    });
  });

  afterEach(() => {
    optimizationEngine.destroy();
    flowController.destroy();
  });

  describe('dynamic Buffer Sizing', () => {
    test('should optimize buffer size based on traffic patterns', async () => {
      const streamId = 'optimization-stream';

      // Simulate varying traffic patterns
      const trafficPatterns = [
        { itemCount: 10, itemSize: 1024, duration: 100 }, // Low traffic
        { itemCount: 50, itemSize: 2048, duration: 200 }, // Medium traffic
        { itemCount: 100, itemSize: 512, duration: 150 }, // High traffic
      ];

      for (const pattern of trafficPatterns) {
        const startTime = Date.now();

        for (let i = 0; i < pattern.itemCount; i++) {
          await optimizationEngine.processItem(streamId, {
            id: `pattern-item-${i}`,
            data: 'x'.repeat(pattern.itemSize),
            timestamp: Date.now(),
            size: pattern.itemSize,
          });
        }

        await new Promise(resolve => setTimeout(resolve, pattern.duration));
      }

      const optimizationReport = optimizationEngine.generateOptimizationReport(streamId);

      expect(optimizationReport.recommendedBufferSize).toBeGreaterThan(0);
      expect(optimizationReport.sizingReasons.length).toBeGreaterThan(0);
      expect(optimizationReport.performanceImprovement).toBeGreaterThan(0);
    });

    test('should adapt to memory pressure dynamically', async () => {
      const memoryEngine = new BufferOptimizationEngine({
        enableDynamicSizing: true,
        performanceTargets: {
          memoryLimit: 10 * 1024 * 1024, // 10MB limit
        },
        adaptiveConfig: {
          memoryPressureThreshold: 0.8,
          emergencyReduction: 0.5,
        },
      });

      const streamId = 'memory-adaptation-stream';

      // Fill buffer until memory pressure
      let itemCount = 0;
      while (memoryEngine.getMemoryUsage() < 8 * 1024 * 1024) {
        // 8MB
        await memoryEngine.processItem(streamId, {
          id: `memory-item-${itemCount}`,
          data: 'x'.repeat(1024 * 100), // 100KB per item
          timestamp: Date.now(),
          size: 1024 * 100,
        });
        itemCount++;
      }

      const adaptationResult = memoryEngine.adaptToMemoryPressure(streamId);
      expect(adaptationResult.bufferSizeReduced).toBeTruthy();
      expect(adaptationResult.reductionPercentage).toBeGreaterThan(0);

      memoryEngine.destroy();
    });
  });

  describe('qoS and Traffic Shaping', () => {
    test('should enforce QoS priorities correctly', async () => {
      const qosItems = [
        { id: 'critical-1', priority: 'critical', data: 'critical-data-1' },
        { id: 'low-1', priority: 'low', data: 'low-data-1' },
        { id: 'high-1', priority: 'high', data: 'high-data-1' },
        { id: 'normal-1', priority: 'normal', data: 'normal-data-1' },
      ];

      // Submit items in mixed order
      for (const item of qosItems) {
        await flowController.enqueueItem(item.priority, {
          id: item.id,
          data: item.data,
          timestamp: Date.now(),
        });
      }

      // Process items and verify priority order
      const processedOrder: string[] = [];
      while (flowController.hasQueuedItems()) {
        const item = await flowController.dequeueNextItem();
        processedOrder.push(item.id);
      }

      expect(processedOrder[0]).toBe('critical-1');
      expect(processedOrder[1]).toBe('high-1');
      expect(processedOrder[2]).toBe('normal-1');
      expect(processedOrder[3]).toBe('low-1');
    });

    test('should apply traffic shaping to prevent bandwidth overflow', async () => {
      const shapingController = new QoSFlowController({
        trafficShaping: {
          enableShaping: true,
          maxBandwidth: 1000, // 1KB/s limit for testing
          burstSize: 500,
          enforcementStrict: true,
        },
      });

      const startTime = Date.now();
      const largeItems = Array.from({ length: 10 }, (_, i) => ({
        id: `large-item-${i}`,
        data: 'x'.repeat(200), // 200 bytes each
        timestamp: Date.now(),
        size: 200,
      }));

      // Submit items rapidly
      for (const item of largeItems) {
        await shapingController.enqueueItem('normal', item);
      }

      // Process with traffic shaping - should take longer due to bandwidth limits
      const processedItems: any[] = [];
      while (shapingController.hasQueuedItems()) {
        const item = await shapingController.dequeueNextItem();
        processedItems.push({
          ...item,
          processedAt: Date.now(),
        });
      }

      const totalDuration = Date.now() - startTime;
      expect(totalDuration).toBeGreaterThan(1500); // Should be throttled by bandwidth

      shapingController.destroy();
    });
  });

  describe('performance Monitoring Integration', () => {
    test('should provide comprehensive performance metrics', async () => {
      const streamId = 'metrics-stream';

      // Process items with varying characteristics
      const testItems = [
        { size: 1024, processingTime: 50 },
        { size: 2048, processingTime: 75 },
        { size: 512, processingTime: 25 },
        { size: 4096, processingTime: 100 },
      ];

      for (let i = 0; i < testItems.length; i++) {
        const item = testItems[i];
        const startTime = Date.now();

        await optimizationEngine.processItem(streamId, {
          id: `metrics-item-${i}`,
          data: 'x'.repeat(item.size),
          timestamp: startTime,
          size: item.size,
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, item.processingTime));
      }

      const performanceMetrics = optimizationEngine.getPerformanceMetrics(streamId);

      expect(performanceMetrics.averageLatency).toBeGreaterThan(0);
      expect(performanceMetrics.throughput).toBeGreaterThan(0);
      expect(performanceMetrics.memoryEfficiency).toBeGreaterThan(0);
      expect(performanceMetrics.recommendedOptimizations.length).toBeGreaterThanOrEqual(0);
    });
  });
});
