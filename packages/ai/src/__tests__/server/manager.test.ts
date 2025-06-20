import { beforeEach, describe, expect, vi } from 'vitest';

import { ServerAIManager } from '../../server/manager';

import { AIProvider } from '../../shared/types';
import {
  validateConfig,
  convertToManagerConfig,
  createConfigFromEnv,
} from '../../shared/utils/config';
import { createDirectAnthropicProvider } from '../../server/providers/direct-anthropic';
import { createDirectOpenAIProvider } from '../../server/providers/direct-openai';
import {
  createAnthropicAISdkProvider,
  createGoogleAISdkProvider,
  createOpenAIAISdkProvider,
} from '../../server/providers/ai-sdk-provider';

// Mock the config utilities
vi.mock('../../shared/utils/config', () => ({
  validateConfig: vi.fn().mockReturnValue([]),
  convertToManagerConfig: vi.fn().mockReturnValue({
    defaultProvider: 'openai',
    routing: {
      complete: 'openai',
      moderate: 'openai',
    },
  }),
  createConfigFromEnv: vi.fn().mockReturnValue({
    defaultProvider: 'openai',
    enableLogging: false,
    enableRateLimit: false,
    providers: {
      anthropic: { apiKey: 'test-anthropic-key' },
      google: { apiKey: 'test-google-key' },
      openai: { apiKey: 'test-openai-key' },
    },
  }),
}));

// Mock the provider creators
vi.mock('../../server/providers/direct-anthropic', () => ({
  createDirectAnthropicProvider: vi.fn().mockReturnValue({
    name: 'direct-anthropic',
    type: 'direct',
    capabilities: new Set(['complete', 'stream']),
    complete: vi.fn().mockResolvedValue({ text: 'response' }),
    stream: vi.fn(),
  }),
}));

vi.mock('../../server/providers/direct-openai', () => ({
  createDirectOpenAIProvider: vi.fn().mockReturnValue({
    name: 'direct-openai',
    type: 'direct',
    capabilities: new Set(['complete', 'moderate']),
    complete: vi.fn().mockResolvedValue({ text: 'response' }),
    moderate: vi.fn().mockResolvedValue({ flagged: false }),
    stream: vi.fn(),
  }),
}));

vi.mock('../../server/providers/ai-sdk-provider', () => ({
  createAnthropicAISdkProvider: vi.fn().mockReturnValue({
    name: 'anthropic-sdk',
    type: 'ai-sdk',
    capabilities: new Set(['complete', 'stream']),
    complete: vi.fn().mockResolvedValue({ text: 'response' }),
    stream: vi.fn(),
  }),
  createGoogleAISdkProvider: vi.fn().mockReturnValue({
    name: 'google-sdk',
    type: 'ai-sdk',
    capabilities: new Set(['complete']),
    complete: vi.fn().mockResolvedValue({ text: 'response' }),
    stream: vi.fn(),
  }),
  createOpenAIAISdkProvider: vi.fn().mockReturnValue({
    name: 'openai-sdk',
    type: 'ai-sdk',
    capabilities: new Set(['complete', 'moderate', 'stream']),
    complete: vi.fn().mockResolvedValue({ text: 'response' }),
    moderate: vi.fn().mockResolvedValue({ flagged: false }),
    stream: vi.fn(),
  }),
}));

// Mock provider factory
const createMockProvider = (overrides: Partial<AIProvider> = {}): AIProvider => ({
  name: 'test-provider',
  type: 'custom',
  capabilities: new Set(),
  complete: vi.fn(),
  stream: vi.fn(),
  ...overrides,
});

describe('serverAIManager', () => {
  let manager: ServerAIManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup mocks after clearing
    vi.mocked(validateConfig).mockReturnValue([]);
    vi.mocked(convertToManagerConfig).mockReturnValue({
      defaultProvider: 'openai',
      routing: {
        complete: 'openai',
        moderate: 'openai',
      },
    });
    vi.mocked(createConfigFromEnv).mockReturnValue({
      defaultProvider: 'openai',
      enableLogging: false,
      enableRateLimit: false,
      providers: {
        anthropic: { apiKey: 'test-anthropic-key' },
        google: { apiKey: 'test-google-key' },
        openai: { apiKey: 'test-openai-key' },
      },
    });

    // Re-setup provider creator mocks
    vi.mocked(createDirectAnthropicProvider).mockReturnValue({
      name: 'direct-anthropic',
      type: 'direct',
      capabilities: new Set(['complete', 'stream']),
      complete: vi.fn().mockResolvedValue({ text: 'response' }),
      stream: vi.fn(),
    });

    vi.mocked(createDirectOpenAIProvider).mockReturnValue({
      name: 'direct-openai',
      type: 'direct',
      capabilities: new Set(['complete', 'moderate']),
      complete: vi.fn().mockResolvedValue({ text: 'response' }),
      moderate: vi.fn().mockResolvedValue({ flagged: false }),
      stream: vi.fn(),
    });

    vi.mocked(createAnthropicAISdkProvider).mockReturnValue({
      name: 'anthropic-sdk',
      type: 'ai-sdk',
      capabilities: new Set(['complete', 'stream']),
      complete: vi.fn().mockResolvedValue({ text: 'response' }),
      stream: vi.fn(),
    });

    vi.mocked(createGoogleAISdkProvider).mockReturnValue({
      name: 'google-sdk',
      type: 'ai-sdk',
      capabilities: new Set(['complete']),
      complete: vi.fn().mockResolvedValue({ text: 'response' }),
      stream: vi.fn(),
    });

    vi.mocked(createOpenAIAISdkProvider).mockReturnValue({
      name: 'openai-sdk',
      type: 'ai-sdk',
      capabilities: new Set(['complete', 'moderate', 'stream']),
      complete: vi.fn().mockResolvedValue({ text: 'response' }),
      moderate: vi.fn().mockResolvedValue({ flagged: false }),
      stream: vi.fn(),
    });

    manager = new ServerAIManager();
  });

  describe('constructor', () => {
    test('should create instance without config', () => {
      const instance = new ServerAIManager();
      expect(instance).toBeInstanceOf(ServerAIManager);
    });

    test('should create instance with config', () => {
      const config = {
        defaultProvider: 'test-provider',
        routing: {
          complete: 'test-provider',
        },
      };
      const instance = new ServerAIManager(config);
      expect(instance).toBeInstanceOf(ServerAIManager);
    });
  });

  describe('fromEnv', () => {
    test('should create manager from environment configuration', async () => {
      const manager = await ServerAIManager.fromEnv();
      expect(manager).toBeInstanceOf(ServerAIManager);
    });

    test('should register multiple providers successfully', async () => {
      const manager = await ServerAIManager.fromEnv();
      const capabilities = manager.getAvailableCapabilities();
      expect(capabilities.length).toBeGreaterThan(0);
    });

    test('should handle provider registration failures gracefully', async () => {
      const { createOpenAIAISdkProvider } = await import('../../server/providers/ai-sdk-provider');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(createOpenAIAISdkProvider).mockImplementationOnce(() => {
        throw new Error('Provider initialization failed');
      });

      // Should not throw even if one provider fails
      const manager = await ServerAIManager.fromEnv();
      expect(manager).toBeInstanceOf(ServerAIManager);
      consoleSpy.mockRestore();
    });

    test('should throw error when no providers are registered', async () => {
      const { createDirectAnthropicProvider } = await import(
        '../../server/providers/direct-anthropic'
      );
      const { createDirectOpenAIProvider } = await import('../../server/providers/direct-openai');
      const { createAnthropicAISdkProvider, createGoogleAISdkProvider, createOpenAIAISdkProvider } =
        await import('../../server/providers/ai-sdk-provider');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(createDirectAnthropicProvider).mockReturnValueOnce(null);
      vi.mocked(createDirectOpenAIProvider).mockReturnValueOnce(null);
      vi.mocked(createOpenAIAISdkProvider).mockImplementationOnce(() => {
        throw new Error('No API key');
      });
      vi.mocked(createAnthropicAISdkProvider).mockImplementationOnce(() => {
        throw new Error('No API key');
      });
      vi.mocked(createGoogleAISdkProvider).mockImplementationOnce(() => {
        throw new Error('No API key');
      });

      await expect(ServerAIManager.fromEnv()).rejects.toThrow(
        'No AI providers were successfully registered',
      );
      consoleSpy.mockRestore();
    });

    test('should throw error when config validation fails', async () => {
      const { validateConfig } = await import('../../shared/utils/config');
      vi.mocked(validateConfig).mockReturnValueOnce(['Invalid API key format']);

      await expect(ServerAIManager.fromEnv()).rejects.toThrow('Configuration validation failed');
    });
  });

  describe('classifyProduct', () => {
    test('should classify product successfully', async () => {
      const mockProvider = createMockProvider({
        name: 'test-classifier',
        capabilities: new Set(['classify']),
        classify: vi.fn().mockResolvedValue({
          confidence: 0.95,
          classification: 'electronics',
        }),
      });

      manager.registerProvider(mockProvider);

      const product = { name: 'iPhone', category: 'phone' };
      const result = await manager.classifyProduct(product);

      expect(mockProvider.classify).toHaveBeenCalledWith(JSON.stringify(product));
      expect(result.classification).toBe('electronics');
    });

    test('should throw error when no classification provider available', async () => {
      await expect(manager.classifyProduct({ name: 'test' })).rejects.toThrow(
        'No classification provider available',
      );
    });

    test('should throw error when provider lacks classify method', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockProvider = createMockProvider({
        name: 'incomplete-provider',
        capabilities: new Set(['classify']),
        // Missing classify method
      });

      // Registration should fail due to validation
      const result = manager.registerProvider(mockProvider);
      expect(result).toBeFalsy();

      // Provider should not be registered
      await expect(manager.classifyProduct({ name: 'test' })).rejects.toThrow(
        'No classification provider available',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('moderateContent', () => {
    test('should moderate content successfully', async () => {
      const mockProvider = createMockProvider({
        name: 'test-moderator',
        capabilities: new Set(['moderate']),
        moderate: vi.fn().mockResolvedValue({
          confidence: 0.99,
          explanation: 'Content is safe',
          safe: true,
          violations: [],
        }),
      });

      manager.registerProvider(mockProvider);

      const content = 'This is a test message';
      const result = await manager.moderateContent(content);

      expect(mockProvider.moderate).toHaveBeenCalledWith(content);
      expect(result.safe).toBeTruthy();
    });

    test('should throw error when no moderation provider available', async () => {
      await expect(manager.moderateContent('test content')).rejects.toThrow(
        'No moderation provider available',
      );
    });

    test('should throw error when provider lacks moderate method', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockProvider = createMockProvider({
        name: 'incomplete-provider',
        capabilities: new Set(['moderate']),
        // Missing moderate method
      });

      // Registration should fail due to validation
      const result = manager.registerProvider(mockProvider);
      expect(result).toBeFalsy();

      // Provider should not be registered
      await expect(manager.moderateContent('test content')).rejects.toThrow(
        'No moderation provider available',
      );
      consoleSpy.mockRestore();
    });

    test('should handle flagged content correctly', async () => {
      const mockProvider = createMockProvider({
        name: 'test-moderator',
        capabilities: new Set(['moderate']),
        moderate: vi.fn().mockResolvedValue({
          confidence: 0.95,
          explanation: 'Content contains violations',
          safe: false,
          violations: ['hate', 'violence'],
        }),
      });

      manager.registerProvider(mockProvider);

      const result = await manager.moderateContent('harmful content');

      expect(result.safe).toBeFalsy();
      expect(result.violations).toContain('hate');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('provider management', () => {
    test('should inherit all capabilities from base AIManager', () => {
      const mockProvider = createMockProvider({
        name: 'full-provider',
        analyzeSentiment: vi.fn(),
        capabilities: new Set([
          'classify',
          'complete',
          'extraction',
          'moderate',
          'sentiment',
          'stream',
        ]),
        classify: vi.fn(),
        extractEntities: vi.fn(),
        moderate: vi.fn(),
      });

      manager.registerProvider(mockProvider);
      const capabilities = manager.getAvailableCapabilities();

      expect(capabilities).toContain('complete');
      expect(capabilities).toContain('stream');
      expect(capabilities).toContain('moderate');
      expect(capabilities).toContain('classify');
      expect(capabilities).toContain('sentiment');
      expect(capabilities).toContain('extraction');
    });

    test('should get provider status correctly', () => {
      const mockProvider = createMockProvider({
        name: 'status-test',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      });

      manager.registerProvider(mockProvider);
      const status = manager.getProviderStatus();

      expect(status).toContainEqual({
        name: 'status-test',
        type: 'custom',
        available: true,
        capabilities: ['complete', 'moderate'],
      });
    });
  });
});
