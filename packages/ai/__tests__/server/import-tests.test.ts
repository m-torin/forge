import { describe, expect, vi } from 'vitest';

// Mock dependencies that might cause issues
vi.mock('ai', () => ({
  tool: vi.fn().mockReturnValue({ description: 'test', inputSchema: {}, execute: vi.fn() }),
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock('#/server/errors/application-errors', () => ({
  ApplicationAIError: vi.fn(),
}));

// Mock redis to prevent missing dependency issues
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
  RedisClientType: vi.fn(),
  RedisDefaultModules: vi.fn(),
  RedisFunctions: vi.fn(),
  RedisModules: vi.fn(),
  RedisScripts: vi.fn(),
}));

// Mock resumable-stream which depends on redis
vi.mock('resumable-stream', () => ({
  ResumableStream: vi.fn(),
  createResumableStream: vi.fn(),
}));

// Use QA centralized mock for Upstash Vector
vi.mock('@upstash/vector', async () => {
  const vectorMocks = await import('@repo/qa/vitest/mocks/providers/upstash/vector');
  return vectorMocks.default;
});

describe('server Module Imports', () => {
  test('should import tools modules', async () => {
    const modules = [
      () => import('#/server/tools/execution-framework'),
      () => import('#/server/tools/factory-simple'),
      () => import('#/server/tools/specifications'),
      () => import('#/server/tools/tool-registry'),
      () => import('#/server/tools/types'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import provider modules', async () => {
    const modules = [
      () => import('#/server/providers/ai-sdk-utils'),
      () => import('#/server/providers/custom-providers'),
      () => import('#/server/providers/standard-chat-provider'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import streaming modules', async () => {
    const modules = [
      () => import('#/server/streaming/streaming-transformations'),
      () => import('#/server/streaming/artifact-generation'),
      () => import('#/server/streaming/resumable'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import vector modules', async () => {
    const modules = [
      () => import('#/server/vector/ai-sdk-integration'),
      () => import('#/server/vector/types'),
      () => import('#/server/utils/vector/config'),
      () => import('#/server/utils/vector/utils'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import RAG modules', async () => {
    const modules = [() => import('#/server/rag/ai-sdk-rag'), () => import('#/server/rag/types')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import error modules', async () => {
    const modules = [
      () => import('#/server/core/errors/ai-errors'),
      () => import('#/server/core/errors/application-errors'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import utils modules', async () => {
    const modules = [
      () => import('#/server/utils/model-configuration'),
      () => import('#/server/utils/model-persistence'),
      () => import('#/server/utils/prompt-engineering'),
      () => import('#/server/utils/title-generation'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import models modules', async () => {
    const modules = [() => import('#/server/core/models/selection')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import testing modules', async () => {
    const modules = [
      () => import('#/server/utils/testing/message-comparison'),
      () => import('#/server/utils/testing/mock-providers'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import analytics modules', async () => {
    const modules = [() => import('#/server/utils/analytics/vector-analytics')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });
});
