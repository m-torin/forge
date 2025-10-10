import { describe, expect } from 'vitest';
import {
  extractCacheMetadata,
  extractProviderMetadata,
  extractReasoningDetails,
  extractToolErrors,
} from '../../src/providers/anthropic';
import { makeAnthropicResult } from '../helpers/factories';

describe('anthropic helpers', () => {
  test('reads reasoning metadata from providerMetadata', () => {
    const input = makeAnthropicResult({
      reasoningText: { reasoningContent: 'Internal chain of thought' } as any,
      cacheCreationInputTokens: 123,
      cacheReadInputTokens: 0,
    }) as any;
    input.reasoningText = 'Model reasoning text';

    const reasoning = extractReasoningDetails(input);
    expect(reasoning).toEqual({
      reasoningText: 'Internal chain of thought',
      reasoningDetails: {
        reasoningContent: 'Internal chain of thought',
      },
    });

    const cache = extractCacheMetadata(input);
    expect(cache).toEqual({ cacheCreationInputTokens: 123, cacheReadInputTokens: 0 });

    const providerMeta = extractProviderMetadata(input);
    expect(providerMeta).toEqual({
      cacheCreationInputTokens: 123,
      cacheReadInputTokens: 0,
      reasoningText: 'Model reasoning text',
      reasoningDetails: {
        reasoningContent: 'Internal chain of thought',
      },
    });
  });

  test('returns null when metadata missing', () => {
    const input = {} as any;
    expect(extractReasoningDetails(input)).toBeNull();
    expect(extractCacheMetadata(input)).toBeNull();
    expect(extractProviderMetadata(input)).toBeNull();
  });

  test('provider metadata reasoningDetails can be undefined when not object', () => {
    const input = makeAnthropicResult({
      reasoningText: 'not-an-object' as any,
      cacheCreationInputTokens: 10,
      cacheReadInputTokens: 1,
    }) as any;
    const meta = extractProviderMetadata(input);
    expect(meta).toEqual({
      cacheCreationInputTokens: 10,
      cacheReadInputTokens: 1,
      reasoningText: undefined,
      reasoningDetails: undefined,
    });
  });

  test('extractReasoningDetails returns empty text when content not string', () => {
    const input = makeAnthropicResult({
      reasoningText: { reasoningContent: 123 as any } as any,
    }) as any;
    const res = extractReasoningDetails(input);
    expect(res).toEqual({ reasoningText: '', reasoningDetails: { reasoningContent: 123 } });
  });

  test('extractReasoningDetails returns null when details is array', () => {
    const input = makeAnthropicResult({ reasoningText: [] as any }) as any;
    expect(extractReasoningDetails(input)).toBeNull();
  });

  test('extractCacheMetadata defaults to 0 when fields missing', () => {
    const input = makeAnthropicResult({}) as any;
    const cache = extractCacheMetadata(input);
    expect(cache).toEqual({ cacheCreationInputTokens: 0, cacheReadInputTokens: 0 });
  });

  test('extractProviderMetadata defaults numeric fields and tool error fallbacks', () => {
    const meta = extractProviderMetadata({
      providerOptions: {
        anthropic: {
          cacheCreationInputTokens: 'x',
          cacheReadInputTokens: null,
        },
      },
    } as any);
    expect(meta).toEqual({
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
      reasoningText: undefined,
      reasoningDetails: undefined,
    });

    const errs = extractToolErrors({
      content: [{ type: 'tool-error', error: { msg: 'oops' } }],
    } as any);
    expect(errs[0]).toEqual({ toolName: 'unknown', toolCallId: '', error: { msg: 'oops' } });
  });
});
