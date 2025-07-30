import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { getBasePlaywrightConfig } from './base-config';

export interface PackageTestConfig {
  /** Directory where the package is located */
  packageDirectory: string;
  /** Test directory relative to package root */
  testDir?: string;
  /** Custom aliases for path resolution */
  aliases?: Record<string, string>;
  /** Additional browser projects to include */
  additionalProjects?: Array<{
    name: string;
    use: any;
  }>;
  /** Custom use options to override base config */
  use?: Record<string, any>;
}

/**
 * Creates a Playwright configuration for packages that need browser testing
 * but don't run a server (e.g., scraping packages, component libraries)
 */
export function createPackagePlaywrightConfig(
  packageConfig: PackageTestConfig,
): PlaywrightTestConfig {
  const { aliases = {}, additionalProjects = [], use = {} } = packageConfig;

  // Default aliases for TypeScript path mapping
  const defaultAliases = {
    '@': resolve(packageConfig.packageDirectory, './src'),
    '#/components': resolve(packageConfig.packageDirectory, './src/components'),
    '#/lib': resolve(packageConfig.packageDirectory, './src/lib'),
    '#/utils': resolve(packageConfig.packageDirectory, './src/utils'),
    '#/types': resolve(packageConfig.packageDirectory, './src/types'),
    ...aliases,
  };

  // Add mobile viewports for comprehensive testing
  const mobileProjects = [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ];

  return defineConfig(
    getBasePlaywrightConfig({
      testDir: packageConfig.testDir || './__tests__/e2e',
      projects: [
        // Base projects from base config
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
        // Mobile projects
        ...mobileProjects,
        // Additional custom projects
        ...additionalProjects,
      ],
      use: {
        // Override base use config with package-specific options
        ...use,
      },
    }),
  );
}

/**
 * Creates a tsconfig.json configuration for Playwright tests in packages
 */
export function createPackagePlaywrightTsConfig(
  packageDirectory: string,
  aliases?: Record<string, string>,
) {
  const defaultAliases = {
    '#/*': ['./src/*'],
    '#/components/*': ['./src/components/*'],
    '#/lib/*': ['./src/lib/*'],
    '#/utils/*': ['./src/utils/*'],
    '#/types/*': ['./src/types/*'],
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

export default createPackagePlaywrightConfig;
