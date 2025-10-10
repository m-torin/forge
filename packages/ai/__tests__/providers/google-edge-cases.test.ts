/**
 * Google Provider Edge Cases Test Suite
 * Tests for safety blocking, schema limitations, and boundary conditions
 */

import type { JSONSchema7 } from '@ai-sdk/provider';
import { describe, expect } from 'vitest';
import {
  extractGoogleMetadata,
  extractSafetyRatings,
  GOOGLE_MODEL_CAPABILITIES,
  supportsThinking,
  withGoogleImageGeneration,
  withSafetySettings,
  withStructuredOutputs,
  withThinking,
} from '../../src/index';

describe('google Provider Edge Cases', () => {
  describe('safety Blocking Edge Cases', () => {
    test('should handle safety blocking scenarios', () => {
      const blockedResult = {
        providerOptions: {
          google: {
            safetyRatings: [
              { category: 'HARASSMENT', probability: 'HIGH', blocked: true },
              { category: 'HATE_SPEECH', probability: 'MEDIUM', blocked: false },
              { category: 'DANGEROUS_CONTENT', probability: 'HIGH', blocked: true },
            ],
            blockReason: 'SAFETY',
          },
        },
      };

      const safety = extractSafetyRatings(blockedResult as any as any);
      const blocked = safety?.filter(s => s.blocked) ?? [];

      expect(safety).toHaveLength(3);
      expect(blocked).toHaveLength(2);
      expect(blocked[0].category).toBe('HARASSMENT');
      expect(blocked[1].category).toBe('DANGEROUS_CONTENT');
    });

    test('should handle partial safety blocking', () => {
      const partialResult = {
        providerOptions: {
          google: {
            safetyRatings: [
              { category: 'HARASSMENT', probability: 'LOW', blocked: false },
              { category: 'SEXUALLY_EXPLICIT', probability: 'HIGH', blocked: true },
            ],
          },
        },
      };

      const safety = extractSafetyRatings(partialResult as any);
      const blocked = safety?.filter(s => s.blocked) ?? [];

      expect(safety).toHaveLength(2);
      expect(blocked).toHaveLength(1);
      expect(blocked[0].category).toBe('SEXUALLY_EXPLICIT');
    });

    test('should validate safety setting values', () => {
      // Valid safety settings
      expect(() => withSafetySettings('STRICT')).not.toThrow();
      expect(() => withSafetySettings('BALANCED')).not.toThrow();
      expect(() => withSafetySettings('PERMISSIVE')).not.toThrow();

      // The function doesn't validate at creation time, but we can test the config shape
      const config = withSafetySettings('BALANCED', {
        HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
      });

      expect(config.providerOptions.google.safetySettings.HARASSMENT).toBe(
        'BLOCK_MEDIUM_AND_ABOVE',
      );
    });
  });

  describe('schema and Structured Output Edge Cases', () => {
    test('should handle complex nested schemas', () => {
      const complexSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  preferences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string' },
                        values: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const config = withStructuredOutputs(complexSchema);
      expect(config.providerOptions.google.structuredOutputs.schema).toEqual(complexSchema);
    });

    test('should handle schema validation failures', () => {
      const invalidResult = {
        providerOptions: {
          google: {
            schemaValidation: {
              valid: false,
              errors: [
                'Missing required property: user.profile.name',
                'Invalid type for property: user.age (expected number, got string)',
              ],
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(invalidResult as any);
      expect(metadata?.schemaValidation?.valid).toBeFalsy();
      expect(metadata?.schemaValidation?.errors).toHaveLength(2);
    });

    test('should handle large schema objects', () => {
      // Generate a schema with many properties
      const largeSchema: JSONSchema7 = {
        type: 'object',
        properties: {},
      };

      // Add 100 properties
      if (!largeSchema.properties) {
        largeSchema.properties = {};
      }
      for (let i = 0; i < 100; i++) {
        largeSchema.properties[`field_${i}`] = {
          type: 'string',
          description: `Field ${i} description`,
        };
      }

      const config = withStructuredOutputs(largeSchema);
      expect(
        Object.keys(config.providerOptions.google.structuredOutputs.schema?.properties || {}),
      ).toHaveLength(100);
    });
  });

  describe('thinking Budget Edge Cases', () => {
    test('should handle minimum thinking budget', () => {
      const config = withThinking(1, false);
      expect(config.providerOptions.google.thinkingConfig.thinkingBudget).toBe(1);
    });

    test('should handle maximum thinking budget', () => {
      const config = withThinking(32000, true);
      expect(config.providerOptions.google.thinkingConfig.thinkingBudget).toBe(32000);
    });

    test('should handle thinking timeout scenarios', () => {
      const timeoutResult = {
        providerOptions: {
          google: {
            thinkingDetails: {
              actualThinkingTokens: 8192,
              thinkingBudget: 8192,
              includeThoughts: false,
              timeoutReason: 'BUDGET_EXCEEDED',
              thinkingSummary: 'Thinking was cut short due to budget limit',
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(timeoutResult as any);
      expect(metadata?.thinkingDetails?.timeoutReason).toBe('BUDGET_EXCEEDED');
      expect(metadata?.thinkingDetails?.actualThinkingTokens).toBe(8192);
    });

    test('should handle thinking with invalid models', () => {
      // Non-thinking models should be detected properly
      expect(supportsThinking('gemma-2-2b-it')).toBeFalsy();
      expect(supportsThinking('gemini-1.5-pro')).toBeFalsy();
      expect(supportsThinking('text-embedding-004')).toBeFalsy();
    });
  });

  describe('multimodal Edge Cases', () => {
    test('should handle large file inputs', () => {
      const manyFiles = Array.from({ length: 50 }, (_, i) => `file_${i}.pdf`);
      const config = withGoogleImageGeneration('HIGH', 1);

      // Should handle the configuration without errors
      expect(config.providerOptions.google.imageGeneration.quality).toBe('HIGH');
    });

    test('should handle unsupported file formats gracefully', () => {
      const unsupportedResult = {
        providerOptions: {
          google: {
            fileProcessing: {
              supported: ['document.pdf'],
              unsupported: ['malware.exe', 'unknown.xyz'],
              errors: ['File type .exe not supported', 'File type .xyz not recognized'],
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(unsupportedResult as any);
      expect(metadata?.fileProcessing?.unsupported).toContain('unknown.xyz');
      expect(metadata?.fileProcessing?.errors).toHaveLength(2);
    });

    test('should handle YouTube processing errors', () => {
      const youtubeErrorResult = {
        providerOptions: {
          google: {
            youTubeProcessing: {
              videoUrl: 'https://youtube.com/watch?v=invalid',
              error: 'Video not found or private',
              availableFeatures: [],
              requestedFeatures: ['TRANSCRIPT', 'COMMENTS'],
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(youtubeErrorResult as any);
      expect(metadata?.youTubeProcessing?.error).toBe('Video not found or private');
      expect(metadata?.youTubeProcessing?.availableFeatures).toHaveLength(0);
    });
  });

  describe('rate Limiting and Quota Edge Cases', () => {
    test('should handle rate limiting scenarios', () => {
      const rateLimitResult = {
        text: null,
        finishReason: 'error',
        error: 'Rate limit exceeded',
        providerOptions: {
          google: {
            rateLimiting: {
              quotaExceeded: true,
              requestsPerMinute: 60,
              remainingRequests: 0,
              resetTime: Date.now() + 60000,
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(rateLimitResult as any);
      expect(metadata?.rateLimiting?.quotaExceeded).toBeTruthy();
      expect(metadata?.rateLimiting?.remainingRequests).toBe(0);
    });

    test('should handle token quota exhaustion', () => {
      const quotaResult = {
        text: 'Response was truncated due to quota limits...',
        finishReason: 'quota_exceeded',
        providerOptions: {
          google: {
            usage: {
              inputTokens: 1000,
              outputTokens: 500,
              totalTokens: 1500,
              quotaUsed: 95.5,
              quotaLimit: 100000,
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(quotaResult as any);
      expect(metadata?.usage?.quotaUsed).toBe(95.5);
      expect(metadata?.usage?.quotaLimit).toBe(100000);
    });
  });

  describe('model Capability Edge Cases', () => {
    test('should handle unknown model IDs gracefully', () => {
      const unknownModel = 'gemini-future-version';

      expect(supportsThinking(unknownModel)).toBeFalsy();
      expect(
        GOOGLE_MODEL_CAPABILITIES[unknownModel as keyof typeof GOOGLE_MODEL_CAPABILITIES],
      ).toBeUndefined();
    });

    test('should handle model deprecation scenarios', () => {
      // Simulate a deprecated model scenario
      const deprecatedResult = {
        text: 'Response from deprecated model',
        finishReason: 'stop',
        providerOptions: {
          google: {
            modelInfo: {
              id: 'gemini-1.0-pro',
              deprecated: true,
              deprecationDate: '2024-12-31',
              recommendedReplacement: 'gemini-1.5-pro',
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(deprecatedResult as any);
      expect(metadata?.modelInfo?.deprecated).toBeTruthy();
      expect(metadata?.modelInfo?.recommendedReplacement).toBe('gemini-1.5-pro');
    });
  });

  describe('caching Edge Cases', () => {
    test('should handle cache misses and invalidation', () => {
      const cacheResult = {
        text: 'Fresh response (cache miss)',
        finishReason: 'stop',
        providerOptions: {
          google: {
            caching: {
              hit: false,
              key: 'cache-key-123',
              reason: 'EXPIRED',
              ttlRemaining: 0,
              generatedAt: Date.now(),
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(cacheResult as any);
      expect(metadata?.caching?.hit).toBeFalsy();
      expect(metadata?.caching?.reason).toBe('EXPIRED');
    });

    test('should handle cache hit scenarios', () => {
      const cacheHitResult = {
        text: 'Cached response',
        finishReason: 'stop',
        providerOptions: {
          google: {
            caching: {
              hit: true,
              key: 'cache-key-456',
              ttlRemaining: 3600,
              cachedAt: Date.now() - 1000,
            },
          },
        },
      };

      const metadata = extractGoogleMetadata(cacheHitResult as any);
      expect(metadata?.caching?.hit).toBeTruthy();
      expect(metadata?.caching?.ttlRemaining).toBe(3600);
    });
  });
});
