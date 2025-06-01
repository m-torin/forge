import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import kitchenSinkDefinition from '../../app/workflows/kitchen-sink/definition';
import { createMockContext } from '../test-helpers';

// Mock the orchestration package
vi.mock('@repo/orchestration/examples', () => ({
  kitchenSinkWorkflow: vi.fn(),
}));

// Mock the workflow wrapper
vi.mock('../../app/workflows/workflow-wrapper', () => ({
  wrapWorkflow: (fn: any) => fn,
}));

describe('Kitchen Sink Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(kitchenSinkDefinition.metadata).toEqual({
        id: 'kitchen-sink',
        color: 'purple',
        description: 'Comprehensive workflow showcasing all QStash features and patterns',
        difficulty: 'advanced',
        estimatedTime: '2-5 minutes',
        features: [
          'ETL Pipeline with transformations',
          'Order processing with inventory',
          'Multi-step orchestration',
          'Parallel coffee brewing simulation',
          'Data aggregation and reporting',
          'Conditional flow control',
          'Event-driven approval steps',
          'Comprehensive error recovery',
        ],
        tags: ['demo', 'advanced', 'etl', 'orchestration'],
        title: 'Kitchen Sink',
      });
    });

    it('should be marked as advanced difficulty', () => {
      expect(kitchenSinkDefinition.metadata.difficulty).toBe('advanced');
    });

    it('should have longer estimated time than basic workflow', () => {
      expect(kitchenSinkDefinition.metadata.estimatedTime).toBe('2-5 minutes');
    });

    it('should have comprehensive feature list', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features.length).toBeGreaterThanOrEqual(8);
      expect(features).toContain('ETL Pipeline with transformations');
      expect(features).toContain('Order processing with inventory');
      expect(features).toContain('Multi-step orchestration');
    });
  });

  describe('defaultPayload', () => {
    it('should have ETL pipeline configuration', () => {
      const { defaultPayload } = kitchenSinkDefinition;
      
      expect(defaultPayload).toHaveProperty('destination');
      expect(defaultPayload.destination).toEqual({
        type: 'database',
        config: { table: 'processed_data' },
      });
      
      expect(defaultPayload).toHaveProperty('pipelineId');
      expect(defaultPayload.pipelineId).toMatch(/^pipeline-\d+$/);
      
      expect(defaultPayload).toHaveProperty('source');
      expect(defaultPayload.source).toEqual({
        type: 'api',
        url: 'https://api.example.com/data',
      });
      
      expect(defaultPayload).toHaveProperty('transformations');
      expect(defaultPayload.transformations).toEqual(['validate', 'sanitize', 'filter', 'enrich']);
    });

    it('should have order processing configuration', () => {
      const { defaultPayload } = kitchenSinkDefinition;
      
      expect(defaultPayload).toHaveProperty('customer');
      expect(defaultPayload.customer).toEqual({
        id: 'cust-456',
        email: 'test@example.com',
        tier: 'premium',
      });
      
      expect(defaultPayload).toHaveProperty('items');
      expect(defaultPayload.items).toEqual([
        { price: 75, quantity: 2, sku: 'PREMIUM-ITEM' },
      ]);
      
      expect(defaultPayload).toHaveProperty('orderId');
      expect(defaultPayload.orderId).toMatch(/^order-\d+$/);
    });

    it('should have orchestration configuration', () => {
      const { defaultPayload } = kitchenSinkDefinition;
      
      expect(defaultPayload).toHaveProperty('coffeeOrders');
      expect(defaultPayload.coffeeOrders).toEqual([
        { customerName: 'Alice', style: 'cappuccino' },
        { customerName: 'Bob', style: 'latte' },
      ]);
      
      expect(defaultPayload).toHaveProperty('datasetId');
      expect(defaultPayload.datasetId).toMatch(/^dataset-\d+$/);
      
      expect(defaultPayload).toHaveProperty('notificationEmail');
      expect(defaultPayload.notificationEmail).toBe('admin@example.com');
      
      expect(defaultPayload).toHaveProperty('operations');
      expect(defaultPayload.operations).toEqual(['sum', 'average', 'max']);
    });

    it('should have comprehensive options', () => {
      const { options } = kitchenSinkDefinition.defaultPayload;
      
      expect(options).toEqual({
        batchSize: 10,
        maxDuration: 600,
        mode: 'full',
        notifyOn: ['complete'],
        notifyOnComplete: true,
        requiresApproval: true,
      });
    });

    it('should have task processing configuration', () => {
      const { defaultPayload } = kitchenSinkDefinition;
      
      expect(defaultPayload).toHaveProperty('name');
      expect(defaultPayload.name).toBe('Comprehensive Kitchen Sink Demo');
      
      expect(defaultPayload).toHaveProperty('priority');
      expect(defaultPayload.priority).toBe(9);
      
      expect(defaultPayload).toHaveProperty('taskId');
      expect(defaultPayload.taskId).toMatch(/^task-\d+$/);
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof kitchenSinkDefinition.workflow).toBe('function');
    });

    it('should accept complex payload structure', async () => {
      const { kitchenSinkWorkflow } = await import('@repo/orchestration/examples');
      const mockImplementation = vi.fn().mockResolvedValue({
        status: 'success',
        data: { 
          etl: { processed: true },
          order: { confirmed: true },
          orchestration: { completed: true },
        },
      });
      vi.mocked(kitchenSinkWorkflow).mockImplementation(mockImplementation);

      const mockContext = createMockContext({
        requestPayload: kitchenSinkDefinition.defaultPayload,
        workflowRunId: 'test-run-kitchen-sink-123',
      });

      await kitchenSinkDefinition.workflow(mockContext);
      expect(mockImplementation).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('workflow capabilities', () => {
    it('should support ETL operations', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('ETL Pipeline with transformations');
      
      const { transformations } = kitchenSinkDefinition.defaultPayload;
      expect(transformations).toContain('validate');
      expect(transformations).toContain('sanitize');
      expect(transformations).toContain('filter');
      expect(transformations).toContain('enrich');
    });

    it('should support parallel processing', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('Parallel coffee brewing simulation');
      
      const { coffeeOrders } = kitchenSinkDefinition.defaultPayload;
      expect(Array.isArray(coffeeOrders)).toBe(true);
      expect(coffeeOrders.length).toBeGreaterThan(1);
    });

    it('should support conditional flow', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('Conditional flow control');
      
      const { options } = kitchenSinkDefinition.defaultPayload;
      expect(options.requiresApproval).toBe(true);
    });

    it('should support event-driven patterns', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('Event-driven approval steps');
      
      const { notificationEmail, options } = kitchenSinkDefinition.defaultPayload;
      expect(notificationEmail).toBeTruthy();
      expect(options.notifyOnComplete).toBe(true);
    });

    it('should support error recovery', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('Comprehensive error recovery');
    });

    it('should support data aggregation', () => {
      const { features } = kitchenSinkDefinition.metadata;
      expect(features).toContain('Data aggregation and reporting');
      
      const { operations } = kitchenSinkDefinition.defaultPayload;
      expect(operations).toContain('sum');
      expect(operations).toContain('average');
      expect(operations).toContain('max');
    });
  });

  describe('workflow complexity', () => {
    it('should have more features than basic workflow', () => {
      expect(kitchenSinkDefinition.metadata.features.length).toBeGreaterThanOrEqual(8);
    });

    it('should have multiple workflow patterns', () => {
      const patterns = [
        'ETL Pipeline',
        'Order processing',
        'Multi-step orchestration',
        'Parallel',
        'Data aggregation',
        'Conditional flow',
        'Event-driven',
        'error recovery',
      ];
      
      const featureText = kitchenSinkDefinition.metadata.features.join(' ');
      patterns.forEach(pattern => {
        expect(featureText.toLowerCase()).toContain(pattern.toLowerCase());
      });
    });

    it('should have comprehensive default payload', () => {
      const payloadKeys = Object.keys(kitchenSinkDefinition.defaultPayload);
      expect(payloadKeys.length).toBeGreaterThan(10);
      
      // Check for various workflow sections
      expect(payloadKeys).toContain('destination'); // ETL
      expect(payloadKeys).toContain('customer'); // Order processing
      expect(payloadKeys).toContain('coffeeOrders'); // Orchestration
      expect(payloadKeys).toContain('options'); // Configuration
    });
  });

  describe('workflow tags', () => {
    it('should have appropriate tags', () => {
      const { tags } = kitchenSinkDefinition.metadata;
      expect(tags).toContain('demo');
      expect(tags).toContain('advanced');
      expect(tags).toContain('etl');
      expect(tags).toContain('orchestration');
    });

    it('should indicate advanced nature in tags', () => {
      const { tags } = kitchenSinkDefinition.metadata;
      expect(tags).toContain('advanced');
      expect(tags).not.toContain('beginner');
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(kitchenSinkDefinition.metadata.color).toBe('purple');
      expect(typeof kitchenSinkDefinition.metadata.color).toBe('string');
    });
  });
});