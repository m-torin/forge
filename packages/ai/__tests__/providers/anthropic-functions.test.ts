import { describe, expect, test } from 'vitest';
import {
  ANTHROPIC_MODEL_IDS,
  extractToolErrors,
  getCacheMinTokens,
  getMaxContextTokens,
  isMultimodalModel,
  isReasoningModel,
  supportsCodeExecution,
  supportsComputerUse,
  supportsPDF,
  supportsReasoning,
  supportsWebSearch,
  withCacheControl,
  withComputerUse,
  withExtendedCache,
  withPDFSupport,
  withReasoning,
  withSendReasoning,
} from '../../src/providers/anthropic';
import { ANTHROPIC_PDF } from '../fixtures/models';

describe('anthropic provider helpers and capabilities', () => {
  test('withReasoning sets thinking budget', () => {
    const cfg = withReasoning(15000);
    expect(cfg.providerOptions.anthropic.thinking.budgetTokens).toBe(15000);
  });

  test('withCacheControl sets ephemeral type and ttl', () => {
    const cfg = withCacheControl('1h');
    expect(cfg.providerOptions.anthropic.cacheControl.type).toBe('ephemeral');
    expect(cfg.providerOptions.anthropic.cacheControl.ttl).toBe('1h');
  });

  test('withCacheControl without ttl omits ttl field', () => {
    const cfg = withCacheControl();
    expect(cfg.providerOptions.anthropic.cacheControl.type).toBe('ephemeral');
    expect((cfg.providerOptions.anthropic.cacheControl as any).ttl).toBeUndefined();
  });

  test('withSendReasoning toggles send flag', () => {
    const cfg = withSendReasoning(false);
    expect(cfg.providerOptions.anthropic.sendReasoning).toBeFalsy();
  });

  test('withExtendedCache returns headers and cache ttl', () => {
    const cfg = withExtendedCache();
    expect(cfg.headers['anthropic-beta']).toContain('extended-cache-ttl');
    expect(cfg.providerOptions.anthropic.cacheControl.ttl).toBe('1h');
  });

  test('withPDFSupport returns middleware token (truthy)', () => {
    const middleware = withPDFSupport();
    expect(middleware).toBeTruthy();
  });

  test('withComputerUse returns display config object', () => {
    const cfg = withComputerUse({ widthPx: 1920, heightPx: 1080, displayNumber: 2 });
    expect(cfg.widthPx).toBe(1920);
    expect(cfg.heightPx).toBe(1080);
    expect(cfg.displayNumber).toBe(2);
  });

  test('withComputerUse default returns empty object', () => {
    const cfg = withComputerUse();
    expect(Object.keys(cfg)).toHaveLength(0);
  });

  test('withReasoning default budgetTokens is 12000', () => {
    const cfg = withReasoning();
    expect(cfg.providerOptions.anthropic.thinking.budgetTokens).toBe(12000);
  });

  test('capability detection and model info helpers', () => {
    const model = ANTHROPIC_MODEL_IDS.SONNET_35;
    expect(supportsReasoning(ANTHROPIC_MODEL_IDS.SONNET_4)).toBeTruthy();
    expect(supportsPDF(model)).toBeTruthy();
    expect(supportsComputerUse(ANTHROPIC_MODEL_IDS.SONNET_4)).toBeTruthy();
    expect(supportsWebSearch(model)).toBeTruthy();
    expect(supportsCodeExecution(model)).toBeTruthy();
    expect(getCacheMinTokens(model)).toBeGreaterThan(0);
    expect(getMaxContextTokens(model)).toBeGreaterThan(0);
    expect(isReasoningModel(ANTHROPIC_MODEL_IDS.SONNET_37)).toBeTruthy();
    expect(isMultimodalModel(ANTHROPIC_MODEL_IDS.SONNET_35)).toBeTruthy();
  });

  test.each(ANTHROPIC_PDF)('supports PDF for: %s', m => {
    expect(supportsPDF(m)).toBeTruthy();
  });

  test('capability helpers return defaults for unknown model', () => {
    const unknown = 'unknown-model' as any;
    expect(supportsReasoning(unknown)).toBeFalsy();
    expect(supportsPDF(unknown)).toBeFalsy();
    expect(supportsComputerUse(unknown)).toBeFalsy();
    expect(supportsWebSearch(unknown)).toBeFalsy();
    expect(supportsCodeExecution(unknown)).toBeFalsy();
    expect(getCacheMinTokens(unknown)).toBe(1024);
    expect(getMaxContextTokens(unknown)).toBe(200000);
    expect(isReasoningModel(unknown)).toBeFalsy();
    expect(isMultimodalModel(unknown)).toBeFalsy();
  });

  test('extractToolErrors parses tool-error parts', () => {
    const errs = extractToolErrors({
      content: [
        { type: 'tool-result', text: 'ok' },
        { type: 'tool-error', toolName: 'web_search', toolCallId: 'id1', error: { msg: 'x' } },
      ],
    } as any);
    expect(errs).toHaveLength(1);
    expect(errs[0].toolName).toBe('web_search');
  });
});
