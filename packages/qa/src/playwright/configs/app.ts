import { defineConfig, devices, expect, type PlaywrightTestConfig } from '@playwright/test';
import { resolve } from 'node:path';

export interface AppTestConfig {
  /** Directory where the app is located */
  appDirectory: string;
  /** Base URL where the app runs */
  baseURL: string;
  /** Command to start the development server */
  devCommand?: string;
  /** Application name for reporting */
  name: string;
  /** Port number for the development server */
  port: number;
  /** Custom aliases for path resolution */
  aliases?: Record<string, string>;
}

/**
 * Creates a Playwright configuration for a Next.js app
 */
export function createAppPlaywrightConfig(appConfig: AppTestConfig): PlaywrightTestConfig {
  const { aliases = {} } = appConfig;

  // Default aliases for TypeScript path mapping
  const defaultAliases = {
    '@': resolve(appConfig.appDirectory, './src'),
    '@/app': resolve(appConfig.appDirectory, './src/app'),
    '@/components': resolve(appConfig.appDirectory, './src/components'),
    '@/lib': resolve(appConfig.appDirectory, './src/lib'),
    '@/hooks': resolve(appConfig.appDirectory, './src/hooks'),
    '@/utils': resolve(appConfig.appDirectory, './src/utils'),
    '@/styles': resolve(appConfig.appDirectory, './src/styles'),
    '@/types': resolve(appConfig.appDirectory, './src/types'),
    ...aliases,
  };

  return defineConfig({
    forbidOnly: !!process.env.CI,
    fullyParallel: true,
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      // Mobile viewports
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    ],
    reporter: process.env.CI ? 'html' : 'list',
    retries: process.env.CI ? 2 : 0,
    testDir: './__tests__/e2e',
    use: {
      baseURL: appConfig.baseURL,
      screenshot: 'only-on-failure',
      trace: 'on-first-retry',
    },
    webServer: appConfig.devCommand
      ? {
          command: appConfig.devCommand,
          cwd: appConfig.appDirectory,
          port: appConfig.port,
          reuseExistingServer: !process.env.CI,
        }
      : undefined,
    workers: process.env.CI ? 1 : undefined,
  });
}

/**
 * Base test helpers for app testing
 */
export class AppTestHelpers {
  constructor(private config: AppTestConfig) {}

  /**
   * Wait for the app to be ready
   */
  async waitForApp(page: any) {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  }

  /**
   * Check if the app is running and accessible
   */
  async checkAppHealth(page: any) {
    const response = await page.goto('/');
    if (response.status() !== 200) {
      throw new Error(`App health check failed: ${response.status()}`);
    }
    return true;
  }

  /**
   * Check for basic UI elements that should be present
   */
  async checkBasicUI(page: any) {
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Check if there are no major JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error: Error) => {
      errors.push(error.message);
    });

    // Check if basic HTML structure exists
    const body = page.locator('body');
    await body.waitFor();

    if (errors.length > 0) {
      throw new Error(`JavaScript errors found: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(page: any, name: string) {
    await page.screenshot({
      fullPage: true,
      path: `./test-results/${this.config.name}-${name}.png`,
    });
  }

  /**
   * Check if authentication is working (if auth routes exist)
   */
  async checkAuthRoutes(page: any) {
    const authRoutes = ['/sign-in', '/sign-up', '/api/auth'];
    const results: Record<string, number> = {};

    for (const route of authRoutes) {
      try {
        const response = await page.goto(route);
        results[route] = response.status();
      } catch {
        results[route] = 0; // Route doesn't exist
      }
    }

    return results;
  }

  /**
   * Check API health endpoints
   */
  async checkAPIHealth(page: any) {
    const healthRoutes = ['/api/health', '/health'];
    const results: Record<string, number> = {};

    for (const route of healthRoutes) {
      try {
        const response = await page.goto(route);
        results[route] = response.status();
      } catch {
        results[route] = 0; // Route doesn't exist
      }
    }

    return results;
  }
}

/**
 * Creates a tsconfig.json configuration for Playwright tests with path mapping
 */
export function createPlaywrightTsConfig(appDirectory: string, aliases?: Record<string, string>) {
  const defaultAliases = {
    '@/*': ['./src/*'],
    '@/app/*': ['./src/app/*'],
    '@/components/*': ['./src/components/*'],
    '@/lib/*': ['./src/lib/*'],
    '@/hooks/*': ['./src/hooks/*'],
    '@/utils/*': ['./src/utils/*'],
    '@/styles/*': ['./src/styles/*'],
    '@/types/*': ['./src/types/*'],
  };

  return {
    extends: '@repo/typescript-config/base.json',
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      baseUrl: '.',
      paths: {
        ...defaultAliases,
        ...aliases,
      },
    },
    include: ['__tests__/e2e/**/*.{spec,test}.ts', 'src/**/*'],
    exclude: ['node_modules'],
  };
}

export default createAppPlaywrightConfig;
