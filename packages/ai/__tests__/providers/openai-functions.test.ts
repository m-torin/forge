import { describe, expect } from 'vitest';
import {
  __test as openaiInternal,
  withPredictedOutput,
  withPromptCache,
  withReasoningMode,
  withServiceTier,
  withStrictMode,
  withStructuredOutput,
} from '../../src/providers/openai';

describe('openai provider helper functions', () => {
  test('withStructuredOutput sets responseFormat and strict flag', () => {
    const cfg1 = withStructuredOutput();
    expect(cfg1.openai.responseFormat).toEqual({ type: 'json_object' });
    expect(cfg1.openai.strictJsonSchema).toBeFalsy();

    const cfg2 = withStructuredOutput('json_schema', true);
    expect(cfg2.openai.responseFormat).toEqual({ type: 'json_schema' });
    expect(cfg2.openai.strictJsonSchema).toBeTruthy();
  });

  test('withReasoningMode sets maxCompletionTokens and reasoningEffort', () => {
    const cfg = withReasoningMode(12345, 'high');
    expect(cfg.providerOptions.openai.maxCompletionTokens).toBe(12345);
    expect(cfg.providerOptions.openai.reasoningEffort).toBe('high');
  });

  test('withPredictedOutput sets prediction text', () => {
    const cfg = withPredictedOutput('EXPECTED');
    expect(cfg.openai.prediction.content).toBe('EXPECTED');
  });

  test('withPromptCache toggles cache and allows cache key', () => {
    const on = withPromptCache(true, 'cache-key');
    expect(on.openai.store).toBeTruthy();
    expect(on.openai.promptCacheKey).toBe('cache-key');

    const off = withPromptCache(false);
    expect(off.openai.store).toBeFalsy();
  });

  test('withPromptCache enabled without key does not set key', () => {
    const cfg = withPromptCache(true);
    expect(cfg.openai.store).toBeTruthy();
    expect((cfg.openai as any).promptCacheKey).toBeUndefined();
  });

  test('withServiceTier sets tier', () => {
    const cfg = withServiceTier('priority');
    expect(cfg.openai.serviceTier).toBe('priority');
  });

  test('withStrictMode toggles strict', () => {
    const on = withStrictMode();
    expect(on.openai.strict).toBeTruthy();
    const off = withStrictMode(false);
    expect(off.openai.strict).toBeFalsy();
  });

  test('withLogprobs numeric form sets value directly', async () => {
    const cfg = openaiInternal.withLogprobs(2).openai as any;
    expect(cfg.logprobs).toBe(2);
  });

  test('withImageGeneration standard quality stays standard', async () => {
    const cfg = openaiInternal.withImageGeneration('1024x1024', 'standard').openai as any;
    expect(cfg.quality).toBe('standard');
  });

  test('withAudioOutput defaults have no instructions', async () => {
    const cfg = openaiInternal.withAudioOutput().openai as any;
    expect(cfg.audio.voice).toBe('alloy');
    expect(cfg.audio.speed).toBe(1.0);
    expect(cfg.instructions).toBeUndefined();
  });
});
