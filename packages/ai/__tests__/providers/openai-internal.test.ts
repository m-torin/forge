import { describe, expect } from 'vitest';
import { __test as helpers } from '../../src/providers/openai';

describe('openai internal helpers (__test)', () => {
  test('compatibility + reasoning summary + function calling', () => {
    expect(helpers.withCompatibilityMode().openai.compatibility).toBe('strict');
    expect(helpers.withReasoningSummary('detailed').providerOptions.openai.reasoningSummary).toBe(
      'detailed',
    );
    const fc = helpers.withFunctionCalling('required', false).openai;
    expect(fc.toolChoice).toBe('required');
    expect(fc.parallelToolCalls).toBeFalsy();
  });

  test('user identification + metadata + previous response', () => {
    const uid = helpers.withUserIdentification('u1', 'sid').openai;
    expect(uid.user).toBe('u1');
    expect(uid.safetyIdentifier).toBe('sid');
    const meta = helpers.withMetadata({ a: 'b' }).openai;
    expect(meta.metadata.a).toBe('b');
    const prev = helpers.withPreviousResponseId('rid', 'inst').openai;
    expect(prev.previousResponseId).toBe('rid');
    expect((prev as any).instructions).toBe('inst');
  });

  test('include + logprobs + audio + transcription', () => {
    const inc = helpers.withInclude(['sys']).openai;
    expect(inc.include).toEqual(['sys']);
    const lp = helpers.withLogprobs(true, 3).openai;
    expect(lp.logprobs).toBe(3);
    const lb = helpers.withLogitBias({ 42: -1 }).openai as any;
    expect(lb.logitBias[42]).toBe(-1);
    const audio = helpers.withAudioOutput('verse', 1.2, 'hello').openai;
    expect(audio.audio.voice).toBe('verse');
    expect(audio.audio.speed).toBe(1.2);
    const trRes = helpers.withTranscriptionOptions({ temperature: 0.2, language: 'en' });
    expect(trRes.temperature).toBe(0.2);
    expect(trRes.openai.language).toBe('en');
  });

  test('image generation + detail + instructions', () => {
    const img = helpers.withImageGeneration('1024x1024', 'high').openai;
    expect(img.quality).toBe('hd');
    const detail = helpers.withImageDetail('high').openai;
    expect(detail.imageDetail).toBe('high');
    const instr = helpers.withInstructions('Follow this').openai;
    expect(instr.instructions).toBe('Follow this');
  });

  test.each([
    ['concise', 'low'],
    ['balanced', 'medium'],
    ['verbose', 'high'],
    ['low', 'low'],
    ['medium', 'medium'],
    ['high', 'high'],
  ] as const)('verbosity mapping %s -> %s', (input, expected) => {
    expect(helpers.withVerbosity(input).openai.textVerbosity).toBe(expected);
  });

  test('transcription options include prompt and granularities', () => {
    const tr = helpers.withTranscriptionOptions({
      prompt: 'Domain-specific hints',
      timestampGranularities: ['word', 'segment'],
    });
    expect(tr.openai.prompt).toBe('Domain-specific hints');
    expect(tr.openai.timestampGranularities).toEqual(['word', 'segment']);
  });

  test('distillation options set store, storeName, metadata', () => {
    const on = helpers.withDistillation(true, { src: 'unit' }).openai as any;
    expect(on.store).toBeTruthy();
    expect(on.storeName).toBe('default');
    expect(on.metadata.src).toBe('unit');
    const off = helpers.withDistillation(false).openai as any;
    expect(off.store).toBeFalsy();
    expect(off.storeName).toBeUndefined();
  });
});
