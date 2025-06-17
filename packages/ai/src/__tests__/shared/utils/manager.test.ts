// Test file uses proper types with minimal viable implementations
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AIManager } from '../../../shared/utils/manager';

import { AIProvider } from '../../../shared/types';

describe('AIManager', (_: any) => {
  let manager: AIManager;

  beforeEach(() => {
    manager = new AIManager();
  });

  describe('constructor', (_: any) => {
    it('should create instance without config', (_: any) => {
      const instance = new AIManager();
      expect(instance).toBeInstanceOf(AIManager);
    });

    it('should create instance with config', (_: any) => {
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

  describe('configure', (_: any) => {
    it('should set default provider', (_: any) => {
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
        stream: vi.fn(),
      };

      manager.registerProvider(mockProvider);
      const provider = manager.getProviderForCapability('complete');
      expect(provider?.name).toBe('my-provider');
    });

    it('should set capability routing', (_: any) => {
      const mockProvider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
        stream: vi.fn(),
      };

      const mockProvider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
        stream: vi.fn(),
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

  describe('registerProvider', (_: any) => {
    it('should register provider successfully', (_: any) => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      const result = manager.registerProvider(mockProvider);
      expect(result).toBe(true);
      expect(manager.getProvider('test-provider')).toBe(mockProvider);
    });

    it('should handle registration errors gracefully', (_: any) => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a provider that will fail validation
      const invalidProvider = {
        name: 'invalid',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      } as AIProvider;
      delete (invalidProvider as any).complete;

      const result = manager.registerProvider(invalidProvider);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getProvider', (_: any) => {
    it('should return registered provider', (_: any) => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      manager.registerProvider(mockProvider);
      const result = manager.getProvider('test-provider');
      expect(result).toBe(mockProvider);
    });

    it('should return undefined for unregistered provider', (_: any) => {
      const result = manager.getProvider('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getProviderForCapability', (_: any) => {
    it('should return routed provider for capability', (_: any) => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);
      manager.configure({
        routing: { complete: 'provider-2' },
      });

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('provider-2');
    });

    it('should return first capable provider when no routing', (_: any) => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('provider-2');
    });

    it('should return default provider if capable', (_: any) => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'default-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
        stream: vi.fn(),
      };

      manager.registerProvider(provider1);
      manager.registerProvider(provider2);
      manager.configure({ defaultProvider: 'default-provider' });

      const result = manager.getProviderForCapability('complete');
      expect(result?.name).toBe('default-provider');
    });

    it('should return undefined when no capable provider', (_: any) => {
      const provider: AIProvider = {
        name: 'provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
        moderate: vi.fn(),
      };

      manager.registerProvider(provider);
      const result = manager.getProviderForCapability('complete');
      expect(result).toBeUndefined();
    });
  });

  describe('complete', (_: any) => {
    it('should complete using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn().mockResolvedValue({
          id: 'completion-123',
          choices: [{ text: 'Generated text' }],
        }),
        stream: vi.fn(),
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

  describe('stream', (_: any) => {
    it('should stream using appropriate provider', async () => {
      const mockChunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ' world' } }] },
      ];

      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['stream']),
        complete: vi.fn(),
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

      const chunks: any[] = [];
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

  describe('moderate', (_: any) => {
    it('should moderate using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
        moderate: vi.fn().mockResolvedValue({
          confidence: 0.95,
          explanation: 'Content is safe',
          safe: true,
          violations: [],
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.moderate('Test content');

      expect(mockProvider.moderate).toHaveBeenCalledWith('Test content');
      expect(result.safe).toBe(true);
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.moderate('Test')).rejects.toThrow(
        'No provider available for moderation',
      );
    });

    it('should throw error when provider lacks moderate method', async () => {
      const mockProvider = {
        name: 'incomplete-provider',
        type: 'custom',
        capabilities: new Set(['moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
        moderate: vi.fn(),
      } as AIProvider;
      delete (mockProvider as any).moderate;

      manager.registerProvider(mockProvider);

      await expect(manager.moderate('Test')).rejects.toThrow(
        'No provider available for moderation',
      );
    });
  });

  describe('classify', (_: any) => {
    it('should classify using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['classify']),
        complete: vi.fn(),
        stream: vi.fn(),
        classify: vi.fn().mockResolvedValue({
          confidence: 0.95,
          category: 'positive',
          reasoning: 'Positive sentiment detected',
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.classify('Test text', ['positive', 'negative']);

      expect(mockProvider.classify).toHaveBeenCalledWith('Test text', ['positive', 'negative']);
      expect(result.category).toBe('positive');
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.classify('Test')).rejects.toThrow(
        'No provider available for classification',
      );
    });
  });

  describe('analyzeSentiment', (_: any) => {
    it('should analyze sentiment using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['sentiment']),
        complete: vi.fn(),
        stream: vi.fn(),
        analyzeSentiment: vi.fn().mockResolvedValue({
          confidence: 0.98,
          score: 0.85,
          sentiment: 'positive',
        }),
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

  describe('extractEntities', (_: any) => {
    it('should extract entities using appropriate provider', async () => {
      const mockProvider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['extraction']),
        complete: vi.fn(),
        stream: vi.fn(),
        extractEntities: vi.fn().mockResolvedValue({
          entities: [{ confidence: 0.99, type: 'person', value: 'John Doe' }],
        }),
      };

      manager.registerProvider(mockProvider);

      const result = await manager.extractEntities('John Doe works at Acme');

      expect(mockProvider.extractEntities).toHaveBeenCalledWith('John Doe works at Acme');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].value).toBe('John Doe');
    });

    it('should throw error when no provider available', async () => {
      await expect(manager.extractEntities('Test')).rejects.toThrow(
        'No provider available for entity extraction',
      );
    });
  });

  describe('getAvailableCapabilities', (_: any) => {
    it('should return all unique capabilities from registered providers', (_: any) => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
        stream: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['classify', 'moderate']),
        complete: vi.fn(),
        stream: vi.fn(),
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

    it('should return empty array when no providers registered', (_: any) => {
      const capabilities = manager.getAvailableCapabilities();
      expect(capabilities).toEqual([]);
    });
  });

  describe('getProviderStatus', (_: any) => {
    it('should return status for all providers', (_: any) => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
        stream: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'custom',
        capabilities: new Set(['classify']),
        complete: vi.fn(),
        stream: vi.fn(),
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

    it('should return empty array when no providers registered', (_: any) => {
      const status = manager.getProviderStatus();
      expect(status).toEqual([]);
    });
  });
});
