/**
 * Configuration utilities
 * Handles scraping configuration and validation
 */

import { ProviderConfig, ScrapingConfig } from '../types/scraping-types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent: 'Mozilla/5.0 (compatible; ScrapingBot/1.0)',
  viewport: {
    width: 1920,
    height: 1080,
  },
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
} as const;

/**
 * Provider-specific default configurations
 */
const PROVIDER_DEFAULTS = {
  playwright: {
    timeout: 30000,
    options: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  puppeteer: {
    timeout: 30000,
    options: {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  hero: {
    timeout: 60000,
    options: {
      showChrome: false,
    },
  },
  cheerio: {
    timeout: 10000,
    options: {},
  },
  'node-fetch': {
    timeout: 10000,
    options: {},
  },
  fetch: {
    timeout: 10000,
    options: {},
  },
  console: {
    timeout: 1000,
    options: {},
  },
} as const;

/**
 * Configuration builder class
 */
export class ConfigBuilder {
  private config: Partial<ScrapingConfig> = {};

  /**
   * Set provider configurations
   */
  providers(providers: Record<string, ProviderConfig>): this {
    this.config.providers = { ...this.config.providers, ...providers };
    return this;
  }

  /**
   * Add a single provider configuration
   */
  provider(name: string, config: ProviderConfig): this {
    this.config.providers = { ...this.config.providers, [name]: config };
    return this;
  }

  /**
   * Set default options
   */
  defaults(defaults: any): this {
    this.config.defaults = { ...this.config.defaults, ...defaults };
    return this;
  }

  /**
   * Enable debug mode
   */
  debug(enabled: boolean = true): this {
    this.config.debug = enabled;
    return this;
  }

  /**
   * Set error handler
   */
  onError(handler: (error: any, context: any) => void): this {
    this.config.onError = handler;
    return this;
  }

  /**
   * Set info handler
   */
  onInfo(handler: (message: string) => void): this {
    this.config.onInfo = handler;
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): ScrapingConfig {
    return {
      providers: {},
      debug: false,
      ...this.config,
    };
  }
}

/**
 * Create a configuration builder
 */
export function createConfigBuilder(): ConfigBuilder {
  return new ConfigBuilder();
}

/**
 * Merge provider configuration with defaults
 */
function _mergeProviderConfig(provider: string, config: Partial<ProviderConfig>): ProviderConfig {
  const defaults = PROVIDER_DEFAULTS[provider as keyof typeof PROVIDER_DEFAULTS] || {};
  return {
    ...defaults,
    ...config,
    options: {
      ...defaults.options,
      ...config.options,
    },
  };
}

/**
 * Merge scraping configuration with defaults
 */
export function mergeScrapingConfig(config: Partial<ScrapingConfig>): ScrapingConfig {
  return {
    providers: {},
    debug: false,
    defaults: DEFAULT_CONFIG,
    ...config,
  };
}

/**
 * Validate provider configuration
 */
function validateProviderConfig(
  provider: string,
  config: ProviderConfig,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (config.timeout && config.timeout < 0) {
    errors.push('Timeout must be a positive number');
  }

  if (config.retries && config.retries < 0) {
    errors.push('Retries must be a non-negative number');
  }

  // Provider-specific validation
  switch (provider) {
    case 'playwright':
    case 'puppeteer':
      if (config.options?.args && !Array.isArray(config.options.args)) {
        errors.push('Browser args must be an array');
      }
      break;
    case 'hero':
      if (config.apiKey && typeof config.apiKey !== 'string') {
        errors.push('Hero API key must be a string');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(): Partial<ScrapingConfig> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    return {
      debug: false,
      providers: {
        console: { timeout: 100, options: {} },
      },
    };
  }

  if (isProduction) {
    return {
      debug: false,
      providers: {
        playwright: {
          timeout: 30000,
          options: {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
          },
        },
      },
    };
  }

  // Development configuration
  return {
    debug: true,
    providers: {
      playwright: {
        timeout: 30000,
        options: {
          headless: false,
          devtools: true,
        },
      },
    },
  };
}

// Additional exports for backward compatibility
export function getScrapingConfig(_env?: string): ScrapingConfig {
  const baseConfig = getEnvironmentConfig();
  return mergeScrapingConfig(baseConfig);
}

export function validateConfig(config: ScrapingConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.providers || Object.keys(config.providers).length === 0) {
    errors.push('At least one provider must be configured');
  }

  // Validate each provider config
  for (const [name, providerConfig] of Object.entries(config.providers)) {
    const result = validateProviderConfig(name, providerConfig);
    if (!result.valid) {
      errors.push(...result.errors.map((e: any) => `${name}: ${e}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface ConfigRequirements {
  requiredProviders?: string[];
  optional?: string[];
}

export const PROVIDER_REQUIREMENTS: Record<string, ConfigRequirements> = {
  browser: {
    requiredProviders: ['playwright', 'puppeteer', 'hero'],
  },
  html: {
    requiredProviders: ['cheerio', 'node-fetch'],
  },
  ai: {
    requiredProviders: ['hero'],
  },
};
