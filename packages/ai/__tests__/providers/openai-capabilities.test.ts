import { describe, expect, test } from 'vitest';
import {
  OPENAI_MODEL_IDS,
  __test as helpers,
  supportsPromptCaching,
  supportsReasoningMode,
  supportsServiceTier,
  supportsStructuredOutputs,
} from '../../src/providers/openai';
import { OPENAI_CHAT, OPENAI_REASONING } from '../fixtures/models';

describe('openai capability detection helpers', () => {
  test.each(OPENAI_REASONING)('reasoning mode detection: %s', m => {
    expect(supportsReasoningMode(m)).toBeTruthy();
  });
  test.each(OPENAI_CHAT)('non-reasoning chat model: %s', m => {
    expect(supportsReasoningMode(m)).toBeFalsy();
  });

  test.each(OPENAI_CHAT)('service tier allowed for chat: %s', m => {
    expect(supportsServiceTier(m)).toBeTruthy();
  });
  test.each(OPENAI_REASONING)('service tier not allowed for reasoning: %s', m => {
    expect(supportsServiceTier(m)).toBeFalsy();
  });

  test('structured outputs supported by chat and vision families', () => {
    expect(supportsStructuredOutputs(OPENAI_MODEL_IDS.GPT_4O)).toBeTruthy();
    expect(supportsStructuredOutputs(OPENAI_MODEL_IDS.GPT_IMAGE_1)).toBeFalsy();
  });

  test('prompt caching not supported on legacy models', () => {
    expect(supportsPromptCaching(OPENAI_MODEL_IDS.GPT_35_TURBO)).toBeFalsy();
    expect(supportsPromptCaching(OPENAI_MODEL_IDS.GPT_4O)).toBeTruthy();
  });

  test('internal native tool and predicted output detection (__test)', () => {
    expect(helpers.supportsNativeTools(OPENAI_MODEL_IDS.GPT_4O)).toBeTruthy();
    expect(helpers.supportsNativeTools(OPENAI_MODEL_IDS.GPT_IMAGE_1)).toBeFalsy();

    expect(helpers.supportsPredictedOutputs(OPENAI_MODEL_IDS.GPT_4O)).toBeTruthy();
    expect(helpers.supportsPredictedOutputs(OPENAI_MODEL_IDS.GPT_35_TURBO)).toBeFalsy();
  });
});
