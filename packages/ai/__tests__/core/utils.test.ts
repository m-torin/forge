/**
 * Tests for core utilities with ES2023 modernization
 */

import type { UIMessage } from 'ai';
import { convertToModelMessages } from 'ai';
import { describe, expect, test, vi } from 'vitest';
import {
  calculateCost,
  formatUsage,
  generateOperationId,
  isRetryableError,
  mergeConfigs,
  messageUtils,
  retryWithBackoff,
  validateConfig,
} from '../../src/core/utils';

describe('core Utils', () => {
  describe('generateOperationId', () => {
    test('should generate unique operation IDs', () => {
      const id1 = generateOperationId();
      const id2 = generateOperationId();

      expect(id1).toMatch(/^ai_op_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^ai_op_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('calculateCost', () => {
    test('should calculate costs for known models', () => {
      const usage = { inputTokens: 1000, outputTokens: 500 };

      const gpt4Cost = calculateCost('gpt-4', usage);
      expect(gpt4Cost).toBe(0.03 + 0.03); // 0.03 * 1 + 0.06 * 0.5

      const claudeCost = calculateCost('claude-3-sonnet', usage);
      expect(claudeCost).toBe(0.003 + 0.0075); // 0.003 * 1 + 0.015 * 0.5
    });

    test('should use default rates for unknown models', () => {
      const usage = { inputTokens: 1000, outputTokens: 500 };
      const cost = calculateCost('unknown-model', usage);

      expect(cost).toBe(0.001 + 0.001); // default rates
    });

    test('should handle empty model ID', () => {
      const usage = { inputTokens: 1000, outputTokens: 500 };
      const cost = calculateCost('', usage);

      expect(cost).toBe(0.001 + 0.001); // default rates
    });
  });

  describe('validateConfig', () => {
    test('should validate temperature range', () => {
      expect(validateConfig({ temperature: 0.7 })).toEqual({
        valid: true,
        errors: [],
      });

      expect(validateConfig({ temperature: 2.5 })).toEqual({
        valid: false,
        errors: ['Temperature must be between 0 and 2'],
      });

      expect(validateConfig({ temperature: -0.1 })).toEqual({
        valid: false,
        errors: ['Temperature must be between 0 and 2'],
      });
    });

    test('should validate maxOutputTokens', () => {
      expect(validateConfig({ maxOutputTokens: 1000 })).toEqual({
        valid: true,
        errors: [],
      });

      expect(validateConfig({ maxOutputTokens: 0 })).toEqual({
        valid: false,
        errors: ['maxOutputTokens must be greater than 0'],
      });
    });

    test('should validate topP range', () => {
      expect(validateConfig({ topP: 0.9 })).toEqual({
        valid: true,
        errors: [],
      });

      expect(validateConfig({ topP: 1.5 })).toEqual({
        valid: false,
        errors: ['topP must be between 0 and 1'],
      });
    });

    test('should handle multiple validation errors', () => {
      const result = validateConfig({
        temperature: 3,
        maxOutputTokens: -1,
        topP: 2,
      });

      expect(result.valid).toBeFalsy();
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('mergeConfigs', () => {
    test('should merge configuration objects', () => {
      const base = { a: 1, b: 2, c: 3 };
      const override = { b: 20, d: 4 };

      const result = mergeConfigs(base, override);

      expect(result).toEqual({ a: 1, b: 20, c: 3, d: 4 });
    });

    test('should handle empty override', () => {
      const base = { a: 1, b: 2 };
      const result = mergeConfigs(base);

      expect(result).toEqual(base);
    });
  });

  describe('retryWithBackoff', () => {
    test('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10 })).rejects.toThrow(
        'persistent failure',
      );

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    test('records non-Error rejections and throws them', async () => {
      const fn = vi.fn().mockRejectedValueOnce('string error').mockRejectedValue('string error');
      await expect(retryWithBackoff(fn, { maxRetries: 1, baseDelay: 1 })).rejects.toBeInstanceOf(
        Error,
      );
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRetryableError', () => {
    test('should identify retryable errors', () => {
      expect(isRetryableError(new Error('Rate limit exceeded'))).toBeTruthy();
      expect(isRetryableError(new Error('Connection timeout'))).toBeTruthy();
      expect(isRetryableError(new Error('Network error'))).toBeTruthy();
      expect(isRetryableError(new Error('HTTP 503'))).toBeTruthy();
    });

    test('should identify non-retryable errors', () => {
      expect(isRetryableError(new Error('Invalid API key'))).toBeFalsy();
      expect(isRetryableError(new Error('Unauthorized'))).toBeFalsy();
    });

    test('should handle non-Error objects', () => {
      expect(isRetryableError('rate limit')).toBeTruthy();
      expect(isRetryableError({ message: 'timeout' })).toBeTruthy();
      expect(isRetryableError(null)).toBeFalsy();
      expect(isRetryableError(undefined)).toBeFalsy();
    });
  });

  describe('formatUsage', () => {
    test('should format usage correctly', () => {
      const usage = { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 };
      const result = formatUsage(usage);

      expect(result.formatted).toBe('1,000 in + 500 out = 1,500 total');
      expect(typeof result.cost).toBe('number');
      expect(result.inputTokens).toBe(1000);
      expect(result.outputTokens).toBe(500);
      expect(result.totalTokens).toBe(1500);
    });

    test('should handle large numbers with locale formatting', () => {
      const usage = { inputTokens: 123456, outputTokens: 78901, totalTokens: 202357 };
      const result = formatUsage(usage);

      expect(result.formatted).toBe('123,456 in + 78,901 out = 202,357 total');
    });
  });

  describe('messageUtils.normalize', () => {
    test('should normalize string messages', () => {
      const messages = ['Hello', 'World'];
      const result = messageUtils.normalize(messages);

      expect(result).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'World' },
      ]);
    });

    test('should normalize object messages', () => {
      const messages = [
        { role: 'system', content: 'You are helpful' },
        { content: 'Hello', text: 'Fallback' },
        { role: 'assistant' }, // Missing content - should be filtered out
      ] as any;

      const result = messageUtils.normalize(messages);

      expect(result).toEqual([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello', text: 'Fallback' },
        // No third item because message without content/text/parts is filtered out
      ]);
    });

    test('should handle non-array input', () => {
      const result = messageUtils.normalize('not an array' as any);
      expect(result).toEqual([]);
    });

    test('should use nullish coalescing for ES2023', () => {
      const messages = [{ text: 'Fallback text' }] as any;

      const result = messageUtils.normalize(messages);

      expect(result[0].role).toBe('user'); // undefined ?? 'user'
      expect(result[0].content).toBe('Fallback text'); // text becomes content
    });

    test('should convert UIMessage with parts via convertToModelMessages', () => {
      const ui: UIMessage = {
        role: 'user',
        parts: [{ type: 'text', text: 'Hello from parts' }],
      } as any;
      const expected = convertToModelMessages([ui]);
      const result = messageUtils.normalize([ui]);
      expect(result).toEqual(expected);
    });

    test('uses empty string when text is undefined', () => {
      const messages = [{ role: 'user', text: undefined }] as any;
      const result = messageUtils.normalize(messages);
      expect(result[0].content).toBe('');
    });
  });
});
