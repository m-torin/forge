import { describe, expect, test } from 'vitest';
import { anthropicTools } from '../../src/providers/anthropic';

describe('anthropicTools factory wrappers', () => {
  test('creates webSearch tool object', () => {
    const tool = anthropicTools.webSearch({ maxUses: 1, allowedDomains: ['example.com'] });
    expect(tool).toBeTruthy();
  });

  test('webSearch default options path uses fallback', () => {
    const tool = anthropicTools.webSearch();
    expect(tool).toBeTruthy();
  });

  test('creates codeExecution tool object', () => {
    const tool = anthropicTools.codeExecution();
    expect(tool).toBeTruthy();
  });

  test('creates computer tool object with display config', () => {
    const tool = anthropicTools.computer({ displayWidth: 1280, displayHeight: 720 });
    expect(tool).toBeTruthy();
  });

  test('computer tool default dimension fallbacks when 0 provided', () => {
    const tool = anthropicTools.computer({ displayWidth: 0 as any, displayHeight: 0 as any });
    expect(tool).toBeTruthy();
  });

  test.each([
    ['bash', () => anthropicTools.bash()],
    ['textEditor', () => anthropicTools.textEditor()],
    ['textEditorV2', () => anthropicTools.textEditorV2()],
  ])('creates %s tool', (_name, factory) => {
    const tool = factory();
    expect(tool).toBeTruthy();
  });
});
