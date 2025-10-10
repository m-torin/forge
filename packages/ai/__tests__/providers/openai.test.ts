import { describe, expect } from 'vitest';

import {
  extractCachedPromptTokens,
  extractOpenAIMetadata,
  extractPredictionTokens,
  extractReasoningTokens,
} from '../../src/providers/openai';
import { makeOpenAIResult } from '../helpers/factories';

describe('openAI helpers', () => {
  const baseResult = makeOpenAIResult({
    reasoningTokens: 42,
    cachedPromptTokens: 7,
    acceptedPredictionTokens: 3,
    rejectedPredictionTokens: 1,
    responseId: 'resp_123',
  }) as any;

  test('extracts reasoning, cache, and prediction tokens from provider metadata', () => {
    expect(extractReasoningTokens(baseResult)).toBe(42);
    expect(extractCachedPromptTokens(baseResult)).toBe(7);
    expect(extractPredictionTokens(baseResult)).toEqual({ accepted: 3, rejected: 1 });
  });

  test('returns structured metadata with optional fields', () => {
    const metadata = extractOpenAIMetadata(baseResult);
    expect(metadata).toEqual({
      responseId: 'resp_123',
      reasoningTokens: 42,
      cachedPromptTokens: 7,
      acceptedPredictionTokens: 3,
      rejectedPredictionTokens: 1,
      logprobs: undefined,
    });
  });

  test('returns undefined/null when metadata missing', () => {
    const empty = {} as any;
    expect(extractReasoningTokens(empty)).toBeUndefined();
    expect(extractCachedPromptTokens(empty)).toBeUndefined();
    expect(extractPredictionTokens(empty)).toBeUndefined();
    expect(extractOpenAIMetadata(empty)).toBeNull();
  });

  test('prediction and metadata extractors default non-number/string fields', () => {
    const input = makeOpenAIResult({
      acceptedPredictionTokens: 'x' as any,
      rejectedPredictionTokens: null as any,
      responseId: 123 as any,
      reasoningTokens: 'not-number' as any,
      cachedPromptTokens: null as any,
    }) as any;
    expect(extractPredictionTokens(input)).toEqual({ accepted: undefined, rejected: undefined });
    const meta = extractOpenAIMetadata(input);
    expect(meta).toEqual({
      responseId: undefined,
      reasoningTokens: undefined,
      cachedPromptTokens: undefined,
      acceptedPredictionTokens: undefined,
      rejectedPredictionTokens: undefined,
      logprobs: undefined,
    });
  });
});
