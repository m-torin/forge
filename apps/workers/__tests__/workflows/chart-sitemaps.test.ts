import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import chartSitemapsDefinition from '../../app/workflows/chart-sitemaps/definition';
import type { ChartSitemapsPayload } from '../../app/workflows/chart-sitemaps/definition';
import { createMockContext } from '../test-helpers';

describe('Chart Sitemaps Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(chartSitemapsDefinition.metadata).toEqual({
        id: 'chart-sitemaps',
        color: 'cyan',
        description: 'Process and analyze chart sitemaps for data extraction',
        difficulty: 'beginner',
        estimatedTime: '5-10 seconds',
        features: [
          'Chart sitemap processing',
          'Data extraction',
          'URL analysis',
          'Structured data parsing',
        ],
        tags: ['jollyRoger', 'etl'],
        title: 'Chart Sitemaps',
      });
    });

    it('should be marked as beginner difficulty', () => {
      expect(chartSitemapsDefinition.metadata.difficulty).toBe('beginner');
    });

    it('should have appropriate features for sitemap processing', () => {
      const { features } = chartSitemapsDefinition.metadata;
      expect(features).toContain('Chart sitemap processing');
      expect(features).toContain('Data extraction');
      expect(features).toContain('URL analysis');
      expect(features).toContain('Structured data parsing');
    });

    it('should have unique tags', () => {
      const { tags } = chartSitemapsDefinition.metadata;
      expect(tags).toContain('jollyRoger');
      expect(tags).toContain('etl');
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields', () => {
      expect(chartSitemapsDefinition.defaultPayload).toHaveProperty('url');
      expect(chartSitemapsDefinition.defaultPayload).toHaveProperty('message');
    });

    it('should have valid default values', () => {
      expect(chartSitemapsDefinition.defaultPayload.url).toBe('https://example.com/sitemap.xml');
      expect(chartSitemapsDefinition.defaultPayload.message).toBe('Hello World from Chart Sitemaps!');
    });

    it('should have valid URL format', () => {
      const { url } = chartSitemapsDefinition.defaultPayload;
      expect(url).toMatch(/^https?:\/\/.+/);
      expect(url).toContain('sitemap.xml');
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof chartSitemapsDefinition.workflow).toBe('function');
    });

    it('should execute workflow steps in correct order', async () => {
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: {
          url: 'https://test.com/sitemap.xml',
          message: 'Test message',
        },
        workflowRunId: 'test-run-sitemaps-123',
      });

      const result = await chartSitemapsDefinition.workflow(mockContext);

      // Verify steps were called
      expect(mockContext.run).toHaveBeenCalledWith('log-start', expect.any(Function));
      expect(mockContext.run).toHaveBeenCalledWith('process-sitemap', expect.any(Function));

      // Verify console logs
      expect(console.log).toHaveBeenCalledWith('Starting chart sitemaps workflow: Test message');
      expect(console.log).toHaveBeenCalledWith('Processing sitemap: https://test.com/sitemap.xml');
    });

    it('should return success response with data', async () => {
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: {
          url: 'https://test.com/sitemap.xml',
          message: 'Test message',
        },
        workflowRunId: 'test-run-sitemaps-456',
      });

      const result = await chartSitemapsDefinition.workflow(mockContext);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      
      expect(result.data).toEqual({
        url: 'https://test.com/sitemap.xml',
        message: 'Test message',
        timestamp: expect.any(String),
        workflowRunId: 'test-run-sitemaps-456',
      });
      
      expect(result.metadata).toEqual({
        timestamp: expect.any(String),
        workflowRunId: 'test-run-sitemaps-456',
      });
    });

    it('should handle missing payload gracefully', async () => {
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: undefined as any,
        workflowRunId: 'test-run-sitemaps-789',
      });

      const result = await chartSitemapsDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Starting chart sitemaps workflow: Hello World from Chart Sitemaps!');
      expect(console.log).toHaveBeenCalledWith('Processing sitemap: no URL provided');
      
      expect(result.data).toEqual({
        url: undefined,
        message: 'Hello World from Chart Sitemaps!',
        timestamp: expect.any(String),
        workflowRunId: 'test-run-sitemaps-789',
      });
    });

    it('should handle partial payload', async () => {
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: {
          url: 'https://partial.com/sitemap.xml',
          // message not provided, should use default
        },
        workflowRunId: 'test-run-partial-123',
      });

      const result = await chartSitemapsDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Starting chart sitemaps workflow: Hello World from Chart Sitemaps!');
      expect(console.log).toHaveBeenCalledWith('Processing sitemap: https://partial.com/sitemap.xml');
      
      expect(result.data.url).toBe('https://partial.com/sitemap.xml');
      expect(result.data.message).toBe('Hello World from Chart Sitemaps!');
    });
  });

  describe('workflow steps', () => {
    it('should have log-start step', async () => {
      let logStartExecuted = false;
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: { message: 'Test' },
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

      await chartSitemapsDefinition.workflow(mockContext);
      expect(logStartExecuted).toBe(true);
    });

    it('should have process-sitemap step', async () => {
      let processSitemapExecuted = false;
      const mockContext = createMockContext<ChartSitemapsPayload>({
        requestPayload: { url: 'https://test.com/sitemap.xml' },
        workflowRunId: 'test-process-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'process-sitemap') {
            processSitemapExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('workflowRunId');
          }
          return fn();
        }),
      });

      await chartSitemapsDefinition.workflow(mockContext);
      expect(processSitemapExecuted).toBe(true);
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(chartSitemapsDefinition.metadata.color).toBe('cyan');
      expect(typeof chartSitemapsDefinition.metadata.color).toBe('string');
    });
  });

  describe('payload interface', () => {
    it('should accept optional fields', () => {
      const validPayloads: ChartSitemapsPayload[] = [
        {},
        { url: 'https://example.com' },
        { message: 'Custom message' },
        { url: 'https://example.com', message: 'Both fields' },
      ];

      validPayloads.forEach(payload => {
        expect(() => {
          const _: ChartSitemapsPayload = payload;
        }).not.toThrow();
      });
    });
  });
});