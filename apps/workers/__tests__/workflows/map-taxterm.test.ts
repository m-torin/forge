import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import mapTaxtermDefinition from '../../app/workflows/map-taxterm/definition';
import type { MapTaxtermPayload } from '../../app/workflows/map-taxterm/definition';
import { createMockContext } from '../test-helpers';

describe('Map Taxterm Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(mapTaxtermDefinition.metadata).toEqual({
        id: 'map-taxterm',
        color: 'lime',
        description: 'Map and organize taxonomy terms for classification',
        difficulty: 'beginner',
        estimatedTime: '5-10 seconds',
        features: [
          'Taxonomy term mapping',
          'Classification system',
          'Hierarchical organization',
          'Category assignment',
        ],
        tags: ['jollyRoger', 'etl'],
        title: 'Map Taxonomy Terms',
      });
    });

    it('should be marked as beginner difficulty', () => {
      expect(mapTaxtermDefinition.metadata.difficulty).toBe('beginner');
    });

    it('should have taxonomy-related features', () => {
      const { features } = mapTaxtermDefinition.metadata;
      expect(features).toContain('Taxonomy term mapping');
      expect(features).toContain('Classification system');
      expect(features).toContain('Hierarchical organization');
      expect(features).toContain('Category assignment');
    });

    it('should share tags with other jollyRoger workflows', () => {
      const { tags } = mapTaxtermDefinition.metadata;
      expect(tags).toContain('jollyRoger');
      expect(tags).toContain('etl');
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields', () => {
      expect(mapTaxtermDefinition.defaultPayload).toHaveProperty('message');
      expect(mapTaxtermDefinition.defaultPayload).toHaveProperty('terms');
    });

    it('should have valid default values', () => {
      expect(mapTaxtermDefinition.defaultPayload.message).toBe('Hello World from Map Taxterm!');
      expect(mapTaxtermDefinition.defaultPayload.terms).toEqual([
        { id: 'term-1', name: 'Electronics', category: 'root' },
        { id: 'term-2', name: 'Smartphones', category: 'electronics' },
        { id: 'term-3', name: 'Laptops', category: 'electronics' },
      ]);
    });

    it('should have hierarchical terms structure', () => {
      const { terms } = mapTaxtermDefinition.defaultPayload;
      expect(Array.isArray(terms)).toBe(true);
      expect(terms.length).toBe(3);
      
      // Check root term
      const rootTerm = terms.find((t: any) => t.category === 'root');
      expect(rootTerm).toBeDefined();
      expect(rootTerm?.name).toBe('Electronics');
      
      // Check child terms
      const childTerms = terms.filter((t: any) => t.category === 'electronics');
      expect(childTerms.length).toBe(2);
    });

    it('should have valid term structure', () => {
      const { terms } = mapTaxtermDefinition.defaultPayload;
      terms.forEach((term: any) => {
        expect(term).toHaveProperty('id');
        expect(term).toHaveProperty('name');
        expect(term).toHaveProperty('category');
        expect(typeof term.id).toBe('string');
        expect(typeof term.name).toBe('string');
        expect(typeof term.category).toBe('string');
      });
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof mapTaxtermDefinition.workflow).toBe('function');
    });

    it('should execute workflow steps in correct order', async () => {
      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: {
          message: 'Test taxonomy mapping',
          terms: [
            { id: 'test-1', name: 'Test Term 1' },
            { id: 'test-2', name: 'Test Term 2', category: 'test' },
          ],
        },
        workflowRunId: 'test-run-taxterm-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          return await fn();
        }),
      });

      const result = await mapTaxtermDefinition.workflow(mockContext);

      // Verify steps were called
      expect(mockContext.run).toHaveBeenCalledWith('validate-terms', expect.any(Function));
      expect(mockContext.run).toHaveBeenCalledWith('map-terms', expect.any(Function));

      // Verify console logs
      expect(console.log).toHaveBeenCalledWith('Starting taxonomy mapping: Test taxonomy mapping');
      expect(console.log).toHaveBeenCalledWith('Mapping 2 terms');
      expect(console.log).toHaveBeenCalledWith('Mapped 2 taxonomy terms');
    });

    it('should return success response with mapped terms', async () => {
      const inputTerms = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2', category: 'parent' },
      ];

      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: {
          message: 'Test message',
          terms: inputTerms,
        },
        workflowRunId: 'test-run-taxterm-456',
      });

      const result = await mapTaxtermDefinition.workflow(mockContext);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      
      expect(result.data).toHaveProperty('message', 'Test message');
      expect(result.data).toHaveProperty('originalTerms', inputTerms);
      expect(result.data).toHaveProperty('mappedTerms');
      expect(result.data).toHaveProperty('timestamp');
      expect(result.data).toHaveProperty('workflowRunId', 'test-run-taxterm-456');
      
      // Check mapped terms have additional properties
      expect(result.data.mappedTerms.length).toBe(2);
      result.data.mappedTerms.forEach((term: any, index: number) => {
        expect(term).toHaveProperty('id', inputTerms[index].id);
        expect(term).toHaveProperty('name', inputTerms[index].name);
        expect(term).toHaveProperty('mapped', true);
        expect(term).toHaveProperty('mappedAt');
        expect(new Date(term.mappedAt).toISOString()).toBe(term.mappedAt);
      });
    });

    it('should handle missing payload gracefully', async () => {
      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: undefined as any,
        workflowRunId: 'test-run-taxterm-789',
      });

      const result = await mapTaxtermDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Starting taxonomy mapping: Hello World from Map Taxterm!');
      expect(console.log).toHaveBeenCalledWith('Mapping 0 terms');
      expect(console.log).toHaveBeenCalledWith('Mapped 0 taxonomy terms');
      
      expect(result.data.message).toBe('Hello World from Map Taxterm!');
      expect(result.data.originalTerms).toEqual([]);
      expect(result.data.mappedTerms).toEqual([]);
    });

    it('should handle empty terms array', async () => {
      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: {
          message: 'Empty terms test',
          terms: [],
        },
        workflowRunId: 'test-run-empty-123',
      });

      const result = await mapTaxtermDefinition.workflow(mockContext);

      expect(console.log).toHaveBeenCalledWith('Mapping 0 terms');
      expect(result.data.mappedTerms).toEqual([]);
    });

    it('should preserve category hierarchy', async () => {
      const hierarchicalTerms = [
        { id: 'root-1', name: 'Root Category', category: 'root' },
        { id: 'child-1', name: 'Child 1', category: 'root-1' },
        { id: 'child-2', name: 'Child 2', category: 'root-1' },
        { id: 'grandchild-1', name: 'Grandchild 1', category: 'child-1' },
      ];

      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: {
          terms: hierarchicalTerms,
        },
        workflowRunId: 'test-hierarchy-123',
      });

      const result = await mapTaxtermDefinition.workflow(mockContext);

      expect(result.data.mappedTerms.length).toBe(4);
      result.data.mappedTerms.forEach((term: any, index: number) => {
        expect(term.category).toBe(hierarchicalTerms[index].category);
      });
    });
  });

  describe('workflow steps', () => {
    it('should have validate-terms step', async () => {
      let validateTermsExecuted = false;
      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: { terms: [{ id: '1', name: 'Test' }] },
        workflowRunId: 'test-step-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'validate-terms') {
            validateTermsExecuted = true;
            const result = await fn();
            expect(result).toEqual({ validated: true, termCount: 1 });
          }
          return fn();
        }),
      });

      await mapTaxtermDefinition.workflow(mockContext);
      expect(validateTermsExecuted).toBe(true);
    });

    it('should have map-terms step', async () => {
      let mapTermsExecuted = false;
      const testTerms = [
        { id: 'term-x', name: 'Term X' },
        { id: 'term-y', name: 'Term Y', category: 'x' },
      ];

      const mockContext = createMockContext<MapTaxtermPayload>({
        requestPayload: { terms: testTerms },
        workflowRunId: 'test-map-123',
        run: vi.fn().mockImplementation(async (stepName, fn) => {
          if (stepName === 'map-terms') {
            mapTermsExecuted = true;
            const result = await fn();
            expect(result).toHaveProperty('mappedTerms');
            expect(result).toHaveProperty('originalTerms');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('workflowRunId');
            expect(result.mappedTerms.length).toBe(2);
          }
          return fn();
        }),
      });

      await mapTaxtermDefinition.workflow(mockContext);
      expect(mapTermsExecuted).toBe(true);
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(mapTaxtermDefinition.metadata.color).toBe('lime');
      expect(typeof mapTaxtermDefinition.metadata.color).toBe('string');
    });

    it('should have unique color among jollyRoger workflows', () => {
      // chart-sitemaps uses 'cyan', chart-pdps uses 'teal', map-taxterm uses 'lime'
      expect(mapTaxtermDefinition.metadata.color).not.toBe('cyan');
      expect(mapTaxtermDefinition.metadata.color).not.toBe('teal');
    });
  });

  describe('payload interface', () => {
    it('should accept optional fields', () => {
      const validPayloads: MapTaxtermPayload[] = [
        {},
        { message: 'Custom message' },
        { terms: [] },
        { message: 'Both fields', terms: [{ id: '1', name: 'Term' }] },
      ];

      validPayloads.forEach(payload => {
        expect(() => {
          const _: MapTaxtermPayload = payload;
        }).not.toThrow();
      });
    });

    it('should support terms without categories', () => {
      const termsWithoutCategories = [
        { id: 'term-1', name: 'Term 1' },
        { id: 'term-2', name: 'Term 2' },
      ];

      const payload: MapTaxtermPayload = {
        terms: termsWithoutCategories,
      };

      expect(payload.terms).toBeDefined();
      payload.terms?.forEach(term => {
        expect(term.category).toBeUndefined();
      });
    });
  });
});