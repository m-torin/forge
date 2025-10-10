import { describe, expect, test } from 'vitest';
import { __test as helpers } from '../../src/providers/anthropic';

describe('anthropic internal middleware creators (__test)', () => {
  test('middleware factories return configuration middleware objects', () => {
    expect(typeof helpers.createAnthropicReasoningMiddleware()).toBe('object');
    expect(typeof helpers.createAnthropicCacheMiddleware('5m')).toBe('object');
    expect(typeof helpers.createAnthropicSendReasoningMiddleware(false)).toBe('object');
    expect(typeof helpers.createAnthropicExtendedCacheMiddleware()).toBe('object');
    expect(typeof helpers.createAnthropicPDFMiddleware()).toBe('object');
  });
});
