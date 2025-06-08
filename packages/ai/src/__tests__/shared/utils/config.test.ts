import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  convertToManagerConfig,
  createConfigFromEnv,
  validateConfig,
} from '../../../shared/utils/config';

import type { AIConfig } from '../../../shared/types/config';

// Mock the keys module
vi.mock('../../../../keys', () => ({
  aiKeys: {
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    GOOGLE_AI_API_KEY: 'test-google-key',
    OPENAI_API_KEY: 'test-openai-key',
  },
}));

describe('Config Utilities', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('createConfigFromEnv', () => {
    it('should create config with all API keys from environment', () => {
      const config = createConfigFromEnv();

      expect(config.defaultProvider).toBe('openai');
      expect(config.providers).toHaveProperty('anthropic');
      expect(config.providers).toHaveProperty('google');
      expect(config.providers).toHaveProperty('openai');
      expect(config.providers?.anthropic?.apiKey).toBe('test-anthropic-key');
      expect(config.providers?.google?.apiKey).toBe('test-google-key');
      expect(config.providers?.openai?.apiKey).toBe('test-openai-key');
      expect(typeof config.enableLogging).toBe('boolean');
      expect(typeof config.enableRateLimit).toBe('boolean');
    });

    it('should enable logging in development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = createConfigFromEnv();
      expect(config.enableLogging).toBe(true);
    });

    it('should disable logging in production environment', () => {
      process.env.NODE_ENV = 'production';
      const config = createConfigFromEnv();
      expect(config.enableLogging).toBe(false);
    });

    it('should enable rate limiting in production environment', () => {
      process.env.NODE_ENV = 'production';
      const config = createConfigFromEnv();
      expect(config.enableRateLimit).toBe(true);
    });

    it('should disable rate limiting in development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = createConfigFromEnv();
      expect(config.enableRateLimit).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should pass validation for valid config', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'valid-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should fail validation when no providers configured', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {},
      };

      const errors = validateConfig(config);
      expect(errors).toContain('At least one provider must be configured');
    });

    it('should fail validation when providers is undefined', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: undefined as any,
      };

      const errors = validateConfig(config);
      expect(errors).toContain('At least one provider must be configured');
    });

    it('should pass validation with valid OpenAI provider', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'valid-openai-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should fail validation with OpenAI provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('OpenAI provider configured but missing API key');
    });

    it('should pass validation with valid Anthropic provider', () => {
      const config: AIConfig = {
        defaultProvider: 'anthropic',
        providers: {
          anthropic: {
            apiKey: 'valid-anthropic-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should fail validation with Anthropic provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'anthropic',
        providers: {
          anthropic: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('Anthropic provider configured but missing API key');
    });

    it('should pass validation with valid Google provider', () => {
      const config: AIConfig = {
        defaultProvider: 'google',
        providers: {
          google: {
            apiKey: 'valid-google-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should fail validation with Google provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'google',
        providers: {
          google: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('Google provider configured but missing API key');
    });

    it('should pass validation with multiple valid providers', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          anthropic: {
            apiKey: 'valid-anthropic-key',
          },
          google: {
            apiKey: 'valid-google-key',
          },
          openai: {
            apiKey: 'valid-openai-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should fail validation when no provider has valid API key', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          anthropic: {} as any,
          google: {} as any,
          openai: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain(
        'No provider has a valid API key. At least one provider must have an API key.',
      );
      expect(errors).toContain('OpenAI provider configured but missing API key');
      expect(errors).toContain('Anthropic provider configured but missing API key');
      expect(errors).toContain('Google provider configured but missing API key');
    });

    it('should pass validation when at least one provider has valid API key', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          anthropic: {} as any, // Missing API key
          openai: {
            apiKey: 'valid-openai-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('Anthropic provider configured but missing API key');
      expect(errors).not.toContain('No provider has a valid API key');
    });
  });

  describe('convertToManagerConfig', () => {
    it('should convert config with OpenAI provider', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'test-openai-key',
          },
        },
        enableLogging: true,
        enableRateLimit: false,
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig).toEqual({
        defaultProvider: 'openai',
        providers: [
          {
            name: 'openai-direct',
            type: 'direct',
            config: {
              apiKey: 'test-openai-key',
            },
          },
        ],
        enableLogging: true,
        enableRateLimit: false,
      });
    });

    it('should convert config with Anthropic provider', () => {
      const config: AIConfig = {
        defaultProvider: 'anthropic',
        providers: {
          anthropic: {
            apiKey: 'test-anthropic-key',
          },
        },
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.providers).toContainEqual({
        name: 'anthropic-direct',
        type: 'direct',
        config: {
          apiKey: 'test-anthropic-key',
        },
      });
    });

    it('should convert config with Google provider', () => {
      const config: AIConfig = {
        defaultProvider: 'google',
        providers: {
          google: {
            apiKey: 'test-google-key',
          },
        },
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.providers).toContainEqual({
        name: 'google-ai-sdk',
        type: 'ai-sdk',
        config: {
          apiKey: 'test-google-key',
        },
      });
    });

    it('should convert config with multiple providers', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          anthropic: {
            apiKey: 'test-anthropic-key',
          },
          google: {
            apiKey: 'test-google-key',
          },
          openai: {
            apiKey: 'test-openai-key',
          },
        },
        enableLogging: false,
        enableRateLimit: true,
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig).toEqual({
        defaultProvider: 'openai',
        providers: [
          {
            name: 'openai-direct',
            type: 'direct',
            config: {
              apiKey: 'test-openai-key',
            },
          },
          {
            name: 'anthropic-direct',
            type: 'direct',
            config: {
              apiKey: 'test-anthropic-key',
            },
          },
          {
            name: 'google-ai-sdk',
            type: 'ai-sdk',
            config: {
              apiKey: 'test-google-key',
            },
          },
        ],
        enableLogging: false,
        enableRateLimit: true,
      });
    });

    it('should skip providers without API keys', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          anthropic: {} as any, // No API key
          google: {
            apiKey: 'test-google-key',
          },
          openai: {
            apiKey: 'test-openai-key',
          },
        },
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.providers).toHaveLength(2);
      expect(managerConfig.providers).toContainEqual({
        name: 'openai-direct',
        type: 'direct',
        config: {
          apiKey: 'test-openai-key',
        },
      });
      expect(managerConfig.providers).toContainEqual({
        name: 'google-ai-sdk',
        type: 'ai-sdk',
        config: {
          apiKey: 'test-google-key',
        },
      });
    });

    it('should handle config with no providers', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {},
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.providers).toEqual([]);
    });

    it('should preserve optional fields', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'test-key',
          },
        },
        enableLogging: true,
        enableRateLimit: false,
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.enableLogging).toBe(true);
      expect(managerConfig.enableRateLimit).toBe(false);
    });

    it('should handle undefined optional fields', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'test-key',
          },
        },
        // enableLogging and enableRateLimit are undefined
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.enableLogging).toBeUndefined();
      expect(managerConfig.enableRateLimit).toBeUndefined();
    });
  });
});
