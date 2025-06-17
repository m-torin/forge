import { describe, it, expect } from 'vitest';
import {
  OpenGrepConfigSchema,
  SearchQuerySchema,
  SearchResultSchema,
  SearchResponseSchema,
  RuleSchema,
  ScanResultSchema,
  ScanResponseSchema,
} from '../types.js';

describe('OpenGrep Types', () => {
  describe('OpenGrepConfigSchema', () => {
    it('should validate valid config', () => {
      const validConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        maxRetries: 2,
      });

      expect(() => OpenGrepConfigSchema.parse(validConfig)).not.toThrow();
    });

    it('should apply defaults for missing values', () => {
      const minimalConfig = {});
      const result = OpenGrepConfigSchema.parse(minimalConfig);

      expect(result.baseUrl).toBe('https://semgrep.dev/api');
      expect(result.timeout).toBe(30000);
      expect(result.maxRetries).toBe(3);
    });

    it('should reject invalid URLs', () => {
      const invalidConfig = {
        baseUrl: 'not-a-url',
      });

      expect(() => OpenGrepConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('SearchQuerySchema', () => {
    it('should validate valid search query', () => {
      const validQuery = {
        pattern: 'console.log',
        language: 'javascript',
        paths: ['src/**'],
        excludePaths: ['node_modules/**'],
        maxResults: 50,
        caseSensitive: true,
      });

      expect(() => SearchQuerySchema.parse(validQuery)).not.toThrow();
    });

    it('should require pattern', () => {
      const invalidQuery = {
        language: 'javascript',
      });

      expect(() => SearchQuerySchema.parse(invalidQuery)).toThrow();
    });

    it('should apply defaults', () => {
      const minimalQuery = {
        pattern: 'test',
      });

      const result = SearchQuerySchema.parse(minimalQuery);
      expect(result.maxResults).toBe(100);
      expect(result.caseSensitive).toBe(false);
    });
  });

  describe('SearchResultSchema', () => {
    it('should validate valid search result', () => {
      const validResult = {
        file: 'src/test.js',
        line: 10,
        column: 5,
        match: 'console.log("hello")',
        context: {
          before: ['// Previous line'],
          after: ['// Next line'],
        },
        metadata: {
          rule: 'no-console',
        },
      };

      expect(() => SearchResultSchema.parse(validResult)).not.toThrow();
    });

    it('should require basic fields', () => {
      const invalidResult = {
        file: 'test.js',
        // missing line, column, match
      });

      expect(() => SearchResultSchema.parse(invalidResult)).toThrow();
    });
  });

  describe('RuleSchema', () => {
    it('should validate valid rule', () => {
      const validRule = {
        id: 'no-console',
        message: 'Console statements should not be used',
        pattern: 'console.log(...)',
        language: 'javascript',
        severity: 'warning' as const,
        metadata: {
          category: 'best-practices',
        },
      };

      expect(() => RuleSchema.parse(validRule)).not.toThrow();
    });

    it('should only accept valid severity levels', () => {
      const invalidRule = {
        id: 'test',
        message: 'Test',
        pattern: 'test',
        language: 'javascript',
        severity: 'critical', // invalid severity
      });

      expect(() => RuleSchema.parse(invalidRule)).toThrow();
    });
  });

  describe('ScanResultSchema', () => {
    it('should validate valid scan result', () => {
      const validResult = {
        file: 'src/app.js',
        line: 15,
        column: 8,
        ruleId: 'security-rule-1',
        message: 'Potential security issue',
        severity: 'error' as const,
        fix: 'Use parameterized queries',
        metadata: {
          confidence: 'high',
        },
      };

      expect(() => ScanResultSchema.parse(validResult)).not.toThrow();
    });
  });

  describe('ScanResponseSchema', () => {
    it('should validate valid scan response', () => {
      const validResponse = {
        results: [
          {
            file: 'test.js',
            line: 1,
            column: 1,
            ruleId: 'rule-1',
            message: 'Issue found',
            severity: 'warning' as const,
          },
        ],
        errors: ['Error processing file.js'],
        warnings: ['Warning: file ignored'],
        stats: {
          filesScanned: 10,
          rulesRun: 5,
          scanTime: 1500,
        },
      };

      expect(() => ScanResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should require stats object', () => {
      const invalidResponse = {
        results: [],
        // missing stats
      });

      expect(() => ScanResponseSchema.parse(invalidResponse)).toThrow();
    });
  });
});
