import { describe, expect } from 'vitest';
import {
  extractImages,
  extractProviderMetadata,
  extractSources,
  extractUsageMetadata,
  isReasoningModel,
  isResearchModel,
  PERPLEXITY_MODEL_IDS,
  supportsCitations,
  supportsImageResponses,
  supportsWebSearch,
  withImages,
  withResearchMode,
} from '../../src/providers/perplexity';
import { makePerplexityResult } from '../helpers/factories';

describe('perplexity provider helper + extractors', () => {
  test('withImages sets return_images flag', () => {
    const cfg = withImages();
    expect(cfg.providerOptions.perplexity.return_images).toBeTruthy();
  });

  test('withResearchMode composes research mode and image flag', () => {
    const cfg = withResearchMode(true);
    expect(cfg.providerOptions.perplexity.return_images).toBeTruthy();
    expect(typeof (cfg as any).temperature).toBe('number'); // from commonModes.research()
  });

  test('extractSources reads result.sources or providerOptions', () => {
    const sources = extractSources(
      makePerplexityResult({}, { sources: [{ url: 'https://ex.com' }] }) as any,
    );
    expect(sources).toHaveLength(1);
    const sources2 = extractSources(
      makePerplexityResult({ sources: [{ url: 'a' } as any] }) as any,
    );
    expect(sources2).toHaveLength(1);
    expect(extractSources({} as any)).toHaveLength(0);
  });

  test('extractImages returns images array or empty', () => {
    const images = extractImages(
      makePerplexityResult({ images: [{ imageUrl: 'i', originUrl: 'o' } as any] }) as any,
    );
    expect(images[0].imageUrl).toBe('i');
    expect(extractImages({} as any)).toHaveLength(0);
  });

  test('extractUsageMetadata pulls citationTokens and numSearchQueries', () => {
    const meta = extractUsageMetadata(
      makePerplexityResult({ usage: { citationTokens: 5, numSearchQueries: 2 } as any }) as any,
    );
    expect(meta?.citationTokens).toBe(5);
    expect(meta?.numSearchQueries).toBe(2);
    expect(extractUsageMetadata({} as any)).toBeNull();
  });

  test('extractProviderMetadata combines usage/images/sources', () => {
    const res = extractProviderMetadata(
      makePerplexityResult({
        usage: { citationTokens: 1, numSearchQueries: 1 } as any,
        images: [],
        sources: [],
      }) as any,
    );
    expect(res?.usage?.citationTokens).toBe(1);
    expect(Array.isArray(res?.images)).toBeTruthy();
    expect(Array.isArray(res?.sources)).toBeTruthy();
  });

  test('extractProviderMetadata prefers top-level sources and handles missing usage', () => {
    const res = extractProviderMetadata({
      sources: [{ url: 'https://result.com', title: 'Result' }],
      providerOptions: { perplexity: { images: [{ imageUrl: 'i', originUrl: 'o' }] } },
    } as any);
    expect(res?.sources?.[0]?.url).toBe('https://result.com');
    expect(res?.usage).toBeUndefined();
    expect(res?.images?.length).toBe(1);
  });

  test('extractProviderMetadata defaults unknown fields and non-array sources', () => {
    const res = extractProviderMetadata({
      providerOptions: {
        perplexity: {
          usage: { citationTokens: 2 }, // missing numSearchQueries should default to 0
          sources: 'oops',
        },
      },
    } as any);
    expect(res?.usage?.citationTokens).toBe(2);
    expect(res?.usage?.numSearchQueries).toBe(0);
    expect(res?.sources).toEqual([]);
  });

  test('extractProviderMetadata usage defaults invalid numeric types to 0', () => {
    const res = extractProviderMetadata({
      providerOptions: { perplexity: { usage: { citationTokens: 'x', numSearchQueries: 'y' } } },
    } as any);
    expect(res?.usage).toEqual({ citationTokens: 0, numSearchQueries: 0 });
  });

  test('extractUsageMetadata returns null for non-object usage', () => {
    const res = extractUsageMetadata({ providerOptions: { perplexity: { usage: 'bad' } } } as any);
    expect(res).toBeNull();
  });

  test('extractUsageMetadata defaults fields when wrong types', () => {
    const res = extractUsageMetadata({
      providerOptions: {
        perplexity: { usage: { citationTokens: 'nope', numSearchQueries: 'nope' } },
      },
    } as any);
    expect(res).toEqual({ citationTokens: 0, numSearchQueries: 0 });
  });

  test('capability checks respect model lists', () => {
    expect(supportsWebSearch(PERPLEXITY_MODEL_IDS.SONAR_PRO)).toBeTruthy();
    expect(supportsCitations(PERPLEXITY_MODEL_IDS.SONAR)).toBeTruthy();
    expect(supportsImageResponses(PERPLEXITY_MODEL_IDS.SONAR)).toBeTruthy();
    expect(isReasoningModel(PERPLEXITY_MODEL_IDS.SONAR_REASONING)).toBeTruthy();
    expect(isResearchModel(PERPLEXITY_MODEL_IDS.SONAR_DEEP_RESEARCH)).toBeTruthy();
  });
});
