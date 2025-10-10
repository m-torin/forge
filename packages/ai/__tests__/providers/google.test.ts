/**
 * Google Provider Test Suite
 * Comprehensive testing for Google Generative AI provider integration
 */

import { describe, expect, test, vi } from 'vitest';
import {
  createGoogleGenerativeAI,
  // Response processing
  extractGoogleMetadata,
  extractSafetyRatings,
  extractThinkingDetails,
  // Core Google provider
  google,
  GOOGLE_MODEL_CAPABILITIES,
  GOOGLE_MODEL_GROUPS,
  // Constants
  GOOGLE_MODEL_IDS,
  GOOGLE_MULTIMODAL_PRESETS,
  GOOGLE_PRESETS,
  GOOGLE_SAFETY_PRESETS,
  googleTools,
  isGemmaModel,
  supportsGoogleSearch,
  supportsMultimodal,
  // Capability detection
  supportsThinking,
  withGoogleImageGeneration,
  withResponseModalities,
  withSafetySettings,
  withStructuredOutputs,
  // Composition helpers
  withThinking,
  withYouTubeContext,
} from '../../src/index';
import { makeGoogleResult } from '../helpers/factories';

(vi as any).mock(
  '@ai-sdk/google',
  () => ({
    createGoogleGenerativeAI: vi.fn(),
    google: {
      tools: {
        googleSearch: vi.fn(),
        urlContext: vi.fn(),
        codeExecution: vi.fn(),
      },
    },
  }),
  { virtual: true },
);

vi.mock('katex/dist/katex.min.css', () => ({}));

describe('google Provider', () => {
  describe('core Provider Access', () => {
    test('should export google provider function', () => {
      expect(typeof google).toBe('object');
    });

    test('should export createGoogleGenerativeAI function', () => {
      expect(typeof createGoogleGenerativeAI).toBe('function');
    });

    test('should export googleTools', () => {
      expect(googleTools).toBeDefined();
      expect(googleTools.googleSearch).toBeDefined();
      expect(googleTools.urlContext).toBeDefined();
      expect(googleTools.codeExecution).toBeDefined();
    });
  });

  describe('model Constants', () => {
    test('should define all Google model IDs', () => {
      expect(GOOGLE_MODEL_IDS.GEMINI_25_PRO).toBe('gemini-2.5-pro');
      expect(GOOGLE_MODEL_IDS.GEMINI_25_FLASH).toBe('gemini-2.5-flash');
      expect(GOOGLE_MODEL_IDS.GEMINI_15_PRO).toBe('gemini-1.5-pro');
      expect(GOOGLE_MODEL_IDS.GEMINI_15_FLASH).toBe('gemini-1.5-flash');
      expect(GOOGLE_MODEL_IDS.GEMMA_2_2B).toBe('gemma-2-2b-it');
      expect(GOOGLE_MODEL_IDS.GEMMA_2_9B).toBe('gemma-2-9b-it');
      expect(GOOGLE_MODEL_IDS.GEMMA_2_27B).toBe('gemma-2-27b-it');
      expect(GOOGLE_MODEL_IDS.TEXT_EMBEDDING_004).toBe('text-embedding-004');
    });

    test('should define model groups correctly', () => {
      expect(GOOGLE_MODEL_GROUPS.GEMINI_MODELS).toContain('gemini-2.5-pro');
      expect(GOOGLE_MODEL_GROUPS.GEMINI_MODELS).toContain('gemini-2.5-flash');
      expect(GOOGLE_MODEL_GROUPS.GEMMA_MODELS).toContain('gemma-2-2b-it');
      expect(GOOGLE_MODEL_GROUPS.THINKING_MODELS).toContain('gemini-2.5-pro');
      expect(GOOGLE_MODEL_GROUPS.MULTIMODAL_MODELS).toContain('gemini-1.5-pro');
    });

    test('should define model capabilities', () => {
      const capabilities = GOOGLE_MODEL_CAPABILITIES['gemini-2.5-pro'];
      expect(capabilities).toBeDefined();
      expect(capabilities.thinking).toBeTruthy();
      expect(capabilities.multimodal).toBeTruthy();
      expect(capabilities.googleSearch).toBeTruthy();
    });
  });

  describe('composition Helpers', () => {
    describe('withThinking()', () => {
      test('should create thinking configuration with defaults', () => {
        const config = withThinking();

        expect(config).toHaveProperty('providerOptions');
        expect(config.providerOptions.google).toHaveProperty('thinkingConfig');
        expect(config.providerOptions.google.thinkingConfig.thinkingBudget).toBe(8192);
        expect(config.providerOptions.google.thinkingConfig.includeThoughts).toBeFalsy();
      });

      test('should create thinking configuration with custom values', () => {
        const config = withThinking(12000, true);

        expect(config.providerOptions.google.thinkingConfig.thinkingBudget).toBe(12000);
        expect(config.providerOptions.google.thinkingConfig.includeThoughts).toBeTruthy();
      });
    });

    describe('withSafetySettings()', () => {
      test('should create safety configuration with preset', () => {
        const config = withSafetySettings('BALANCED');

        expect(config).toHaveProperty('providerOptions');
        expect(config.providerOptions.google).toHaveProperty('safetySettings');
        expect(config.providerOptions.google.safetySettings.HARASSMENT).toBe(
          'BLOCK_MEDIUM_AND_ABOVE',
        );
        expect(config.providerOptions.google.safetySettings.HATE_SPEECH).toBe(
          'BLOCK_MEDIUM_AND_ABOVE',
        );
      });

      test('should create safety configuration with custom overrides', () => {
        const config = withSafetySettings('PERMISSIVE', {
          HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
          HATE_SPEECH: 'BLOCK_NONE',
        });

        expect(config.providerOptions.google.safetySettings.HARASSMENT).toBe(
          'BLOCK_MEDIUM_AND_ABOVE',
        );
        expect(config.providerOptions.google.safetySettings.HATE_SPEECH).toBe('BLOCK_NONE');
        expect(config.providerOptions.google.safetySettings.DANGEROUS_CONTENT).toBe(
          'BLOCK_ONLY_HIGH',
        );
      });
    });

    describe('withResponseModalities()', () => {
      test('should create response modalities configuration', () => {
        const config = withResponseModalities(['TEXT', 'AUDIO']);

        expect(config).toHaveProperty('providerOptions');
        expect(config.providerOptions.google).toHaveProperty('responseModalities');
        expect(config.providerOptions.google.responseModalities).toEqual(['TEXT', 'AUDIO']);
      });
    });

    // withCachedContent not implemented yet
    // describe('withCachedContent()', () => {
    //   it('should create cached content configuration', () => {
    //     const config = withCachedContent('cache-key-123', 7200);

    //     expect(config).toHaveProperty('providerOptions');
    //     expect(config.providerOptions.google).toHaveProperty('cachedContent');
    //     expect(config.providerOptions.google.cachedContent.name).toBe('cache-key-123');
    //     expect(config.providerOptions.google.cachedContent.ttlSeconds).toBe(7200);
    //   });
    // });

    describe('withStructuredOutputs()', () => {
      test('should create structured outputs configuration', () => {
        const schema = {
          type: 'object' as const,
          properties: { name: { type: 'string' as const } },
        };
        const config = withStructuredOutputs(schema, 'STRICT');

        expect(config).toHaveProperty('providerOptions');
        expect(config.providerOptions.google).toHaveProperty('structuredOutputs');
        expect(config.providerOptions.google.structuredOutputs.schema).toEqual(schema);
        expect(config.providerOptions.google.structuredOutputs.mode).toBe('STRICT');
      });
    });

    describe('multimodal Helpers', () => {
      // withFileInputs not implemented yet
      // describe('withFileInputs()', () => {
      //   it('should create file inputs configuration', () => {
      //     const files = ['document.pdf', 'image.jpg'];
      //     const config = withFileInputs(files, 'HIGH');

      //     expect(config).toHaveProperty('providerOptions');
      //     expect(config.providerOptions.google).toHaveProperty('fileInputs');
      //     expect(config.providerOptions.google.fileInputs.fileUris).toEqual(files);
      //     expect(config.providerOptions.google.fileInputs.processingQuality).toBe('HIGH');
      //   });
      // });

      describe('withGoogleImageGeneration()', () => {
        test('should create image generation configuration', () => {
          const config = withGoogleImageGeneration('HIGH', 4, 1024);

          expect(config).toHaveProperty('providerOptions');
          expect(config.providerOptions.google).toHaveProperty('imageGeneration');
          expect(config.providerOptions.google.imageGeneration.quality).toBe('HIGH');
          expect(config.providerOptions.google.imageGeneration.count).toBe(4);
          expect(config.providerOptions.google.imageGeneration.size).toBe(1024);
        });
      });

      describe('withYouTubeContext()', () => {
        test('should create YouTube context configuration', () => {
          const config = withYouTubeContext('https://youtube.com/watch?v=123', [
            'TRANSCRIPT',
            'COMMENTS',
          ]);

          expect(config).toHaveProperty('providerOptions');
          expect(config.providerOptions.google).toHaveProperty('youtubeContext');
          expect(config.providerOptions.google.youtubeContext.videoUrl).toBe(
            'https://youtube.com/watch?v=123',
          );
          expect(config.providerOptions.google.youtubeContext.includedFeatures).toEqual([
            'TRANSCRIPT',
            'COMMENTS',
          ]);
        });
      });
    });
  });

  describe('response Processing', () => {
    const mockResult = makeGoogleResult({
      usageMetadata: {
        thoughtsTokenCount: 1500,
        thinkingBudget: 8192,
        includeThoughts: true,
      } as any,
      safetyRatings: [
        { category: 'HARASSMENT', probability: 'NEGLIGIBLE' },
        { category: 'HATE_SPEECH', probability: 'LOW' },
      ] as any,
      usage: {
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
      } as any,
    }) as any;
    (mockResult as any).reasoningText = 'Test thinking summary';

    describe('extractGoogleMetadata()', () => {
      test('should extract complete Google metadata', () => {
        const metadata = extractGoogleMetadata(mockResult);

        expect(metadata).toBeDefined();
        expect(metadata?.safetyRatings).toHaveLength(2);
        expect(metadata?.usageMetadata).toBeDefined();
      });

      test('should return null for non-Google result', () => {
        const metadata = extractGoogleMetadata({});
        expect(metadata).toBeNull();
      });
    });

    describe('extractThinkingDetails()', () => {
      test('should extract thinking details', () => {
        const thinking = extractThinkingDetails(mockResult);

        expect(thinking).toBeDefined();
        expect(thinking?.thinkingTokensUsed).toBe(1500);
        expect(thinking?.thoughtSummary).toBe('Test thinking summary');
      });
    });

    describe('extractSafetyRatings()', () => {
      test('should extract safety ratings', () => {
        const safety = extractSafetyRatings(mockResult);

        expect(safety).toHaveLength(2);
        expect(safety![0].category).toBe('HARASSMENT');
        expect(safety![0].probability).toBe('NEGLIGIBLE');
      });
    });
  });

  describe('capability Detection', () => {
    describe('supportsThinking()', () => {
      test.each(['gemini-2.5-pro', 'gemini-2.5-flash'])('true for thinking-capable: %s', model =>
        expect(supportsThinking(model)).toBeTruthy(),
      );
      test.each(['gemini-1.5-pro', 'gemma-2-2b-it'])('false for non-thinking: %s', model =>
        expect(supportsThinking(model)).toBeFalsy(),
      );
    });

    describe('supportsGoogleSearch()', () => {
      test.each(['gemini-2.5-pro', 'gemini-1.5-pro'])('true for search-capable: %s', model =>
        expect(supportsGoogleSearch(model)).toBeTruthy(),
      );
      test.each(['gemma-2-2b-it'])('false for non-search: %s', model =>
        expect(supportsGoogleSearch(model)).toBeFalsy(),
      );
    });

    describe('supportsMultimodal()', () => {
      test.each(['gemini-2.5-pro', 'gemini-1.5-flash'])('true for multimodal: %s', model =>
        expect(supportsMultimodal(model)).toBeTruthy(),
      );
      test.each(['gemma-2-2b-it'])('false for text-only: %s', model =>
        expect(supportsMultimodal(model)).toBeFalsy(),
      );
    });

    describe('isGemmaModel()', () => {
      test.each(['gemma-2-2b-it', 'gemma-2-27b-it'])('true for Gemma: %s', model =>
        expect(isGemmaModel(model)).toBeTruthy(),
      );
      test.each(['gemini-2.5-pro'])('false for Gemini: %s', model =>
        expect(isGemmaModel(model)).toBeFalsy(),
      );
    });
  });

  describe('presets and Constants', () => {
    test('should define safety presets', () => {
      expect(GOOGLE_SAFETY_PRESETS.RESTRICTIVE).toBeDefined();
      expect(GOOGLE_SAFETY_PRESETS.BALANCED).toBeDefined();
      expect(GOOGLE_SAFETY_PRESETS.PERMISSIVE).toBeDefined();
    });

    test('should define general presets', () => {
      expect(GOOGLE_PRESETS.CREATIVE).toBeDefined();
      expect(GOOGLE_PRESETS.BALANCED).toBeDefined();
      expect(GOOGLE_PRESETS.PRECISE).toBeDefined();
    });

    test('should define multimodal presets', () => {
      expect(GOOGLE_MULTIMODAL_PRESETS.IMAGE_ANALYSIS).toBeDefined();
      expect(GOOGLE_MULTIMODAL_PRESETS.DOCUMENT_PROCESSING).toBeDefined();
      expect(GOOGLE_MULTIMODAL_PRESETS.VIDEO_UNDERSTANDING).toBeDefined();
    });
  });

  describe('composition Integration', () => {
    test('should compose multiple helpers correctly', () => {
      const thinkingConfig = withThinking(12000, true);
      const safetyConfig = withSafetySettings('BALANCED');
      const imageConfig = withGoogleImageGeneration('HIGH', 2);

      const config = {
        temperature: 0.7,
        maxOutputTokens: 2000,
        providerOptions: {
          google: {
            ...thinkingConfig.providerOptions.google,
            ...safetyConfig.providerOptions.google,
            ...imageConfig.providerOptions.google,
          },
        },
      };

      expect((config as any).providerOptions.google.thinkingConfig).toBeDefined();
      expect((config as any).providerOptions.google.safetySettings).toBeDefined();
      expect((config as any).providerOptions.google.imageGeneration).toBeDefined();
      expect(config.temperature).toBe(0.7);
      expect(config.maxOutputTokens).toBe(2000);
    });

    test('should not interfere with other provider options', () => {
      const thinkingConfig = withThinking(8000);

      const config = {
        providerOptions: {
          google: {
            ...thinkingConfig.providerOptions.google,
          },
          anthropic: { reasoningText: true },
          perplexity: { return_images: true },
        },
      };

      expect((config as any).providerOptions.google.thinkingConfig).toBeDefined();
      expect(config.providerOptions.anthropic.reasoningText).toBeTruthy();
      expect(config.providerOptions.perplexity.return_images).toBeTruthy();
    });
  });

  describe('error Handling', () => {
    test('should handle invalid model IDs gracefully', () => {
      expect(supportsThinking('invalid-model')).toBeFalsy();
      expect(supportsGoogleSearch('invalid-model')).toBeFalsy();
      expect(isGemmaModel('invalid-model')).toBeFalsy();
    });

    test('should handle malformed result objects', () => {
      // extractGoogleMetadata has null check: result.providerOptions?.google
      expect(() => extractGoogleMetadata(null as any)).not.toThrow();
      expect(extractGoogleMetadata({} as any)).toBeNull();
      expect(extractThinkingDetails({} as any)).toBeNull();
      expect(extractSafetyRatings({} as any)).toBeNull();
    });
  });
});
