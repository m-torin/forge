// @ts-nocheck - Test file uses partial mocks that don't match full interface
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AIManager } from '../../../shared/utils/manager';

import type { AIProvider } from '../../../shared/types';

describe('AIManager', () => {
  let manager: AIManager;

  beforeEach(() => {
    manager = new AIManager();
  });

  describe('constructor', () => {
    it('should create instance without config', () => {
      const instance = new AIManager();
      expect(instance).toBeInstanceOf(AIManager);
    });

    it('should create instance with config', () => {
      const config = {
        defaultProvider: 'test-provider',
        routing: {
          complete: 'test-provider',
          moderate: 'another-provider',
        },
      };
      const instance = new AIManager(config);
      expect(instance).toBeInstanceOf(AIManager);
    });
  });

  describe('configure', () => {
    it('should set default provider', () => {
      const config = {
        defaultProvider: 'my-provider',
      };
      manager.configure(config);

      // Test indirectly by checking routing behavior
      const mockProvider: AIProvider = {
        name: 'my-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn().mockResolvedValue({ text: 'response' }),
      };

      manager.registerProvider(mockProvider);
      const provider = manager.getProviderForCapability('complete');
      expect(provider?.name).toBe('my-provider');
    });

    it('should set capability routing', () => {
      const mockProvider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      const mockProvider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      manager.registerProvider(mockProvider1);
      manager.registerProvider(mockProvider2);

      const config = {
        routing: {
          complete: 'provider-2',
          moderate: 'provider-1',
        },
      };
      manager.configure(config);

      expect(manager.getProviderForCapability('complete')?.name).toBe('provider-2');
      expect(manager.getProviderForCapability('moderate')?.name).toBe('provider-1');
    });
  });

  describe('registerProvider', () => {
    it('should register provider successfully', () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      const result = manager.registerProvider(mockProvider);
      expect(result).toBe(true);
      expect(manager.getProvider('test-provider')).toBe(mockProvider);
    });

    it('should handle registration errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a provider that will fail validation
      const invalidProvider: AIProvider = {
        name: 'invalid',
        type: 'custom',
        capabilities: new Set(['complete']),
        // Missing complete method - this will fail validation
      };

      const result = manager.registerProvider(invalidProvider);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getProvider', () => {
    it('should return registered provider', () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      manager.registerProvider(mockProvider);
      const result = manager.getProvider('test-provider');
      expect(result).toBe(mockProvider);
    });

    it('should return undefined for unregistered provider', () => {
      const result = manager.getProvider('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getProviderForCapability', () => {
    it('should return routed provider for capability', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);
      manager.configure({
        routing: { complete: 'provider-2' },
      });

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('provider-2');
    });

    it('should return first capable provider when no routing', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['moderate']),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('provider-2');
    });

    it('should return default provider if capable', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['moderate']),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'default-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);
      manager.configure({ defaultProvider: 'default-provider' });

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('default-provider');
    });

    it('should return undefined when no capable provider', () => {
      const provider: AIProvider = {
        name: 'provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        moderate: vi.fn(),
      };

      manager.registerProvider(provider);
      const result = manager.getProviderForCapability('complete');
      expect(result).toBeUndefined();
    });
  });

  describe('complete', () => {
    it('should complete using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn().mockResolvedValue({
          id: 'completion-123',
          choices: [{ text: 'Generated text' }],
        }),
      };

      manager.registerProvider(mockProvider);

      const options = {
        model: 'test-model',
        prompt: 'Test prompt',
      };

      const result = await manager.complete(options);

      expect(mockProvider.complete).toHaveBeenCalledWith(options);
      expect(result.id).toBe('completion-123');
    });

    it('should throw error when no provider available', async () => {
      const options = { model: 'test', prompt: 'Test' };
      await expect(manager.complete(options)).rejects.toThrow(
        'No provider available for completion',
      );
    });
  });

  describe('stream', () => {
    it('should stream using appropriate provider', async () => {
      const mockChunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ' world' } }] },
      ];

      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['stream']),
        stream: vi.fn().mockImplementation(async function* () {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        }),
      };

      manager.registerProvider(mockProvider);

      const options = {
        model: 'test-model',
        prompt: 'Test prompt',
      };

      const chunks = [];
      for await (const chunk of manager.stream(options)) {
        chunks.push(chunk);
      }

      expect(mockProvider.stream).toHaveBeenCalledWith(options);
      expect(chunks).toEqual(mockChunks);
    });

    it('should throw error when no provider available', async () => {
      const options = { model: 'test', prompt: 'Test' };
      const generator = manager.stream(options);
      await expect(generator.next()).rejects.toThrow('No provider available for streaming');
    });
  });

  describe('moderate', () => {
    it('should moderate using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        moderate: vi.fn().mockResolvedValue({
          categories: { hate: false },
          flagged: false,
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.moderate('Test content');

      expect(mockProvider.moderate).toHaveBeenCalledWith('Test content');
      expect(result.flagged).toBe(false);
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.moderate('Test')).rejects.toThrow(
        'No provider available for moderation',
      );
    });

    it('should throw error when provider lacks moderate method', async () => {
      const mockProvider: AIProvider = {
        name: 'incomplete-provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        // Missing moderate method
      };

      manager.registerProvider(mockProvider);

      await expect(manager.moderate('Test')).rejects.toThrow(
        'No provider available for moderation',
      );
    });
  });

  describe('classify', () => {
    it('should classify using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['classify']),
        classify: vi.fn().mockResolvedValue({
          confidence: 0.95,
          classification: 'positive',
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.classify('Test text', ['positive', 'negative']);

      expect(mockProvider.classify).toHaveBeenCalledWith('Test text', ['positive', 'negative']);
      expect(result.classification).toBe('positive');
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.classify('Test')).rejects.toThrow(
        'No provider available for classification',
      );
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        analyzeSentiment: vi.fn().mockResolvedValue({
          confidence: 0.98,
          score: 0.85,
          sentiment: 'positive',
        }),
        capabilities: new Set(['sentiment']),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.analyzeSentiment('I love this!');

      expect(mockProvider.analyzeSentiment).toHaveBeenCalledWith('I love this!');
      expect(result.sentiment).toBe('positive');
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.analyzeSentiment('Test')).rejects.toThrow(
        'No provider available for sentiment analysis',
      );
    });
  });

  describe('extractEntities', () => {
    it('should extract entities using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['extraction']),
        extractEntities: vi.fn().mockResolvedValue({
          entities: [{ confidence: 0.99, type: 'person', text: 'John Doe' }],
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.extractEntities('John Doe works at Acme');

      expect(mockProvider.extractEntities).toHaveBeenCalledWith('John Doe works at Acme');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].text).toBe('John Doe');
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.extractEntities('Test')).rejects.toThrow(
        'No provider available for entity extraction',
      );
    });
  });

  describe('getAvailableCapabilities', () => {
    it('should return all unique capabilities from registered providers', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['moderate', 'classify']),
        classify: vi.fn(),
        moderate: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);

      const capabilities = manager.getAvailableCapabilities();

      expect(capabilities).toContain('complete');
      expect(capabilities).toContain('moderate');
      expect(capabilities).toContain('classify');
      expect(capabilities).toHaveLength(3);
    });

    it('should return empty array when no providers registered', () => {
      const capabilities = manager.getAvailableCapabilities();
      expect(capabilities).toEqual([]);
    });
  });

  describe('getProviderStatus', () => {
    it('should return status for all providers', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['classify']),
        classify: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);

      const status = manager.getProviderStatus();

      expect(status).toHaveLength(2);
      expect(status[0]).toEqual({
        name: 'provider-1',
        type: 'custom',
        available: true,
        capabilities: ['complete', 'moderate'],
      });
      expect(status[1]).toEqual({
        name: 'provider-2',
        type: 'custom',
        available: true,
        capabilities: ['classify'],
      });
    });

    it('should return empty array when no providers registered', () => {
      const status = manager.getProviderStatus();
      expect(status).toEqual([]);
    });
  });
});
