/**
 * Integration tests for package exports
 * Ensures all critical exports are available and functional
 */

import { describe, expect } from 'vitest';

describe('package Exports', () => {
  test('should export core utilities', async () => {
    const {
      registry,
      models,
      TEMPS,
      TOKENS,
      TOP_P,
      webSearchTool,
      databaseQueryTool,
      sendEmailTool,
    } = await import('../src/index');

    expect(registry).toBeDefined();
    expect(models).toBeDefined();
    expect(TEMPS).toBeDefined();
    expect(TOKENS).toBeDefined();
    expect(TOP_P).toBeDefined();
    expect(webSearchTool).toBeDefined();
    expect(databaseQueryTool).toBeDefined();
    expect(sendEmailTool).toBeDefined();
  });

  test('should export provider functions', async () => {
    const { anthropic, openai, google, grok, perplexity } = await import('../src/index');

    expect(anthropic).toBeDefined();
    expect(openai).toBeDefined();
    expect(google).toBeDefined();
    expect(grok).toBeDefined();
    expect(perplexity).toBeDefined();
  });

  test('should export generation functions', async () => {
    const { generateObject, generateArray, generateText, streamText, Chat } = await import(
      '../src/index'
    );

    expect(generateObject).toBeDefined();
    expect(generateArray).toBeDefined();
    expect(generateText).toBeDefined();
    expect(streamText).toBeDefined();
    expect(Chat).toBeDefined();
  });

  test('should export UI components', async () => {
    const { useChat, MessageList, ChatContainer, StatusIndicator } = await import('../src/index');

    expect(useChat).toBeDefined();
    expect(MessageList).toBeDefined();
    expect(ChatContainer).toBeDefined();
    expect(StatusIndicator).toBeDefined();
  });

  test('should export essential constants', async () => {
    const {
      ANTHROPIC_MODEL_IDS,
      OPENAI_MODEL_IDS,
      GOOGLE_MODEL_IDS,
      GROK_MODEL_IDS,
      PERPLEXITY_MODEL_IDS,
    } = await import('../src/index');

    expect(ANTHROPIC_MODEL_IDS).toBeDefined();
    expect(OPENAI_MODEL_IDS).toBeDefined();
    expect(GOOGLE_MODEL_IDS).toBeDefined();
    expect(GROK_MODEL_IDS).toBeDefined();
    expect(PERPLEXITY_MODEL_IDS).toBeDefined();
  });

  test('should export tool patterns', async () => {
    const {
      createToolTemplate,
      commonTemplates,
      getAvailablePatterns,
      executeMultiStep,
      streamMultiStep,
    } = await import('../src/index');

    expect(createToolTemplate).toBeDefined();
    expect(commonTemplates).toBeDefined();
    expect(getAvailablePatterns).toBeDefined();
    expect(executeMultiStep).toBeDefined();
    expect(streamMultiStep).toBeDefined();
  });

  test('should have consistent temperature presets', async () => {
    const { TEMPS } = await import('../src/index');

    expect(TEMPS.PRECISE).toBe(0);
    expect(TEMPS.BALANCED).toBe(0.7);
    expect(TEMPS.CREATIVE).toBe(0.9);
    expect(typeof TEMPS.VERY_LOW).toBe('number');
    expect(typeof TEMPS.FACTUAL).toBe('number');
  });

  test('should have consistent token limits', async () => {
    const { TOKENS } = await import('../src/index');

    expect(TOKENS.TINY).toBe(256);
    expect(TOKENS.SHORT).toBe(1024);
    expect(TOKENS.MEDIUM).toBe(2048);
    expect(typeof TOKENS.LONG).toBe('number');
    expect(typeof TOKENS.EXTENDED).toBe('number');
    expect(typeof TOKENS.MAX).toBe('number');
  });

  test('should maintain ES2023 compatibility', async () => {
    const { generateOperationId, formatUsage } = await import('../src/core/utils');

    // Test arrow function exports
    expect(typeof generateOperationId).toBe('function');
    expect(typeof formatUsage).toBe('function');

    // Test functionality
    const operationId = generateOperationId();
    expect(operationId).toMatch(/^ai_op_\d+_[a-z0-9]+$/);

    const usage = formatUsage({ inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    expect(usage.formatted).toContain('100 in + 50 out = 150 total');
    expect(typeof usage.cost).toBe('number');
  });
});
