/**
 * Google Provider Performance Test Suite
 * Tests for performance characteristics, memory usage, and optimization
 */

import { describe, expect } from 'vitest';
import {
  extractGoogleMetadata,
  google,
  GOOGLE_MODEL_CAPABILITIES,
  GOOGLE_MODEL_IDS,
  supportsThinking,
  withGoogleImageGeneration,
  withSafetySettings,
  withThinking,
} from '../../src/index';

describe('google Provider Performance', () => {
  describe('configuration Creation Performance', () => {
    test('should create thinking configuration quickly', () => {
      const start = performance.now();

      // Create 1000 thinking configurations
      for (let i = 0; i < 1000; i++) {
        withThinking(8192 + i, i % 2 === 0);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 10ms
      expect(duration).toBeLessThan(10);
    });

    test('should create safety configurations quickly', () => {
      const start = performance.now();

      // Create 1000 safety configurations
      for (let i = 0; i < 1000; i++) {
        withSafetySettings('BALANCED', {
          HARASSMENT: 'BLOCK_NONE',
          HATE_SPEECH: 'BLOCK_ONLY_HIGH',
        });
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 20ms
      expect(duration).toBeLessThan(20);
    });

    test('should compose multiple configurations efficiently', () => {
      const start = performance.now();

      // Create 500 complex composed configurations
      for (let i = 0; i < 500; i++) {
        const thinkingCfg = withThinking(8000 + i);
        const safetyCfg = withSafetySettings('BALANCED');
        const imageCfg = withGoogleImageGeneration('HIGH', 2);

        const config = {
          temperature: 0.7 + i * 0.001,
          maxOutputTokens: 1000 + i,
          providerOptions: {
            google: {
              ...thinkingCfg.providerOptions.google,
              ...safetyCfg.providerOptions.google,
              ...imageCfg.providerOptions.google,
            },
          },
        };

        // Verify composition worked
        expect((config as any).providerOptions.google.thinkingConfig).toBeDefined();
        expect((config as any).providerOptions.google.safetySettings).toBeDefined();
        expect((config as any).providerOptions.google.imageGeneration).toBeDefined();
        expect(config.temperature).toBeCloseTo(0.7 + i * 0.001, 3);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('capability Detection Performance', () => {
    test('should perform capability checks quickly', () => {
      const models = Object.values(GOOGLE_MODEL_IDS);
      const start = performance.now();

      // Check all capabilities for all models (multiple iterations)
      for (let i = 0; i < 100; i++) {
        models.forEach(model => {
          supportsThinking(model);
          // Other capability checks would go here in a real test
        });
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 5ms
      expect(duration).toBeLessThan(5);
    });

    test('should handle capability lookup for unknown models efficiently', () => {
      const unknownModels = Array.from({ length: 1000 }, (_, i) => `unknown-model-${i}`);
      const start = performance.now();

      unknownModels.forEach(model => {
        supportsThinking(model);
      });

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 5ms even for unknown models
      expect(duration).toBeLessThan(5);
    });
  });

  describe('memory Usage', () => {
    test('should not leak memory during configuration creation', () => {
      // Get initial memory usage (if available)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Create many configurations
      const configurations = [];
      for (let i = 0; i < 1000; i++) {
        configurations.push({
          ...withThinking(8000 + i, i % 2 === 0),
          ...withSafetySettings('BALANCED'),
        });
      }

      // Clear references
      configurations.length = 0;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Check memory usage hasn't grown significantly
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory growth should be reasonable (this is a rough check)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
      }
    });

    test('should handle large configuration objects efficiently', () => {
      const start = performance.now();

      const thinkingCfg = withThinking(32000, true);
      const safetyCfg = withSafetySettings('BALANCED', {
        HARASSMENT: 'BLOCK_NONE',
        HATE_SPEECH: 'BLOCK_ONLY_HIGH',
        SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
        DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
      });
      const imageCfg = withGoogleImageGeneration('HIGH', 10, 2048);

      // Create a very large configuration
      const largeConfig = {
        providerOptions: {
          google: {
            ...thinkingCfg.providerOptions.google,
            ...safetyCfg.providerOptions.google,
            ...imageCfg.providerOptions.google,
          },
        },
        // Add many additional properties
        ...Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`customProp${i}`, `value${i}`]),
        ),
      };

      // Verify the configuration is created correctly
      expect((largeConfig as any).providerOptions.google.thinkingConfig.thinkingBudget).toBe(32000);
      expect(largeConfig.providerOptions.google.imageGeneration.count).toBe(10);
      expect((largeConfig as any).customProp99).toBe('value99');

      const end = performance.now();
      const duration = end - start;

      // Should complete quickly even for large configurations
      expect(duration).toBeLessThan(5);
    });
  });

  describe('response Processing Performance', () => {
    const mockResults = Array.from({ length: 100 }, (_, i) => ({
      text: `Response ${i}`,
      finishReason: 'stop' as const,
      providerOptions: {
        google: {
          thinkingDetails: {
            actualThinkingTokens: 1000 + i,
            thinkingBudget: 8192,
            includeThoughts: i % 2 === 0,
            thinkingSummary: `Thinking summary ${i}`,
          },
          safetyRatings: [
            { category: 'HARASSMENT', probability: 'NEGLIGIBLE', blocked: false },
            { category: 'HATE_SPEECH', probability: 'LOW', blocked: false },
          ],
          usage: {
            inputTokens: 50 + i,
            outputTokens: 100 + i,
            totalTokens: 150 + i * 2,
          },
        },
      },
    }));

    test('should process metadata extraction quickly', () => {
      const start = performance.now();

      // Process all mock results
      const results = mockResults.map(result => extractGoogleMetadata(result as any));

      const end = performance.now();
      const duration = end - start;

      // Should process 100 results in under 10ms
      expect(duration).toBeLessThan(10);
      expect(results).toHaveLength(100);
      expect(results[0]?.thinkingDetails?.actualThinkingTokens).toBe(1000);
    });

    test('should handle null/undefined results gracefully and quickly', () => {
      const nullResults = Array.from({ length: 1000 }, () => null);
      const start = performance.now();

      const results = nullResults.map(result =>
        result ? extractGoogleMetadata(result as any) : null,
      );

      const end = performance.now();
      const duration = end - start;

      // Should process 1000 null results very quickly
      expect(duration).toBeLessThan(5);
      expect(results.every(r => r === null)).toBeTruthy();
    });
  });

  describe('constant Access Performance', () => {
    test('should access model constants quickly', () => {
      const start = performance.now();

      // Access constants many times
      for (let i = 0; i < 1000; i++) {
        const modelId = GOOGLE_MODEL_IDS.GEMINI_25_PRO;
        const capabilities = GOOGLE_MODEL_CAPABILITIES[modelId];
        expect(modelId).toBe('gemini-2.5-pro');
        expect(capabilities).toBeDefined();
        expect(capabilities?.thinking).toBeTruthy();
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 15ms (increased to account for assertion overhead in test environment)
      expect(duration).toBeLessThan(15);
    });

    test('should enumerate model groups efficiently', () => {
      const start = performance.now();

      // Enumerate all model groups multiple times
      for (let i = 0; i < 100; i++) {
        Object.entries(GOOGLE_MODEL_CAPABILITIES).forEach(([modelId, capabilities]) => {
          expect(typeof modelId).toBe('string');
          expect(typeof capabilities).toBe('object');
        });
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 10ms
      expect(duration).toBeLessThan(10);
    });
  });

  describe('composition Scaling', () => {
    test('should handle deep composition efficiently', () => {
      const start = performance.now();

      let config = {};

      // Apply 50 layers of composition
      for (let i = 0; i < 50; i++) {
        config = {
          ...config,
          ...withThinking(8000 + i, i % 2 === 0),
          [`layer${i}`]: `value${i}`,
        };
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 20ms
      expect(duration).toBeLessThan(20);

      // Verify the final configuration
      expect((config as any).providerOptions.google.thinkingConfig.thinkingBudget).toBe(8049);
      expect((config as any).layer49).toBe('value49');
    });

    test('should handle wide composition efficiently', () => {
      const start = performance.now();

      // Create 20 different helper configurations
      const helpers = Array.from({ length: 20 }, (_, i) =>
        withThinking(8000 + i * 100, i % 2 === 0),
      );

      // Compose them all together
      const config = Object.assign({}, ...helpers, {
        temperature: 0.7,
        maxOutputTokens: 2000,
      });

      const end = performance.now();
      const duration = end - start;

      // Should complete in under 10ms
      expect(duration).toBeLessThan(10);

      // The last thinking config should win
      expect(config.providerOptions.google.thinkingConfig.thinkingBudget).toBe(9900);
    });
  });

  describe('bundle Size Impact', () => {
    test('should have reasonable import overhead', () => {
      // This test mainly serves as documentation
      // In a real scenario, you'd measure bundle size impact

      const importStart = performance.now();

      // Simulate importing multiple Google provider functions
      const imports = {
        google,
        withThinking,
        withSafetySettings,
        extractGoogleMetadata,
        supportsThinking,
        GOOGLE_MODEL_IDS,
      };

      const importEnd = performance.now();
      const importDuration = importEnd - importStart;

      // Should import quickly
      expect(importDuration).toBeLessThan(1);
      expect(Object.keys(imports)).toHaveLength(6);
    });
  });
});
