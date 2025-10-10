import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';
import { baseConfig, getBaseTestConfig } from './base-config';
import { createBrowserDefines, getVitePlugins } from './vite-utils';

// Get the directory where this file is located
const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const setupDir = resolve(currentDir, '../setup');

// Browser provider configurations
const browserProviders = {
  playwright: {
    name: 'playwright' as const,
    enabled: true,
    headless: true,
    browsers: ['chromium', 'firefox', 'webkit'],
    slowMo: 0,
    video: false,
    screenshot: 'only-on-failure' as const,
  },
  webdriverio: {
    name: 'webdriverio' as const,
    enabled: true,
    headless: true,
    browsers: ['chrome', 'firefox', 'edge'],
    logLevel: 'error' as const,
  },
} as const;

// Browser-specific environment configurations
export const browserEnvironments = {
  chromium: {
    name: 'chromium',
    setupFile: resolve(setupDir, 'browser-chromium.mjs'),
    provider: 'playwright' as const,
    options: {
      headless: true,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'UTC',
    },
  },
  firefox: {
    name: 'firefox',
    setupFile: resolve(setupDir, 'browser-firefox.mjs'),
    provider: 'playwright' as const,
    options: {
      headless: true,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'UTC',
    },
  },
  webkit: {
    name: 'webkit',
    setupFile: resolve(setupDir, 'browser-webkit.mjs'),
    provider: 'playwright' as const,
    options: {
      headless: true,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'UTC',
    },
  },
  chrome: {
    name: 'chrome',
    setupFile: resolve(setupDir, 'browser-chrome.mjs'),
    provider: 'webdriverio' as const,
    options: {
      headless: true,
      windowSize: 'maximize',
      acceptInsecureCerts: true,
    },
  },
} as const;

// Browser testing utilities
const browserCommands = {
  // Custom commands for browser testing
  screenshot: (({ testPath, provider }, name?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = name ? `${name}-${timestamp}.png` : `screenshot-${timestamp}.png`;

    if (provider.name === 'playwright') {
      // This would be implemented by the provider
      return { path: `./test-results/screenshots/${filename}` };
    }

    throw new Error(`provider ${provider.name} does not support screenshot`);
  }) as BrowserCommand<[name?: string]>,

  waitForSelector: (({ testPath, provider }, selector: string, options: any = {}) => {
    const timeout = options.timeout || 5000;

    if (provider.name === 'playwright') {
      // This would be implemented by the provider
      return { selector, timeout };
    }

    throw new Error(`provider ${provider.name} does not support waitForSelector`);
  }) as BrowserCommand<[selector: string, options?: any]>,

  waitForText: (({ testPath, provider }, text: string, options: any = {}) => {
    const timeout = options.timeout || 5000;
    const selector = options.selector || 'body';

    if (provider.name === 'playwright') {
      // This would be implemented by the provider
      return { text, selector, timeout };
    }

    throw new Error(`provider ${provider.name} does not support waitForText`);
  }) as BrowserCommand<[text: string, options?: any]>,
} as const;

// Browser test configuration options
export interface BrowserTestOptions {
  /**
   * Browser provider to use ('playwright' or 'webdriverio')
   */
  provider?: 'playwright' | 'webdriverio';

  /**
   * Browser instances to run tests on
   */
  browsers?: string[];

  /**
   * Whether to run in headless mode
   */
  headless?: boolean;

  /**
   * Additional setup files to load
   */
  setupFiles?: string[];

  /**
   * Browser-specific options
   */
  browserOptions?: Record<string, any>;

  /**
   * Test timeout in milliseconds
   */
  testTimeout?: number;

  /**
   * Whether to capture screenshots on failure
   */
  screenshotFailures?: boolean;

  /**
   * Custom browser commands
   */
  commands?: Record<string, BrowserCommand<any>>;

  /**
   * Additional coverage exclusions
   */
  coverageExclude?: string[];

  /**
   * Additional aliases to add/override
   */
  aliases?: Record<string, string>;

  /**
   * Environment variables to define
   */
  env?: Record<string, string>;

  /**
   * Additional vitest config to merge
   */
  overrides?: UserConfig;
}

/**
 * Creates a browser testing configuration for Vitest
 */
export function createBrowserConfig(options: BrowserTestOptions = {}): UserConfig {
  const {
    provider = 'playwright',
    browsers = ['chromium'],
    headless = true,
    setupFiles = [],
    browserOptions = {},
    testTimeout = 10000,
    screenshotFailures = true,
    commands = {},
    coverageExclude = [],
    aliases = {},
    env = {},
    overrides = {},
  } = options;

  const providerConfig = browserProviders[provider];

  // Create browser instances configuration
  const instances = browsers.map(browser => {
    const browserEnv = browserEnvironments[browser as keyof typeof browserEnvironments];

    if (!browserEnv) {
      throw new Error(
        `Unsupported browser: ${browser}. Supported browsers: ${Object.keys(browserEnvironments).join(', ')}`,
      );
    }

    return {
      browser: browser as any,
      setupFile: browserEnv.setupFile,
      ...browserEnv.options,
      ...browserOptions[browser],
    };
  });

  const config: UserConfig = {
    plugins: getVitePlugins({ react: true }) as any,
    test: {
      ...getBaseTestConfig({
        environment: 'node', // Browser mode handles its own environment
        setupFiles: [resolve(setupDir, 'browser.mjs'), ...setupFiles],
        testTimeout,
        coverage: {
          exclude: [
            // Browser-specific exclusions
            '**/node_modules/**',
            '**/dist/**',
            '**/*.config.*',
            '**/test-results/**',
            '**/playwright-report/**',
            '**/coverage/**',
            ...coverageExclude,
          ],
          include: ['src/**/*.{ts,tsx}'],
        },
      }),

      // Browser mode configuration
      browser: {
        enabled: true,
        name: provider,
        provider,
        headless,
        screenshotFailures,
        instances,
        commands: {
          ...browserCommands,
          ...commands,
        },
        api: {
          port: 63315,
          host: 'localhost',
        },
        ui: !process.env.CI,
      },

      // Server configuration for browser mode
      server: {
        deps: {
          inline: ['@repo/qa', '@vitest/browser'],
        },
      },
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '#/root/*': resolve(process.cwd(), './*'),
        '#/*': resolve(process.cwd(), './src/*'),
        '@repo/*': resolve(process.cwd(), '../../packages/*'),
        '@labs/*': resolve(process.cwd(), '../../labs/*'),
        ...aliases,
      },
    },

    define: createBrowserDefines({
      'process.env.NODE_ENV': '"test"',
      'process.env.VITEST_BROWSER': 'true',
      'process.env.VITEST_BROWSER_PROVIDER': `"${provider}"`,
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    }),
  };

  return {
    ...baseConfig,
    ...config,
    ...overrides,
    test: {
      ...baseConfig.test,
      ...config.test,
      ...overrides.test,
    },
  };
}

/**
 * Creates a browser configuration specifically for component testing
 */
function createComponentBrowserConfig(options: BrowserTestOptions = {}): UserConfig {
  return createBrowserConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'browser-component.mjs'), ...(options.setupFiles || [])],
    testTimeout: options.testTimeout || 5000,
    screenshotFailures: options.screenshotFailures ?? true,
    browserOptions: {
      ...options.browserOptions,
      viewport: { width: 1024, height: 768 },
    },
  });
}

/**
 * Creates a browser configuration specifically for e2e testing
 */
function createE2EBrowserConfig(options: BrowserTestOptions = {}): UserConfig {
  return createBrowserConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'browser-e2e.mjs'), ...(options.setupFiles || [])],
    testTimeout: options.testTimeout || 30000,
    screenshotFailures: options.screenshotFailures ?? true,
    browserOptions: {
      ...options.browserOptions,
      viewport: { width: 1920, height: 1080 },
    },
  });
}

// Export all browser configurations
