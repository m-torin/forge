import { describe, expect } from 'vitest';
import {
  extractSafetyRatings,
  extractThinkingDetails,
  supportsCodeExecution,
  supportsImageGeneration,
  supportsImplicitCaching,
  supportsUrlContext,
  withEmbeddingConfig,
  withStructuredOutputs,
  withYouTubeContext,
} from '../../src/providers/google';

describe('google provider extra function coverage', () => {
  describe('withStructuredOutputs(boolean)', () => {
    test('enabled true sets structuredOutputs with mode', () => {
      const cfg = withStructuredOutputs(true, 'STRICT');
      expect(cfg.providerOptions.google.structuredOutputs.enabled).toBeTruthy();
      expect(cfg.providerOptions.google.structuredOutputs.mode).toBe('STRICT');
    });

    test('enabled false disables structured outputs', () => {
      const cfg = withStructuredOutputs(false);
      expect(cfg.providerOptions.google.structuredOutputs.enabled).toBeFalsy();
      expect(cfg.providerOptions.google.structuredOutputs.mode).toBe('AUTO');
    });
  });

  describe('withEmbeddingConfig', () => {
    test('sets taskType and dimensionality when provided', () => {
      const cfg = withEmbeddingConfig({
        taskType: 'SEMANTIC_SIMILARITY',
        outputDimensionality: 768,
      });
      expect(cfg.providerOptions.google.taskType).toBe('SEMANTIC_SIMILARITY');
      expect(cfg.providerOptions.google.outputDimensionality).toBe(768);
    });
  });

  describe('withYouTubeContext (options signature)', () => {
    test('accepts options object and applies defaults', () => {
      const cfg = withYouTubeContext({
        processTranscript: false,
        extractKeyframes: true,
        videoLengthLimit: 60,
      });
      expect(cfg.providerOptions.google.youtubeContext.processTranscript).toBeFalsy();
      expect(cfg.providerOptions.google.youtubeContext.extractKeyframes).toBeTruthy();
      expect(cfg.providerOptions.google.youtubeContext.videoLengthLimit).toBe(60);
    });

    test('uses default values when options are omitted', () => {
      const cfg = withYouTubeContext({} as any);
      expect(cfg.providerOptions.google.youtubeContext.processTranscript).toBeTruthy();
      expect(cfg.providerOptions.google.youtubeContext.extractKeyframes).toBeFalsy();
      expect(cfg.providerOptions.google.youtubeContext.videoLengthLimit).toBe(30);
    });
  });

  describe('withYouTubeContext (undefined options fallback)', () => {
    test('falls back to empty options object when first arg is undefined', () => {
      const cfg = withYouTubeContext(undefined as any);
      expect(cfg.providerOptions.google.youtubeContext.processTranscript).toBeTruthy();
      expect(cfg.providerOptions.google.youtubeContext.extractKeyframes).toBeFalsy();
      expect(cfg.providerOptions.google.youtubeContext.videoLengthLimit).toBe(30);
    });
  });

  describe('withYouTubeContext (string signature)', () => {
    test('defaults includedFeatures to TRANSCRIPT when not provided', () => {
      const cfg = withYouTubeContext('https://youtu.be/xyz');
      expect(cfg.providerOptions.google.youtubeContext.includedFeatures).toEqual(['TRANSCRIPT']);
    });

    test('respects provided includedFeatures array', () => {
      const cfg = withYouTubeContext('https://youtu.be/xyz', ['TRANSCRIPT', 'METADATA']);
      expect(cfg.providerOptions.google.youtubeContext.includedFeatures).toEqual([
        'TRANSCRIPT',
        'METADATA',
      ]);
    });
  });

  describe('supportsUrlContext', () => {
    test('returns true for 2.x and 2.5 models; false for gemma', () => {
      expect(supportsUrlContext('gemini-2.0-flash')).toBeTruthy();
      expect(supportsUrlContext('gemini-2.5-pro')).toBeTruthy();
      expect(supportsUrlContext('gemma-2-2b-it')).toBeFalsy();
    });
  });

  describe('other capability detection', () => {
    test('supportsCodeExecution returns true for modern Gemini, false for legacy/Gemma', () => {
      expect(supportsCodeExecution('gemini-2.5-pro')).toBeTruthy();
      expect(supportsCodeExecution('gemini-1.5-flash')).toBeFalsy();
      expect(supportsCodeExecution('gemma-2-2b-it')).toBeFalsy();
    });

    test('supportsImageGeneration matches image-capable models only', () => {
      expect(supportsImageGeneration('imagen-3.0-generate-002')).toBeTruthy();
      expect(supportsImageGeneration('gemini-2.5-pro')).toBeFalsy();
    });

    test('supportsImplicitCaching for thinking models and gemini-2.0-flash', () => {
      expect(supportsImplicitCaching('gemini-2.5-pro')).toBeTruthy();
      expect(supportsImplicitCaching('gemini-2.0-flash')).toBeTruthy();
      expect(supportsImplicitCaching('gemini-1.5-pro')).toBeFalsy();
    });
  });

  describe('extract helpers edge cases', () => {
    test('extractThinkingDetails works with tokens only (no reasoningText)', () => {
      const res = extractThinkingDetails({
        providerOptions: {
          google: {
            usageMetadata: { thoughtsTokenCount: 321 },
          },
        },
      } as any);
      expect(res).toEqual({ thoughtSummary: undefined, thinkingTokensUsed: 321 });
    });

    test('extractSafetyRatings returns null for missing array', () => {
      const res = extractSafetyRatings({ providerOptions: { google: {} } } as any);
      expect(res).toBeNull();
    });

    test('extractThinkingDetails returns null when neither summary nor tokens present', () => {
      const res = extractThinkingDetails({
        providerOptions: { google: { usageMetadata: {} } },
      } as any);
      expect(res).toBeNull();
    });
  });
});
