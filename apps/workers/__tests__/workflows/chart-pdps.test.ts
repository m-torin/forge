import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import chartPDPsDefinition from '../../app/workflows/chart-pdps/definition';
import type { ChartPDPsPayload } from '../../app/workflows/chart-pdps/definition';
import { createMockContext } from '../test-helpers';

describe('Chart PDPs Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(chartPDPsDefinition.metadata).toEqual({
        id: 'chart-pdps',
        color: 'teal',
        description: 'Process and analyze chart product detail pages',
        difficulty: 'beginner',
        estimatedTime: '5-10 seconds',
        features: [
          'Product detail page processing',
          'Chart data extraction',
          'Batch processing support',
          'Product metadata analysis',
        ],
        tags: ['jollyRoger', 'etl'],
        title: 'Chart PDPs',
      });
    });

    it('should be marked as beginner difficulty', () => {
      expect(chartPDPsDefinition.metadata.difficulty).toBe('beginner');
    });

    it('should have appropriate features for PDP processing', () => {
      const { features } = chartPDPsDefinition.metadata;
      expect(features).toContain('Product detail page processing');
      expect(features).toContain('Chart data extraction');
      expect(features).toContain('Batch processing support');
      expect(features).toContain('Product metadata analysis');
    });

    it('should share tags with chart-sitemaps workflow', () => {
      const { tags } = chartPDPsDefinition.metadata;
      expect(tags).toContain('jollyRoger');
      expect(tags).toContain('etl');
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields', () => {
      expect(chartPDPsDefinition.defaultPayload).toHaveProperty('message');
      expect(chartPDPsDefinition.defaultPayload).toHaveProperty('productIds');
    });

    it('should have valid default values', () => {
      expect(chartPDPsDefinition.defaultPayload.message).toBe('Hello World from Chart PDPs!');
      expect(chartPDPsDefinition.defaultPayload.productIds).toEqual(['PROD-001', 'PROD-002', 'PROD-003']);
    });

    it('should have array of product IDs', () => {
      const { productIds } = chartPDPsDefinition.defaultPayload;
      expect(Array.isArray(productIds)).toBe(true);
      expect(productIds.length).toBe(3);
      productIds.forEach((id: any) => {
        expect(typeof id).toBe('string');
        expect(id).toMatch(/^PROD-\d{3}$/);
      });
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof chartPDPsDefinition.workflow).toBe('function');
    });

    it('should execute workflow steps in correct order', async () => {
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: {
          message: 'Test PDP message',
          productIds: ['TEST-001', 'TEST-002'],
        },
        workflowRunId: 'test-run-pdps-123',
      });

      const result = await chartPDPsDefinition.workflow(mockContext);

      // Verify steps were called
      expect(mockContext.run).toHaveBeenCalledWith('log-start', expect.any(Function));
      expect(mockContext.run).toHaveBeenCalledWith('process-pdps', expect.any(Function));

      // Verify console logs
      expect(console.log).toHaveBeenCalledWith('Starting chart PDPs workflow: Test PDP message');
      expect(console.log).toHaveBeenCalledWith('Processing 2 products');
      expect(console.log).toHaveBeenCalledWith('Processing PDPs for products: TEST-001, TEST-002');
    });

    it('should return success response with data', async () => {
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: {
          message: 'Test message',
          productIds: ['PROD-A', 'PROD-B', 'PROD-C'],
        },
        workflowRunId: 'test-run-pdps-456',
      });

      const result = await chartPDPsDefinition.workflow(mockContext);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      
      expect(result.data).toEqual({
        message: 'Test message',
        processedCount: 3,
        productIds: ['PROD-A', 'PROD-B', 'PROD-C'],
        timestamp: expect.any(String),
        workflowRunId: 'test-run-pdps-456',
      });
      
      expect(result.metadata).toEqual({
        timestamp: expect.any(String),
        workflowRunId: 'test-run-pdps-456',
      });
    });

    it('should handle missing payload gracefully', async () => {
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: undefined as any,
        workflowRunId: 'test-run-pdps-789',
      });

      const result = await chartPDPsDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Starting chart PDPs workflow: Hello World from Chart PDPs!');
      expect(console.log).toHaveBeenCalledWith('Processing 0 products');
      expect(console.log).toHaveBeenCalledWith('Processing PDPs for products: ');
      
      expect(result.data).toEqual({
        message: 'Hello World from Chart PDPs!',
        processedCount: 0,
        productIds: [],
        timestamp: expect.any(String),
        workflowRunId: 'test-run-pdps-789',
      });
    });

    it('should handle empty productIds array', async () => {
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: {
          message: 'Empty products test',
          productIds: [],
        },
        workflowRunId: 'test-run-empty-123',
      });

      const result = await chartPDPsDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Processing 0 products');
      expect(result.data.processedCount).toBe(0);
      expect(result.data.productIds).toEqual([]);
    });

    it('should handle large batch of products', async () => {
      const largeProductList = Array.from({ length: 100 }, (_, i) => `PROD-${String(i).padStart(3, '0')}`);
      
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: {
          message: 'Large batch test',
          productIds: largeProductList,
        },
        workflowRunId: 'test-run-large-123',
      });

      const result = await chartPDPsDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Processing 100 products');
      expect(result.data.processedCount).toBe(100);
      expect(result.data.productIds).toHaveLength(100);
    });
  });

  describe('workflow steps', () => {
    it('should have log-start step', async () => {
      let logStartExecuted = false;
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: { productIds: ['PROD-X'] },
        workflowRunId: 'test-step-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'log-start') {
            logStartExecuted = true;
            const result = await fn();
            expect(result).toEqual({ started: true });
          }
          return fn();
        }),
      });

      await chartPDPsDefinition.workflow(mockContext);
      expect(logStartExecuted).toBe(true);
    });

    it('should have process-pdps step', async () => {
      let processPDPsExecuted = false;
      const mockContext = createMockContext<ChartPDPsPayload>({
        requestPayload: { productIds: ['PROD-Y', 'PROD-Z'] },
        workflowRunId: 'test-process-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'process-pdps') {
            processPDPsExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('processedCount');
            expect(result).toHaveProperty('productIds');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('workflowRunId');
          }
          return fn();
        }),
      });

      await chartPDPsDefinition.workflow(mockContext);
      expect(processPDPsExecuted).toBe(true);
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(chartPDPsDefinition.metadata.color).toBe('teal');
      expect(typeof chartPDPsDefinition.metadata.color).toBe('string');
    });

    it('should have different color than chart-sitemaps', () => {
      // chart-sitemaps uses 'cyan', chart-pdps uses 'teal'
      expect(chartPDPsDefinition.metadata.color).not.toBe('cyan');
    });
  });

  describe('payload interface', () => {
    it('should accept optional fields', () => {
      const validPayloads: ChartPDPsPayload[] = [
        {},
        { message: 'Custom message' },
        { productIds: ['PROD-001'] },
        { message: 'Both fields', productIds: ['PROD-001', 'PROD-002'] },
      ];

      validPayloads.forEach(payload => {
        expect(() => {
          const _: ChartPDPsPayload = payload;
        }).not.toThrow();
      });
    });
  });

  describe('batch processing feature', () => {
    it('should support batch processing as indicated in features', () => {
      const { features } = chartPDPsDefinition.metadata;
      expect(features).toContain('Batch processing support');
    });

    it('should handle different batch sizes', async () => {
      const batchSizes = [1, 5, 10, 50];
      
      for (const size of batchSizes) {
        const products = Array.from({ length: size }, (_, i) => `PROD-${i}`);
        const mockContext = createMockContext<ChartPDPsPayload>({
          requestPayload: { productIds: products },
          workflowRunId: `test-batch-${size}`,
        });

        const result = await chartPDPsDefinition.workflow(mockContext);
        expect(result.data.processedCount).toBe(size);
      }
    });
  });
});