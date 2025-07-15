import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { convertToManagerConfig, createConfigFromEnv, validateConfig } from '#/shared/utils/config';

import { AIConfig } from '#/shared/types/config';

// Tests use environment variables set in setup.ts

describe('config Utilities', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    vi.clearAllMocks();
    vi.resetModules();
    // Unstub NODE_ENV so tests can set it
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    // Restore original environment
    if (originalNodeEnv) {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true,
      });
    } else {
      delete (process.env as any).NODE_ENV;
    }
  });

  describe('createConfigFromEnv', () => {
    test('should create config with all API keys from environment', () => {
      const config = createConfigFromEnv();

      expect(config.defaultProvider).toBe('openai');
      expect(config.providers).toHaveProperty('anthropic');
      expect(config.providers).toHaveProperty('google');
      expect(config.providers).toHaveProperty('openai');
      expect(config.providers?.anthropic?.apiKey).toBe('sk-ant-test-ai-package-key');
      expect(config.providers?.google?.apiKey).toBe('test-google-ai-key');
      expect(config.providers?.openai?.apiKey).toBe('sk-test-ai-package-key');
      expect(typeof config.enableLogging).toBe('boolean');
      expect(typeof config.enableRateLimit).toBe('boolean');
    });

    test('should enable logging in development environment', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { createConfigFromEnv } = await import('#/shared/utils/config');
      const config = createConfigFromEnv();
      expect(config.enableLogging).toBeTruthy();
    });

    test('should disable logging in production environment', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const config = createConfigFromEnv();
      expect(config.enableLogging).toBeFalsy();
    });

    test('should enable rate limiting in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const { createConfigFromEnv } = await import('#/shared/utils/config');
      const config = createConfigFromEnv();
      expect(config.enableRateLimit).toBeTruthy();
    });

    test('should disable rate limiting in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const config = createConfigFromEnv();
      expect(config.enableRateLimit).toBeFalsy();
    });
  });

  describe('validateConfig', () => {
    test('should pass validation for valid config', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'valid-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toStrictEqual([]);
    });

    test('should fail validation when no providers configured', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {},
      };

      const errors = validateConfig(config);
      expect(errors).toContain('At least one provider must be configured');
    });

    test('should fail validation when providers is undefined', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: undefined as any,
      };

      const errors = validateConfig(config);
      expect(errors).toContain('At least one provider must be configured');
    });

    test('should pass validation with valid OpenAI provider', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {
            apiKey: 'valid-openai-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toStrictEqual([]);
    });

    test('should fail validation with OpenAI provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {
          openai: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('OpenAI provider configured but missing API key');
    });

    test('should pass validation with valid Anthropic provider', () => {
      const config: AIConfig = {
        defaultProvider: 'anthropic',
        providers: {
          anthropic: {
            apiKey: 'valid-anthropic-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toStrictEqual([]);
    });

    test('should fail validation with Anthropic provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'anthropic',
        providers: {
          anthropic: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('Anthropic provider configured but missing API key');
    });

    test('should pass validation with valid Google provider', () => {
      const config: AIConfig = {
        defaultProvider: 'google',
        providers: {
          google: {
            apiKey: 'valid-google-key',
          },
        },
      };

      const errors = validateConfig(config);
      expect(errors).toStrictEqual([]);
    });

    test('should fail validation with Google provider missing API key', () => {
      const config: AIConfig = {
        defaultProvider: 'google',
        providers: {
          google: {} as any,
        },
      };

      const errors = validateConfig(config);
      expect(errors).toContain('Google provider configured but missing API key');
    });

    test('should pass validation with multiple valid providers', () => {
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
      expect(errors).toStrictEqual([]);
    });

    test('should fail validation when no provider has valid API key', () => {
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

    test('should pass validation when at least one provider has valid API key', () => {
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
    test('should convert config with OpenAI provider', () => {
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

      expect(managerConfig).toStrictEqual({
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

    test('should convert config with Anthropic provider', () => {
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

    test('should convert config with Google provider', () => {
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

    test('should convert config with multiple providers', () => {
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

      expect(managerConfig).toStrictEqual({
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

    test('should skip providers without API keys', () => {
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

    test('should handle config with no providers', () => {
      const config: AIConfig = {
        defaultProvider: 'openai',
        providers: {},
      };

      const managerConfig = convertToManagerConfig(config);

      expect(managerConfig.providers).toStrictEqual([]);
    });

    test('should preserve optional fields', () => {
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

      expect(managerConfig.enableLogging).toBeTruthy();
      expect(managerConfig.enableRateLimit).toBeFalsy();
    });

    test('should handle undefined optional fields', () => {
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
