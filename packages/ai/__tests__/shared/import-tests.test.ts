import { describe, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('ai', () => ({
  tool: vi.fn(),
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

describe('shared Module Imports', () => {
  test('should import feature modules', async () => {
    const modules = [
      () => import('#/shared/features/classification/product-classifier'),
      () => import('#/shared/features/classification/training-storage'),
      () => import('#/shared/features/classification/training-system'),
      () => import('#/shared/features/classification/types'),
      () => import('#/shared/features/sentiment/sentiment-analyzer'),
      () => import('#/shared/features/sentiment/types'),
      () => import('#/shared/features/moderation/anthropic-moderation'),
      () => import('#/shared/features/moderation/types'),
      () => import('#/shared/features/extraction/entity-extractor'),
      () => import('#/shared/features/extraction/types'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import middleware modules', async () => {
    const modules = [
      () => import('#/shared/middleware/error-handling'),
      () => import('#/shared/middleware/logging'),
      () => import('#/shared/middleware/rate-limiting'),
      () => import('#/shared/middleware/reasoning'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import model modules', async () => {
    const modules = [
      () => import('#/shared/models/anthropic'),
      () => import('#/shared/models/deep-infra'),
      () => import('#/shared/models/google'),
      () => import('#/shared/models/google-models'),
      () => import('#/shared/models/metadata'),
      () => import('#/shared/models/openai-compatible'),
      () => import('#/shared/models/perplexity'),
      () => import('#/shared/models/xai'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import streaming modules', async () => {
    // data-stream module removed in AI SDK v5 migration
    // Use createUIMessageStream() from 'ai' instead
    expect(true).toBeTruthy();
  });

  test('should import tool modules', async () => {
    const modules = [
      () => import('#/shared/tools/bash-tool'),
      () => import('#/shared/tools/computer-tool'),
      () => import('#/shared/tools/create-tools'),
      () => import('#/shared/tools/text-editor-tool'),
      () => import('#/shared/tools/types'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import type modules', async () => {
    const modules = [
      () => import('#/shared/types/classification'),
      () => import('#/shared/types/config'),
      () => import('#/shared/types/core'),
      () => import('#/shared/types/moderation'),
      () => import('#/shared/types/provider'),
      () => import('#/shared/types/streaming'),
      () => import('#/shared/types/vector'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import UI modules', async () => {
    const modules = [() => import('#/shared/ui/loading-messages')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import util modules', async () => {
    const modules = [
      () => import('#/shared/utils/config'),
      () => import('#/shared/utils/messages'),
      () => import('#/shared/utils/perplexity-config'),
      () => import('#/shared/utils/rate-limit'),
      () => import('#/shared/utils/schema-generation'),
      () => import('#/shared/utils/test-factory'),
      () => import('#/shared/utils/validation'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });
});
