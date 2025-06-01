import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import imageProcessingDefinition from '../../app/workflows/image-processing/definition';
import { createMockContext } from '../test-helpers';

// Mock the orchestration package
vi.mock('@repo/orchestration', () => ({
  imageProcessingWorkflow: vi.fn(),
}));

// Mock the workflow wrapper
vi.mock('../../app/workflows/workflow-wrapper', () => ({
  wrapWorkflow: (fn: any) => fn,
}));

describe('Image Processing Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(imageProcessingDefinition.metadata).toEqual({
        id: 'image-processing',
        color: 'green',
        description: 'Multi-resolution image processing with filters and optimizations',
        difficulty: 'intermediate',
        estimatedTime: '30-60 seconds',
        features: [
          'Multiple resolution generation',
          'Various image filters (grayscale, sepia, blur, sharpen)',
          'Format conversion (webp optimization)',
          'Quality control settings',
          'Parallel processing for efficiency',
          'Progress tracking for each variant',
          'Result viewer UI',
        ],
        tags: ['media', 'etl', 'processing'],
        title: 'Image Processing',
      });
    });

    it('should be marked as intermediate difficulty', () => {
      expect(imageProcessingDefinition.metadata.difficulty).toBe('intermediate');
    });

    it('should have longer estimated time for image processing', () => {
      expect(imageProcessingDefinition.metadata.estimatedTime).toBe('30-60 seconds');
    });

    it('should have comprehensive image processing features', () => {
      const { features } = imageProcessingDefinition.metadata;
      expect(features).toContain('Multiple resolution generation');
      expect(features).toContain('Various image filters (grayscale, sepia, blur, sharpen)');
      expect(features).toContain('Format conversion (webp optimization)');
      expect(features).toContain('Quality control settings');
      expect(features).toContain('Parallel processing for efficiency');
    });

    it('should have media-related tags', () => {
      const { tags } = imageProcessingDefinition.metadata;
      expect(tags).toContain('media');
      expect(tags).toContain('etl');
      expect(tags).toContain('processing');
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields', () => {
      expect(imageProcessingDefinition.defaultPayload).toHaveProperty('imageId');
      expect(imageProcessingDefinition.defaultPayload).toHaveProperty('imageUrl');
      expect(imageProcessingDefinition.defaultPayload).toHaveProperty('options');
      expect(imageProcessingDefinition.defaultPayload).toHaveProperty('userId');
    });

    it('should have valid image URL', () => {
      const { imageUrl } = imageProcessingDefinition.defaultPayload;
      expect(imageUrl).toMatch(/^https:\/\//);
      expect(imageUrl).toContain('unsplash.com');
    });

    it('should have proper options structure', () => {
      const { options } = imageProcessingDefinition.defaultPayload;
      expect(options).toHaveProperty('filters');
      expect(options).toHaveProperty('outputFormat');
      expect(options).toHaveProperty('quality');
      expect(options).toHaveProperty('resolutions');
    });

    it('should have valid filter options', () => {
      const { filters } = imageProcessingDefinition.defaultPayload.options;
      expect(Array.isArray(filters)).toBe(true);
      expect(filters).toEqual(['grayscale', 'sepia', 'blur', 'sharpen']);
    });

    it('should have valid resolution options', () => {
      const { resolutions } = imageProcessingDefinition.defaultPayload.options;
      expect(Array.isArray(resolutions)).toBe(true);
      expect(resolutions).toEqual([320, 640, 960, 1200]);
      resolutions.forEach((res: any) => {
        expect(typeof res).toBe('number');
        expect(res).toBeGreaterThan(0);
        expect(res).toBeLessThanOrEqual(1200);
      });
    });

    it('should have valid quality setting', () => {
      const { quality } = imageProcessingDefinition.defaultPayload.options;
      expect(quality).toBe(85);
      expect(quality).toBeGreaterThanOrEqual(0);
      expect(quality).toBeLessThanOrEqual(100);
    });

    it('should have unique imageId with timestamp', () => {
      const { imageId } = imageProcessingDefinition.defaultPayload;
      expect(imageId).toMatch(/^img-\d+$/);
    });

    it('should specify webp as output format', () => {
      const { outputFormat } = imageProcessingDefinition.defaultPayload.options;
      expect(outputFormat).toBe('webp');
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof imageProcessingDefinition.workflow).toBe('function');
    });

    it('should accept image processing payload', async () => {
      const { imageProcessingWorkflow } = await import('@repo/orchestration');
      const mockImplementation = vi.fn().mockResolvedValue({
        status: 'success',
        data: {
          processedImages: [],
          summary: { totalVariants: 16 },
        },
      });
      vi.mocked(imageProcessingWorkflow).mockImplementation(mockImplementation);

      const mockContext = createMockContext({
        requestPayload: imageProcessingDefinition.defaultPayload,
        workflowRunId: 'test-run-image-123',
      });

      await imageProcessingDefinition.workflow(mockContext);
      expect(mockImplementation).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('image processing capabilities', () => {
    it('should support multiple resolutions', () => {
      const { resolutions } = imageProcessingDefinition.defaultPayload.options;
      expect(resolutions.length).toBeGreaterThan(1);
      // Check resolutions are in ascending order
      for (let i = 1; i < resolutions.length; i++) {
        expect(resolutions[i]).toBeGreaterThan(resolutions[i - 1]);
      }
    });

    it('should support various image filters', () => {
      const { filters } = imageProcessingDefinition.defaultPayload.options;
      const supportedFilters = ['grayscale', 'sepia', 'blur', 'sharpen'];
      filters.forEach((filter: any) => {
        expect(supportedFilters).toContain(filter);
      });
    });

    it('should support format conversion', () => {
      const { features } = imageProcessingDefinition.metadata;
      expect(features).toContain('Format conversion (webp optimization)');
      expect(imageProcessingDefinition.defaultPayload.options.outputFormat).toBe('webp');
    });

    it('should have quality control', () => {
      const { features } = imageProcessingDefinition.metadata;
      expect(features).toContain('Quality control settings');
      expect(imageProcessingDefinition.defaultPayload.options).toHaveProperty('quality');
    });

    it('should support parallel processing', () => {
      const { features } = imageProcessingDefinition.metadata;
      expect(features).toContain('Parallel processing for efficiency');
    });

    it('should have result viewer UI', () => {
      const { features } = imageProcessingDefinition.metadata;
      expect(features).toContain('Result viewer UI');
    });
  });

  describe('workflow variants calculation', () => {
    it('should generate correct number of variants', () => {
      const { filters, resolutions } = imageProcessingDefinition.defaultPayload.options;
      // Each resolution can have each filter applied
      const expectedVariants = filters.length * resolutions.length;
      expect(expectedVariants).toBe(16); // 4 filters * 4 resolutions
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(imageProcessingDefinition.metadata.color).toBe('green');
      expect(typeof imageProcessingDefinition.metadata.color).toBe('string');
    });
  });

  describe('user context', () => {
    it('should include userId in payload', () => {
      expect(imageProcessingDefinition.defaultPayload.userId).toBe('user-123');
    });
  });
});