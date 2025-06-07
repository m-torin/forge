// @ts-nocheck - Test file uses partial mocks that don't match full interface
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProviderRegistry } from '../../../shared/providers/registry';

import type { AIProvider } from '../../../shared/types';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  describe('register', () => {
    it('should register a valid provider', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      expect(() => registry.register(provider)).not.toThrow();
      expect(registry.get('test-provider')).toBe(provider);
    });

    it('should throw error for provider without name', () => {
      const provider = {
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      } as any;

      expect(() => registry.register(provider)).toThrow('Provider must have a valid name');
    });

    it('should throw error for provider with invalid name type', () => {
      const provider = {
        name: 123,
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      } as any;

      expect(() => registry.register(provider)).toThrow('Provider must have a valid name');
    });

    it('should throw error for provider without type', () => {
      const provider = {
        name: 'test-provider',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      } as any;

      expect(() => registry.register(provider)).toThrow('has invalid type');
    });

    it('should throw error for provider with invalid type', () => {
      const provider = {
        name: 'test-provider',
        type: 'invalid-type',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      } as any;

      expect(() => registry.register(provider)).toThrow(
        'Provider "test-provider" has invalid type: invalid-type',
      );
    });

    it('should throw error for provider without capabilities', () => {
      const provider = {
        name: 'test-provider',
        type: 'custom',
        complete: vi.fn(),
      } as any;

      expect(() => registry.register(provider)).toThrow(
        'Provider "test-provider" must declare at least one capability',
      );
    });

    it('should throw error for provider with empty capabilities', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(),
        complete: vi.fn(),
      };

      expect(() => registry.register(provider)).toThrow(
        'Provider "test-provider" must declare at least one capability',
      );
    });

    it('should throw error for provider missing required methods', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        // Missing complete and moderate methods
      };

      expect(() => registry.register(provider)).toThrow(
        'Provider "test-provider" claims capabilities but missing methods: complete, moderate',
      );
    });

    describe('method validation by capability', () => {
      it('should validate complete method for complete capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['complete']),
          // Missing complete method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: complete');
      });

      it('should validate stream method for stream capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['stream']),
          // Missing stream method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: stream');
      });

      it('should validate embed method for embed capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['embed']),
          // Missing embed method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: embed');
      });

      it('should validate generateObject method for generateObject capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['generateObject']),
          // Missing generateObject method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: generateObject');
      });

      it('should validate moderate method for moderate capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['moderate']),
          // Missing moderate method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: moderate');
      });

      it('should validate classify method for classify capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['classify']),
          // Missing classify method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: classify');
      });

      it('should validate analyzeSentiment method for sentiment capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['sentiment']),
          // Missing analyzeSentiment method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: analyzeSentiment');
      });

      it('should validate extractEntities method for extraction capability', () => {
        const provider: AIProvider = {
          name: 'test-provider',
          type: 'custom',
          capabilities: new Set(['extraction']),
          // Missing extractEntities method
        };

        expect(() => registry.register(provider)).toThrow('missing methods: extractEntities');
      });
    });

    it('should update capability map when registering provider', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      registry.register(provider);

      const completeProviders = registry.getByCapability('complete');
      const moderateProviders = registry.getByCapability('moderate');

      expect(completeProviders).toContain(provider);
      expect(moderateProviders).toContain(provider);
    });
  });

  describe('get', () => {
    it('should return registered provider', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      registry.register(provider);
      const result = registry.get('test-provider');

      expect(result).toBe(provider);
    });

    it('should return undefined for unregistered provider', () => {
      const result = registry.get('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered providers', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'ai-sdk',
        capabilities: new Set(['moderate']),
        moderate: vi.fn(),
      };

      registry.register(provider1);
      registry.register(provider2);

      const result = registry.getAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(provider1);
      expect(result).toContain(provider2);
    });

    it('should return empty array when no providers registered', () => {
      const result = registry.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getByCapability', () => {
    it('should return providers with specific capability', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'ai-sdk',
        capabilities: new Set(['moderate', 'classify']),
        classify: vi.fn(),
        moderate: vi.fn(),
      };

      const provider3: AIProvider = {
        name: 'provider-3',
        type: 'direct',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      registry.register(provider1);
      registry.register(provider2);
      registry.register(provider3);

      const moderateProviders = registry.getByCapability('moderate');
      const completeProviders = registry.getByCapability('complete');
      const classifyProviders = registry.getByCapability('classify');

      expect(moderateProviders).toHaveLength(2);
      expect(moderateProviders).toContain(provider1);
      expect(moderateProviders).toContain(provider2);

      expect(completeProviders).toHaveLength(2);
      expect(completeProviders).toContain(provider1);
      expect(completeProviders).toContain(provider3);

      expect(classifyProviders).toHaveLength(1);
      expect(classifyProviders).toContain(provider2);
    });

    it('should return empty array for capability with no providers', () => {
      const result = registry.getByCapability('moderate');
      expect(result).toEqual([]);
    });
  });

  describe('hasCapability', () => {
    it('should return true when provider has capability', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      registry.register(provider);

      expect(registry.hasCapability('test-provider', 'complete')).toBe(true);
      expect(registry.hasCapability('test-provider', 'moderate')).toBe(true);
    });

    it('should return false when provider lacks capability', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      registry.register(provider);

      expect(registry.hasCapability('test-provider', 'moderate')).toBe(false);
      expect(registry.hasCapability('test-provider', 'classify')).toBe(false);
    });

    it('should return false for unregistered provider', () => {
      expect(registry.hasCapability('nonexistent', 'complete')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove provider and update capability map', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete', 'moderate']),
        complete: vi.fn(),
        moderate: vi.fn(),
      };

      registry.register(provider);
      expect(registry.get('test-provider')).toBe(provider);
      expect(registry.getByCapability('complete')).toContain(provider);
      expect(registry.getByCapability('moderate')).toContain(provider);

      const result = registry.remove('test-provider');

      expect(result).toBe(true);
      expect(registry.get('test-provider')).toBeUndefined();
      expect(registry.getByCapability('complete')).not.toContain(provider);
      expect(registry.getByCapability('moderate')).not.toContain(provider);
    });

    it('should return false for unregistered provider', () => {
      const result = registry.remove('nonexistent');
      expect(result).toBe(false);
    });

    it('should clean up empty capability sets', () => {
      const provider: AIProvider = {
        name: 'test-provider',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      registry.register(provider);
      expect(registry.getByCapability('complete')).toHaveLength(1);

      registry.remove('test-provider');
      expect(registry.getByCapability('complete')).toEqual([]);
    });

    it('should not affect other providers with same capabilities', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'ai-sdk',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      registry.register(provider1);
      registry.register(provider2);

      registry.remove('provider-1');

      expect(registry.get('provider-1')).toBeUndefined();
      expect(registry.get('provider-2')).toBe(provider2);
      expect(registry.getByCapability('complete')).toContain(provider2);
      expect(registry.getByCapability('complete')).not.toContain(provider1);
    });
  });

  describe('clear', () => {
    it('should remove all providers and capabilities', () => {
      const provider1: AIProvider = {
        name: 'provider-1',
        type: 'custom',
        capabilities: new Set(['complete']),
        complete: vi.fn(),
      };

      const provider2: AIProvider = {
        name: 'provider-2',
        type: 'ai-sdk',
        capabilities: new Set(['moderate']),
        moderate: vi.fn(),
      };

      registry.register(provider1);
      registry.register(provider2);

      expect(registry.getAll()).toHaveLength(2);
      expect(registry.getByCapability('complete')).toHaveLength(1);
      expect(registry.getByCapability('moderate')).toHaveLength(1);

      registry.clear();

      expect(registry.getAll()).toEqual([]);
      expect(registry.getByCapability('complete')).toEqual([]);
      expect(registry.getByCapability('moderate')).toEqual([]);
      expect(registry.get('provider-1')).toBeUndefined();
      expect(registry.get('provider-2')).toBeUndefined();
    });
  });
});
