import { describe, expect } from 'vitest';

import {
  extractImages,
  extractProviderMetadata,
  extractSources,
  extractUsageMetadata,
  PERPLEXITY_MODEL_IDS,
  supportsCitations,
  supportsImageResponses,
  supportsWebSearch,
} from '../../src/providers/perplexity';
import { PPLX_RESEARCH } from '../fixtures/models';

describe('perplexity helpers', () => {
  test('prefers top-level sources when available', () => {
    const input = {
      sources: [
        {
          url: 'https://example.com',
          title: 'Example',
        },
      ],
      providerOptions: {
        perplexity: {
          sources: [{ url: 'https://other.com' }],
        },
      },
    } as any;

    const sources = extractSources(input);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.url).toBe('https://example.com');
  });

  test('reads metadata fields when top-level sources missing', () => {
    const input = {
      providerOptions: {
        perplexity: {
          sources: [{ url: 'https://docs.com', title: 'Docs' }],
          images: [
            {
              imageUrl: 'https://images.com/a.png',
              originUrl: 'https://origin.com',
              height: 100,
              width: 200,
            },
          ],
          usage: { citationTokens: 5, numSearchQueries: 2 },
        },
      },
    } as any;

    expect(extractSources(input)[0]?.url).toBe('https://docs.com');
    expect(extractImages(input)[0]?.imageUrl).toBe('https://images.com/a.png');

    const usage = extractUsageMetadata(input);
    expect(usage).toEqual({ citationTokens: 5, numSearchQueries: 2 });
  });

  test('handles non-array sources/images in metadata gracefully', () => {
    const input = {
      providerOptions: {
        perplexity: {
          sources: 'bad' as any,
          images: 'bad' as any,
        },
      },
    } as any;
    expect(extractSources(input)).toEqual([]);
    expect(extractImages(input)).toEqual([]);
  });

  test('returns empty metadata for missing provider payloads', () => {
    const input = {} as any;

    expect(extractSources(input)).toEqual([]);
    expect(extractImages(input)).toEqual([]);
    expect(extractUsageMetadata(input)).toBeNull();
    expect(extractProviderMetadata(input)).toBeNull();
  });

  test('respects capability defaults for unknown models', () => {
    expect(supportsWebSearch('unknown-model')).toBeFalsy();
    expect(supportsCitations('unknown-model')).toBeFalsy();
    expect(supportsImageResponses('unknown-model' as any)).toBeFalsy();
  });

  test('image responses disabled for deep research model', () => {
    expect(supportsImageResponses(PERPLEXITY_MODEL_IDS.SONAR_DEEP_RESEARCH)).toBeFalsy();
  });

  test.each(PPLX_RESEARCH)('image responses disabled (table): %s', m => {
    expect(supportsImageResponses(m)).toBeFalsy();
  });
});
