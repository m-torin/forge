import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import genCopyDefinition from '../../app/workflows/gen-copy/definition';
import type { GenCopyPayload } from '../../app/workflows/gen-copy/definition';
import { createMockContext } from '../test-helpers';

describe('Gen Copy Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(genCopyDefinition.metadata).toEqual({
        id: 'gen-copy',
        color: 'pink',
        description: 'AI-powered copy generation with SEO optimization',
        difficulty: 'intermediate',
        estimatedTime: '10-20 seconds',
        features: [
          'AI content generation',
          'SEO optimization',
          'Multiple tone options',
          'Keyword integration',
          'Readability scoring',
          'Length customization',
        ],
        tags: ['ai', 'seo', 'etl'],
        title: 'Generate Copy',
      });
    });

    it('should be marked as intermediate difficulty', () => {
      expect(genCopyDefinition.metadata.difficulty).toBe('intermediate');
    });

    it('should have AI and SEO features', () => {
      const { features } = genCopyDefinition.metadata;
      expect(features).toContain('AI content generation');
      expect(features).toContain('SEO optimization');
      expect(features).toContain('Multiple tone options');
      expect(features).toContain('Keyword integration');
      expect(features).toContain('Readability scoring');
      expect(features).toContain('Length customization');
    });

    it('should have AI-related tags', () => {
      const { tags } = genCopyDefinition.metadata;
      expect(tags).toContain('ai');
      expect(tags).toContain('seo');
      expect(tags).toContain('etl');
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields', () => {
      expect(genCopyDefinition.defaultPayload).toHaveProperty('keywords');
      expect(genCopyDefinition.defaultPayload).toHaveProperty('length');
      expect(genCopyDefinition.defaultPayload).toHaveProperty('message');
      expect(genCopyDefinition.defaultPayload).toHaveProperty('tone');
      expect(genCopyDefinition.defaultPayload).toHaveProperty('topic');
    });

    it('should have valid default values', () => {
      expect(genCopyDefinition.defaultPayload.keywords).toEqual(['smart', 'home', 'automation', 'IoT']);
      expect(genCopyDefinition.defaultPayload.length).toBe('medium');
      expect(genCopyDefinition.defaultPayload.message).toBe('Hello World from Gen Copy!');
      expect(genCopyDefinition.defaultPayload.tone).toBe('friendly');
      expect(genCopyDefinition.defaultPayload.topic).toBe('Smart Home Device');
    });

    it('should have valid tone option', () => {
      const validTones = ['professional', 'casual', 'friendly', 'formal'];
      expect(validTones).toContain(genCopyDefinition.defaultPayload.tone);
    });

    it('should have valid length option', () => {
      const validLengths = ['short', 'medium', 'long'];
      expect(validLengths).toContain(genCopyDefinition.defaultPayload.length);
    });

    it('should have keywords array', () => {
      const { keywords } = genCopyDefinition.defaultPayload;
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      keywords.forEach((keyword: string) => {
        expect(typeof keyword).toBe('string');
      });
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof genCopyDefinition.workflow).toBe('function');
    });

    it('should execute workflow steps in correct order', async () => {
      const stepOrder: string[] = [];
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: {
          topic: 'Test Product',
          tone: 'professional',
          length: 'short',
          keywords: ['test', 'product'],
        },
        workflowRunId: 'test-run-copy-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          stepOrder.push(stepName);
          return await fn();
        }),
      });

      const result = await genCopyDefinition.workflow(mockContext);

      // Verify steps were called in correct order
      expect(stepOrder).toEqual(['prepare-params', 'generate-copy', 'optimize-seo']);
      
      // Verify console logs
      expect(console.log).toHaveBeenCalledWith('Preparing copy generation: Hello World from Gen Copy!');
      expect(console.log).toHaveBeenCalledWith('Topic: Test Product, Tone: professional, Length: short');
      expect(console.log).toHaveBeenCalledWith('Keywords: test, product');
      expect(console.log).toHaveBeenCalledWith('Optimizing copy for SEO...');
    });

    it('should return success response with generated copy', async () => {
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: {
          topic: 'Test Topic',
          tone: 'casual',
          keywords: ['keyword1', 'keyword2'],
          length: 'long',
        },
        workflowRunId: 'test-run-copy-456',
      });

      const result = await genCopyDefinition.workflow(mockContext);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      
      expect(result.data).toHaveProperty('generatedCopy');
      expect(result.data.generatedCopy).toContain('casual copy about Test Topic');
      expect(result.data.generatedCopy).toContain('Keywords: keyword1, keyword2');
      expect(result.data.generatedCopy).toContain('Length: long');
      
      expect(result.data).toHaveProperty('readabilityScore');
      expect(result.data).toHaveProperty('seoScore');
      expect(result.data).toHaveProperty('optimized', true);
      expect(result.data).toHaveProperty('seoEnhancements');
    });

    it('should handle missing payload gracefully', async () => {
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: undefined as any,
        workflowRunId: 'test-run-copy-789',
      });

      const result = await genCopyDefinition.workflow(mockContext);

      expect(result.data.generatedCopy).toContain('professional copy about Product Description');
      expect(result.data.params.tone).toBe('professional');
      expect(result.data.params.length).toBe('medium');
      expect(result.data.params.topic).toBe('Product Description');
      expect(result.data.params.keywords).toEqual([]);
    });
  });

  describe('workflow steps', () => {
    it('should have prepare-params step', async () => {
      let prepareParamsExecuted = false;
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: { topic: 'Test' },
        workflowRunId: 'test-step-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'prepare-params') {
            prepareParamsExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('topic');
            expect(result).toHaveProperty('tone');
            expect(result).toHaveProperty('length');
            expect(result).toHaveProperty('keywords');
            expect(result).toHaveProperty('preparedAt');
          }
          return fn();
        }),
      });

      await genCopyDefinition.workflow(mockContext);
      expect(prepareParamsExecuted).toBe(true);
    });

    it('should have generate-copy step', async () => {
      let generateCopyExecuted = false;
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: { keywords: ['test'] },
        workflowRunId: 'test-generate-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'generate-copy') {
            generateCopyExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('generatedCopy');
            expect(result).toHaveProperty('readabilityScore');
            expect(result).toHaveProperty('seoScore');
            expect(typeof result.readabilityScore).toBe('number');
            expect(typeof result.seoScore).toBe('number');
          }
          return fn();
        }),
      });

      await genCopyDefinition.workflow(mockContext);
      expect(generateCopyExecuted).toBe(true);
    });

    it('should have optimize-seo step', async () => {
      let optimizeSeoExecuted = false;
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: {},
        workflowRunId: 'test-optimize-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'optimize-seo') {
            optimizeSeoExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('optimized', true);
            expect(result).toHaveProperty('seoEnhancements');
            expect(Array.isArray(result.seoEnhancements)).toBe(true);
            expect(result.seoEnhancements).toEqual([
              'Added meta description',
              'Optimized keyword density',
              'Improved readability',
            ]);
          }
          return fn();
        }),
      });

      await genCopyDefinition.workflow(mockContext);
      expect(optimizeSeoExecuted).toBe(true);
    });
  });

  describe('tone options', () => {
    it('should support all tone variations', async () => {
      const tones: GenCopyPayload['tone'][] = ['professional', 'casual', 'friendly', 'formal'];
      
      for (const tone of tones) {
        const mockContext = createMockContext<GenCopyPayload>({
          requestPayload: { tone },
          workflowRunId: `test-tone-${tone}`,
        });

        const result = await genCopyDefinition.workflow(mockContext);
        expect(result.data.generatedCopy).toContain(`${tone} copy`);
      }
    });
  });

  describe('length options', () => {
    it('should support all length variations', async () => {
      const lengths: GenCopyPayload['length'][] = ['short', 'medium', 'long'];
      
      for (const length of lengths) {
        const mockContext = createMockContext<GenCopyPayload>({
          requestPayload: { length },
          workflowRunId: `test-length-${length}`,
        });

        const result = await genCopyDefinition.workflow(mockContext);
        expect(result.data.generatedCopy).toContain(`Length: ${length}`);
      }
    });
  });

  describe('scoring features', () => {
    it('should generate readability scores', async () => {
      const mockContext = createMockContext<GenCopyPayload>({
        requestPayload: {},
        workflowRunId: 'test-scoring-123',
      });

      const result = await genCopyDefinition.workflow(mockContext);
      
      expect(result.data.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.data.readabilityScore).toBeLessThanOrEqual(100);
      expect(result.data.seoScore).toBeGreaterThanOrEqual(0);
      expect(result.data.seoScore).toBeLessThanOrEqual(100);
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(genCopyDefinition.metadata.color).toBe('pink');
      expect(typeof genCopyDefinition.metadata.color).toBe('string');
    });
  });
});